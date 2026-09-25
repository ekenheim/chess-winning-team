"""Replay server: `make app` serves app/ and a small JSON API over games/.

    GET /api/runs                       all runs (games/runs/*) + proofs, newest first
    GET /api/games?run=<name>           games of one run
    GET /api/game?run=<name>&file=<f>   moves, FENs, evals and comments of one game
"""

import json
import os
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

APP_DIR = util.ROOT / "app"
PORT = int(os.environ.get("PORT", "8000"))


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


def _game_summary(path):
    with open(path, encoding="utf-8") as f:
        game = chess.pgn.read_game(f)
    if game is None:
        return None
    h = game.headers
    return {"file": path.name, "white": h.get("White", "?"), "black": h.get("Black", "?"),
            "result": h.get("Result", "*"), "level": h.get("StockfishElo") or h.get("WhiteElo") or h.get("BlackElo"),
            "engine": h.get("EngineColor", "?"), "opening": h.get("Opening", ""), "plies": h.get("PlyCount", "?"),
            "termination": h.get("Termination", ""), "date": h.get("Date", "")}


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
    games = [_game_summary(p) for p in sorted(d.glob("*.pgn"))]
    return [g for g in games if g]


def _api_game(run, file):
    d = _resolve_run(run)
    if d is None or not file or "/" in file or "\\" in file or ".." in file:
        return None
    path = d / file
    if not path.is_file():
        return None
    with open(path, encoding="utf-8") as f:
        game = chess.pgn.read_game(f)
    # Prefer the annotated copy (full-strength evals + best moves) when it exists.
    annotated = util.ANALYSIS_DIR / d.name / file
    agame = None
    if annotated.is_file():
        with open(annotated, encoding="utf-8") as f:
            agame = chess.pgn.read_game(f)
    board = game.board()
    moves = []
    anodes = list(agame.mainline()) if agame else []
    for i, node in enumerate(game.mainline()):
        mv = node.move
        san = board.san(mv)
        board.push(mv)
        ev = node.eval()
        entry = {"ply": i + 1, "san": san, "uci": mv.uci(), "fen": board.fen(), "comment": node.comment,
                 "eval": None, "analysis": None}
        if ev is not None:
            w = ev.white()
            entry["eval"] = {"cp": w.score(), "mate": w.mate()}
        if i < len(anodes):
            a = anodes[i].eval()
            entry["analysis"] = {"cp": a.white().score(mate_score=1000) if a else None, "comment": anodes[i].comment}

        moves.append(entry)
    return {"headers": dict(game.headers), "start_fen": game.board().fen(), "moves": moves,
            "analysis_summary": (util.ANALYSIS_DIR / d.name / "summary.md").read_text(encoding="utf-8")
            if (util.ANALYSIS_DIR / d.name / "summary.md").exists() else None}


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
        except Exception as exc:  # keep the server up; show the error in the UI
            return self._json({"error": str(exc)}, 500)
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
