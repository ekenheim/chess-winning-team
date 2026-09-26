"""Evidence for every claimed Elo, collected on main from the git log.

A claim is a `[keep]`, `[FULL]`, `[sync]` or `[ladder]` result commit on any
`autoresearch/*` branch (its own first-parent line, as in progress.py), or a
`[ladder]` commit on main. For each claim this copies
the games it rests on into `evidence/<branch>/`, re-verifies them and writes
`evidence/README.md` (the table) and `evidence/manifest.json`:

- `[keep]` / `[FULL]` / `[sync]`: every game of every run the commit added
  (all of them: the Elo is computed from the whole run, so a subset would be
  cherry-picked, and a SEED=1 re-run is pooled with the first run) plus each
  run's `summary.txt`. Each game must replay legally to its recorded
  result, and the Elo recomputed from the PGNs must match the commit line.
- `[ladder]`: the proof PGNs the commit added. Each must be a win for our
  engine, at 5 s/move, against the Stockfish level it claims.

Discarded and crashed runs are not claims and stay only in branch history.

    git fetch origin && python tools/evidence.py
"""

import io
import json
import re
import shutil
import sys
from pathlib import Path

import chess
import chess.pgn

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "arena"))
from progress import branches, champion, experiments, git, main_line  # noqa: E402
from util import MOVE_TIME_S, REQUIRED_PGN_HEADERS, TIME_TOLERANCE_S, estimate_elo  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "evidence"
TIME_RE = re.compile(r"\bE d\S+ ([\d.]+)s")
PROOF_RE = re.compile(r"beat-(\d+)\.pgn$")


def claims(rows):
    """The rows of a result log that claim something, oldest first."""
    out = []
    for r in rows:
        if r["status"] in ("keep", "FULL", "sync") and r["elo"] is not None:
            m = re.search(r"W/D/L=(\d+)/(\d+)/(\d+)", r["subject"])
            out.append({"sha": r["full"], "kind": r["status"], "subject": r["subject"],
                        "host": r["host"], "elo": r["elo"], "err": r["err"],
                        "wdl": [int(x) for x in m.groups()]})
        elif r["status"] == "ladder":
            out.append({"sha": r["full"], "kind": "ladder", "subject": r["subject"],
                        "host": r["host"]})
    return out


def added(sha, prefix):
    """Files under `prefix` that commit `sha` added."""
    # Diff against the first parent, so merge commits (which diff-tree
    # silently skips) count the games they bring in; --root for the first commit.
    parents = git("rev-list", "--parents", "-n", "1", sha).split()[1:]
    if not parents:
        return git("diff-tree", "--no-commit-id", "-r", "--name-only", "--diff-filter=A",
                   "--root", sha, "--", prefix).split()
    # A merge commit only "adds" what is new against every parent: the run it
    # played, not the other branch's games it merged in.
    files = None
    for parent in parents:
        got = set(git("diff", "--name-only", "--diff-filter=A", parent, sha, "--", prefix).split())
        files = got if files is None else files & got
    return sorted(files or [])


def check_game(text):
    """Replay a PGN. Returns (facts, problems)."""
    game = chess.pgn.read_game(io.StringIO(text))
    if game is None:
        return None, ["unreadable PGN"]
    h = game.headers
    problems = [f"missing header {k}" for k in REQUIRED_PGN_HEADERS if not h.get(k)]
    board = game.board()
    plies = 0
    for move in game.mainline_moves():
        if move not in board.legal_moves:
            problems.append(f"illegal move {move.uci()} at ply {plies + 1}")
            break
        board.push(move)
        plies += 1
    result = h.get("Result")
    if h.get("PlyCount") and int(h["PlyCount"]) != plies:
        problems.append(f"{plies} plies but PlyCount {h['PlyCount']}")
    if board.is_game_over(claim_draw=True) and board.result(claim_draw=True) != result:
        problems.append(f"Result {result} but the final position is {board.result(claim_draw=True)}")
    white = h.get("EngineColor") == "white"
    score = {"1-0": 1.0 if white else 0.0, "0-1": 0.0 if white else 1.0}.get(result, 0.5)
    move_time = float(h.get("MoveTimeS", "0") or 0)
    slowest = max((float(t) for t in TIME_RE.findall(str(game))), default=0.0)
    if move_time and slowest > move_time + TIME_TOLERANCE_S:
        problems.append(f"engine move took {slowest:.2f}s (budget {move_time:g}s)")
    return {"level": int(h.get("StockfishElo", 0)), "score": score, "result": result,
            "move_time": move_time, "plies": plies, "slowest": slowest,
            "termination": h.get("Termination", "")}, problems


