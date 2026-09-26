# Analysis of `b46124c-full`

elo **2196.8** ±209.2 · W/D/L 25/4/1 · target 1800 · wins@target 7 · 5.0s/move · avg depth 14.2 · 3303640 nps · host windows-amd64-Regenr

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 24.3 | 4 | 11 | 13.1 | 3.52s |
| middlegame | 530 | 39.7 | 13 | 52 | 13.0 | 3.30s |
| endgame | 543 | 42.9 | 19 | 20 | 16.1 | 3.17s |

## Where results were decided

- Losses: 1; the worst engine blunder fell in: endgame ×1
- Draws: 4; 2 of them were ≥ +1.5 for the engine at some point (wins slipped: game 15, game 21)
- Draw terminations: threefold repetition ×4
- Losses from a winning position (≥ +1.5 at some point): 1 (game 24)
- Wins: 25 (game 1 @1700, game 2 @1700, game 4 @1800, game 5 @1900, game 6 @1900, game 7 @1700, game 8 @1700, game 9 @1800, game 10 @1800, game 11 @1900, game 12 @1900, game 13 @1700, game 14 @1700, game 16 @1800, game 17 @1900, game 19 @1700, game 20 @1700, game 22 @1800, game 23 @1900, game 25 @1700, game 26 @1700, game 27 @1800, game 28 @1800, game 29 @1900, game 30 @1900)

## Time and depth

- Engine used on average 3.298s of 5.0s per move (66%); max 4.755s; 0 moves within 3% of the limit.
- Depth: avg 14.2, min 2, max 127. Blunders at depth ≤ 14: 27 of 36.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1700 | white | 1-0 | 87 | checkmate | 31.5 | 1 | ply 59 Bf1 (−202, best Nxd7, middlegame) | Start position |
| 2 | 1700 | black | 0-1 | 80 | checkmate | 28.2 | 0 | ply 56 Kg7 (−148, best a4, middlegame) | Start position |
| 3 | 1800 | white | 1/2-1/2 | 155 | threefold repetition | 32.6 | 1 | ply 21 Bxa7 (−304, best e5, middlegame) | Start position |
| 4 | 1800 | black | 0-1 | 76 | checkmate | 25.0 | 1 | ply 18 d3 (−278, best a5, opening) | Start position |
| 5 | 1900 | white | 1-0 | 47 | checkmate | 16.5 | 0 | ply 37 Rf2 (−101, best Kh1, middlegame) | Start position |
| 6 | 1900 | black | 0-1 | 58 | checkmate | 48.8 | 2 | ply 26 hxg4 (−228, best Nd4, middlegame) | Start position |
| 7 | 1700 | white | 1-0 | 95 | checkmate | 15.0 | 0 | ply 57 g4+ (−129, best g3, endgame) | Italian Game |
| 8 | 1700 | black | 0-1 | 70 | checkmate | 27.7 | 0 | ply 42 Qd7 (−172, best e4, middlegame) | Italian Game |
| 9 | 1800 | white | 1-0 | 111 | checkmate | 44.2 | 3 | ply 21 g3 (−573, best Ncd5, middlegame) | Italian Game |
| 10 | 1800 | black | 0-1 | 80 | checkmate | 25.5 | 1 | ply 18 Nxb4 (−299, best O-O, opening) | Italian Game |
| 11 | 1900 | white | 1-0 | 77 | checkmate | 22.0 | 1 | ply 65 Rxf7 (−210, best Rxf7, endgame) | Italian Game |
| 12 | 1900 | black | 0-1 | 40 | checkmate | 29.2 | 0 | ply 32 Ng3 (−195, best Qg6, middlegame) | Italian Game |
| 13 | 1700 | white | 1-0 | 57 | checkmate | 45.4 | 2 | ply 53 Bd4+ (−442, best c6, endgame) | Ruy Lopez, Morphy Defence |
| 14 | 1700 | black | 0-1 | 88 | checkmate | 31.2 | 1 | ply 26 b5 (−252, best Na5, middlegame) | Ruy Lopez, Morphy Defence |
| 15 | 1800 | white | 1/2-1/2 | 191 | threefold repetition | 23.6 | 0 | ply 37 Rxd6 (−167, best Rxd6, middlegame) | Ruy Lopez, Morphy Defence |
| 16 | 1800 | black | 0-1 | 92 | checkmate | 36.4 | 1 | ply 86 c1=Q (−1088, best h1=Q, endgame) | Ruy Lopez, Morphy Defence |
| 17 | 1900 | white | 1-0 | 77 | checkmate | 12.9 | 0 | ply 13 Nd2 (−73, best O-O, opening) | Ruy Lopez, Morphy Defence |
| 18 | 1900 | black | 1/2-1/2 | 330 | threefold repetition | 62.1 | 8 | ply 308 Kc6 (−2000, best Kc5, endgame) | Ruy Lopez, Morphy Defence |
| 19 | 1700 | white | 1-0 | 72 | checkmate | 37.6 | 1 | ply 64 a7 (−1006, best a7, endgame) | Scotch Game |
| 20 | 1700 | black | 0-1 | 59 | checkmate | 47.7 | 1 | ply 53 Rxb1+ (−1047, best Rxb1+, endgame) | Scotch Game |
| 21 | 1800 | white | 1/2-1/2 | 130 | threefold repetition | 32.1 | 1 | ply 80 Rdd1 (−234, best Rb1, endgame) | Scotch Game |
| 22 | 1800 | black | 0-1 | 69 | checkmate | 53.4 | 1 | ply 63 exf3 (−1113, best exf3, middlegame) | Scotch Game |
| 23 | 1900 | white | 1-0 | 80 | checkmate | 36.2 | 1 | ply 40 Qc7 (−328, best Rg3, middlegame) | Scotch Game |
| 24 | 1900 | black | 1-0 | 104 | checkmate | 56.0 | 3 | ply 87 Kb5 (−336, best Rg8, endgame) | Scotch Game |
| 25 | 1700 | white | 1-0 | 49 | checkmate | 84.3 | 1 | ply 43 Rxe8+ (−1349, best h7, endgame) | Petroff Defence |
| 26 | 1700 | black | 0-1 | 68 | checkmate | 22.5 | 0 | ply 36 Nxc4 (−116, best Nf5, middlegame) | Petroff Defence |
| 27 | 1800 | white | 1-0 | 77 | checkmate | 23.3 | 0 | ply 55 Rc1 (−159, best Na3, middlegame) | Petroff Defence |
| 28 | 1800 | black | 0-1 | 46 | checkmate | 13.4 | 0 | ply 14 Qf6 (−152, best Nxf2, opening) | Petroff Defence |
| 29 | 1900 | white | 1-0 | 61 | checkmate | 14.3 | 0 | ply 21 d4 (−130, best O-O, middlegame) | Petroff Defence |
| 30 | 1900 | black | 0-1 | 106 | checkmate | 78.6 | 5 | ply 96 Qd3 (−1321, best Qd3, middlegame) | Petroff Defence |

