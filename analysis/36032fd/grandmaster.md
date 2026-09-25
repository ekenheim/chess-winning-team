# Grandmaster review of runs `36032fd` and `36032fd-s1`

Reviewer's brief: our engine at commit `36032fd` (tapered material + piece-square eval, incrementally updated; alpha-beta with transposition table; capture-only quiescence; depth ~8 in 0.25 s) against Stockfish 19 at UCI_Elo 1700/1800/1900. Two runs of 30 games: `36032fd` 17/3/10 (Elo 1887 ±131, depth 8.0, 3.7 Mnps) and `36032fd-s1` 19/4/7 (Elo 1955 ±139, depth 7.3, 2.6 Mnps). Only wins count. This review covers the 17 losses (`36032fd`: 1, 2, 3, 9, 11, 12, 17, 18, 25, 30; `-s1`: 6, 7, 18, 22, 23, 26, 28) and the 5 draws that were once ≥ +1.5 for us (`36032fd`: 21, 24; `-s1`: 9, 17, 19). It builds on the reviews of `498eace`, `7047219-full`, `7308d5b` and `c3a8a8b`; their content is referenced, not repeated. Evals in brackets are Stockfish depth 14 from White's side; "own" is the engine's score from its own side. Move numbers are as in the annotated PGNs, which start from the opening FEN. Games from `36032fd-s1` are written s6, s7, etc.

I checked the source at this commit before writing: `engine/src/search.rs` has no check extension, `quiescence` stands pat from the static eval with no `board.checkers()` test (line 258) and no legal-move test, and `soft_limit = 0.4 × movetime` (line 79). `engine/src/eval.rs` is material + PST only, tapered by phase; no king-safety, pawn-structure or mobility term. The later merge `73fbb69` (check extension, in-check quiescence, killers/history, NMP/LMR/PVS) post-dates both runs, so some of what follows predicts what that merge should fix.

## Summary

**What changed since `c3a8a8b`.** The Italian as Black is no longer the problem it was: games 8 and 10 were won, only 12 lost (the two Italian losses were as White, 9 and 11, with the same 1.Nc3/2.d3/Bxe6 setup). The queenless king walk stayed fixed: no non-win was caused by a king marching about with the queens off, and the endgame king play in games 18, 21, s17 and s9 was sound. Every one of the 17 losses was decided with the enemy queen on the board, 16 of them in the middlegame.

**What persists, now with the mechanism visible.** King safety with the enemy queen on is still the number-one cause (14 of 22 games). The mating-net theme is not only "below the horizon": twice the engine walked into a **mate in three (six plies) at depth six** while its own score said it was winning a rook (12: 15...Bxb3?? own +389; s26: 18...Bxf1?? own +513). At depth 6 the mating move lands at ply 6 and the mated node is evaluated by `quiescence`, which stands pat on the static score of the side that has just been mated. The effective mate horizon is therefore depth − 1, and every "own +400 to +700 while Stockfish says −6 to −10" decision in these runs (1, 3, 25, s9, s23) is the same defect one ply deeper. Material grabs with the king under attack are still the trigger in 12 of the 22 games, and the decisive blunder came at 0.11–0.16 s (an iteration ended just past the 0.10 s soft limit and no new one started) in 7 of the 17 losses.

