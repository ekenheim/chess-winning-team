# Engine-developer review of `ad95e70`

Experiment: 48 MB transposition table kept across moves, with the hash move searched first.
Result: Elo 1914.6 ±176, W/D/L 24/3/3, the same Elo as the baseline `63ccb08`. The fast ladder is saturated (score 0.85), so this run can't resolve the change. The low-noise signals below show that the TT is a clear improvement and should be kept.
This report builds on `analysis/63ccb08/engine-dev.md` and doesn't repeat it.
Sources: `engine/src/*.rs` at `ad95e70`, `games/runs/ad95e70/{summary.txt,moves.jsonl}`, `analysis/ad95e70/{summary.md,analysis.json}`. I also re-ran 6 error positions through the existing binary at `go movetime 1000`. Nothing was rebuilt.

## 1. What the TT bought (low-noise signals)

| | 63ccb08 | ad95e70 |
|---|---|---|
| avg depth: opening / middlegame / endgame | 5.6 / 6.1 / 6.7 | 6.6 / 7.2 / 8.7 |
| moves ending at the hard stop (≥ 0.234 s) | 609 (47 %) | 509 (41 %) |
| median nodes per move / median nps | 901k / 8.7 M | 869k / 7.9 M (−9 %, TT cache misses) |
| real errors (loss ≥ 200 cp, result < +4, move ≠ best, not already lost) | 50 (40 in the middlegame) | 44 (31 in the middlegame) |
| depth at which those errors were played | 5–7 | 6–10 (35 of 44 at d6–7) |
| forced mates finished instantly (TT-grafted mate, depth 2, < 1 ms) | – | about 70 moves |

**The "middlegame ACPL went up" result is an artifact, not a regression.** In positions with |eval| < 600, middlegame ACPL *fell* from 68.9 to 65.4. Without the top 10 moves it is flat (47.9 → 49.0). The rise comes from a few huge clamped values. `g8 ply 38 f4+` and `g14 ply 52 Rxf2`, each logged as a 1400–1700 cp loss, are *the same move as the best move* (mate/clamp artifacts, as in the baseline), and `g2 ply 64 g5` is a mate-in-2 played instead of another mate. Real middlegame errors went down from 40 to 31.

## 2. TT code review (checklist)

| item | status |
|---|---|
| Mate scores ply-adjusted on store and probe | **OK.** `score_to_tt`/`score_from_tt` are symmetric, and the threshold `MATE − MAX_PLY` is correct. |
| Store after abort | **OK.** Every `self.stopped` path returns 0 before the store, qsearch included, and the parent checks `stopped` after each child. An aborted root iteration is discarded. |
| Hash-move legality | **OK.** It's only used as a sort key against moves that were actually generated, so an illegal TT move can't be played. The full 64-bit key is compared. |
| Root handling | **OK.** There is no TT cutoff at ply 0. The previous iteration's best move comes first at the root, via its TT entry. |
| Repetition interplay | Standard graph-history interaction (GHI) only. The repetition check runs *before* the probe (good). Repetition draws are stored as Exact 0 and can leak into other paths or the next move. There were no cases this run where the engine scored 0 while Stockfish had it ≥ +1. All 3 draws were saves from −700 to −1400. **Not urgent.** |
| Replacement | **Weak at 5 s.** It always replaces into one slot with no bucket or depth preference. At 5 s that is about 35 M nodes per move, several million of them non-qsearch stores, into 2 M slots. Deep entries near the root get overwritten by leaf entries. It's harmless at 0.25 s. |
| Move stored on fail-low | **Minor bug.** On an `Upper` bound, `best_move` is just the move with the highest fail-low bound, which is noise. It overwrites a good hash move from an earlier search of the same node. Keep `entry.mv` when `bound == Upper` and the key matches. |
| Entry size / allocation | 24 B × 2²¹ = 48 MB, allocated once in `Searcher::new()` before `uci`. `ucinewgame` runs a 48 MB `fill`, which costs a few ms outside `go`, so it's fine. `bench` builds 8 Searchers (8 × 48 MB allocs), which slightly inflates the `make profile` time but doesn't affect games. |
| Minor | (a) With one legal move, iterative deepening runs to depth 127 in about 3 ms (3 moves this run). Harmless, but just return the move. (b) `halfmove_clock >= 100` is tested before mate detection. (c) The mate early-exit also fires when *we* are getting mated. Against a weakened opponent, keep searching for the longest or trickiest defence. |

