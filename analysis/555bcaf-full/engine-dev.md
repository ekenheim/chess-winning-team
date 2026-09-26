# Engine-developer review of `555bcaf-full` (5 s, time manager: soft 60 %, partial iteration kept, reserve 50 ms)

- 5 s/move @2100/2200/2300, 19/7/4, Elo 2400 ±146, avg depth 15.4. Same search and eval as `c9cb33a`; compare `55375f9-full` (5 s @1900–2100, old manager, 27/0/3, Elo 2397).
- Evidence: `analysis.json` joined with `moves.jsonl` (1709 engine plies), python-chess replays of the PGNs, a Python replay of the current and the queued `king_danger` on this run's positions, and the 555bcaf binary (`engine/target/release/engine.exe`, built 3 min before the commit) re-run on 7 decisive FENs at 5 s and 20 s. The `c9cb33a` report's items are referenced, not repeated.

## 1. Time manager at 5 s: budget used, depth unchanged, 144 ms of headroom; the lever now is iteration cost, not the limits

| | value |
|---|---|
| seconds, quantiles 10/25/50/75/90 % | 3.20 / 3.87 / 4.95 / 4.95 / 4.95; mean 4.320, **max 4.9557** |
| stopped by the hard limit (4.950 s) | **944 (55 %)**; overshoot past 4.950: median 0.8 ms, 90 % 1.2 ms, max 5.7 ms |
| soft stops (3.0–4.94 s) | 697 (41 %), elapsed 3.13 / 3.38 / 3.83 / 4.33 / 4.67; unused 1.14 s each = **9.3 % of all budget** (c9cb33a: 9.6 %) |
| early stops (< 3 s) | 68 (4 %), all proven mates at d2–14 |
| completed depth opening / middlegame / endgame | **13.0 / 13.0 / 18.1** (55375f9-full: 12.8 / 13.1); histogram d12 231, d13 310, d14 277, d15 218 |
| per-move nps (info line) | 4.41 M mean, 4.32 M median (`summary.txt`'s 2.60 M is the known artefact: nodes of the last completed iteration over the full time) |

- **Integrity margin**: the hard limit is 4.950 s and the pipe adds ≤ 5.7 ms, so the worst move sat 144 ms under the 5.10 s limit. The 50 ms reserve is 9× the measured overshoot on this host. 25 ms would be safe by 119 ms and buys +0.5 % search time (≈ +0.01 ply): a rider, not a run. Do not go below 20 ms; the 4-games-in-parallel bench is the load case and the 5.7 ms tail is from it.
- **Where the aborted 55 % go**: in aborted moves the last completed iteration ended at 0.34 / 1.10 / 1.86 / 2.47 / 2.78 s (10/25/50/75/90 %), mean 1.74 s, so the aborted iteration itself consumed 3.2 s on average: **35 % of the whole run's budget**. Half the aborts started from a cumulative 1.86 s and still did not finish in the remaining 3.1 s (iteration ratio > 2.7), a quarter started from ≤ 1.1 s (ratio > 4.5). That variance (full-window root fail-highs/lows, odd–even swings) is what aspiration windows and root ordering by the previous iteration's scores reduce; moving the soft limit cannot.
- **Switched root moves**: 32 of the 944 aborts (3.4 %; 1.9 % of all moves). The previous depth's move was Stockfish's best 9 times (3 of them the same Ruy Lopez position at ply 3: O-O at d13 → Nxe5 at the d14 partial, −69 cp, games 13/15/17), the played move 4 times; cp loss mean 50, median 44, two ≥ 100 (g16 ply 104 a3 −179, g21 ply 22 Ra1 −217). Pooled with c9cb33a (0 vs 7, mean 41) the rule is neutral: 9 vs 11 over 67 switches. Keep it; it is free.
- **Quality by completed depth** (non-endgame, |SF| ≤ 300): ACPL d11 41, d12 37, d13 29, d14 24, d15 19; blunders 2.0 / 2.8 / 2.1 / 1.6 / 0 %. Still −15–20 % ACPL per ply, so speed is still Elo. Aborted vs soft-stopped moves: ACPL 32 vs 27, blunders 2.2 vs 1.7 % (selection: aborts are the big trees, and 97 % of them play the completed depth's move).

## 2. The seven draws: three rescues, three slipped wins, one fair; all six "rule" endings came from the arena's claim rule

python-chess at the final position: no game had a third occurrence on the board (`is_repetition(3)` false in all five "threefold" games) and g21 ended at halfmove 99; every one ended because the side to move *could* claim (`can_claim_threefold_repetition` / `can_claim_fifty_moves`), as `arena/util.py:286` checks.

| game | result @level | high / low (SF, engine's side) | what happened | class |
|---|---|---|---|---|
| 5 | ½ @2300 (W) | +123 → **−787** | K+P ending lost (own −895 at d24); Stockfish to move could repeat (Kb6), the arena stopped it | **rescue by the claim rule** |
| 28 | ½ @2200 (B) | +15 → −650, −334 at the end | Re8/Rb8 vs Be5/Bf6; Stockfish to move could claim at +334 | **rescue by the claim rule** |
| 16 | ½ @2200 (B) | −671 (ply 79) | Stockfish blunders at plies 93/105/113/115; ends K+N v K, which the engine scores **+390** (no insufficient-material rule) | rescue |
| 7 | ½ @2100 (W) | **+409** (ply 33) → −816 → 0 | Qd1 (ply 37, d12, own +363) allowed Nf3+ gxf3 Rh6 and the h-file mate; Stockfish gave it back (Qf6 −802); then Bf5 (57, −372) and Bh5 (139, −371) at d13–15 in a drawn Q v R+R+B | **slipped: search** (re-search: c3 at d13, still +352; the sacrifice's payoff is past the horizon) |
| 21 | ½ @2200 (W) | **+270** (ply 104) → 0 | R+B+3P v R+B traded down to K+B+a-pawn with the wrong bishop (ply 176 `1k6/8/P1K5/8/8/4B3/8/8`), scored **+611 for 100 plies**, fifty-move claim | **slipped: eval** (no wrong-bishop knowledge) |
| 24 | ½ @2300 (B) | **+237** (ply 85) → 0 by ply 93 | R+4P v R+3P; Kd6 (75, −153, d17), Kf6 (85, −129), g4 (89, −105) at d15–17 are technique errors, not depth; then 270 plies at own +262 with R + doubled h-pawns v R (`8/8/6k1/8/7p/6rp/4R3/5K2`) | **slipped: eval** (doubled pawns, R+P v R) |
| 12 | ½ @2300 (B) | within ±140 | dead level | fair |

- Dead-drawn endgame plies (|SF| ≤ 50) that the engine scored ≥ +200: **178** (g24 99, g21 38, g6 15, g16 13, g7 11, g25 2). Endgame optimism without queens is the largest in the run: **+223 mean / +233 median** (n = 383, |SF| ≤ 300; middlegame with queens +103 / +84, n = 251).
- The claim rule gave us two half-points this run and cost none (the c9cb33a g5 case, a won game stopped, did not recur). The engine's one-occurrence repetition rule already steers it into repetitions when behind, and the arena then ends the game; the claim-aware set from the c9cb33a report is only needed when ahead. Rider, +3–8.

## 3. The four losses: three eval-led, one search-led, all our own king with queens on

Re-search of the decisive positions with the 555bcaf binary (fresh TT), 5 s / 20 s:

| game | decisive plies (depth) | own vs SF before → after | re-search | verdict |
|---|---|---|---|---|
| 4 @2200 (B) | 24–42 drift −57 → −435 while own 0…+55 at d13–15; Nc6 (42, −309, d13) | ply 32: +13 vs −356; ply 42: 0 vs −435 → −744 | ply 32 Ngxe5 to d14, b5 (−99) first at d15; ply 42 Nc6 at d9–11 and d13 (−1), Re8 at d12 | **eval**: Kg8 behind f5/g6 against Q+B+B; the score never goes below 0 at any depth ≤ 15 |
| 17 @2300 (W) | a3 (43, −200, d12), hxg4 (45, −166) | +103 vs −88 → −288 | Bd4 (SF's best) at d9 and d12–15, a3 at d10–11, all at +100–112 | **eval-led**: pawn storm f5/g5/h5 on Kg1; a fresh TT finds Bd4 but the assessment stays +100 |
| 22 @2200 (B) | Qe7 (9, −181), Qe4 (15, −238, d14), Qxh1 (17, −310, d13) | +113 vs −26 → −264; +115 vs −286 → −596 | Qe4 at every depth to d15 (+111); Qxh1 at d13–14 (+107…+118), Qc2 at d12 | **eval**: king in the centre, White Qd6 + O-O-O; up a rook and lost. Nothing at d15 sees it; the eval must make the queen raid unattractive at ply 15 |
| 26 @2100 (B) | hxg5 (30, −264, d13), Nh5 (34, −146), Ne7 (46, −283) | +5 vs −94 → −358; 0 vs −464 → −610 | hxg5 at d10–12, Nd7 at d13–14 (+22) | **search-led** (one ply flips the move), then eval: own 0…−368 vs SF −464…−785 with Rh1+Qc1 on the open h-file |

One more ply would have changed the move in g26 (d13) and in g17 (with a fresh TT at d12), and the assessment in neither. The shape is the same as c9cb33a's g6/g15/g17/g18: **our own king with queens on**; loss-game optimism +189 (g17), +238 (g26), +351 (g4), +536 (g22).

## 4. The queue against this run's evidence

**`king-danger-v3.patch`: right shape, wrong scale; fix before benching.** A Python replay of both formulas on this run's 391 queens-on middlegame positions: v3 − current = **+23 cp on our king and +32 cp on theirs**, so the net optimism does not move (106 → 115 mean, 74 → 111 median). On the decisive FENs v3 gives our king 65 (g4 ply 42, SF −435), **0** (g17 ply 43: the storm pawns stand on rank 5, the term looks three ranks ahead), 113 (g22 ply 17, with a rook in hand), 143–215 (g26 plies 32–34, the best case: the heavy-piece doubling on the open king file works), 32 (g7 ply 37). Against optimism of 190–540 that is a third of what is needed. Changes, all inside `king_danger`, cost unchanged:
1. Count attacked zone squares, not attackers: `units += w * (attacks & zone).len()` (a queen on four zone squares = 20 units, a knight on one = 2).
2. Storm pawns four ranks ahead, weighted 2 / 2 / 1 / 1 by distance.
3. `3 * units * units` capped at 700.
Static gate on the nine FENs above: our-king danger ≥ 200 on g4 ply 42, g22 ply 17 and g26 ply 32, ≥ 100 on g17 ply 43, and the run-wide replay mean shift on our king ≥ 2× the shift on theirs in the loss games. Then bench. **+30–60**, unchanged.

**`pawn-rook-terms.patch`: reorder behind draw scaling, or bundle.** The slipped wins are draw knowledge, not passed pawns: PASSED_EG[6] = 140 would lift the wrong-bishop a7 position of g21 from +611 to about +750 and reward the plan that drew it, and it does nothing for g24's doubled h-pawns or g16's K+N. With endgame optimism already +223, the patch alone makes the worst statistic worse. Ship in one eval commit, gated on phase: (a) draw scaling in `evaluate` before the side flip: no pawns and non-pawn material ≤ one minor for the stronger side → 0; K+B+rook-pawns only v K with the bishop off the queening square's colour → ÷ 8; R + rook-pawns only v R ÷ 4; opposite-coloured bishops with ≤ 2 pawns ÷ 2; pawnless edge ≤ a minor ÷ 4; (b) doubled pawn −10 mg / −20 eg; (c) the patch's passed-pawn and rook terms. **+20–35** combined; gate: the g21 ply 176, g24 ply 191 and g16 final FENs score ≤ +60, the g25 FENs from the c9cb33a report ≤ +50, nps within 3 %.

**Incremental eval (36032fd's `EvalState` re-applied): confirmed at rank 2.** The depth slope is intact at 5 s (ACPL 37 → 19 from d12 to d15, blunders 2.8 % → 0 %), and 35 % of the budget dies in aborted iterations, which cheaper nodes turn into completed depth. Node-identical, gated by `make profile` (nodes equal, nps ≥ ×1.7). Bundle two node-identical riders: `ordered_moves` as a fixed array with pick-best selection, and root moves ordered by the previous iteration's scores (hash move first, then last-iteration order), so the 35 % spent in partial iterations searches the likely alternatives first and the switched moves improve. **+40–60.**

**New from this run: aspiration windows** (±30 from depth 5, widen ×2 on failure, full window after two failures). Evidence: the abort variance in section 1. Node-count gate: −15 % nodes to depth 12 on `make profile`, same moves. **+15–30**, after the two above.

Order: king-danger v3 (rescaled) → incremental eval + ordering riders → draw scaling + pawn/rook terms → aspiration windows → time riders (reserve 25 ms, claim-aware set).

## 5. Prioritised code changes

1. **King-danger v3, rescaled** (`eval.rs` `king_danger`; section 4 items 1–3). Evidence: g4, g17, g22, g26 (all four losses), queens-on optimism +103 / loss games +189…+536. **+30–60.**
2. **Incremental `EvalState`** + fixed-array `ordered_moves` + root ordering by last scores (`search.rs`, `eval.rs`). Gate `make profile`. **+40–60.**
3. **Draw scaling and doubled pawns, then the pawn/rook patch** (`evaluate`). Evidence: g21 ply 176 at +611, g24 plies 93–365 at +262, g16 K+N v K at +390; 178 dead-drawn plies scored ≥ +200. **+20–35.**
4. **Aspiration windows** at the root. Evidence: 944 aborts, a quarter after a ≤ 1.1 s cumulative search. **+15–30.**
5. **Mate-threat / king-attack horizon**: when the null-move search returns a mate score against us, extend one ply; do not LMR-reduce a quiet move that gives check next ply or follows a sacrifice into the king zone. Evidence: g7 ply 37 (`3q3k/bBp3pp/3p1r2/4p3/3nP1p1/3P4/PPPQ1PPP/1R3RK1 w`, +358 at d12 against Nf3+ and mate). Verify on that FEN at 5 s. **+5–15.**
6. **Reserve 25 ms at 5 s** (`search`: clamp upper bound). Evidence: max overshoot 5.7 ms, 144 ms headroom. **+0–3**, rider on the next commit.
7. **Claim-aware repetition set** (c9cb33a report item 4), only for positions where we are ahead. This run: no cost, two gifts. **+3–8**, rider.

**Next single change: item 1, but rescaled first.** The patch as queued moves both kings by the same 20–30 cp and would return a null result on the one statistic a 30-game run measures; with attacked-square units and the storm fix it addresses three of the four losses and the queens-on optimism directly. Item 2 follows in the same session (eval-identical, profile-gated, does not confound item 1's measurement).
