# Engine-developer report for run `498eace`

Baseline: iterative deepening, plain alpha-beta negamax, MVV-LVA captures, capture-only quiescence, material + Michniewski PSTs, repetition = 0, time manager (no new iteration after 40 % of the budget, hard abort at ~95 %). No TT, PVS, null move, LMR, killers/history, check extensions, SEE. 30 games vs Stockfish 19 at UCI_Elo 1500/1600/1700, 0.25 s/move: 20 W / 5 D / 5 L, measured 1800 Elo (+/-146).

## Summary

- The engine is not slow, it is inefficient. It searches ~700 k nodes per move at 4-8 M nps and reaches depth 6; Stockfish reaches depth 14-15 on ~250 k nodes. The per-ply node growth of the baseline is 5-6x (measured), where an engine with a TT, killers, PVS and null move gets 2-3x. That factor alone is the whole depth gap.
- 61 % of every move's time budget is spent on an iteration that is then aborted and thrown away (no TT, nothing survives an abort). 666 of 1185 moves ended in a hard abort; the other 458 stopped at the soft limit after using on average 0.14 s of 0.25 s.
- Of the 14 worst blunders, 8 are refuted by a sequence of checks (three of them are forced mates of 3-4 moves consisting only of checks) that a capture-only quiescence cannot see; the engine needed depth 7-9 to avoid them, which it reached in none of those positions. Check extensions plus checks in quiescence are the cheapest fix for the largest single loss class.
- The static eval is systematically optimistic when the engine is worse: mean +430 cp vs Stockfish in positions Stockfish scores below -300 for us, and 40 % of all moves disagree by more than 200 cp. The missing terms are king safety (attacks against our king: game 26 Rd7 at "-20" in a position that is +9 for the opponent) and passed pawns.
- The five repetition draws all came from positions where the engine was worse (own eval -120 to -1085, Stockfish -24 to -996). Repetition = 0 gained 2.5 points; do not add positive contempt.
- The "max depth 127" in the summary is one move (game 30, ply 80) where every root move repeated a position and each iteration cost 2 nodes; it is harmless.

Recommended first change: a transposition table with TT-move ordering (details in the prioritised list).

## Evidence

All numbers are from `games/runs/498eace/moves.jsonl`, `analysis/498eace/analysis.json` and probing the committed binary `engine/target/release/engine.exe` on positions from the games (scripts in the session scratchpad; not committed).

### Depth, nodes and speed

| | value |
|---|---|
| engine moves | 1185 |
| completed depth: mean / median | 6.0 / 6 (d5: 356, d6: 456, d7: 205, d8: 73, d9: 26, d10+: 6) |
| depth by phase (analysis summary) | opening 5.5, middlegame 5.7, endgame 7.0 |
| depth by move number | moves 1-10: 5.55, 11-20: 5.59, 21-30: 5.92, 31-40: 6.04, 41-50: 6.60, 51-60: 7.31, 61-70: 9.11 |
| nodes per move (median, at d6) | ~700 k |
| nps: mean / median / range | 7.6 M / 7.1 M / 3.5-21 M (rises from 6.7 M in moves 1-10 to 11 M in moves 61-70 as the board empties) |
| Stockfish depth at the same 0.25 s | mean 14.8, median 14, on ~250 k nodes |

Per-iteration growth, measured with `go movetime 250` on 25 middlegame positions from the games: cumulative node ratio N(d)/N(d-1) median 7.5 (d2, d3), 5.2 (d4), 5.9 (d5), 4.9 (d6), 5.9 (d7). Depth 5 completes at a median of 31 ms, depth 6 at 67 ms, depth 7 at 178 ms. A typical iteration therefore costs 5-6x the previous one, which is the signature of alpha-beta with only MVV-LVA ordering and no hash move: good ordering approaches sqrt(b) ~ 5-6 for chess, i.e. we are getting almost nothing from move ordering for quiet moves, and we pay the full cost again at every iteration because nothing is remembered between them.

Example (game 11, ply 53 position): d5 36 k nodes, d6 239 k, d7 1.20 M, d8 7.6 M, d9 275 M (68 s). Stockfish needs depth 9 here only to see the mate in 4 by checks that quiescence-with-checks would find at depth 2-3.

