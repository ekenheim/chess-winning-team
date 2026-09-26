# Engine-developer review of `c9cb33a` (0.25 s, new time manager) and `55375f9-full` (5 s, king safety, old time manager)

- `55375f9-full`: 5 s/move @1900/2000/2100, 27/0/3, Elo 2397 ±209, avg depth 13.1. Search as in 03fdcdc, king safety in, soft limit 40 %, aborted iterations discarded.
- `c9cb33a` (commit 555bcaf): 0.25 s/move @2100/2200/2300, 21/3/6, Elo 2400 ±146, avg depth 10.8. Same eval; soft limit 60 %, the best root move of an aborted iteration is played once it was fully searched, reserve 15–50 ms.
- Evidence: `analysis/<run>/analysis.json` joined with `games/runs/<run>/moves.jsonl` (engine plies 1534 / 1346, and 1524 for 03fdcdc, the 0.25 s run with the old manager), python-chess replays of the PGNs. No engine was run (the full-rate bench holds the binary); the speed figures in section 2 are estimates from the commit history to be checked with `make profile`. The 03fdcdc report's items (king safety v3, draw scaling, aspiration) are referenced, not repeated.

## 1. Time manager: the budget is now used, but completed depth did not move; two riders remain, then it is done

Per-move times and completed depth, engine moves, both 0.25 s on the same host:

| | 03fdcdc (soft 40 %) | c9cb33a (soft 60 %, partial kept) |
|---|---|---|
| seconds, quantiles 10/25/50/75/90 % | 0.106 / 0.121 / 0.150 / 0.202 / 0.236 | 0.158 / 0.179 / 0.226 / 0.236 / 0.236 |
| mean, max | 0.158, 0.240 | 0.201, **0.2406** (hard limit 0.235 + 5.6 ms pipe; 109 ms below the 0.35 s crash limit) |
| aborted at the hard limit | 253 (17 %) | **715 (47 %)** |
| soft stops, elapsed / budget quantiles | 0.42 / 0.47 / 0.55 / 0.68 / 0.81 | 0.605 / 0.647 / 0.728 / 0.813 / 0.884 |
| budget unused on soft stops | 93 ms per soft stop | 64 ms per soft stop, **9.6 % of all budget** |
| depth opening / middlegame / endgame | 9.41 / 9.65 / 14.29 | 9.54 / 9.68 / 12.31 |
| depth histogram (d8 / d9 / d10 / d11 / d12) | 162 / 333 / 347 / 209 / 105 | 174 / 350 / 359 / 250 / 137 |

