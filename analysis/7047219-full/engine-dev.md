# Engine-developer report for run `7047219-full` (5 s/move)

Baseline that played: commit `7047219` (iterative deepening, plain alpha-beta, MVV-LVA, capture-only quiescence, material + Michniewski PSTs, repetition = 0, soft limit 40 %, hard abort at 4.75 s). No TT. 30 games vs Stockfish 19 at UCI_Elo 1500/1600/1700: 21 W / 2 D / 7 L, 1785 Elo (±144), avg depth 7.5, 3.66 s used of 5. This report builds on `analysis/498eace/engine-dev.md` (0.25 s/move) and only repeats numbers where they changed.

## Summary

- **20x more time bought 1.5 plies** (6.0 → 7.5) and no Elo (1800 → 1785, within noise). The effective branching factor is still 5.8 per ply (measured), so time does almost nothing for this engine; only search efficiency will.
- **Time manager wastes 53 % of the budget at 5 s**: 46 % of moves were hard-aborted, and in those the last completed iteration finished at 1.2 s on average, so 75 % of their budget went into a discarded iteration; the other 46 % stopped at the 40 % soft limit at 3.1 s and left 1.9 s unused. Total: 39 % of all time discarded, 14 % unused. At 0.25 s the discarded share was 61 %.
- **Blunders cliff at depth 9**: real blunder rate 6.8 % at d7, 4.9 % at d8, **0 % at d9 (0/125)**. The cheapest way to reach d9-10 in the middlegame (2.0-3.0 s today) is search, not hardware.
- **Thrown games verdict: the decisive blunders are search, the slides that preceded them are eval.** Of the ten moves that decided games 1, 11, 12, 15 and 19, six are found by the baseline itself one to three plies deeper (game 11 Rad1 and a4 at d8, game 19 Qxc7 at d8 and Kh2 at d10, game 15 b5/c5 at d9), and four of those six are refuted by sequences of 2-4 checks (perpetual or mate) that a capture-only quiescence cannot see. The other four (game 1 Rd3, game 12 Kf7, game 15 Ng3, game 19 f5) are still played at d9-11 and are pure evaluation gaps: king safety (games 1, 19) and endgame activity/passed pawns (games 12, 15). So: **search first (checks, ordering, pruning), then eval; the eval fixes are needed to convert, not to survive.**
- Eval disagreement >200 cp with Stockfish fell from 40 % to 34 % of moves, but the optimism when losing did not move (+430 → +462 cp when Stockfish has us below -300). It is a missing-term problem, not depth.
- Both draws were forced (game 1 repetition from -560, game 19 perpetual after a blunder). Still no case for contempt.
- 4 of the 12 "worst moves" in `summary.md` are mates the engine found (game 4 O-O-O M4, game 16 a2 M5, game 24 Qg1, game 29 Be5 M4), and 3 more are the engine playing Stockfish's own best move (games 10, 18, 21): the analyzer's 1000 cp mate clip is still polluting the table. Arena issue, not engine.

## Evidence

Sources: `games/runs/7047219-full/moves.jsonl`, `analysis/7047219-full/analysis.json`, the annotated PGNs, plus re-runs of game positions with a scratchpad build of commit `7047219` and Stockfish 19 (`tools/stockfish/`) via python-chess. Scripts live in the session scratchpad, not in the repo.

### Depth, nodes, speed (what changed at 5 s)

| | 0.25 s (498eace) | 5 s (this run) |
|---|---|---|
| completed depth mean / median | 6.0 / 6 | 7.47 / 7 (d6 150, d7 431, d8 335, d9 162, d10 56, d11+ 24) |
| depth by phase | 5.5 / 5.7 / 7.0 | 6.9 / 7.3 / 8.1 |
| nodes per move (median) | ~0.7 M | 10.3 M (mid), 12.6 M (end) |
| nps (engine-reported, mean) | 7.6 M | 5.3 M opening, 5.9 M middlegame, 7.5 M endgame |
| Stockfish nodes per move (median) | 250 k | 4.0 M |