**What is new at this depth.**
- **The engine opens a file toward its own future king and then castles onto it: 0 wins in 4 games.** Bd3xg6 hxg6 followed by O-O (3, s19, s23) and Bxe6 fxe6 followed by O-O and then Rfe1 (9). The eval credits the doubled pawn it inflicts and charges nothing for the half-open h- or f-file, and the games were lost by Qh4/Qh3 + Nh5 on the h-file (s23), Nf3+/Qg5+/Rxh3+ on the h-file (3) and Qh4 + Ng5 on the f-file after the f1 rook left (9).
- **Queen-plus-knight batteries next to the castled king are invisible.** With a white knight on f5 (or h5/g5) and the queen on f4/g5/h6, Stockfish's best move was ...Kh8 six times and the engine never played it: s6 (21...a6??, best Kh8), s18 (12...Rad8?, 13...Bf5?, both Kh8), s28 (22...Kg8??, 23...Ra8??, both Kh8). `KING_MG_PST` scores g8 +30 and h8 +20, so the king walks back into the g-file where the attack lands. Same structure as the g1/h1 finding in `c3a8a8b` game 11, now on the black side and decisive three times.
- **Opening tactics two moves beyond the horizon.** 18: 7...Nf6?? (−490, d6) in the Ruy Lopez Exchange, refuted by 8.e5 (pawn fork) and the e-file pin that only shows after 9.Qh4 Qe7 10.O-O Bxe5 11.Re1. s26: 3...Bb4?? (−218, d5), a bishop that hangs to axb4 because ...Qxa1 then loses the queen. Both cost a piece before move 10; the opening phase is where the engine's depth is lowest (6.1–6.4 average) because the trees are widest and 0.24 s is used every move.
- **Depth collapse in `-s1`.** Same binary, 30 % fewer nodes per second (host load), average depth 7.3, and the losses in s6, s18 and s22 contain depth-4 and depth-5 moves at 0.24 s (s18 12...Rad8? and 13...Bf5? at d4; s22 7...Nf6? at d4; s6 five moves at d5). 66 of 74 blunders in that run were at depth ≤ 7. The engine at depth 4–5 is a 1500 player.
- **Checks that help the enemy king.** 21: 36.Rf7+?? (−380), 40.Rf8+?? (−248), 41.Rf7+?? (−229) drove the black king from c8 to b6 and turned 0.00 into −4.6; s19: 53.Rf7+? (−227) threw away the one +2.76 moment. Small, but new: in these endings a check was the losing move four times.

---

## Losses from a winning position (eight games)

### Game 1 (White vs 1700, start position, 0-1) — +3.22, then the king's pawn cover removed, then a queen on a pawn-grab while mate was two moves off

Stockfish-1700 mis-handled a French-type middlegame (31...Bc6? +2.88, 33...Be8? +3.22). The engine's kingside had already been thinned: 30.hxg4 and 39.gxh4 removed both g- and h-pawns while Black kept Qh4, Ne4, Bh5, a pawn on g4 and Rg8. 35.f3? (−152, g3) and **38.g3?? (−217, best Rf1)** opened the second rank; 42.Qb6? (−196, f5) sent the queen to the queenside; and with the position at 0.00, **44.Qxd5?? (−837, own +690, d7, 0.15 s, best Qd7+)** took a pawn on d5 while 44...Qf2+ 45.Kh1 g3 (quiet) made Qg2#/Qxe1+ unstoppable, so 46.Qxg8+ gave the queen. Three plies plus one quiet move; the engine's own +690 counted the pawn and nothing else.

### Game 2 (Black vs 1700, start position, 1-0) — from −2.67 to a king on g5

Black was better after 9.c3?? and 14.Bc4?? (−2.67). **13...Rxe4?? (−263, best Bf8)** and **18...c6?? (−333, own?, best Ra6)** allowed 19.Bxg7! Kxg7 20.Rg3+ Kf6 21.Rf3+: a bishop sacrifice on the pawn shield that the engine saw only as "bishop for pawn". Then **21...Kg5?? (−649, own +326, d7, 0.15 s, best Ke7)**: the king walked forward toward the white queen, bishop and two rooks, 22.Rxf7 and 23.h4+ Kh6 24.Qc2 left it in a net, and it was mated on h1 twelve moves later. The engine's +326 says it was still counting material. Queens on, king on g5, no term prices it.

### Game 12 (Black vs 1900, Italian, 1-0, 18 moves) — a rook offered, a mate in three not seen at depth six

9.Re1+ **Kf8** (the check-blocking king move from `c3a8a8b`, Rh8 out of play for the rest of the game). Stockfish-1900 then blundered 15.Rb3?? (−190; 15...Qc7 leaves Black better) and the engine took: **15...Bxb3?? (−1187, own +389, d6, 0.24 s, best Qc7)** 16.Qe7+ Kg8 17.Qe8+ Rxe8 18.Rxe8#. Back-rank mate, six plies from the blunder, at depth six: the node after 18.Rxe8# is a quiescence node with Black to move, in check with no legal moves, and `quiescence` returns Black's static score, a rook up. The search literally cannot see a mate delivered on its last ply.