### Time usage

- Mean time used 0.187 s of 0.25 s (75 %). Distribution: 579 moves at 0.24 s (hard abort at 237.5 ms = t - max(15 ms, t/20)), 458 moves between 0.10 and 0.20 s (soft limit: an iteration ended after 40 % of the budget), 65 moves under 0.05 s (mate found, or trivially forced position).
- Hard-aborted moves by completed depth: d4 15, d5 253, d6 254, d7 90, d8 40, d9 11, d10 3. Every one of these threw away the partial iteration. Measured on 25 game positions, the last completed iteration finished on average at 86 ms; the remaining 151 ms (61 % of the budget) went into an iteration that was aborted and discarded.
- Soft-stopped moves stopped at mean 0.137-0.151 s regardless of depth (d5 0.137, d6 0.143, d7 0.151, d8 0.146), leaving ~100 ms unused on 39 % of the moves. Given the measured growth factor of 5-6, starting another iteration at 0.14 s would not have finished by 0.2375 s, so the 40 % rule is roughly right *for this engine*; once the growth factor drops to 2-3 (TT + ordering) the rule becomes wasteful and should become predictive (start the next iteration if elapsed + last_iteration_time x growth < hard limit).
- Blunder rate is the same for soft-stopped (35/458 = 7.6 %) and hard-stopped (41/666 = 6.2 %) moves, so the soft limit is not itself a source of blunders; the depth reached is.
- Depth 127: one move (game 30, ply 80, Ka8, 257 nodes, 5 ms). All root moves repeat a position, `is_repetition` returns 0 at ply 1, each iteration costs ~2 nodes and the loop runs to 127. Harmless. The 30 moves at d2/d3 with ~230 nodes are `is_mate_score && depth >= 2` breaks (mate found), also fine.

### Blunders vs depth

76 engine moves lost >= 200 cp (analysis summary). About 5 of these are analysis artifacts rather than engine errors: the engine played Stockfish's own best move (game 16 Rb2+, game 21 bxc5, game 26 Kb7) or a faster mate (game 4 Rf1: our engine reports mate in 4 at d8, Stockfish depth 20 confirms 28.Re5+ ... 30...Rh1# is Black mating, i.e. the move was correct), and the "loss" comes from `arena/analyze.py` clipping mate scores at MATE_CP = 1000 cp so that a mate looks worse than a -1685 material eval. The analyzer should use a mate score above any material eval (e.g. 30000) and treat mate-to-mate transitions as 0 loss; this is an arena fix, not an engine one.

Blunder rate by completed depth (all 76): d4 3/32 (9.4 %), d5 26/356 (7.3 %), d6 33/456 (7.2 %), d7 8/205 (3.9 %), d8 3/73 (4.1 %), d9 3/26. Excluding mate-territory positions (|eval| >= 990): 54 real blunders, d4 3, d5 22, d6 22, d7 6, d8 1; by phase middlegame 41, opening 8, endgame 5. Two extra plies roughly halve the blunder rate.

Fixed-depth re-search of the 14 worst positions with the committed binary (first depth at which the engine no longer plays the blunder):

