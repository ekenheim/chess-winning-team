# Grandmaster review: `555bcaf-full` (5 s/move, Stockfish 2100-2300)

Brief: tapered material + PST, king safety v1 (shield pawns + zone-attacker table, gated on an enemy queen), search with TT, null move, LMR, PVS, killers, check extension, the new time manager (86 % of the clock used, depth 13 in the middlegame and 18 in the endgame). 19/7/4; wins by level 8/10 at 2100, 5/10 at 2200, 6/10 at 2300; as White 7/4/1 (non-wins 5, 7, 17, 21), as Black 6/3/3 (4, 12, 16, 22, 24, 26, 28). Evals below are Stockfish 19 depth 14 from **our** side; "(−N)" is our cp loss; "d13/3.8 s" is our depth and time. The `c9cb33a` review's findings (file-opening captures, storms, queen raids, passive non-conversion, Exchange Ruy) are taken as read; where they recur here I say so in one clause and move on.

## Summary

1. **All 19 wins are checkmates with the queens on. Three of the seven draws had the queens off by move 16 by our own choice at 0.00** (21 `3.Qxd8+`, 12 `16...Qxd1`, 24 `12...Qxd1`), and none of those three was ever lost. At 5 s the engine draws mostly by choosing the drawing exchange, not by being outplayed.
2. **The draws split 3 rescues / 3 slipped / 1 fair.** Rescues: 5 (from −8.5, K+P ending), 16 (from −6.3), 28 (from −6.5, Stockfish repeated at +3.3 for itself). Slipped: 7 (+3.8 at move 16, gone in three moves), 21 (+2.7 at move 52 with two connected passers, drawn by `53.Ra2` and a rook trade into opposite-coloured bishops), 24 (three Stockfish gifts of +2.0/+2.3/+2.1 each returned within one move). The rescues are UCI_Elo artefacts (repetition-by-choice, a non-converted pawn ending) and will not repeat; the slipped ones are ours.
3. **The four losses are two known shapes and one new one.** 17 and 26 are the file-opening capture at our own king (`23.hxg4`, `15...hxg5`) after a hook pawn (`13.h3`, `12...h6`); 22 is a queen raid into a box (`9...Qxh1`); 4 is new: a pawn grab that opened a *diagonal* to our king (`16...Ngxe5` removed the e5 blocker of a1-h8 with our dark bishop already gone) followed by a queen that made 8 of 14 moves while Bc8 and Ra8 stayed home.
4. **Time is not the cause.** Of 62 engine errors ≥ 100 cp in the 11 games, 18 stopped before 4.5 s; 38 % of all moves do. The errors sit at d11-13 in the middlegame with the full 4.95 s used; Stockfish sees the same positions at d20-25. The fixes are eval terms, in the order below, with the two queued patches confirmed as items 1 and 2 by a thin margin and with two additions to item 2 that the evidence requires.

## 1. The eleven non-wins

