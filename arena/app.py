"""Replay server: `make app` serves app/ and a small JSON API over games/.

    GET /api/runs                       all runs (games/runs/*) + proofs, newest first
    GET /api/games?run=<name>           games of one run
    GET /api/game?run=<name>&file=<f>   moves, FENs, evals, per-move analysis and comments of one game
    GET /api/ladder                     beaten Stockfish levels (proofs) + W/D/L per level over every run

Serves frontend/dist (the Vite build, `make app-build`) when it exists, else the plain app/ page.
"""

import json
import os
import re
import sys
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import chess
import chess.pgn

sys.path.insert(0, str(Path(__file__).resolve().parent))
import util  # noqa: E402

DIST_DIR = util.ROOT / "frontend" / "dist"
APP_DIR = DIST_DIR if (DIST_DIR / "index.html").exists() else util.ROOT / "app"
PORT = int(os.environ.get("PORT", "8000"))
EVIDENCE_MANIFEST = util.ROOT / "evidence" / "manifest.json"

_cache = {}


def _cached(key, path, build):
    """Rebuild a derived value only when the file behind it changed (mtime)."""
    try:
        stamp = path.stat().st_mtime_ns
    except OSError:
        stamp = None
    hit = _cache.get(key)
    if hit and hit[0] == stamp:
        return hit[1]
    value = build()
    _cache[key] = (stamp, value)
    return value


def _analysis_index(run_name):
    """analysis/<run>/analysis.json as {pgn file: game record}, or {}."""
    path = util.ANALYSIS_DIR / run_name / "analysis.json"
    if not path.is_file():
        return {}

    def build():
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return {}
        return {g.get("pgn"): g for g in data if isinstance(g, dict)}
    return _cached(("analysis", run_name), path, build)


def _movetext_key(game):
    return " ".join(m.uci() for m in game.mainline_moves())


def _find_proof_analysis(game):
    """A proof is a copy of a run game; find that game's analysis by exact move sequence."""
    key = _movetext_key(game)
    level = game.headers.get("StockfishElo")
    for d in sorted(util.ANALYSIS_DIR.iterdir()) if util.ANALYSIS_DIR.exists() else []:
        if not d.is_dir():
            continue
        for pgn, rec in _analysis_index(d.name).items():
            if str(rec.get("level")) != str(level) or not pgn:
                continue
            if rec.get("plies") != len(list(game.mainline_moves())):
                continue
            if " ".join(m.get("uci", "") for m in rec.get("moves", [])) == key:
                return d.name, pgn, rec
    return None


def _run_dirs():
    dirs = []
    if util.RUNS_DIR.exists():
        dirs += [d for d in util.RUNS_DIR.iterdir() if d.is_dir()]
    dirs.sort(key=lambda d: d.stat().st_mtime, reverse=True)
    if util.PROOFS_DIR.exists() and any(util.PROOFS_DIR.glob("*.pgn")):
        dirs.insert(0, util.PROOFS_DIR)
    return dirs


def _resolve_run(name):
    if name == "proofs":
        return util.PROOFS_DIR
    if not name or "/" in name or "\\" in name or ".." in name:
        return None
    d = util.RUNS_DIR / name
    return d if d.is_dir() else None


def _game_summary(path, analysis=None):
    with open(path, encoding="utf-8") as f:
        game = chess.pgn.read_game(f)
    if game is None:
        return None
    h = game.headers
    out = {"file": path.name, "white": h.get("White", "?"), "black": h.get("Black", "?"),
           "result": h.get("Result", "*"), "level": h.get("StockfishElo") or h.get("WhiteElo") or h.get("BlackElo"),
           "engine": h.get("EngineColor", "?"), "opening": h.get("Opening", ""), "plies": h.get("PlyCount", "?"),
           "termination": h.get("Termination", ""), "date": h.get("Date", ""),
           "move_time": h.get("MoveTimeS"), "engine_commit": h.get("EngineCommit", "")}
    rec = (analysis or {}).get(path.name)
    if rec:
        out["stats"] = {k: rec.get(k) for k in ("acpl", "blunders", "mistakes", "inaccuracies")}
        w = rec.get("worst")
        if w:
            out["worst"] = {k: w.get(k) for k in ("ply", "san", "cp_loss", "best", "phase")}
    return out


