# Grandmaster review: run `73fbb69` (depth ~10 search, material + tapered PST eval)

24/2/4 against Stockfish 1700–1900 (Elo est. 2092, wins@1800 = 7). Move numbers follow the annotated PGNs (which start after the book line). `[%eval]` is from White's side; "(−N)" is Stockfish's cp loss for our move; "own" is the engine's own root score where the summary records it.

**In one sentence:** the deeper search has removed the opening disasters and the central-king losses, and what is left is one theme wearing three costumes: the engine does not know that its own king is under attack while the enemy queen is on, so it grabs pawns, pushes its shield pawns and walks its king at the exact moment the position demands defence.

---

## Which of the old themes still decide games?

| theme from earlier reviews | status at depth ~10 | evidence in this run |
|---|---|---|
| King safety with the enemy queen on | **Still the number one cause.** Decisive in 5 of the 6 non-wins. | G2 20...f5, 30...g6; G10 25...g5; G12 23...Bd5 → Qh6/h5; G16 15...f5, 30...g5, 31...Kg7; G15 39.Kf2–41.Kxh4 |
| Pawn grabs far from the king | **Still there, now the trigger for the king attacks.** | G2 18...Nxh4 (opened the h-file at our own king), 26...Qxb2 (−440), 28...Qa3, 29...Qb3 while Q+R+R came for f7; G10 12...Nxb2 (−474); G12 20...Bxc4 (−72) with Qg4 arriving; G16 19...Qxh3 |
| Mating nets below the horizon | **Much reduced, and now only where the eval steered us into the attack first.** | G2 30...g6 (own +2.08, SF −5.29, d9), 42...Kf8 (−476); G15 43.a5 (−362, mate after ...Bc8/...Qg5#) |
| Central king / castling | **Solved.** All six games castled by move 11 (G23 is queenless from move 3). | — |
| King walks with pieces on | **Shifted:** it no longer stays in the centre, but it *leaves* the castled position with queens on. | G16 31...Kg7 (−122), 37...Kf6 (−105); G15 39.Kf2 (−207), 40.Kg3, 41.Kxh4; G23 22.Ke3 (−110, +1.10 → 0.00, four rooks and five minors on) |
| Passed pawns | Secondary. One game turned on it. | G23 29.b4 (−266) c5! 30.bxc5 b4 → b3-b2 passer decided the game; 31.Nc2 (−132) |
| Trapped pieces | Not a cause of losses. We were once the beneficiary and did not cash it (G23 24/25 Rxh6, −145/−139), but SF says that only kept equality. | — |

**New or previously underweighted:**
- **Self-weakening pawn pushes in front of the castled king** (f5/g5/g6/h5) are the single most frequent large error: G2 20...f5 (−121), 30...g6 (−529); G10 25...g5 (−289); G16 15...f5 (−153), 30...g5 (−277), 38...g4; G12 13...f5, 21...g6. Six of the run's twelve worst engine moves are this.
- **Pawn structure**: G16 12...bxa4 (−192, isolated a-pawn plus already doubled c-pawns, +2.17 for White and never recovered), G15 20.bxa4 (−68, doubled a-pawns), G23 29.b4 (gave Black a protected passer).
- **Planless shuffling in equal middlegames**: G15 moves 8–29 contain twelve rook moves (Rab1, Rfe1, Rbd1, Rb1, Red1, Ra1, Re1, Red1...) that drifted +1.18 → −0.48, then 30.Qf4?? (−232) walked into 30...Nxe3. Nothing in the eval says where a rook or knight is well placed.
- **Piece-for-pawns misjudgement**: G10 12...Nxb2 (own +2.41, SF −4.74 → 0.00). The d3 knight, on a pawn-protected outpost with no enemy pawn able to chase it, paralysed White; the eval priced it as a knight and sold it for bishop-plus-pawn.

Phase data agree: middlegame ACPL 51.5 with 31 blunders, against 20.9 in the opening and 32.0 in the endgame. The losses are made in the middlegame, with queens on.

---

## The games

### Game 2 (Black vs 1700, 1-0): −2.07 for White at move 16, lost to an attack on a castled king
- 6...Ne4 (−93) and 7...Qd5 (−42) are the old early-queen habit, harmless here. After 15.Ke2 (White's king on e2!) and 16.Ne5? we stood at **−2.07** (SF, i.e. winning for us).
- 16...Nxe5 (−119, best Nxb2), then **18...Nxh4** took the h-pawn and opened the h-file toward our own castled king with Rh1 and Qb1–h7 already aimed there. **20...f5?!** (−121) and 21.exf6 opened the f-file too.
- **22...Rf8?** (−251, best Rf5) allowed 23.Rxh7 (SF missed it). **23...Bxg5??** (−407, best Rf5) grabbed a pawn: 24.Bxg6 hxg6 25.Qxg6 wins (+4.79). SF played 25.f4? (−0.24 again).
- **25...Bf6** (−278, best e5) and **26...Qxb2??** (−440, best Qd8, +7.16): the queen went to b2 and stayed there (28...Qa3, 29...Qb3) while Qg6, Rh1 and Rab1 came for f7. 27.Qh7+? (−560) let us off once more (0.00 after 30.Qh5+ if 30...Ke7).
- **30...g6??** (−529, own +2.08, SF +5.29): with Qh5, Rh1 and Ra1–g1 pointing at the king on f7, the engine pushed the last shield pawn to gain a tempo. Position: `r1b2r2/pp3kp1/4pb2/2p4Q/P1p2P2/1qN1P3/3BK3/R6R b`. It was up three pawns and scored the position as such. 42...Kf8 (−476) finished it.
- Verdict: three separate winning or equal positions thrown away by pawn grabs and shield pushes with the enemy queen and two rooks on. Search depth 9–10 on every one of them.

### Game 10 (Black vs 1800, 1-0): −4.90 at move 11, gone in one move
- The reversed fried-liver (2...Nxe4, 3...Nxf2, 4...Bxf2+) came out well: 7.Kg1? and 11.Qf1? left White at **−4.90** with our knight on d3 dominating everything.
- **12...Nxb2??** (−474, own +2.41, SF 0.00, best a6): `r1bq1rk1/pp3ppp/8/3p4/B1p1p3/N1Pn4/PP1PN1PP/R1B2QK1 b`. After 13.Bxb2 Qb6+ 14.Nd4 Qxb2 15.Nac2 Qb6 we have bishop-plus-pawn for the knight, and White's pieces are free again. The engine cannot value an outpost knight above a bishop.
- 20...a5 (−117), then **25...g5??** (−289, best Qd6, +5.20) with Qf4 and Bg4 already on the king: 26.Qf6! and the f6/g5 complex collapsed (26...Bxg4 −111). The rest was a slow Q+P vs R loss (our d5/e4/c4 passers never moved while the h-pawn ran).
- Verdict: piece-placement blindness turned +4.9 into 0.0, a shield push turned 0.0 into −5.

### Game 15 (White vs 1800, 0-1): planless middlegame, then a king walk into the queen
- 1.Bxc6 and 3.d4 were fine (+1.18 at move 2). From move 8 to 29 the engine played twelve rook moves with no plan; SF's eval went +1.18 → −0.48 in small steps (8.Rab1 −98, 13.Rbd1 −37, 14.Qd4 −44, 15.Rb1 −40, 20.bxa4 −68 doubled a-pawns).
- **30.Qf4??** (−232, best Bf4) allowed 30...Nxe3 with ...f5 to follow; **31.Qxe3** (−146, best fxe3) and 33.Rab1 (−129) → −5.80.
- **39.Kf2?** (−207), 40.Kg3, **41.Kxh4** walked the king up the board toward a queen and bishop with queens on. **43.a5??** (−362, best Rb8+) allowed 43...Bc8 and mate on g5 (`Qg5#` at move 48).
- Verdict: no mobility or outpost sense to steer the equal middlegame, then king safety once the position was already bad.

### Game 16 (Black vs 1800, 1-0): pawn structure, then the king marched forward
- **12...bxa4?** (−192, best Rab8, +2.17): opened the a-file and made a-pawn and doubled c-pawns permanent targets. 13...Qg5 (−160), **15...f5?** (−153, best Rfb8, +3.65) opened the f-file in front of our own king for nothing.
- 19...Qxh3 pawn-hunting, 21...Qd7, 23...Qc7 (−137): the queen wandered while Rxa4 and Qd5/Qg2 gathered.
- **30...g5??** (−277, best Re6, +4.81) with Qe4 on the board, then **31...Kg7** (−122), 33...Rg8 (−136), 34...Rgc8 (−112), **37...Kf6** (−105), 38...g4 (−72): the king left g8 and walked toward the centre with queens and rooks on. From there it was a long lost Q+B+P ending (82...Ke8 −287 into the g7/a7 promotion race).
- Verdict: pawn structure gave White the edge; shield pushes and the king walk turned an edge into a win.

### Game 12 (Black vs 1900, draw by repetition): a gift, not a slipped win
- Never better than −0.63 for White. 20...Bxc4 (−72) grabbed a pawn with the bishop that guarded the kingside. **23...Bd5??** (−241, best Bd3, +3.75), 24...Qb6 (−151), 25...Re7 (−152), 26...Rf7 (−201), 28...Qc5 (−214, d7!): Qg4–h6 with h4–h5 against our g6 king, Ra3–g3 rook lift, and every reply was passive. −6.33 by move 28.
- 38.Bf6? (−207) gave us +1.78... in White's favour, still; **40...Rb1+??** (−362, best Qd1+) and it was +8 to +11.
- SF 1900 repeated (81.Qc5+, −221) at +9.51. Nothing to convert here; contempt would not have changed the result, only the way we lost.

### Game 23 (White vs 1900, draw by repetition): the "≥ +1.5" was a one-ply blip
- Queens off at move 3. The +1.55 after 17...b5 was Stockfish's inaccuracy and was returned within five moves: 18.Bd3 (−99, best g4), 20.Re1 (−53, best Kf2), **22.Ke3?** (−110, best Rg1, +1.10 → 0.00) put the king on e3 with four rooks and five minor pieces on and Black's rook on e5 facing it.
- 24.Ne2 (−145) and 25.b4 (−139) both missed 24.Rxh6 (Nh6 had zero squares after g4/f5, Rh4 on it), which SF says only keeps equality.
- **29.b4??** (−266, best a4) c5! 30.bxc5 b4 31.Nc2 (−132) b3 → b2: a protected passed pawn on b2 and we were −4 to −8 for the rest of the game. SF 1900 shuffled Ka1/Ka2 into a threefold at −8.0.
- Verdict: king centralised too early for the material on the board, then a pawn move that manufactured an enemy passer. A win never existed, but the equal position was lost by eval-side errors.

---

## What the six non-wins are made of

| game | result | convertible? | strategic cause (eval) | tactical cause (search) |
|---|---|---|---|---|
| 2 | loss | **yes** (−2.07 for White at move 16) | king attack ignored: h-file opened by own capture, f5/g6 shield pushes, Qxb2 grab | 30...g6 own +2.08 vs SF −5.29 at d9 |
| 10 | loss | **yes** (−4.90 at move 11) | outpost knight sold for B+P (Nxb2); g5 shield push vs Qf4/Bg4 | — |
| 15 | loss | partly (equal, +1.18 early) | no plan in an equal middlegame (12 rook moves); king walk into the queen | 30.Qf4 (Nxe3), 43.a5 (mate) |
| 16 | loss | partly (equal until 12...bxa4) | pawn structure (bxa4, f5); shield pushes; king walk (Kg7, Kf6) with queens on | — |
| 12 | draw | no (lost from move 23) | king attack ignored (Bd5, passive replies to Qh6/h5) | 40...Rb1+ |
| 23 | draw | no (equal after 22.Ke3) | king to e3 with 9 pieces on; 29.b4 gave a passer | 24/25 Rxh6 missed |

King safety with the enemy queen on is present in 5 of 6. The two "lost from ≥ +1.5" games (2 and 10) are exactly the two where a king-danger term would have vetoed the losing moves.

---

## Prioritised suggestions (engine-implementable)

1. **King danger while the enemy queen is on: attackers plus shelter, in one term.**
   - Zone = king square, its 8 neighbours, and the 3 squares two ranks in front. Count enemy pieces attacking the zone with weights N 2, B 2, R 3, Q 5; map the sum through a convex table (e.g. `units*units/4`, cap ~500) and zero it when the enemy has no queen.
   - Shelter: for the three files around the king, penalty for the friendly pawn being missing (~30) or advanced past rank 3 (~15 per rank); extra penalty for an open or half-open enemy file on those files (~20/40) — this is what 18...Nxh4, 20...f5, 30...g6, 25...g5, 15...f5, 30...g5 all created.
   - Evidence: G2 30...g6 (own +2.08, SF −5.29), 26...Qxb2 (−440), 20...f5; G10 25...g5 (−289 → +5.20); G12 23...Bd5 (−241) and the 24–28 collapse; G16 15...f5, 30...g5 (−277 → +4.81); G15 39.Kf2 (−207). Use the attack bitboards already generated; the previous pawn-only shelter (`dd6c58b`) failed because it saw none of the attackers.
2. **Mobility (safe-square count per piece, queen weighted low).** Rewards active rooks and minors and punishes a queen parked on b2/a3/b3 (G2 26–29), a bishop that leaves the king to take c4 (G12 20...Bxc4), and twelve planless rook moves (G15 8–29). It also detects trapped pieces for free (G23 Nh6 with 0 squares). Cost is one attack lookup per piece.
3. **Pawn structure: isolated (−12), doubled (−15), backward (−8) in mg, larger in eg; passed pawns +[0,10,15,25,45,75,120] by rank, doubled when the square in front is free and the enemy king is outside the square.** Evidence: G16 12...bxa4 (−192, +2.17 and never recovered); G15 20.bxa4 (−68); G23 29.b4 (−266 → −4.25) and 31.Nc2 (−132) letting b3–b2 run; G10 ending, where our d5/e4/c4 passers stood still for 40 moves.
4. **Knight outpost and bishop pair.** Knight on ranks 4–6 (relative), protected by a pawn and not attackable by any enemy pawn: +25 mg / +15 eg, more on the central files. Bishop pair +25. Evidence: G10 12...Nxb2 (own +2.41 vs SF −4.74 → 0.00) is a −474 swing produced entirely by the eval's inability to value the d3 knight; G16 4...Bxf3 (−23) gave up the pair for nothing.
5. **Taper the king PST by the opponent's remaining non-pawn material rather than total phase, with the queen dominant.** While the opponent has a queen, use the middlegame king table at full weight; with two enemy rooks, at ≥75%. Evidence: G23 22.Ke3 (−110, +1.10 → 0.00) with four rooks and five minors on; G16 31...Kg7, 37...Kf6; G15 39.Kf2, 40.Kg3, 41.Kxh4. This also stops the king "helping" a pawn grab with the enemy queen still on (G15 41.Kxh4).

**Add first: suggestion 1.** It is present in five of the six non-wins and is the direct cause of both losses from winning positions (G2, G10). With it the engine keeps the h-pawn capture off the board in G2 or at least declines 23...Bxg5/26...Qxb2/30...g6, and does not play 25...g5 in G10 — each of those is a single-move veto that the term supplies without any additional search depth. Expected effect: G2 and G10 become wins, G12 and G16 stop being lost by move 30, and G15 loses a lever. Suggestions 2–4 are worth doing afterwards, together, because they are all needed for the slow equal-middlegame losses (G15, G16, G23), which no single term fixes.

A search footnote: the check extension has done its job. The remaining horizon miss (G2 30...g6, quiet Qh7+/Rag1/e4 threats) is a quiet mating net, not a checking sequence; it is cheaper to make the eval dislike the position than to make the search see the mate.