## Worst engine moves (all games)

- game 18 @1900 (black, 1/2-1/2) ply 308 **Kc6** lost 2000 cp, best Kc5, endgame, depth 26, 4.7511s, engine's own eval -1062  
  `8/8/3k4/K7/2p5/P1P5/1P6/8 b - - 6 154`
- game 18 @1900 (black, 1/2-1/2) ply 322 **Kc7** lost 2000 cp, best Kd7, endgame, depth 21, 4.751s, engine's own eval -1140  
  `8/8/K1k5/P7/2p5/2P5/1P6/8 b - - 0 161`
- game 25 @1700 (white, 1-0) ply 43 **Rxe8+** lost 1349 cp, best h7, endgame, depth 11, 4.7509s, engine's own eval None  
  `4bk2/p7/2p3pP/1p1p1P2/6B1/2NN4/PPP4P/R1BKR3 w - - 0 22`
- game 30 @1900 (black, 0-1) ply 96 **Qd3** lost 1321 cp, best Qd3, middlegame, depth 12, 2.7103s, engine's own eval None  
  `8/p7/8/1p1q3p/8/QB3Pk1/KP6/7q b - - 9 48`
- game 22 @1800 (black, 0-1) ply 63 **exf3** lost 1113 cp, best exf3, middlegame, depth 11, 4.7511s, engine's own eval None  
  `r3r1k1/p1Q2ppp/8/R7/4pP2/7P/6P1/4qnK1 b - f3 0 32`
- game 16 @1800 (black, 0-1) ply 86 **c1=Q** lost 1088 cp, best h1=Q, endgame, depth 10, 4.7508s, engine's own eval None  
  `8/1p6/8/p6p/P5P1/1k1K1p2/2p2P1p/8 b - - 0 43`
- game 20 @1700 (black, 0-1) ply 53 **Rxb1+** lost 1047 cp, best Rxb1+, endgame, depth 10, 0.1411s, engine's own eval None  
  `6k1/p4p1p/1p3p2/2p5/2P4P/P4pPb/1r6/1R5K b - - 1 27`
- game 19 @1700 (white, 1-0) ply 64 **a7** lost 1006 cp, best a7, endgame, depth 12, 0.1853s, engine's own eval None  
  `6k1/8/P5p1/P1p2pBp/2P4P/5K2/5P2/8 w - - 1 33`
- game 18 @1900 (black, 1/2-1/2) ply 316 **Kc6** lost 873 cp, best Kc6, endgame, depth 23, 4.751s, engine's own eval -1074  
  `8/8/K7/2k5/P1p5/2P5/1P6/8 b - - 4 158`
- game 9 @1800 (white, 1-0) ply 21 **g3** lost 573 cp, best Ncd5, middlegame, depth 11, 2.677s, engine's own eval 250  
  `r1b2r1k/2pp2pp/1p5n/p1b1q3/2BnPN2/2NP4/PPP2PPP/R1BQ1RK1 w - - 1 11`
- game 18 @1900 (black, 1/2-1/2) ply 320 **Kc6** lost 555 cp, best Kc6, endgame, depth 53, 2.052s, engine's own eval 0  
  `8/2k5/K7/8/P1p5/2P5/1P6/8 b - - 8 160`
- game 30 @1900 (black, 0-1) ply 34 **Qa5** lost 483 cp, best Rhd8, middlegame, depth 10, 4.7508s, engine's own eval -55  
  `2r4r/ppq2ppp/4bk2/8/2BR2P1/P7/1PQ1RP1P/1K6 b - - 4 17`

Annotated PGNs with `[%eval]` and best moves: `analysis/b46124c-full/game_NN.pgn`.