- **Completed depth is unchanged** (+0.13 opening, +0.03 middlegame; the endgame figure is game mix: 501 endgame plies against 643, fewer long forced endings). The extra 43 ms per move (+27 %) went into partial iterations. This is arithmetic, not a defect: iteration d+1 costs about 2.2 × iteration d, so the last iteration that can still finish by 0.94 T must start before about 0.43 T, whichever soft limit is set. The old 40 % rule already caught almost all of those; the 60 % rule adds starts that abort.
- **What the partial iterations bought: 35 switched root moves** (4.9 % of the 715 aborts, 2.3 % of all moves). In those 35 the previous depth's move was Stockfish's best **0 times**, the move played was best 7 times; cp-loss mean 41, median 17, two blunders (g9 ply 45 Rfd1 −201, g12 ply 42 f5 −210). The switch rule (first root move fully searched at d+1, later moves only on a completed full-window re-search) is sound; nothing to fix. Three of the 35 are the first move of the Petroff (d3 → Nc3 at d10), the engine's only visible root nondeterminism.
- Aborted-unchanged moves against soft stops in balanced non-endgame positions (|SF| ≤ 300): blunder rate 2.2 % vs 0.6 %, ACPL 33.8 vs 28.2, depth 9.41 vs 9.77. Aborts happen in the bigger trees; this is selection, not a cost of the rule (the played move is the completed depth's choice in 95 % of them).
- Blunder rate by completed depth (same filter): d8 1.0 %, d9 2.4 %, d10 1.1 %, d11 1.0 %, d12 0 %; ACPL 44 → 32 → 31 → 16 → 15. At 5 s: d11 41, d12 32, d13 27, d14 22. About −20 % ACPL per ply.
- **Searching to the hard limit** (soft limit 100 %): 753 non-trivial soft stops; 112 stopped in [0.60, 0.64) T, where a first root move at d+1 (≈ 0.3–0.5 × elapsed) still completes; the 629 in [0.64, 0.94) T would rarely complete it. At the observed 5 % switch rate that is 1–3 changed moves per run: **+2–5 Elo**, no downside at fixed movetime (a partial that does not finish its first move changes nothing). Take it as a rider, not a run.
- **Reserve**: 15 ms at 0.25 s is 6 % of the budget for a measured 5.6 ms of pipe overhead. 8 ms at 0.25 s (and 30 ms at 5 s) is +3 % search time ≈ +0.05 ply. Rider.
- **Stopping early on a stable best move gains nothing**: `go movetime` cannot bank time, so an early stop only saves CPU. Do not implement it.
- **At 5 s** (old manager, `55375f9-full`, hard limit 4.75 s): 338 moves (25 %) aborted with the iteration discarded, soft stops at 0.43 / 0.47 / 0.58 / 0.71 / 0.84 of T, 23.7 % of the budget unused on top of the discarded iterations. The running `bench-full` on 555bcaf should show about 50 % aborts, 2–3 % switched moves, max move ≈ 4.96 s, and the same completed depth (13.1) for the same reason as above.
- **Arena rule the engine does not model** (`arena/util.py:286`, `is_game_over(claim_draw=True)`): a game ends when the side to move *could* reach a third occurrence. **Game 5** ended at ply 134 with the engine (white) at +269, Stockfish +196, because Kg2 would have repeated; the engine would not have played it (its own two-fold rule scores that child 0). None of the 134 moves repeated a position three times. The other claim-rule endings (g15 here, 03fdcdc g10/26/27/29) were rescues from lost positions. Fix in `negamax`: build the set of game-history hashes seen twice at `search` start (empty for most of the game); in the move loop, if `child.hash()` is in it, the node is a draw (return 0). Cost is one set lookup per move when the set is non-empty. **+5–10 Elo** (a half-point in 30 games under the Elo rule; under the win-only rule it is the win that g5 still had a fair chance of).

The `summary.txt` figure `avg_nodes_per_sec 2981514` is now an artefact: `nodes` is the last completed iteration's count while `seconds` includes the aborted one (47 % of moves). Per-move `nps` from the info line is 4.31 M mean, 4.27 M median (03fdcdc: 4.10–4.55 M). The engine is not slower.

## 2. Speed: the evaluation scan is still about half a node; an incremental state is worth +0.8–1.0 ply

Per-move nps (info-line figure, moves > 12 ms), c9cb33a: opening 4.17 M, middlegame 4.29 M, endgame 4.44 M. By material: queens on with ≥ 24 pieces 4.15 M (n = 494), 16–23 pieces 4.25 M, < 16 pieces 4.10 M; queens off 4.40–4.80 M. The full run shows the same profile (3.97 / 4.16 / 4.6 M with queens, 4.5–4.9 M without). King safety costs 25–30 ns of a 232 ns node (≈ 12 %), as in the 03fdcdc measurement; the early return without an enemy queen works.

Where the node goes. `evaluate` is called at every quiescence node (stand pat) and at every non-PV, non-check interior node at depth ≥ 3 (the null-move test), so roughly once per node. It walks 6 piece types × 2 colours × bitboards, two table lookups and three popcounts per position. The one clean measurement we have is the discarded commit 36032fd on the same tapered scan: `make profile` 4.2 M → 8.3 M nps, i.e. the scan cost 118 ns of a 238 ns node with the search of that day. The games of that pair are not usable (c3a8a8b's run averaged 2.54 M nps on a loaded host against 36032fd's 6.28 M; the bench figures are the ones to trust). Since then the search added NMP, LMR, killers, history and check extension, and the eval added king safety; the node is 232 ns in games (contended, 4 games in parallel; the bench figure is likely 180–200 ns). The scan is unchanged, so the incremental state removes about 100–120 ns per node, keeps king safety board-based (sliders; it stays inside `score()`), and leaves the node at 110–130 ns: **nps × 1.8–2.0**, node counts identical. At an effective branching factor of 2.0–2.2 that is **+0.8–1.0 ply**.

Elo per ply at this depth: the same binary at 0.25 s (03fdcdc, opening/middlegame depth 9.4–9.7) and at 5 s (55375f9-full, 12.8–13.1) on the same 1900–2100 ladder scored 2234 and 2397: +163 ± 260 for +3.4 ply, ≈ +50 per ply, matching the −20 % ACPL per ply above. So the incremental state is **+40–60 Elo**. The caveat is 3f28668: two pooled runs at depth 7–8 gave −65 ± 170 for +1.2 ply, which is noise but says the gate must be `make profile` (nodes identical, nps ≥ × 1.7) rather than one 30-game run. The code exists in 36032fd (`EvalState`, `state_after` with castling/en passant/promotion, and the `walk` equivalence test); it re-applies to the current search by threading `&EvalState` through `negamax` and `quiescence`, computing the child state next to `play_unchecked`, and adding `king_danger` inside `score()`.

Second speed item, node-identical and not asked about: `ordered_moves` allocates a `Vec` and fully sorts up to 40 moves at every interior node although most nodes cut at the first move. A fixed array with pick-best selection is +10–15 % nps. Bundle with the incremental state and measure once.

## 3. The nine non-wins: five eval, three search, one arena rule; the optimism grows with the opponent's level

| game | result @level | decisive plies | depth / time | engine vs Stockfish (engine's side) | cause |
|---|---|---|---|---|---|
| 5 | ½ @2300 (W) | 45 Qxg6 −481 | d8, aborted | +578 vs +490 → +9 | **search** (d8 at 2300); then 40 plies at +210…+260 vs 0 (R+R+N+B v Q+R+N) and a queen ending at +260…+390 vs 0…+120 (eval); ended by the claim rule at +269 / +196 |
| 6 | 0 @2300 (B) | 20 Qxc3 −195 (d8, soft 0.151 s), 22 h6 −157 (d7), 24 Qb4 −169 (d8); plies 26–56 | d9–11 | −31 … +73 vs −250 … −750 | **eval**: own king (Kh7/Kg6 against Q+R+B); 20 plies at +500 optimism |
| 13 | 0 @2100 (W) | 15 Ne1 −1610 | d10, completed | +171 vs −29 → −1639 | **search**: after the knight retreat, Qh4 and the mate on h2 (quiet moves; LMR/depth blind spot) |
| 15 | ½ @2200 (W) | 31–37 (Bd4, Bxg7, Bf6, Bxg5 −210) | d8–9 | +85 … +18 vs −131 … −454 | **eval**: own king; lost by ply 40, rescued by the claim rule |
| 17 | 0 @2300 (W) | 39 f3 −267, 41 gxf3 −431 | d9, d8, both aborted | +28 / −7 vs −72 / −349 → −780 | **search + eval**: king exposure on the g/h files not felt, tactic missed at d8 |
| 18 | 0 @2300 (B) | 36 Bxf5 −171, 38 Kh8 −100, 42 Kh7 −263; plies 26–42 | d7–10 | 0 … +72 vs −220 … −970 | **eval**: Qh5+Nf5+Nh4+Bf4 on Kg8 scores DANGER[9] = 178 and nothing else |
| 22 | 0 @2200 (B) | 41 Rbd8 −186 (d11), 45 Rd1 −164 (d10); plies 51–69 | d10–13 | +22 … +41 vs −209 … −637 | **eval**: Q+B v Q+N ending with a passed a-pawn and an exposed Kg6 |
| 24 | 0 @2300 (B) | 11 Nxf2 −194 (d8, aborted), 49 Qb2 −519 | d9, aborted | +335 vs +312 → −207 | **search**: d9 tactic at 2300 |
| 25 | ½ @2100 (W) | 81–99 pawn trades at +157 … +377 vs +6 … +10; 109 Bd5 −450 | d13–15 | +387 before and after | **eval**: R+B v R is a draw the engine scores +3.8; after Stockfish's Rf2?? it could not tell Bd5 from the winning Bf5 |

Search misses are all depth-8–10 moves at the 0.25 s limit against 2300 (g5, g24, g17) plus g13's quiet mating attack at a completed d10. The eval misses have one shape: **our own king under attack with queens on** (g6, g15, g17, g18: four games), and the endgame knowledge gap (g22, g25).

Eval optimism (engine `score_cp` − Stockfish before the move, engine's side, |SF| ≤ 600), mean / median:

| phase | 03fdcdc all (1900–2100) | c9cb33a all | c9cb33a losses | @2100 | @2200 | @2300 |
|---|---|---|---|---|---|---|
| opening | +9 / +10 | +20 / +20 (n = 278) | +45 / +28 | +8 / +26 | +31 / +26 | +18 / +15 |
| middlegame | +73 / +53 | **+129 / +108** (n = 477) | **+211 / +166** (n = 66) | +31 / +32 | **+166 / +130** | **+134 / +117** |
| endgame | +239 / +228 (two dead-draw games) | +121 / +147 (n = 259) | +215 / +257 | +107 / +114 | +160 / +190 | +91 / +123 |

Yes, the pattern persists and grows with the opponent: the same static features are punished harder by a 2200–2300 search. With queens on (|SF| ≤ 300): middlegame +133 / +118 (n = 290) against +66 / +75 without queens (n = 75); endgame with queens +205 / +227 (n = 87) against +90 / +74 without (n = 81). The queens-on excess is the attack on our king that `king_danger` undervalues: in g18 ply 36 the position `r3nrk1/2p2pp1/pbp1b2p/2q1PN1Q/3p1B1N/3P3P/P1P3P1/R4RK1 b` has four white pieces on the king zone and Stockfish −509; the term gives 178. The v3 formula from the 03fdcdc report (attack units per zone square, no attacker-count gate, open/half-open file next to the king) is the change these four games ask for. Endgame blunders: 22, of which 20 were in positions already decided (13 at ≥ +500, 7 at ≤ −500) and 2 result-relevant (g22 Kg6, g25 Bd5); the endgame package is about not trading into draws and converting sooner, not about blunders.

## 4. Ranking the next change

| change | Elo | evidence | verification without games |
|---|---|---|---|
| 1. King safety v3 (03fdcdc report, item 2) | **+30–60** | g6, g15, g17, g18 (three losses and a rescue at 2200–2300), queens-on optimism +133 / +205 | optimism on this run's positions < +80; nps within 3 % |
| 2. Incremental material/PST state (36032fd re-applied) | **+40–60** | section 2: × 1.8–2.0 nps, +0.8–1.0 ply, ≈ +50 per ply; three search losses at d8–10 | `make profile`: nodes identical, nps ≥ × 1.7; `walk` test |
| 3. Aspiration windows ±30 from depth 5, widen × 2, plus root ordering by last scores | +15–30 | 47 % of moves spend 0.34 T in an iteration that does not finish; 15–25 % cheaper iterations convert some of them into completed depth | nodes to depth 10 −15 % or more, same moves |
| 4. Eval package: passed pawns (rank-scaled, free path), rook on open/half-open file and 7th, endgame king centralisation/proximity, draw scaling (KB/KN v K, wrong bishop, R+B v R, opposite bishops ÷ 2, pawnless small edges ÷ 4) | +20–35 | g22, g25, g5's second half; endgame optimism without queens +90 / +74; only 2 of 22 endgame blunders were result-relevant, so most of the value is faster conversion and the two slipped half-points | the g25 FENs score ≤ +50; nps within 3 % (gate the terms on phase) |
| 5. Arena-claim-aware repetition (section 1) + soft limit 100 % + 8 ms reserve | +8–20 | g5 at +269; 9.6 % budget unused | none needed; max move ≤ 0.245 s |
| 6. Opening book from our won games | **+0–5** | Stockfish at 2100–2300 diverges from any earlier game at ply 0–3 of the EPD in every 6-game group (longest shared prefix 6 plies, typical 0–2); a book would apply for one or two moves; the opening losses (g13 ply 15, g24 ply 11) lie outside any repeated line | — |

Among the four asked about, the incremental state is the higher-value change (+40–60 against +15–30, +20–35 and +0–5), and it is the only one whose gate is a deterministic `make profile` figure. **The single change I would make next is king safety v3**: it is behind four of the nine non-wins at the ladder's current rungs, its failure is visible in a statistic that a 30-game run does measure (queens-on optimism), and it is a formula swap in a function whose cost is already known. The incremental state follows immediately, carrying riders 5 with it, since it is eval-identical and will not confound the king-safety measurement.

## 5. Prioritised code changes

1. **King safety v3** (`eval.rs` `king_danger`): attack units per zone square (N/B 2, R 3, Q 5, summed over squares, table indexed by the sum), no `attackers >= 2` gate, −20 mg open file / −10 half-open on the king's file and neighbours, keep the enemy-queen gate. Evidence: g6 plies 26–56, g18 plies 26–42, g17 plies 39–41, g15 plies 31–37. **+30–60.**
2. **Incremental `EvalState`** (36032fd's `eval.rs` code on the current `search.rs`; `king_danger` computed inside `score()`; `ordered_moves` to a fixed array with pick-best while there). Gate: `make profile` nodes identical, nps ≥ × 1.7. **+40–60.**
3. **Aspiration windows** at the root with re-ordering of root moves by their last score. Gate: nodes to depth 10 −15 %. **+15–30.**
4. **Claim-aware repetition** (`search`/`negamax`: set of history hashes seen twice; a node with a child in it is 0). Evidence: g5 ply 134 at +269. **+5–10.**
5. **Time riders**: soft limit 100 %, reserve 8 ms at 0.25 s / 30 ms at 5 s. Evidence: 112 soft stops in [0.60, 0.64) T, max move 0.2406 s. **+3–8**, take with item 4.
6. **Draw scaling and passed pawns** (`evaluate`, before the side flip, gated on phase): the g25 and 03fdcdc g23/g24 FENs, then rank-scaled passers with a free-path bonus and a king-distance term for g22-type endings. **+20–35.**
7. **Mate-threat extension**: when the null-move search fails low with a mate score against us, extend one ply. Evidence: g13 ply 15 (`r3k2r/1pp1npp1/p1pb1q2/4p3/4P1p1/2NPBN2/PPP2PP1/R2Q1RK1 w`, Ne1 at d10 scored +171 against a forced loss). Verify on that FEN at 0.25 s before a run. **+5–15.**
