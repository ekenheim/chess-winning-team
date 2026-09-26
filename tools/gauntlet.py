"""Self-play gauntlet: the candidate engine against the last kept one.

The Stockfish bench plays 30 games, which cannot resolve much under ~150 Elo.
This plays a few hundred very fast games of the engine you just built against
the engine of your branch's last `[keep]`/`[sync]` result, so a candidate that
does not beat its predecessor is discarded before Stockfish time is spent on it
(program.md loop step 4). It is a pre-filter only: every kept result still
comes from `make bench`.

    make engine && python tools/gauntlet.py > gauntlet.log 2>&1
    python tools/gauntlet.py --base <sha> --games 400 --movetime 0.03

The base engine is exported from git and built once per commit into
`<git-common-dir>/gauntlet/<sha>/` (outside every worktree, never committed).
The candidate binary is copied first, so rebuilding `engine/` during a
gauntlet cannot mix two engines into one run. Games are saved as one PGN in
`games/gauntlet/<candidate-commit>/` and committed with the result.
Uses python-chess, like the arena.
"""

import argparse
import io
import math
import os
import re
import shutil
import subprocess
import sys
import tarfile
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import chess
import chess.engine
import chess.pgn

ROOT = Path(__file__).resolve().parents[1]
EXE = "engine.exe" if os.name == "nt" else "engine"
BASE_RE = re.compile(r"^\[(keep|sync)\]\s")
MAX_PLIES = 300


def git(*args, **kw):
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, check=True, **kw).stdout


def default_base():
    """The engine your keep rule compares against: the last [keep]/[sync] on this
    branch's first-parent line (else main's engine)."""
    out = git("log", "--first-parent", "--format=%H%x1f%s", "HEAD", encoding="utf-8")
    for line in out.splitlines():
        sha, subject = line.split("\x1f", 1)
        if BASE_RE.match(subject):
            return sha
    return git("rev-parse", "origin/main", encoding="utf-8").strip()


def build_base(sha):
    cache = Path(git("rev-parse", "--path-format=absolute", "--git-common-dir",
                     encoding="utf-8").strip()) / "gauntlet" / sha[:12]
    exe = cache / "engine" / "target" / "release" / EXE
    if exe.is_file():
        return exe
    if cache.exists():
        shutil.rmtree(cache)
    cache.mkdir(parents=True)
    with tarfile.open(fileobj=io.BytesIO(git("archive", "--format=tar", sha, "engine"))) as tar:
        tar.extractall(cache)
    print(f"building base engine {sha[:7]} ...", flush=True)
    r = subprocess.run(["cargo", "build", "--release", "--offline", "--quiet"],
                       cwd=cache / "engine", capture_output=True, text=True)
    if r.returncode or not exe.is_file():
        shutil.rmtree(cache, ignore_errors=True)
        sys.exit(f"could not build the base engine {sha[:7]}:\n{r.stderr}")
    return exe


def openings():
    """The arena's opening set, parsed by the arena's own loader."""
    sys.path.insert(0, str(ROOT / "arena"))
    from util import load_openings
    return [fen for _, fen in load_openings()]


def elo(score):
    score = min(max(score, 1e-6), 1 - 1e-6)
    return -400 * math.log10(1 / score - 1)


def stats(w, d, l):
    n = w + d + l
    s = (w + d / 2) / n
    var = (w * (1 - s) ** 2 + d * (0.5 - s) ** 2 + l * s ** 2) / n
    half = 1.96 * math.sqrt(var / n)
    return s, elo(s), elo(s - half), elo(s + half)


def sprt_llr(scores, elo0, elo1):
    """Log-likelihood ratio of elo1 vs elo0 for per-game scores (normal
    approximation of the generalised SPRT)."""
    n = len(scores)
    mean = sum(scores) / n
    var = sum((x - mean) ** 2 for x in scores) / n or 1e-9
    s0, s1 = (1 / (1 + 10 ** (-e / 400)) for e in (elo0, elo1))
    return n * (s1 - s0) * (2 * mean - s0 - s1) / (2 * var)


class Players(threading.local):
    """One pair of engine processes per worker thread, reused across games."""

    def open(self, cand, base):
        if not hasattr(self, "engines"):
            self.engines = {
                # each runs from its own engine/ dir, as in the arena (engine/data/ lookups)
                "candidate": chess.engine.SimpleEngine.popen_uci(str(cand), cwd=str(ROOT / "engine")),
                "base": chess.engine.SimpleEngine.popen_uci(
                    str(base), cwd=str(base.parents[2] if base.parent.name == "release" else base.parent))}
            ALL.append(self.engines)
        return self.engines


ALL = []


