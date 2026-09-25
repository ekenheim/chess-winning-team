# Grandmaster review: run `97aee56` (TT + killers + history + PVS, original eval)

Result 27/2/1, avg depth 7.6. The better search shows. The engine punishes Stockfish-1600/1700 blunders quickly and mates cleanly once it is clearly ahead. What is left is almost all **eval blindness**. In every serious error the engine's own score was +2 to +6.5 while Stockfish's was −3 to −6. Ply/move references are to `analysis/97aee56/game_NN.pgn`. "own" is the engine's search score and "SF" is the full-strength annotation, both from the engine's side.

## First: the two "slipped" draws were not wins thrown away by repetition

The summary flags games 10 and 24 as "≥ +1.5 at some point". Both times that was a single ply after a Stockfish blunder, and **our reply gave it straight back**. After that the engine was lost for 40+ moves. It took the threefold only when its own eval of every alternative was −6 to −9.

**Game 10 (Black vs 1600).**
- The opening already showed the theme. 5...Nxc1 (−198, best O-O) kept the king in the centre, and after 6.Bxf7+ Ke7 it never got safe.
- 12...Bxb2? (−502, own +5.00, SF −2.65). 13.Raxc1?? handed back +6.52. Then **13...Bxc1??** (−1032, own +5.75, SF −3.80; best 13...c6). With the black king on d6, White's Qg7 and Bf7 against it and every white piece free, Black grabbed a rook. After 14.Qh6+ Kc5 15.d4+ **Kxd4??** (−646, own +6.50, SF −5.58) the king walked to d4/e4/f5/g5 under checks. By move 19 SF had it at −16.7.
- Stockfish then misplayed Q vs B+2P, but the engine never got better than about −5.5. At 53...Bf3 and 55...Bf3 (d14–16, own 0 vs −665 for the rest) and at 58...Kc3 it chose the repetition because every alternative scored −6.5 or worse.

**Game 24 (Black vs 1700).**
- 25...Qf2 and 26...Qxb2 sent the queen pawn-hunting on b2, far from a king defended only by pawns.
- 26.h4? gave +3.78. Then **27...c5?** (−378, own +3.00, SF 0.00; best 27...Qf2), 28...h5 (−282), **29...fxg6** (−290, own +4.05, SF −3.12) and **30...Kh7??** (−527, own +4.00, SF −5.11).
- The engine counted "up the exchange + 2 pawns" = +4. It did not see Qe6+ and Bd3 against g6 with its queen stranded on b2. By move 31 it was −9.9. The final repetition (56...Kf6, d16, own 0 vs −850) was again a lost engine bailing out.

**Should it have taken those draws?** Under our scoring a draw is worth exactly what a loss is worth, and the data say playing on pays against these levels:
- In this run the engine fell to ≤ −4 (SF) in 9 games: 3, 7, 8, 10, 12, 13, 18, 24 and 28.
- Stockfish converted **one** of them (game 3). We **won six** (7, 8, 12, 13, 18, 28) and drew two only by our own choice.
- Even in game 10's last 15 plies Stockfish dropped 393, 393, 1015 and 315 cp.

The search currently scores any repetition as exactly 0 (`is_repetition` → `return 0`, no contempt). With wins-only scoring that is the wrong number.

## The loss: game 3 (White vs 1600), +2.8 turned into a queen vs rook+knight ending, lost on move 86

- **22.Qxg6** (pawn grab) put the queen on the g-file with Kg1 behind it. Then **23.Rc1?** (−308, own +2.20; best 23.Rf1) allowed 23...Nf3+ 24.gxf3 Rg8. The queen was pinned, and 25.Qxg8+ Qxg8+ was forced.
  - Tactically the engine saw all of this at d7–9 (own +1.60 after it).
  - The error is **strategic**. It valued R+N+7P against Q+5P as +1.2 to +1.6 by material and piece-square tables. Stockfish scored it 0.00 and then worse: doubled f-pawns, loose b2/c2/d3, an open king, and a queen with a free hand against uncoordinated pieces.
