# Engine-developer review of `97aee56` (logged as c764cdb, [keep])

Experiment: the move-ordering package. The TT is kept across moves, with killers (two per ply), butterfly history ([side][from][to], +depth², capped at 7000, halved every move) and PVS. The eval is still the baseline material + Michniewski PSTs.
Result: Elo 2075 ±251, W/D/L 27/2/1 @1600, avg depth 7.6.

Sources:
- `git show 97aee56:engine/src/search.rs`, `main.rs`, `eval.rs`;
- `analysis/97aee56/{summary.md,analysis.json,game_*.pgn}` and `games/runs/97aee56/{summary.txt,moves.jsonl}`.

The working tree and `engine/target` moved to `1a24270` (null move + LMR) while I was working. **All 1 s re-runs below therefore use the NMP+LMR binary, not 97aee56.** That is still the right tool for the question "does more depth fix it?". Seven positions, ≤ 1 s each. Nothing was rebuilt.

## 1. Verdict

Keep was right, but for a different reason than the headline:

| | 63ccb08 base | ad95e70 TT | **97aee56 ordering pkg** |
|---|---|---|---|
| avg depth: opening / middlegame / endgame | 5.6 / 6.1 / 6.7 | 6.6 / 7.2 / 8.7 | 6.9 / 7.1 / 8.3 |
| median nps (moves > 0.1 s) | 8.7 M | 7.9 M | 7.4 M |
| real errors (≥ 200 cp, not SF best, SF eval in [−300, +400], opening + middlegame) | 31 | 26 | **18** |
| balanced-middlegame ACPL (\|SF\| < 300) | 64.3 | 54.5 | 56.3 |
| moves ending at the hard stop | 47 % | 41 % | 39 % |

**In-game depth did not move versus the TT-only run.** Killers, history and PVS cut `make profile` nodes to depth 7 by 32 % (7.8 M → 5.3 M), but 571 of 1182 timed moves still finished at exactly depth 7. The step to depth 8 costs about 7× at this branching factor, so a 32 % node saving doesn't buy a ply.

The gain is fewer real errors (26 → 18), plus a noisy +160 Elo on a saturated ladder. The ordering is now good enough that **pruning, not ordering, is the depth bottleneck**. That is exactly what 1a24270 addresses.

## 2. The two draws were not slipped wins at the repetition. They were lost positions saved by repetition

Both games were winning for us earlier, but the wins were lost in the **middlegame, through our own king**. The threefold repetition at the end is Stockfish failing to convert against us.

**Game 10 (black, 1600).**
- By ply 25 we were +6.5 (SF), after SF blundered the exchange and a knight.
- Then we played …Bxb2 (ply 24, own +500, SF says −2.6 after it), …Bxc1 (ply 26, own +575, **−1032**), …Kxd4 (ply 30, own +650, −646) and …c5 (ply 42, −763). Our king walked d6 → c5 → d4 → e4 → f5 → g5 against Q + R and was hunted.
- By ply 60, SF was +16 and we were playing B + 2 pawns against a queen.
- The final repetition (Bf3/Bg2 at d14–16, own score 0 against −665 otherwise) was the correct choice. It was a lost position, and a draw is worth 0.5 in the Elo formula.

**Game 24 (black, 1700).**
- We were +3.8 at ply 52.
- Then came …c5 (ply 53, d6, own +300, −378) and …h5 (ply 55, own +355, −282), letting Rg4xg6 and Qe6+/Bd3/Qxg6 in against our king. …Kh7 (−527) and …Kh8 (−377) followed.
- By ply 81 we were −13. SF then perpetual-checked (Qd5+/Qe5+/Qd6+), and we took the repetition at own −885.

**Repetition code check.** There is no bug that produced these draws:
- `is_repetition` treats one earlier occurrence (game history or search path) as a draw at `ply > 0`, and never at the root.
- With a draw score of 0 and no contempt, the engine avoids repeats when ahead and seeks them when behind, which is the right sign.

Two latent issues remain (item 7):
- A draw score of 0 has no contempt. Under "only wins count" we should pay a little to avoid 0 when level.
- Repetition-derived 0 scores go into a TT that now **survives across moves** (graph-history interaction). A stored exact 0 from "this line repeats an earlier game position" is reused after the game history has changed.

Neither cost a game this run.

## 3. The loss (game 3, white, 1600): eval, not search

- **Ply 45, 23.Rc1?** (d7, own +220, SF: −308; `2kr3q/pp6/3pp1Q1/2p5/3nP3/2NP4/PPP3PP/R5K1 w`). …Nf3+ gxf3 Rg8 pins and wins the Qg6. This was a soft-stop move: 0.105 s, depth 8 not started.
  - The NMP+LMR binary switches to **h3** (luft) at d10 in 0.16 s, but it never finds SF's Rf1. **Partly depth.**
