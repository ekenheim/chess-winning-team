# Engine-developer post-mortem of `1517c7b` (0.25 s, king-danger v3, discarded)

- 0.25 s/move @2300/2400/2500, 9/6/15, Elo 2326 ±130, avg depth 11.4. Eval: commit 6f37ca4's `king_danger` v3 (units per attacked zone square N2 B2 R3 Q5, storm pawns 2/2/1/1 over four ranks, open/half-open king files 2/1 doubled with an enemy R/Q, `3·units²` capped at 700, shield 15 per missing pawn for a king on ranks 1–2). Search and time manager as in `c9cb33a` (v1 term: shield 18, convex table gated on two attackers; 0.25 s @2100–2300, 21/3/6, Elo 2400).
- Evidence: `analysis.json` joined with `moves.jsonl` (1784 engine plies; 1534 for c9cb33a), and a Python re-implementation of v1 and v3 (python-chess, session scratchpad, not committed; checked line by line against `git show 6f37ca4:engine/src/eval.rs` and the kept `eval.rs`) replayed on every position of both runs. Values below are the raw term; "tapered" is `raw · phase / 24`, what reaches the score. No binary was run.

## 1. Distribution: v3 was not heavy on our king, it was heavy on theirs

Engine plies, non-endgame, the opponent still has a queen (v3 is 0 otherwise):

| king | run (term played) | v1 replay mean / >200 / >500 | v3 replay mean / >100 / >200 / >500 / at cap 700 | v3 tapered >200 / >500 |
|---|---|---|---|---|
| our | 1517c7b (v3) | 38 / 18 / 0 | **109** / 253 / 142 / 69 / 42 (n = 932) | 114 / 24 |
| their | 1517c7b (v3) | 59 / 20 / 0 | **348**, median 237, q75 = 705 / 697 / 554 / 346 / 313 (n = 977) | 467 / 144 |
| our | c9cb33a (v1) | 33 / 17 / 0 | 181 / 268 / 198 / 146 / 232 (n = 798) | 174 / 50 |
| their | c9cb33a (v1) | 38 / 10 / 0 | 154 / 279 / 160 / 93 / 109 (n = 750) | 139 / 31 |

- The term is symmetric, so the asymmetry is the search's doing. Under v1 (c9cb33a) the replayed v3 is about equal on both kings (181 / 154); under v3 the engine steered into positions where the opponent's king scored ≥ 500 in **35 % of queens-on middlegame plies** (v3 at the 700 cap in 29 %), and kept its own king below 100 in 73 %. The defensive half did what it was meant to: our-king v3 > 500 fell from 19 % of plies (c9cb33a, v1 walking into attacks) to 9 %.
- "Ordinary castled positions" (499 kings from both runs: castled to a–c/g–h on the back rank, ≥ 2 shield pawns, opponent queen on, |SF| ≤ 100): v3 median 12, q75 27, **q90 147, ≥ 100 in 13.6 %, ≥ 150 in 9.8 %**. The body of the distribution is fine; the tail (one queen touching four zone squares = 20 units = 700) is not.

## 2. Optimism did not flip to pessimism: it grew, and it moved from our king to theirs