| game/ply | move (loss) | own eval / SF eval before (mover view) | refutation (Stockfish d16) | avoids at depth | class |
|---|---|---|---|---|---|
| 18 / 56 | Rf8 (-1843) | +515 / +846 | 29.Rc1+ Kd3 30.Ra3+ bxa3 31.Rc3# | d7 (d4 by luck) | all-check mate in 3 |
| 11 / 53 | axb7 (-1580) | +695 / +584 | 27...Qh2+ 28.Kf1 Qh1+ 29.Ke2 Qf3+ 30.Kf1 Rh1# | d9 (68 s) | all-check mate in 4 |
| 26 / 36 | Rd7 (-1314) | -20 / -896 | 19.Ra8+ Kb7 20.Qa7+ Kc6 21.Rb8 ... #10 | never (d8) | king attack not in eval |
| 25 / 75 | Qxf7+ (-1086) | -125 / -691 | 38...Kxf7 39.dxe5 Rxe5 40.Rd7+ ... -1526 | never (d8) | already lost, desperado |
| 20 / 43 | Nxg4 (-889) | +1065 / +889 | 23.Bxd6+ Kc8 24.Qxf7 Ne3+ ... perpetual (0) | d7 | checks; win thrown to a draw |
| 11 / 45 | Bxe6 (-754) | +525 / +136 | 23...gxf3 24.Nf5 Qxd2 25.Re3 ... -690 | d9 | quiet tactics, horizon |
| 25 / 69 | Qxc4 (-718) | +230 / 0 | 35...Qg5+ 36.Kh2 Qf4+ 37.Kg1 Qg4+ 38.Kh1 R8e3 -776 | never (d9) | checks + king safety |
| 8 / 8 | Bg4 (-622) | +55 / -48 | 5.a5 Nd4 6.cxd4 Bxf3 ... -654 (piece trapped) | d7 | quiet, horizon |
| 24 / 35 | Bxg2 (-542) | +145 / -13 | 19.Kxg2 Re5 20.Rg4 ... -550 (piece lost) | d4 (then d5-d9 play it) | capture without SEE |
| 3 / 135 | Kb2 (-944) | -1325 / -1361 | lost endgame either way | n/a | lost anyway |
| 4, 16, 21, 26/38 | | | | | analysis artifacts (see above) |

Eight of the ten real cases are refuted by lines containing 3-4 checks; in three of them the refutation is a forced mate made only of checks. The engine never gets to see them because quiescence stops at captures, and the main search would need depth 7-9 (0.4-68 s at current efficiency). Note also `quiescence` stands pat while in check: when the side to move is in check, `stand_pat >= beta` can return a fail-high from a position where the only legal replies lose the king, which is how a +695 "win" (game 11) survives to the root.

Across all 76 blunders: played move was a capture in 24, gave check in 7; the best move was quiet in 59 (capture 11, check 6). Before the blunder the engine was already optimistic vs Stockfish by a mean of 212 cp (median 162); after it, by a mean of 626 cp (median 552): the refutation was invisible at the depth reached. 17 of 76 blunders turned an engine-believed >= +100 into a Stockfish <= -100. 6 blunders allowed a mating attack (SF <= -1500 after the move).

### Eval disagreement with Stockfish (engine root score vs Stockfish depth-14 eval, mover view)

- n = 1116 comparable moves: mean engine - SF = +142 cp, mean |diff| 221 cp. |diff| > 100: 62 %, > 200: 40 %, > 300: 28 %, > 500: 8.5 %.
- The bias is one-sided: engine too optimistic by > 200 cp on 375 moves, too pessimistic on 74.
- By Stockfish balance: SF < -300: mean +430 (241 of 271 moves off by > 200); SF in [-300,-100): +239; SF in [-100,100): +70; SF in [100,300): -9; SF > 300: -5 (but 141 of 331 off by > 200 in both directions). The engine does not know when it is being attacked or outplayed positionally; in equal or winning positions it is roughly calibrated.
- By phase: opening mean |diff| 97 (37/300 over 200), middlegame 277 (263/520), endgame 249 (149/296). In the endgame 100 of 296 moves disagree by > 300 cp: material + PST cannot see passed pawns, king activity relative to pawns, or wrong-bishop draws.
- By completed depth: d5 +81, d6 +170, d7 +177, d8 +109, d9 +204. The optimism does not vanish with depth, so it is largely eval, not odd/even search parity. The +70 residual in equal positions is the usual stand-pat side-to-move bonus of a capture-only quiescence.
- Concrete cases: game 26 ply 36, `2krb2r/R1p2ppp/1p3n2/1q1p4/5B2/1PPP3P/4BPP1/Q4RK1 b`, material level, engine -20, Stockfish +9 for White (Ra7 + Qa1 + Bf4 against the c8 king); game 23 ply 104-112: engine -150, SF -450; game 29 ply 61-69: engine -145, SF -640; game 8 ply 126-134: engine -570, SF -990.

### Draws by repetition

