# Engine-developer review of `1a24270` (logged as 8e592f4, [keep])

Experiment: null-move pruning (R = 2 + depth/4, depth ≥ 3, non-PV, not in check, side to move has a piece, static eval ≥ beta, no double null) and LMR (quiet, non-killer, non-checking moves from index 3 lose 1 ply at depth ≥ 3, or 2 plies from index 8 at depth ≥ 6, with a full-depth re-search on fail-high). These sit on top of TT, killers, history and PVS. Eval is still material + Michniewski PSTs with the binary endgame switch.
Result: 2203 ±348, W/D/L 28/2/0 @1600, avg depth 11.1 (was 7.6). The fast ladder is saturated (0.967).

Sources: `engine/src/{search,eval,main}.rs` at 8e592f4, `analysis/1a24270/{summary.md,analysis.json}`, `games/runs/1a24270/{summary.txt,moves.jsonl}`, and `analysis/97aee56/analysis.json` for comparison. The 1 s re-runs used `engine/target/release/engine`, built at 12:14. The loop was editing `eval.rs` while I worked, so that binary **may not be exactly 1a24270**. Nothing was rebuilt.

## 1. Verdict: a real keep, and depth is no longer the main bottleneck

| | 97aee56 (ordering) | **1a24270 (NMP + LMR)** |
|---|---|---|
| avg depth: opening / middlegame / endgame | 6.9 / 7.1 / 8.3 | **11.0 / 10.8 / 11.6** |
| moves ending at the hard stop (≥ 0.225 s) | 40 % | **13 %** |
| moves stopped by the soft limit (0.10–0.225 s) | 53 % | 76 % |
| real errors (≥ 200 cp, not SF's best, SF eval before in [−300, +400], opening + middlegame) | 18 | **11** |
| mean optimism, own score − SF after (\|both\| < 600): opening / middlegame / endgame | 33 / 92 / 67 | 15 / 56 / 51 |

This is +3.5 to +4 plies at the same nps (5.6 M), and real errors fell by 40 %. The "39 % of moves hit the hard stop" problem from the last report has mostly gone away by itself, because iterations now finish.

## 2. Null move and LMR: correctness review

These points are ordered by risk. None of them is a crash or timeout risk.

1. **Null move and repetition interplay (real, but low impact).** `negamax` pushes `child.hash()` for the null position and `is_repetition` scans the whole `stack`, including positions from before the null.
   - A line under the null (null, opponent move, our move, …) can "repeat" a position that existed only before the pass and get a false 0.
   - Case A: the null-mover is ahead (eval ≥ beta ≥ 0). The false 0 makes the null search fail low, so we just lose some pruning.
   - Case B: beta < 0 (behind, but static eval ≥ beta). A false 0 ≥ beta gives a **false cutoff**.
   - Those contaminated scores are also stored in the TT, which survives across moves, and real lines reuse them.
   - Fix: treat the null move as irreversible. Keep a `last_irreversible` index per ply, set at a null move and wherever `halfmove_clock()` is 0, and scan only from there back, stepping two plies at a time. This also makes the scan O(halfmove clock) instead of O(game length), which matters in 120+ ply games.
2. **Zugzwang.** `has_pieces(board, us)` is the standard guard and is enough at this level. It still allows the null in K + R vs K + R + pawns style endings, where a null can mislead. There is no verification search. I don't recommend one yet: no game this run shows a zugzwang error.
3. **Mate scores.**
   - A null fail-high with a mate score returns `beta`, which is correct.
   - TT ply adjustment is correct on store and probe.
   - Remaining issues:
     - **The root mate-break still fires when *we* are being mated** (`is_mate_score(score) && depth >= 2`). Game 22 plies 127–147: depth 2–9 in 0.6–30 ms, i.e. no attempt to find the longest defence. It happened not to matter, because SF repeated.
     - **It also breaks at depth 2 on a TT-inherited mate score.** Game 21 ply 42: Kf1 at depth 2 in 0.7 ms. SF says Kd2 was needed and Kf1 threw away 2000 cp. A 1 s search finds mate in 4 with Kf2.
     - Fix: break only when `score > 0` and `depth > MATE - score` (the plies to mate).
4. **LMR re-search is correct.** The order is reduced null window, then full-depth null window, then the full window if it's a PV node, and each step is guarded by `!self.stopped`. Hash move, captures, promotions, killers, in-check nodes and checking moves are excluded.
   - Two minor gaps:
     - **En passant counts as quiet**, because `enemy.has(mv.to)` is false for it. It gets reduced and trains killers/history. `ordered_moves` already knows the ep square, so reuse it.
     - Reduced moves at PV nodes are treated like non-PV ones. That's fine for now.
5. **TT cutoffs at PV nodes (still there).** `hit && ply > 0 && depth ok` cuts in PV nodes too, and with the TT kept across moves this hides repetition lines. Two positions show that the search state carried between moves changes decisions:
   - g22 p47 …Kh8: a fresh search finds SF's Rd6 already at d9, 76 ms. In the game it played Kh8 at d9.
   - g4 p24 …Bxf2+: a fresh search finds Ng4 at d8, 62 ms. In the game it played Bxf2+ at d10.

   Fix: no TT cutoff when `pv_node`. Also age history harder or add a malus, since `HISTORY_MAX` saturates.
6. **Stalemate under null.** Null pruning runs before move generation, so a stalemated side (no legal moves, not in check) with eval ≥ beta returns a fail-high instead of 0. It is rare, but it's the classic way to "win" into a stalemate. Low priority. If it ever shows up, skip the null when the side to move has no non-king mobility.

**Time safety at 5 s: fine.**
- `hard = 5.0 − 0.25 = 4.75 s`, soft = 2.0 s.
- The clock is checked every 1024 nodes, about 0.18 ms at 5.6 M nps.
- Worst overshoot this run was 0.252 s against a 0.235 s hard limit (+17 ms of pipe and process latency), which leaves about 330 ms of margin at 5 s.
- The TT is allocated in `Searcher::new()` and cleared on `ucinewgame`, both outside `go`.
- Iterations can reach depth 127 when the position is trivial (e.g. game 22 ply 145). `depth as i8` is safe up to 127, and `max_depth` is capped at 127.
- The only growing cost is the `is_repetition` scan over the full game history (item 1).

## 3. Remaining errors: depth or eval?

I re-ran the 11 real errors plus the three "winning-position blunders" with 1 s searches (4× the game budget, about +2 plies):

| game / ply | played (d, own) → SF after | SF best | 1 s re-run | diagnosis |
|---|---|---|---|---|
| g22 p33 | …gxf6 (d10 hard stop, +165) → −307 | Qxc7 | **Qxc7** at d10 (174 ms) | depth / partial iteration thrown away |
| g22 p47 | …Kh8 (d9, +25) → −831 | Rd6 | **Rd6** at d9 (76 ms) | search state (TT/history carry-over) |
| g4 p24 | …Bxf2+ (d10, +185) → +82 | Ng4 | **Ng4** at d8 | search state |
| g30 p72 | …g6 (d9 hard stop, +285) → **−1112** | Nd8 | d9 still g6 (+205), d10 Qb1 (+87, 0.5 s) | depth **and** eval: king attack Q + B + 2R on f7/h6 |
| g16 p86 | …c5 (d10, +350) → +21 | Bxd4 | Bxd4 at d9–10, then Ng5 at d11 | mixed |
| g3 p35 | Bd4 (d8 hard stop, +80) → +13 | Nf4 | Rc1 at d8–9 | eval / mixed |
| g30 p70 | …Qa1 (d10, +215) → −166 | Ne7 | **still Qa1** at d11 | **eval**: queen goes offside while the enemy Q, B and two rooks aim at g8 |
| g18 p38 | …Nf2+ (d12, +210) → +101 | Qxh3 | **still Nf2+** at d13 | eval |
| g25 p47 | Rxb7 (d10, +155) → −447 | Nf3 | **still Rxb7** at d12 | **eval**: pawn grab while …Qd5/…Bc4 point at g2 |
| g29 p25 | a3 (d9 hard stop, +310) → −238 | c4 | Nf5 at d10–12 (+282) | eval |
| g22 p35 | …Be6 (d11, +105) → −413 | Rbd8 | f5 (0) | eval |
| g1 p71, g9 p51, g21 p42 | (winning) | – | mate in 4–5 found | not errors; mate-break artefacts |

**The split has flipped since 97aee56.** Then about half the errors were depth. Now only 2–3 of 11 are fixed by 4× time, 2 more are search-state noise, and **about 6 of 11 persist at d11–13 because of eval**.
- **King exposure** is the common factor in the persistent errors: g30 p70–72, g22 p33–47, g25 p47 and g18 p38.
- **Every large self-detected score collapse is a king attack.** There were 8 cases where our own score dropped by 150 cp or more between consecutive moves. The costly ones:
  - g22 p47: +25 → −545
  - g29 p25: +310 → −60
  - g30 p72: +285 → +5, then −1005
  - g30 p80: −310 → −910
- At 5 s we will search about 3–4 plies deeper (the branching factor is about 1.8–2.2), so the depth-type errors shrink further and eval errors take a larger share.

**Both draws were lost positions saved by repetition.** They are not slipped wins at the repetition:
- g22 lost at p33–47 through our king: own score +165 while SF had us at −300 to −830.
- g30 went +2.9 → −11 at p70–72: a king attack with our queen on a1.
- Contempt would not have changed either game: a draw is still far better than −900.

## 4. Ranking the candidate next experiments

1. **King safety v2: the next experiment.** It is the only candidate with direct evidence in both runs:
   - about 6 of 11 real errors here;
   - the largest ACPL events (g30: −1112, g22: −831);
   - both draws;
   - the 97aee56 middlegame collapses (g10, g24).

   Stronger opponents (1700/1800) attack better, so this gap grows as TARGET_ELO rises. Expected gain is +60–120 against 1700–1800, with a small nps cost.
2. **Check extension + check evasions in quiescence.**
   - Quiescence currently stands pat while in check. It cannot see mate at the horizon and misjudges every checking sequence that ends at depth 0. That is exactly the king-attack horizon behind g30 p72 and g22 p47.
   - It complements (1): the eval flags danger, the extension resolves it.
   - Expected +30–60. Risk: search explosion, so cap the extensions (e.g. only while `ply < 2 * root_depth`).
3. **Time management.**
   - Store the best root move as soon as it changes inside an iteration (after move 0 completes) and use it when stopped.
   - Then move the soft limit from 0.40 to about 0.55.
   - Add aspiration windows (the root currently searches with ±INF every iteration).

   Evidence: 76 % of moves stop at the soft limit with 40–60 % of the budget unused (avg 57 % used), and 13 % hit the hard stop and discard the iteration (g22 p33, g30 p72, g29 p25, g3 p35 were all hard-stop moves). Expected +20–40, about half a ply, and it applies at 5 s just the same.
4. **Passed pawns** (rank-scaled, extra when the path is free, bigger in the endgame) together with a tapered king PST in place of the binary switch.
   - No game this run turned on a passer.
   - Endgame optimism is now moderate (mean +51) and all endgame "blunders" were in won positions.
   - The evidence is from 97aee56 (g3 loss).
   - Expected +20–50. It matters more once games get longer against 1800.
5. **Contempt.** Zero evidence this run: no draw from a level or better position. Both draws were from −800 or worse, where contempt changes nothing. It's a knob worth +0–15 now. Add it later (≈ 20 cp, scaled down in endgames) when draws from level positions appear.

## 5. Prioritised code changes (at most 7)

1. **King safety v2** (`eval.rs`). Our own design, following the Chess Programming Wiki "King Safety" description (attack units on the king zone plus pawn shield). The numbers below are starting guesses to measure, not tuned values.
   - King zone = `get_king_moves(ksq) | ksq`, plus the three squares one rank further toward the enemy.
   - For each enemy N/B/R/Q, `attacks & zone`:
     - if non-empty, `attackers += 1` and `units += w[piece]`, with w = N 2, B 2, R 3, Q 5;
     - add 1 unit per extra attacked zone square;
     - use `get_bishop_moves` / `get_rook_moves` with the current occupancy.
   - Penalty = `units² × 2`, capped at about 500. Apply it only if the attacker has a queen and `attackers ≥ 2`.
   - Scale by attacker non-pawn material / starting non-pawn material (taper).
   - Shield: −15 per missing own pawn on the king file and the two adjacent files (rank 2/3 relative), and −20 per semi-open/open file next to the king. Only when the king is on files a–c or f–h, or still in the centre with the enemy queen on.
   - Pure popcount and bitboard work, no branches per square.
   - Verify with the fixed-position set below before a full run.

   Evidence: g30 p70/72, g22 p33/47, g25 p47, g18 p38 (eval-persistent at d11–13). Expected +60–120 against 1700–1800.
2. **Quiescence evasions + check extension** (`search.rs`).
   - In `quiescence`, if in check: no stand pat, search all legal moves, return `-MATE + ply` if there are none.
   - In `negamax`, `depth += 1` when `in_check`, before the `depth <= 0` test.
   - Expected +30–60.
3. **Keep the partial iteration's root move, soft limit about 0.55, aspiration windows**: in `search()` / root of `negamax`, set `self.root_move` whenever alpha rises at `ply == 0`, and on `stopped` use it if at least move 0 finished. Expected +20–40.
4. **Mate-break only for our own mates, and only once the depth covers the mate** (`search()`): `score > 0 && depth as i32 > MATE - score`.
   - Stops 1 ms depth-2 moves in lost positions (g22 p127–147), where we should be looking for the longest defence against a weakened opponent.
   - Stops non-mating moves on TT-inherited mates (g21 p42).
   - Expected +5–15, and it's cheap.
5. **Repetition hygiene** (`is_repetition`, null move): stop the scan at the last null move and at the last irreversible move, and step two plies at a time. Also skip TT cutoffs at PV nodes. Evidence: g22 p47 and g4 p24 play differently in-game than in a fresh search. Expected +5–20, plus speed in long games.
6. **Passed pawns + tapered king PST** (`eval.rs`). Expected +20–50, mostly in endgames against stronger opponents.
7. **Ordering hygiene**: en passant as a capture in LMR/killers/history; a history malus for quiets searched before the cut-off move; contempt of about 20 cp later on. Expected +5–15 together.

## 6. Next experiment: king safety v2 (change 1) alone

Why this one:
- It is the only candidate that shows up in **both** runs' worst errors.
- It persists at 4× time, so the 5 s rule won't fix it by depth.
- It grows with opponent strength, which matters because the milestone moves the ladder to 1600/1700/1800.
- Search changes (2, 3) are the runner-up. They help at every level but mostly buy depth we now have plenty of.

**Cheap pre-check (≤ 1 s each), since the saturated ladder can't resolve it:**
- Run these six FENs from `analysis/1a24270/analysis.json`: g30 p70, g30 p72, g22 p33, g22 p47, g25 p47, g18 p38.
- **Before**, from a cold start, only g22 p33 and g22 p47 find SF's move within 0.25 s. The other four keep the blunder, or a move that is nearly as bad, up to 1 s.
- **Pass if** at least 2 of those 4 move off the played blunder within 0.25 s, and the two already found stay found.
- Also check `make profile`: nps should drop no more than about 15 %.

If it passes, run bench-full rather than the fast ladder, because the fast ladder gives 0.967 either way.
