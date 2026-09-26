"""Pool runs into one result line: a run and its SEED=1 re-run are one claim.

    python tools/pool.py games/runs/<sha>/ games/runs/<sha>-s1/

Prints the `elo=… W/D/L=… @<target> wins@target=<n>` part of the result line,
computed with the arena's own estimate_elo, exactly as evidence.py re-checks it.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "arena"))
from evidence import check_game  # noqa: E402
from util import estimate_elo  # noqa: E402


def main(dirs):
    games = []
    for d in dirs:
        for pgn in sorted(Path(d).glob("*.pgn")):
            facts, _ = check_game(pgn.read_text(encoding="utf-8"))
            if facts:
                games.append(facts)
    if not games:
        sys.exit("no games found")
    elo, err = estimate_elo([(g["level"], g["score"]) for g in games])
    w, d, l = (sum(g["score"] == s for g in games) for s in (1.0, 0.5, 0.0))
    levels = sorted({g["level"] for g in games})
    target = levels[len(levels) // 2]  # the run played target - step, target, target + step
    wins = sum(g["score"] == 1.0 and g["level"] == target for g in games)
    print(f"elo={elo:.0f}±{err:.0f} W/D/L={w}/{d}/{l} @{target} wins@target={wins}")


if __name__ == "__main__":
    main(sys.argv[1:] or sys.exit(__doc__))
