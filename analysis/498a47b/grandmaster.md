# Grandmaster review: run `498a47b` (king safety v2 on the null-move + LMR search of `1a24270`)

Result 28/0/2, avg depth 10.6 (1a24270: 28/2/0, depth 11.1). "SF" is the full-strength annotation, "own" our search score, both from **our** side. The PGN `[%eval]` tags are from White's side.

**Where the files are.** Commit `c4bf447` (the `[discard]`) was reverted in `62ad409`, so `analysis/498a47b/` and `games/runs/498a47b/` are gone from the working tree. This review reads them from `git show c4bf447:analysis/498a47b/...`. This file is the only thing written back.

**Short answer.**
- v2 removed the *slow* version of the old disease: queen raids on the rim while the opponent gathers pieces, the pattern behind both 1a24270 draws.
- It did not stop a *direct* attack. Its numbers are far too small for that, and game 5 is the old pattern move for move.
- It also brought a new habit, needless king moves. It cost about 18% of nps, which took about a ply off the opening, and the opening got worse.

## 1. Did v2 fix the king-exposure pattern?

I measured three proxies over every engine move in both runs, using the same openings, colours and levels.

| proxy | 1a24270 | 498a47b |
|---|---|---|
| Moves with our queen ≥5 king-steps from our king while theirs is ≤3 from it: count / total cp lost | 41 / 2681 | 34 / **795** |
| Pawn moves next to a castled king with queens on: count / total cp lost | 26 / 3021 | 24 / **1299** |
| King moves with both queens on: count / total cp lost | 20 / 1082 | **39 / 1921** |
| Games where SF had us ≤ −2.00 at some point | 6 | **8** (2 lost, 6 rescued by SF errors) |
| Contested positions (\|SF\| < 4): middlegame ACPL, blunders | 46.0, 11 | 43.7, 8 |
| Contested positions (\|SF\| < 4): opening ACPL, blunders | 18.7, **0** | 26.1, **5** |

The commit message says "middlegame ACPL 48 → 37, blunders 28 → 14". Most of that gain comes from positions that were already decided. **In positions still in play the middlegame gain is small (46.0 → 43.7), and the opening got clearly worse.**

**What got better.**
- The G22/G30 draws of 1a24270 did not repeat. There was no ...Qa1 or ...Qxa2 drift for ten moves while the other side built Q+R+R. Both games were won this time.
- Rim queen trips cost 70% less.

**What did not get better.**

- **Game 5 is the exact old pattern.** See §2.
- **Game 25 (W, 1500, Petroff): SF was at −4 to −7.6 from move 11 to move 26, while own stayed between −1.2 and +1.8.**
  - Black played ...g6, ...f5–f4, ...Bg7, ...Ng5–f3/h4 and a queen on the long diagonal.
  - We answered with 15.Qh3? (−262, own −0.11, SF −4.92, best f4), 16.Ne2 (−179), 17.Kh1 and 18.g4.
  - v2 counts only *pieces* that hit the zone, so a pawn storm costs nothing. We won only because SF blundered with 26...gxf3 (−991).
- **Game 15: 4.hxg4? opened the h-file toward our own king with the black rook still on h8.** The shelter terms are worth about 40 cp × taper, while the bishop is worth 330.
- **Rescues in the other bad games.** G8, G18, G20 and G24 were also won from −3.4 to −6.5 only because SF-1500/1700 gave the game back.

## 2. Why the two games were lost

### Game 5 (W vs 1700, Caro-Kann shape): a won position given away by the queen raid, the king shelter, and then g4??

1. **The position was won.** After 28...Qd8? SF had us at **+3.59**, and 30.Rxb7 won a pawn.
2. **The queen went hunting pawns on the queenside instead of consolidating.** 29.Be3 (−129, best h3) and **32.Qb5 (−143, best Qb7)** put the queen on b5, about 5 steps from g1. Black answered ...Qxe7, ...Qg5 and ...Nf4.
3. **34.g3 weakened the light squares** (small loss, but strategically the start): 35...Nh3+ 36.Kf1 Qf5 37.Qd3 Ng5.
4. **38.Rf4 (−120) and 39.Kg1? (−159, best Ke2).** SF wanted the king to run to the centre. Our king table and the "d/e-file king +15, no castling rights +25" penalty rule that out while queens are on, so the king went back into the Q+N net.
5. **42.Qd1 (−157, best c3) and 43.Qa1 (−45).** The queen went to the corner, where it pins nothing and defends nothing. SF dropped from +1.6 to −0.45, while **own stayed at +2.8 to +3.2** the whole time.
6. **44.g4?? (−514, depth 10, 0.24 s, own +3.18, SF −5.53; best c6).**
   - Position before the move: `3r2k1/5pp1/4p1p1/2P3nq/P2B1R2/P5P1/2P2P1P/Q6K w - - 19 44`
   - Play went 44...Qh3 45.Kg1 Nf3+ 46.Rxf3 Qxf3. After that we lost the exchange, the h-pawn, and then the game over 170 plies.

