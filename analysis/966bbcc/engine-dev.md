# Engine-developer report on `966bbcc` (0.25 s, champion eval + tapered mobility, discarded)

- 0.25 s/move @2900/3000/3100, **2/16/12**, Elo 2873 ±135 (baseline `579a92f`: 5/10/15, Elo 2873), per level 2900 2/6/2 (was 3/3/4), 3000 0/7/3 (2/4/4), 3100 0/3/7 (0/3/7). Avg depth 16.7 (was 17.0), 2.12 M nps (was 2.38 M). Eval that played: champion v1 (tapered Michniewski PST + king safety v1) plus `mobility()`: N/B/R/Q squares not occupied by own pieces and not attacked by enemy pawns, minus 4/6/7/13 per piece, × 4/5/2/1 cp mg and 3/4/4/2 cp eg per square (`git show 966bbcc:engine/src/eval.rs`). Search unchanged.
- Evidence: `analysis.json` joined with `moves.jsonl` for both runs (966bbcc: 1807 engine plies, 1663 with a cp score; 579a92f: 2153 / 1940), python-chess replays of the v1 static eval, of the mobility term and its variants, and of a king-safety v2 draft on every engine ply of both runs (the replay reproduces the v1 numbers of the previous report to the cp: g21 p34 +113, g1 p41 +302, KN-K −323). "Residual" = engine root score − Stockfish depth-14 eval, engine's side; "static residual" = python static eval − Stockfish. Same conventions as `analysis/579a92f/engine-dev.md`.
- Two caveats before any gate is run. (1) `engine/target/release/engine.exe` (built 10:10) is **not** the champion: on the gate FENs it gives g21 p34 −124 and g1 p41 +415 where v1 gives +113 / +302, i.e. it carries a king-exposure draft; rebuild from the intended commit before any static check. (2) `main@2002feb` is ahead of this worktree's `engine/src`: its `eval.rs` already has Robin's passed pawns (`PASSED_MG/EG`), the `scale_factor` draw knowledge (pawnless, wrong-bishop, opposite bishops, rook endings) and 50-move damping, and its `search.rs` has lazy SMP (2 threads by default) and `CONTEMPT = 50` with a `root_color` field. Items 5 and 6b of the previous report are therefore done; the list below is written against main's eval.

## 1. What the mobility term changed in the games

| | 579a92f | 966bbcc |
|---|---|---|
| wins / draws / losses | 5 / 10 / 15 | 2 / 16 / 12 |
| games where SF ≤ −300 at some engine ply | 24 / 30, median first such ply 37 | 26 / 30, median ply 44 |
| games where SF ≥ +150 after ply 20 (real chances) | 6 (5 wins + g25) | 4 (2 wins + g8 +156, g13 +247) |
| threefold draws, of which rescues from SF ≤ −250 | 9, **9** | 15, **14** (g8 is the exception, see §3) |
| threefolds with ≥ 2700 cp non-pawn material still on (middlegame) | 1 (g16) | **6** (g2 p56, g3 p65, g4 p76, g7 p77, g13 p97, g28 p48) |
| engine plies at depth ≥ 100 (trivial iterations) | 9 | 12 |
| ACPL opening / middlegame / endgame | 17 / 31 / 20 | 16 / 30 / 34 |
| blunders (≥ 200) per 100 engine plies, by phase | 0.3 / 2.4 / 1.5 | 1.0 / 1.4 / 2.5 |

The engine got into lost positions exactly as often (26 vs 24 games), a little later (ply 44 vs 37), and was rescued by the handicapped opponent more often (14 of 26 vs 9 of 24), six times already in the middlegame. It created fewer winning chances (4 vs 6) and converted 2 of them. Nothing in the run says the term made the engine play better; the equal Elo is 0.333 = 0.333 by points, and under wins-only scoring it is a loss of 3 wins.

## 2. Own score minus Stockfish by phase: the optimism did not shrink

Root residual, engine plies with |SF| ≤ 300:

| phase | 579a92f: n, mean, median, share > +100 | 966bbcc: n, mean, median, share > +100 |
|---|---|---|
| opening | 300, +38, +25, 11 % | 297, +39, +29, 11 % |
| middlegame | 355, **+110**, +92, 45 % | 380, **+140**, +124, 60 % |
| endgame | 374, +140, +134, 64 % | 175, +156, +143, 74 % |