- **The real loss is the next 60 plies.** After 25.Qxg8+ we had R + N + pawns against Q with our king on g2/g3 and a black passed d-pawn:

  | ply | our eval | SF (our side) |
  |---|---|---|
  | 63 | +95 | −192 |
  | 79 | −50 | −379 |
  | 91 | +85 | −454 |
  | 103 | −205 | −572 |

  We stayed about 300 cp optimistic for 30 moves while the d-pawn marched d5 → d2 → d1=Q with queen support. The eval has **no passed-pawn term**. Its only "danger" signal is the pawn PST (+50 on the 7th), and it values Q (900) ≈ R + N (820) with no king-exposure penalty against a lone queen. This is an eval gap, not a horizon gap.

## 4. Remaining errors: depth versus eval (NMP+LMR binary, 1 s)

| game / ply | played (d, own score) | SF best | 1 s re-run | diagnosis |
|---|---|---|---|---|
| g18 p28 | …Bxd4 (d7, +335), −578 | h5 | **h5** at d10, 0.13 s | depth |
| g13 p49 | c4 (d7, +250), −472 | N4g3 | **N4g3** at d10, 0.11 s | depth |
| g24 p59 | …Kh7 (d8, +400), −527 | Kh8 | **Kh8** at d12, 0.10 s | depth |
| g3 p45 | Rc1 (d7, +220), −308 | Rf1 | h3 at d10+ (+210) | partly depth |
| g24 p53 | …c5 (d6, +300), −378 | Qf2 | **still c5** to d13 (+295) | eval: king attack (Q + R + B vs g8) |
| g10 p24 | …Bxb2 (d8, +500), −502 | c5 | **still Bxb2** to d13 (+410) | eval: our king on d6 |
| g10 p26 | …Bxc1 (d8, +575), −1032 | c6 | Bxc1 to d12, then Rxf7 at d13 (+485) | eval: our king on d6 |

**Split.** About half the real errors fall to NMP+LMR depth, at 0.10–0.16 s, well inside 0.25 s. The other half are **king-exposure misjudgements that persist at d13–14**.

The optimism statistics say the same thing. Engine score minus SF, from our side, over moves with \|SF\| ≤ 600:

| | mean | moves |
|---|---|---|
| middlegame, king safe | +81 cp | 235 |
| middlegame, our king exposed (queens on, king off the back two ranks or on d/e) | **+247 cp** | 31 |
| endgame, our king exposed to a queen | **+284 cp** | 28 |

Horizon effects remain, and they show as forcing sequences:
- game 10: the checks Qh6+, d4+, Rd1+ and Qc4+;
- game 24: the sequence Qe6+, Bd3, Qxg6.

The search has **no check extension, and qsearch stands pat while in check**. So checking sequences are cut off at the leaves, which is exactly where our king hunts happen.

## 5. Time usage

- **Hard stop hit: 493 / 1268 moves (39 %).** These are moves ≥ 0.23 s, where the hard limit is 0.2375 s. Their average completed depth is 7.3, and the whole partial iteration was thrown away: `root_move` is set only after the root loop finishes, and `search()` discards it on `stopped`.
- **Soft stop: 691 moves (54 %).** These averaged 0.155 s, leaving about 35 % of the budget unused. With a fixed 40 % soft limit (0.10 s), any move whose depth-d iteration ends after 0.10 s stops there.
- 81 fast moves are all mate-found breaks, which are fine.
- Max 0.271 s, 8 moves over 0.25 s. This is scheduler noise, well inside the 0.35 s crash line.
- **The mate break also fires on being mated** (`is_mate_score(score) && depth >= 2`). Game 3 plies 157–171 moved in about 1 ms with "mate −4", with no search for the longest defence against a *weakened* opponent that might not find the mate. Break only on positive mate scores.

## 6. Code review: killers / history / PVS (97aee56)

These are correct in substance. PVS re-search conditions, killer shifting, the hash-move override and the TT move kept on fail-low are all fine, and hash-move legality is guaranteed because `ordered_moves` only tags generated moves.

Issues, most important first:
1. **The partial iteration is discarded** (section 5). The fix is safe: a root move only raises `best` after its search returned un-stopped, so any root update inside the loop is a fully searched move.
2. **The history saturates.** `(*h + depth²).min(7000)` has no gravity and no malus. Common from-to pairs pile up at 7000 during a long search and become indistinguishable, and quiet moves that failed to cut off are never penalised. Use a gravity update, `h += b − h·|b|/MAX`, and apply a malus (−b) to the quiet moves searched before the cutoff move.
3. **En passant counts as "quiet"** in the cutoff update (`!enemy.has(mv.to)`), so e.p. captures pollute killers and history. This is rare but wrong. Reuse the `ep_square` test from `ordered_moves`.
4. **TT cutoffs are allowed at PV nodes** (any `ply > 0`). With PVS, this truncates PVs and imports repetition-contaminated exact scores into the PV. Restrict cutoffs to `beta − alpha == 1` nodes.
5. **Speed:**
   - `ordered_moves` allocates a `Vec` and does a full sort at every node.
   - Qsearch generates **all** moves and then filters. Mask the `PieceMoves` targets to `enemy` (plus queen promotions) before iterating instead.
   - `is_repetition` scans the entire game history at every node (O(game length)). Limit it to the last `halfmove_clock` entries, stepping by 2.

   Each of these is a few % of nps in long games.
