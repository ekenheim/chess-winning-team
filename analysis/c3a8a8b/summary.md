# Analysis of `c3a8a8b`

elo **1984.6** ±143.5 · W/D/L 21/2/7 · target 1800 · wins@target 6 · 0.25s/move · avg depth 6.8 · 1460958 nps · host windows-amd64-Regenr

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 33.3 | 7 | 12 | 5.7 | 0.20s |
| middlegame | 512 | 67.4 | 47 | 47 | 6.5 | 0.19s |
| endgame | 444 | 37.0 | 20 | 12 | 7.8 | 0.17s |

## Where results were decided

- Losses: 7; the worst engine blunder fell in: middlegame ×5, opening ×2
- Draws: 2; 1 of them were ≥ +1.5 for the engine at some point (wins slipped: game 16)
- Draw terminations: fifty moves ×1, threefold repetition ×1
- Losses from a winning position (≥ +1.5 at some point): 4 (game 8, game 11, game 17, game 28)
- Wins: 21 (game 1 @1700, game 2 @1700, game 3 @1800, game 4 @1800, game 5 @1900, game 6 @1900, game 7 @1700, game 13 @1700, game 14 @1700, game 15 @1800, game 18 @1900, game 19 @1700, game 20 @1700, game 21 @1800, game 22 @1800, game 24 @1900, game 25 @1700, game 26 @1700, game 27 @1800, game 29 @1900, game 30 @1900)

## Time and depth

- Engine used on average 0.183s of 0.25s per move (73%); max 0.286s; 33 moves within 3% of the limit.
- Depth: avg 6.8, min 2, max 127. Blunders at depth ≤ 7: 55 of 74.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1700 | white | 1-0 | 95 | checkmate | 73.2 | 5 | ply 79 Rf3 (−1156, best Kd2, endgame) | Start position |
| 2 | 1700 | black | 0-1 | 66 | checkmate | 39.1 | 2 | ply 50 Qh5+ (−330, best d3+, middlegame) | Start position |
| 3 | 1800 | white | 1-0 | 131 | checkmate | 22.6 | 0 | ply 35 Nf3 (−167, best axb4, middlegame) | Start position |
| 4 | 1800 | black | 0-1 | 80 | checkmate | 59.3 | 3 | ply 74 Ne4 (−944, best Nd4, endgame) | Start position |
| 5 | 1900 | white | 1-0 | 99 | checkmate | 48.2 | 2 | ply 91 f6 (−1190, best f6, endgame) | Start position |
| 6 | 1900 | black | 0-1 | 116 | checkmate | 29.0 | 1 | ply 38 g5 (−225, best Be7, middlegame) | Start position |
| 7 | 1700 | white | 1-0 | 129 | checkmate | 16.0 | 0 | ply 29 a4 (−101, best e5, middlegame) | Italian Game |
| 8 | 1700 | black | 1-0 | 23 | checkmate | 159.5 | 1 | ply 16 Kg8 (−1609, best Ke8, opening) | Italian Game |
| 9 | 1800 | white | 0-1 | 50 | checkmate | 65.0 | 4 | ply 45 d8=Q (−398, best Kf2, middlegame) | Italian Game |
| 10 | 1800 | black | 1/2-1/2 | 325 | fifty moves | 21.5 | 6 | ply 18 cxb4 (−424, best O-O, opening) | Italian Game |
| 11 | 1900 | white | 0-1 | 126 | checkmate | 77.8 | 7 | ply 91 b4 (−503, best Rd2, middlegame) | Italian Game |
| 12 | 1900 | black | 1-0 | 41 | checkmate | 48.5 | 2 | ply 18 Nxc6 (−287, best bxc6, opening) | Italian Game |
| 13 | 1700 | white | 1-0 | 57 | checkmate | 115.2 | 6 | ply 55 Rf1 (−915, best Bf4, endgame) | Ruy Lopez, Morphy Defence |
| 14 | 1700 | black | 0-1 | 70 | checkmate | 57.2 | 3 | ply 30 Qxh1 (−682, best a5+, middlegame) | Ruy Lopez, Morphy Defence |
| 15 | 1800 | white | 1-0 | 53 | checkmate | 73.9 | 3 | ply 39 O-O (−643, best Ne5, middlegame) | Ruy Lopez, Morphy Defence |
| 16 | 1800 | black | 1/2-1/2 | 96 | threefold repetition | 58.6 | 6 | ply 48 Qxb2 (−598, best Rae8, middlegame) | Ruy Lopez, Morphy Defence |
| 17 | 1900 | white | 0-1 | 60 | checkmate | 97.8 | 2 | ply 45 gxf4 (−1585, best Qxc7, middlegame) | Ruy Lopez, Morphy Defence |
| 18 | 1900 | black | 0-1 | 68 | checkmate | 86.4 | 2 | ply 62 Qb2 (−1284, best Qa7+, middlegame) | Ruy Lopez, Morphy Defence |
| 19 | 1700 | white | 1-0 | 76 | checkmate | 36.1 | 1 | ply 70 Rxg6 (−660, best Rf8+, endgame) | Scotch Game |
| 20 | 1700 | black | 0-1 | 69 | checkmate | 44.3 | 1 | ply 63 Rg5 (−880, best Rxc2, endgame) | Scotch Game |
| 21 | 1800 | white | 1-0 | 50 | checkmate | 36.2 | 1 | ply 22 Qb3 (−250, best Ne4, middlegame) | Scotch Game |
| 22 | 1800 | black | 0-1 | 73 | checkmate | 25.9 | 1 | ply 69 Ra1 (−348, best c3, endgame) | Scotch Game |
| 23 | 1900 | white | 0-1 | 53 | checkmate | 65.4 | 2 | ply 40 b4 (−727, best Rf1, middlegame) | Scotch Game |
| 24 | 1900 | black | 0-1 | 65 | checkmate | 67.8 | 1 | ply 55 Bxb7 (−1579, best Bxb7, middlegame) | Scotch Game |
| 25 | 1700 | white | 1-0 | 61 | checkmate | 21.4 | 0 | ply 11 Qe3 (−136, best Ng3, opening) | Petroff Defence |
| 26 | 1700 | black | 0-1 | 48 | checkmate | 44.3 | 2 | ply 42 Qxf3 (−363, best Nxf3+, middlegame) | Petroff Defence |
| 27 | 1800 | white | 1-0 | 85 | checkmate | 78.4 | 6 | ply 81 Kxf5 (−1282, best Kxf5, endgame) | Petroff Defence |
| 28 | 1800 | black | 1-0 | 63 | checkmate | 64.2 | 3 | ply 36 h6 (−676, best Rf8, middlegame) | Petroff Defence |
| 29 | 1900 | white | 1-0 | 83 | checkmate | 28.7 | 1 | ply 39 f4 (−263, best b3, endgame) | Petroff Defence |
| 30 | 1900 | black | 0-1 | 94 | checkmate | 28.7 | 0 | ply 48 Be5 (−176, best Rxe1, middlegame) | Petroff Defence |

