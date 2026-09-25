# Evidence

The games behind every claimed Elo, rebuilt from the git log by `git fetch origin && python tools/evidence.py`. Don't edit by hand.

Every `[keep]` and `[FULL]` claim keeps **all** the games of its run, because the Elo is computed from the whole run. Each game is replayed move by move to its recorded result, the engine's slowest move is checked against the time budget, and the Elo is recomputed from the PGNs with the arena's own `estimate_elo`. A `[ladder]` claim keeps its proof games, and each must be a win at 5 s/move against the Stockfish level it names. Discarded and crashed runs are not claims; their games stay in branch history.

## Beaten Stockfish levels (5 s/move)

| Level | Proof | Branch | Commit | Plies | Ending | Verified |
|---|---|---|---|---|---|---|
| 1700 | [beat-1700.pgn](sep25-erik/proofs/beat-1700.pgn) | sep25-erik | `0b5e357` | 61 | checkmate | yes |
| 1600 | [beat-1600.pgn](sep25-erik/proofs/beat-1600.pgn) | sep25-erik | `0b5e357` | 37 | checkmate | yes |

## Elo claims

| Branch | Commit | Kind | Host | s/move | Claimed Elo | From the games | W/D/L | Games | Slowest move | Verified |
|---|---|---|---|---|---|---|---|---|---|---|
| sep25-erik | `cc2d447` | keep | windows-i7-13700H | 0.25 | 1800 ± 146 | 1800 ([498eace](sep25-erik/498eace/)) | 20/5/5 | 30 | 0.24 s | yes |
| sep25-erik | `39030e4` | FULL | windows-i7-13700H | 5 | 1785 ± 144 | 1785 ([7047219-full](sep25-erik/7047219-full/)) | 21/2/7 | 30 | 4.75 s | yes |
| sep25-erik | `4c2ece5` | keep | windows-i7-13700H | 0.25 | 1894 ± 93 | 1894 ([7308d5b](sep25-erik/7308d5b/), [7308d5b-s1](sep25-erik/7308d5b-s1/)) | 34/7/19 | 60 | 0.25 s | yes |
| sep25-erik | `64e5066` | keep | windows-i7-13700H | 0.25 | 1985 ± 144 | 1985 ([c3a8a8b](sep25-erik/c3a8a8b/)) | 21/2/7 | 30 | 0.29 s | yes |
| sep25-erik | `b46124c` | keep | windows-i7-13700H | 0.25 | 2092 ± 169 | 2081 ([1a24270](sep25-erik/1a24270/), [63ccb08](sep25-erik/63ccb08/), [73fbb69](sep25-erik/73fbb69/), [97aee56](sep25-erik/97aee56/), [aecf98e](sep25-erik/aecf98e/)) | 133/8/9 | 30 | 0.27 s | **no** |

## Problems

- sep25-erik `b46124c`: games give elo=2081 W/D/L=133/8/9, commit claims elo=2092 W/D/L=24/2/4
