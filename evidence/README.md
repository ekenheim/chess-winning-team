# Evidence

The games behind every claimed Elo, rebuilt from the git log by `git fetch origin && python tools/evidence.py`. Don't edit by hand.

Every `[keep]`, `[FULL]` and `[sync]` claim keeps **all** the games of its runs, because the Elo is computed from the whole run (a SEED=1 re-run is pooled with the first). Each game is replayed move by move to its recorded result, the engine's slowest move is checked against the time budget, and the Elo is recomputed from the PGNs with the arena's own `estimate_elo`. A `[ladder]` claim keeps its proof games, and each must be a win at 5 s/move against the Stockfish level it names. Discarded and crashed runs are not claims; their games stay in branch history.

## Beaten Stockfish levels (5 s/move)

| Level | Proof | Branch | Commit | Plies | Ending | Verified |
|---|---|---|---|---|---|---|
| 2800 | [beat-2800.pgn](main/proofs/beat-2800.pgn) | main | `d519e4e` | 207 | checkmate | yes |
| 2700 | [beat-2700.pgn](main/proofs/beat-2700.pgn) | main | `d519e4e` | 190 | checkmate | yes |
| 2600 | [beat-2600.pgn](main/proofs/beat-2600.pgn) | main | `d519e4e` | 71 | checkmate | yes |
| 2500 | [beat-2500.pgn](main/proofs/beat-2500.pgn) | main | `d519e4e` | 195 | checkmate | yes |
| 2400 | [beat-2400.pgn](main/proofs/beat-2400.pgn) | main | `d519e4e` | 125 | checkmate | yes |
| 2300 | [beat-2300.pgn](main/proofs/beat-2300.pgn) | main | `c5aa1ed` | 37 | checkmate | yes |
| 2200 | [beat-2200.pgn](main/proofs/beat-2200.pgn) | main | `c5aa1ed` | 44 | checkmate | yes |
| 2100 | [beat-2100.pgn](main/proofs/beat-2100.pgn) | main | `c5aa1ed` | 35 | checkmate | yes |
| 2000 | [beat-2000.pgn](main/proofs/beat-2000.pgn) | main | `c5aa1ed` | 62 | checkmate | yes |
| 1900 | [beat-1900.pgn](main/proofs/beat-1900.pgn) | main | `c5aa1ed` | 40 | checkmate | yes |
| 1800 | [beat-1800.pgn](main/proofs/beat-1800.pgn) | main | `c5aa1ed` | 46 | checkmate | yes |
| 1700 | [beat-1700.pgn](main/proofs/beat-1700.pgn) | main | `c5aa1ed` | 61 | checkmate | yes |
| 1600 | [beat-1600.pgn](main/proofs/beat-1600.pgn) | main | `c5aa1ed` | 37 | checkmate | yes |

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
| sep25-erik | `1e4f3da` | FULL | windows-i7-13700H | 5 | 2400 ± 146 | 2400 ([555bcaf-full](sep25-erik/555bcaf-full/)) | 19/7/4 | 30 | 4.96 s | yes |
| sep25-robin | `81396e0` | keep | macos-m1pro | 0.25 | 1915 ± 176 | 1915 ([63ccb08](sep25-robin/63ccb08/)) | 25/1/4 | 30 | 0.24 s | yes |
| sep25-robin | `c764cdb` | keep | macos-m1pro | 0.25 | 2075 ± 251 | 2075 ([97aee56](sep25-robin/97aee56/)) | 27/2/1 | 30 | 0.27 s | yes |
| sep25-robin | `8e592f4` | keep | macos-m1pro | 0.25 | 2203 ± 348 | 2202 ([1a24270](sep25-robin/1a24270/)) | 28/2/0 | 30 | 0.25 s | yes |
| sep25-robin | `fbc8c67` | keep | macos-m1pro | 0.25 | 2326 ± 486 | 2326 ([aecf98e](sep25-robin/aecf98e/)) | 29/1/0 | 30 | 0.27 s | yes |
| sep26-robin | `3896e6c` | FULL | macos-m1pro | 5 | 2692 ± 169 | 2692 ([4340e04-dirty-full-r2](sep26-robin/4340e04-dirty-full-r2/)) | 22/6/2 | 30 | 5.03 s | yes |
| sep26-robin | `bba68b9` | FULL | macos-m1pro | 5 | 2718 ± 180 | 2718 ([stack-v2-full-t2700s100](sep26-robin/stack-v2-full-t2700s100/)) | 5/6/4 | 15 | 5.04 s | yes |
| sep26-robin | `e5d57de` | FULL | macos-m1pro | 5 | 3075 ± 321 | 3075 ([stack-v2-full-t3000s100](sep26-robin/stack-v2-full-t3000s100/)) | 1/4/0 | 5 | 4.92 s | yes |
