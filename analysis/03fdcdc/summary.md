# Analysis of `03fdcdc`

elo **2234.0** ±153.6 · W/D/L 21/5/4 · target 2000 · wins@target 5 · 0.25s/move · avg depth 11.5 · 3553332 nps · host windows-amd64-Regenr

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 24.2 | 3 | 10 | 9.4 | 0.17s |
| middlegame | 541 | 42.1 | 26 | 44 | 9.7 | 0.16s |
| endgame | 683 | 37.5 | 25 | 34 | 13.7 | 0.15s |

## Where results were decided

- Losses: 4; the worst engine blunder fell in: middlegame ×4
- Draws: 5; 4 of them were ≥ +1.5 for the engine at some point (wins slipped: game 23, game 26, game 27, game 29)
- Draw terminations: threefold repetition ×4, insufficient material ×1
- Losses from a winning position (≥ +1.5 at some point): 2 (game 4, game 5)
- Wins: 21 (game 1 @1900, game 2 @1900, game 3 @2000, game 6 @2100, game 7 @1900, game 8 @1900, game 9 @2000, game 11 @2100, game 12 @2100, game 13 @1900, game 14 @1900, game 17 @2100, game 18 @2100, game 19 @1900, game 20 @1900, game 21 @2000, game 22 @2000, game 24 @2100, game 25 @1900, game 28 @2000, game 30 @2100)

## Time and depth

- Engine used on average 0.158s of 0.25s per move (63%); max 0.240s; 0 moves within 3% of the limit.
- Depth: avg 11.5, min 2, max 127. Blunders at depth ≤ 11: 50 of 54.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1900 | white | 1-0 | 103 | checkmate | 16.7 | 0 | ply 79 Ree1 (−181, best Re6, endgame) | Start position |
| 2 | 1900 | black | 0-1 | 78 | checkmate | 31.0 | 0 | ply 10 Qxd4 (−170, best exd3, opening) | Start position |
| 3 | 2000 | white | 1-0 | 217 | checkmate | 30.3 | 4 | ply 213 Rf6 (−518, best Rf6, endgame) | Start position |
| 4 | 2000 | black | 1-0 | 123 | checkmate | 50.4 | 3 | ply 40 Qxf6 (−600, best gxf6, middlegame) | Start position |
| 5 | 2100 | white | 0-1 | 78 | checkmate | 65.1 | 3 | ply 37 hxg4 (−584, best e4, middlegame) | Start position |
| 6 | 2100 | black | 0-1 | 76 | checkmate | 35.7 | 1 | ply 72 b1=Q (−908, best Rf1+, endgame) | Start position |
| 7 | 1900 | white | 1-0 | 55 | checkmate | 18.9 | 1 | ply 43 Qxb4 (−206, best Re3, endgame) | Italian Game |
| 8 | 1900 | black | 0-1 | 98 | checkmate | 32.3 | 2 | ply 88 Rb1+ (−306, best Rf6, endgame) | Italian Game |
| 9 | 2000 | white | 1-0 | 49 | checkmate | 56.0 | 1 | ply 45 Nd4 (−1082, best f6, endgame) | Italian Game |
| 10 | 2000 | black | 1/2-1/2 | 52 | threefold repetition | 67.0 | 3 | ply 38 Qxc3 (−285, best Ke7, middlegame) | Italian Game |
| 11 | 2100 | white | 1-0 | 91 | checkmate | 37.7 | 1 | ply 83 Qxc1 (−832, best Qxc1, endgame) | Italian Game |
| 12 | 2100 | black | 0-1 | 148 | checkmate | 36.9 | 2 | ply 142 Kd5 (−607, best Kd5, endgame) | Italian Game |
| 13 | 1900 | white | 1-0 | 71 | checkmate | 70.4 | 1 | ply 69 Ng5 (−1370, best d7, endgame) | Ruy Lopez, Morphy Defence |
| 14 | 1900 | black | 0-1 | 76 | checkmate | 84.8 | 4 | ply 58 b5 (−1030, best Ke7, endgame) | Ruy Lopez, Morphy Defence |
| 15 | 2000 | white | 0-1 | 132 | checkmate | 52.1 | 6 | ply 45 Nxc5 (−364, best Kf1, middlegame) | Ruy Lopez, Morphy Defence |
| 16 | 2000 | black | 1-0 | 63 | checkmate | 56.1 | 2 | ply 28 gxf6 (−385, best Qd6, middlegame) | Ruy Lopez, Morphy Defence |
| 17 | 2100 | white | 1-0 | 71 | checkmate | 60.2 | 4 | ply 31 Rad1 (−280, best d5, middlegame) | Ruy Lopez, Morphy Defence |
| 18 | 2100 | black | 0-1 | 84 | checkmate | 32.4 | 1 | ply 76 Qd6 (−671, best Kc8, endgame) | Ruy Lopez, Morphy Defence |
| 19 | 1900 | white | 1-0 | 106 | checkmate | 23.5 | 1 | ply 82 f5 (−255, best b5, endgame) | Scotch Game |
| 20 | 1900 | black | 0-1 | 43 | checkmate | 20.9 | 0 | ply 21 Qf4 (−163, best a5, middlegame) | Scotch Game |
| 21 | 2000 | white | 1-0 | 108 | checkmate | 38.0 | 2 | ply 102 Qxg2 (−1031, best Qxg2, endgame) | Scotch Game |
| 22 | 2000 | black | 0-1 | 43 | checkmate | 53.6 | 1 | ply 39 Rxc4 (−432, best Qd3+, middlegame) | Scotch Game |
| 23 | 2100 | white | 1/2-1/2 | 227 | insufficient material | 13.5 | 0 | ply 52 Bf2 (−128, best Bf4, endgame) | Scotch Game |
| 24 | 2100 | black | 0-1 | 277 | checkmate | 10.2 | 0 | ply 41 Bxb3 (−136, best Bc4, endgame) | Scotch Game |
| 25 | 1900 | white | 1-0 | 91 | checkmate | 25.6 | 0 | ply 47 Kd2 (−168, best a4, endgame) | Petroff Defence |
| 26 | 1900 | black | 1/2-1/2 | 112 | threefold repetition | 44.2 | 1 | ply 12 Qf6 (−254, best Bd7, opening) | Petroff Defence |
| 27 | 2000 | white | 1/2-1/2 | 135 | threefold repetition | 38.3 | 3 | ply 59 Nfe2 (−219, best Ng6, middlegame) | Petroff Defence |
| 28 | 2000 | black | 0-1 | 50 | checkmate | 16.6 | 0 | ply 22 Bh4 (−136, best Qg6, middlegame) | Petroff Defence |
| 29 | 2100 | white | 1/2-1/2 | 135 | threefold repetition | 61.4 | 7 | ply 71 f3 (−382, best b6, middlegame) | Petroff Defence |
| 30 | 2100 | black | 0-1 | 46 | checkmate | 16.4 | 0 | ply 32 Bd6 (−137, best Nc2, middlegame) | Petroff Defence |