def play(players, cand, base, movetime, fen, cand_white, round_no):
    eng = players.open(cand, base)
    board = chess.Board(fen)
    game = chess.pgn.Game()
    game.setup(board)
    white, black = ("candidate", "base") if cand_white else ("base", "candidate")
    game.headers.update({"Event": "gauntlet", "Round": str(round_no), "White": white,
                         "Black": black, "TimeControl": f"{movetime:g}s/move"})
    token, node = object(), game
    while not board.is_game_over(claim_draw=True) and board.ply() < MAX_PLIES:
        side = white if board.turn == chess.WHITE else black
        move = eng[side].play(board, chess.engine.Limit(time=movetime), game=token).move
        if move is None or move not in board.legal_moves:
            result = "0-1" if board.turn == chess.WHITE else "1-0"
            game.headers["Termination"] = f"{side} returned an illegal move"
            break
        board.push(move)
        node = node.add_variation(move)
    else:
        result = board.result(claim_draw=True) if board.is_game_over(claim_draw=True) else "1/2-1/2"
    game.headers["Result"] = result
    score = {"1-0": 1.0, "0-1": 0.0}.get(result, 0.5)
    return (score if cand_white else 1 - score), str(game)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--base", help="commit whose engine to play against (default: last keep/sync)")
    ap.add_argument("--games", type=int, default=200)
    ap.add_argument("--movetime", type=float, default=0.05, help="seconds per move, both sides")
    ap.add_argument("--workers", type=int, default=max(1, (os.cpu_count() or 4) // 2))
    ap.add_argument("--base-exe", help="play against this binary instead of a commit's engine")
    ap.add_argument("--cand-exe", help="candidate binary (default: this checkout's engine)")
    ap.add_argument("--sprt", metavar="ELO0,ELO1",
                    help="stop early once a sequential test decides elo<=ELO0 vs elo>=ELO1 "
                         "(alpha=beta=0.05), e.g. --sprt 0,20")
    ap.add_argument("--out", help="games dir name under games/gauntlet/ (default: HEAD's sha)")
    a = ap.parse_args()

    built = Path(a.cand_exe) if a.cand_exe else ROOT / "engine" / "target" / "release" / EXE
    if not built.is_file():
        sys.exit("no candidate engine: run `make engine` first")
    commit = a.out or git("rev-parse", "--short=7", "HEAD", encoding="utf-8").strip()
    if a.base_exe:
        base, base_sha = Path(a.base_exe).resolve(), Path(a.base_exe).resolve().as_posix()
    else:
        base_sha = git("rev-parse", a.base or default_base(), encoding="utf-8").strip()
        base = build_base(base_sha)
    cache = Path(git("rev-parse", "--path-format=absolute", "--git-common-dir",
                     encoding="utf-8").strip()) / "gauntlet"
    fens = openings()
    snap = cache / f"candidate-{commit}-{os.getpid()}"
    snap.mkdir(parents=True, exist_ok=True)
    cand = snap / EXE
    shutil.copy2(built, cand)

    specs = [(fens[(i // 2) % len(fens)], i % 2 == 0, i + 1) for i in range(a.games)]
    print(f"gauntlet: candidate {commit} vs base {base_sha[:7]}, {a.games} games at "
          f"{a.movetime:g}s/move, {a.workers} workers", flush=True)
    players, results, t0 = Players(), [], time.time()
    sprt_bounds = [float(x) for x in a.sprt.split(",")] if a.sprt else None
    try:
        with ThreadPoolExecutor(max_workers=a.workers) as ex:
            futs = [ex.submit(play, players, cand, base, a.movetime, *s) for s in specs]
            for f in as_completed(futs):
                results.append(f.result())
                if len(results) % 50 == 0:
                    print(f"  {len(results)}/{a.games} games", flush=True)
                if sprt_bounds and len(results) >= 40 and len(results) % 2 == 0:
                    llr = sprt_llr([r for r, _ in results], *sprt_bounds)
                    if not -2.94 < llr < 2.94:
                        print(f"  sprt stop at {len(results)} games: llr {llr:+.2f} "
                              f"({'H1 accepted' if llr > 0 else 'H0 accepted'})", flush=True)
                        for other in futs:
                            other.cancel()
                        break
    finally:
        for engines in ALL:
            for e in engines.values():
                try:
                    e.quit()
                except Exception:
                    pass
        shutil.rmtree(snap, ignore_errors=True)

    out = ROOT / "games" / "gauntlet" / commit
    out.mkdir(parents=True, exist_ok=True)
    (out / "games.pgn").write_text("\n\n".join(pgn for _, pgn in results) + "\n",
                                   encoding="utf-8", newline="\n")
    w = sum(s == 1.0 for s, _ in results)
    d = sum(s == 0.5 for s, _ in results)
    l = len(results) - w - d
    s, diff, lo, hi = stats(w, d, l)
    verdict = "fail" if hi < 0 else "pass" if lo > 0 else "unclear"
    if sprt_bounds:
        llr = sprt_llr([r for r, _ in results], *sprt_bounds)
        verdict = "pass" if llr >= 2.94 else "fail" if llr <= -2.94 else verdict
    print("=== gauntlet ===")
    print(f"gauntlet_elo:     {diff:+.0f} ±{(hi - lo) / 2:.0f}")
    print(f"wins/draws/losses: {w}/{d}/{l}  score {s:.3f}")
    print(f"base:             {base_sha[:7]}")
    print(f"verdict:          {verdict}")
    print(f"games_dir:        {out.relative_to(ROOT).as_posix()}/  ({time.time() - t0:.0f} s)")


if __name__ == "__main__":
    main()
