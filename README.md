# chess-winning-team

A chess engine built to beat Stockfish at the highest possible Elo, with at most 5 seconds of thinking per move (draws don't count). Competition rules: [`docs/Competition-instructions.md`](docs/Competition-instructions.md). Research loop: [`program.md`](program.md).

Two people work on this repo, one on macOS and one on Windows, each on their own `autoresearch/<tag>` branch.

## Engine language

Not decided yet. See [`docs/language_research.md`](docs/language_research.md).

## Stockfish (opponent)

**Pinned version: Stockfish 19** (release `sf_19`). Both machines must run the same build, because `UCI_Elo` levels differ between Stockfish versions and results from the two branches would otherwise not be comparable.

Install it (macOS, or Git Bash on Windows):

```
python tools/stockfish.py
```

This downloads the official release for your OS into `tools/stockfish/` (gitignored, ~80 MB), verifies its SHA-256 and checks that it reports version 19. The binary is never committed.

The arena finds Stockfish with `find_stockfish()` in [`tools/stockfish.py`](tools/stockfish.py), in this order:

1. the `STOCKFISH_PATH` environment variable
2. `tools/stockfish/stockfish` (`stockfish.exe` on Windows)
3. `stockfish` on `PATH`

Any binary that isn't version 19 is rejected. To bump the version, update `STOCKFISH_VERSION`, `RELEASE_TAG` and the checksums in `ASSETS` together, in one commit on `main`.
