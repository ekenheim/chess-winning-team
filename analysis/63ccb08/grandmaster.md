# Grandmaster review: run `63ccb08`

Score 25/1/4 against Stockfish 1500–1700 (Elo est. 1915). Move numbers follow the annotated PGNs, which start from the book position, so "1." is the first move after the set-up FEN. `[%eval]` is from White's side. Loss values shown as "(−N)" are Stockfish's cp loss for our move.

**In one sentence:** every loss follows the same pattern. Our king stays in the centre or has no shelter, our pieces (often the queen) go pawn-hunting on the other wing, and the opponent's pieces gather on our king. The evaluation (`engine/src/eval.rs`) is material plus simplified piece-square tables and has no king-safety, development or mobility term. The losses show that gap.

---

## The losses

### Game 7 (White vs 1500, Italian, 0-1): won position, then the kingside was left undefended
- **Opening/early middlegame were fine.** 1.d3 2.Ng5 3.Nc3 4.h3 5.O-O is slow but solid. After Stockfish's 7...d5? we were +2.1, and after 8.Bg5 f6 9.Bxf6 gxf6 10.Bxd5+ we were a clean pawn up against a broken black king (+1.7 to +2.5).
- **Strategic misunderstanding 1, whose open file is it?** 9.Bxf6 gxf6 opened the g-file. Black castled short, so this looked like it hurt Black. In practice Black's king simply stepped to h8 (14...Kh8) and the half-open g-file became Black's attacking file against *our* king on g1, which had already been weakened by 4.h3. Within five moves Black had ...Qg7, ...Rg8, knights on g6/h6 heading to f4, and h3 was a target.
- **Strategic misunderstanding 2, pieces went away from the king.** 14.Bxa4 (−122) grabbed a rook pawn with the bishop. 16.Nd5 (−368) and then 20.Nxc7 (−282) and 21.Nb5 (−419) sent the knight to the queenside to collect a c-pawn while Black's whole army pointed at g2/h3. 19.Qc3 put the queen on the long diagonal, far from the king. By move 21 our only kingside defenders were Nf3 and the king.
- **The collapse was king safety, not one tactic.** Stockfish-1500 gave the exchange back (21...Rxd3, +3.4 for us), but 23.Kh2 (−164, best Kh1), 24.g3? (−200: this weakened f3/h3 and allowed ...Nxh3) and 25.Qe1 (−429) let the knights and queen in. 27.Nxg5 (−491) removed the last defender. Mate on h6.
- *Tactical oversights:* 16.Nd5, 21.Nb5, 27.Nxg5. *Strategic:* opening the g-file against ourselves, sending the knight to the queenside, 24.g3.

### Game 13 (White vs 1500, Exchange Ruy, 0-1): lost in the opening by opening a file onto our own uncastled king
- 1.Bxc6 bxc6 2.Nxe5 d5 3.Nxc6 (−68, best O-O). The knight grabbed a second pawn while our king was still on e1. After 3...Qh4 the knight on c6 is loose and Black's queen is active.
- **4.exd5?? (−698)** opened the e-file onto our uncastled king. After 4...Bg4 the queen on d1 has no good square and we had to give it up (5.Qxg4 Qxg4). Stockfish's 4.Qe2 keeps the e-file closed and covers e4. Search saw it as a tactical oversight, but the cause was strategic: we grabbed material while the king sat in the centre, then opened lines toward it.
- The rest (a queen down, around −5) had one more instructive moment. After 32...Qf2 (a Stockfish blunder, eval −0.4, practically holding) the threat was **...Qg1+ Rxg1 Nf2#**, a smothered mate against a king on h1 with no escape square. The only move was 33.h3 (making an escape square). We played 33.Nc4 (−558), then 34.Rd7+ (−418) and threw the rook away with spite checks. The pattern "king in the corner, no escape square, enemy Q+N nearby" was not recognised.

### Game 23 (White vs 1700, Scotch, 0-1): never castled, queen did everything alone
- After 1...d5 2.Nxc6 bxc6 3.exd5 Bb4+ 4.c3 Bc5 the position is simply good for White. **5.Qe2+ (−57, best Be2)** was the first early queen move. Then came pawn moves with the development undone: 7.b4 (−89), 9.b5 (−132), followed by **10.Qe5 and 11.Qxc7 (−331)**, a pawn grab with Bf1 and Rh1 still at home and the king on e1.
- 15.Nf3 (−244, best **O-O-O**), then 16.Be2 (−253) allowed ...Bg4-xf3 and gxf3, which wrecked the kingside pawns around our own king. 19.Qc4 (−115, best **O-O**) again declined to castle.
- Stockfish-1700 blundered back (19...Bg5, +1.15 for us). We then played 20.c7 and 21.bxa6 (−298), pushing pawns to the 7th/6th rank (the pawn PST rewards this heavily) instead of 20.h4 or 21.Qe4 and getting the king safe. 23.Rd1 (−191, best Kf1) and 24.Bc1 (−354) followed, and Black's rooks and queen mated the king that never left e1/e2/f1.
- *Strategic:* early queen sorties, queenside pawn pushes before development, three refusals to castle, allowing doubled f-pawns in front of the king. *Tactical:* 11.Qxc7, 24.Bc1.

