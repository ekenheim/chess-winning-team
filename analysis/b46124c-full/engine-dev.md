# Engine-developer review of `03fdcdc` (0.25 s, king safety) and `b46124c-full` (5 s, before it)

- `b46124c-full`: 5 s/move vs Stockfish 19 @1700/1800/1900, 25/4/1, Elo 2197 ±209, avg depth 14.2, 66 % of the budget used. Search as in 73fbb69, tapered material + PST eval, no king safety.
- `03fdcdc` (commit 55375f9): 0.25 s/move @1900/2000/2100, 21/5/4, Elo 2234 ±154, avg depth 11.5, 63 % used. Same search; eval adds `king_danger` (pawn shield 18 cp per missing pawn + a convex table over king-zone attackers, gated on ≥ 2 attackers and an enemy queen).
- Evidence: `analysis/<run>/analysis.json` joined with `games/runs/<run>/moves.jsonl` (engine plies: 1524 / 1373 / 1467 for 03fdcdc / full / 73fbb69), python-chess replays for repetitions and material. No engine was run (a full-rate bench holds the binary). The 73fbb69 report already specified the time-manager fix; section 4 only confirms its numbers at 5 s.

## 1. Draws: no repetition was accepted from a good position, so no contempt rule converts any of them

The "≥ +1.5 at some point" label comes from a peak 40–80 plies before the repetition. At the repeating move the engine's own score was deeply negative in all six games, and Stockfish agreed. Scores are from the engine's side; "engine before rep." is its `score_cp` on the 4–6 plies preceding the first repeating move (the repeating moves themselves score 0 by the `is_repetition` rule).

| game | peak SF (ply) | engine there | engine before rep. | SF before rep. | material at rep. | verdict |
|---|---|---|---|---|---|---|
| 03fdcdc 26 (B @1900) | +186 (32) | +99 | −76, −87, −135, −156 (plies 100–108), then 0 | −380 … −526 | +1 pawn | rescue |
| 03fdcdc 27 (W @2000) | +189 (59) | +179 | −101, −123, −130, −139, −135, −157 (121–131) | −332 … −435 | −2 | rescue |
| 03fdcdc 29 (W @2100) | +385 (57) | +245 | −1482, −1637, −1827, −1827 (125–131) | −1300 … −1860 | −11 | rescue |
| full 15 (W @1800) | +202 (27) | +244 | −486, −492, −498, −488, −498, −475 (175–187) | −450 … −476 | −1 | rescue |
| full 21 (W @1800) | +251 (54) | +206 | −1125 … −1254, then `None` (mate seen) | −760 … −1000 | −2 / −9 | rescue |
| 03fdcdc 10 (B @2000) | +3 (11) | — | −799, −726, then mate scores | −990 | — | rescue (perpetual) |

- The search's `repetition = 0` rule did its job in every case: it found a perpetual or a shuffle from −1 to −18 pawns. A draw score of `−x when ahead` (contempt in `negamax`'s repetition/50-move return, gated on static eval or material) would have fired in **none** of the six: at the repetition the static eval and the search score were both negative except game 26, where a material gate (+1 pawn) or a static-eval gate (about +100) would have refused a draw that Stockfish scores −490, i.e. turned a half point into a loss under the Elo keep rule (the same under the win-only rule, where both are 0). Under both rules the conversion count is zero. This is the fifth consecutive run where contempt has no case (498eace, 7047219-full, 36032fd, 73fbb69, now these two); stop listing it.
- The wins slipped much earlier, in the middlegame, by the same two mechanisms the losses show:
  - **g26** plies 44–58 (d7–d9, 0.12–0.24 s): engine +100 … +176 with material +1/+2 while Stockfish fell +136 → −378 (Nb6 −136, Nxd5 −148, Be3 −168); king-side pieces went for pawns while its own king's cover was traded off. Eval optimism with queens on.
  - **g27** plies 57, 59, 61 (a3, Nfe2, Bc1: −206, −219, −164), all **depth 8, soft-stopped at 0.107–0.205 s** with half the budget unused; the engine stayed at +112 … +179 while Stockfish went +185 → −195. Depth and time.
  - **g29** plies 59–63 (Qc2, Qb1, Qd3: −196, −141, −236) at depth 8 (two of them aborted at 0.236 s), engine +208 … +265 while Stockfish went +337 → −102; then 71 f3?? (−382, d11, aborted). Depth, time, and +300 optimism.
  - **full g15** ply 35 Nxd6+ (d11, aborted at 4.751 s): engine +216, Stockfish +169 → −223 → −347 two plies later (37 Rxd6, −167). The engine kept +30 … +50 for 20 plies while Stockfish had −370 … −500: its king on g1 with the h-file open and no shield. King safety was the missing term in this run, which predates it.
  - **full g21** ply 58 Rb1 (d15, aborted, −198: +138 → −60) then 10 plies at engine +130 … +254 vs Stockfish 0, and 80 Rdd1 (−234, d13). Rook-endgame technique at +2 pawns: passed-pawn and king-activity knowledge, not contempt.