### Game 17 (White vs 1900, Ruy Lopez Exchange, 0-1) — +2.04 with a king on g1 that never castled

3.Nxe5 Bxf2+ 4.Kxf2 Qd4+ 5.Kf1 Qxe5 (a book line): castling rights gone, king walked to g1 by hand, Rh1 stuck behind the h-pawn for the whole game. 11.g3? (−195, best Bd2) weakened the king further; 16.Ba5? (−70, Rh4) took the bishop off d2 where it guarded the king. After 16...Ra7?? (+1.37) came **17.Qe3?? (−607, d6, 0.13 s, best e6)**: the queen left d3, the only defender of the d5 knight, to line up on a7; 17...Qxd5 18.Qxa7 O-O and the engine had rook for knight and a lost game [−5.38]: Ng5-f3+/h3+ against Kg1/Rh1 with the queen on a7 unable to return. 24.Rh2?? (−524, Qxb7) and the king was hunted from g1 to f6 and mated on e6. Material grab (Qxa7) with the enemy queen on and the own king uncastled: two known themes in one move.

### Game 25 (White vs 1700, Petroff, 0-1) — never castled; the king walked to b2 to win a knight

9.Bxa7+? (−139, Bd4+) and **11.Nxh7?? (−376, best Qd2)** were two pawn grabs on the rim (the knight then needed four moves to get back to h6); 13.Qh5? (−264, g4); 16.Ke2 forced. Stockfish-1700 gave the game back twice (18...b6?? +2.83, 21...b5?? +3.56) and with +2.45 on the board the engine played 22.Kc2? (−111, Kd2) and **23.Kb2?? (−890, own +603, d7, 0.14 s, best Qf7)** to pick up the a2 knight: 23...Qg7+ 24.Kxa2 Qc3! (quiet, threatening Qb2#) 25.Bc1 b4 26.Qg5 Re1 and mate in four. Check, capture, quiet move: the third ply is the one the capture-only quiescence never generates. The king had walked e1-e2-d3-c2-b2 with both queens and four rooks on the board.

### Game s6 (Black vs 1900, Sicilian, 1-0) — −1.59 for Stockfish, then three queen pawn-grabs and a mate threat ignored

Black was better from move 4 (Stockfish-1900 played 3.a4?, 4.Be3?, 8.Bd3?). **20...Qxc2?? (−345, d5, best Nf8)** took a pawn while White's Qd6 and Nf5 stood next to the black king; Stockfish returned it (21.Qf4? 0.05); **21...a6?? (−433, d5, 0.22 s, best Kh8)** ignored Qg5/Nh6+ against g7; 22...Qd3? (−206, Qc3); 26...Qxa4? (−130, Kg8) a third pawn grab on the rim; **29...Kh6?? (−433, Qxd4+)**. Five engine moves at depth 5 in a game where the whole question was whether Q+N+B reach g7. The queen made twelve moves in this game; the king's defenders (Nf6, Nd7) were traded off by the engine itself (13...Ne5?, 17...Rec8??).

### Game s7 (White vs 1700, Sveshnikov, 0-1) — +4.84 with the king on e1 for thirteen moves

7...Qd7?? gave White +4.84. 8.a3? (−114, Bg5), **10.Bxg4? (−221, Be3)** traded the bishop that was doing the attacking for a rook that was already trapped, 11.Qb5? (−100); Stockfish returned the favour (12...Bb7? +4.84); and **13.Qxe7?? (−615, own +415, d6, 0.16 s, best O-O)** took a bishop with the king still on e1, Rh1 and Bc1 at home: 13...Qxf2+ 14.Kd1 Qxg2 and **16.Ne2?? (−572, Re2)** Nf2+ and the king was driven to f4 and mated on e2. Castling was legal and best at move 13; the engine has been in this game (queen grabs a piece, king in the centre, mate) in every run since `498eace`.

### Game s23 (White vs 1900, Caro-Kann, 0-1, 20 moves) — +2.07 with the h-file open toward its own king

4.Bxg6 hxg6 gave Black the half-open h-file; 8.O-O put the king on it. Black's Qc7-a5-a6-c4-h4 and Nh5 arrived; **14.g3?? (−509, d7, best Be5)** attacked the queen with the pawn in front of the king (14...Qh3 and g3 has become a target), and **15.Ne5?? (−727, own +379, d6, 0.24 s, best Re1)** ignored 15...Nxf4 with Qxh2# to follow (16.Qd7+ Kf8 17.Qc8+ Rxc8 was the engine giving its queen to postpone it). Own +379 counted the c6 knight. A king-file term prices 4.Bxg6/8.O-O; a king-zone term prices 14.g3; the in-check quiescence sees 15.Ne5.

## The other losses

### Game 3 (White vs 1800, start position, 0-1, 22 moves)

Caro-Kann structure from the start position: 6.Bxg6 hxg6 (h-file for Black), 9.O-O onto it. 13.Bxa7? (−159, Nb5) grabbed a pawn on a7 with the bishop that guarded the kingside; **15.Nxc6?? (−614, own +456, d7, 0.11 s, best f3)** took a knight and allowed 15...Nf3+! 16.gxf3 Qg5+ 17.Kh1 Qf4 with Qxf3+ and Rxh2+ unstoppable; **18.Nxb4+?? (−291)** and mate on h2 followed. Five plies with two checks plus a quiet queen move; searched at depth 7 with 0.11 s used.

### Game 9 (White vs 1800, Italian, 0-1, 29 moves)

3.Bxe6 fxe6 handed Black the f-file; 7.O-O; 16.Qa6/21.Qxa5 took the queen to the a-file for a pawn. With Black's Ng4, Nf7 (heading to g5/h3) and Qe7 pointed at h4, **22.Rfe1?? (−691, own +143, d6, 0.24 s, best Ne2)** removed the rook from the f-file: 22...Qh4 23.h3 Ng5 24.Qc7+?? (−150, Re3) Kg8 25.Qxc6 Nxh3 and mate on h1. The rook on f1 was the only piece defending f2/h2; the eval sees a rook on e1 as +5 in `ROOK_PST` and knows nothing about the file.

### Game 11 (White vs 1900, Italian, 0-1, 49 moves)

No single blunder over 200. The engine weakened its own castled king with **15.g4? (−53)** and 16.Bxf4 exf4, then lost the thread: 22.Rab1? (−113, best e5!), 23.Rbd1, 24.Nd2?? (−186; 24...f5 opens the g- and f-files against g1/h3), 27.Re3? (−162), 33.Rb1? (−100), 36.Qf1? (−153, Kh1), 41.Kh1?? (−190, Nf3). Thirty moves of ACPL 41 in which Stockfish's best move was a king move (Kh1/Kh2) or Nf3 seven times. The central lever e5 at move 22 was the last chance; a pawn-structure or space term is not the cheap fix here and I would not chase this game.

### Game 18 (Black vs 1900, Ruy Lopez Exchange, 1-0, 85 moves)

1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Bxc6 dxc6 5.d3 Bd6 6.d4 exd4 7.Qxd4 **Nf6?? (−490, d6, 0.24 s, best f6)** 8.e5!: the pawn forks d6 and f6 with the queen behind it; 8...c5 9.Qh4 Qe7 10.O-O Bxe5 11.Re1 pins and wins the piece for two pawns (11...Bxh2+ 12.Kxh2). The refutation needs nine plies including a castle and a quiet Re1; at depth 6 the leaf after 9...Qe7 reads "material even". The engine then defended a piece-down ending for 75 moves with ACPL 38 and even got Stockfish down to +2.76, but 76...Bc2? (−393, Kf8) and 78...Bc2? (−216, g1=Q+) let Nd5+/f6 through. Depth is the only cure for the opening move; the opening trees are widest exactly where the engine searches shallowest (6.4 average).

### Game 30 (Black vs 1900, Petroff, 1-0, 28 moves)

17.Bxh6 **gxh6? (−119, best Rb8)**, the pawn-shield recapture reflex from `7047219-full`, then 18.Qxh6 **f6?? (−612, d6, 0.11 s, best Bd6)**: a second pawn moved in front of the king with White's Qh6, Rg3 and Bb1 aimed at it. 19.Qg6+ Kf8 20.Qh6+ Kg8 21.Bh7+ Kf7 22.Ng5+ fxg5 23.Rf3+ and mate on h8. Ten plies, six checks; 0.11 s used on the losing move.

### Game s18 (Black vs 1900, French, 1-0, 28 moves)

The engine castled and then pushed its own shield: **7...g5? (−130, Ne7)**, **8...g4? (−183, Ne4)**, opening the h-file for White's h1 rook (15.h3 gxh3 16.Nxh3). 11...Be6? (−177), 12...Rad8? (−109, Kh8, **d4**), 13...Bf5? (−164, Kh8, **d4**), 16...Bg4? (−147). Then **21...Nxa1?? (−420, d6, best Bxh5)** took a rook with Nh5, Ng3, Qf1 and Rh1 all on the kingside: 22.Nf6+ Kf8 23.Rxh7 and **23...Qxg3?? (−572, Be6)** 24.Nxg4 with Nh6/Qh6 mate. Depth 4 at 0.24 s on two consecutive moves is the depth-collapse problem of run `-s1` in one game.

### Game s22 (Black vs 1800, Caro-Kann, 1-0, 23 moves; ACPL 133)

The queen made eight of the first fifteen moves: Qd5, Qxd4, Qb6, **Qxb2? (−153, Qa5+)**, Qb5? (−193), Qd5, **Qxa2?? (−368, Qc5)**, Qa4? (−317). In between, **7...Nf6? (−322, d4, best Qa5)** and **8...e5?? (−423, d6, 0.11 s, Nxe4)** left the king on e8 until move 12 while White's Bd4/Qf3 pointed at g7. The end was 18...Nd5?? (−436, Bb4) 19.Nxf5 **Bxg5?? (−495, Nxc3)** 20.Nh6+ and mate. Two queen pawn-grabs on the a/b files and no development: three known themes, one game.

### Game s26 (Black vs 1700, Scandinavian, 1-0, 21 moves)

2...e5? (−67), **3...Bb4?? (−218, d5, best Bd6)** hung a bishop (4.axb4 Qxa1 and the queen has no way out), which Stockfish-1700 declined. **9...dxc3?? (−393, best Qxc3)** recaptured with the pawn and left the queen on b4 to 10.Ba3 with Re1+ against the e8 king to follow; 12...Rb8?? (−318, Bd7), **13...Bg4?? (−468, Bd7)** counter-attacked a rook instead of covering the king; 16...a5?? (−359). Then, level again after Stockfish's 17.Nxa5?? (0.00): **18...Bxf1?? (−997, own +513, d6, 0.24 s, best Rxb7)** 19.Qa4+ Bb5 20.Qxb5+ c6 21.Qxc6#. Mate in three, six plies, depth six: the same quiescence blindness as game 12, with the same "own +500" signature. The king stood on e8 for all twenty-one moves with castling legal from move 7.

### Game s28 (Black vs 1800, Scandinavian, 1-0, 41 moves)

12...Rf8? (−90, Re7) let 13.Bxf7+ in; 16...exd4? (−129, e4); **17...axb4?? (−257, best Rxf7)** did not take the knight that had been sitting on f7 for two moves; **18...g6? (−123, Ne4)** moved a pawn in front of the king with Qc2+ on the diagonal; and then, with Nf5, Bd3, Qd2 and a rook coming, the engine chose **22...Kg8?? (−338, best Kh8)**, **23...Ra8?? (−222, best Kh8)** and **24...Qc5?? (−475, Ne4)**. Stockfish-1800 itself missed the mate twice (23.Bc2? −223, 24.Rxb4? −205) and still won. The PST's g8 +30 over h8 +20 decided two of these moves.

## The slipped draws

### Game 21 (White vs 1800, Scotch, ½ by repetition) — +5.16, then a queen pawn-grab into a bishop sacrifice

10.Qxf7+ Kd8 had Black's king in the centre [+4.04, +5.16 at move 14]. 11.Bxh6? (−149, Bb2) and 13.f4? (−135, h3) were pawn grabs and pawn moves; **15.Qxg7?? (−796, own +406, d6, 0.23 s, best f5)** took a second pawn with the queen and allowed 15...Bxh3! 16.gxh3 Qxh3 17.Kf2 Bh4+: the g2/h3 cover was gone and the queen on g7 was a spectator [−2.80]. Stockfish handed it back (21...Qe7?? +1.66), 23.Bxh8? (−179, Rxg5) simplified to 0.00, and 36.Rf7+??, 40.Rf8+??, 41.Rf7+?? (−380, −248, −229) checked the black king from c8 to the safety of b6 [−4.6]. The engine then held a −7 queen-versus-bishop ending for thirty moves until Stockfish-1800 repeated. A save at the end, a slip at move 15.

### Game 24 (Black vs 1900, Scotch, ½ by insufficient material) — the queen boxed in, then a pawn not taken

14...Rad8? (−197, f4) and **16...Rf7?? (−287, d6, best Qh6)** left the queen on d6 with Bf2-c5 coming and Nd5 covering its retreats [+4.70; Stockfish played 17.b4? instead of Bc5]. Stockfish then collapsed (26.b5?? 0.11, 28.cxb3?? −2.47) and with +2.47 for Black the engine played **28...g5?? (−247, d7, 0.24 s, best Nxb4)** instead of taking the b4 bishop; 0.00 from there, and 102...Nc4?? (−215) was the last chance in a Q-vs-R+N ending. Two tactical misses at depth 6–7 rather than a theme; the queen short of squares is the only trapped-piece case in these runs.

### Game s9 (White vs 1800, Sveshnikov, ½ by repetition) — +2.88 from a queen tour, lost to a nine-ply miscalculation

8.Qxa7, 10.Qxc6, 13.Qxb7: three pawns for the queen and +2.88, with the queen on b7 and the king on g1 facing Qg5 and Bh3. **14.Bxf7+?? (−667, own +327, d7, 0.24 s, best g3)**: Bxf7+ Rxf7 Qb8+ Rf8 Qxf8+ Kxf8 fxe3+ Ke7 gxh3 was the engine's nine-ply line (own +327 = the +2.88 lead plus the h3 bishop); Stockfish's −3.79 is the same line with 18...Qxe3+ instead of allowing gxh3, which the engine never played. 21.Kf2?? (−319, a4) walked the king into the queen; the engine then held a −7 position for fifty moves until threefold. Stockfish-1800 cannot convert Q vs R; the engine's three-pawn queen tour was correct only until it had to calculate.

### Game s17 (White vs 1900, French, ½ by repetition, 363 plies) — +3.04 traded down to a same-coloured-bishop fortress

Queens off at move 5; +3.04 after 13...axb4? with the bishop pair, rooks on, and Black's c6/c6 doubled pawns. **15.Rxa8? (−111, Bxc6)**, **16.Bxc6? (−143, fxe4)** traded rook and bishop pair; 22.c3? (−95, Kc3), **23.Rh2? (−142, Kc2)**, 27.Re3? (−69, Rh3) 27...Ra2 28.Re2 Rxe2 and it was a same-coloured bishop ending at 0.00 by move 30. 110 moves of shuffling, then **142.b7+?? (−189, best Ka4)** pushed the passed pawn onto a square where it was lost, 151.Be7?? (−259, Kb3) [−3.14, −6.5 at move 179], and Stockfish-1900 could not win it. Trading when ahead is normally right; here each trade removed the piece the advantage lived in. Not a cheap eval fix, but a passed-pawn term with "blockade square controlled by the enemy king = do not push" would have stopped 142.b7+.

### Game s19 (White vs 1700, Caro-Kann, ½ by insufficient material)

4.Bxg6 hxg6 5.O-O again (the fourth game with this pattern), 7.Bxf6? (−105, Re1) gxf6 and the engine was −2 to −3.8 for twenty moves (15.Rd2? −117, 18.Rd3? −136) before Stockfish-1700 unravelled (36...bxa6?, 37...Kc7?, 52...Bf6?? +2.76). **53.Rf7+? (−227, d9)** was the only move that threw the +2.76 away: 53...Kg8 and the g6 pawn is blockaded. The "slip" was one move long, but the game is a third piece of evidence for the h-file pattern.

---

## Themes, with counts over the 22 games

| Theme (known from earlier reviews unless marked new) | Games | Count | Status |
|---|---|---|---|
| Own king exposed with the enemy queen on: pawn shield removed or advanced (1: g3; 11: g4; 17: g3; 30: gxh6, f6; s18: g5, g4; s28: g6; s23: g3), king walks toward the attack (2: Kg5; 25: Kb2; s7: Ke3/Kd4; s9: Kf2), Q+N battery on f5/h5 ignored (s6, s28, s23, 9) | 1, 2, 3, 9, 11, 17, 25, 30, 21, s6, s7, s18, s23, s28 | **14** | Persists, #1 |
| Mating net below the horizon; of which mate-in-3 missed at depth 6 because `quiescence` scores a mated node by static eval | 1, 2, 3, 9, 12, 17, 25, 30, 21, s6, s7, s18, s22, s23, s26, s28, s9 — depth-6 mates: 12, s26 | **17** (2 exact) | Persists; mechanism identified |
| Material grab while the own king is under attack (queen: 1 Qxd5, 9 Qxa5, 17 Qxa7, 21 Qxg7, s6 Qxc2/Qxa4, s7 Qxe7, s22 Qxb2/Qxa2, s9 tour; other pieces: 3 Bxa7/Nxc6, 25 Nxh7/Kxa2, 12 Bxb3, s18 Nxa1, s26 Bxf1) | 1, 3, 9, 12, 17, 21, 25, s6, s7, s9, s18, s22, s26 | **13** | Persists, unchanged |
| Castling / central king: never castled (25, s7, s26), castled at move 12 after a queen tour (s22), Kf8 blocking a check (12), castling rights lost and Rh1 stuck (17) | 12, 17, 25, s7, s22, s26 | **6** | Persists; the Italian-as-Black variant is fixed (2/3 won) |
| Passed pawns | s17 (142.b7+??) | 1 | Minor |
| Trapped pieces | 24 (queen on d6 vs Bc5/Nd5); 25 (Nh7 out of play four moves) | 1–2 | Minor |
| Italian opening as Black | 12 only (8 and 10 won) | 1 | Largely fixed |
| **New:** own bishop trade opens the h-/f-file, then O-O onto it, then the rook leaves it | 3, 9, s19, s23 | **4** (0 wins) | New |
| **New:** ...Kh8 (or Kh1) best and refused because of `KING_MG_PST` g-file bonus | s6, s18, s28, (11) | 3–4 | New on the black side, decisive in s28 |
| **New:** opening tactic beyond depth 6 costing a piece before move 10 | 18, s26 | 2 | New |
| Time: decisive blunder at 0.11–0.16 s, i.e. iteration ended just after the 0.10 s soft limit (1, 2, 3, 17, 25, 30, s7) or at depth 4–5 with the full 0.24 s (s6, s18, s22) | 1, 2, 3, 17, 25, 30, s7, s6, s18, s22 | **10** | Persists (flagged in `c3a8a8b`, `soft_limit` still 0.4) |
| Queenless king walk | none | 0 | Fixed |
| Draw taken from a better position | none (21, s9, s19 were saves at the end; s17 was a fortress from +3) | 0 | Unchanged |

Where Stockfish's own level mattered: in 1, 2, 12, 17, 25, s6, s7, s26 and s28 Stockfish-1700/1800/1900 blundered back into a level or lost position at least once and the engine blundered again afterwards. Nine of seventeen losses had at least one "free" chance to recover.

---

## Prioritised suggestions (engine-implementable)

1. **Score a checkmated or in-check quiescence node correctly, and keep the check extension.** In `quiescence`, if `board.checkers()` is non-empty: no stand-pat, generate all evasions, return `-MATE + ply` when there are none. This is in `73fbb69` on main; verify it is active before the next run, because it alone removes the two depth-6 mate-in-3 losses (12: 15...Bxb3?? own +389; s26: 18...Bxf1?? own +513) and the "own +300..+700 versus −6..−10" decisions in 3 (15.Nxc6??, Nf3+ gxf3 Qg5+), 25 (23.Kb2??, Qg7+ Kxa2 Qc3), s9 (14.Bxf7+??), s23 (15.Ne5??). Expected value: 2 losses outright, 3–4 more shortened or avoided; it is the single biggest lever in these runs.

2. **King-zone attackers, gated on the enemy queen.** Count enemy pieces attacking the eight squares around the own king plus the two squares in front of it, weighted Q 4, R 2, N/B 1 (add 2 when the enemy queen and a knight both attack a square adjacent to the king), and charge a convex table (0, 0, 10, 25, 50, 80, 120, ...) scaled to zero when the enemy queen is off. Do the same for the opponent. Evidence: s6 21...a6?? (Qf4 + Nf5 vs g7, best Kh8), s28 22...Kg8??/23...Ra8?? (Nf5 + Qd2-g5 + Bd3), s23 14.g3??/15.Ne5?? (Qh3 + Nh5), 9 22.Rfe1?? (Qh4 + Ng4 + Nf7-g5), 1 44.Qxd5?? (Qh4 + Ne4 + Bh5 + g4), 30 18...f6?? (Qh6 + Rg3 + Bb1), 2 21...Kg5??. Note `62ad409` reverted a "king-zone attackers + shelter" experiment measured at 1600; the failure mode to avoid is charging for attackers with the queens off, which would undo the tapered-eval gains in the endings that were played well here (18, 21, s17, s9). With the same term, make `KING_MG_PST` h1/h8 equal to g1/g8 (currently +20 vs +30) so ...Kh8 is not out-scored by the table when a knight sits on f5/h5.

3. **A king-file term that also sees the file before the king arrives.** For each of the three files around the own king: −20 if it has no own pawn (half-open for the enemy), −35 if it has no pawn at all, doubled when an enemy rook or queen stands on it, +15 if an own rook stands on it; enemy-queen-gated. Apply the same term to the destination squares of castling so 6.Bxg6 hxg6 9.O-O (3), 4.Bxg6 hxg6 8.O-O (s23), 4.Bxg6 hxg6 5.O-O (s19) and 3.Bxe6 fxe6 7.O-O then 22.Rfe1?? (9) are all charged at the moment the bishop trade or the rook move is chosen. Four games, zero wins; the three Caro-Kann/French structures with ...Bg6 are in the opening book and will recur.

4. **Use the clock: `soft_limit` from 0.40 to 0.65 of `movetime`, and never end the search on an iteration whose root score dropped ≥ 100 cp or whose best move changed.** Seven of the seventeen losses were decided at 0.11–0.16 s with depth 6–7 (1: 44.Qxd5?? 0.15 s; 2: 21...Kg5?? 0.15 s; 3: 15.Nxc6?? 0.11 s; 17: 17.Qe3?? 0.13 s; 25: 23.Kb2?? 0.14 s; 30: 18...f6?? 0.11 s; s7: 13.Qxe7?? 0.16 s); average time used was 71–73 %. Pair it with the killers/history ordering now on main and check nodes per second at the start of a run: `-s1` ran at 2.6 Mnps against 3.7 Mnps for the same binary, and its losses contain depth-4 moves at full time (s18 12...Rad8?, 13...Bf5?; s22 7...Nf6?) that no evaluation term will rescue.

5. **Development and castling urgency in the first fifteen moves, plus the queen-grab gate.** While the enemy queen is on: −10 per own minor piece still on its starting square after move 6, −30 for an uncastled king with castling still legal after move 10 (−50 when an enemy rook or queen is on the king's file), and treat a queen capture of a pawn on the a/b/h files or on the second rank as worth zero unless the queen has two safe retreats and no enemy piece is undeveloped-with-tempo against it. Evidence: s22 (eight queen moves in fifteen, Qxb2?, Qxa2??, king on e8 until move 12), s26 (king on e8 for 21 moves, castling legal from move 7), 25 (never castled; Bxa7+?, Nxh7??), s7 (O-O best at move 13, Qxe7?? instead), 9 (Qxa5 then Rfe1??), 21 (Qxg7??), s6 (Qxc2??, Qxa4?), s9 (queen tour then Bxf7+??). Six losses and two slipped draws carry at least one of these; the term is cheap and phase-gated, so it disappears exactly where the endgame play is already good.

Items 1–3 cover every loss from a winning position (1, 2, 12, 17, 25, s6, s7, s23) and the four open-file games; item 4 is the two-line change flagged last time and still not made at this commit; item 5 is the residual opening-greed leak. Not on the list, because they are not cheap: the same-coloured-bishop fortress in s17, the strategic drift of game 11, and the checks that help the enemy king in 21 and s19.
