"""Run one experiment: `make bench` (fast) or `make bench-full` (real rule).

    python arena/bench.py [--fast | --full] [--seed N] [--workers N]
                          [--games N --out DIR]   (smoke tests only)

Environment: SEED, WORKERS. Prints the `=== run summary ===` block that
program.md greps for. A failed integrity check raises and leaves no summary.
"""

import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import util  # noqa: E402


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    mode = ap.add_mutually_exclusive_group()
    mode.add_argument("--fast", action="store_true", help=f"{util.FAST_MOVE_TIME_S}s/move (default)")
    mode.add_argument("--full", action="store_true", help=f"{util.MOVE_TIME_S}s/move, the competition rule")
    ap.add_argument("--seed", type=int, default=int(os.environ.get("SEED", "0")),
                    help="rotate the opening set (re-run a near-miss once with SEED=1)")
    ap.add_argument("--workers", type=int, default=None, help="parallel games (env WORKERS)")
    ap.add_argument("--games", type=int, default=util.NUM_GAMES,
                    help="SMOKE TESTS ONLY: fewer games; such a run is not a valid log entry")
    ap.add_argument("--out", default=None, help="SMOKE TESTS ONLY: write games somewhere else")
    args = ap.parse_args()

    if not util.ENGINE_EXE.is_file():
        sys.exit(f"engine binary missing: {util.ENGINE_EXE}. Run `make engine`.")
    if args.games != util.NUM_GAMES and not args.out:
        sys.exit("--games changes the fixed schedule; use it only with --out for smoke tests.")
    util.run_match(full=args.full, seed=args.seed, workers=args.workers,
                   num_games=args.games, out_dir=args.out)


if __name__ == "__main__":
    main()