At level positions (|SF| ≤ 100) the middlegame residual went from +74 to +103; the endgame from +152 to +121 but on 97 instead of 275 plies (the run had 747 endgame plies against 1135: games ended earlier by repetition). By SF bucket, the residual rose in every losing bucket (SF ≤ −300: +287 → +313; −300..−100: +175 → +201) and fell slightly at level and winning positions (+87 → +73, +42 → +32). So the term did not reduce the optimism anywhere that matters; in the middlegame it grew by 30 cp.

Why: the term is zero-mean by construction and, replayed on the previous run's 1029 positions, it moves the static residual by −3 cp at level positions and −5 cp at SF ≤ −300 — nothing. On the new run's own positions it is **+19 at level positions and +10 at SF ≤ −300**, i.e. the engine steered into positions where its mobility term was positive (mean +9, positive in 66 % of middlegame plies, against −6 and 39 % when replayed on the previous run) and Stockfish did not agree that they were better. The static replays of every variant tried (full, half weight, minors only, mg only, minors mg only, trapped-piece penalty) change the middlegame static residual by at most ±3 cp on the previous run's positions and make it *worse* by +7..+15 on this run's (table in §7).

## 3. The slope evidence the term rested on was a search effect, not a static one

The previous report's evidence for mobility was the monotone root residual across the mobility bucket (+174 at −15 squares → +74 at +15). Splitting that residual into static and search parts (middlegame, |SF| ≤ 300):

| mobility diff (ours − theirs) | −15 | −10 | −5 | 0 | +5 | +10 | +15 |
|---|---|---|---|---|---|---|---|
| 579a92f static − SF | −75 | +79 | +126 | +149 | +162 | +133 | +206 |
| 579a92f root − static | **+228** | +17 | −14 | −35 | −48 | −48 | **−133** |
| 579a92f root − SF | +152 | +95 | +111 | +113 | +114 | +85 | +74 |
| 966bbcc static (with term) − SF | +198 | +133 | +185 | +185 | +205 | +203 | +186 |
| 966bbcc root − static | **+81** | +37 | −26 | −23 | −72 | −92 | **−98** |
| 966bbcc root − SF | +279 | +170 | +159 | +162 | +133 | +110 | +88 |

