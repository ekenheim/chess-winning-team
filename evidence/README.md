# Evidence

The games behind every claimed Elo, rebuilt from the git log by `git fetch origin && python tools/evidence.py`. Don't edit by hand.

Every `[keep]` and `[FULL]` claim keeps **all** the games of its run, because the Elo is computed from the whole run. Each game is replayed move by move to its recorded result, the engine's slowest move is checked against the time budget, and the Elo is recomputed from the PGNs with the arena's own `estimate_elo`. A `[ladder]` claim keeps its proof games, and each must be a win at 5 s/move against the Stockfish level it names. Discarded and crashed runs are not claims; their games stay in branch history.

## Beaten Stockfish levels (5 s/move)

| Level | Proof | Branch | Commit | Plies | Ending | Verified |
|---|---|---|---|---|---|---|
| 2100 | [beat-2100.pgn](sep25-erik/proofs/beat-2100.pgn) | sep25-erik | `0c5f5a4` | 35 | checkmate | yes |
| 2000 | [beat-2000.pgn](sep25-erik/proofs/beat-2000.pgn) | sep25-erik | `0c5f5a4` | 62 | checkmate | yes |
| 1900 | [beat-1900.pgn](sep25-erik/proofs/beat-1900.pgn) | sep25-erik | `7df0139` | 40 | checkmate | yes |
| 1800 | [beat-1800.pgn](sep25-erik/proofs/beat-1800.pgn) | sep25-erik | `7df0139` | 46 | checkmate | yes |
| 1700 | [beat-1700.pgn](sep25-erik/proofs/beat-1700.pgn) | sep25-erik | `0b5e357` | 61 | checkmate | yes |
| 1600 | [beat-1600.pgn](sep25-erik/proofs/beat-1600.pgn) | sep25-erik | `0b5e357` | 37 | checkmate | yes |

## Elo claims

| Branch | Commit | Kind | Host | s/move | Claimed Elo | From the games | W/D/L | Games | Slowest move | Verified |
|---|---|---|---|---|---|---|---|---|---|---|
| sep25-erik | `cc2d447` | keep | windows-i7-13700H | 0.25 | 1800 ± 146 | 1800 ([498eace](sep25-erik/498eace/)) | 20/5/5 | 30 | 0.24 s | yes |
| sep25-erik | `39030e4` | FULL | windows-i7-13700H | 5 | 1785 ± 144 | 1785 ([7047219-full](sep25-erik/7047219-full/)) | 21/2/7 | 30 | 4.75 s | yes |
| sep25-erik | `4c2ece5` | keep | windows-i7-13700H | 0.25 | 1894 ± 93 | 1894 ([7308d5b](sep25-erik/7308d5b/), [7308d5b-s1](sep25-erik/7308d5b-s1/)) | 34/7/19 | 60 | 0.25 s | yes |
| sep25-erik | `64e5066` | keep | windows-i7-13700H | 0.25 | 1985 ± 144 | 1985 ([c3a8a8b](sep25-erik/c3a8a8b/)) | 21/2/7 | 30 | 0.29 s | yes |
| sep25-erik | `b46124c` | keep | windows-i7-13700H | 0.25 | 2092 ± 169 | 2092 ([73fbb69](sep25-erik/73fbb69/)) | 24/2/4 | 30 | 0.25 s | yes |
| sep25-erik | `4879996` | FULL | windows-i7-13700H | 5 | 2197 ± 209 | 2197 ([b46124c-full](sep25-erik/b46124c-full/)) | 25/4/1 | 30 | 4.75 s | yes |
| sep25-erik | `55375f9` | keep | windows-i7-13700H | 0.25 | 2234 ± 154 | 2234 ([03fdcdc](sep25-erik/03fdcdc/)) | 21/5/4 | 30 | 0.24 s | yes |
| sep25-erik | `fff833a` | FULL | windows-i7-13700H | 5 | 2397 ± 209 | 2397 ([55375f9-full](sep25-erik/55375f9-full/)) | 27/0/3 | 30 | 4.75 s | yes |
| sep25-erik | `555bcaf` | keep | windows-i7-13700H | 0.25 | 2400 ± 146 | 2400 ([c9cb33a](sep25-erik/c9cb33a/)) | 21/3/6 | 30 | 0.24 s | yes |