def collect_run(sha, run_dir, dest):
    """Copy one run's games and summary out of commit `sha` and verify them."""
    dest.mkdir(parents=True, exist_ok=True)
    games, problems = [], []
    for path in sorted(git("ls-tree", "-r", "--name-only", sha, run_dir).split()):
        name = Path(path).name
        if not (name.endswith(".pgn") or name == "summary.txt"):
            continue
        text = git("show", f"{sha}:{path}")
        (dest / name).write_text(text, encoding="utf-8", newline="\n")
        if name.endswith(".pgn"):
            facts, bad = check_game(text)
            games.append(facts)
            problems += [f"{name}: {p}" for p in bad]
    return [g for g in games if g], problems


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    manifest = []
    exclude = main_line()
    main_claims = claims(champion())
    # A branch [ladder] whose levels were all laddered again on main is not a
    # second claim.
    relaid = {lvl for c in main_claims for lvl in re.findall(r"beat-(\d+)", c["subject"])}
    logs = [(name, [c for c in claims(experiments(ref, exclude))
                    if not (c["kind"] == "ladder"
                            and set(re.findall(r"beat-(\d+)", c["subject"])) <= relaid)])
            for name, ref in sorted(branches().items())]
    logs.append(("main", main_claims))
    for name, cs in logs:
        for c in cs:
            sha = c["sha"]
            row = {"branch": name, "commit": sha[:7], "kind": c["kind"],
                   "subject": c["subject"], "host": c["host"] or "?"}
            if c["kind"] == "ladder":
                proofs = [p for p in added(sha, "games/proofs/") if p.endswith(".pgn")]
                row["files"], row["problems"] = [], []
                for p in proofs:
                    text = git("show", f"{sha}:{p}")
                    dest = OUT / name / "proofs" / Path(p).name
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    dest.write_text(text, encoding="utf-8", newline="\n")
                    row["files"].append(dest.relative_to(OUT).as_posix())
                    facts, bad = check_game(text)
                    m = PROOF_RE.search(p)
                    if facts:
                        if facts["score"] != 1.0:
                            bad.append("not a win for our engine")
                        if facts["move_time"] != MOVE_TIME_S:
                            bad.append(f"played at {facts['move_time']:g}s/move, not {MOVE_TIME_S:g}s")
                        if m and facts["level"] < int(m[1]):
                            bad.append(f"Stockfish was {facts['level']}, not {m[1]}")
                        row.setdefault("proofs", []).append(
                            {"file": Path(p).name, "level": facts["level"], "plies": facts["plies"],
                             "termination": facts["termination"]})
                    row["problems"] += [f"{Path(p).name}: {b}" for b in bad]
                if not proofs:
                    row["problems"].append("ladder commit adds no proof PGN")
            else:
                runs = sorted({p.split("/")[2] for p in added(sha, "games/runs/")})
                per_run, problems, row["files"] = [], [], []
                for run in runs:
                    g, bad = collect_run(sha, f"games/runs/{run}", OUT / name / run)
                    per_run.append(g)
                    problems += [f"{run}/{b}" for b in bad]
                    row["files"].append(f"{name}/{run}/")
                # A SEED=1 re-run is pooled with the first run (program.md); older
                # claims may be the first run's alone, so either must match.
                games = [g for run in per_run for g in run]
                for cand in ([games, per_run[0]] if len(per_run) > 1 else [games]):
                    elo, err = estimate_elo([(g["level"], g["score"]) for g in cand])
                    wdl = [sum(g["score"] == s for g in cand) for s in (1.0, 0.5, 0.0)]
                    if abs(elo - c["elo"]) <= 1.0 and wdl == c["wdl"]:
                        games = cand
                        break
                if not runs:
                    problems.append("commit adds no games")
                elif abs(elo - c["elo"]) > 1.0 or wdl != c["wdl"]:
                    problems.append(f"games give elo={elo:.0f} W/D/L={'/'.join(map(str, wdl))}, "
                                    f"commit claims elo={c['elo']:.0f} W/D/L={'/'.join(map(str, c['wdl']))}")
                row.update({"claimed_elo": c["elo"], "claimed_err": c["err"], "recomputed_elo": elo,
                            "recomputed_err": err, "wdl": wdl, "games": len(games),
                            "move_time": games[0]["move_time"] if games else None,
                            "slowest_move": max((g["slowest"] for g in games), default=None),
                            "problems": problems})
            row["verified"] = not row["problems"]
            manifest.append(row)

    OUT.mkdir(exist_ok=True)
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    write_readme(manifest)
    bad = [r for r in manifest if not r["verified"]]
    print(f"{len(manifest)} claims, {len(manifest) - len(bad)} verified -> {OUT.relative_to(ROOT)}/")
    for r in bad:
        print(f"  UNVERIFIED {r['branch']} {r['commit']}: {'; '.join(r['problems'])}")
    return 1 if bad else 0


