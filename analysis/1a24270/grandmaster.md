# Grandmaster review: run `1a24270` (null move + LMR on top of TT/killers/history/PVS, original eval)

Result 28/2/0, avg depth 11.1 (was 7.6). "SF" below is the full-strength annotation and "own" is our search score, both from **our** side. Moves are given as in `analysis/1a24270/game_NN.pgn`. The PGN `[%eval]` tags are from White's side, so for games where we are Black the sign is flipped.

The extra three or four plies did real work. They removed most of the cheap tactical give-backs, the king walks and the slow conversions from the last review. What is left is almost entirely **the eval's picture of the king**. In every big error the engine thought it was +1.5 to +3 and Stockfish had it −4 to −11. The same mistake keeps coming back: our queen grabs a pawn on the edge of the board, the king is left to its pawns, and the opponent swings Q+R+R or Q+R+B at it.

## 1. The two draws: both were lost games that Stockfish failed to finish

Neither draw was a win we threw away by repeating. In both games we were strategically better, walked into a king attack we did not see, and were lost by −9 to −18. **Stockfish then repeated checks instead of mating us.** Against a stronger opponent both are losses.

### Game 22 (Black vs 1600, Scotch): two pawns up after the queen raid, then the kingside was opened

- **Opening.** 1...Qh4 2...Qxe4, 5...Qxb2 (−155) and 9...Qxa2 won two pawns with the queen.
  - At move 14 SF had us at +2.17; own was +2.15 to +3.10.
- **11...Bxg3? (−127, best Be5) 12.fxg3.** We gave up the bishop pair and **opened the f-file toward our own king**.
- **15...Rab8 (−120) and 16...Qa5 (−81).** The queen went to a5, far from the kingside.
- **17.Rxf6! gxf6?? (−334, own +1.65, SF −3.07; best 17...Qxc7).** This took the exchange but broke up our king's pawn cover.
  - 18.Nxd5 Be6? (−241, own +1.05, SF −4.13) 19.Nxf6+ followed. We were at −8.4, and own did not go negative until *after* Nxf6+ had been played.
- Stockfish handed some back: 22.Qh4? (−529) and 24.Re1 left us at −2.86.
- **24...Kh8?? (−545, depth 9, own +0.25, SF −8.31; best Rd6)** walked into Nxh5 on the h-file and dark squares.
- The rest was a lost ending. SF-1600 pushed h-pawns to h8=Q, then repeated Qa8+/Qd5+/Qe4+/Qe5+ checks with two queens against our king.

### Game 30 (Black vs 1700, Petroff): +3.1 up two pawns; our queen went to a1 and the king fell

- **The pawns.** 17...Bxf4 and 22...Qxh3 (−68, best Rfe8) won a second pawn, but the queen had to take it on h3.
  - At move 28 SF had us at +3.10 and own was +2.05. White had a bishop against our knight, and Q+R+R all near our king (g8, pawns f7 g7 h6).
- **Ten moves of drift.** Own stayed flat at +2.05 to +2.15 through 27...Re8, 28...Rf8 (−91, best Qg6+), 30...Qf6, 31...Rd6 and 32...Qf4. Meanwhile White built Qh5, Rf3, Re3 and Be4–d5, and SF dropped from +3.1 to +1.06.
- **35...Qa1? (−272, own +2.15, SF −1.66; best Ne7).** The queen went to the corner, leaving no defender within five squares of g8.
  - Position before the move: `5rk1/1pp2pp1/p1nr3p/7Q/P2PB3/2P1RR2/5PK1/2q5 b - - 25 35`
- 36.Bd5 was an error by SF (+0.68 to us). Then **36...g6?? (−1180, depth 9, own +2.85, SF −11.12; best Nd8)** allowed 37.Qxh6 with mate threats on h7, g7 and f7. The Nd8 defence of f7 was the move we needed.
  - Position before the move: `5rk1/1pp2pp1/p1nr3p/3B3Q/P2P4/2P1RR2/5PK1/q7 b - - 27 36`
- 40...Nxd4 (−542) came in a position that was already lost. SF-1700 then repeated 43.Qe7/44.Qe8+/45.Qe7 (loss 142, best Rh8+) and let us off.

**What the draws say.**
- No draw came from our own repetition choice this run. The "draw = 0" issue from the last review did not come up.
- Both games were **king-safety misjudgements with our queen far away**. The eval scored "2 pawns up" and did not count the attackers.

## 2. Wins that went through bad positions

In six wins SF had us at ≤ −2.