| game | colour, level, opening | result | peak (ours) | where it was decided | shape |
|---|---|---|---|---|---|
| 4 | B 2200 start | L | +0.0 | `9...Bxe5` (dark bishop gone), `13...g6` (−75, best Kh8), `16...Ngxe5` (−136, best Qd7: the capture opens a1-h8), `18...Qe4` (−175), `21...Nc6` (−309, best Nd5, the only blocker) → −7.4 SF with `Qc3`+`Bb2` v g7; Bc8 first moved at 46, Ra8 at 25 | diagonal opened by our own pawn grab; queen tour Qh4-d8-d5-e5-e4-a4-b5-b6 |
| 5 | W 2300 start | D | +0.2 | level to 27; `24.Rad1`, `27.Ree1`, `28.a3`, `29.Ra1`, `32.Qe2`, `34.Qe4`, `36.Qg3`, `37.Rad1`, `38.Ra1` (−201, best Rd2) → −3.2; `40.Qh4` (−110) → −5; SF failed a K+P ending at −8.5, threefold | rook/queen shuffles against a passed b-pawn; **rescue** |
| 7 | W 2100 Italian | D | **+3.8** (m16) | SF `15...Rxf3??` (−414) gift; `17.Bxb7` (−98, best Bg4 blockading g5-g4), `18.Rab1` (−253, best c3 v Nd4), `19.Qd1` (−626, best Qg5, own eval +3.63) `Nf3+ gxf3 Rh6` → −7.4; SF `21...Qf6??` (−802) → 0.00; `29.Bf5??` (−372, a piece to dodge a threefold, own eval +0.39); `42.a4`/`44.a5` (−197/−243, pushing a passer while Q+B sat on our king) → −5.75; SF blundered back twice; `70.Bh5` (−371) unpunished | **slipped**, then rescued; knight outpost + rook lift + g4 storm pawn |
| 12 | B 2300 Italian | D | +0.4 | `16...Qxd1` (−64, best Qe7) at 0.79 in our favour; level R+B+N ending; repetition at −0.6 | queens off by choice; fair draw |
| 16 | B 2200 Ruy (SF `1.Ba4`) | D | 0.0 | `3...Bc5` (−97), `8...Bc5` (−160, best O-O), `9...Kf8` (−208, best Be7: castling gone), `10...dxc3` (−118), `21...Bc4` (−225) → −6.3; SF `47.Bxe4`, `57.Ra3` (−224, −276) → insufficient material | king kept in the centre; **rescue** |
| 17 | W 2300 Ruy Exchange | L | +0.0 | `2.Nxe5` (−69), `13.h3` (−101, best Re1, d14/3.3 s: the hook), `22.a3` (−200, best Bd4) `g4`, `23.hxg4` (−166, best Bf4) `hxg4` → −4.1 with Rh7/Qh8 on the file; `37.Qd2` (−702) | h-file opened by our own capture; no queenside play (a3 at 22, a4 at 36) v O-O-O |
| 21 | W 2200 Scotch | D | **+2.7** (m52) | `3.Qxd8+` at 0.5; `12.Ra1` (−217, best Ne2) → −2.5; SF `26...Rf7` (−224) → +1.2; a5/c4/c5 v nothing, +2.0 to +2.7 at 45-52; `53.Ra2` (−180, best Ra1 behind the passer) → +0.9; `65.Re3` (−157, best Rd3) offered the rook trade into **opposite-coloured bishops** two pawns up → +0.2, fifty moves | **slipped** by two rook moves |
| 22 | B 2200 Scotch | L | +0.5 | `5...Qe7` (−181, best Bxe3, d13/4.2 s), `8...Qe4` (−238, best d5), `9...Qxh1` (−310, best Nb4) `10.O-O-O` → −6: queen in the box after `11.Bb5`, `12.Re1`, lost for a rook at 15; king on e8 all game (`2...g6`, `10...Rg8`); `106...Ke7` (−932) | queen raid into a trap (known); uncastled king |
| 24 | B 2300 Scotch | D | **+2.3** (m38) | SF `6.Bd3??` (−220) → +2.0; `6...Bd4` (−124, best d5, d14/3.8 s) → +0.7; `12...Qxd1` at +1.0; SF `38.Rc2` (−156) → +2.3; `38...Kd6` (−153, best c4: push the passer); SF `40.Rb2` → +1.9; `43...Kf6` (−129, best Kd4), `45...g4` (−105, best Ra7) → 0.2; 130-move rook ending, threefold | **slipped** three times; passer + king activity |
| 26 | B 2100 Petroff | L | +0.7 | `10...Ba5` (−128), `12...h6` (the hook, Rh1 still on h1 and `13.h4`), `14...Qe6` (−84, best hxg5), `15...hxg5` (−264, best Ne7) `16.hxg5` → −4.4 with Rh1+Qh-file v Kg8; `17...Nh5` (−146), `23...Ne7` (−283, best Nxd4) | h-file opened by our own capture (known) |
| 28 | B 2200 Petroff | D | +0.2 | `19...Na5` (rim), `20...Qc6` (−105, best c5), `21...Qb6` (−65, best b6) `22.a4!` and the knight has no square: `23.a5 Nxa5 24.c4 Nxb3` → −2.7; `27...Bf5` (−133), `30...Qd6` (−120) → −6.5; SF `32.Re4`, `33.Bf6` (−161, −240) and repeated at +3.3 for itself | knight trapped on the rim; **rescue** |