**Time risk at 5 s: none found.** The hard stop is `t − max(15 ms, t/20)`, which is 4.75 s at 5 s and leaves a 350 ms margin against a 100 ms tolerance. The clock check every 1024 nodes is about 0.15 ms apart at 7 M nps. The TT adds no per-move allocation. The two overshoots here (0.2627 s at g1 ply 1 and 0.2591 s at g9 ply 17) are about 25 ms over the internal hard limit and not near the 0.35 s crash line. They are most likely scheduler noise from the parallel benchmark runs (first move of the process and a random midgame move), not a TT effect. If the reserve is ever tightened (item 3), keep at least 50 ms absolute at 5 s.

## 3. Remaining middlegame errors: depth or eval?

I re-ran 6 of the worst real middlegame errors at 1 s (FEN only, no game history):

| position | played (depth) | 1 s result | verdict |
|---|---|---|---|
| g5 ply 57 (loss 1014) | Nxe5 (d6, +495) | **d7 → Nxg5** (best) | depth |
| g20 ply 31 (the loss, 1046) | Qa1+ (d6, +365) | **d7 → h5** (Qa1+ dropped) | depth |
| g4 ply 22 (616) | Nc2+ (d6) | **d7 → Qe4** (best) | depth |
| g17 ply 31 (746) | Kf1 (d8, +530) | still Kf1 at d9, score falling 530 → 365 | depth (≥ d10) or tactics |
| g22 ply 25 (the loss, 468) | f5 (d6) | still f5 at **d8** (O-O-O best) | **eval**: king left in the centre |
| g24 ply 55 (698) | Rgf8 (d6, +200) | Rgh8 at d7, Nxh3 not found, still +180 vs SF −300 | **eval**: black king on e4 in a rook+minor middlegame |

Half the errors fall at one more ply, and they are the expensive ones (both of those losses). The other half are eval errors, which confirms the grandmaster's king-safety finding. There is also a **new, specific eval bug**. `is_endgame()` switches to `KING_EG_PST` as soon as the queens are off (Michniewski's rule), even with 2 rooks and 2–3 minors each. The king then gets +30–40 cp for walking to the centre. Queenless positions where we have ≥ 3 minors or rooks came up 257 times, and in 107 of them (42 %) our king was already on rank 3 or higher. Examples: g24 (Ke4 with rooks and minors on the board, 5 errors in that game), g21 ply 18 (Kd3 at move 10, next move −746), g11 ply 27 (Kd2 instead of O-O-O, −346), and g21 ply 32 (Kc5). A tapered phase-based eval fixes this directly.

**Tree shape is still poor.** Nodes per completed iteration in the re-runs:

| position | d6 | d7 | ratio |
|---|---|---|---|
| g20 ply 31 | 151k | 4.72 M | **×31** |
| g4 ply 22 | 200k | 2.64 M | ×13 |
| g24 ply 55 | 177k | 2.78 M | ×16 |
| g5 ply 57 | 438k | 2.85 M | ×6.5 |
| g17 ply 31 (d8 → d9) | 1.12 M | 6.73 M | ×6 |

The odd/even ×6–31 jumps are still here. The TT fixed the hash move but not quiet-move ordering: there are no killers, no history, no PVS, and qsearch has no SEE, so with queens on it explodes (g20). One extra ply is exactly what decided g20 and g5. At 0.25 s it costs 5–30× the nodes, and that is what ordering and pruning have to fix.

## 4. Time usage (still about 70 %)

41 % of moves (509) still end at the hard stop and throw away their last iteration. Their average depth is 7.2, against 7.9 for moves that stopped on the soft limit. In the re-runs, depth 6 finished in 22–60 ms and depth 7 in 270–620 ms. So a typical hard-stop move uses about 0.05 s, wastes about 0.19 s, and leaves the rest unused. The TT makes the cheap fix safe now. The root searches the previous best move first, so a partial iteration whose first move is finished is at least as good as the previous iteration. At 5 s the same fixed 40 % soft limit (2.0 s) with a 4.75 s hard stop wastes up to about 2.7 s per move.

