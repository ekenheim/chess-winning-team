# Engine-developer review of `dd6c58b`

Experiment: the king table is now tapered by a material phase (N = B = 1, R = 2, Q = 4, max 24), replacing the `is_endgame()` switch. King danger was added (shelter pawns, files next to the king with none of our pawns, king on files c–f, lost castling rights) and faded out by phase. The change is eval only, on top of the baseline search, with no TT.
Result: Elo 1892 ±169, W/D/L 23/4/3. That is within noise of the baseline (1915, 25/1/4) and was discarded.

Sources: `git show dd6c58b -- engine/`. The run artifacts were no longer in the working tree (the loop had reverted and moved on), so I extracted `analysis/{63ccb08,ad95e70,dd6c58b}` and `games/runs/*` from commits `a1004d8` and `3a5b460` into a scratch directory. Nothing was rebuilt. I re-ran 4 error positions for 1 s each with the binary currently in `engine/target/release/engine`. That binary is the in-flight `97aee56` build (TT + killers + history + PVS, **baseline eval**), not dd6c58b.

A definition used below: a **real error** is a move that lost ≥ 200 cp, was not Stockfish's best move, and was played when Stockfish's eval was between −300 and +400 for us.

## 1. Verdict: mostly slower, not wrong. There is one real bug, and the eval is still blind to attacks

| | 63ccb08 (base) | ad95e70 (TT) | dd6c58b (king safety) |
|---|---|---|---|
| avg depth: opening / middlegame / endgame | 5.56 / 6.08 / 6.67 | 6.63 / 7.21 / 8.65 | 5.40 / 5.74 / 6.54 |
| median in-game nps (moves > 0.1 s) | 8.68 M | 7.93 M | 7.07 M (−19 %) |
| host load during the run | 2 parallel games | 2 + concurrent bench-full | **4 parallel + 4 from bench-full** |
| moves ending at the hard stop (iteration thrown away) | 47 % | 41 % | 48 % |
| middlegame, balanced (\|SF\| < 300): ACPL / ≥ 200 cp errors | 64.3 / 27 of 285 | 54.5 / 14 of 196 | 67.2 / 28 of 243 |
| real errors, opening + middlegame | 31 | 26 | 37 |
| **games where the engine castled** | 14 / 30 (12 O-O, 2 O-O-O) | 13 / 30 | **26 / 30 (22 O-O, 4 O-O-O)** |
| median ply of castling | 19 | 11 | **9** |
| king moves (not castling) in the first 40 plies | 27 | 44 | **12** |
| positions with the enemy queen on and our king on c–f with no rights | 229 | 217 | **112** |
| engine optimism in the middlegame (engine score − SF), mean | +138 | +162 | +169 |
| same, when our king is exposed | +259 | +310 | +313 |

**Slower.** The −0.3 ply in the middlegame fits a 19 % nps loss at this branching factor. Two effects are mixed together and this run can't separate them:
1. **Host contention.** The run shared the machine with 8 engine processes, against 2 for the baseline, on a 10-core M1 Pro with 8 performance and 2 efficiency cores. There were 14 moves within 3 % of the limit and a max of 0.265 s, against 0 and 0.242 s in the baseline. That is a scheduler signature, not an eval signature.
2. **The eval cost itself.** `king_danger` × 2 adds about 40–60 branchy ops per `evaluate` on top of a ~32-piece PST loop. `evaluate` runs at every qsearch stand-pat. My estimate is −8 to −12 % nps from the code and the rest from load. The `make profile` 8.4 → 6.5 M (−23 %) figure is only trustworthy if both builds were profiled back to back on an idle machine. Re-measure that way before blaming the eval.

**Not wrong, as behaviour.** The term did exactly what it was designed to do: castling nearly doubled, early king walks fell by 55 %, and uncastled-centre exposure with queens on halved. The headline "middlegame ACPL 58 → 77, blunders 48 → 69" is mostly the tail: 25 of the 69 came from already-decided positions (\|SF\| > 500). In balanced middlegames, ACPL went 64 → 67 and the error rate 9.5 % → 11.5 %. That is the price of −0.3 ply, not of a bad term.

**The "endgame ACPL 82 → 41" is not a taper win either.** In balanced endgames it went 40 → 49. The raw drop comes from fewer mate-distance and clamp artefacts in won endings: 29 → 11 losses of ≥ 200 cp in \|SF\| > 500 positions, and baseline game 16 alone had 17. Don't credit the taper with a large endgame gain. It is neutral to slightly positive.