## 2. What decided the games at 5 s/move

### 2a. Own captures that open a line to our king (17, 26, 4) and the hook before them

17 and 26 are the `c9cb33a` file shape, now at d12-14 with 4.95 s, so depth is not the cure. What is new is that both were prepared by our own hook pawn: `13.h3` (17, d14, 3.3 s: the search stopped early on a move Stockfish scores −101 because `...g5-g4` is 6 plies away and the eval has nothing against a pawn on h3 facing a g-pawn) and `12...h6` (26, with White's rook still on h1 and `13.h4` next). Game 4 is the same shape on a diagonal: after `9...Bxe5` the dark squares around g8 have no bishop, `13...g6` makes holes, and `16...Ngxe5` takes the e5 pawn that was the only thing between Qc3-to-be and g7. The engine was a pawn up in its own eval at move 17 and −4.9 to Stockfish; no move of ours after that is worse than −309, the position simply had no defence to `Qc3`+`Bb2`. A king-file term will not see it; the king-safety term needs the two diagonals through the king's shield squares (f6/g7/h6 for a g8 king) scored like files: no own pawn and no own bishop of that colour, doubled when an enemy queen or bishop sits on the diagonal.

Game 7's `19.Qd1??` (own +3.63, SF −4.82) is a variant: Nd4 outposted next to our king, Rf6 already lifted to the third rank, `...g4` on the board. The v1 term counts zone attackers; a knight on d4 and a rook on f6 attack nothing in the g1 zone until `...Nf3+ gxf3 Rh6`, four plies that d12 should see but the eval prices at zero until the last one.

### 2b. Trapped pieces (22, 28) and the queen tour (4)

`9...Qxh1` (22) is the known queen raid; `19...Na5`-`22.a4` (28) is the same defect for a knight: a piece with no safe square is worth what the eval says it is worth until the capture lands, two moves past our horizon at d12. Both games were decided by exactly one such piece. Game 4's queen tour is the mild version: eight queen moves in fourteen, none losing more than 175, while two pieces never developed; a mobility term is the only thing that scores `...Bd7`/`...Rd8` above `Qa4`/`Qb5`/`Qb6`.

### 2c. Conversion: passers, the rook behind them, the king, and opposite bishops (21, 24, 5)

These are the three draws that cost wins and they are all the same knowledge. 21: two connected passers on a5/c5 with a bishop each, +2.7 at move 52, and the engine played `53.Ra2` (the rook *in front* of nothing; `Ra1` behind the a-pawn) and then `65.Re3`, offering the rook trade into a bishop ending of opposite colours two pawns up, which is a book draw the eval scores as +200. 24: three times the correct move was the passer push or the king walk (`38...c4`, `43...Kd4`, `45...Ra7` behind the pawn) and three times the engine played a king move away from the pawns or a pawn move on the other wing. 5: with Black's b-pawn passed at 30 and our e5 pawn weak, fifteen moves of `Ra1`/`Rad1`/`Ree1` and `Qg4`/`Qe2`/`Qe4`/`Qd3`/`Qg3`/`Qf4`/`Qh4`, each −30 to −60, then `38.Ra1` (−201). Nothing in the eval distinguishes a rook on a1 from a rook on d2 here.

### 2d. Queens off at 0.00 (12, 21, 24)

`3.Qxd8+` (21, +0.5), `16...Qxd1` (12, +0.8, best `Qe7`), `12...Qxd1` (24, +1.0). All three were the engine's choice at a small plus, all three games were drawn, none was ever lost. Against 2200-2300 with only wins counting, a level queenless ending is worth close to zero and the eval scores it the same as a level middlegame. The counter-example is 7 `29.Bf5??`, where the engine sacrificed a piece (own +0.39) rather than allow a threefold at 0.00: the search already prefers "anything" over a draw score, so the bias belongs in the queen-trade decision, not in the draw score.

### 2e. King left in the centre (16, 22)

`9...Kf8` (16, −208, best `Be7` then `O-O`) and 22's king on e8 for 106 moves with `...g6` and `...Rg8`. Both openings were then decided by the pieces the king blocked in. PST scores f8 and e8 nearly alike; losing the right to castle with queens on is not scored at all.

## 3. Depth and time

Errors ≥ 100 cp in the 11 games: 62; stopped before 4.5 s: 18 (29 %, against 38 % of all moves), so the soft limit is not selecting for mistakes and the manager needs no change from this run. The decisive moves were at d11-13 with the full budget (4, 7, 17, 22, 26, 28) or in endgames at d15-17 where the eval, not the depth, chose (21 `53.Ra2` d16, `65.Re3` d15; 24 `38...Kd6` d17, `45...g4` d17). Middlegame depth 13 at 2.6 Mnps is the engine-dev's question; from the board the positions lost here need an eval term, not two more plies.

## 4. Suggestions, ranked, and the queued order

Ranked by non-wins addressed at 5 s. Losses and draws weigh the same, since only wins count.

1. **King danger v3 (queued): confirmed first, with the diagonal added.** Files and storm pawns cover 17 (`13.h3`, `23.hxg4`), 26 (`15...hxg5`) and 7's `g4`; the same code should treat the two diagonals through the king's shield squares as files (no own pawn on the shield square and no own bishop of that colour → same score as an open file, doubled with an enemy Q/B on the diagonal), which is game 4's `16...Ngxe5`. Score the hook: an own pawn on h3/h6 (or a3/a6 after O-O-O) with an enemy g-pawn (b-pawn) on rank 5 or beyond → +10, since both losses began with it. Two losses and one slipped draw; three losses with the diagonal.

2. **Passed pawns + rook activity (queued): confirmed second, but only with three pieces it may not yet have.** (a) Rook behind an own passer +20 mg/+30 eg, in front of it −10 (21 `53.Ra1` v `Ra2`, 24 `45...Ra7`). (b) Endgame king proximity: −4 per square from our king to the nearest passer of either colour (24 `43...Kd4`, `38...c4`; 5 the b4 pawn). (c) Opposite-coloured bishop scaling: with only B v B of opposite colour and pawns, multiply the material lead by ½, and by ¾ with one pair of rooks still on (21 `65.Re3`). Without (c) the patch pushes the a/c pawns in 21 and still trades into the draw. Gate the passer bonus by our own king-danger score: 7 `42.a4`/`44.a5` were passer pushes under a Q+B attack and will get *worse* with an ungated term. Three draws, two of them slipped wins.

3. **Trapped-piece term for queen and minors.** Safe-square count per piece (not attacked by a lesser piece; attacked by an equal one only if defended): ≤ 1 → −120 for the queen, −60 for a minor; ≤ 2 → half. 22 `9...Qxh1` (queen on h1, one square after `11.Bb5`), 28 `19...Na5`-`21...Qb6` (knight with a4/c4 coming), and it scores 4's `Bd7`/`Rd8` above the sixth queen move. One loss, one draw, and the slow loss.

4. **Keep the queens when level.** With both queens on and |eval| < 100 in the middlegame, add +15 for our side (asymmetric, our queen only). It makes `Qe7` (12), `O-O`/`Nc3` (21), `Bg4`-ish (24) the engine's own preference over the queen trade at +0.5 to +1.0, and costs nothing when the trade actually wins. Three draws that were never lost. Measure in the fast run: it is the one item here that can lose games if set too high.

5. **Castling-rights penalty.** With queens on and our king on d/e/f of the back rank without castling rights → −30 mg (16 `9...Kf8` v `Be7`, 22's king on e8 for the whole game, `2...g6`/`10...Rg8`). One loss and one rescued draw; also the cheapest term on the list.

Not recommended from this run: a time-manager change (section 3); a draw-score/contempt change (7 `29.Bf5` shows the search already avoids 0.00 too eagerly); an opening book (17 is the Exchange Ruy again, but 4, 22, 26 were lost from three different openings by the same three defects).
