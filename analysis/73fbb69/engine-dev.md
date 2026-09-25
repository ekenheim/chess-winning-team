# Engine-developer review of `73fbb69`

Run: 30 games at 0.25 s/move vs Stockfish 19 @1700/1800/1900, 24/2/4, Elo 2092 ±169, avg depth 10.4, 3.77 M nps in games (bench ~5 M idle). Search = TT + null move + LMR + PVS + killers/history + check extension + in-check quiescence; eval = tapered material + PST, recomputed from scratch per call. All figures below are from `analysis.json` / `moves.jsonl` (1467 engine moves), no engine was run.

## 1. Time: 47 % of the budget does no useful work

What the manager does (`search.rs` 153–197): hard limit = 0.25 − max(15 ms, 5 %) = **0.235 s** (abort mid-iteration, result discarded); soft limit = **0.4 × 0.25 = 0.10 s** (don't start a new iteration after it). `root_move` is only written when the ply-0 loop finishes, so an aborted iteration contributes nothing except TT entries.

Measured:

| moves | share | time used | completed depth | comment |
|---|---|---|---|---|
| iteration completed, stopped by soft limit | 1173 (80 %) | avg 0.139 s | 10.1 | **0.096 s (41 %) unused** per move |
| aborted at hard limit (≥ 0.225 s) | 294 (20 %) | 0.236 s | 9.8 | last useful iteration ended before 0.10 s: **≥ 0.135 s (57 %+) wasted** |

Useful search time ≈ 0.125 s of 0.235 s = **53 %** (the 63 % headline counts aborted iterations as used). Iteration-time ratios are wide (completions land anywhere in 0.10–0.23 s and 20 % abort, so t(d+1)/t(d) ranges ~1.3–6): a "complete iterations only" policy cannot use the budget whatever the soft fraction is. A predictive rule alone (start d+1 iff elapsed + r̂·t_d ≤ hard) mostly *reallocates*: it removes the 20 % aborts but rarely adds an iteration (with r̂ = 2 an extra iteration fits only for completions ≤ 0.118 s; the 0.40 cutoff already assumes r ≈ 2.5). Net ≈ 0.

The rule that uses the time is the classical fixed-movetime one:
1. **Root best-so-far**: at ply 0, set `root_move` whenever a fully searched root move raises alpha (the `if self.stopped { return 0 }` after the child search already guards against scores from aborted subtrees). On abort, keep it: the hash move has been searched first at full depth, and a later move only replaces it after the PVS re-search confirms it.
2. **Then search to the hard limit** (soft = hard, or start d+1 iff elapsed + 0.5·t_d ≤ hard so the first root move can finish).
3. Reserve: 15 ms at 0.25 s is right (max 0.254 s this run, crash limit 0.35); at 5 s the reserve is 250 ms — cap it at ~50 ms (+4 % at the real rule).

Effect: useful time 0.125 → ~0.22 s (×1.75) = **+0.8 ply at EBF 2, +0.6 at EBF 2.5**. Balanced-position (|SF| ≤ 3) quality by completed depth this run: ACPL d8 39, d9 50, **d10 22**, d11 20, d12 15, d13 10; blunder rate d9 4.8 % → d10 0.9 % → d12+ 0 %. One ply is worth about −25 % ACPL here. Depth 127 in 11 moves is cosmetic: all are forced-repetition roots (score 0) where every iteration costs a few hundred nodes; they took ≤ 0.04 s.

## 2. The losses are eval failures, with two horizon cases

Eval optimism = engine score − Stockfish (engine side), balanced-ish positions (|score| ≤ 6): mean **+62 cp** overall (median +27); opening ±0, **middlegame +121 (median +77)**, endgame +16. By material balance: even +35, engine +1 pawn **+64**, +2 pawns **+90**, engine −1 pawn **+218** (n = 37). The engine counts material correctly and is blind to what the opponent gets for it.

| game (seat) | collapse ply, move, depth | SF before → after (engine side) | engine − SF, 20 plies before | engine sees it after | class, missing term |
|---|---|---|---|---|---|
| 2 (B, @1700) | 44 Rf8 d9 | −51 → −302 | +91 | never (still +2.1 six plies on) | **eval**: Qb1/Be4 battery on h7, Rh1 on the open h-file next to Kg8 |
| 2 | 60 g6?? d9 | 0 → −529 | **+299** (max +703) | 4 plies | **eval**: Kf7 with Q+2R nearby, 3 pawns up: king safety |
| 10 (B, @1800) | 24 Nxb2 d10 | +474 → 0 | −76 (under-values its own bind) | never (+230 for 20 plies at SF 0) | **eval**: outpost/activity; pawn-up positions over-counted |
| 10 | 50 g5 d10 | −231 → −520 | **+327** | 2 plies (208 → −258) | **horizon** (quiet attack Qf6/Bxe6 needs +2 ply) + king shelter |
| 15 (W, @1800) | 39 bxa4 d9 | −2 → −70 | +65 → +156 on the capture | never | **eval**: doubled isolated a3/a4 pawns, b-file handed over |
| 15 | 59 Qf4 d9 | −32 → −264 | **+201** | 6 plies (175 → −157) | **eval**: shelter wrecked by g4/h3, pawn up counted at face value |
| 16 (B, @1800) | 24 bxa4 d9 | −25 → −217 | +32 | 6 plies | **horizon/eval**: pawn recaptured 6 plies later, a6 isolated |
| 16 | 60 g5 d9 | −204 → −481 | **+226** | never (0 to +25 for 10 plies) | **eval**: Kh8 shelter, passive pieces vs Qe4/Nc4 |
| 23 (W, @1900) | 56 b4 d10 | −159 → −425 | +88 | 2 plies | **eval**: weak e4/g4, Ng5+Re5 pressure |

7 of 9 decisive moves are eval blindness (the engine's own score stays ≥ +1.5 for 4–20 plies while Stockfish is at −2 to −7); 2 are horizon (2 plies short). King safety is the term in 5 of 9, pawn structure in 2, piece activity in 2. Both draws were **rescues** (game 12 repeated at −11, game 23 at −8, both vs @1900): no win was thrown away by repetition this run. Game 23's "slipped" label rests on a +1.55 peak at ply 34.

## 3. Speed: what an O(1) eval buys, and a cheaper find

Node cost = 1/3.77 M = 265 ns in games (200 ns on the idle bench). `evaluate` is called at every quiescence node not in check and at every non-PV interior node with depth ≥ 3 (null-move test): ~0.7 calls per node. Its loop is 2 colours × 6 piece types × bitboard iteration, ~3–4 ns per piece + 12 loop set-ups ≈ 110–130 ns with 32 pieces, ~50 ns with 12. Estimated eval share: **~30 % of node time in the middlegame, ~15 % in endgames**. Incremental update (36032fd's `state_after`: 1–2 piece deltas + one taper) costs ~10–15 ns per make, so the net is nps ×1.25–1.35 middlegame → **+0.3–0.4 ply at EBF 2–2.5, ≈ +15–25 Elo**. The earlier "+1.2 ply" for 36032fd is not evidence: its baseline (run c3a8a8b, 1.46 M nps, 33 moves within 3 % of the limit) was a contended host; clean baselines sit at 3.9–4.0 M nps, the incremental runs at 3.7 M / 2.6 M. Nothing was measured. Only `make profile` on an idle host (identical node counts, higher nps) can.

A cheaper speed bug: nps falls with game length inside one phase — endgame plies 30–59 **4.28 M**, 60–89 3.88 M, 90–119 3.62 M, 150–179 **3.23 M** (−25 % while the eval is getting cheaper). `is_repetition` (`search.rs` 247) scans the whole game history at every interior node: ~170 comparisons at ply 170. Limit the scan to `board.halfmove_clock()` entries (exact: nothing before an irreversible move can repeat). Same for `ordered_moves`' `Vec::with_capacity(48)` + sort per node, including quiescence: a fixed `[(Move, i32); 256]` array with selection sort is the standard fix. Speed package total: ~×1.4–1.5 nps → +0.5 ply.

## 4. Highest-value next change

Ranked by expected Elo per unit of risk, with the numbers:
- **Time (root best-so-far + search to the hard limit)**: +0.6–0.8 ply from 47 % dead budget; ~−20 % ACPL per ply in balanced positions; 30 lines; verifiable without games (avg depth 10.4 → ~11.1 at 0.25 s, no timeouts). **+40–60 Elo**, multiplies every later change, applies identically at 5 s.
- King safety: 5 of 9 collapse moves and all 4 losses show +200–330 cp optimism next to an exposed king. Converting half the losses = +2 wins/30 ≈ +45 Elo, but the term costs 8–12 % nps and is a tuning problem; the v2 attempt was discarded at 2075±251 vs 2326±486 on a saturated 1600 ladder, which is noise, not evidence against it.
- Aspiration windows: −20–30 % nodes per iteration at depth ≥ 6 → +0.3 ply ≈ +20–30 Elo; pairs with (1) since partial iterations get cheaper.
- Incremental eval: +15–25 Elo alone; below the ±150 resolution unless bundled with the repetition and allocation fixes.

The single next change is **time management**: it is the largest gain that can be verified before a run, with no tuning and no nps cost.

## Prioritised code changes

1. **Use the whole budget** (`search.rs` `search`/`negamax` ply 0). Set `root_move = Some(mv)` whenever a completed root move raises alpha; drop the 0.4 soft limit (start d+1 while elapsed + 0.5·t_d ≤ hard); cap the reserve at 50 ms. Evidence: 53 % useful time, 20 % aborted iterations, ACPL d9 50 → d10 22. Verify: avg depth +0.6 or more in `make profile`-style timing at 0.25 s, 0 timeouts, `max_move_seconds` ≤ 0.26. **+40–60 Elo.**
2. **King safety** (`eval.rs`, middlegame side of the taper): pawn shield in front of the castled king (−15/−30 per missing/advanced pawn), open or half-open file adjacent to the king (−20), attackers into the king zone counted by piece (N/B 2, R 3, Q 5 → squared table capped at −300), scaled by the opponent's non-pawn material so it vanishes in endgames; branchless bitboard ops (see the dd6c58b review). Evidence: games 2 (plies 44, 60), 10 (50), 15 (59), 16 (60). Verify: middlegame optimism +121 → < +60 on this run's positions. **+40–80 Elo.**
3. **Aspiration windows + root ordering by last scores** (`search`): window ±30 around the previous score from depth ≥ 5, widen ×2 on fail, full window on the second fail; sort root moves by the previous iteration's scores. Verify: nodes to depth 10 −20 % with the same best moves. **+20–40 Elo.**
4. **Speed package**: repetition scan limited to `halfmove_clock()` (nps −25 % in long endgames), fixed-array move list without allocation, then 36032fd's incremental tapered eval on top. Verify: `make profile` nps ×1.4 at identical node counts. **+20–35 Elo.**
5. **Pawn structure**: doubled (−12), isolated (−15 mg / −20 eg), passed pawns rank-scaled (10…120 eg, free path bonus). Evidence: games 15 (ply 39) and 16 (ply 24), engine −1-pawn optimism +218. **+20–40 Elo.**