### Game 24 (Black vs 1700, Scotch 4...Qh4, 1-0): +3.3 and two pawns up, then lost to a king in the centre
- 1...Qh4 2...Qxe4 4...Qxg2. Two pawns, and after 5.Kd2? (Stockfish error) we were **+3.3**. This was the best winning chance we had in any loss.
- Then the queen made 8 of our first 13 moves (Qe4, Qf4+, Qe5, Qg5+, Qf4, 13...Qxh2 as a third pawn grab) **while Bc8, Ra8 and the d-pawn never moved**. Stockfish asked for ...c6 or ...d5 five times (moves 10, 11, 12, 13, 14) to free the bishop and blunt Bc4/Bb3 against f7. We never played it.
- 11...Be7 (−314) put the bishop on the file White's rook was about to occupy (12.Rg1/14.Re1). 12...Rg8 (−583) gave up kingside castling. **14...Kf8 (−572)** gave up castling for good and left the king on the f-file next to f7, facing Bb3 and Bd4. 15...Qf4 (−704), 16...Bd6 (−1154) and the position fell apart (Bxf6, Qc4 hitting f7).
- *Strategic:* pure greed plus no development. The material count said +3 but the position was already worse by move 12. The early win of material was right; spending the next 10 moves on more pawns instead of ...d5, ...Bd7/...Be6 and ...O-O-O was the error.

### Game 16 (Black vs 1600, Exchange Ruy, ½-½): **not a slipped win but a lucky save**
The engine was never better than +0.5. From move 42 it was lost (+4.6 to +15 for White, Q+B vs R by move 90). It held by threefold repetition because Stockfish-1600 could not convert. How it got worse:
- **Bishop pair given away for nothing.** In the Exchange Ruy, Black's whole compensation for the damaged pawns is the two bishops. We played 5...Bxf3 (−43) and 7...Bxd2+, giving both bishops for knights and leaving a static, slightly worse structure.
- **Middlegame king walk.** With queens and two rooks each on the board, 32...Kg8, 33...Kf7 (−104), 34...Ke8, 35...Kd7, 37...Kc8, 41...Kb7 marched the king across the board toward the queenside, where the a- and b-files had already been opened (14.axb6). The piece-square table rewards b7/c8 for a Black king about as much as g7/g8, so the engine did not see this as dangerous. Eval went from +0.5 to +1.9.
- Then the tactics: 42...Rc6 (−312, best Qc6) and 53...axb3 (−559), grabbing a pawn instead of 53...cxd4, gave White a decisive attack.
- Positive: in the lost ending the engine kept its king next to its rook and found the repetition. That defence was sound.

---

## Strategic vs tactical summary

| game | decisive misunderstanding (strategic) | tactical oversights |
|---|---|---|
| 7 | opened g-file onto own king; knight sent to the queenside to hunt pawns; 24.g3 | 16.Nd5, 21.Nb5, 27.Nxg5 |
| 13 | pawn grab with king uncastled, opened e-file toward e1 | 4.exd5 (Bg4 wins Q); 33.Nc4 missed smothered mate |
| 23 | never castled; early queen roaming; pawn pushes before development | 11.Qxc7, 24.Bc1 |
| 24 | queen pawn hunting, Bc8/Ra8 undeveloped, castling forfeited (12...Rg8, 14...Kf8) | 16...Bd6 |
| 16 | gave up bishop pair; middlegame king march to the open wing | 42...Rc6, 53...axb3 |

All four losses started from positions where we were at least +1.5. **Stockfish did not outplay us strategically; we gave it a king to attack.** At depth ~6 the engine sees the tactics only when they are already there, so the evaluation has to spot the danger earlier.

## Patterns in the wins

