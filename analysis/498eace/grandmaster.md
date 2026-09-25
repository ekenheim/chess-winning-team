# Grandmaster review of run `498eace`

Reviewer's brief: our engine (material + piece-square tables, plain alpha-beta to depth 5-7 in 0.25 s, any repetition = 0) against Stockfish 19 at UCI_Elo 1500/1600/1700. Score 20 wins, 5 draws, 5 losses. Only wins count.

## Summary

The engine plays like a strong club player who can only count material. Four of the five losses (games 7, 9, 25, 26) were king attacks it walked into while its own evaluation read +1 to +5: it stripped its own king (17.g4 in game 7, 31.g4/34.Kg2 in game 25, 8...O-O-O into a half-open a-file in game 26), grabbed material on the far side of the board with pieces that never came back (11.Nxa8 game 9, 26.Nxa7+ game 7, 10...Nxa5 game 26, 35.Qxc4 game 25), and let the enemy queen and rooks arrive at the king unopposed. The fifth loss (game 3) was pure positional and endgame ignorance: hanging pawns it never attacked, a queen trade into a worse ending, a rook trade into a lost bishop ending, and a passed pawn it did not know existed.

The five draws were not "repetition from a better position". In every one of them the engine was worse or lost, both by Stockfish's count and by its own (own eval at the repeating move: game 23 −1.25, game 27 −1.35, game 29 −1.50, game 30 −9.45, game 8 −9.9 with mate coming). The +1.5 in game 29 was thrown away at moves 12-14 by tactics, not at the repetition. The problem with the draws is (a) the road into them, which is the same king-safety / trapped-piece / structure blindness as the losses, and (b) that with draws worth nothing the engine should still prefer playing on against an opponent that dropped 300-2000 cp per game (game 8: 62.Rf1 −2000; game 25: 34...Qf6 −747; game 29: 11...Bg4 −316).

Where the engine misunderstood positions, in order of damage: (1) king safety and attack, both defending and attacking; (2) trapped or offside pieces after material grabs; (3) pawn structure and passed pawns, especially when choosing trades; (4) treating a draw as worth something; (5) opening development and early queen sorties. Tactical oversights at depth 5-6 (mating nets in games 9 and 26, the desperado 38.Qxf7+ in game 25, the bishop trap 4...Bg4 in game 8) were in most cases the *consequence* of these strategic misjudgements: the engine only needed to see the tactic because it had already put itself in a position where one existed.

Reading guide: evals in brackets are Stockfish depth 14 from White's side; "own" is the engine's score from its own side at the move it played.

---

## The losses

### Game 3 (White vs 1600, 0-1, 76 moves) — hanging pawns, a wrong queen trade, a passed pawn it never saw

Opening: 1.d4 e6 2.Nc3 Nf6 3.e4 Nc6 4.e5 Nd5 5.Nxd5 exd5 6.Nf3 d6 7.Bb5 a6 8.Bxc6+ bxc6. Reasonable; Black has doubled c-pawns and White the bishop pair. After 11...c5 12.dxc5?! dxc5 13.Rad1 Be7 Black has hanging pawns on c5/d5 and White has *no d-pawn any more* — i.e. Black's d-pawn is passed the moment the c-pawn advances. That is the whole game.