The static eval is *least* optimistic where the engine lacks mobility (the PSTs already under-rate cramped pieces relative to Stockfish) and the *search* adds +80..+230 there: in a cramped position the 14-ply search finds a line that frees the pieces at the horizon and scores the freed leaf, while Stockfish at depth 14+ sees the freeing fail. In mobile positions the search subtracts 100 (it finds the opponent's counterplay). A static mobility term cannot fix a horizon artefact; it adds a bonus at the very leaves the search is already over-rating, which is why the root slope got steeper (−1.2 → −4.1 cp per square) rather than flatter. Pooled over both runs the static residual slope against this feature is +6 cp per square: by the static-residual method the eval already over-rewards mobility through the PSTs.

Lesson for the method: a residual slope must be checked on the static eval before a static term is proposed; and the bulk of the residual (+120..+150 at level material, no king danger, no hanging pieces, n ≈ 500) is not attributable to any feature I can bucket (material, PST, pawn structure, king danger, bishop pair, queens on, hanging pieces: §7). It is the selection bias of a noisy eval: the engine reaches the positions its eval likes, so the static eval of a reached position is the max of noisy estimates (|static − SF| ≈ 180–200 cp in the middlegame). Reducing that needs lower eval *variance* (Texel-tuned weights), not another mean shift.

## 4. The draws: earlier repetitions in lost middlegames, not trades or passivity

- **Rescues, 14 of 15.** At the last non-zero own score before the repetition: SF −258..−992 and own −112..−1175 in 14 games (g2 −565/−877 at ply 60, g3 −160/−526, g4 −441/−861, g6 −869/−897, g7 −650/−913, g10 −1175/−976, g13 −302/−717, g15 −419/−735, g16 −112/−258, g19 −322/−599, g21 −121/−559, g24 −447/−582, g25 −920/−566, g28 −300/−992). The previous run: 9 of 9. The engine still never repeats when it is ahead by its own score.
- **g8 is the odd one**: own +445 at ply 72 (exf4, depth 10) with SF 0; two plies later, at depth 16, own 0 and the engine took the perpetual (Rxh7+ Kg8 Rh8+ …). SF agreed it was 0 throughout: a phantom advantage from a depth-10 iteration, not a repetition while ahead. g13 (the other "slipped win", SF +247 at ply 63) is the same shape at larger scale: own +513/+715/+799 at plies 73–79 (`6b1/BPp3rk/3p1p2/1N3P1q/4P1p1/P1P5/2Pn2RP/R5K1 w`, static v1 −76) while SF said 0..−15 because Black has a perpetual against the b7-b8 promotion; 79.Rg2?? (−199) and it is Black who has the draw. Both are horizon (perpetual-check) effects; nothing static.
- **Trades**: captures per game 20.4 vs 22.0 but games are shorter (mean 120 vs 144 plies), so the capture rate per ply is *higher* (17.0 % of engine moves vs 15.3 %); captures in the first 60 plies 12.7 vs 13.5; material on the board at ply 60 **4130 vs 3785 cp** (non-pawn 3113 vs 2782). Fewer trades, not more.
- **Passivity**: engine pawn-move share 19.5 % vs 18.9 %; first repeated position at median ply 84 vs 88 — the same. What changed is *where* the repetition came: 6 threefolds with ≥ 2700 cp of non-pawn material (vs 1), at plies 48–97, in positions Stockfish had at −5..−10. Stockfish at UCI_LimitStrength 2900–3000 has no anti-draw logic and accepted them. These draws are gifts and are worth nothing under the rule; they are not a property of the term worth keeping.

## 5. Depth and nps: the term cost 9–10 % of speed

Median nps by phase: opening 2.65 → 2.38 M (−9.9 %), middlegame 3.04 → 2.75 M (−9.3 %), endgame 3.96 → 3.70 M (−6.5 %); mean depth 13.7 / 14.6 / 18.6 → 13.1 / 14.3 / 18.9; middlegame plies at depth ≤ 12 rose from 12 % to 20 %. That is about −0.3 ply in the phases that decide the games, worth roughly −5..−10 Elo at this time control — a real part of the 3 lost wins but not the explanation. Any per-piece term that comes back must share one attack pass with `king_danger` (both walk the same N/B/R/Q sets) and cost ≤ 3 % on `bench 10`.

## 6. The phantom-draw artefact is unchanged, and main still has it

Engine plies with own score exactly 0 while SF ≤ −300: **77 in 23 games** (previous run 67 in 21); in 54 the move recreated a position seen exactly once in the game history, and after 34 of those the opponent simply deviated. cp loss ≥ 100 in 10 plies (was 5): g28 p96 Rg7 −371 at "depth 69" (`4RQ2/1P5r/1rp3pk/5n1p/5P2/7P/2P3PK/8 b`), g11 p149 Kh2 −277 at depth 79, g14 p124 −193 at depth 39, g7 p123 −133 at depth 23, g23 p120 −100 at depth 42 — all five are the trivial-iteration signature described in the previous report (§3 there). `main`'s `search.rs` keeps the same `is_repetition` (one earlier occurrence anywhere in the stack → `draw_score`), now returning −CONTEMPT (−50) for the root side instead of 0; −50 is still far above the −900 of the honest alternatives, so the artefact persists at 5 s and contempt does not touch it. The fix stays as specified before (count a pre-root occurrence only as part of a claimable threefold; a post-root single occurrence still draws) and is Robin's.

## 7. King safety: why the v2 draft made the static residual worse, and what would work

Facts from the replay (queens-on middlegame engine plies, |SF| ≤ 400, root residual):

| our-king feature | 579a92f | 966bbcc |
|---|---|---|
| v1 `king_danger` 0 / 50 / 100 / 150+ | +110 (n279) / +234 (17) / +161 (23) / +276, +248 (3) | +169 (308) / +212 (14) / +233 (14) / +0, +271 (5) |
| v2 draft (coef 1, base 4, cap 400) 0 / 100 / 200 | +121 (320) / +276 (2) / – | +167 (336) / +453 (4) / +814 (1) |
| virtual mobility 0–3 / 4–7 / 8–11 / 12+ | +106 (189) / +127 (96) / +188 (37) / – | +124 (148) / +209 (139) / +190 (49) / +422 (5) |
| king on c–f files vs castled | +222 (56) vs +101 (266) | +182 (35) vs +171 (306) |
| v2 ≥ 100 on ordinary castled kings, |SF| ≤ 100 | 0 / 146 | 0 / 100 |
| mean \|static − SF\| with v1 / v2 coef 1 / v2 coef 2 / v2 gated on 2 attackers / no our-king term | 199 / 203 / 201 / 207 / 210 | 253 / 259 / 256 / 266 / 271 |

Three things follow. (a) **The v2 draft is weaker than v1 in the range that occurs.** `1·max(0,u−4)²` is 4 cp at u = 6, 16 at u = 8, 36 at u = 10; v1's `DANGER` table gives 38–110 at weight 4–7 plus 18 per missing shield pawn. Replacing v1 by v2 removes 50–150 cp of correct penalty from the ~10 % of positions where v1 fires (residual there +160..+280, i.e. v1 is right but 2–3× too small, as before) and adds a large penalty to the ~1 % where u ≥ 14. Net effect on the mean over 1029 positions: +4 cp, exactly the "155 → 159" finding. It is a magnitude and shape problem, not a feature problem: the features are right (where v2 ≥ 100 fires the residual is +276..+814, and it never fires on an ordinary castled king). (b) **A sparse term cannot move the global mean**, and the global mean is the wrong gate. Even a perfect our-king term would bring ~70 positions from +250 to +120 and change mean |res| by ~5 cp; the +146 residual at v1 = 0 (n 674 pooled) is not king-related (§3). Gate a king term on the residual *inside its fired buckets* and on its false-positive rate, then on games. (c) **The opponent's king is where the static eval over-shoots**: static residual +214 / +259 / +410 at their-king v1 50 / 100 / 150 (n 40/22/21 pooled) against +136 at 0, while the root residual there is +151 / +95 / +131 — the search at depth 14 cleans up the attack optimism, and at 5 s it will do so more. So the term should be asymmetric: full on the root side's king, half (or capped) on the opponent's, which is the same `root_color` hook `CONTEMPT` already added on main.

What would make a king-safety term reduce the residual, in order: keep v1's table shape and double it (or index the same `DANGER` table by v2's richer unit count, so u = 6–10 lands at 80–220 rather than 4–36); keep the 2-attacker gate only for the zone-attack part and let the storm/open-file/virtual-mobility parts fire alone at low weight (the g5 pattern where no piece touches the zone); add the `root_color` asymmetry; and judge by the fired-bucket residual (target: v1 ≥ 50 buckets within +50 of the 0 bucket), by ≤ 3 % firing on ordinary castled kings, and by games. Virtual mobility deserves its own linear piece (residual +188 / +422 at 8–11 / 12+ squares): 3–4 cp per square above 6, queens on.