## 5. Prioritised code changes (max 7)

1. **Killers (2 per ply) + history heuristic + PVS, and keep the TT move on fail-low** (`search.rs`: `ordered_moves` takes `ply` and `&self` tables; null-window search for moves after the first with a re-search on `alpha < s < beta`; in the store, keep `entry.mv` when `bound == Upper`).
   *Evidence:* ×6–31 node jumps from d6 to d7, and 3 of 6 retested errors (including loss g20) fixed by one extra ply.
   *Verify:* `make profile DEPTH=8` nodes should drop by ≥ 40 % with identical bestmoves on the bench FENs.
   *Expected:* +60–100 Elo, and it is the prerequisite for LMR.
2. **Null-move pruning + LMR** (`negamax`: R = 2 + depth/6, not in check, not at ply 0, not with pawns and king only, no two in a row, only when the static eval ≥ beta. LMR uses a log table, applies after 3 moves at depth ≥ 3, never to TT, capture, killer or checking moves, and re-searches on a fail-high).
   *Evidence:* 35 of 44 errors were at d6–7, and the d7 re-runs fixed half of them. Depth is the biggest lever.
   *Expected:* +150–250 Elo.
3. **Time management using the TT root order** (`search`): update `self.root_move` at ply 0 whenever a root move raises alpha, and on stop keep it if at least the first root move finished. Replace the fixed 40 % soft limit with "start d+1 only if `elapsed × last_iteration_ratio < hard_limit`". Hard limit `t − max(50 ms, t/40)`.
   *Evidence:* 41 % of moves discard their final iteration, and 30 % of the budget is unused.
   *Expected:* +30–60 Elo, and more at 5 s.
4. **Tapered eval + king safety + castling** (`eval.rs`): use a phase counter (N = B = 1, R = 2, Q = 4) to blend `KING_MG`/`KING_EG` and the other PSTs, removing the queenless switch to `is_endgame`. Add a pawn shield (+10–15 per shield pawn), a penalty for open or half-open files next to the king, an attacker count in the king zone scaled by phase, and a penalty for a king that left e1/e8 without castling while phase > 50 %.
   *Evidence:* g22 f5 still played at d8 (O-O-O best), g24 king on e4 with Stockfish at −300 to −1000 while the engine said +200, 107 queenless heavy positions with our king advanced, middlegame optimism +182 cp.
   *Expected:* +50–100 Elo.
5. **Check extension + in-check qsearch + SEE < 0 pruning in qsearch** (`negamax`/`quiescence`).
   *Evidence:* g17 Kf1 (a king move out of a knight check) still chosen at d9, and the qsearch explosion (×31) in the queen-heavy g20 position. Qsearch still stands pat in check.
   *Expected:* +40–70 Elo.
6. **TT for 5 s: 2-entry buckets** (depth-preferred slot plus always-replace slot, with a generation/age byte), a **PV taken from the TT** in `info`, and a cheaper `is_repetition` that scans only the last `halfmove_clock` plies with step 2 and needs 2 occurrences for positions from before the root.
   *Evidence:* several million stores per 5 s move into 2 M slots, nps down 9 %, and a `pv` that is still one move long.
   *Expected:* +10–30 Elo at 5 s, about 0 at 0.25 s.
7. **Passed pawns + mop-up** (`eval.rs`: rank-scaled passer bonus, king-to-edge term when ahead by at least a rook).
   *Evidence:* endgame optimism is still +240 cp. Endgame ACPL is better (34) but conversions are long (g26 221 plies, g20 166).
   *Expected:* +20–40 Elo in win rate and speed. Contempt can wait: no draw this run came from a position ≥ +1.3.

## 6. Next experiment

**Killers + history + PVS, plus the fail-low TT-move fix (item 1).** The TT has made the hash move reliable, and the remaining waste is quiet-move ordering: ×6–31 jumps per ply, with one extra ply fixing both losses I retested. It is cheap to verify without games, because `make profile` node counts to depth 8 should fall sharply with unchanged best moves. It is also the foundation that makes LMR (item 2) safe to add in the following run. Because the fast ladder is saturated at 0.85, judge it on nodes-to-depth and avg depth, and consider raising `TARGET_ELO` so later runs can resolve Elo again.