## Worst engine moves (all games)

- game 13 @1900 (white, 1-0) ply 69 **Ng5** lost 1370 cp, best d7, endgame, depth 6, 0.002s, engine's own eval None  
  `1r5k/2N3R1/2pPN3/8/3B4/5b2/PPP2P1P/6K1 w - - 7 35`
- game 9 @2000 (white, 1-0) ply 45 **Nd4** lost 1082 cp, best f6, endgame, depth 8, 0.0787s, engine's own eval None  
  `4k3/1pR5/3P3p/1N3Pp1/4p3/3P1P2/P4P1P/6K1 w - - 0 23`
- game 21 @2000 (white, 1-0) ply 102 **Qxg2** lost 1031 cp, best Qxg2, endgame, depth 10, 0.1148s, engine's own eval None  
  `8/3P2pk/5p2/5P1P/P7/7r/6r1/3R1KQ1 w - - 1 52`
- game 14 @1900 (black, 0-1) ply 58 **b5** lost 1030 cp, best Ke7, endgame, depth 9, 0.2361s, engine's own eval 1278  
  `5k2/1pp4p/p7/2pb1r2/8/6KP/2P5/8 b - - 1 29`
- game 6 @2100 (black, 0-1) ply 72 **b1=Q** lost 908 cp, best Rf1+, endgame, depth 8, 0.0574s, engine's own eval None  
  `6k1/5ppp/p7/1b6/4pP2/P3P3/1p3K1P/4r3 b - - 1 36`
- game 14 @1900 (black, 0-1) ply 66 **b4** lost 905 cp, best a5, endgame, depth 10, 0.1975s, engine's own eval 2179  
  `5k2/2p4p/p7/1ppb3P/2r5/6K1/8/8 b - - 0 33`
- game 11 @2100 (white, 1-0) ply 83 **Qxc1** lost 832 cp, best Qxc1, endgame, depth 10, 0.2003s, engine's own eval None  
  `8/4R1pk/7p/8/2p5/1P6/P1P2P2/2qQK3 w - - 0 42`
- game 18 @2100 (black, 0-1) ply 76 **Qd6** lost 671 cp, best Kc8, endgame, depth 11, 0.1451s, engine's own eval None  
  `3k4/2p3p1/p1q4p/6p1/2PQ2P1/p2p1P1b/P2r4/7K b - - 3 38`
- game 12 @2100 (black, 0-1) ply 142 **Kd5** lost 607 cp, best Kd5, endgame, depth 13, 0.1865s, engine's own eval None  
  `8/8/R2k4/7p/2R4P/2prn1p1/8/6K1 b - - 7 71`
- game 4 @2000 (black, 1-0) ply 40 **Qxf6** lost 600 cp, best gxf6, middlegame, depth 8, 0.2364s, engine's own eval 482  
  `r3r1k1/ppp2pp1/1b1p1Pb1/4q3/2P5/2N2P2/PP1Q1PKR/R7 b - - 2 20`
- game 4 @2000 (black, 1-0) ply 98 **Ree8** lost 584 cp, best Rce8, endgame, depth 11, 0.1857s, engine's own eval -137  
  `2r3k1/2b2p2/ppQp1P2/4r3/1PP5/6N1/6K1/8 b - - 0 49`
- game 5 @2100 (white, 0-1) ply 37 **hxg4** lost 584 cp, best e4, middlegame, depth 8, 0.2359s, engine's own eval 591  
  `Q1nk3r/1pp4p/2q5/3p4/6p1/4P2P/PPP2KP1/R1B1R3 w - - 0 19`

Annotated PGNs with `[%eval]` and best moves: `analysis/03fdcdc/game_NN.pgn`.