Other static-residual buckets worth knowing (middlegame, |SF| ≤ 300, both runs pooled, n 735; static / root): material lead −300 … +300: −396/+87, −157/+137, +58/+169, +144/+114, +184/+131, +226/+155, +508/+145 (the eval over-rates a material lead by 40–360 cp statically and the search recovers most of it — the pawn-grab habit is a search-visible tactic more than a static weight); isolated pawns ours − theirs +1 / +2: +216/+154, +194/+142 against +127/+113 at 0 (n 230); doubled +1 / +2: +219/+160, +204/+149 against +123/+115; bishop pair −1 / 0 / +1: +163/+143, +143/+116, +172/+118; our hanging pieces 2+: +417 static, +141 root (the search resolves them). The pawn-structure signal is the only broad one with a slope in the same direction statically and at the root.

## 8. Prioritised code changes for the evaluation owner

All against `main`'s `engine/src/eval.rs` unless noted. Speed baseline: `bench 10` on a clean champion build (rebuild first; see the caveat above). Replay gate = the residual buckets above, recomputed over `analysis/579a92f` and `analysis/966bbcc` with the same python static replay (v1 PST + king_danger + taper, with main's passed pawns and scale factor added).

1. **King safety v1 magnitude ×2, asymmetric.** Double the `DANGER` table (10 → 20 … 460 → 920, keep the ≥ 2-attacker gate and the queen gate), shield 18 → 25 per missing pawn on ranks 1–2 only, and apply the our-king term at full weight for `root_color` and at half weight for the opponent (the `Searcher.root_color` field exists on main; pass it into `evaluate_with`). Evidence: §7 rows 1 and 3 (v1 right but 2–3× too small on ~10 % of positions; their-king static over-shoot +259/+410 that the search cleans up). Cost: none (no new computation). Pre-bench check: replay — residual in the v1 ≥ 50 buckets falls to within +60 of the 0 bucket without moving the 0 bucket; g21 p34 and g1 p41 static evals fall ≥ 60; `bench 10` node count and nps unchanged. Expected **+10–25**.
2. **Pawn structure: isolated −12 mg / −18 eg, doubled −10 mg / −20 eg per pawn** (file masks; `north_fill`/`south_fill` already exist on main for passed pawns, so the per-node cost is a few popcounts). Evidence: §7 — the only feature with a residual slope in the same direction at the root (+30..+40) and statically (+70..+90), n 230. Technique: CPW "Isolated pawn", "Doubled pawn". Pre-bench check: the isolated/doubled buckets flatten in the replay; opening positions (start FEN and the four book positions) move < 10 cp; `bench 10` nps within 2 %. Expected **+10–20**.
3. **Repetition rule (search, hand-off to Robin, five lines):** count a pre-root occurrence in `is_repetition` only when it completes a claimable threefold; a single post-root occurrence still returns `draw_score`. Evidence: §6 — 77 phantom plies, 10 with ≥ 100 cp loss, five of them at "depth" 23–79; unchanged by contempt. Check: `position` with g28's 95 moves then `go movetime 250` must report a negative score for Rg7's alternatives, not 0 at depth 69. Expected **+10–20** (fewer losses from positions the engine is still holding; interacts with contempt).
4. **King exposure: virtual mobility, queens on.** 3 cp mg per square a queen on our king's square would attack above 6, only while the opponent has a queen; fold into item 1's unit count when item 1 is redone as a proper v2. Evidence: §7 row 3 (+188 at 8–11 squares, +422 at 12+; uncastled c–f +222 in the previous run). Pre-bench check: g21 p34 falls ≥ 40 more; ≤ 3 % of ordinary castled kings get ≥ 30 cp. Expected **+5–15**.
5. **Bishop pair +20 mg / +30 eg.** Evidence is weaker than it looked: pooled root residual +143 when they have the pair vs +116 / +118 otherwise (≈ 25 cp), so keep it small. One popcount per side. Expected **+3–8**; bundle with item 2, do not spend a run on it alone.
6. **Texel-tune material, PST and the terms above on results only** (positions from `games/runs/*/moves.jsonl` of every run, K fitted first, Stockfish evals excluded from the objective). Evidence: §3 — the bulk +120..+150 optimism is eval variance under the search's selection, which no hand-set mean term removes; the SF-residual method itself is selection-biased and can only rank features. Needs items 1–2 in place and ideally a few hundred more games; expected **+20–40** when done, not next.
7. **If mobility is ever retried, only in this form:** minor pieces only, middlegame only (mg weight 3/4, eg 0), half the safe-square count (also excluding squares an enemy pawn can attack after one push, which is the horizon leak of §3), sharing one attack pass with `king_danger`, ≤ 3 % on `bench 10`, judged by wins only. The static replays give it no residual case (minors-only / mg-only variants: −1..+3 cp), so I would **not** retry it now; and not as a trapped-piece penalty either — pieces with ≤ 1 safe square are rare (our N 14/727, B 49/551, Q 1/552; R 79/1385 are mostly undeveloped rooks) and the "trapped" replay variant left the middlegame residual unchanged on the previous run's positions and worse on this run's. Expected **0–10**.

**Next single change: item 1.** It is a constants change with no speed cost, it addresses the one component of the eval that the replay shows to be *right but too small* on both runs (v1 buckets +160..+280 against +110..+170 at zero), it removes the static attack over-optimism on the opponent's king that the search only partly corrects, and its gate runs in seconds on the existing positions. Item 2 is the second run. Mobility should not be retried until items 1–2 and a results-based tune exist; the evidence that motivated it was a search-horizon effect, and the run confirmed that a static term does not fix it.