## 2. Cost of king safety: −9 to −13 % nps with queens on, no depth lost, middlegame optimism −40 %

Both fast runs are 0.25 s on the same host. Per-move means from `moves.jsonl` (the summary's 3.55 M / 3.77 M figures are totals that include the tiny forced-move searches):

| phase | 73fbb69 nps (M) | 03fdcdc nps (M) | Δ | depth 73fbb69 → 03fdcdc | nodes/move (k) 73fbb69 → 03fdcdc |
|---|---|---|---|---|---|
| opening | 4.74 | 4.10 | **−13.5 %** | 9.67 → 9.41 (−0.26) | 670 → 573 |
| middlegame | 4.60 | 4.20 | **−8.7 %** | 9.48 → 9.73 (+0.25) | 601 → 561 |
| endgame | 4.50 | 4.42 | −1.8 % | 11.66 → 13.72 (longer, more forced endings) | 556 → 554 |

By material: ≥ 24 pieces with queens 4.71 → 4.09 M (−13 %); 16–23 pieces without queens 4.71 → 4.50 (−4 %, n = 49, noise); 8–15 without queens 4.49 → 4.48 (0 %). The early return when the enemy has no queen works; the cost is the two-colour `king_danger` at every `evaluate` (every quiescence stand-pat and every null-move test), about 40 ns of a 240 ns node. The full run at 5 s (no king safety) ran 4.4–4.7 M with the same profile, so nothing in the host changed between the fast runs. Depth did not fall measurably (−0.26 opening, +0.25 middlegame: within the noise of position type), because 10 % nps is 0.15 ply at EBF 2.2.

Eval optimism (engine `score_cp` − Stockfish, engine's side, |SF| ≤ 600), mean / median:

| phase | 73fbb69 all | 73fbb69 losses | 03fdcdc all | 03fdcdc losses | full (5 s) all | full losses |
|---|---|---|---|---|---|---|
| opening | 0 / +2 | +21 / +34 | +9 / +10 | +14 / +20 | −1 / −2 | +38 / +19 |
| middlegame | **+123 / +78** | **+259 / +233** (n = 95) | **+73 / +53** | **+171 / +197** (n = 50) | +95 / +72 | +209 / +155 |
| endgame | +20 / +11 | +455 (n = 7) | +239 / +228 | +180 / +170 | +151 / +159 | — |

Middlegame optimism fell by 40 % overall and by a third in the losses, at a higher opponent level (2000 vs 1800 average). The endgame figure is not a king-safety effect (the term is off without a queen): 207 of the 500 endgame plies are games 23 and 24, where the engine held +300 … +611 in dead-drawn endings that Stockfish scores exactly 0 (63 plies with SF = 0 and engine ≥ +300; 73fbb69 had 2 such plies). Excluding those two games the endgame optimism is +146 / +149, the same shape as the full run's +93 / +78 without game 18: no passed-pawn, king-activity or drawn-ending knowledge, only the PST's +90 for a 7th-rank pawn.

What the term still misses, in the two 2000-level losses that were not time-manager losses (section 4):
- **g16** plies 26–28 (bxa2 −164, gxf6 −385, d9/d10): engine +149 with Stockfish +11 → −538. Black Kg8, white Qh5, Bh4, Nd2, pawn f6. Only the queen reaches the king zone, so `attackers = 1` and the DANGER table is gated to 0; after gxf6 the shield count is 1 missing = 18 cp. Stockfish's −538 is Qxh6 and the open g-file.
- **g15** plies 43–45 (Nb3 −306, Nxc5 −364, d9/d10): engine +142 / +93 with Stockfish −152 / −321. White Kg1, no g/h pawns (g6 is far advanced), black Rh8 on the open h-file, Qe8 to h5 next. One attacker (the rook) → 0 danger; shield 2 missing = 36 cp. Real deficit about 300 cp.

The `attackers >= 2` gate is the weakness: a queen (or a rook on an open file next to the king) alone is the attack at this level. Section 5, item 3, gives the replacement.

## 3. Game 23: the engine thought it had a bishop and a pawn (+6.1), in a wrong-bishop ending that is a book draw

Timeline (engine white, @2100):
- Ply 46: Stockfish +328, engine +141 (K+R+B+N+pawns each; the engine undervalues its own bind, the pattern from 73fbb69's game 10).
- Plies 52–72: Bf2 (−128), Nf7 (−100), Re3 (−102), Ne5 (−86), cxb5 (−46), bxc6 (−55), all at depth 9–14: the engine's score rose +160 → +302 while Stockfish went +321 → 0. It traded rooks and pawns into K+B+N+P v K+B (`2k5/1p6/2Pb4/4N3/P4B1p/3K3p/8/8`, ply 74, engine +302, SF −9).
- Ply 86 on: K + dark-squared bishop (c3/f4) + a-pawn v K (`8/8/2k5/P3K3/8/2B5/8/8`, ply 100). The a8 corner is light, the bishop is dark, the black king reaches a8/b7: a dead draw. The engine scored it **+584 … +611** for 120 plies (bishop 330 + pawn 100 + endgame PST for the pawn on a7 and centralised king), Stockfish 0 throughout.
- Ply 210 (halfmove clock 81): the 50-move draw came inside the horizon and the score fell to +404 = K+B v K after a8=Q Kxa8, which it also does not know is a draw. Ply 226 a8=Q+ Kxa8, insufficient material.

Winnable? Stockfish still had +210 at ply 68 and +117 at ply 70 (K+B+N+2P v K+B+P); the loss happened over plies 52–74, when every simplification looked like progress to an eval with no drawn-ending knowledge. Game 24 is the same gap in a won game: 43 plies at engine +302 … +420 in a blocked opposite-coloured-bishop ending Stockfish scores 0 (`8/3b4/6p1/2pk1p2/p1p1p3/K1P1B1P1/5P2/8`); the @2100 opponent later blundered and lost, which will not happen at 2200.

Fix (`eval.rs`, end of `evaluate` before the side-to-move flip, on the White-relative score): a `draw_scale` for the stronger side: (a) no pawns and non-pawn material ≤ one minor (KB v K, KN v K, KNN v K) → score 0; (b) the stronger side's only pawns are rook pawns, its only piece is a bishop that does not control the promotion corner, and the defending king is within one square of the corner or on the pawn's path → score 0 (in 03fdcdc that is every position from ply 86 on, and it would have kept the rook on at ply 52); (c) opposite-coloured bishops with no other pieces → score / 2; (d) no pawns and non-pawn material advantage < a rook → score / 4. About 50 lines, no cost outside the endgame (gate on `phase < 6`), verifiable on the four FENs above without games.

## 4. Time manager at 5 s: the 73fbb69 numbers hold unchanged

`search.rs` 153–197: hard limit = 5.0 − max(15 ms, 5 %) = **4.75 s** (abort mid-iteration, iteration discarded, `root_move` never set); soft limit = 0.4 × 5 = **2.0 s** (no new iteration after it). Measured over the 1373 engine moves of `b46124c-full`:

| | moves | share | elapsed | completed depth | lost |
|---|---|---|---|---|---|
| soft-stopped (iteration completed, no new one started) | 990 | 72 % | avg 2.74 s | 14.2 | **2.01 s unused per move (42 % of the hard limit)** |
| aborted at the hard limit | 383 | **28 %** | 4.75 s | 14.2 | last useful iteration ended before 2.0 s: **≥ 2.75 s (58 %) of the move went into a discarded iteration** |

Useful search time ≤ 2.53 s of 4.75 (53 %); the 66 % headline counts the discarded iterations. Soft-stop elapsed quantiles 10/25/50/75/90 %: 0.28/0.45/0.55/0.70/0.82 of the budget (the 0.28 tail is mate scores); 24 % of soft stops ended by 0.45 × T, where one more full iteration fits at EBF 2.2. At 0.25 s (03fdcdc) the same table reads 19 % aborted, 0.095 s (40 %) unused on soft stops, useful ≤ 56 %. The abort share is higher at 5 s (28 % vs 19 %) because iteration times are larger relative to the 15-ms clock granularity, not smaller: the rule is the problem, not the constant.

Two 5-s-specific items on top of the fix already specified (search to the hard limit; keep the best root move of an aborted iteration once the hash move has been searched at full depth): the reserve is 250 ms at 5 s (max move 4.755 s, crash limit 5.10 s), so capping it at 50 ms is +4 % for free; and `NODE_CHECK_MASK = 1023` is 0.25 ms per check, fine at both controls.

What it costs in games: both 03fdcdc losses from won positions were aborted-iteration moves at depth 8: **g4 ply 40 Qxf6?? (−600, 0.236 s, engine +482, SF +600 → 0)** and **g5 ply 37 hxg4?? (−584, 0.236 s, engine +591, SF +584 → 0)**. Depth-8 non-endgame moves in 03fdcdc: 184, of which 144 were soft-stopped with 0.101 s unused on average, and 40 aborted; those 40 hold 5 of the 10 depth-8 blunders (12.5 %). Blunder rate by completed depth in balanced positions (|SF| ≤ 300, non-endgame): d8 4.9 %, d9 3.1 %, d10 1.2 %, d11 1.4 %, d12+ 0 %. Aborted moves in the opening/middlegame blundered at 6.7 % (ACPL 53) against 2.3–3.1 % (ACPL 30–34) for soft stops.

## 5. Prioritised code changes

1. **Time manager** (`search.rs` `search` / `negamax` ply 0), exactly as specified in the 73fbb69 report, plus the 50-ms reserve cap. Evidence: 47 % of the budget dead at both 0.25 s and 5 s, 28 % of 5-s moves discard ≥ 2.75 s, losses g4/g5 and slips g27/g29 were depth-8 moves. Verify: avg depth +0.6 at 0.25 s in a fixed-position timing run, 0 timeouts, max move ≤ 0.26 s / 4.96 s. **+40–60 Elo.**
2. **King safety v3** (`eval.rs` `king_danger`): replace the attacker count by attack units on the zone squares (each zone square attacked by N/B 2, R 3, Q 5, summed over squares, so one queen hitting three squares is 15) and drop the `attackers >= 2` gate; add −20 mg for an open file and −10 for a half-open file on the king's file or adjacent (game 15's h-file, game 16's g-file); keep the enemy-queen gate. Evidence: g15 plies 43–45 and g16 plies 26–28 (+300 optimism, both scored ≤ 36 cp by the current term), full g15 ply 35, g26 plies 44–58. Verify: middlegame-loss optimism +171 → < +100 on this run's positions; nps within 3 % of 03fdcdc. **+30–50 Elo.**
3. **Drawn-ending recognition** (`eval.rs`, section 3): KB/KN/KNN v K = 0, wrong-bishop rook pawn = 0, opposite bishops ÷ 2, pawnless small advantages ÷ 4. Evidence: g23 (draw at +611), g24 (43 plies at +300 in a 0), 36032fd/7308d5b's K+N v K draws. Verify on the FENs. **+15–30 Elo** (one draw in 30 becomes a fight, and it stops trading into them).
4. **Aspiration windows + root ordering by previous scores** (`search`): ±30 from depth 5, widen ×2, then full. Evidence as in 73fbb69; pairs with item 1 since partial iterations get cheaper. Verify: nodes to depth 10 −20 % with the same moves. **+20–40 Elo.**
5. **Passed pawns and endgame king activity** (`eval.rs` endgame side): rank-scaled passer bonus (10 … 120), free-path bonus, king-distance term; endgame optimism +146 excluding the dead draws, full g21's rook ending at +2. **+20–40 Elo.**

**Next after the time manager: king safety v3 (item 2).** It is the only item with two 2000-level losses and three slipped wins behind it in these runs, the current term demonstrably scores those positions at 18–36 cp against a 300-cp deficit, and the change is a formula swap inside a function that already exists, so its nps cost is known (section 2). Item 3 is the cheap, certain runner-up and can follow in the next run; it fires only in near-pawnless positions, so it will not confound the king-safety measurement.