Own score − Stockfish (engine's side, engine plies with a score, |SF| ≤ 300):

| phase, queens on | 1517c7b mean / median / > +100 / < −100 | c9cb33a |
|---|---|---|
| opening | +73 / +52 / 29 % / 1 % | +31 / +26 / 8 % / 1 % |
| middlegame | **+230 / +218 / 74 % / 0 %** | +133 / +118 / 59 % / 1 % |
| loss games (non-endgame) | +157 / +137 (n = 172) | +95 / +70 (n = 107) |

Pessimism (< −100) is 0–1 % in both runs; the engine was never "too afraid". Bucketed by tapered (their − our) v3 danger, queens-on middlegame:

| their − our | 1517c7b n / optimism / SF mean / ACPL / blunders | c9cb33a n / optimism / SF / ACPL / blunders |
|---|---|---|---|
| ≤ −300 (our king under attack) | 16 / +147 / −421 / 74 / 2 | **103 / +331 / −202 / 44 / 8** |
| −100…+100 | 380 / +195 / −245 / 48 / 19 | 491 / +87 / +30 / 32 / 8 |
| ≥ +300 (their king under attack) | **290 / +385 / −287 / 53 / 18** | 61 / +79 / +396 / 41 / 1 |

- The our-king half fixed the c9cb33a problem: the "our king attacked" bucket shrank from 13 % of plies at +331 optimism to 1.5 % at +147.
- The their-king half created a bigger one: 27 % of plies sat at ≥ +300 attack bonus with **+385 optimism**, Stockfish at −287, 18 of the run's 50 middlegame blunders. Material there tells the story: where their-king v3 ≥ 500, the engine was on average **+0.1 pawns, down ≥ 1 pawn in 55 % of plies, SF −324, own +99**. In c9cb33a the same bucket was +4.4 pawns up (down in 1 %), SF +474: the v1 engine attacked when already winning; the v3 engine bought attack units with material. 16 % of its queens-on moves raised the opponent's v3 by ≥ 100 (c9cb33a 11 %; 67 of those 155 were captures).
- At the first ply where SF ≤ −300 in the 15 losses, our-king v3 was ≥ 300 once (g4 ply 34, 315 → 27 after O-O); their-king v3 was ≥ 300 in seven (g4 745, g5 378, g13 705, g15 477, g24 745, g28 745, g29 393 the ply before). The losing sacrifices were the term's: g11/g7 Bxf7+ at ply 3 of the Italian twice (−2 material, SF −363), g28 Nxf2 (their 27 → 745), g24 Qe7 (552 → 745, own +280 vs SF +35 → −569), g5 Rc2 (273 → 618), g13 Nfxe5 (57 → 222), g27 Bxh6 (75 → 258), g10 Bxh3, g3 Bxc6+, g21 Bxc7.
- Draws: g17 slipped from +390 (SF), g18 fair, g10/g21/g27 were repetition rescues from −883/−999/−998 (own score 0 at the end), g23 −473. The repetition rule saved 1.5 points that v1 would have lost outright; that flatters the Elo, not the win count.

## 3. Cost: −9 to −11 % nps with queens on, about −0.2 ply once the position mix is controlled

| | 1517c7b | c9cb33a |
|---|---|---|
| nps mean / median, all engine plies | 4.17 M / 4.09 M | 4.20 M / 4.25 M |
| nps median, opening / middlegame / endgame | **3.56 M** / 3.85 M / 4.81 M | 4.19 M / 4.23 M / 4.40 M |
| depth mean, opening / middlegame / endgame | 9.13 / 9.49 / 14.53 | 9.54 / 10.27 / 12.26 |
| balanced queens-on non-endgame (\|SF\| ≤ 100): nps median / depth / nodes median | 3.66 M / 9.28 / 560 k (n = 271) | 4.13 M / 9.45 / 616 k (n = 391) |
| median nodes at completed depth 8 / 9 / 10 / 11 (non-endgame) | 461 k / 527 k / 640 k / 658 k | 530 k / 603 k / 649 k / 733 k |
| seconds median / max; ≥ 0.230 s | 0.236 / 0.241; 52 % | 0.226 / 0.241; 48 % |

- The term costs 11 % of speed in queens-on positions (three files × four ranks of `try_offset` plus three file tests per king per node; the endgame figure is untouched because v3 returns 0 without an enemy queen). Nodes to depth did not rise (tree shape unchanged), so the −0.8 ply raw middlegame gap is mostly the game mix: 776 middlegame plies against a stronger opponent, many of them in lost positions with checks. Controlled for balance the loss is 0.17 ply, worth roughly 10–15 Elo at the observed −15–20 % ACPL per ply. Recoverable by precomputing per-king-square masks (zone, shield squares, storm squares per file) in a static table so the per-node work is four popcounts and three file tests.

## 4. Ladder vs term: about 60 % of the lost wins are the ladder, 40 % the term; the Elo drop is inside the noise but all of it sits at 2400/2500

| level | 1517c7b (v3) | c9cb33a (v1) | expected for a 2400 engine (c9cb33a's fit), 10 % draws |
|---|---|---|---|
| 2100 | – | 8/1/1 | – |
| 2200 | – | 8/1/1 | – |
| 2300 | **6/0/4**, perf 2370 | **5/1/4**, perf 2335 | 0.64 → 5.9 wins |
| 2400 | 2/3/5, perf 2292 | – | 0.50 → 4.5 wins |
| 2500 | 1/3/6, perf 2309 | – | 0.36 → 3.1 wins |
| total | 9/6/15, fit 2326 | 21/3/6, fit 2400 | 15.0/30, 13.5 wins |

- At the one shared level the two terms are indistinguishable (6 vs 5 wins of 10). Moving the ladder from 2100–2300 to 2300–2500 costs a 2400-Elo engine 7.5 of c9cb33a's 21 wins by arithmetic alone. The remaining 4.5 wins (13.5 expected → 9) and the −74 Elo are the term, concentrated at 2400/2500 (3 wins of 20, expected 7.6): Stockfish at 2300 does not always refute Bxf7+/Nxf2-style play, at 2500 it does. With ±130 per run this is a one-sigma effect; the material statistics in section 2 are the reason to believe it.
- A retry of the same term on 2300–2500 would need > 2430 to be kept; it would have to beat c9cb33a's engine by 30 Elo on a ladder the engine has not been measured on. Compare like with like: if the kept rule permits, measure the rescaled term on 2100–2300 first (a 21/3/6 baseline exists there), or accept that a 2300–2500 run of the *kept* eval is the baseline that is missing.

## 5. Rescaling proposal, verified on this run's positions

Grid over coefficient {1, 1.5, 2, 3, 4} × cap {300, 400, 500} × base units {0…6} × storm weights × file weights × heavy multiplier × zone weights (2880 settings), scored by the share of the 499 ordinary castled kings at ≥ 100, subject to tapered our-king danger ≥ 150 on g4 ply 42, g22 ply 17 and g26 ply 32 (`analysis/555bcaf-full/engine-dev.md` section 3). All numbers are from the Python replay of the modified formula.

| setting | loss FENs g4 / g17 / g22 / g26, raw (tapered) | ordinary castled: median / q90 / ≥ 100 / ≥ 150 | their king > 200 on c9cb33a positions (unbiased) | their king > 200 on 1517c7b positions |
|---|---|---|---|---|
| v3 as played: 3u², cap 700, storm 2/2/1/1, files 2/1 | 378 / 27 / 715 / 522 (315 / 22 / 595 / 456) | 12 / 147 / 13.6 % / 9.8 % | 16 % | 51 % |
| 1u², cap 400 | 136 / 9 / 304 / 184 (113 / 7 / 253 / 161) | 4 / 64 / 7.2 % / 4.0 % | – | 34 % |
| 2u², cap 400, base 3 | 143 / 0 / 407 / 215 (119 / 0 / 339 / 188) | 0 / 47 / 6.2 % / 4.0 % | 9 % | 33 % |
| 3u², cap 400, base 4 | 162 / 0 / 415 / 258 (135 / 0 / 345 / 225) | 0 / 42 / 7.2 % / 5.0 % | 10 % | 34 % |
| **P1: 3·max(0, u − 4)², cap 400, storm 3/3/2/2, files 1/0 (×2 with enemy R/Q), zone N2 B2 R3 Q5, shield 15** | **207 / 12 / 415 / 207 (172 / 10 / 345 / 181)** | **0 / 27 / 5.4 % / 3.6 %** | **9 %** | 30 % |

- **P1 is the proposal.** It keeps the three piece-attack losses at ≥ 170 tapered, cuts the ordinary tail from 13.6 % to 5.4 % (q90 147 → 27), and halves the opponent-king bonus in unbiased positions. The base of 4 units is what removes the noise floor (a queen on one zone square plus a half-open file); `1·u²` alone leaves the tail at 7.2 % and g4 at 113.
- **g17 ply 43 cannot be made ≥ 150 by this term and should not be**: the f5/g5/h5 pawns stand four ranks away with no piece in the zone (3 storm units). The best grid setting reaching ≥ 100 there (4u², base 0, storm 3/3/2/2) lights 10.2 % of ordinary kings; and Stockfish rated the position only −88 before a3, so a 150-cp penalty would be wrong. Gate g17 at ≥ 0 (it is a one-ply search miss, section 3 of the 555bcaf report) and drop it from the static gate.
- **The two-attacker gate of v1 must not return.** With it, g4 (lone queen, 10 zone squares) and g22 (queen plus bishop, one in the zone) drop to 15; that gate is precisely why v1 missed those losses.
- **Asymmetry is the structural fix, rescaling only shortens the leash.** Even under P1, 30 % of this run's positions score the opponent's king > 200, because the search selected them. Apply the term at full weight to the root side's own king and at half weight (cap 200) to the opponent's: a `ROOT_COLOR` static set in `search` (the same hook contempt needs), `mg -= sign * (if color == root { kd } else { kd / 2 })`. The attack half then never outbids a minor piece, which is the whole failure mode of section 2, while the defence half keeps the c9cb33a losses covered. Runner-up, symmetric: multiply the danger by a material factor (full when the attacker is not behind, half when a pawn down, zero when a piece down); it does the same for sacrifices but also suppresses genuine attacks a pawn down.
- Static gate before benching: P1 tapered ≥ 150 on g4/g22/g26, ≥ 0 on g17; ordinary castled ≥ 100 in ≤ 6 %; their-king > 200 in ≤ 10 % of c9cb33a's positions (unbiased sample); `make profile` nps within 3 % of the kept eval after the mask precomputation.

## 6. Prioritised code changes

1. **King danger P1 + root-side asymmetry** (`eval.rs` `king_danger`, `evaluate`; `search.rs` sets the root colour). Evidence: sections 2 and 5; 7 of 15 losses with their-king v3 ≥ 300 and material ≤ 0; ordinary tail 13.6 % → 5.4 %. **+30–60** relative to v1 on the same ladder.
2. **Precomputed king-zone masks** for the term (static `[ZoneMasks; 64]` per colour: zone, shield, storm-per-distance, three file masks). Evidence: nps −11 % with queens on (section 3). Node-identical, `make profile` gated. **+10–15**, ship with item 1.
3. **Opening sacrifices at low depth**: g7/g11 Bxf7+ (ply 3, d8), g28 Nxf2 (d9), g10 Bxh3 (d8), g3 Bxc6+, all with cp loss ≥ 350 at depth 8–10. A capture that loses material by SEE and gives check should not be searched at full depth from a root at d ≤ 9 unless it is the hash move; today the term pays the sacrifice back one ply later. Verify on the g7 ply 3 FEN at 0.25 s after item 1: if Bxf7+ is still chosen, add SEE-based reduction of losing checks. **+10–20**.
4. **Repetition when ahead**: g17 (+390 SF) ended in a repetition at own 0; the rescues (g10/g21/g27) are welcome. The claim-aware set from the c9cb33a report, applied only when the root score is > +100. **+5–10**.
5. **Same-ladder baseline**: run the kept eval once on 2300–2500 (or item 1 on 2100–2300) so the next keep decision compares equal opponents; the 30-Elo keep margin is smaller than the ladder step's own effect (section 4). Not code, but it is the cheapest way to avoid discarding a +50 change.
6. **Endgame optimism without queens** (+96 mean this run, +90 in c9cb33a, 53 % of plies > +100) is unchanged by anything here; the draw-scaling item from the 555bcaf report stands. **+20–35**.
7. **Reserve/hard-limit riders** from the earlier reports (52 % of moves at the hard limit, max 0.241 s): unchanged, no action.

**Next single change: item 1 with item 2 folded in.** The run did not show that king danger is wrong; it showed that a symmetric 700-cp term is a bounty the search will pay material for. P1 halves the tail, the root-side asymmetry removes the bounty, and the static gate above can be checked in seconds with the same replay script before a bench is spent.