- **Our king often stays uncastled.** The engine castled in only 14 of 30 games (never in 1, 2, 5, 11, 12, 15, 18–26, 30). It got away with this where queens came off early (Petroff/Scotch lines), but the same habit cost two points where queens stayed on (23, 24). It also produced big swings in wins: game 1 16.Ke2 (−294, best O-O-O), game 5 28.c3 (−608) with the king still on e1 facing Q+N+R, game 11 12.Kf1.
- **Many wins came back from bad positions after Stockfish errors.** Minimum evals of −10 (game 2), −3.9 (games 6, 20), −3.6 (game 17) and −3.2 (game 5). The engine scores well because weak Stockfish settings blunder, not because our middlegame is solid (middlegame ACPL 58, 48 blunders).
- **Conversions are often slow or wobbly.** Game 2 took 190 plies. In game 17 we were +3 by ply 14 but only +5 at ply 66, with a dip to −3.6 (28.Rfc1 allowing ...Nd2). In game 28 we were +8: 40...Nf5+?, 41...Rxe2 (−525) grabbed a rook and allowed a perpetual with Qxf7+, and 46...Kg6 (−428) walked into a 0.00 queen ending. We won only because Stockfish missed it. In game 8, 21...gxf6 (−578) threw a +3.8 back to 0.
- The large "cp losses" at ±9.9 (game 8 Nxd5, 15 Re7+, 17 d8=Q, 21 c7, 29 Qxf5, 30 Bc4) are mate-distance artefacts: the position stays mating. They are harmless, but they show the engine does not choose the fastest win.
- Good pattern: with queens off, the engine's endgame king is active (game 12 Kd7-d6-d5, game 19 Kd4). The endgame king table works. The problem is when the king is used the same way with queens still on (game 16).

---

## Prioritised suggestions (engine-implementable)

1. **King shelter and open files near the king, scaled by the opponent's attacking material.** Penalise missing shield pawns on the three files in front of the king (about −15 per missing pawn on the 2nd/3rd rank, extra if the file is fully open or half-open for the opponent), and scale the whole term by enemy material (full when the enemy queen is on, near zero without it). *Evidence:* G7 (half-open g-file plus h3 hook: ...Rg8/Qg7/Nf4xh3), G16 (32...Kg8→41...Kb7 into the opened a/b-files, which the current table rates as safe), G23 16.Be2 allowing Bxf3 gxf3.

2. **Penalty for an uncastled king in the middlegame, and for losing castling rights by moving the king or rook.** For example −40 to −60 for a king still on d/e-file with queens on and the d/e-file open or half-open, and a one-off −30 when castling rights disappear without castling. The current MG table makes e1→g1 worth only +30 and e1→f1 only −10. *Evidence:* G23 (declined O-O-O at 15, O-O at 19, Kf1 at 23; mated on e-file), G24 12...Rg8 and 14...Kf8 (−572), G13 4.exd5 opening the e-file toward e1, G1 16.Ke2 (−294), G5 28.c3 with the king on e1 (−608).

3. **Development and early-queen term (opening phase only, e.g. while most non-pawn material is on the board).** Penalise each minor piece still on its home square (about −15 to −20) and penalise a queen off its home square while two or more of our minors are undeveloped. *Evidence:* G24 (queen made 8 of the first 13 moves, Bc8/Ra8 never moved, ...c6/...d5 recommended five times), G23 (5.Qe2+, 10.Qe5, 11.Qxc7, 12.Qg3, 14.Qd6+ with Bf1/Rh1 at home).

4. **King danger from attackers near the king, and escape squares.** Count enemy queen/knight/rook attacks on the squares around our king and penalise non-linearly (two or more attackers including the queen is much worse than one). Add a small penalty for a king with no escape square on the back rank when the enemy queen is on. *Evidence:* G13 33.Nc4 missing ...Qg1+ Rxg1 Nf2# (33.h3 was the only move), G7 23.Kh2/24.g3/25.Qe1 against Q+2N on the kingside, G28 46...Kg6 walking into perpetual checks.

5. **Search: extend checks (or add checking moves to the first quiescence ply).** The decisive tactics were short forcing sequences just past depth 6: G13 4.exd5 Bg4 plus the e-file checks, G13 smothered-mate threat, G28 41...Rxe2 allowing Qxf7+ perpetual (0.00 from +8), G24 16...Bd6 (−1154). 52 of 85 blunders were at depth ≤6.

6. **Bishop-pair bonus (+30 to +40) and a small mobility term (pseudo-legal moves per minor/rook).** This stops us trading bishops for knights for no reason and makes wandering pieces less attractive. *Evidence:* G16 5...Bxf3 and 7...Bxd2+ in the Exchange Ruy (Black's only asset thrown away), G7 20.Nxc7/21.Nb5 (knight sent to the rim far from the king), G24 bishop c8 with zero mobility for 16 moves while the queen hunted pawns.

7. **When ahead, prefer trading pieces over pawns, and reduce the reward for extra pawns while our king is unsafe.** Add a bonus when ahead in material that grows as opponent non-pawn material drops. That turns +5 into a trivially won ending instead of a queen-vs-queen fight with perpetual chances. Also scale the passed-pawn/advanced-pawn table down when our own king shelter term is bad, so the engine does not push c6-c7 instead of castling. *Evidence:* G28 41...Rxe2 and 46...Kg6 (+8 → 0.00 in a Q+P ending), G2 190 plies to convert, G17 +3 at ply 14 but dips to −3.6 before winning, G23 20.c7/21.bxa6 instead of castling.