| game | low (SF) | move(s) | own there | nature |
|---|---|---|---|---|
| 25 (W, 1500) | −8.70 | 4.Kf1 (castling rights lost), king on g1 with the rook stuck on h1; **24.Rxb7?** (−435, own +1.55 / SF −4.47) 24...f4!, **25.Nh3?** (−287, own +1.45 / SF −8.70), 26.Nxg5 (−269) | +1.45 to +1.55 | Pawn grab on b7 while ...f4 and Qd5+Bc4 aimed at g2/f1; king safety |
| 6 (B, 1700) | −4.50 | 19...h6 (−185), 20...Red6 (−198), **22...f6** (−164, own −0.15 / SF −4.50), 26...Rxe4 (−219) | −0.30 to 0.00 | Rook ending with minors: loosened kingside pawns, Rg3xg7 |
| 16 (B, 1600) | +0.21 from +5.1 | 12...h5, 30...g6/31...gxf5, 35...hxg4 opened our own king's files. Then **41...g3** (−244), **43...c5** (−338, own +3.50 / SF +0.21; best Bxd4), 46...Be5 (−282), 48...Qg4 (−229) | +3.5 to +4.95 | Pawns pushed in front of our own king; White got the h-file (Rh5–h3, Bh6) |
| 29 (W, 1700) | −2.57 | **10.Qxh8** (rook grab, queen shut out on h8), **12.Nd4** (−359), **13.a3** (−324, own +3.10 / SF −2.38) | +2.7 to +3.1 | Queen out of play and nearly trapped; no mobility sense |
| 23 (W, 1700) | −2.42 | 14.Re3, **15.Rh3?** (−161, own +0.50 / SF −2.42) 15...Rxh3+ 16.gxh3 | +0.45 to +0.50 | Accepted doubled, isolated h-pawns; no pawn-structure term |
| 24 (B, 1700) | +0.13 from +4.5 | 4...Kd8 (castling rights lost), **11...Qxa2** (−114), **13...Ke8** (−133, own +4.90 / SF +0.13) | +4.5 to +4.9 | King in the centre with Rhe1 against it and the queen on a2. SF then blundered 14.Qb6 |

Other large errors that SF did not punish:
- G21 **5.Nxa7?** (−509, depth 9): after 5...Rxa7 6.Bxa7 b6 the bishop on a7 is trapped.
- G5 **15.f4** (−424, own +4.70 / SF +2.61).
- G17 **9.Qxa8** (−300; 9...Qxf2+ and our king walked Kd1–c1). It still won.

**The pattern for a stronger opponent.**
- In 5 of these 6 games SF-1500/1700 returned the favour within a move or two: G25 25...Bg5 (−421), G29 19...Nxe3 (−502), G6 23.Re4 and 24.Kf1, G16 45.Bh6 and 47.Kc1, G24 14.Qb6. SF-1800+ will not.
- The **queen raid on the rim** comes up again and again: G22 Qxb2/Qxa2 then Qa5, G24 Qxa2 then Qa1+, G29 Qxh8, G30 Qxh3 then Qa1, G17 Qxa8.
  - Each gain of a pawn or the exchange was scored at full value, with nothing charged for the queen leaving the king.
- **Scotch as Black: 1...Qh4 2...Qxe4** was played in G22 and G24. It is the same greed, straight out of the opening.

## 3. Findings from the 97aee56 review: what persists at depth 11

| 97aee56 finding | Now | Evidence |
|---|---|---|
| No king safety | **Persists; it is now the #1 cause.** Both draws, plus G25, G16 and G24 | own − SF gap of 2.5–14 pawns at G22 17...gxf6, 24...Kh8; G30 35...Qa1, 36...g6; G25 24.Rxb7, 25.Nh3; G24 13...Ke8 |
| No check extension; qsearch stands pat in check | **Still not implemented** (`negamax`/`quiescence` in `search.rs`). Most still-missed refutations were checks or mate threats | G22 19.Nxf6+ was seen only after it happened; G30 37.Qxh6 (quiet mate threats); G22 24...Kh8 at depth 9 |
| Clock under-used (soft limit 0.4×) | **Worse:** 57% of 0.25 s now (was 71%). Iterations are cheaper, so the 40% cutoff stops earlier | The decisive blunders were at depth 9, below the average of 11: G22 24...Kh8 (0.14 s), G29 13.a3, G21 5.Nxa7 (0.15 s), G30 36...g6. 31 of 40 blunders were at depth ≤ 11 |
| Binary endgame king switch | **Mostly cured by depth.** 6 king advances with queens off and ≥ 3 pieces each cost 419 cp in total (was 7 moves / 902), and no single one cost ≥ 100 | G23 7.Kd2/11.Kd3, G1 15.Ke3, G11 24.Kf3, G20 Kd6 |
| No pawn structure | **Persists** | G23 15.Rh3 (gxh3), G6 19...h6 / 22...f6, G22 11...Bxg3 12.fxg3 opened the f-file for 17.Rxf6 |
| No passed pawns / slow conversion | **Much better.** Most wins went from +3 to mate in 10–20 engine moves | Leftover: G25 spent moves 34–58 at a flat +4 in a two-rook ending, and G20 spent 27 moves at +3 to +7 |
| Repetition = 0 | **Not triggered.** We chose no repetitions, and both threefolds were Stockfish's | No evidence either way this run |

## 4. Strategic vs tactical

**Strategic (eval), which drives nearly all the lost points:**
1. **King safety and queen distance.**
   - The eval counts material around our king and nothing else. Q+R+R+B pointed at g8 (G30) scores the same as those pieces sitting on the queenside.
   - It also has no idea that our queen on a1/a2/a5/h8 is not defending.