def _api_runs():
    out = []
    for d in _run_dirs():
        name = "proofs" if d == util.PROOFS_DIR else d.name
        summary = None
        if (d / "summary.json").exists():
            summary = json.loads((d / "summary.json").read_text(encoding="utf-8"))
            summary.pop("results", None)
        analysis = util.ANALYSIS_DIR / d.name
        out.append({"name": name, "games": len(list(d.glob("*.pgn"))), "summary": summary,
                    "has_analysis": (analysis / "summary.md").exists()})
    return out


def _api_games(run):
    d = _resolve_run(run)
    if d is None:
        return None
    analysis = _analysis_index(d.name)
    games = [_game_summary(p, analysis) for p in sorted(d.glob("*.pgn"))]
    return [g for g in games if g]


def _san_to_uci(fen, san):
    try:
        return chess.Board(fen).parse_san(san).uci()
    except (ValueError, AssertionError):
        return None


def _api_game(run, file):
    d = _resolve_run(run)
    if d is None or not file or "/" in file or "\\" in file or ".." in file:
        return None
    path = d / file
    if not path.is_file():
        return None
    with open(path, encoding="utf-8") as f:
        game = chess.pgn.read_game(f)
    if game is None:
        return None
    # Per-move analysis (full-strength Stockfish): the run's own analysis.json, or for a proof
    # the analysis of the run game it was copied from.
    analysis_run, rec = d.name, _analysis_index(d.name).get(file)
    if rec is None and d == util.PROOFS_DIR:
        found = _find_proof_analysis(game)
        if found:
            analysis_run, _, rec = found
    amoves = {m.get("ply"): m for m in (rec or {}).get("moves", [])}
    # Annotated PGN copy (comment per move) when it exists.
    annotated = util.ANALYSIS_DIR / d.name / file
    anodes = []
    if annotated.is_file():
        with open(annotated, encoding="utf-8") as f:
            agame = chess.pgn.read_game(f)
        anodes = list(agame.mainline()) if agame else []
    board = game.board()
    moves = []
    for i, node in enumerate(game.mainline()):
        mv = node.move
        san = board.san(mv)
        fen_before = board.fen()
        captured = board.is_capture(mv)
        board.push(mv)
        ev = node.eval()
        entry = {"ply": i + 1, "san": san, "uci": mv.uci(), "fen": board.fen(), "comment": node.comment,
                 "capture": captured, "check": board.is_check(), "eval": None, "analysis": None}
        if ev is not None:
            w = ev.white()
            entry["eval"] = {"cp": w.score(), "mate": w.mate()}
        # depth / time / nodes the players reported, e.g. "E d20 4.90s 11779k"
        m = re.search(r"\b([ES]) d(\d+) ([\d.]+)s (\d+)k", node.comment or "")
        if m:
            entry["search"] = {"by": "engine" if m.group(1) == "E" else "stockfish", "depth": int(m.group(2)),
                               "seconds": float(m.group(3)), "nodes": int(m.group(4)) * 1000}
        a = amoves.get(i + 1)
        if a:
            best_san = a.get("best")
            entry["analysis"] = {
                "by": a.get("by"), "phase": a.get("phase"),
                "cp_before": a.get("eval_before_white"), "cp": a.get("eval_after_white"),
                "cp_loss": a.get("cp_loss"), "best": best_san,
                "best_uci": _san_to_uci(fen_before, best_san) if best_san else None,
                "depth": a.get("depth"), "seconds": a.get("seconds"), "nodes": a.get("nodes"),
                "engine_score_cp": a.get("engine_score_cp"),
                "comment": anodes[i].comment if i < len(anodes) else None,
            }
        elif i < len(anodes):
            ae = anodes[i].eval()
            entry["analysis"] = {"cp": ae.white().score(mate_score=1000) if ae else None,
                                 "comment": anodes[i].comment}
        moves.append(entry)
    reports = {}
    adir = util.ANALYSIS_DIR / analysis_run
    for name in ("summary", "grandmaster", "engine-dev"):
        p = adir / f"{name}.md"
        if p.is_file():
            reports[name] = p.read_text(encoding="utf-8")
    out = {"headers": dict(game.headers), "start_fen": game.board().fen(), "moves": moves,
           "analysis_summary": reports.get("summary"), "reports": reports, "analysis_run": analysis_run if rec else None}
    if rec:
        out["stats"] = {k: rec.get(k) for k in ("acpl", "blunders", "mistakes", "inaccuracies", "worst",
                                                 "max_engine_eval", "min_engine_eval")}
    return out