Strategic misunderstandings:
- **Hanging pawns must be attacked, not admired.** 14.Bf4? (−130, best b4!) and 15.Rb1 shuffle instead of the standard 14.b4 / c4 lever that either wins c5/d5 or fixes them as weaknesses. The engine's PST gives nothing for a pawn lever; it saw "bishop to a nicer square" (+10 PST) as equal to the only real plan.
- **18.Qg3? (−382, best c4).** Walked the queen away from the queenside while ...Qb4 hit b2 and ...g5 was coming against the f4 bishop whose retreat d2 was blocked by its own knight (16.Nd2). Stockfish-1600 missed 18...g5 and played 18...Kf8, but the underlying error is a piece with no retreat square, which the eval cannot see.
- **24.Qxa5? (−133).** Trading queens when Black's queenside majority (a4, c4, c5, d5 vs a3, b2, c2) is the better structure. In a queenless middlegame those pawns simply roll. The engine's own score was +35; Stockfish −2.5. Own eval remained +15..+50 through move 30 while the position was −3 to −4: a 3-4 pawn gap that is entirely pawn structure and king activity.
- **27.Nxe6+? (−79, best b4)** gave up the knight that could blockade (Nd4) for the bishop, opened the f-file for Black's rooks and left a bad-bishop-vs-good-rook ending.
- **Endgame technique.** 40.h4? (−177), 50.Rf4? (−165, trading the last rook when a pawn down with Black's passed c/d-pawns rolling — exactly the trade a defender must refuse), 53.Bh2? 55.Kb1? 56.Kc1? 65.Bh2? (−220) and 68.Kb2?? (−944) allowed ...Bd2 and ...c1=Q. The king wandered Ke2-e3-d2-c3-b3-b2-a2-b1-c1 following the endgame-king PST toward the "centre" while the actual job was g/h-pawn counterplay (Stockfish repeatedly wanted g5/g6).

Tactical oversights: 68.Kb2?? was the only one-move blunder; everything else was accumulated positional loss.

### Game 7 (White vs 1500, Italian, 0-1, 51 moves) — opened its own king, pawn-grabbed with the queen offside

Opening: 1.d3 d6 2.Ng5?! Nh6 3.h3 Na5 4.Nc3 Nxc4 5.dxc4 gave up the Italian bishop for a rim knight and took doubled c-pawns. After 12.exf5 Nf6 13.Ng5 Qe7 Stockfish gave +1.0: the f5 pawn cramps Black and c5 (opening the c-file/d-file) was the plan.

Strategic misunderstandings:
- **King safety, own side.** 14.Qb3? (−170, best c5) sent the queen away from the king; 15.Ne6? (−236, best f4) put a knight on a "great" PST square (+15) where it was cut off and became a liability; 17.g4?? (−316) then 18.gxf5 opened the g-file directly in front of the castled king. Every one of Stockfish's suggested moves from 14 to 20 is c5 — open lines where White's pieces are, not where Black's are.
- **Piece coordination / material greed.** 21.Bxf6? (−407) handed Black the f6-queen with tempo on the g-file. 26.Nxa7+? (−330, best c5) won a pawn with a knight that then had to run (27.Nb5) and 29.Qa3? / 32.Qa7+? (−158) took the queen to the a-file while Black's queen and rooks were on the g/h/f files against Kh2. Own eval +105..+195 (plies 57-63) versus Stockfish −5 to −9.
- **Rook misuse.** 30.Rg4? 31.Rh4? (−241, −256) placed the rook on h4 where 37...f3 and ...Qxh4 won it.

Tactical oversights: 35.c5?? (−470) and 37.Qb3?? (−371, allowing 37...f3 and Rh4 falls). Both are depth-5 misses, but the rook on h4 and the queen on a3/b3 were strategic choices that made the tactics available.

### Game 9 (White vs 1600, Italian, 0-1, 19 moves) — "up an exchange" while being mated

1.d3 d6 2.Ng5?! Qf6 3.Bxf7+? (−198) Ke7 4.O-O h6 5.Bxg8? (−305) hxg5 6.Bb3 Nd4 7.Nc3? (−226, best Qd2) Qh6 8.h3 Ke8 9.Nd5? (−252) c6 10.Nc7+ Kf8 11.Nxa8?? (−496) Bxh3 and mate in eight.

Strategic misunderstandings:
- **Attack on the king outweighs a rook in the corner.** At 11.Nxa8 the engine's own score was +575 (a rook and two pawns for a knight). Stockfish: −11.9. Black had Qh6, Nd4, Bc8xh3 aimed at h2/g2 with the h-file open after ...hxg5; White's only kingside defender was the pawn on h3, and the queen, knight and rook were all on the far side. A king-safety term counting attackers near the king and the missing shield would have read this as lost long before the search could.
- **A knight on a8 is not a knight.** Nxa8 wins material only if the knight gets out. It did not (12.Nb6 Bxb6). The engine has no "piece with no safe squares" concept.
- **Opening choice.** 2.Ng5 with the queen able to come to f6/h6 is a bad Fried-Liver imitation; 3.Bxf7+ gave the bishop pair for a pawn and a king walk, which only "works" against 1500-level defence (3...Ke7? instead of 3...Kf8). Better: Rf1, Nf3, normal development.

Tactical oversight: 7.Nc3 instead of 7.Qd2 (covering h6-h2) and 11.Nxa8 instead of 11.Be6 are horizon failures at depth 5-6 with no check extension, but the eval would have rejected the whole plan if it priced king danger at all.

### Game 25 (White vs 1500, Petroff, 0-1, 43 moves) — bad trades gave a passed pawn, then the king was stripped for two pawns

Opening: 1.d3 Nc5 2.d4 Ncd7 3.Nc3 Nf6 4.Be3 d5 5.Bb5+ Nbd7 6.O-O Bb4 7.Ne2 O-O 8.Nf4 c6 9.Ba4? Bd6 10.Bb3. Fine but aimless; White had +1.0 after Black's 1...Nc5 and let it drain to 0 by move 8.

Strategic misunderstandings:
- **Trades that improve the opponent's structure.** 21.Bxc4? (−242) Nxc4 22.Nxc4? (−352) dxc4: two exchanges that gave Black a protected passed c4 pawn, a half-open d-file for Black's rooks and left White's a4 pawn (17.a4) weak. Own eval +15; Stockfish −4.6. Stockfish-1500 then gave most of it back with 24...Qd6? (−449).
- **Rook on the second rank.** 28...Re2 was allowed and never challenged (29.Rbc1, 30.Rf1). The engine has no bonus for contesting a file or penalty for an enemy rook on its 2nd rank.
- **King safety, own side.** 31.g4?? (−292, best Qf3) "attacked" the f5 bishop: 31...Bxg4 32.hxg4 Qxg4+ removed both shield pawns for a bishop (own eval +130: a piece for two pawns). 34.Kg2?? (−377, best Kg1) walked onto the open diagonal. 35.Qxc4?? (−718, best Rcd1) took a pawn with the only defender while Black had Qf4/Qg4, Re2 and Re8 around a king with a single pawn (f2) left. Own eval +230; Stockfish −7.2. This is the clearest case in the run of "material minus king safety = material".

Tactical oversights: 38.Qxf7+?? (−1086) is a desperado from a position already lost (38.dxe5 Qxd1 wins the d1 rook by the g4-d1 diagonal, −6.9). The real blunders were 34.Kg2 and 35.Qxc4.

### Game 26 (Black vs 1500, Petroff, 1-0, 24 moves) — castled into the attack, then took the pawn that opened the file

1.d3 Nf6 2.h3 d5 3.Be2 Nc6 4.Nc3 Bb4 5.a3 Bxc3+ 6.bxc3 Qd6 7.a4 Be6 8.O-O O-O-O?! (+1.1) 9.a5 Qc5? (−166) 10.Bd2 Nxa5?? (−343, best Rhe8) 11.Be3 Qb5 12.Nd4 Qa6 13.Nb3 b6 14.Ra3 Bd7 15.Qa1 Nxb3 16.cxb3 Qb5 17.Rxa7 Be8? (−283) 18.Bf4 Rd7?? (−1314) 19.Ra8+ Kb7 20.Qa7+ Kc6 21.Rc8 Qa5 22.Rxc7+ Rxc7 23.Qxc7+ Kb5 24.d4#.

Strategic misunderstandings:
- **Castling into a half-open file.** 5...Bxc3+ gave White the b-file and the bishop pair for nothing; 7.a4 was already on the board, so 8...O-O-O put the king where White's pawn lever (a5) and rook lift (Ra3) were already prepared. Own eval +45. Castling long is scored only by the king PST (+30 for c8), with no notion of which side the opponent's pawns and pieces face.
- **Pawn grab that opens your own king.** 10...Nxa5?? removed the a-pawn blocker and put a knight on the rim; from then on Ra3, Qa1, Nb3 and Be3 all pointed at the black king, with the queen and knight tied to the a-file. The engine's own score stayed +50..+10 through move 16 while Stockfish read +5 to +6 for White.
- **Piece coordination.** By move 17 Black's queen, knight and bishop had made twelve moves between them and the h8 rook none; all of Black's pieces were on the queenside but none defended c7/a7.

Tactical oversight: 18...Rd7?? is an 11-ply mate that depth 5 without check extension cannot see. 17...Bc6 and 18...Qc6 held for a while; 10...Rhe8 (finishing development) was the real cure.

---

## The draws (all by threefold repetition)

### Game 8 (Black vs 1500, Italian) — a lost bishop in the opening, then a rescued draw

1.c3 Qf6?! (−54; the queen blocks the knight's square) 2.O-O d6 3.b4 Bb6 4.a4 Bg4?? (−622, best a6) 5.a5 and the b6 bishop is trapped (a7 blocked, c5 covered by b4, a5 attacks it). Black got a knight for it after 6.Bxd5 Bxf3 7.Qxf3 Qxf3 8.Bxc6+ but was a clean piece down (+6.7 for White).

Misunderstanding: the a4-a5 trap against a bishop on b6/c5 is elementary Italian/Evans knowledge; the engine's rule should be "a6 (or a5) before the bishop runs out of squares". Structurally the engine has no way to see a piece with zero retreat squares; it moved the bishop to g4 because the pin looks active. Endgame: 60 moves of correct defence, then Stockfish-1500 blundered mate away (62.Rf1?? −2000) and the engine repeated from −9.9. Taking the repetition here was correct; there was nothing to win.

### Game 23 (White vs 1700, Scotch) — aimless plan, a pawn dropped, repetition from a lost rook ending

After 3.Nxc6 bxc6 4.Bc4 the position was level. 12.Qxg6?! hxg6 and 13.Be3? (−126, best Rfe1) Bb6 14.Bxb6 simplified for no reason. 18.a4? (−201, best Rfe1) 19.a5 20.Ra3?? (−210, best Ba4) built a "plan" that created a weak a5 pawn and put the rook on a3, exactly where 20...Nc5 and 25.Rb3?? (−197, best Ne2) Rxb3 26.cxb3 Nxf4 could exploit it (f4 was undefended after 24.Bxe6? Nxe6). From there it was a rook ending a pawn down with doubled b-pawns; the king went to c2 and the rook shuffled Rc3-g3-c3 (own eval −75 to −140, Stockfish −4 to −5) until 53.Ra3/54.Ra4 repeated.

Misunderstandings: pointless simplification when nothing was gained (queens, then bishops), a pawn advance (a4-a5) that created a target, no concept of "rook on an open file" (Rfe1/Ba4 were available for ten moves), and no defence of a pawn attacked by a knight because the PST said the rook belonged elsewhere. Repetition from a lost position was the correct choice at that point.

### Game 27 (White vs 1600, Petroff) — a real attack it never launched, then the queen wandered into a cage

8.Bxf6 gxf6? (Stockfish-1600 erred; +1.0) gave White the textbook target: king on g8/h8, pawns f6/f5, half-open g-file. The plan is g4 and Qf3/Qh5 with Rg1. The engine played 13.Qg3+ Kh8 14.h3? (−98) 15.Qh2? (−169, Qf3) 17.Rg1? (−152, g4!) 18.Qf4? (−90, g4) — the rook went to g1 but the g-pawn never moved, so nothing opened. Own eval stayed +50..+90 while Stockfish went from +1.5 to −3.3.

Then 21.Qxf5?? (−255, best Qa4) fxe6 22.Qxe6 collected two pawns and left the queen alone in the black camp: 25.Qc4 26.Qf7 27.Qd7 and after 33...Re7 the queen on d7 had no square; 34.Rxf6 gave it up for bishop and rook. The rook shuffles 28.Rf3 29.Rd1 30.Rg1 31.Rd3 (each −143 to −214) show a search with no idea of what to do.

The ending Q vs R+pawns was −3 to −4; Stockfish-1600 misplayed it (42...Qh1+? 44...Kf7?) and the engine took the perpetual from own eval −135 / Stockfish −0.2. Misunderstandings: not opening lines against a weakened king; pawn-grabbing with the queen far from home; queen mobility ignored; rooks with no file to use.

### Game 29 (White vs 1700, Petroff) — +2.2 after the opponent's blunder, thrown away in three moves

11.Qh5? (−81, best Nf3) was an early queen sortie with the rook still on f1 and nothing coordinated, but Stockfish-1700 replied 11...Bg4?? (+2.15 for White). The bishop attacks the queen; 12.Qxg4 simply takes it and keeps a large edge. Instead 12.Qxf7+? Kd7 (own +195 for "check plus pawn", Stockfish +0.8) put the queen on f7 with one exit. 13.h3? (−155, best Rbe1) Rf8 and now only 14.Qxg7 gets out; 14.f3?? (−483) Rxf7 15.Nxf7 Qf8 lost queen for rook and knight, and the knight on f7 was itself trapped (16.fxg4 Bf6 17.g5 Qxf7). Own eval at 14.f3 was +90: it had counted the bishop it would win with fxg4 and the material on f7, and not that its own knight had no retreat.

Later 23.Ng4? 24.a3? 26.c3? pushed pawns into the queen's path (...Qe2, ...Qxb2, ...Qxa3) and the Q-vs-R+N ending was −6.5 when 33.Nf6/34.Ng4 repeated. This is the one game where a win was genuinely on the board and it was lost by (a) preferring a check and a pawn to a piece, (b) not knowing that a queen with one exit square is in danger, and (c) a knight with no retreat squares.

### Game 30 (Black vs 1700, Petroff) — rook greed, then twelve queen checks instead of one developing move

3.d3? Bxf3 4.Qxf3 Nxg3+ 5.Be3 and now 5...Nxf1 (Kxf1, Black is a healthy pawn up) or 5...Nxh1?? (−410, own +240). The engine took the rook: the knight on h1 was dead, and the tempo gave 6.Qxb7 winning the a8 rook. From there: 8...Qxh2+? 12...Qh2+? 16...Qh6+? 17...Qh1+? 18...Qe4+? 20...Qg3? (each −93 to −248, Stockfish's best in every case was ...Nc6 or ...O-O) — six queen moves in a row with the b8 knight undeveloped and the king still on e8. 13...c5? (−277, best O-O) opened the centre while uncastled; 24...Kd8? (−259, O-O was still legal) and 26...Kd8? kept the king in the middle. At the end Stockfish-1700 was mating (+14) and gave a perpetual instead.

Misunderstandings: a rook in the corner is not worth more than a bishop when the capturing knight dies and the tempo hands over a rook; checks are not development; castling is worth much more than a 30-point PST bump when the enemy queen is on the board.

---

## Patterns across the ten games

| Pattern | Games | Type |
|---|---|---|
| Own king exposed (pawn moves in front of it, king walks, castling into the attack) while the enemy queen is on | 7 (17.g4, 20.Kh2), 9 (h3 only shield), 25 (31.g4, 34.Kg2), 26 (8...O-O-O), 30 (never castled) | strategic |
| Material grab with a piece that ends up trapped or offside | 7 (26.Nxa7+, Qa3/Qa7), 9 (11.Nxa8), 25 (35.Qxc4), 26 (10...Nxa5), 27 (Qxf5...Qd7), 29 (12.Qxf7+, Nf7), 30 (5...Nxh1), 8 (4...Bg4 trapped) | strategic, exposed by tactics |
| Trades that leave a worse structure or a lost ending | 3 (12.dxc5, 24.Qxa5, 27.Nxe6+, 50.Rf4), 23 (12.Qxg6, 13.Be3, 24.Bxe6), 25 (21.Bxc4, 22.Nxc4), 27 (37.Rxd5) | strategic |
| Passed / hanging / weak pawns unpriced | 3 (c5/d5, then d4-d3 and c4-c3-c2), 23 (a5, b2/b3), 25 (c4), 7 (c4/c2) | strategic |
| Rooks with nothing to do (no file, offside, en prise) | 7 (Rh4), 23 (Ra3, Rb3), 25 (Re2 allowed), 27 (Rd3/Rf3/Rg1 shuffle) | strategic |
| Failure to press an attack on a weakened king | 27 (no g4), 29 (Qxf7+ instead of Qxg4) | strategic |
| Early queen sorties / undeveloped pieces / no castling | 8 (1...Qf6), 29 (11.Qh5), 30 (queen checks, Kd8), 9 (2.Ng5, 3.Bxf7+) | opening |
| Repetition from a worse position (never from a better one) | 8, 23, 27, 29, 30 | policy |
| Mating nets and desperados below the horizon | 9 (Bxh3), 26 (Rd7??), 25 (Qxf7+), 8 (a4-a5) | tactical |

The engine's own scores at the decisive moments tell the story: game 9 +575 (actual −11.9), game 25 +230 (−7.2), game 7 +195 (−9.1), game 26 +50 (+5.2 for the opponent), game 3 +35 (−2.5). In every loss the material count was right and the assessment was wrong by 3 to 15 pawns. Blunders at depth ≤ 6 were 62 of 76; almost all of them were positions the eval had already mis-scored.

---

## Prioritised suggestions (engine-implementable)

1. **King safety: pawn shield and attacker count, scaled by the enemy queen.** Penalise missing/advanced pawns on the three files in front of the king; add a penalty per enemy piece attacking squares adjacent to the king, multiplied when the enemy queen is on the board; apply the same scoring to the opponent so the engine also attacks. Evidence: game 7 17.g4?? / 20.Kh2 (−316 while own eval +130); game 9 11.Nxa8 (own +575, mated in 8 with only h3 as shield); game 25 31.g4?? and 34.Kg2?? (own +120, Stockfish −7); game 26 8...O-O-O and 10...Nxa5 with Ra3/Qa1/Nb3/Be3 on the a-file; game 27, where 15.Qh2/17.Rg1 never became g4 against a shattered black king (+1.5 to −3.3). A check extension in the search (games 9, 26: the mates were 8-11 plies) is the cheap companion to this term.

2. **Trapped and offside pieces: mobility with a heavy floor.** Count safe squares for each minor and the queen; give a large penalty when a piece has 0-1 safe squares, and a larger one when it is in the enemy half. Evidence: game 8 4...Bg4?? 5.a5 (bishop b6 trapped, −622); game 30 5...Nxh1?? (knight dead, rook lost, −410); game 9 11.Nxa8 (knight lost to 12...Bxb6); game 26 10...Nxa5; game 29 12.Qxf7+? / 14.f3?? (queen on f7 with one exit, then Nf7 with no retreat); game 27 21.Qxf5 ... 27.Qd7 trapped by 33...Re7; game 7 26.Nxa7+ and the rook on h4 lost to ...f3.

3. **Treat a draw as a loss: contempt for repetition and 50-move draws.** Score any repetition / 50-move draw as about −200 cp from the engine's side at every ply (both when the engine could repeat and when the opponent could), unless a mate score is the alternative. Evidence: all five draws were taken with own eval −125 to −150 (games 23, 27, 29) or worse (8, 30); against opponents that dropped 300-2000 cp per game (game 8 62.Rf1 −2000, game 25 34...Qf6 −747, game 29 11...Bg4 −316 and 20...Nxe3 −262, game 27 42...Qh1+ −236 and 44...Kf7 −248), playing on from −1.3 has real win probability and a draw has zero value. Note this would not have saved game 29's +1.5: that was lost at moves 12-14.

4. **Pawn structure: passed pawns, doubled/isolated pawns, and pawn levers against hanging pawns.** Passed-pawn bonus rising with rank and larger without queens; penalties for doubled and isolated pawns; small bonus for a pawn attacking an enemy pawn duo. Evidence: game 3, where 12.dxc5 made Black's d-pawn passed, 14.Bf4? instead of 14.b4 left c5/d5 unattacked, own eval +35 vs −2.5 from move 24, and the c4-c3-c2 / d4-d3 pawns decided the game; game 25 21.Bxc4/22.Nxc4 created the c4 passer and left a4 weak (−4.6); game 23 18.a4/19.a5 created the a5 target and 26.cxb3 doubled pawns; game 7 5.dxc4 doubled c-pawns for nothing.

5. **Trade policy tied to the evaluation, not to piece values.** When the eval (after the terms above) is negative, penalise exchanges of equal pieces and especially queen and rook trades; when ahead, reward them. Evidence: game 3 24.Qxa5? (−133, into a lost queenless middlegame) and 50.Rf4? (−165, last rook traded a pawn down with the enemy passers running); game 23 12.Qxg6 / 13.Be3 / 24.Bxe6 into a pawn-down rook ending; game 27 37.Rxd5 into Q vs R; game 25 21-22 giving two pieces for the c4 knight.

6. **Rook activity: open and half-open files, seventh rank, and contesting an enemy rook on the second rank.** Evidence: game 23 20.Ra3?? and 25.Rb3?? while Rfe1/Ba4 sat unplayed for ten moves; game 25 allowing 28...Re2 and answering with 29.Rbc1 / 30.Rf1; game 27 rook shuffles 28.Rf3 29.Rd1 30.Rg1 31.Rd3 (each −143 to −214) and 17.Rg1 without g4; game 7 30.Rg4? 31.Rh4? (rook lost to ...f3).

7. **Opening discipline: development count, castling rights, and early queen moves.** Penalise each undeveloped minor after move 6, an uncastled king with castling still available after move 8 while the enemy queen is on, and the queen moving before two minors are out; do not give up the bishop pair (Bxc6+, Bxc3+) without a structural reason. Evidence: game 30 16...Qh6+ through 20...Qg3 (five queen checks, best ...Nc6 every time, then 24...Kd8? with O-O legal); game 29 11.Qh5 with the f1 rook idle; game 8 1...Qf6; game 9 2.Ng5 / 3.Bxf7+ / 5.Bxg8; game 26 5...Bxc3+ then castling behind the open b-file; games 3, 27, 29 reflex Bxc6+.

Items 1 and 2 would have changed the course of all five losses; items 4 and 5 address game 3 and the endings of games 23 and 27; item 3 turns the draws into games; items 6 and 7 remove the aimless moves that let Stockfish-1600/1700 build up in games 23, 27 and 30.