All five draws (games 8, 23, 27, 29, 30) ended in threefold repetition initiated or accepted by the engine from positions where its own score was negative (-120, -145, -150, -580, -1085 on the move before it chose the repeating move) and Stockfish's score was -24, -440, -447, -627, -995 for the engine. Scoring the repetition as 0 was the correct decision every time and is worth 2.5 points in this run. Game 29 was +215 at ply 5 and fell to -533 with 15.f3 (-483 cp, a middlegame tactic), not through repetition. There is no evidence for contempt; if added, it must be sign-aware (only avoid repetition when our eval is clearly positive) or it will convert these half points into losses.

### Move ordering and search structure

- `ordered_moves` allocates a `Vec` of up to 48 moves at every node (including quiescence) and sorts it; quiet moves all get key 0 and stay in cozy-chess generation order. There is no hash move, no killer, no history, so the first quiet move tried at a node is essentially random; the 5-6x per-ply growth above is the direct consequence.
- The root does not order the previous iteration's best move first, so an aborted iteration cannot even be partially trusted; `search` simply discards it (`if self.stopped { break }`).
- `is_repetition` scans the whole stack (game history plus path) at every interior node: O(ply + game length) per node, ~100-150 comparisons late in a game. Cheap relative to eval today but should skip by 2 and stop at the last irreversible move once nps work starts.
- `evaluate` iterates all pieces of both sides every call (called once per quiescence node, i.e. the majority of nodes); an incremental PST/material score updated in make-move would remove most of it. Speed is however not the bottleneck: 4-8 M nps is competitive; the node count per ply is the problem.

## Mapping diagnosis to technique

| diagnosis | evidence | technique |
|---|---|---|
| 5-6x nodes per extra ply; aborted iterations wasted (61 % of budget); depth 6 vs SF 14 on 3x the nodes | per-iteration node ratios; 666/1185 hard aborts | transposition table (hash move, bounds, depth), then PVS |
| quiet-move ordering is random | all quiets key 0; growth factor | killer moves, history heuristic, previous-best first at root |
| blunders refuted by check sequences; stand pat while in check | 8 of 10 real worst cases; g18/g11 all-check mates | check extension; checks in quiescence (or at least: no stand pat and full evasion search when in check) |
| tactics needing d7-d9 in 0.25 s | fixed-depth re-search; blunder rate halves from d5/6 to d7/8 | null-move pruning, LMR (effective depth +2-3 at equal nodes) |
| losing captures played (Nxa8, Bxg2, Bxe6, Qxc4, Nxg4, Bxc7) | 24/76 blunders were captures | SEE for capture ordering and quiescence pruning |
| optimism of +430 when losing; king attacks invisible; endgame off by > 300 in 1/3 of moves | eval-disagreement tables; g26 Rd7 | king safety, tapered eval, passed pawns |
| 39 % of moves stop at 0.14 s; 61 % of budget on discarded work | time histogram; probe | predictive soft limit; use partial iteration when previous-best was searched first |
| draws only from lost positions | draw table | no contempt (or sign-aware only) |
| per-node Vec allocation, full eval per node, O(n) repetition scan | code reading; nps 4-8 M | stack move list, incremental eval, bounded repetition scan (later) |

## Prioritised changes for `engine/` (max 7)

1. **Transposition table with hash-move ordering** (`search.rs`). Fixed-size table keyed by `board.hash()` (cozy-chess already provides Zobrist), entries {key, depth, score bound, best move}; probe at every `negamax` node for cutoffs when `entry.depth >= depth`, always try the TT move first, store on exit. Also order the previous iteration's root best move first. Evidence: per-ply node growth 5-6x; 61 % of the budget spent on discarded iterations; 666/1185 moves hard-aborted; Stockfish reaching d14 on fewer nodes than we spend on d6. Expected: +1 ply immediately (growth to ~3-4x), aborted iterations become useful because their nodes are in the table for the next move, and every later change (PVS, null move, LMR, killers) depends on having a hash move. **+80-120 Elo.** This is the change to make first: it has the largest multiplier, it is prerequisite for the pruning techniques, and it turns the current time-manager waste from a loss into a carry-over.