Per-iteration growth measured on 36 sampled game positions (12 per phase) at `go movetime 5000`: cumulative node ratio N(d)/N(d-1), median: d4 5.9, d5 6.3, d6 5.8, d7 5.8, d8 4.7. Median wall time to complete a depth: d6 0.19 s, d7 0.79 s, d8 1.37 s, d9 2.0 s, d10 3.0 s (d8+ figures carry survivorship bias: only 14/36 positions reached d8 within the budget). Nothing has changed since 0.25 s: quiet moves are still in generation order, so a ply costs ~5.8x. The in-progress TT run (`games/runs/7308d5b`, 0.25 s) reaches depth 7.42 where the baseline reached 6.0 at the same time control, i.e. the hash move alone is worth +1.4 plies; the ordering work in the prioritised list is what brings the factor toward 3.

Note the nps drop in the opening/middlegame (3.9-4.1 M in the last iteration on the probe sample vs 7.3 M in the endgame). The full-board `evaluate` at every quiescence node and the per-node `Vec` in `ordered_moves` are the two costs; not the bottleneck, but a free 10-15 % once the search is efficient.

### Time usage

- Histogram of seconds used (1214 engine moves): 78 moves <0.25 s (mate found / forced), 14 between 0.25 and 2 s, 559 between 2.0 and 4.7 s (soft-stopped: an iteration ended after the 40 % mark, mean 3.14 s), **563 at 4.75 s (hard-aborted, 46 %)**.
- Hard-aborted by completed depth: d6 110, d7 236, d8 141, d9 59, d10 14, d11 3. Every one threw the running iteration away.
- On the 36-position probe, 20 were hard-aborted; their last completed iteration ended at a mean of 1.2 s, so **74.7 % of the 4.75 s (median 72.5 %) was spent on the discarded iteration**. The 16 soft-stopped positions stopped at 3.42 s, leaving 31.6 % unused; in none of them would the next iteration have fitted (5.8x growth from 3.4 s = 20 s), so the 40 % rule is correct *for this growth factor* and becomes wrong the moment the TT/ordering drop the factor to 2-3.
- Over the whole budget: 39.4 % discarded + 14.1 % unused = **53.5 % of the time produced no completed iteration** (was 61 % discarded at 0.25 s).
- Blunder rate: hard-aborted 6.4 % (36/563), soft-stopped 4.5 % (25/559). The difference is the depth reached, not the abort.
- Probe depth equalled game depth in 29/36 positions (the 7 differences were all one ply lower in the probe: the machine was busier during the probe), so the timing above represents the run.

### Blunders vs depth

67 moves lost ≥200 cp; 48 are "real" (Stockfish |eval| < 990 before the move; the rest are mate-territory or analysis artifacts). By completed depth: d6 4/136 (2.9 %), **d7 27/399 (6.8 %)**, d8 14/286 (4.9 %), **d9 0/125**, d10 2/47, d11 1/13. By phase: middlegame 36, endgame 9, opening 3.

Stockfish (depth 18) refutations of the 48: the opponent gives **≥1 check in 22, ≥2 checks in 14, and 5 lead to forced mate**; the first reply is quiet in 28; only 3 refutations contain neither a check nor a capture in the first four moves. The engine played a capture in 12 and a check in 3. Before the blunder the engine was already optimistic by a mean of 163 cp versus Stockfish.

Fixed-depth re-search with the baseline binary (`go movetime 60000`, so iterations up to ~55 s; the move printed per depth is the root move):

