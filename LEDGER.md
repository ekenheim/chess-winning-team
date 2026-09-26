# Ledger

Who tried what, on which host, with what result, and where the engine went. Rebuilt from the git log by `git fetch origin && python tools/progress.py` (run on main; `--print` shows it without writing). Don't edit by hand.

## In flight

Being benched right now. Don't start the same idea on the other branch.

| Since | Who | Branch | Trying | Hypothesis |
|---|---|---|---|---|
| Sep 25 10:33 UTC (stale? no result after 4 h) | Erik Adolfsson | `sep25-erik` @`36032fd` | speed: incremental tapered evaluation (O(1) eval update per move) |  |

## Champion engine on main

Engine code moves between the branches only through main: a `[keep]` is `[promote]`d to main, and the other branch adopts it with a `[sync]` re-benched on its own host. `[ladder]` bumps of `TARGET_ELO` live here too.

| When | Who | Event | From | Elo | Host | What |
|---|---|---|---|---|---|---|
| Sep 26 07:05 UTC | chopsting | promote `bb884cc` | `sep25-robin@fbc8c67` | 2326 ±486 | macos-m1pro | search: check extension + all evasions in quiescence when in check (+ mate-break and null-move repetition fixes) |
| Sep 26 07:05 UTC | chopsting | promote `3e3b483` | `sep25-erik@555bcaf` | 2400 ±146 | windows-i7-13700H | time: soft limit 60%, keep best root move of an aborted iteration, reserve capped at 50ms |
| Sep 26 07:06 UTC | chopsting | promote `6d40457` | `sep26-robin@bba68b9` | 2718 ±180 | macos-m1pro | confirm SEE + log-LMR + staged picker at 5s/move (15 of 30 games, stopped to aim higher) |
| Sep 26 07:07 UTC | chopsting | ladder `c5aa1ed` | `sep25-erik` | — | ? | proof games/proofs/beat-1600.pgn + games/proofs/beat-1700.pgn + games/proofs/beat-1800.pgn + games/proofs/beat-1900.pgn + games/proofs/beat-2000.pgn + games/proofs/beat-2100.pgn + games/proofs/beat-2200.pgn + games/proofs/beat-2300.pgn |
| Sep 26 07:08 UTC | chopsting | ladder `d519e4e` | `sep26-robin` | — | macos-m1pro | proof games/proofs/beat-2400.pgn + games/proofs/beat-2500.pgn + games/proofs/beat-2600.pgn + games/proofs/beat-2700.pgn + games/proofs/beat-2800.pgn |
| Sep 26 07:11 UTC | chopsting | ladder `823c402` | `sep26-robin` | — | macos-m1pro | proof games/proofs/beat-2900.pgn |
| Sep 26 08:05 UTC | chopsting | promote `6a6b139` | `sep26-robin@14e5fe2` | 2965 ±354 | macos-m1pro | aim 139c887 (2 threads) at 3010/3100/3190 at 5s/move (4 games, stopped for the 3190-only rule) |

## Every result

Newest first, both branches. **State**: `in main` = part of the champion engine; `branch` = kept on its branch only (promote it, or re-try it on the champion); `dropped` = kept, then replaced by a `[sync]` before it was promoted (worth re-trying on the champion); `champion` = a `[sync]`, main's engine re-benched on that host; `reverted` = discarded or crashed.

