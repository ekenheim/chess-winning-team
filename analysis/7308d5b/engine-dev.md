> Combined review: this file is a copy of `analysis/36032fd/engine-dev.md`, which covers runs `7308d5b`, `7308d5b-s1`, `c3a8a8b`, `36032fd` and `36032fd-s1` together (the per-run engine-dev reviews were lost to a rate limit).

# Engine-developer report: runs `7308d5b`, `7308d5b-s1`, `c3a8a8b`, `36032fd`, `36032fd-s1` (0.25 s/move, Stockfish 19 at 1700/1800/1900)

Combined catch-up review; the per-run engine-dev reviews were lost. Builds on `analysis/498eace/engine-dev.md`, `analysis/7047219-full/engine-dev.md` and the grandmaster reports in `analysis/7308d5b/` and `analysis/c3a8a8b/`; nothing from those is repeated except where a number changed. Sources: `analysis/<run>/analysis.json`, `games/runs/<run>/moves.jsonl`, the annotated PGNs, and Stockfish 19 (`tools/stockfish/`) via python-chess for refutation lines at the decisive move of every non-won game (scripts in the session scratchpad, not committed). Engine source was read, not changed.

Context for the recommendations: the merged search already has null move + LMR + PVS + killers/history + check extension + in-check quiescence, and it is about to be combined with the tapered eval. So the forcing-line class below is assumed handled; the list at the end is eval and time management only.

## Summary