**One real bug: queenside castling is penalised as "king in centre".** `(2..=5).contains(&kf)` includes the c-file. After O-O-O the king sits on c1/c8 with no rights, so it gets `KING_IN_CENTRE + KING_CANNOT_CASTLE` = **−40 cp** at full phase for having castled. The penalty lasts until a later `Kb1`, which costs a tempo (loss game 3, `10.Kb1`). The same applies to an f1 king that is sheltered. Four O-O-O were played this run (games 3 and 30 among them).

**Smaller eval issues:**
- **Scaling.** The term is scaled by *total* phase, not by the enemy's attacking material. It still counts at ⅔ weight with queens off (R+R+N+B each side = 16/24), where the grandmaster wanted it near zero.
- **Open files.** "Open file" means only "none of *our* pawns". It doesn't matter whether an enemy rook or queen stands on it, so a half-open file with an enemy rook on it (game 3, the a-file) scores the same as a quiet one.
- **No attacker term**, which is where the remaining king losses come from (section 3).

## 2. Is `king_danger` efficient? No. It's a branchy loop that can be about 12 branchless ops

What it costs now, per call:
- up to 3 loop iterations, each with a closure, two range checks, a variable shift and a 3-way branch;
- a `castle_rights()` lookup;
- a second `board.king()` call;
- the whole thing runs even when `phase == 0`, where its weight is zero;
- two integer divides per side, which compile to mul-shift but are still redundant.

A cheaper formulation, the same terms without the c-file bug, and still Windows- and ARM-portable:

```rust
// precomputed once (const fn or lazy array): ADJ[f] = file byte mask of f-1..f+1 (e.g. f=0 -> 0b011)
#[inline] fn file_byte(bb: u64) -> u64 { let mut x = bb; x |= x >> 32; x |= x >> 16; x |= x >> 8; x & 0xFF }
#[inline] fn rank_byte(bb: u64, r: i32) -> u64 { if (0..8).contains(&r) { (bb >> (8 * r)) & 0xFF } else { 0 } }

fn king_danger(board: &Board, color: Color, ksq: Square) -> i32 {
    let (kf, kr) = (ksq.file() as usize, ksq.rank() as i32);
    let fwd = if color == Color::White { 1 } else { -1 };
    let pawns = (board.pieces(Piece::Pawn) & board.colors(color)).0;
    let adj = ADJ[kf];
    let s1 = rank_byte(pawns, kr + fwd) & adj;                // shield one rank ahead
    let s2 = rank_byte(pawns, kr + 2 * fwd) & adj & !s1;      // ... two ranks ahead only
    let open = adj & !file_byte(pawns);                       // files next to the king with none of our pawns
    let missing = adj.count_ones() - s1.count_ones() - s2.count_ones();
    let mut d = (SHELTER_ADVANCED * s2.count_ones() + SHELTER_MISSING * missing + OPEN_FILE_NEAR_KING * open.count_ones()) as i32;
    if kf == 3 || kf == 4 { d += KING_IN_CENTRE + if no_rights { KING_CANNOT_CASTLE } else { 0 } } // d/e files only
    d
}
```

- **Skip it when the enemy has no queen and phase ≤ 6**, and scale it by the *enemy's* non-pawn material, with the queen weighted.
- **Fold the taper into one packed score**: `S(mg, eg)` as two `i32`s, or an `i64` with the usual packing. Every PST, including the king's, then contributes to both, and you taper once at the end instead of doing per-term `* phase / 24`. That makes MG/EG PSTs for all pieces free later.
- **Go incremental later.** The real speed win is material + PST updated in make/unmake, with only the pawn/king terms computed per node, or cached in a small pawn-king hash keyed by `pawn_bb ^ king_sq`, since cozy-chess has no pawn key.

Expected: the eval overhead of king safety drops from about 10 % nps to about 2–3 %. Verify with `make profile`: node counts identical to a build with the original formulation (the c-file fix aside), nps higher.

## 3. Did it fix the king-exposure losses the grandmaster flagged?