| When | Who | Branch | Host | Result | Elo | W/D/L @target | What was tried | State | Commit |
|---|---|---|---|---|---|---|---|---|---|
| Sep 26 08:07 UTC | Erik Adolfsson | `sep25-erik` | windows-i7-13700H | **discard** | 2873 ±135 | 2/16/12 @3000 (0 wins) | eval: tapered mobility (N/B/R/Q safe squares, zero-mean); Elo unchanged, draws 10 -&gt; 16, wins 5 -&gt; 2 | reverted | `ea0e9a4` |
| Sep 26 08:05 UTC | chopsting | `sep26-robin` | macos-m1pro | **FULL** | 3010 ±681 | 0/1/0 @3010 (0 wins) | aim ead1002 (4 threads) at 3010/3100/3190 at 5s/move (1 game, restarted with 2 threads x 4 games) | 5 s run | `e93a0ba` |
| Sep 26 08:05 UTC | chopsting | `sep26-robin` | macos-m1pro | **FULL** | 2965 ±354 | 0/3/1 @3100 (0 wins) | aim 139c887 (2 threads) at 3010/3100/3190 at 5s/move (4 games, stopped for the 3190-only rule) | 5 s run | `14e5fe2` |
| Sep 26 07:37 UTC | Erik Adolfsson | `sep25-erik` | windows-i7-13700H | **sync** | 2873 ±135 | 5/10/15 @3000 (2 wins) | adopt main@3e2bf9b | champion | `1c096d5` |
| Sep 26 07:11 UTC | chopsting | `sep26-robin` | macos-m1pro | **FULL** | 3075 ±321 | 1/4/0 @3000 (0 wins) | aim 888bd24 at 2900/3000/3100 at 5s/move (5 of 60 games, stopped for a stronger build) | 5 s run | `e5d57de` |
| Sep 26 07:07 UTC | Erik Adolfsson | `sep25-erik` | windows-i7-13700H | **discard** | 2326 ±130 | 9/6/15 @2400 (2 wins) | eval: king danger v3 (attacked zone squares, storm pawns, open king files) | reverted | `6f37ca4` |
| Sep 26 07:01 UTC | chopsting | `sep26-robin` | macos-m1pro | **FULL** | 2718 ±180 | 5/6/4 @2700 (1 wins) | confirm SEE + log-LMR + staged picker at 5s/move (15 of 30 games, stopped to aim higher) | 5 s run | `bba68b9` |
| Sep 26 07:01 UTC | chopsting | `sep26-robin` | macos-m1pro | **FULL** | 2692 ±169 | 22/6/2 @2400 (7 wins) | confirm frontier pruning + movetime + bucket TT at 5s/move | 5 s run | `3896e6c` |
| Sep 25 16:38 UTC | Erik Adolfsson | `sep25-erik` | ? | **ladder** | — | → 2400 | proof games/proofs/beat-2200.pgn + beat-2300.pgn, tags beat-2200, beat-2300 |  | `4340e04` |
| Sep 25 16:38 UTC | Erik Adolfsson | `sep25-erik` | windows-i7-13700H | **FULL** | 2400 ±146 | 19/7/4 @2200 (5 wins) | confirm time manager at 5s/move | 5 s run | `1e4f3da` |
| Sep 25 15:25 UTC | Erik Adolfsson | `sep25-erik` | windows-i7-13700H | **keep** | 2400 ±146 | 21/3/6 @2200 (8 wins) | time: soft limit 60%, keep best root move of an aborted iteration, reserve capped at 50ms | in main | `555bcaf` |
| Sep 25 15:22 UTC | Erik Adolfsson | `sep25-erik` | ? | **ladder** | — | → 2200 | proof games/proofs/beat-2000.pgn + beat-2100.pgn, tags beat-2000, beat-2100 |  | `0c5f5a4` |
| Sep 25 15:21 UTC | Erik Adolfsson | `sep25-erik` | windows-i7-13700H | **FULL** | 2397 ±209 | 27/0/3 @2000 (7 wins) | confirm king safety at 5s/move | 5 s run | `fff833a` |
| Sep 25 14:33 UTC | Erik Adolfsson | `sep25-erik` | windows-i7-13700H | **keep** | 2234 ±154 | 21/5/4 @2000 (5 wins) | eval: king safety (pawn shield + king-zone attackers, only vs an enemy queen) + Kh1 = Kg1 | in main | `55375f9` |
| Sep 25 14:29 UTC | Erik Adolfsson | `sep25-erik` | ? | **ladder** | — | → 2000 | proof games/proofs/beat-1800.pgn + beat-1900.pgn, tags beat-1800, beat-1900 |  | `7df0139` |
| Sep 25 14:28 UTC | Erik Adolfsson | `sep25-erik` | windows-i7-13700H | **FULL** | 2197 ±209 | 25/4/1 @1800 (7 wins) | confirm merged search + tapered eval at 5s/move | 5 s run | `4879996` |
| Sep 25 13:37 UTC | Erik Adolfsson | `sep25-erik` | windows-i7-13700H | **keep** | 2092 ±169 | 24/2/4 @1800 (7 wins) | search: merge main (NMP + LMR + PVS + killers/history + check extension + in-check quiescence) onto tapered eval | in main | `b46124c` |
| Sep 25 13:32 UTC | Erik Adolfsson | `sep25-erik` | windows-i7-13700H | **discard** | 1920 ±95 | 36/7/17 @1800 (13 wins) | speed: incremental tapered eval (pooled 2 runs; identical eval, +1.2 ply, but below best 1985+30) | reverted | `3f28668` |
| Sep 25 10:28 UTC | Erik Adolfsson | `sep25-erik` | windows-i7-13700H | **keep** | 1985 ±144 | 21/2/7 @1800 (6 wins) | eval: tapered evaluation by non-pawn material phase | in main | `64e5066` |
| Sep 25 10:26 UTC | chopsting | `sep25-robin` | macos-m1pro | **keep** | 2326 ±486 | 29/1/0 @1600 (10 wins) | search: check extension + all evasions in quiescence when in check (+ mate-break and null-move repetition fixes) | in main | `fbc8c67` |
| Sep 25 10:19 UTC | chopsting | `sep25-robin` | macos-m1pro | **discard** | 2075 ±251 | 28/0/2 @1600 (9 wins) | eval: king safety v2 — king-zone attackers, shelter, king table tapered by opponent material | reverted | `c4bf447` |
| Sep 25 10:18 UTC | Erik Adolfsson | `sep25-erik` | windows-i7-13700H | **keep** | 1894 ±93 | 34/7/19 @1800 (12 wins) | search: transposition table 64MB + hash-move ordering + TT PV | in main | `4c2ece5` |
| Sep 25 10:13 UTC | chopsting | `sep25-robin` | macos-m1pro | **keep** | 2203 ±348 | 28/2/0 @1600 (9 wins) | search: null-move pruning + late-move reductions | in main | `8e592f4` |
| Sep 25 10:12 UTC | Erik Adolfsson | `sep25-erik` | ? | **ladder** | — | → 1800 | proof games/proofs/beat-1600.pgn + beat-1700.pgn, tags beat-1600, beat-1700 |  | `0b5e357` |
| Sep 25 10:10 UTC | Erik Adolfsson | `sep25-erik` | windows-i7-13700H | **FULL** | 1785 ±144 | 21/2/7 @1600 (8 wins) | confirm baseline at 5s/move | 5 s run | `39030e4` |
| Sep 25 10:07 UTC | chopsting | `sep25-robin` | macos-m1pro | **keep** | 2075 ±251 | 27/2/1 @1600 (8 wins) | search: move ordering package — TT kept across moves + killers + history + PVS | in main | `c764cdb` |
| Sep 25 10:01 UTC | chopsting | `sep25-robin` | macos-m1pro | **discard** | 1892 ±169 | 23/4/3 @1600 (8 wins) | eval: king table tapered by material + king safety (shelter, open files, king in centre) | reverted | `a1004d8` |
| Sep 25 09:53 UTC | chopsting | `sep25-robin` | macos-m1pro | **discard** | 1915 ±176 | 24/3/3 @1600 (7 wins) | search: transposition table 48MB kept across moves + hash-move ordering | reverted | `3a5b460` |
| Sep 25 09:51 UTC | Erik Adolfsson | `sep25-erik` | windows-i7-13700H | **keep** | 1800 ±146 | 20/5/5 @1600 (7 wins) | baseline | in main | `cc2d447` |
| Sep 25 09:37 UTC | chopsting | `sep25-robin` | macos-m1pro | **keep** | 1915 ±176 | 25/1/4 @1600 (9 wins) | baseline | in main | `81396e0` |