Why v2 missed it, worked out from the code (`eval.rs` in 498a47b):

- **The attack term is tiny.**
  - Q(5) + N(2) = 7 units, and 7² × 2 = 98 cp. Black's threat phase is Q4 + R2 + N1 = 7/12, so the charge is about 57 cp.
  - Adding the rook still gives only about 200 × 7/12 ≈ 117 cp.
  - SF priced the danger at about 3.5 pawns *before* g4.
- **Pushing g3–g4 costs almost nothing.** The g-file goes from "advanced" (10) to "missing" (25), which is 15 cp × 7/12 ≈ 9 cp. Meanwhile g4 "attacks" the queen, which the search likes.
- **There are no defenders and no queen distance in the term.** Our queen on a1 scores the same as it would on f1.

### Game 15 (W vs 1600, Exchange Ruy): a mate in 3 not seen at depth 11

The game went 1.Bxc6 dxc6 2.O-O Bg4 3.h3 h5!? 4.hxg4? (−113) hxg4 **5.Nxe5?? (−881, depth 11, 0.24 s, own +0.41)** Qh4 6.f4 g3 7.Qh5 Rxh5 8.Nc3 Qh1#.

- Position before 5.Nxe5: `r2qkbnr/1pp2pp1/p1p5/4p3/4P1p1/5N2/PPPP1PP1/RNBQ1RK1 w kq - 0 5`
- **Search.** The mate is only 6 plies deep: Nxe5, Qh4, f4, g3, any, Qh1#. Black's key moves (...Qh4, ...g3) are both quiet moves, which LMR reduces, and there is no check extension. A depth-11 search that misses this is a pruning bug, not a depth limit. That is my hypothesis for the engine dev; it should be tested on this FEN.
- **Eval.** v2 also saw nothing after 4...hxg4.
  - With Rh8 alone on the open h-file there is only one attacker. The `attackers >= 2` gate gives **0**.
  - After ...Qh4 it is Q+R = 8 units, which is only 128 cp.
  - The open h-file itself is charged 25 + 15 cp.

## 3. New problems v2 created

1. **King fiddling.** King moves with queens on went from 20 to 39, and the cp they lost from 1082 to 1921. Two causes:
   - **The `attackers >= 2` cliff.** A king step that takes one piece out of the zone deletes the whole penalty.
     - **G8 6...Kh8?? (−274, own 0.00, depth 8).** With Kh8 the Bh4 no longer counts, so the "danger" disappears. Meanwhile b4 traps the knight on a5.
     - **G17 14.Kh1 (−297)**, G18 13...Kh8 / 17...Kg8, and **G10 30...Kh8 (−176)**.
   - **King moves that give up castling.** The centre penalty covers only the d and e files, the MG table gives f1/f8 +10, and castling rights are worth nothing.
     - **G14 6...Kf8? (−164, own +0.39, SF −0.90; best Ne7)** and G9 13.Kf1 (−128). G20 7...Kg8 (−237) finished the same kind of manoeuvre.
2. **Speculative sacrifices "because the king is open".**
   - **G18 8...Nxf2 (−205, own +0.59, SF −1.98)** 9.Rxf2 Bxf2+ 10.Kxf2 gave two minor pieces for rook and pawn.
   - For 25 moves own stayed between −0.8 and +0.6 while SF had us at −3.3 to −5.1. v2 credits the exposed white king on f2 and nothing credits the two minors.
3. **Slower search, so a shallower opening.**
   - nps fell from 5.6M to 4.6M in the run (7.9M to 4.5M in `make profile`), and opening depth from 11.0 to 10.1.
   - Opening blunders in contested positions went from 0 to 5: G8 Kh8, G11 7.Nxd4, G14 Kf8, G15 Nxe5, G18 Nxf2.
   - **G24 22...Be6?? (−960, depth 8, 0.24 s, own +3.02, SF −6.54)** was a sharp position with checks around our bare king, searched to depth 8.
4. **No passivity and no bad trades that I can find.**
   - Queens stayed on longer (20 of 30 games never traded them, against 15).
   - Conversion was slightly faster: 35 plies from the first SF +3 to mate, against 42.
   - The attacking side of v2 works. G17, G25 and G27 were finished by queen attacks on the king.
5. **One persisting issue that is not new.** In the Scotch as Black, 1...Qh4 2...Qxe4 still leads to G20 (−5.98 by move 10, 7...Kg8 −237) and G24. It is the same greed as 1a24270 G22/G24.