- The drift that followed is typical of a material-only eval. The king went Kf2–g2–g3 into queen checks (27–30). 31.a3 (−146) and 34.Rf1 (−116) let the queen take c2 and d3. From move 30 to 70 the engine's own eval stayed between +1.1 and −0.2 while SF went from 0 to −6.
- At the end 75.f5 (−207) lost a pawn race it had already lost. The PGN is 172 plies long, and in all of them the engine never understood Q vs R+N with a broken pawn structure.

## Wins that went through lost positions or took too long

*Through lost positions, all won only because Stockfish returned the favour:*

| game | low point (SF) | move | own eval there | nature |
|---|---|---|---|---|
| 8 (B, 1500) | −6.65 | 7...f5 (−318), 9...h6 (−410) vs Ng5+Qh5, 13...Rxf2 (−244) | +0.45 to +0.75 | king safety: weakened e8–h5 diagonal and g6 |
| 28 (B, 1600) | −5.45 | 10...Ne2+, **11...Nxg3** (−432, best O-O-O) | +3.20 | king left in centre, queen on b2 |
| 12 (B, 1700) | −4.77 | 23...Re1+ (−358), 29...Rc6 (−297) | +0.90 / +1.75 | tactical, depth 8–9 |
| 13 (W, 1500) | −4.55 | **13.Kd3** (−218), 25.c4 (−472), **27.Kd3** (−303) | +2.5 to +3.1 for 20 moves | king walks in a middlegame without queens |
| 7 (W, 1500) | −4.36 | 9.Be3 (−198) allowed fxe3 doubled pawns; 19.Kf2–28.Rh4, 10 small slips | +0.3 to +1.1 | strategic drift, passive knights Nf3–d2–f1–g3 |
| 18 (B, 1700) | −4.15 | 12...Kxg7 (−263), **14...Bxd4** (−578) vs Rh4+Qf5 | +2.75 / +3.35 | king safety on the h-file |
| 19 (W, 1500) | −3.66 | 8.Qg5 (−436, early queen); later 26.Ke3 (−361) | +1.05 | opening tactic, then rook ending |

*Slow conversions (plies from first ≥ +5 to mate):* game 20 took 67 (+7.5 from move 3), game 19 69, game 11 63, and games 4, 27 and 29 about 55.
- **Game 11 is the clearest.** At +4.4 to +5.0 the engine played 40.Bb2, 42.Bc3, 43.Kf3, 44.Bf6, 45.Ke4, 46.a3, 47.Ke3 over plies 79–99 with its eval flat at 435–450. Nothing in its eval rewards pushing the passed pawns.
- Later 64.b6 (−472) came instead of 64.g8=Q. In game 28, 33...Bxh4 came instead of 33...a1=Q.
- These still won. But every shuffle is another move against an opponent that only needs one tactic.

*Analysis artefact:* several of the biggest "blunders" in the summary are winning mate lines where a different mate was shorter, not errors. They are G2 45...Rxa8, G4 33...Rc3, G7 53.Re6+, G20 34...Rac8, G21 46.Rd2, G26 37...Nd3 and G27 29.Rd3; G28 33...Bxh4 was also still winning. Only 30 engine moves lost ≥ 200 cp without a mate score on the board.

## Strategic vs tactical

**Tactical (search-side).** 27 of 56 blunders were at depth ≤ 8. The characteristic miss is a **checking sequence against our own king**: G10 Qh6+/d4+/Rd1+/Qc4+, G24 Qe6+ and G3's Nf3+ followed by the Rg8 pin. The search has no check extension, and quiescence stands pat even when the side to move is in check. So a line that ends "we're in check, up a rook" is scored as up a rook. The engine also uses only about 71% of its 0.25 s: the soft limit is 0.4×movetime, so it rarely starts depth 8 or 9 in sharp middlegames.

**Strategic (eval-side), which drives most of the damage:**
1. **No king safety at all.** Every large own-vs-SF gap is a king position: G10, G18, G24, G28 and G8, plus G3's queen in front of its own king. The engine grabs material with its king exposed (G10 12...Bxb2/13...Bxc1, G24 26...Qxb2) and walks its king toward checks (G10 15...Kxd4).
2. **The binary endgame switch fires when only the queens are off.** Then the king table rewards centralisation with 4–5 pieces per side still on. Seven engine king moves to the 3rd rank or beyond with ≥ 6 rooks/minors on the board cost 902 cp: G13 13.Kd3, 24.Ke3, 27.Kd3, G21 35.Kg3, 36.Kf3, G26 15...Kd6, 17...Ke6.
3. **No pawn structure or imbalance sense.** It happily accepts doubled pawns (G7 9.Be3 fxe3, G3 24.gxf3). It overrates R+N+pawns vs Q with loose pawns (G3). It has no notion that a passed pawn should run (G11, G19).
4. **No draw awareness.** A repetition is 0 even though a draw scores nothing for us.