2. **Check-aware quiescence and check extension** (`search.rs`). In `quiescence`, if the side to move is in check: no stand pat, generate all evasions, mate detection. Optionally generate checking moves at the first quiescence ply. In `negamax`, extend by one ply when in check (`depth + 1` on the child when `child.checkers()` non-empty), with a cap on total extension per path. Evidence: 8 of the 10 real worst blunders are check sequences (g18 Rf8 mate in 3, g11 axb7 mate in 4, g20 Nxg4 perpetual, g25 Qxc4), 6 blunders allowed a mating attack, and the engine needed d7-d9 to see them. **+40-70 Elo**, and it removes the losses with the highest cp cost.

3. **Killer moves and history heuristic, plus PVS** (`search.rs`). Two killers per ply, a butterfly history table for quiet moves indexed by [side][from][to], ordering: TT move, winning captures (MVV-LVA), killers, history-sorted quiets, losing captures. Then principal-variation search (zero-window on non-first moves, re-search on fail high). Evidence: all quiet moves have ordering key 0; measured growth factor 5-6x; PVS only pays once ordering is decent. **+40-70 Elo.**

4. **Null-move pruning and late-move reductions** (`search.rs`). Null move: when not in check, depth >= 3, non-pawn material present, `board.null_move()` with R = 2-3, fail-high cut. LMR: reduce late quiet moves by 1 ply (2 for very late at higher depth), re-search at full depth if they beat alpha. Evidence: blunder rate 7.3 % at d5/6 vs 3.9 % at d7/8; the fixed-depth re-search shows d7-d9 needed in most real blunder positions; these two techniques are what let Stockfish-class engines convert the same node budget into +3 plies. **+80-120 Elo** combined, given 1-3 are in place.

5. **Eval: king safety and tapered evaluation with passed pawns** (`eval.rs`). Tapered mg/eg phase (replace the binary `is_endgame` switch), king-zone attack counting with a pawn-shield term, passed-pawn bonus scaled by rank and phase, plus an incremental material/PST score so the added terms do not cost nps. Evidence: mean +430 cp optimism when Stockfish has us worse than -300; g26 Rd7 at -20 vs -896 (mating attack against our king with level material); 100/296 endgame moves off by > 300 cp; 40 % of all moves off by > 200. **+40-60 Elo.**

6. **Time manager: predictive soft limit and usable partial iterations** (`search.rs`, `main.rs`). Replace the fixed 40 % rule with: start the next iteration only if `elapsed + last_iteration_time * growth_estimate < hard_limit`, with the growth estimate measured from the last two iterations; and, when the root searches the previous best move first, accept a partial iteration's move if it beat the previous best. Keep the ~5 % reserve (0 timeouts in 30 games shows it is enough). Evidence: 458 moves stopped at mean 0.14 s leaving 100 ms; after change 1 the growth factor drops and the 40 % rule starts to waste that time on most moves; 61 % of budget currently discarded. Also skip the deepening loop when there is a single legal move (the depth-127 case). **+15-30 Elo.**

7. **SEE for captures and speed work** (`search.rs`). Static exchange evaluation to (a) skip captures with SEE < 0 in quiescence, (b) order losing captures after killers. Then micro-work: replace the per-node `Vec` in `ordered_moves` with a fixed-capacity stack array, incremental eval, repetition scan bounded by the halfmove clock and stepping by 2. Evidence: 24/76 blunders were captures (Nxa8, Bxg2, Bxe6, Qxc4, Nxg4, Bxc7 all lose material to quiet replies); nps 4-8 M is fine but per-node allocation and full eval are the two obvious costs. **+20-40 Elo** (mostly from SEE; speed alone is worth ~10 % nodes, ~+10 Elo).

Not recommended: contempt. All five repetition draws were rescued half-points from lost positions; a positive contempt would have made the engine avoid them.

Expected total if all seven land and are tuned: roughly +300-400 Elo over the baseline, i.e. from ~1800 to 2100-2200 at 0.25 s/move, with depth 9-10 in the middlegame at the same node budget.