**It fixed the pattern the grandmaster named most often: the king left in the centre, or walking with queens on.** In the same seats as this run, the baseline losses g13 (4.exd5 opening the e-file on e1), g23 (never castled) and g24 (…Kf8 with queens on) became a win, a win and a draw. The baseline wins that wobbled, g1 16.Ke2 and g5 28.c3 with the king on e1, didn't recur. The opponent is stochastic, so the games are not replays, but the aggregate counts in the table (castling 14 → 26, early king moves 27 → 12) are robust.

**It did not fix the second pattern: pieces attacking a *castled* king.** All three losses are that pattern, and two of them are horizon problems more than eval problems:

| game / ply | position | played (depth) | what fixes it | re-run with the 97aee56 binary (TT + ordering, baseline eval), 1 s |
|---|---|---|---|---|
| g7 p13 (L, 24 plies) | `r1bq1r1k/1pp2ppp/2np4/p1b1p1N1/2B1P1n1/2NP4/PPPB1PPP/R2QR1K1 w` | Nxf7+?? (d6), −602 | depth (…Ng4 + Qh4 on f2/h2) | **Rf1** (SF best) already at **d6 in 43 ms** |
| g3 p51 (L) | `r7/3p1pk1/3Q1ppp/rq6/3P4/3R1P2/1PP2PPP/1KR5 w` | b4?? (d6), −981, against Q + 2R on the a-file vs Kb1 | depth, plus an attacker / half-open-file term | **c4** (SF best) at **d8 in 73 ms** |
| g5 p73 (L) | `6k1/N1p5/4bp2/P2q2p1/3P4/R1P3B1/1P3PKP/4R3 w` | Kg1?? (d6), −1356, after …Nxg2 sac, Q + B vs the king | depth 9, or an attack-units term | Kg1 up to d8, **f3** (SF best) at **d9, 387 ms**, over budget |
| g8 p34 (D, from +1.9) | `r2n1rk1/pp3p2/2pp2pp/q2P1BN1/8/3Q3P/P4PP1/2R2RK1 b` | gxf5? (d7), −818, wrecking the shelter next to Ng5/Qd3 | **eval** | still gxf5 at d8, so v1's shelter penalty (~−33 cp for an opened g-file) is too small without an attacker count |

So 2 of the 3 losses fall to the ordering package alone, at depths well inside 0.25 s. The third needs one more ply, which means null move + LMR. The g8 draw is the one case that needs king-zone attackers in the eval. Mean optimism with an exposed king is unchanged at about +310 cp, which confirms the missing term is **attackers near the king**, not shelter.

## 4. The ladder is saturated, so measure differently

Every run scores 0.83–0.85 at 1500/1600/1700. With 30 games and ~4 non-wins, a +100 Elo change moves the result by about one game, so `elo > best + 30` is a coin flip. Three consequences:
1. **Move the ladder up.** Set `TARGET_ELO` to about 2000, so the score lands near 0.5, where 30 games resolve best. The Elo estimate from a 1600 ladder and a 2000 ladder is comparable. This is a run parameter, not an engine change, and `Makefile` itself is not touched.
2. **Judge search changes on low-noise signals first.** Use nodes to depth 8 in `make profile` (same bestmoves), avg depth per phase, and the real-error rate in balanced middlegames (64 → 55 for the TT run, the only positive signal so far).
3. **Benchmark with fixed parallelism.** This run and the baseline differ by 4× in concurrent processes, which alone is worth −10 to −20 % nps at 0.25 s. Record `PARALLEL` in the commit and hold it constant, or compare nps only from `make profile` on an idle host.

## 5. Should TT + killers + history + PVS land as one ordering package?

**Yes.** The loop is already doing this (`97aee56`, running now), and it's the right call:
- **Each piece alone is below resolution.** Killers, history and PVS are +20–60 each; TT alone produced 1915 = baseline on a saturated ladder. Four separate 30-game runs would each be discarded on noise.
- **They're interdependent.** PVS only pays when the first move is usually best, which needs the TT move and killers. History only matters once the hash move and killers have taken the easy cutoffs. TT was already reviewed as bug-free (`analysis/ad95e70/engine-dev.md`).
- **The combination can be verified without games.** Check bestmoves on the bench FENs at fixed depth (unchanged, allowing for PVS score-equal swaps), nodes to depth 8 down ≥ 40 %, and the fail-high-first rate above 85–90 %. The 1 s re-runs above already show the binary reaching d8–10 where dd6c58b reached d6.

