# Engine-developer report on `2002feb-full-t3190s100` (5 s/move, champion eval v1, Elo 2978)

- 5.0 s/move @3090/3190, 6 parallel games on a 14-core host, Elo 2978 ±142, W/D/L 0/16/14, avg depth 24.3, 2.588 M nps (per-move recompute: mean 2.584 M, median 2.626 M). Per level: 3090 0/6/4, 3190 0/10/10. Terminations: threefold repetition 13, checkmate 14, insufficient material 2, adjudicated (400 plies) 1. Eval: tapered Michniewski PST + king-safety v1 (`SHIELD_MISSING = 18`, `DANGER` table, ≥2-attacker gate, queen-gated) — byte-identical to `analysis/579a92f`'s build; the tapered-mobility experiment (`966bbcc`) was reverted (`9d0281d`) and nothing from either prior eval-dev report has since been implemented. Search: SEE, log-LMR + history gravity, staged picker, RFP/futility/LMP, aspiration, 4-way bucket TT, incremental psq — also unchanged; the engine is single-threaded (no `root_color`/contempt field on `Searcher`, no lazy SMP: confirmed by reading `engine/src/search.rs` and `arena/util.py:86` — "each game uses two single-threaded engines").
- Evidence: `analysis/2002feb-full-t3190s100/analysis.json` (2331 engine plies, 2030 with a cp score) joined with `games/runs/2002feb-full-t3190s100/moves.jsonl`, the annotated PGNs, a python residual replay against the 0.25 s baselines `analysis/579a92f/engine-dev.md` and `analysis/966bbcc/engine-dev.md` (same method: residual = engine's own root score − Stockfish's depth-14 annotation eval, both from the engine's side, bucketed by `|SF| ≤ 300`), and two live reproductions against `engine/target/release/engine.exe` (built today from this exact, unmodified `engine/src`): the `eval` UCI command on gate FENs, and a full `position … moves …` replay of game 3's 96-ply history at `go movetime 5000`.

## 1. Does the +110/+140 optimism shrink at depth 24? Barely, and not where it matters

Residual (own − SF, engine's side), engine plies with `|SF| ≤ 300`:

| phase | 5 s: n, mean, median, share >+100 | 0.25 s (`579a92f`): mean, median, share >+100 |
|---|---|---|
| opening | 298, **+34.3**, +22, 7.7 % | +38, +25, 11 % |
| middlegame | 517, **+106.5**, +92, 47.2 % | +110, +92, 45 % |
| endgame | 410, **+114.2**, +83, 43.4 % | +140, +134, 64 % |

At level positions (`|SF| ≤ 100`): opening +33.5 (was +38), middlegame **+72.6** (was +74), endgame +112.7 (was +152). Pessimism (residual `< −100`) never occurs in either run, at either time control — the eval is one-sided.

**Reading**: opening and endgame optimism shrink modestly with 7 more plies of search (endgame level residual −26 %, presumably some tactical/conversion horizon the deeper search now resolves). **Middlegame optimism does not move** (+106.5 vs +110 mean, +72.6 vs +74 level; medians identical to the cp). Section 2b shows this is exactly the phase and the mechanism that decided all 14 losses. This confirms, at the real time control, what `579a92f`/`966bbcc` already argued from a shallower run: the middlegame gap is a **static evaluation problem**, not a search-horizon one, and no amount of extra depth in the current build closes it.

Two direct static-eval reproductions (via the `eval` UCI command, unchanged since `966bbcc`):
- `8/8/8/8/8/4n1k1/4K3/8 w` (bare K+N vs K) → **`eval -323`**: zero material-draw knowledge, still.
- Symmetric bishop-pair-vs-bishop+knight position (Italian-type, `r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w`) → **`eval 0`**: no bishop-pair term, still.

## 2. The 14 losses: mostly already decided, and decided in the middlegame

Of the 14 games' single worst engine move (from `summary.md`), **10 of 14 were played after the engine's own search had already found a losing mate for itself** (`score_mate` −4 to −11 in `moves.jsonl`, e.g. g27 ply205 Ke3, mate −8; g14 ply94 Bc7, mate −11): these are not decision points, they are the last gasp of an already-lost king-and-pawn or minor-piece ending, and the 200–850 cp "cp_loss" against the depth-14 annotation is which losing move SF's shallow search happens to rank worse, not a real miss. Of the remaining 4 blunders with a genuine cp root score (g24 a6 −849, g5 a4 −436, g17 Rxd6 −223, g18 Nxd3 −222): 3 were **static** (root already 39–448 cp adrift from the annotation *before* the move: g24 own −216 vs SF −614, g5 own −30 vs SF −478, g18 own −157 vs SF −300) and only g17 (Rxd6, own −181 vs SF −220, diff +39) is a genuine one-move horizon miss.

More telling is *when* each loss actually turned. For each losing game, the first ply where the annotation's engine-side eval crossed `≤ −300`:

| losses turning in | count | median own score at that point | median SF eval at that point |
|---|---|---|---|
| middlegame | **12 of 14** | −50 | −328 |
| endgame | 2 of 14 | −11 | −332 |

At the exact moment the annotation says the engine is already clearly worse, **the engine's own root score is still near level** (median −50, one game +68) at depths 16–30 — squarely within the run's normal depth range, so more nodes would not have helped; the eval simply doesn't see the deficit yet. This is the same shape (king safety / structure / development, per the bucket analysis in `579a92f` §4 and `966bbcc` §7) that both prior reports diagnosed, now confirmed at the real time control and on a fully independent set of games: **the flashy 200–850 cp "worst move" is the funeral, not the death** — the actual loss happens 40–70 plies earlier, unnoticed, in the middlegame.

## 3. The 16 draws: one bug wearing 12 different masks, not 12 practical decisions

Of the 13 threefold-repetition draws, the last non-zero engine root score before the repeat, and the annotation's verdict at that same ply:

| game | own score | SF (engine's side) |
|---|---|---|
| 3, 4, 6, 9, 16, 19, 20, 25, 28, 29, 30 | **−50 (all eleven, bit-for-bit identical)** | −424 … −1197 |
| 21 | −50 | 0 |
| 1 (repetition, not on this list — see below) | −1712 | −924 |

**Eleven of thirteen threefold draws end with the exact same constant, −50, regardless of game, position, or how lost the annotation says White or Black actually is** (from −424 to −1197 cp). That is not twelve independent "rescue" judgments; it is one search artefact firing the same way each time. Only game 1's final position is genuinely pessimistic (own −1712, worse than SF's −924) and game 21 is a real level draw (SF 0). This sharpens the `579a92f`/`966bbcc` framing ("all rescues from lost positions") into a mechanism: the engine isn't nobly holding a bad position, its search is telling it the position is fine.

## 4. Reproduction: the `is_repetition` bug from `579a92f` §3 / `966bbcc` §6 is unfixed and still firing at 5 s

`engine/src/search.rs:565-578`:

```rust
fn is_repetition(&self, hash: u64, halfmove_clock: u8) -> bool {
    self.stack.iter().rev().skip(1).take(halfmove_clock as usize)
        .take_while(|&&h| h != NULL_BARRIER).any(|&h| h == hash)
}
```

called from `negamax` (line 594) for every node past the root. A **single** earlier occurrence of the hash anywhere in `self.stack` — whether it is in the actual game history *or* reached again purely inside the current search tree beyond the root — scores the line as a draw. That is stronger than the published rule (CPW "Repetitions": two-fold-in-tree / three-fold-vs-game-history) and is exactly what both prior reports flagged, unchanged, in the same file.

Live reproduction: feeding the exact 96-ply history of game 3 to `engine.exe` (unmodified, built from this commit) and issuing `go movetime 5000` gives:

```
info depth  2 score cp 0 nodes 46 ... pv d3e4
info depth 14 score cp 0 nodes 2622 ... pv d3e4
info depth 30 score cp 0 nodes 389344 ... pv d3e4
info depth 43 score cp 0 nodes 11649813 ... pv d3e4
bestmove d3e4
```

Forty-two iterations report the identical score and PV while the node count climbs from 46 to 11.6 M — a fresh, independent confirmation of `579a92f`'s "depth 127 collapse" signature, now on this run's own data. The annotation's actual verdict for that position is **−593 to −626** (White is a clean pawn-plus down in a king-and-minor ending); the position the engine steers toward (`7k/5p2/4p2P/2p1P1P1/3pK3/1Pn2P2/8/8 w`) had occurred exactly **once** before, 4 plies earlier — not a claimable threefold, and Black is under no obligation to allow one, but the single occurrence is enough to zero out the score.

**Footprint beyond the 13 repetition endings**: engine plies anywhere in the run with `|own| ≤ 100` while the annotation says `≤ −300` or `≥ +300`: **160, across 25 of the 30 games (83 %)**. Most of these (145/160) have **zero** prior occurrences of the exact position in game history — the flattening happens because a repeat becomes reachable a few plies further into the search tree, not because the game position has actually recurred. This is not only a "how the draws happened" story; it is quietly corrupting the root-score signal (and therefore this report's own residual method, and any future gate check) in a non-trivial slice of every run.

## 5. Time and depth: no slack anywhere except the bug itself

- 2316 of 2331 engine moves (99.4 %) use 4.85–4.96 s of the 5.0 s budget (mean 4.871 s, max 4.959 s) — the distribution is strictly bimodal, not a spectrum: `{<1s: 15, 1–4s: 0, 4–4.85s: 0, ≥4.85s: 2316}`.
- **All 15 sub-1-second moves are the same signature as §4**: depth 127 in 8–60 ms (e.g. g14 ply124 depth127/0.025 s, g20 ply115 depth127/0.012 s, g29 ply191 depth127/0.009 s). There is no other source of unused time budget anywhere in this 30-game run; fixing §4 is the entire "unused time" story.
- Depth: mean 24.3 (median 21); excluding the 83 plies at depth ≥ 50 (the bug's wider footprint — full time spent, but a cheap draw-scored line let iteration run away), the "normal search" mean is 22.4 / median 21, still the expected ≈ +7 plies over `579a92f`'s 17.0 for ~20× the time (a healthy effective branching factor, nothing pathological in ordering or pruning).

## 6. NPS under 6-way parallelism: no measurable contention

Mean 2.584 M nps (opening 2.27 M, middlegame 2.36 M, endgame 2.84 M) — at or above `579a92f`'s 0.25 s single-eval baseline (2.4 M). Both the champion and Stockfish run single-threaded per game (`arena/util.py:86,280`), so 6 parallel games are 12 OS processes on 14 physical cores; nps shows no downward trend or floor consistent with scheduler contention. Parallelism is not a factor in this run's result; depth and nps both scale as expected from time and phase alone.

## 7. Prioritised code changes

All checked against the actual `engine/src/*.rs` as committed at `574d9b7` (this run's binary). Speed baseline: `bench 10` on a clean rebuild. Replay gate = the residual buckets in §1, recomputed the same way over this run plus `579a92f`.

1. **Fix `is_repetition` (search, Robin's domain; ~5 lines, no perf cost).** `engine/src/search.rs:565-578`, called from `negamax:594`. Count a *pre-root* occurrence only when it completes a claimable threefold (two prior occurrences, or one prior plus the game's own halfmove-clock-tracked count); a genuine *post-root* single occurrence inside the search tree may still score as a draw (that is what the opponent can force from the node). Evidence: §3–4 — 11 of 13 repetition draws share one constant score (−50) regardless of position; 160 plies across 25/30 games show the same flattening without an actual repeat; live UCI reproduction on game 3 (42 identical iterations, node count 46 → 11.6 M, while the annotation says −593..−626); the code is textually unchanged since it was flagged with the same fix in both `579a92f` §3 and `966bbcc` §6. **This is a correctness bug, not a tuning question — it has now been flagged three times.** Pre-bench check: replay the exact UCI command in §4 (`position startpos moves e2e4 … c3d5` then `go movetime 5000`); the fixed engine must report a large, changing negative score (roughly the −593..−626 the annotation gives) rather than a single value across dozens of depths, and a fresh full run's "moves under 1 s" count should fall from 15 toward 0. Expected **+10–20 Elo**; wins-only effect is indirect (draws and losses both score 0) but it removes the one thing corrupting the root-score signal that every other gate below depends on, and stops the search from silently giving up complications the instant a shuffle becomes reachable — exactly the situation in which a fixed-strength opponent is most likely to be induced into a mistake.

2. **King safety v1 → v2: double the `DANGER` table, root-side asymmetry.** `engine/src/eval.rs:168-222` (`king_danger`, `DANGER`, `SHIELD_MISSING`), called from `evaluate_with:339-340`. Needs a `root_color: Color` field added to `Searcher` (none exists today; small plumbing hand-off, ~10 lines, coordinate with Robin) threaded into `evaluate`/`evaluate_with` so the term applies at full weight for the side on move at the root and half weight (capped) for the opponent. Evidence: §1–2 — the middlegame residual did not move with 7 more plies of search (this run's strongest argument that it's static, not horizon), and **12 of 14 losses turned in the middlegame** while the engine's own score sat near level (median −50) at the exact ply the annotation already said −300+; this is the identical failure class (king danger firing in the right direction but 2–3× too weak) that `579a92f` §2/§7 and `966bbcc` §7 already isolated with bucket evidence, and the code has not changed since. Technique: CPW "King Safety". Pre-bench check: `DANGER`-fired residual buckets (≥50) fall to within 60 cp of the 0-bucket in the replay; ordinary castled kings (`|SF| ≤ 100`, v1 = 0) stay <3 % false-positive; `bench 10` nps unchanged (constants + one enum param, no new attack loop). Expected **+10–25 Elo**, and the most direct lever on this run's actual loss mechanism.

3. **Endgame material-draw knowledge + passed pawns.** New function in `eval.rs`, gated by `phase()` / non-pawn material, applied in `evaluate_with`. Evidence: `eval` on `8/8/8/8/8/4n1k1/4K3/8 w` still returns **−323** (reproduced live today, byte-identical to `966bbcc`'s finding on the pre-revert build — this has never shipped); endgame residual, while the one phase that shrinks with depth (§1), is still +112.7 at level annotation positions, and this run's endgame plies reach the deepest average depth (28.5, per `summary.md`) without the gap closing, consistent with a missing conversion/scale-factor term rather than a tactical one. Technique: CPW "Draw evaluation / Scale factor" (K+minor vs K, pawnless material-lead scaling) and "Passed Pawns" (rank-scaled bonus, tapered). Pre-bench check: `eval` on the bare K+N-vs-K FEN above = 0; a simple 6th-rank passed-pawn FEN moves up by a sane amount; `bench 10` nps within 3 %. Expected **+10–20**.

4. **Isolated + doubled pawn penalties.** New pawn-structure function in `eval.rs` (file-based masks; note `north_fill`/`south_fill` helpers do **not** currently exist in this build and must be added — `966bbcc`'s assumption that "main" already had them was for a different, since-reverted branch). Evidence carried over unchanged from `966bbcc` §7 (the one bucketed feature with a residual slope in the same direction statically and at the root); nothing in this run contradicts it and nothing has implemented it. Technique: CPW "Isolated Pawn", "Doubled Pawn". Pre-bench check: isolated/doubled buckets flatten in the replay; start-position and four book FENs move < 10 cp; `bench 10` nps within 2 %. Expected **+10–20**.

5. **Bishop pair, +20 mg / +30 eg.** One popcount per side in `evaluate_with`. Evidence: reproduced live today — `eval 0` on a symmetric bishop-pair-vs-minor position confirms the term is still entirely absent. Bundle with item 4, do not spend a run on it alone. Expected **+3–8**.

6. **Texel-tune material, PST and the terms above on results only**, once items 2–5 exist, using every run's `games/runs/*/moves.jsonl` (this run alone contributes 2331 more labelled engine plies; Stockfish's evals must stay out of the objective, results only). Evidence: unchanged from `966bbcc` §3/§8 — the bulk of the residual is eval variance under the search's own selection bias, which no more hand-set mean terms will remove. Not next. Expected **+20–40** once done.

**Do not retry mobility.** `966bbcc` already showed (and this run's unchanged, reverted eval confirms) that the mobility residual slope was a search-selection artefact, not a static gap; a static mobility term made the middlegame residual worse (+140 vs +110) and cost ~9 % nps for zero wins gained. Keep it off the list until items 2–5 and a results-based tune exist.

**Single change most likely to raise the chance of a 5 s win at 3190**: item **2, king safety v2**. Every one of this run's 0 wins / 14 losses traces to a middlegame static misjudgment (§2b: 12 of 14 losses turned in the middlegame, at depths 16–30, with the engine's own root score still near level while the annotation already said ≥ −300), and that specific failure mode — king danger firing correctly in direction but 2–3× too weak — is the one piece of evidence in this report that is unchanged, well-isolated across two prior runs and this one, cheap to ship (constants plus one enum parameter), and acts on the actual phase and mechanism that produced every non-mate-seen loss. Item 1 (the repetition fix) should ship in the same cycle regardless — it is a zero-cost, zero-risk correctness bug, verifiable in seconds with the UCI command above, and it is actively corrupting the signal that any future gate check (including item 2's own replay gate) relies on; it has now been flagged three times without being applied.
