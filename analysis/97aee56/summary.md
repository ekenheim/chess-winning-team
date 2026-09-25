# Analysis of `97aee56`

elo **2074.7** ±250.8 · W/D/L 27/2/1 · target 1600 · wins@target 8 · 0.25s/move · avg depth 7.6 · 4804469 nps · host darwin-arm64-MacBook-Pro-som-tillhor-Regent.local

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 30.1 | 6 | 19 | 6.9 | 0.19s |
| middlegame | 457 | 47.8 | 24 | 34 | 7.1 | 0.19s |
| endgame | 511 | 47.3 | 26 | 22 | 8.3 | 0.16s |

## Where results were decided

- Losses: 1; the worst engine blunder fell in: middlegame ×1
- Draws: 2; 2 of them were ≥ +1.5 for the engine at some point (wins slipped: game 10, game 24)
- Draw terminations: threefold repetition ×2
- Losses from a winning position (≥ +1.5 at some point): 1 (game 3)
- Wins: 27 (game 1 @1500, game 2 @1500, game 4 @1600, game 5 @1700, game 6 @1700, game 7 @1500, game 8 @1500, game 9 @1600, game 11 @1700, game 12 @1700, game 13 @1500, game 14 @1500, game 15 @1600, game 16 @1600, game 17 @1700, game 18 @1700, game 19 @1500, game 20 @1500, game 21 @1600, game 22 @1600, game 23 @1700, game 25 @1500, game 26 @1500, game 27 @1600, game 28 @1600, game 29 @1700, game 30 @1700)

## Time and depth

- Engine used on average 0.177s of 0.25s per move (71%); max 0.271s; 18 moves within 3% of the limit.
- Depth: avg 7.6, min 2, max 16. Blunders at depth ≤ 8: 27 of 56.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1500 | white | 1-0 | 61 | checkmate | 41.3 | 1 | ply 21 gxh5 (−207, best g5, middlegame) | Start position |
| 2 | 1500 | black | 0-1 | 102 | checkmate | 33.6 | 1 | ply 90 Rxa8 (−989, best Rxa8, endgame) | Start position |
| 3 | 1600 | white | 0-1 | 172 | checkmate | 29.3 | 2 | ply 45 Rc1 (−308, best Rf1, middlegame) | Start position |
| 4 | 1600 | black | 0-1 | 70 | checkmate | 38.1 | 1 | ply 66 Rc3 (−832, best O-O, endgame) | Start position |
| 5 | 1700 | white | 1-0 | 81 | checkmate | 21.9 | 0 | ply 31 Qe3 (−154, best Nxd5, middlegame) | Start position |
| 6 | 1700 | black | 0-1 | 92 | checkmate | 38.3 | 2 | ply 88 Re8 (−480, best Qe2+, endgame) | Start position |
| 7 | 1500 | white | 1-0 | 115 | checkmate | 38.0 | 1 | ply 105 Re6+ (−710, best Re6+, endgame) | Italian Game |
| 8 | 1500 | black | 0-1 | 50 | checkmate | 84.4 | 5 | ply 44 Be3 (−565, best Qxc3+, endgame) | Italian Game |
| 9 | 1600 | white | 1-0 | 71 | checkmate | 26.9 | 0 | ply 31 c4 (−183, best Qxd6, middlegame) | Italian Game |
| 10 | 1600 | black | 1/2-1/2 | 120 | threefold repetition | 110.9 | 8 | ply 26 Bxc1 (−1032, best c6, middlegame) | Italian Game |
| 11 | 1700 | white | 1-0 | 143 | checkmate | 27.3 | 2 | ply 127 b6 (−472, best g8=Q, endgame) | Italian Game |
| 12 | 1700 | black | 0-1 | 124 | checkmate | 40.9 | 3 | ply 120 Kf4 (−433, best Qf3+, endgame) | Italian Game |
| 13 | 1500 | white | 1-0 | 111 | checkmate | 63.6 | 5 | ply 49 c4 (−472, best N4g3, middlegame) | Ruy Lopez, Morphy Defence |
| 14 | 1500 | black | 0-1 | 38 | checkmate | 9.8 | 0 | ply 28 Bxh4 (−94, best Rxd2, middlegame) | Ruy Lopez, Morphy Defence |
| 15 | 1600 | white | 1-0 | 65 | checkmate | 19.8 | 0 | ply 21 exd6 (−172, best Qd3, middlegame) | Ruy Lopez, Morphy Defence |
| 16 | 1600 | black | 0-1 | 96 | checkmate | 6.8 | 0 | ply 60 c5 (−149, best Kg8, endgame) | Ruy Lopez, Morphy Defence |
| 17 | 1700 | white | 1-0 | 75 | checkmate | 16.1 | 0 | ply 23 f4 (−149, best Bg3, middlegame) | Ruy Lopez, Morphy Defence |
| 18 | 1700 | black | 0-1 | 56 | checkmate | 51.4 | 2 | ply 28 Bxd4 (−578, best h5, middlegame) | Ruy Lopez, Morphy Defence |
| 19 | 1500 | white | 1-0 | 126 | checkmate | 30.9 | 2 | ply 14 Qg5 (−436, best Qe2, opening) | Scotch Game |
| 20 | 1500 | black | 0-1 | 73 | checkmate | 63.0 | 1 | ply 67 Rac8 (−1478, best h5, endgame) | Scotch Game |
| 21 | 1600 | white | 1-0 | 94 | checkmate | 86.3 | 5 | ply 90 Rd2 (−1073, best f7, endgame) | Scotch Game |
| 22 | 1600 | black | 0-1 | 77 | checkmate | 11.1 | 0 | ply 43 Re8 (−94, best Bd7, endgame) | Scotch Game |
| 23 | 1700 | white | 1-0 | 64 | checkmate | 20.5 | 0 | ply 14 O-O (−113, best O-O-O, opening) | Scotch Game |
| 24 | 1700 | black | 1/2-1/2 | 113 | threefold repetition | 64.3 | 6 | ply 81 dxc3 (−623, best Rbc8, endgame) | Scotch Game |
| 25 | 1500 | white | 1-0 | 35 | checkmate | 17.1 | 0 | ply 17 Qxd1 (−55, best Kxd1, opening) | Petroff Defence |
| 26 | 1500 | black | 0-1 | 78 | checkmate | 53.5 | 2 | ply 74 Nd3 (−1042, best Kf4, endgame) | Petroff Defence |
| 27 | 1600 | white | 1-0 | 61 | checkmate | 84.1 | 2 | ply 57 Rd3 (−1070, best Nxb4, middlegame) | Petroff Defence |
| 28 | 1600 | black | 0-1 | 74 | checkmate | 86.5 | 3 | ply 66 Bxh4 (−1526, best a1=Q, endgame) | Petroff Defence |
| 29 | 1700 | white | 1-0 | 57 | checkmate | 26.7 | 2 | ply 17 Be5 (−230, best Ne5, opening) | Petroff Defence |
| 30 | 1700 | black | 0-1 | 28 | checkmate | 18.8 | 0 | ply 22 Nxf1+ (−82, best Nxf1+, middlegame) | Petroff Defence |

