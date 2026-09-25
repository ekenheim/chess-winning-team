# Grandmaster review: run `ad95e70` (transposition table)

Score 24/3/3 against Stockfish 1500–1700 (Elo est. 1915, the same as the baseline's 1915). Move numbers follow the annotated PGNs, which start from the book position. `[%eval]` is full-strength Stockfish from White's side; "(−N)" is Stockfish's cp loss for our move. PVs quoted here come from Stockfish 19 at depth 18 on the game positions.

**In one sentence:** the deeper search removed some cheap tactical losses, but the chess understanding has not changed. `eval.rs` is still material plus Michniewski tables, and every loss and every draw again comes from **our own king standing somewhere unsafe**. The baseline problems are all still there: uncastled or wandering king, queen raids with undeveloped pieces, and cheap bishop-for-knight trades. There is one new, sharper finding: **the "no queens = endgame" switch sends our king to the centre while all the rooks and minor pieces are still on the board** (game 21).

## Did the baseline problems persist?

| baseline problem | status in `ad95e70` | evidence |
|---|---|---|
| king safety / no shelter term | **persists, decisive** | all 3 losses (20, 22, 26) and draw 16 |
| uncastled king | **persists** | castled in **13 of 30** games (baseline 14/30): 2, 5, 7, 8, 9, 10, 12, 13, 14, 15, 19, 26, 27. In 3 and 25 the king never moved. In the other 15 the king walked instead (for example 1: 14.Kf1, 16: 10...Kf8, 20: 6...Kd8, 21: 7.Ke2, 22: 14...Ke7, 17: 16.Kf1 (−746)) |
| early queen raids | **persists** | game 20: the queen made 9 of our first 20 moves, and Bc8 stayed home until move 27. Game 22: 4...Qxe4+, 6...Qe5, 9...Qa5. Game 4 win: 19...Qxh2 (−273) |
| bishop-pair giveaways | persists, milder | 16: 17...Bxe4 (−900), 11...Qxd4 (gives Be7 for Nd4). 20: 5...Bxc3+ (−515, missed 5...Qxg2 −4.8) |

Where TT depth helped: the losses are all middlegame now (no opening collapses like baseline game 13), and most conversions are cleaner. It did not help with **king safety**. Six *wins* passed through lost positions of −2.5 or worse (4: −4.2, 5: −8.4, 10: −2.6, 17: −2.9, 24: −10.0, 28: −7.2), and we won them only because Stockfish-1500/1700 blundered back. At 1600 we won 7 of 10; the other three (16, 21, 22) are all king-safety games.

---

## The losses

### Game 20 (Black vs 1500, Scotch, 1-0): +4.7, then the baseline game 24 again
- **Opening.** 3...Qe7 and 4...Qxe4+ is an early queen raid, but Stockfish-1500 blundered with 5.Be2? (−4.7 for White). *Tactical miss:* **5...Bxc3+? (−515)**. 5...Qxg2! (6.Nxc7+ Kf8 7.Rf1 Qxg5 8.Nxa8 d5) was winning. At depth 7 the engine saw only "king moves and Ra8 is lost". Giving up the bishop pair also cost us a trump.
- **Strategic 1: pawn-hunting with an uncastled king.** 6...Kd8 (castling gone), **7...Qxg2 (−299, best Re8)**, 9...Qxf2, 13...Qxd4, 14...Qc3, 16...Qa1+, 17...Qxa2. The queen collected five pawns while Bc8 and Ra8 did not move until moves 23 and 27. Stockfish asked for ...Re8/...d6/...Ke7 again and again: it wanted development and a king that can connect the rooks.
- **The decisive moment, tactical but caused by strategy.** At move 16 we were **+5.5** (a clean piece up). White's queen was on g7 and our king on e8 in front of an open e-file. **16...Qa1+?? (−1046)** 17.Kd2 Qxa2 18.Re1+! and the queen has to block on e6, where it is lost (19.Qxh7/Qg8+ and Rxe6). 16...Ke7 or 16...d6 kept a winning position. The engine does not see the quiet check Re1+ at the end of its line: quiescence stands pat while in check (see suggestion 3).
- **The ending.** A queen ending a bishop down was 0.00 (perpetual check) at move 39. **39...c4 (−222, best Qh4+/Ke7)** let the perpetual go, 49...Qb2 (−240) finished it, and we lost on move 84.
- *Strategic:* early queen, 7...Qxg2 greed, king on the open e-file, two rooks' worth of development never done. *Tactical:* 5...Bxc3+ (missed Qxg2), 16...Qa1+ (missed Re1+), 39...c4 (lost the perpetual).

### Game 22 (Black vs 1600, Scotch, 1-0): chose a pawn move over castling
- Same early pattern: 4...Qxe4+, 5...gxf6 (doubled f-pawns next to our own king), 8...Bxc3 (bishop pair given), and the queen on e5 then a5. Still roughly equal at move 13 (+0.2).
- **Strategic, decisive: 13...f5?? (−468, best O-O-O).** With White's Nd5, Bb3 and Qd2 aimed at the centre and our king on e8, the engine played a pawn move instead of castling. Why: in `KING_MG_PST`, c8 is only +10 over e8, so O-O-O is almost worthless to the eval. After 14.Nf6+ **14...Ke7 (−123, best Kd8)** the king walked out.
- **Tactical, the "equal-material" desperado: 15...Nd3+?? (−560).** 16.Qxd3 Kxf6 gets the knight back, so the material count says 0. But the king on f6 is then hunted: 17.Qd4+ Ke7 18.Rhe1+ Be6 19.Rxe6+ and it is over (+9 by move 20). This is the clearest example of "material equal, king dead" that a material+PST eval can never see.
- *Strategic:* not castling (13...f5), king walk 14...Ke7, doubled pawns in front of the king. *Tactical:* 15...Nd3+.

### Game 26 (Black vs 1500, Petroff, 1-0): castled, but into the attack
This is the one loss where we castled, and it shows castling is not enough. The king needs *shelter*.
- 1...Qe7 (−81) is an early queen move blocking Bf8. Then 4...Be6 and **5...O-O-O (−139, best d5)** castled queenside while White had c4, Qa4 coming and b4 available.
- **Strategic, decisive: 6...Kb8 (−287, best d5) and 7...d5 (−274).** The king PST gives b8 +30, as good as g8, whatever is in front of it. So the engine happily put its king on b8 facing Qa4, Nb5 and a b-pawn storm. After 8.Nb5 we were −4.2 by move 7.
- **Tactical, greed with an open king: 15...Qxe2 and 16...Bxc5?? (−714, best Ka7).** 15...Qxe2 won a piece, but White's bxc5 opened the b-file to b8. Stockfish rated the position **+7.7 for White while we were a piece up**. 16...Bxc5 allowed 17.Rab1+ with mate in 11. Stockfish-1500 missed it (17.Qxa6) and later threw away most of its advantage (30.Rc1, to +2.3). Then **31...Ka8 (−229, best Nf8)** put the king on the a-file just as a4-a5 opened it, and we lost a long ending.
- *Strategic:* castling toward the opponent's pawn majority and queen, Kb8 into an open b-file, grabbing material with the king exposed. *Tactical:* 16...Bxc5, 31...Ka8.

---

## The draws (all three were *lucky* saves, no wins slipped)

The summary is right that no draw was ever ≥ +1.5 for us. In each one we were totally lost (−14 to −16), and Stockfish repeated moves instead of converting.

### Game 1 (White vs 1500, ½-½): pawn-grabbing bishop, rook on h1 never played
- 8.Bxc7 grabbed a pawn with the bishop. Then came **10.Ne5?? (−553, best Bxd7+)**, a *tactical* oversight: 10...Bxc3+ 11.bxc3 axb5 and we lost the Bb5. The "compensation" 12.Ng6/13.Nxh8 cost the king its castling rights (14.Kf1 after ...Qxc3+).
- Stockfish-1500 gave everything back with 14...Ra6? (+0.6 for us). *Strategically*, 18.Kg1 left **Rh1 buried behind the king**, and it never moved until 24...Nxh1 took it. Stockfish wanted 19.h3 (make luft, then Kh2 and connect the rook). Instead 19.Bh4 (−277), 22.Be5 (−162) and **23.Bg7? (−266)** sent our only kingside minor piece hunting h6/g5 while ...Nxf2 forked Qd1 and Rh1. The eval gives that rook its full 500 cp even though it had no legal moves for 24 moves.
- The engine was −16 at move 48. Stockfish repeated with 48...Kh7.

### Game 16 (Black vs 1600, Exchange Ruy, ½-½): 8...g5, 10...Kf8, and a queen that left the king
- **Strategic 1: 8...g5 (−117, best Bg4 or O-O).** This weakened the kingside in front of our own uncastled king to chase the Bf4. **10...Kf8** then gave up castling (SF: 10...Kf7, connecting the rooks).
- **Strategic 2, decisive: 11...Qxd4? (−350, best Bd7).** In material terms it is a knight for a bishop, so it looks equal. But 12.Qxe7+ Kg8 puts White's queen on e7 with the Re1 behind it, our king on g8 and **Rh8 buried for the rest of the game**. The engine counts N=B and misses that its whole position has been given away. It is also a bishop-pair giveaway.
- Then came passive rook shuffles, 13...Rc8 (−148) and 14...Rb8 (−339) (Qd6 was needed to guard the 7th rank), and the *tactical* **17...Bxe4?? (−900, best Rf8)**, which gave up the last good minor piece. After 18.dxe4, White's rooks own the 7th rank and the e-file. Stockfish-1600 took back with the wrong rook, then repeated 19.Qb3+/20.Qa3 at +7.

### Game 21 (White vs 1600, Scotch, ½-½): the endgame king table with 14 pieces on the board
This is the most instructive game of the run.
- 6.Qxd4 (−108) traded queens, and from then on `is_endgame()` returns **true** (it treats "no queens" as endgame), even though both sides still have two rooks, two knights or bishops and all the pawns. The king switches to `KING_EG_PST`, which rewards d4/e4 with +40.
- **Strategic: 7.Ke2, 8.Kd3.** The king walks toward the centre with every minor piece still on. Stockfish tolerates it (−0.3), but it sets up the tactic: **10.Be3?? (−706, best Ke2)** 10...Ne5+ is a knight fork of Kd3 and Bc4. That is a *tactical* oversight, but it happened only because the king stood on d3.
- Stockfish gave it back (10...d5?), and the engine kept marching: **12.Kd4, 15.Kc5**. Then **17.Rad1?? (−497, best Nd5)** 17...c6! and the king on c5, in front of Black's pawns, is trapped (18.Nd5 Nd7+ 19.Kc4 cxd5+). We were −5 to −14 from there until Stockfish's 62...Bc1 allowed a repetition.
- *Strategic:* king centralisation in a middlegame without queens. *Tactical:* 10.Be3 (Ne5+ fork), 17.Rad1 (...c6 cage).

---

## Strategic vs tactical summary

| game | result | decisive strategic misunderstanding | tactical oversights |
|---|---|---|---|
| 20 | L | queen hunts pawns (9 of the first 20 moves), Bc8/Ra8 undeveloped, king on the open e-file | 5...Bxc3+ (missed Qxg2), 16...Qa1+ (Re1+), 39...c4 (lost the perpetual) |
| 22 | L | 13...f5 instead of O-O-O, 14...Ke7 king walk | 15...Nd3+ (Kxf6 and the king is hunted) |
| 26 | L | O-O-O and Kb8 into Qa4/Nb5/b4, grabbing a piece with the b-file open | 16...Bxc5 (Rab1+ mates), 31...Ka8 |
| 16 | D (lucky) | 8...g5, 10...Kf8, 11...Qxd4 (queen leaves, White's queen enters e7), Rh8 buried | 17...Bxe4 |
| 21 | D (lucky) | endgame king table used with all minors on: 7.Ke2, 8.Kd3, 12.Kd4, 15.Kc5 | 10.Be3 (Ne5+ fork), 17.Rad1 (...c6) |
| 1 | D (lucky) | 8.Bxc7 bishop pawn-grab, Rh1 buried behind Kg1, bishop hunting h6/g5 | 10.Ne5 (loses Bb5), 23.Bg7 (...Nxf2 fork) |

In every game above, the tactic that decided it was aimed at **our king** or came from a king move. The engine loses to checks and forks on a badly placed king, not to deep positional squeezes.

---

## Prioritised suggestions (engine-implementable)

1. **King-safety term, scaled by the enemy's attacking material.** This combines pawn shield, open files and attackers. For the king's file and the two next to it, penalise a missing shield pawn on the 2nd/3rd rank (about −15 each) and an open or half-open file toward the king (about −20/−10). Penalise our own pawn advances in front of the king (g5/f5 with the king on e8/g8). Add a non-linear penalty for enemy Q/R/N attacking the king zone. Scale everything by enemy non-pawn material, full when the enemy queen is on. *Evidence:* G26 6...Kb8 (−287) into an open b-file, then 16...Bxc5 (mate in 11). G22 13...f5 (−468). G16 8...g5 (−117). G20 16...Qa1+ with the king on the open e-file.

2. **Replace the binary `is_endgame()` with a tapered MG/EG king score by phase** (non-pawn material, e.g. N=B=1, R=2, Q=4, total 24). Today "no queens" alone flips the king to the centralising table with rooks and minors still on. *Evidence:* G21 7.Ke2 8.Kd3, leading to 10.Be3?? Ne5+ (−706), and 12.Kd4 15.Kc5, leading to 17.Rad1?? c6 (−497). G28 5...Kd7 (−155). G22 14...Ke7 and 16...Kxf6 (−141).

3. **Search: don't stand pat in check, and extend checks.** In `quiescence()`, if the side to move is in check, generate all evasions (no stand-pat, mate if none). Add a +1 check extension in `negamax`. The decisive tactics were quiet checks and forks one or two plies past the horizon. *Evidence:* G20 16...Qa1+ 17.Kd2 Qxa2 18.Re1+ (−1046). G22 15...Nd3+ 16.Qxd3 Kxf6 17.Qd4+ (−560). G26 16...Bxc5 17.Rab1+ (−714). G21 10.Be3 Ne5+ (−706). 46 of 65 blunders were at depth ≤ 8.

4. **Reward castling properly and penalise losing the right without castling.** Tie the castling reward to the shelter term in item 1, so c8/b8 with a broken shield is not worth +30. The current table makes O-O-O worth +10 and b8 worth the same as g8. Add a one-off penalty (about −40) when castling rights disappear through a king or rook move with queens on. *Evidence:* G22 13...f5 instead of O-O-O (−468). G16 10...Kf8. G20 6...Kd8. G17 16.Kf1 (−746, best Kd2). G1 14.Kf1. Only 13 of 30 games castled.

5. **Development and early-queen penalty (opening phase only).** Penalise each minor still on its home square (about −15) and a queen off d1/d8 while two or more of our minors are undeveloped. Give a small bonus for connected rooks. *Evidence:* G20 queen 9 of the first 20 moves, Bc8 home until move 27, 7...Qxg2 (−299) instead of ...Re8. G22 4...Qxe4+/6...Qe5/9...Qa5. G26 1...Qe7 (−81). Baseline G23/G24 showed the same thing.

6. **Mobility (pseudo-legal moves per minor and rook), a trapped-rook penalty, and a bishop-pair bonus (+30 to +40).** A rook boxed in by its own king (Rh1 next to Kg1/Kf1, Rh8 next to Kg8/Kf8) with zero mobility should cost about −50. *Evidence:* G1 Rh1 had no moves for 24 moves until 24...Nxh1. G16 Rh8 buried from move 12 on. G16 17...Bxe4 (−900) and 11...Qxd4 (N for Be7). G20 5...Bxc3+ (−515).

7. **Do not count material grabbed with an exposed king at face value.** When our king-safety score (item 1) is bad, damp the value of pawn captures by the queen, or add the king-danger penalty *before* stand-pat in quiescence so a queen raid is not scored as +1 per pawn. *Evidence:* G26 15...Qxe2 won a piece, but Stockfish had it at +7.7 for White. G20 7...Qxg2 and 17...Qxa2. G4 (a win) 19...Qxh2 (−273).