6. **No ordering instrumentation.** The fail-high-first rate is unknown. Add counters (first-move cutoffs / all cutoffs) printed by `engine bench`. The target is > 90 %.

On 1a24270 (in flight), one note: the null move pushes `child.hash()` onto `stack`, so `is_repetition` can match a pre-null position through the null move and score a false draw. Stop the repetition scan at a null move, for example by pushing a sentinel or by tracking the ply of the last null.

## 7. Prioritised changes (≤ 7)

1. **Land NMP + LMR (1a24270), plus the null-move repetition fix.**
   *Evidence:* 3 of 7 re-tested real errors are fixed at d10–12 in 0.10–0.13 s. 571 moves were stuck at d7.
   *Expected:* +150–250 Elo, already running.
2. **King safety v2 with attack units** (`eval.rs`). Use the branchless shelter formulation and the d/e-only centre fix from `analysis/dd6c58b/engine-dev.md`, plus the new part: count enemy N/B/R/Q attacks on our king ring (cozy-chess attack functions), feed them through a non-linear table, and apply it only when the enemy has a queen.
   *Evidence:* g10 p24/p26/p30 and g24 p53/p55 are still wrong at d13–14. Middlegame optimism is +247 cp with our king exposed against +81 cp when safe. Both "slipped wins" started here.
   *Expected:* +50–100 Elo.
3. **Time management** (`search.rs`):
   - set `root_move` whenever alpha rises at ply 0, and keep it on `stopped`;
   - replace the 40 % soft limit with "start d+1 only if elapsed + last_iter_time × 2.5 < hard" (measure our own ratio after NMP+LMR);
   - break only on positive mate scores.

   *Evidence:* 39 % of moves discarded their iteration, and soft-stopped moves left about 35 % of the budget unused.
   *Expected:* +30–60 Elo, more at 5 s.
4. **Passed pawns + material imbalance** (`eval.rs`): a rank-scaled passer bonus that grows when the path is free and when the enemy king is far; a small penalty for R + minor against Q with our king exposed; mop-up when a rook or more ahead.
   *Evidence:* the game 3 loss drifted from +1 to −6 while our eval stayed about 300 cp optimistic during the d-pawn's march. Endgame optimism is +284 cp with our king exposed to a queen.
   *Expected:* +30–50 Elo.
5. **Check extension + check evasions in qsearch** (`negamax`/`quiescence`):
   - extend by one ply when the side to move is in check;
   - in qsearch, when in check, search all evasions with no stand-pat and detect mate.

   *Evidence:* the game 10 hunt (Qh6+, d4+, Rd1+, Qc4+) and the game 24 sequence Qe6+ → Qxg6.
   *Expected:* +40–70 Elo.
6. **Ordering hygiene** (`search.rs`):
   - history gravity + malus;
   - the e.p. fix;
   - no TT cutoffs at PV nodes;
   - FH-first counters in `bench`.

   *Evidence:* section 6.
   *Expected:* +10–30 Elo. Verify with `make profile` nodes-to-depth and the FH-first rate, not with games.
7. **Draw handling + speed**:
   - a draw score of −C for the root side and +C for the opponent (C ≈ 25 cp as a starting guess);
   - a repetition scan bounded by `halfmove_clock`, stepping by 2;
   - captures-only generation in qsearch;
   - no `Vec` per node.

   *Evidence:* no draw from ahead this run (the two draws were saves), so contempt is insurance. The speed items apply to every node.
   *Expected:* +10–30 Elo.

## 8. The single next experiment

**Once 1a24270 is judged, do king safety v2 with king-zone attack units (item 2).**

Why:
- The depth-fixable half of the errors is already being handled by NMP+LMR.
- The other half, including both games that went from winning to non-winning, are king-exposure misjudgements that stay wrong at d13–14. No amount of search reaches them.
- At d10+ the eval cost (~3 % nps with the branchless form) is affordable, where it wasn't at d6 in dd6c58b.

If the loop wants a near-zero-risk rider in the same run, add item 3's partial-iteration root move. It's about 5 lines and cannot lose strength. Otherwise, run it next on its own.

Also raise `TARGET_ELO` to about 2000: the ladder is saturated (27/30), and ±251 can't resolve anything under +100.
