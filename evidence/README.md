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
| sep25-robin | `81396e0` | keep | macos-m1pro | 0.25 | 1915 ± 176 | 1915 ([63ccb08](sep25-robin/63ccb08/)) | 25/1/4 | 30 | 0.24 s | yes |
| sep25-robin | `c764cdb` | keep | macos-m1pro | 0.25 | 2075 ± 251 | 2075 ([97aee56](sep25-robin/97aee56/)) | 27/2/1 | 30 | 0.27 s | yes |
| sep25-robin | `8e592f4` | keep | macos-m1pro | 0.25 | 2203 ± 348 | 2202 ([1a24270](sep25-robin/1a24270/)) | 28/2/0 | 30 | 0.25 s | yes |