| game/ply | move (loss) | own / SF before (mover) | refutation (SF d22) | played at | avoided at | class |
|---|---|---|---|---|---|---|
| 19/76 | Qxc7 (-996) | +390 / 0 | Qf2+ Kh1 Qxh4+ Kg2 Rf2+ Kg1 Qh2# | d7 | **d8** (Qa8+) | 4 checks, mate: qsearch checks |
| 19/68 | Kh2 (-354) | +350 / +354 | Nf3+ gxf3 Qf2+ Kh1 Qxf3+ perpetual | d8 | **d10** (Kh1) | 3 checks: qsearch checks / check ext |
| 15/61 | b5 (-826) | +95 / -170 | Nf5 bxc6+ Kxc6 Rf3 R8d4+ Nxd4+ Rxd4# | d8 | **d9** (f5) | 2 checks, mate in 4 |
| 15/63 | c5 (-461) | -85 / -535 | Nf5 c6+ Kc8 Rf3 R3d4+ Nxd4 Rxd4# | d8 | **d9** (f5) | same mate |
| 11/37 | Rad1 (-796) | +240 / +424 | Rbf8, Re2, Rf3 (quiet pile-up on f-file) | d7 only | d5, d6, **d8** all play f4 | odd-ply instability; one more ply |
| 11/43 | a4 (-537) | +275 / 0 | Rf8 Ra1 g6 Ra3 Qf4+ ... | d7 | **d8** (Nf3) | one more ply |
| 3/67 | Red1 (-950) | -395 / -713 | Re2 Rf1 Re1 ... | d8 | **d9** (Rb1) | one more ply |
| 1/59 | Rd3 (-633) | -40 / -1003 | Bxh3 Bxh3 Nxh3 Qg3 Nf4+ ... #-9 | d5-d9 | never (d9: own -185) | king attack invisible to eval |
| 1/49, 1/51 | gxh3, Bf1 (-264, -289) | +40 / -252, -435 | Nf4, Rfg8+, f4-f3 | d8, d7 | never / d9 | king safety eval |
| 12/32 | Kf7 (-322) | +235 / +547 | b5 axb5 Rxb5 (quiet) | d6-d9 | never | endgame eval (activity, passers) |
| 12/48, 12/72 | d5, b5 (-271, -229) | +140 / +251, +110 / 0 | Rf8 ... Re8+; axb6 Rd7 | d10 | d11 / never | rook-endgame technique |
| 15/57 | Ng3 (-338) | +140 / 0 | Rfd7 Ne2 Rd2 (rook to 7th) | d8, d9 | never | eval: rook activity |
| 19/22 | f5 (-303) | +130 / +517 | Bd7 Qd2 Nf7 (quiet) | d7, d8 | never | eval: opponent's king stuck in centre |
| 2/32 | Qxa4 (-474) | +215 / +424 | Qxb2 Nb6 Ra1 Nxc4 | d8-d10 | never | eval/SEE: quiet win of material |
| 4/44, 16/94, 24/111, 29/57 | O-O-O, a2, Qg1, Be5 | engine reports M4/M5/M4 | | | | analyzer mate-clip artifacts |