1. **The +1.2 ply of `36032fd` over `c3a8a8b` never reached the middlegame, and the Elo difference is noise.** Phase-mix-adjusted the gain is +0.9 ply (`36032fd`) and +0.5 (`36032fd-s1`); middlegame depth went 6.5 → 7.1 and 6.2. The `-s1` run ran the *same binary* at 4.1–5.0 M nps instead of 6.1 M (host load), so half of the pooled sample had *less* middlegame depth than `c3a8a8b` (62 % vs 68 % of middlegame moves at depth ≤ 6). Score 0.733 vs 0.658, z = 0.78. The five runs of this eval/search family score 1825, 1970, 1985, 1887, 1955: mean 1925, SD 65, which is what pure noise with SE ≈ 75 looks like. `36032fd` is a 2.4× speed change with identical node counts; it cannot be Elo-negative and should be carried into the merge on the profile evidence, not on games.
2. **Deeper search did not change the draw behaviour.** All five repetition draws in the `36032fd` runs came from positions Stockfish scored −578 to −996 for us (rescued half-points). The two "insufficient material" draws ended in K+N v K with the engine scoring **+381 and +352** (no drawn-ending recognition). The slipped wins slipped 20–90 plies before the draw, in the middlegame, by the same mechanisms as the losses.
3. **Blunder rate depends on depth, not on the run**: middlegame blunder rate at d6 is 11–14 % in every run, at d7 2–9 %, at d8+ 0–6 %. 42 of the 59 decisive moves were made at depth ≤ 6, 11 at d7. The middlegame depth distribution barely moved between `c3a8a8b` and the pooled `36032fd`, so neither did the blunder count.
4. **Eval side: king safety with the enemy queen on is primary in 29 of the 59 losses/draws and addressable in 39**; material greed / trapped pieces 9 (16 addressable); forcing tactics 8 (26 addressable, the merged search's job); endgame technique / passed pawns 8; queenless king walk 2 (already fixed by the tapered eval). The engine's own score was ≥ +100 at 45 of the 59 decisive moves; its optimism when Stockfish has us ≤ −300 is +430 to +498 in every run, unchanged since the baseline (+430).
5. **Time: 41–43 % of the budget produces no completed iteration.** 52 % of moves stop at the 40 % soft limit at a mean 0.157 s (0.09 s unused each, 19–20 % of the budget); 41 % hit the hard limit after starting an iteration before 0.10 s (≥ 0.136 s each discarded, ≥ 22 % of the budget). Hard-aborted moves are one ply *shallower* than soft-stopped ones (6.2–7.4 vs 7.3–8.3) because they are the harder positions. `c3a8a8b` overshot 0.25 s on 12 moves (max 0.286 s, 9 of them on ply 1–2), `36032fd-s1` on 4 (max 0.259): first-touch page faults on the 64 MB table plus host preemption, not clock granularity (`NODE_CHECK_MASK = 1023` is 0.2–0.4 ms).

## Evidence

### Results, depth, speed, time per run

| run | W/D/L | 1700 / 1800 / 1900 | depth op/mid/end | mix-adj. depth | nps op/mid/end (M) | mean s | hard-abort | soft-stop | > 0.25 s (max) |
|---|---|---|---|---|---|---|---|---|---|
| 7308d5b | 14/4/12 | 3/2/5 · 6/0/4 · 5/2/3 | 6.4 / 7.1 / 8.5 | 7.39 | 6.0 / 6.3 / 6.5 | 0.179 | 42 % | 51 % | 0 (0.245) |
| 7308d5b-s1 | 20/3/7 | 8/1/1 · 6/0/4 · 6/2/2 | 6.2 / 7.4 / 9.1 | 7.75 | 5.7 / 6.3 / 6.5 | 0.174 | 39 % | 53 % | 0 (0.244) |
| c3a8a8b | 21/2/7 | 9/0/1 · 6/2/2 · 6/0/4 | 5.7 / 6.5 / 7.8 | 6.78 | 2.6 / 2.5 / 2.3 | 0.183 | 41 % | 52 % | 12 (0.286) |
| 36032fd | 17/3/10 | 6/1/3 · 7/1/2 · 4/1/5 | 6.4 / 7.1 / 9.2 | 7.69 | 6.1 / 6.1 / 5.9 | 0.178 | 41 % | 52 % | 0 (0.244) |
| 36032fd-s1 | 19/4/7 | 7/1/2 · 6/2/2 · 6/1/3 | 6.1 / 6.2 / 9.4 | 7.30 | 5.0 / 4.2 / 4.1 | 0.183 | 42 % | 53 % | 4 (0.259) |

Mix-adjusted depth uses `c3a8a8b`'s phase counts (300/512/444). `36032fd`'s raw 8.0 is inflated by 737 endgame moves at depth 9.2 (48 % of its moves vs 35 % in `c3a8a8b`). The tapered eval cost 2.5× nps (6.3 → 2.5 M); the incremental version recovered it fully (6.1 M, equal to the TT runs). `36032fd-s1` at 4.1–5.0 M with the same binary is host load: the two `36032fd` runs are not the same experiment.

Middlegame depth distribution (share of middlegame moves): `c3a8a8b` d5 24 % · d6 40 % · d7 22 % · d8+ 10 % (**≤ d6: 68 %**); `36032fd` d5 4 % · d6 34 % · d7 39 % · d8+ 19 % (**43 %**); `36032fd-s1` d5 12 % · d6 45 % · d7 29 % · d8+ 10 % (**62 %**); the TT runs 43–45 %.

### Blunder rate by completed depth (engine moves, cp_loss ≥ 200, |SF eval before| < 990)

| | d5 | d6 | d7 | d8 | d9 | d10+ | all |
|---|---|---|---|---|---|---|---|
| pooled, all phases | 5.0 % (22/441) | 8.0 % (138/1725) | 3.6 % (54/1516) | 4.1 % (34/825) | 2.9 % (12/419) | 1.8 % (11/617) | 4.9 % |
| pooled, middlegame | 7.3 % | **12.6 %** (110/871) | 5.6 % (40/714) | 5.6 % (11/195) | 3.0 % (1/33) | 0/9 | 8.7 % |
| c3a8a8b, middlegame | 6.6 % | 12.5 % | 2.4 % | 15 % (3/20) | 0/5 | 0/2 | 8.7 % (34/392) |
| 36032fd + s1, middlegame | 10.7 % | 13.2 % | 6.8 % | 3.6 % | 0/20 | – | 9.5 % (82/865) |

Per run, real blunders per 100 moves: 5.5, 4.3, 4.8, 4.6, 5.4 (same order as the table above). Middlegame ACPL 62–74 in all five; endgame ACPL fell from 39–41 (TT runs) to 21–33 with the tapered eval, and stayed there with the incremental one. Depth ≤ 7 is where games are lost (53 of 59 decisive moves); at d8+ the middlegame rate is ≤ 5.6 % and at d9+ effectively zero.

Score noise: `c3a8a8b` 0.733 ± 0.151 (95 %), `36032fd`+s1 0.658 ± 0.112, `7308d5b`+s1 0.625 ± 0.115; c3a8a8b − 36032fd = +0.075, z = 0.78. A keep rule of "+30 over the best run" applied to single 30-game runs selects for lucky runs; every pooled 60-game pair in this family sits at 1920 ± 80.

### Draws (16 across the five runs)

| run / game | termination | SF eval for us at the end | own eval | peak for us | verdict |
|---|---|---|---|---|---|
| 7308d5b g5, g20; s1 g5, g8; c3a8a8b g16; 36032fd g20, g21; s1 g9, g15, g17 | threefold ×10 | −487, −714, −998, −717, −678, −996, −578, −726, −995, −655 | mostly −400 to 0 | +128 … +568 | rescued; the opponent (1700–1900) chose to repeat |
| 7308d5b g25 | threefold | 0 (was +1011) | +1550 before 21.Qxd2?? | +1011 | forced perpetual, horizon (search) |
| c3a8a8b g10 | fifty moves | 0 (was −674) | +307 | +26 | rescued |
| 7308d5b g11 | insufficient | K v K | 0 | +404 | rook-ending technique |
| 36032fd g24; s1 g19 | insufficient | **K+N v K, SF 0** | **+381, +352** | +247, +276 | no drawn-ending recognition; the +2.5 was lost 60–100 plies earlier |
| s1 g24 (7308d5b) | threefold | −998 | +285 before 38...Nf6?? | +209 | rescued after a king-safety slide |

No draw was taken from a better position by the engine; contempt is still not indicated. The engine's inability to see K+N v K (or the same-bishop blocked ending in `36032fd-s1` g17, 363 plies) as a draw is an eval gap that also makes it trade *into* those endings.

### Decisive move in every loss and draw (59 games), classified

Method: the first engine move that took a position ≥ −100 (Stockfish, our view) down by ≥ 150 cp (largest loss if none), with king-zone attackers, pawn shield, open files, safe squares of the moved piece, queen distance and the Stockfish depth-16 refutation from the resulting position; the grandmaster reports were used as ground truth for the 24 games they cover.

| class | what the eval cannot see | primary | addressable | games (primary) |
|---|---|---|---|---|
| **KS-Q**: own king exposed with the enemy queen on: pawn shield broken/advanced (gxf4, g3, g5, h6, h3/h4), open or half-open file next to the king (O-O-O with no b-pawn ×2, Kh1 refused ×3), uncastled king on the d/e-file with castling lost (×6), ≥ 2 attackers in the zone while our queen is ≥ 4 squares away | 29 | 39 | 7308d5b 2, 7, 8, 15, 19, 30 · s1 5, 6, 16, 22, 24 · c3a8a8b 10, 12, 16, 17, 23, 28 · 36032fd 1, 2, 3, 9, 11, 30 · s1 7, 9, 22, 23, 26, 28 |
| **GRAB**: queen/knight takes a pawn or the exchange on the far wing with ≤ 1 safe retreat, or a piece gets trapped (Qxa5, Qxa7, Qxb2, Qxg7, Qxc2, Qxe7, Nxh7, Nxa1, Bb3 after e5, Qc3 into a fork) | 9 | 16 | 7308d5b 9 · s1 15 · c3a8a8b 9, 11 · 36032fd 17, 21, 25 · s1 6, 18 |
| **TAC**: forcing line of 5–9 plies with 2–4 checks (back-rank mates, perpetual, forks) missed at d5–7; search's job (check extension + in-check quiescence, now merged) | 8 | 26 | 7308d5b 6, 20, 25 · s1 8, 10 · c3a8a8b 8 · 36032fd 12, 18 |
| **EG/PP**: passed pawn not pushed / pushed unsupported / rook not behind it, king not activated, drawn ending not recognised | 8 | 8 | 7308d5b 3, 11, 22 · s1 12 · 36032fd 24 · s1 15, 17, 19 |
| KS-noQ: queenless king walk into R+B+N | 2 | 2 | 7308d5b 29 · s1 20 (fixed by the tapered eval: none in the three later runs) |
| other / rescued draws from the opening | 3 | – | 7308d5b 5, 26 · 36032fd 20 |

Supporting numbers at the 59 decisive moves: enemy queen on the board in 50; middlegame or opening in 51; own eval ≥ +100 in 45; own − Stockfish before the move mean +111 (median +98); own ≥ +100 while Stockfish ≤ 0 in 12; depth ≤ 6 in 42, d7 in 11; soft-stopped (time unused) 28, hard-aborted 31, early 0. The four games lost "gradually" without a single ≥ 200 cp move (7308d5b g7, g15; 36032fd g11; s1 g28) are all slow king attacks scored +100 to +200 by the engine while Stockfish went from −100 to −500: king safety again.

Whole-run disagreement (engine root score − Stockfish d14, our view, |SF| < 990): mean +116 / +134 / **+65** / +130 / +125; |diff| > 200 on 30 / 40 / **29** / 34 / 39 % of moves; when Stockfish has us ≤ −300: **+450 / +436 / +498 / +430 / +498**. The tapered eval improved calibration in general (the +65 is the best so far, and endgame ACPL halved) and did nothing for the attacked-king case, which is where the games go.

### Time management, quantified (soft limit 0.10 s, hard limit 0.235 s)

| run | moves | soft-stopped: n, mean stop, mean unused | unused % of budget | hard-aborted: n, discarded ≥ each | discarded % (lower bound) | depth soft vs hard |
|---|---|---|---|---|---|---|
| 7308d5b | 1260 | 644, 0.157 s, 0.093 s | 19 % | 527, ≥ 0.136 s | ≥ 23 % | 8.15 vs 6.96 |
| 7308d5b-s1 | 1332 | 701, 0.155, 0.095 | 20 % | 518, ≥ 0.136 | ≥ 21 % | 7.56 vs 7.08 |
| c3a8a8b | 1256 | 658, 0.160, 0.090 | 19 % | 519, ≥ 0.139 | ≥ 23 % | 7.27 vs 6.21 |
| 36032fd | 1533 | 796, 0.154, 0.096 | 20 % | 633, ≥ 0.136 | ≥ 22 % | 8.28 vs 7.36 |
| 36032fd-s1 | 1323 | 697, 0.159, 0.091 | 19 % | 552, ≥ 0.137 | ≥ 23 % | 7.80 vs 6.84 |

Soft-stopped moves by stop time: 0.10–0.15 s ≈ 45 %, 0.15–0.20 s ≈ 35 %, 0.20–0.235 s ≈ 18 % (all runs alike). The discarded bound is exact: a hard-aborted move by construction started its last iteration before 0.10 s and was killed at 0.235 s; the true discarded share is higher (the baseline probe measured 61 % at the same time control; with the TT the nodes survive for the next move, but the *move choice* never benefits). 6–8 % of moves end before 0.10 s (mate found or forced). Net: ≥ 41–43 % of the budget yields no completed iteration, and the moves that get cut are the deeper, harder ones. 18 of the 59 decisive moves stopped at 0.10–0.17 s with ≥ 80 ms left (e.g. c3a8a8b g11 8.Qc3?? 0.13 s d5, 36032fd g3 Nxc6 0.11 s d7, g30 f6 0.11 s d6, s1 g22 e5 0.11 s d6).

Over-budget moves: `c3a8a8b` 12 (9 on ply 1–2, max 0.286 s = 51 ms past the hard limit), `36032fd-s1` 4, the three fast-host runs 0. Both affected runs were the slow ones (2.5 M nps by eval cost, 4.1 M by load). `check_stop` runs every 1024 nodes (0.2–0.4 ms), so the overshoot is stalls, not granularity: the 64 MB table (`vec![EMPTY_ENTRY; 1 << 21]`, re-zeroed on `ucinewgame`) is first-touched during the first search, and a loaded host preempts the process. The crash line is movetime + 0.10 s; 64 ms of margin remained.

## Prioritised changes (max 5; search techniques from the merge assumed present)

1. **King safety with the enemy queen on** (`eval.rs`, both colours, scaled to zero when the opposing queen is off so the tapered endgame king play is untouched). Terms: (a) pawn shield: −15/−25 per missing/advanced pawn on the king's three files, −40 when the file in front is open; (b) attackers: sum over enemy non-pawn pieces attacking the king zone (3×3 plus two squares toward the centre) weighted Q 4 / R 2 / B, N 1, squared or tabled so 2+ attackers cost 60–120; (c) open/half-open file on or adjacent to the king with an enemy rook or queen on the board: −30/−50; (d) uncastled king on d/e/f with castling rights lost and ≥ 2 enemy pieces developed: −40, and make f1/f8 equal to e1/e8 in the mg king table so interposing beats stepping the king. Evidence: 29 of 59 non-wins primary, 39 addressable; +430–498 optimism when Stockfish has us ≤ −300 in all five runs; own eval ≥ +100 at 45/59 decisive moves; four games lost without a single 200 cp blunder, all slow king attacks. Verify by the disagreement statistic (target: mean when SF ≤ −300 below +250) before the run. **+60–100 Elo over two tuning runs. Make this one next.**

2. **Time manager** (`search.rs::search`). (a) Order the previous iteration's best move first at the root (the TT does this) and, on a hard abort, keep the partial iteration's move if at least one root move completed with a score above the previous iteration's; (b) replace the fixed 40 % soft limit by a predictive one: start iteration d+1 only if `elapsed + t_d × r < hard`, with `r` the measured ratio of the last two iterations (bounded to [1.5, 3]); with (a) in place a wrong guess costs nothing, so the effective limit becomes ~60–70 %; (c) touch every page of the table at startup (write, not just allocate) and use `reserve = max(25 ms, t/20)` so the 0.25 s runs keep 50+ ms to the crash line; (d) keep the node-count check at 1024. Evidence: 19–20 % of the budget unused on 52 % of moves, ≥ 22 % discarded on 41 %, hard-aborted moves one ply shallower, 28/59 decisive moves soft-stopped, 12 overshoots up to 0.286 s. **+30–50 Elo**, more once the merged search's per-iteration ratio is below 3.

3. **Material-greed guard: safe-square mobility and poisoned-pawn test** (`eval.rs`, cheap version). Count safe squares (not attacked by a lower-valued piece) for queen, rook and minors: −60 at ≤ 1 (−120 in the enemy half); a queen or knight on the enemy's a/b/c/h files with ≤ 1 safe retreat and its own king under ≥ 1 attacker: extra −40. Evidence: 9 primary / 16 addressable (Qxa5, Qxa7, Qxb2 ×2, Qxg7, Qxc2, Qxe7, Nxh7, Nxa1, the trapped Bb3 and the Qc3 fork). **+20–40 Elo.**

4. **Endgame: passed pawns and drawn-ending scaling** (`eval.rs`). Passed-pawn bonus by rank (eg-weighted, roughly 10/20/40/70/120/200 from rank 3 to 7), full only when the front square is not attacked, +20 for own rook behind, and in pawnless-ish endings a king-distance term to the front square; plus scale the whole eval to ~0 for K+minor v K, K+2N v K, and by 1/4 for opposite-bishop endings with ≤ 2 pawns. Evidence: 8 primary (7308d5b g3 a-pawn never pushed, g11 and g22 rook endings, s1 g12; 36032fd g24 and s1 g19 ended K+N v K at own +381/+352; s1 g17 363 plies in a dead bishop ending). **+20–30 Elo**, mostly conversions of slipped wins.

5. **Simplification bonus when ahead** (`eval.rs`): when the material balance after the terms above is ≥ +150 cp, add `advantage × (pieces off) / 64`-style bonus for exchanging queens, mirrored as a penalty when behind. Evidence: 7308d5b g6 27...Qa5? (Qxc2), g3 36.Qb6? (Qxd7+), g25 21.Qxd2?? (Qe4 offering the trade); the grandmaster's item 4. Small and cheap; **+10–20 Elo.** Not recommended: contempt (13 of 16 draws were rescued from ≤ −487; the other three were forced or drawn endings the engine mis-scored).

Process note, not a code change: treat `36032fd` as kept. It is a pure speed change (identical eval, 2.5 → 6.1 M nps, identical node counts per depth), the discard was a noise decision (z = 0.78 against a run that is itself ~+60 above its family mean), and the merge should carry the incremental evaluation so the king-safety terms in item 1 do not cost the ply back.