def _api_ladder():
    """The Elo ladder: every level we have played, with W/D/L at 5 s and at fast time, and the proof."""
    proofs = {}
    if util.PROOFS_DIR.exists():
        for p in sorted(util.PROOFS_DIR.glob("beat-*.pgn")):
            with open(p, encoding="utf-8") as f:
                g = chess.pgn.read_game(f)
            if g is None:
                continue
            h = g.headers
            try:
                level = int(h.get("StockfishElo") or p.stem.split("-")[1])
            except ValueError:
                continue
            proofs[level] = {"file": p.name, "engine": h.get("EngineColor", "?"), "plies": h.get("PlyCount"),
                             "termination": h.get("Termination", ""), "date": h.get("Date", ""),
                             "engine_commit": h.get("EngineCommit", ""), "opening": h.get("Opening", ""),
                             "result": h.get("Result", "*")}
    verified = {}
    if EVIDENCE_MANIFEST.is_file():
        try:
            for e in json.loads(EVIDENCE_MANIFEST.read_text(encoding="utf-8")):
                if e.get("kind") == "ladder":
                    for pr in e.get("proofs", []):
                        verified[pr.get("level")] = bool(e.get("verified"))
        except ValueError:
            pass

    def build_tally():
        tally = {}
        for d in _run_dirs():
            if d == util.PROOFS_DIR:
                continue
            for p in d.glob("*.pgn"):
                try:
                    headers = chess.pgn.read_headers(open(p, encoding="utf-8"))
                except (OSError, ValueError):
                    continue
                if not headers:
                    continue
                try:
                    level = int(headers.get("StockfishElo", ""))
                except ValueError:
                    continue
                full = headers.get("MoveTimeS") == "5" or headers.get("TimeControl") == "5s/move"
                res, colour = headers.get("Result"), headers.get("EngineColor")
                if res == "1/2-1/2":
                    k = "d"
                elif (res == "1-0") == (colour == "white") and res in ("1-0", "0-1"):
                    k = "w"
                elif res in ("1-0", "0-1"):
                    k = "l"
                else:
                    continue
                row = tally.setdefault(level, {"full": {"w": 0, "d": 0, "l": 0}, "fast": {"w": 0, "d": 0, "l": 0}})
                row["full" if full else "fast"][k] += 1
                if k == "w" and full:
                    row.setdefault("wins", []).append({"run": d.name, "file": p.name})
        return tally
    # keyed on the newest run dir so a new run invalidates it
    newest = max((d for d in _run_dirs() if d != util.PROOFS_DIR), key=lambda d: d.stat().st_mtime, default=util.RUNS_DIR)
    tally = _cached("ladder", newest, build_tally)
    levels = sorted(set(tally) | set(proofs))
    rungs = []
    for level in levels:
        row = tally.get(level, {"full": {"w": 0, "d": 0, "l": 0}, "fast": {"w": 0, "d": 0, "l": 0}})
        rungs.append({"level": level, "full": row["full"], "fast": row["fast"], "proof": proofs.get(level),
                      "verified": verified.get(level), "wins": row.get("wins", [])[:6],
                      "status": "beaten" if level in proofs else ("contested" if row["full"]["w"] + row["full"]["d"] + row["full"]["l"] + row["fast"]["w"] + row["fast"]["d"] + row["fast"]["l"] else "locked")})
    highest = max(proofs) if proofs else None
    return {"rungs": rungs, "highest_beaten": highest, "target": util.TARGET_ELO, "step": util.LADDER_STEP,
            "move_time": util.MOVE_TIME_S, "opponent": util.OPPONENT}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(APP_DIR), **kw)

    def log_message(self, fmt, *args):
        pass

    def _json(self, obj, status=200):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        url = urlparse(self.path)
        q = {k: v[0] for k, v in parse_qs(url.query).items()}
        try:
            if url.path == "/api/runs":
                return self._json(_api_runs())
            if url.path == "/api/games":
                data = _api_games(q.get("run"))
                return self._json(data if data is not None else {"error": "no such run"}, 200 if data is not None else 404)
            if url.path == "/api/game":
                data = _api_game(q.get("run"), q.get("file"))
                return self._json(data if data is not None else {"error": "no such game"}, 200 if data is not None else 404)
            if url.path == "/api/ladder":
                return self._json(_api_ladder())
        except Exception as exc:  # keep the server up; show the error in the UI
            return self._json({"error": str(exc)}, 500)
        if not url.path.startswith("/api/") and "." not in url.path.rsplit("/", 1)[-1] and url.path != "/":
            self.path = "/"
        return super().do_GET()


def main():
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    url = f"http://127.0.0.1:{PORT}/"
    print(f"replay app: {url}  (Ctrl-C to stop)")
    threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