def write_readme(manifest):
    lines = [
        "# Evidence",
        "",
        "The games behind every claimed Elo, rebuilt from the git log by "
        "`git fetch origin && python tools/evidence.py`. Don't edit by hand.",
        "",
        "Every `[keep]`, `[FULL]` and `[sync]` claim keeps **all** the games of its runs, because "
        "the Elo is computed from the whole run (a SEED=1 re-run is pooled with the first). Each game is replayed move by move to its recorded result, "
        "the engine's slowest move is checked against the time budget, and the Elo is recomputed "
        "from the PGNs with the arena's own `estimate_elo`. A `[ladder]` claim keeps its proof "
        "games, and each must be a win at 5 s/move against the Stockfish level it names. "
        "Discarded and crashed runs are not claims; their games stay in branch history.",
        "",
        "## Beaten Stockfish levels (5 s/move)",
        "",
        "| Level | Proof | Branch | Commit | Plies | Ending | Verified |",
        "|---|---|---|---|---|---|---|",
    ]
    proofs = [(p, r) for r in manifest if r["kind"] == "ladder" for p in r.get("proofs", [])]
    for p, r in sorted(proofs, key=lambda x: -x[0]["level"]):
        lines.append(f"| {p['level']} | [{p['file']}]({r['branch']}/proofs/{p['file']}) | {r['branch']} "
                     f"| `{r['commit']}` | {p['plies']} | {p['termination']} | {'yes' if r['verified'] else '**no**'} |")
    if not proofs:
        lines.append("| — | none yet | | | | | |")
    lines += [
        "",
        "## Elo claims",
        "",
        "| Branch | Commit | Kind | Host | s/move | Claimed Elo | From the games | W/D/L | Games | Slowest move | Verified |",
        "|---|---|---|---|---|---|---|---|---|---|---|",
    ]
    for r in manifest:
        if r["kind"] == "ladder":
            continue
        link = ", ".join(f"[{f.split('/')[1]}]({f})" for f in r["files"])
        lines.append(
            f"| {r['branch']} | `{r['commit']}` | {r['kind']} | {r['host']} | {r['move_time'] or 0:g} "
            f"| {r['claimed_elo']:.0f} ± {r['claimed_err']:.0f} | {r['recomputed_elo']:.0f} ({link}) "
            f"| {'/'.join(map(str, r['wdl']))} | {r['games']} | {r['slowest_move'] or 0:.2f} s "
            f"| {'yes' if r['verified'] else '**no**'} |")
    problems = [r for r in manifest if r["problems"]]
    if problems:
        lines += ["", "## Problems", ""]
        for r in problems:
            lines += [f"- {r['branch']} `{r['commit']}`: {p}" for p in r["problems"]]
    (OUT / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    sys.exit(main())