## Prioritised suggestions (engine-implementable)

1. **Wins-only draw score (contempt).** Score repetition, the 50-move rule and stalemate as `−C` from the engine's (root) side, `+C` from the opponent's.
   - Start with C ≈ 200–300 cp and try larger values. Against these levels we won 6 of 9 games in which we were ≤ −4, and Stockfish converted only 1.
   - Keep C below the mate range so mates still dominate. Also make the single-occurrence repetition cutoff use this score rather than 0.
   - Evidence: G10 53...Bf3 / 55...Bf3 / 58...Kc3 and G24 56...Kf6, where it chose own-eval 0 over −650 to −850 continuations. A draw is worth exactly a loss.
2. **Cheap king-danger term, active only while the enemy queen is on.**
   - Count enemy attacks on the king zone (king square, its 8 neighbours and 3 squares in front), weighted N=2, B=2, R=3, Q=5, and pass the count through a nonlinear table capped near 400–500 cp.
   - Add a penalty for an uncastled king on the d/e files with castling rights lost, and for a king on rank 3 or beyond (rank 6 or below for Black).
   - Use attack bitboards you already generate. `dd6c58b`'s pawn-shield version cost 24% NPS for little gain, and now there is NPS to spare (4.8M).
   - Evidence: G10 13...Bxc1 (own +5.75 / SF −3.80) and 15...Kxd4 (+6.50 / −5.58), G24 30...Kh7 (+4.00 / −5.11), G18 14...Bxd4 (+3.35 / −4.15), G28 11...Nxg3 (+3.20 / −5.45), G8 9...h6.
3. **Check extension and in-check quiescence.** Extend by 1 ply when the side to move is in check. In quiescence, when in check, do not stand pat: search all evasions and return a mate score if there are none. Optionally, add quiet checks at the first qsearch ply.
   - Evidence: the king hunts in G10 (moves 14–19) and G24 (Qe6+, Bd3), and G3 23.Rc1 (Nf3+ ... Rg8 pin). These are all refutations built from checks that end just past depth 7–8.
4. **Replace the binary `is_endgame` switch with a tapered king PST.** Interpolate between the middlegame and endgame king tables by the opponent's non-pawn material, not by "queens off". A position with R+R+B+N each should still be close to middlegame for king placement.
   - Evidence: G13 13.Kd3 (−218), 27.Kd3 (−303) and 25.c4 with the king on e3 (−472); G21 35.Kg3 (−198). In total 7 moves and 902 cp.
5. **Passed-pawn bonus scaled by rank (e.g. 10/15/25/45/75/120 cp for ranks 2–7), larger when the path to promotion is free and in endgames.** This gives the engine a reason to convert.
   - Evidence: G11's 20-move shuffle at a flat +4.4 (40.Bb2 to 50.Bxc7), G11 64.b6 instead of g8=Q (−472), G28 33...Bxh4 instead of a1=Q, and the 55–69-ply conversions in G19, G20 and G11.
6. **Basic pawn-structure terms: doubled −15, isolated −15, and more for a doubled isolated pawn or one on a half-open file.** These also fix the worst imbalance misreads.
   - Evidence: G7 9.Be3 fxe3 (−198) led into a 20-move drift to −4.4 while own stayed about +0.8. G3 23.Rc1 went into R+N with doubled f-pawns and loose b2/c2/d3 vs Q, scored +1.6 against SF's 0.0 and then −3.
7. **Spend the clock.** Raise the soft limit from 0.4× to about 0.6× movetime. Extend once when the root score drops ≥ 50 cp between iterations. Average use is 71% of 0.25 s, and 27 of 56 blunders were at depth ≤ 8 (G24 27...c5 at d6, G28 11...Nxg3 at d6, G8 7...f5 at d6).