## Worst engine moves (all games)

- game 8 @1700 (black, 1-0) ply 16 **Kg8** lost 1609 cp, best Ke8, opening, depth 6, 0.2388s, engine's own eval 548  
  `r1bq3r/pppp1kpp/2n5/4P1N1/6n1/3P4/PP4PP/RNBQbK2 b - - 1 8`
- game 17 @1900 (white, 0-1) ply 45 **gxf4** lost 1585 cp, best Qxc7, middlegame, depth 6, 0.2396s, engine's own eval 988  
  `7k/1bp3p1/p6p/2Q1P2q/5r2/2P3P1/PP3P1P/R3R1K1 w - - 0 23`
- game 24 @1900 (black, 0-1) ply 55 **Bxb7** lost 1579 cp, best Bxb7, middlegame, depth 7, 0.1016s, engine's own eval 2572  
  `r6r/pQ3p1p/3k1p2/2qb4/p7/3p4/P6P/4RK2 b - - 3 28`
- game 18 @1900 (black, 0-1) ply 62 **Qb2** lost 1284 cp, best Qa7+, middlegame, depth 5, 0.2394s, engine's own eval 2028  
  `6k1/8/2b2p1p/1p6/5r1p/2p5/q1Nn2P1/2R3K1 b - - 3 31`
- game 27 @1800 (white, 1-0) ply 81 **Kxf5** lost 1282 cp, best Kxf5, endgame, depth 8, 0.2249s, engine's own eval 2523  
  `2k5/8/3P4/p1N1Kbp1/P2P2P1/4B3/1P3P2/R7 w - - 1 41`
- game 5 @1900 (white, 1-0) ply 91 **f6** lost 1190 cp, best f6, endgame, depth 8, 0.1204s, engine's own eval 2135  
  `8/p1k5/2p1Q3/5P2/P2P4/1P6/1P6/6K1 w - - 3 46`
- game 1 @1700 (white, 1-0) ply 79 **Rf3** lost 1156 cp, best Kd2, endgame, depth 7, 0.24s, engine's own eval 2373  
  `6k1/3N4/8/2P5/P7/3P3R/PB2K3/8 w - - 1 40`
- game 18 @1900 (black, 0-1) ply 60 **Qa2** lost 986 cp, best Qd5, middlegame, depth 6, 0.239s, engine's own eval 1887  
  `6k1/8/2b1qp1p/1p6/5r1p/2p5/2Nn2P1/4R1K1 b - - 1 30`
- game 4 @1800 (black, 0-1) ply 74 **Ne4** lost 944 cp, best Nd4, endgame, depth 6, 0.1825s, engine's own eval 1622  
  `8/2p2p1p/3knn2/5b2/6p1/6P1/1r2B2P/5K2 b - - 3 37`
- game 13 @1700 (white, 1-0) ply 55 **Rf1** lost 915 cp, best Bf4, endgame, depth 4, 0.0078s, engine's own eval None  
  `1k6/2p5/p1P5/8/8/2NPB1P1/PPP3KP/R7 w - - 5 28`
- game 20 @1700 (black, 0-1) ply 63 **Rg5** lost 880 cp, best Rxc2, endgame, depth 7, 0.2051s, engine's own eval 1911  
  `8/2k2pp1/p1p5/Pp1nr3/2p5/8/2P2rPK/8 b - - 5 32`
- game 23 @1900 (white, 0-1) ply 40 **b4** lost 727 cp, best Rf1, middlegame, depth 6, 0.2364s, engine's own eval 140  
  `5rn1/2p1k3/2ppprp1/6q1/4P3/P1N1P1Pp/1PP1Q2P/1R2R1K1 w - - 0 21`

Annotated PGNs with `[%eval]` and best moves: `analysis/c3a8a8b/game_NN.pgn`.