## Worst engine moves (all games)

- game 28 @1600 (black, 0-1) ply 66 **Bxh4** lost 1526 cp, best a1=Q, endgame, depth 7, 0.2364s, engine's own eval 2980  
  `r6r/p1p2kpp/5n2/8/7P/8/p4bK1/8 b - - 1 33`
- game 20 @1500 (black, 0-1) ply 67 **Rac8** lost 1478 cp, best h5, endgame, depth 7, 0.2361s, engine's own eval 2755  
  `r6r/p2k1ppp/p7/3p4/1b1n4/8/8/1K1n4 b - - 1 34`
- game 21 @1600 (white, 1-0) ply 90 **Rd2** lost 1073 cp, best f7, endgame, depth 6, 0.0066s, engine's own eval None  
  `5k2/7p/5P1N/6p1/4K3/7P/PP3RP1/8 w - - 1 46`
- game 27 @1600 (white, 1-0) ply 57 **Rd3** lost 1070 cp, best Nxb4, middlegame, depth 7, 0.1621s, engine's own eval 2575  
  `5r2/3B3k/8/3N1p2/1b1B4/8/PPP2P1P/2KR2R1 w - - 9 29`
- game 26 @1500 (black, 0-1) ply 74 **Nd3** lost 1042 cp, best Kf4, endgame, depth 6, 0.0076s, engine's own eval None  
  `8/p1p2pp1/p7/6k1/3n4/1r6/K4n2/8 b - - 3 37`
- game 10 @1600 (black, 1/2-1/2) ply 26 **Bxc1** lost 1032 cp, best c6, middlegame, depth 8, 0.1933s, engine's own eval 575  
  `r1bq1r2/pppp1BQp/3k4/4p3/8/8/Pb1P2PP/2R2R1K b - - 0 13`
- game 2 @1500 (black, 0-1) ply 90 **Rxa8** lost 989 cp, best Rxa8, endgame, depth 10, 0.1427s, engine's own eval 1845  
  `Q7/4kppp/1p6/3p4/2p4P/r7/8/7K b - - 0 45`
- game 10 @1600 (black, 1/2-1/2) ply 110 **Bf3** lost 942 cp, best d2, endgame, depth 16, 0.1272s, engine's own eval 0  
  `8/8/8/5Q2/P1k1p3/3pK3/6b1/8 b - - 6 55`
- game 4 @1600 (black, 0-1) ply 66 **Rc3** lost 832 cp, best O-O, endgame, depth 8, 0.0642s, engine's own eval None  
  `4k2r/2p3pp/4p3/p3P1P1/Pp1K4/5r2/8/8 b k - 0 33`
- game 10 @1600 (black, 1/2-1/2) ply 42 **c5** lost 763 cp, best Qd6, middlegame, depth 8, 0.2359s, engine's own eval 375  
  `r1bq4/ppp4Q/8/3pp1k1/8/8/P5PP/5R1K b - - 0 21`
- game 7 @1500 (white, 1-0) ply 105 **Re6+** lost 710 cp, best Re6+, endgame, depth 8, 0.2179s, engine's own eval 2180  
  `4k3/8/2R5/4n3/4N2N/PP2P3/1P4P1/4R1K1 w - - 1 53`
- game 10 @1600 (black, 1/2-1/2) ply 30 **Kxd4** lost 646 cp, best Kb5, middlegame, depth 8, 0.2362s, engine's own eval 650  
  `r1bq1r2/pppp1B1p/7Q/2k1p3/3P4/8/P5PP/2b2R1K b - - 0 15`

Annotated PGNs with `[%eval]` and best moves: `analysis/97aee56/game_NN.pgn`.