2. **Mobility and trapped pieces.** G29's Qh8, G21's Ba7 after ...b6, and G30's Qa1 cost nothing in the eval.
3. **Pawn structure.**
   - It takes doubled or isolated pawns without complaint (G23 gxh3).
   - It pushes pawns in front of its own king without cost (G16 h5, g6, gxf5, hxg4, g3; G6 h6, f6; G30 36...g6).
   - It opens files toward its own king (G22 Bxg3 fxg3).
4. **Passed pawns.** This is minor now; see G25.

**Tactical (search):**
- The refutations we miss are **checks and mating threats** against our king 1–3 plies beyond depth 9–10: G22 Nxf6+, G22 Nxh5 on the h-file, G30 Qxh6 with Qh7#/Rxf7 ideas, G25 ...f4 with Qxg2 threats.
  - There is no check extension, and qsearch stands pat while in check. So "we are in check but up a pawn" is scored as up a pawn.
- **Sharp positions get the least depth.** Most of the big blunders came at depth 9 while the engine stopped at 57% of its time.
- **Trapped-piece tactics:** G21 Nxa7/Bxa7 b6 and G29 Qxh8. These are partly depth and partly the missing mobility term.

## 5. Prioritised suggestions (engine-implementable)

1. **King danger that counts attackers *and* charges for an absent queen and missing defenders; test it on this run's positions.**
   - The `498a47b` experiment (zone attackers, shelter, tapered king table) is the right direction. Take the G30 36...g6 position: pawn shelter intact, attackers Q+R+B, so units² × 2 ≈ 200 cp. That leaves own at about +0.85 against SF's −11.
   - Add:
     - (a) a bonus per attacker when our queen is more than 4 king-steps from our king while the enemy queen is inside that radius of it (for example 40–60 cp);
     - (b) a small bonus per own minor or rook touching the king zone, subtracted from the attack units;
     - (c) a penalty for own pawns advanced 2+ squares on the king's file or the files next to it while enemy heavy pieces are on (G16, G6, G30 36...g6).
   - Regression FENs; the side to move should end up at ≤ 0:
     - G30 `5rk1/1pp2pp1/p1nr3p/7Q/P2PB3/2P1RR2/5PK1/2q5 b - - 25 35` (after Qa1)
     - G22 `1r3rk1/ppN2ppp/5R2/q2p4/6b1/3QB1P1/2P3PP/1R4K1 b - - 0 17` (after gxf6)
     - G25 `3r1rk1/1R2b1pp/2p5/P2q2N1/2bP1p2/P3B3/2P2PPP/3Q2KR w - - 0 25`
2. **Check extension plus in-check quiescence.**
   - Extend +1 ply when the side to move is in check.
   - In qsearch, when in check, search all evasions and return a mate score if there are none.
   - Optionally add quiet checking moves at the first qsearch ply.
   - Evidence: G22 17...gxf6 18.Nxd5 19.Nxf6+ (own +1.65 until the check landed), G22 24...Kh8 (d9) followed by Nxh5, and G30 36...g6 37.Qxh6 (d9).
3. **Spend the clock.**
   - Raise the soft limit from 0.4× to about 0.65× movetime. That is the cheapest Elo available now, at 57% use.
   - Allow one extra iteration when the root score dropped ≥ 40 cp from the last iteration, or the best move changed.
   - Evidence: the decisive blunders G22 24...Kh8 (0.14 s, d9), G29 13.a3 (d9), G21 5.Nxa7 (0.15 s, d9) and G30 36...g6 (d9). Average depth is 11.
4. **Mobility, with a queen/rook trapped or on-the-rim penalty.**
   - Count pseudo-legal moves (N ≈ 4, B ≈ 4, R ≈ 2, Q ≈ 1 cp per square above a baseline), using attack sets `king_danger` already computes.
   - Evidence: G29 10.Qxh8 then 13.a3 (own +3.10 / SF −2.38), G21 5.Nxa7 6.Bxa7 b6, G30 35...Qa1, and G22 16...Qa5.
   - This also damps the rim queen raids in G22 5...Qxb2/9...Qxa2, G24 11...Qxa2, and 1...Qh4 2...Qxe4 in the Scotch.
5. **Pawn structure.**
   - Doubled −15, isolated −15, and −10 more when the pawn is also on a half-open file.
   - Charge a half-open or open file next to our king as a king-danger unit while enemy rooks or queen are on.
   - Evidence: G23 15.Rh3 16.gxh3 (−161, own +0.50 / SF −2.42), G22 11...Bxg3 12.fxg3 and later 17.Rxf6, and G6 19...h6/22...f6 (own 0 / SF −4.5).
6. **Passed-pawn bonus by rank (about 10/15/25/45/75/120 cp for ranks 2–7, doubled in endgames and when the path is free).** This is lower priority now that depth converts most wins.
   - Evidence: G25 moves 34–58 at a flat +4 in a two-rook ending, and G20's 27 moves at +3 to +7.
7. **Wins-only draw score (contempt) of −150 to −250 from our side.** It was not triggered this run, but it is cheap insurance against stronger opponents: once positions are balanced more often, the engine will start taking 0.00 repetitions that count as losses for us.