## 4. Prioritised suggestions (engine-implementable)

1. **Rescale the king-danger term and remove the cliff.**
   - Count one attacker at a reduced weight instead of zero.
   - Add units for safe checks available to the enemy queen, rooks and knights, and for zone squares attacked by the enemy and defended only by our king.
   - Subtract units for our minors and rooks that defend the zone.
   - Use a quadratic table that reaches 300–500 cp with Q+N+R attacking, instead of `units² × 2`.
   - Regression FENs; the side to move must come out ≤ +1.0 and must not choose the bad move:
     - G5 `3r2k1/5pp1/4p1p1/2P3nq/P2B1R2/P5P1/2P2P1P/Q6K w - - 19 44` (own +3.18, SF −0.39, not g4)
     - G25 `r1bq1rk1/1p4bp/2p1n1p1/p2p1p2/8/P1NB2Q1/1PPP1PPP/R1B1R1K1 w - - 0 15` (own −0.11, SF −2.30, not Qh3)
     - The 1a24270 FENs for G30 (after 35...Qa1) and G22 (after 17...gxf6)
2. **Charge for our queen's distance when their queen is close.**
   - Penalise about 40–60 cp × taper when the enemy queen is ≤3 king-steps from our king and ours is ≥5.
   - Evidence: G5 32.Qb5 (−143), 42.Qd1 (−157), 43.Qa1, and the 1a24270 raids. The proxy above shows v2 halved this problem without closing it.
3. **Make shelter pawn moves and pawn storms matter.**
   - Charge 40–60 cp × taper for a shield pawn advanced past its second square, or captured away, on the king file or the files next to it.
   - Charge +20 for each enemy pawn on those files that has reached our half of the board.
   - Double both when the file is half-open with an enemy rook or queen on it.
   - Evidence: G5 34.g3 / 44.g4, G15 4.hxg4 (Rh8 on the file), G25 ...f5–f4 with 18.g4, G28 20...fxg6 (−116), and G29 14.h3 (−153).
4. **Make castling rights worth something and stop the king-tuck bonus.**
   - Give +20 cp per remaining castling right while the enemy has queen plus rook.
   - Treat Kf1/Kf8 with the h-rook still at home like a centre king.
   - Evidence: G14 6...Kf8 (−164), G9 13.Kf1 (−128), G20 7...Kg8 (−237), G8 6...Kh8 (−274), G17 14.Kh1 (−297). King moves with queens on went from 20 to 39.
5. **Stop reducing quiet moves that attack our king, and add a check extension.**
   - No LMR for moves that give check or land a queen or rook in the enemy king zone.
   - Extend by one ply when in check, and search evasions in qsearch.
   - Test FEN: G15 `r2qkbnr/1pp2pp1/p1p5/4p3/4P1p1/5N2/PPPP1PP1/RNBQ1RK1 w kq - 0 5` must not play Nxe5 (mate in 3 missed at depth 11). This also covers G24 22...Be6 at depth 8.
6. **Pay back the nps.**
   - Compute the attack sets once per side and reuse them; the mobility term will need them anyway.
   - Cache shelter and open files in a pawn hash.
   - Skip `king_danger` when the enemy threat phase is ≤ 3.
   - Target: back to ≥ 5.5M nps and an opening depth of about 11. Evidence: G8 Kh8 at depth 8, G24 Be6 at depth 8, and the opening blunders going from 0 to 5.
7. **Add an imbalance term: two minors against rook and pawn is +50 cp for the minors while queens are on.**
   - Evidence: G18 8...Nxf2 (−205), then 25 moves at own ≈ 0 against SF −3.5 to −5. It is the sacrifice v2 itself made attractive.

## 5. Verdict

**Not yet. A stronger opponent would feel it only as a wash.**
- **What v2 fixed:** the slow bleed, which was behind the two 1a24270 draws (rim-queen losses 2681 → 795 cp).
- **What v2 did not fix:** the fast kill (G5 44.g4 at own +3.18, the G25 pawn storm, the G15 h-file). Its whole attack term tops out around 1–2 pawns, where SF prices these positions at 3–7.
- **What v2 cost:**
  - 18% of nps, and five opening blunders in contested positions.
  - A new king-shuffling habit caused by the `≥2 attackers` cliff and the missing value for castling rights.
- **Against SF at 1500–1700:** six of our 28 wins came from positions at −3.4 to −7.6 that SF gave back (G4, G8, G18, G20, G24, G25). Against 1800 and above, v2 would have lost more games than 1a24270, not fewer.
- **What to do:** the structure is right, so keep the code path. Retune it with suggestions 1–4, restore speed with 6, and re-bench before calling it a keep.