Keep rule for it: keep if avg depth rises by ≥ 1 ply and profile nodes-to-depth fall, even when Elo lands within ±30 on a saturated ladder. Better still, run it on the raised ladder.

## 6. Prioritised code changes (max 7)

1. **Land the ordering package (TT + killers + history + PVS), already in flight as `97aee56`.** Include the fail-low TT-move fix: keep `entry.mv` when `bound == Upper`.
   *Evidence:* g7 p13 and g3 p51 are both solved at d6–8 within 43–73 ms by that binary. Avg depth in the TT run was +1.1 to +2.0 by phase.
   *Expected:* +60–100 Elo on top of the TT's gain.
2. **Null-move pruning + LMR** (`negamax`). Null move: R = 2 + depth/6, not in check, not at ply 0, not with king and pawns only, no two in a row, only when static eval ≥ beta. LMR: log table, applied after 3 moves at depth ≥ 3, never for TT/capture/killer/checking moves or while in check, with a full-depth re-search on fail-high.
   *Evidence:* g5 p73 needs d9 (387 ms with ordering alone). 48 % of moves still end at the hard stop, and balanced-middlegame errors track depth: 64 → 55 ACPL for +1.1 ply.
   *Expected:* +150–250 Elo.
3. **King safety v2 on top of the search package** (`eval.rs`), re-landing dd6c58b with:
   - the branchless formulation from section 2;
   - the centre penalty for the d/e files only, fixing the O-O-O −40 cp bug;
   - scaling by the enemy's queen and attacking material rather than total phase;
   - a half-open file penalty only when an enemy rook or queen is on it;
   - **king-zone attack units**: enemy N/B/R/Q attacks on the king ring from cozy-chess attack functions, summed into a non-linear table, applied only when the enemy has a queen.

   *Evidence:* castling 14 → 26 games in this run (the behaviour works); g8 gxf5 is still chosen at d8 with the current eval; exposed-king optimism is +313 cp; g3 had Q + 2R on the half-open a-file.
   *Expected:* +40–80 Elo once depth no longer hides it.
4. **Time management** (`search`): update `root_move` whenever a root move raises alpha, and keep a partial iteration once the first root move (the TT move) is finished. Replace the fixed 40 % soft limit with "start d+1 only if elapsed × last-iteration ratio < hard limit".
   *Evidence:* 642 of 1325 moves (48 %) ended at the hard stop and discarded their iteration. Their average depth was 5.82, against 6.32 for moves that stopped early.
   *Expected:* +30–60 Elo, more at 5 s.
5. **Check extension, check evasions in qsearch, SEE < 0 pruning in qsearch** (`negamax`/`quiescence`).
   *Evidence:* g5 37.Kg1 comes after a queen check (…Qd5+), and g7 Nxf7+ followed by …Qh4/…Qxh2+ is a short forcing line. Qsearch still stands pat when in check.
   *Expected:* +40–70 Elo.
6. **Packed `S(mg, eg)` scores with incremental material + PST** (`eval.rs`/`search.rs`): taper once per eval, then update material and PST on make.
   *Evidence:* the 8.4 → 6.5 M nps drop from a small term shows how thin the eval budget is. MG/EG tables for all pieces become free after this.
   *Expected:* +20–40 Elo from speed, and it unblocks eval work.
7. **Passed pawns + mop-up** (`eval.rs`: rank-scaled passer bonus, king-to-edge term when a rook or more ahead).
   *Evidence:* g18 drifted from a +5.8 peak to stalemate. Balanced-endgame ACPL got worse (40 → 49) despite the taper.
   *Expected:* +20–40 Elo in win rate.

## 7. The single next experiment

**Null-move pruning + LMR (item 2) on top of the ordering package, run on a raised ladder (`TARGET_ELO` ≈ 2000).** This assumes `97aee56` is kept, or kept on its depth and nodes-to-depth evidence.

Why this one:
- It is the largest single lever left: +150–250 Elo, about +2 plies.
- It needs the ordering package in place to be safe, because LMR reduces the late moves.
- Two of the three king-attack losses in this run fall to depth alone, and the third needs exactly one more ply.
- It is the only candidate big enough to show through 30 games even if the ladder can't be moved.

King safety v2 (item 3) comes right after it. At d8–10 the eval term is no longer paid for with depth the engine can't afford, and the attacker term is what the g8-type shelter wrecks need.