Static evaluation at the eval-class positions (baseline `eval` command vs Stockfish depth-1 and depth-18, mover's view): game 1 ply 51 **+90 vs -471 / -514**, ply 59 **+140 vs -550 / -985** (material level or +1, black rooks on g/h-files against the h1 king); game 19 ply 22 **+120 vs +454 / +543** (level material, black king on f8 with rook on h8, no development); game 12 ply 32 **+215 vs +379 / +505** and ply 72 **+260 vs -2 / -55** (the engine values the position by material +2 in both, Stockfish by activity and passers); game 15 ply 57 **+195 vs -12 / 0** (extra pawn, but passive rooks). The PST-only eval has no notion of who is attacking whom.

### Eval disagreement with Stockfish (engine root score vs SF depth-14, mover view, |SF| < 990, n = 1007)

- mean engine - SF = **+110 cp** (was +142), mean |diff| 179 (was 221). |diff| > 100: 52.7 %, **> 200: 33.8 %** (was 40 %), > 300: 22.0 %, > 500: 7.2 %.
- One-sided: too optimistic by > 200 on 279 moves, too pessimistic on 61.
- By Stockfish balance: SF < -300: **+462** (180 of 182 moves off by > 200); [-300,-100): +271; [-100,100): +85; [100,300): +7; > 300: **-98** (81 of 210 off by > 200, all pessimistic).
- By phase: opening -5 (|d| 60), middlegame +141 (|d| 216; 164/444 over 200), endgame **+189** (|d| 252; 157/263 over 200, 102 over 300). 100 endgame moves are optimistic by > 300; 37 of them are game 1, 24 game 30, 13 game 26.
- By depth the optimism *grows* (d6 +33, d7 +64, d8 +164, d9 +170, d10 +187), but that is phase mix, not parity: within equal middlegames even depths give +149 and odd +139, and in the opening the bias is flat at every depth. Deeper searches happen in the endgame, where the eval is worst.
- The 61 pessimistic moves in winning positions are also instructive: game 25 plies 5-13 (engine +330-375, SF +705-760: an extra piece for two pawns plus the opponent's uncastled king), game 19 plies 18-22 (+105-130 vs +479-517, same theme), game 24 endgame (+305 vs +655, connected passers). Under-valuing a win is how game 19 became a draw: the engine did not know it was winning, chose slow moves, and let the initiative go.

### The two draws

- Game 1: repetition from ply 151 with the engine at own -205 to -265 and Stockfish -560 (rook + knight vs rook, a pawn down). Correct decision, half a point rescued.
- Game 19: after 39.Qxc7?? the position is a forced perpetual at best (Stockfish's 1500-Elo side even missed 41...Qxh4+ mating). The engine scored +390, +320, +325 during the perpetual (plies 70-76) because the checks repeat beyond its horizon; there was no better move to find.
- Neither would have been improved by contempt; a positive contempt would have hurt game 1.

## Diagnosis to technique

| diagnosis | evidence | technique |
|---|---|---|
| EBF 5.8/ply unchanged; +1.5 ply for 20x time; d9 has 0 % blunders but costs 2-3 s | probe ratios; blunder-by-depth table | TT with hash move (in test), then killers + history + PVS |
| 6 of 10 decisive moves in thrown games found 1-3 plies deeper; 4 refuted by check sequences; 14/48 blunders have ≥2 checks, 5 are mates | fixed-depth table; SF refutations | check extension; quiescence with checks at the first ply and full evasions when in check |
| middlegame depth 7.3 vs the 9-10 needed | time-to-depth; blunder cliff at d9 | null move (R = 2-3) and LMR |
| 46 % hard-aborts discard 75 % of their budget; 46 % soft-stops leave 1.9 s | time histogram; probe | predictive soft limit from measured iteration ratio; keep partial iteration once the root orders the previous best first |
| eval blind to attacks on either king (game 1 +140 vs -985; game 19 f5 +120 vs +454) | static eval table | king safety: pawn shield, attackers in king zone, open files toward the king |
| eval blind in endgames: +189 mean optimism, 102/263 moves off by > 300; games 12, 15 converted a +5.5 / +2 into a loss with quiet moves | phase table; game 12 static | tapered eval, passed pawns (rank, free path, king distance), rook activity (open/7th), king centralisation already there via KING_EG |
| 12/48 blunders were captures with a quiet refutation (Qxa4, gxh3 x2, Nxa4, Qxd6, Rxb7, Rxh4, cxb5) | SF classification | SEE in ordering and quiescence pruning |
| nps 3.9-4.1 M in the opening/middlegame vs 7.3 M endgame | probe nps | incremental material/PST, stack move list, bounded repetition scan |
| draws only from lost/forced positions | draw section | no contempt |

## Prioritised changes for `engine/` (max 7; assumes the TT with hash-move ordering is already in test)

1. **Check-aware quiescence and check extension** (`search.rs`: `quiescence`, `negamax`). In `quiescence`: if `board.checkers()` is non-empty, no stand pat, generate all evasions, return mate if none; at the first quiescence ply also generate quiet checking moves (cozy-chess: filter quiets whose child has checkers). In `negamax`: when the child is in check, search it at `depth` instead of `depth - 1`, capped at one extension per two plies. Evidence: game 19 Qxc7 (mate in 4 by checks, avoided at d8), game 19 Kh2 (perpetual by checks, d10), game 15 b5/c5 (mate in 4, d9), game 11 Qd3 (mate in 3, d6), game 17 Kc8, game 18 Rfe8, game 26 Ra7/Rxh4, game 27 Rxb7; 14 of 48 real blunders are refuted by ≥2 checks, 5 by forced mate; 3 of the 5 thrown games hinge on one of these. Cost: ~10-20 % more nodes. **+50-80 Elo.** This is the single change I would make next after the TT: it is independent of the TT tuning, low-risk, and directly removes the losses with the highest cp cost.

2. **Killer moves + history + PVS** (`search.rs`: `ordered_moves`, `negamax`). Two killers per ply, butterfly history `[side][from][to]` bumped by depth² on quiet fail-highs and aged per move; order TT move, captures by MVV-LVA (or SEE, see 6), killers, quiets by history. Then zero-window search on every move after the first with a full re-search on fail-high. Evidence: quiet moves still all key 0; measured EBF 5.8; the TT alone gave +1.4 ply at 0.25 s (7308d5b); blunder rate 6.8 % at d7 vs 0 % at d9. Verify by `make profile`: nodes to depth 8 should fall by 40-60 %. **+60-100 Elo.**

3. **Null-move pruning + LMR** (`search.rs`). Null move: not in check, depth ≥ 3, side to move has a non-pawn piece, R = 2 + depth/6, no two nulls in a row, verification skipped. LMR: after the first 3 moves at depth ≥ 3, reduce quiet non-killer, non-check moves by `ln(depth)·ln(move)/2`, re-search at full depth on fail-high. Evidence: middlegame depth 7.3, d9 needed (0/125 blunders), time to d9/d10 2.0/3.0 s median today; 28/48 blunders had a quiet first refutation that lies 2+ plies beyond the horizon (games 11 Rad1/a4, 3 Red1, 12 d5). **+100-150 Elo** with 2 in place; zugzwang risk only in pawn endgames, which the material check excludes.

4. **Time manager for 5 s** (`search.rs::search`). Replace the 40 % rule with: measure `t_last` and the ratio of the last two iterations, start the next iteration only if `elapsed + t_last × ratio × 0.8 < hard_limit`; otherwise stop. With the TT in place, order the previous iteration's best move first at the root and, on abort, accept the partial iteration's move if the first root move completed and its score is not below the previous iteration's minus 30 cp. Keep the reserve at 5 % (0 timeouts, max 4.753 s). Evidence: 563 moves (46 %) hard-aborted with 75 % of their budget on a discarded iteration; 559 moves stopped at 3.1 s with 1.9 s unused; once changes 1-3 cut the ratio to ~2.5-3, the fixed 40 % rule will start throwing away an iteration that would have fit on most moves. **+30-50 Elo** (larger the better the ordering gets).

5. **Evaluation: tapered phase, king safety, passed pawns, rook activity** (`eval.rs`). Replace `is_endgame` with a 0-24 phase and interpolate mg/eg tables; king safety as (pawn-shield missing squares + number/weight of enemy pieces attacking the 3x3 zone) scaled by phase; passed pawns by rank (eg-heavy) with a bonus when the path is free and a penalty when the enemy king is closer than ours; rook on open/half-open file and on the 7th. Add the material/PST sum incrementally in `Searcher` when this lands so nps does not drop. Evidence: game 1 static +140 when Stockfish says -985 (two rooks and a knight on the h1 king), game 19 f5 (+120 vs +454, opponent's king uncastled), game 12 (+215 vs +505 and later +260 vs -2: passers and rook activity decided the game), game 15 Ng3 (+195 vs 0), endgame optimism +189 mean with 102/263 moves off by > 300, 4 of the 10 decisive moves in the thrown games not fixable by depth. **+60-100 Elo** over two or three runs; measure by the disagreement statistic (target: < 25 % over 200 cp, endgame mean bias < +80).

6. **SEE for capture ordering and quiescence pruning** (`search.rs`). Static exchange on the target square; in `ordered_moves` put SEE < 0 captures after killers, in `quiescence` skip them (except when in check). Evidence: 12/48 blunders were captures with a quiet refutation: game 2 Qxa4 (-474, d8-d10 still play it), game 7 gxh3/Nxa4, game 6 Qxd6, game 26 Rxh4/cxb5, game 27 Rxb7; pessimism of -98 in winning positions partly comes from the capture-only quiescence trading down. **+20-40 Elo.**

7. **Speed: incremental eval, stack move list, bounded repetition scan** (`search.rs`, `eval.rs`). Keep a running material+PST pair updated in make-move (needs the phase from 5), replace the per-node `Vec` with a fixed `[Move; 218]` array, and scan repetitions only back to the last irreversible move in steps of 2. Evidence: opening/middlegame nps 3.9-4.1 M in the last iteration vs 7.3 M in the endgame; `evaluate` walks all 64 squares' worth of bitboards on every quiescence node, `is_repetition` scans the whole stack. Verify by identical node counts and higher nps in `make profile`. **+10-20 Elo** (10-15 % nodes).

Not recommended: contempt (both draws were forced or rescued), larger reserve (0 timeouts), a bigger TT for its own sake (peak RAM 4.7 MB now; the 64 MB table in test is fine).

Arena note (not an engine change): `arena/analyze.py` still clips mate at 1000 cp, so 7 of the 12 "worst engine moves" in `summary.md` are mates the engine found or Stockfish's own best move. Treating mate-to-mate transitions as 0 loss would make the summary table trustworthy.

Expected total if all seven land: +300-450 Elo over this baseline at 5 s, with depth 10-12 in the middlegame at the same node budget.
