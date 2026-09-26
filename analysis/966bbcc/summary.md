# Analysis of `966bbcc`

elo **2873.2** ±135.0 · W/D/L 2/16/12 · target 3000 · wins@target 0 · 0.25s/move · avg depth 16.7 · 2116594 nps · host windows-amd64-Regenr

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 16.0 | 3 | 6 | 13.1 | 0.24s |
| middlegame | 760 | 29.5 | 11 | 50 | 14.8 | 0.23s |
| endgame | 747 | 33.9 | 19 | 28 | 20.2 | 0.23s |

## Where results were decided

- Losses: 12; the worst engine blunder fell in: endgame ×7, middlegame ×5
- Draws: 16; 2 of them were ≥ +1.5 for the engine at some point (wins slipped: game 8, game 13)
- Draw terminations: threefold repetition ×15, insufficient material ×1
- Losses from a winning position (≥ +1.5 at some point): 0 
- Wins: 2 (game 20 @2900, game 26 @2900)

## Time and depth

- Engine used on average 0.234s of 0.25s per move (94%); max 0.247s; 31 moves within 3% of the limit.
- Depth: avg 16.7, min 2, max 127. Blunders at depth ≤ 17: 22 of 33.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2900 | white | 0-1 | 168 | checkmate | 34.6 | 4 | ply 151 h7 (−473, best Ke6, endgame) | Start position |
| 2 | 2900 | black | 1/2-1/2 | 60 | threefold repetition | 39.3 | 2 | ply 24 Nxd4 (−256, best Nd8, middlegame) | Start position |
| 3 | 3000 | white | 1/2-1/2 | 137 | threefold repetition | 25.1 | 0 | ply 83 c5 (−146, best Rd7, middlegame) | Start position |
| 4 | 3000 | black | 1/2-1/2 | 78 | threefold repetition | 26.3 | 1 | ply 20 Ngxe5 (−232, best Nh6, opening) | Start position |
| 5 | 3100 | white | 0-1 | 148 | checkmate | 20.6 | 2 | ply 127 Bxc3 (−239, best Be5, endgame) | Start position |
| 6 | 3100 | black | 1/2-1/2 | 104 | threefold repetition | 22.6 | 2 | ply 38 Qxc3 (−246, best Kc8, middlegame) | Start position |
| 7 | 2900 | white | 1/2-1/2 | 125 | threefold repetition | 37.2 | 0 | ply 119 Kb3 (−166, best Kd3, middlegame) | Italian Game |
| 8 | 2900 | black | 1/2-1/2 | 87 | threefold repetition | 17.7 | 0 | ply 52 a6 (−182, best Qc6, middlegame) | Italian Game |
| 9 | 3000 | white | 0-1 | 286 | checkmate | 50.2 | 3 | ply 217 Kf3 (−2000, best Ke3, endgame) | Italian Game |
| 10 | 3000 | black | 1/2-1/2 | 120 | threefold repetition | 27.6 | 1 | ply 84 Qg3 (−407, best a3, middlegame) | Italian Game |
| 11 | 3100 | white | 0-1 | 180 | checkmate | 24.3 | 2 | ply 149 Kh2 (−277, best Qg6+, endgame) | Italian Game |
| 12 | 3100 | black | 1-0 | 91 | checkmate | 24.8 | 1 | ply 40 Nxe7 (−207, best h6, middlegame) | Italian Game |
| 13 | 2900 | white | 1/2-1/2 | 99 | threefold repetition | 26.9 | 0 | ply 79 Rg2 (−199, best b8=Q, middlegame) | Ruy Lopez, Morphy Defence |
| 14 | 2900 | black | 1-0 | 155 | checkmate | 77.2 | 3 | ply 138 Ke1 (−2000, best Kf1, endgame) | Ruy Lopez, Morphy Defence |
| 15 | 3000 | white | 1/2-1/2 | 101 | threefold repetition | 23.4 | 0 | ply 49 Re1 (−162, best Rd7, endgame) | Ruy Lopez, Morphy Defence |
| 16 | 3000 | black | 1/2-1/2 | 84 | threefold repetition | 24.0 | 0 | ply 68 Bxh6 (−141, best c5, endgame) | Ruy Lopez, Morphy Defence |
| 17 | 3100 | white | 0-1 | 82 | checkmate | 32.7 | 0 | ply 61 f3 (−185, best f3, middlegame) | Ruy Lopez, Morphy Defence |
| 18 | 3100 | black | 1-0 | 91 | checkmate | 34.4 | 1 | ply 54 Kf6 (−350, best Kf6, middlegame) | Ruy Lopez, Morphy Defence |
| 19 | 2900 | white | 1/2-1/2 | 126 | threefold repetition | 26.4 | 2 | ply 108 Bd2 (−209, best Ke3, endgame) | Scotch Game |
| 20 | 2900 | black | 0-1 | 69 | checkmate | 20.5 | 0 | ply 33 c5 (−133, best Bf5, middlegame) | Scotch Game |
| 21 | 3000 | white | 1/2-1/2 | 106 | threefold repetition | 15.6 | 0 | ply 84 Kf2 (−110, best Bb1, endgame) | Scotch Game |
| 22 | 3000 | black | 1-0 | 102 | checkmate | 34.6 | 2 | ply 79 c4 (−529, best Kxc2, endgame) | Scotch Game |
| 23 | 3100 | white | 0-1 | 157 | checkmate | 32.5 | 2 | ply 124 Kd1 (−326, best Kd1, endgame) | Scotch Game |
| 24 | 3100 | black | 1/2-1/2 | 89 | threefold repetition | 19.2 | 1 | ply 15 Nd5 (−225, best O-O, opening) | Scotch Game |
| 25 | 2900 | white | 1/2-1/2 | 151 | threefold repetition | 14.8 | 0 | ply 47 a6 (−108, best Ra4, middlegame) | Petroff Defence |
| 26 | 2900 | black | 0-1 | 102 | checkmate | 10.9 | 0 | ply 64 Kg7 (−123, best Rce6, middlegame) | Petroff Defence |
| 27 | 3000 | white | 0-1 | 166 | checkmate | 18.4 | 1 | ply 51 Nxc6 (−208, best Bc1, middlegame) | Petroff Defence |
| 28 | 3000 | black | 1/2-1/2 | 126 | threefold repetition | 30.8 | 2 | ply 96 Rg7 (−371, best Rg7, middlegame) | Petroff Defence |
| 29 | 3100 | white | 0-1 | 114 | checkmate | 26.0 | 1 | ply 65 Qc5 (−209, best Ne2, middlegame) | Petroff Defence |
| 30 | 3100 | black | 1/2-1/2 | 108 | insufficient material | 8.4 | 0 | ply 44 Kh8 (−64, best Rd8, middlegame) | Petroff Defence |

## Worst engine moves (all games)

- game 9 @3000 (white, 0-1) ply 217 **Kf3** lost 2000 cp, best Ke3, endgame, depth 21, 0.2361s, engine's own eval -1427  
  `8/8/7k/5p2/8/8/5K2/7r w - - 0 109`
- game 9 @3000 (white, 0-1) ply 221 **Kg3** lost 2000 cp, best Kf3, endgame, depth 19, 0.236s, engine's own eval -1530  
  `8/8/6k1/5p2/8/8/6K1/r7 w - - 4 111`
- game 14 @2900 (black, 1-0) ply 138 **Ke1** lost 2000 cp, best Kf1, endgame, depth 17, 0.2359s, engine's own eval None  
  `8/5P2/2K5/8/8/8/1Q2kr2/8 b - - 8 69`
- game 14 @2900 (black, 1-0) ply 134 **Kd1** lost 1883 cp, best Kd1, endgame, depth 13, 0.2361s, engine's own eval -992  
  `8/5P2/2K5/8/4Q3/8/2k2r2/8 b - - 4 67`
- game 9 @3000 (white, 0-1) ply 231 **Kc5** lost 741 cp, best Kc4, endgame, depth 19, 0.2361s, engine's own eval None  
  `8/8/8/5pk1/3K4/5r2/8/8 w - - 14 116`
- game 22 @3000 (black, 1-0) ply 79 **c4** lost 529 cp, best Kxc2, endgame, depth 11, 0.236s, engine's own eval None  
  `4R3/P7/3p4/2p2p1p/8/2k5/2P2K1P/8 b - - 0 40`
- game 14 @2900 (black, 1-0) ply 130 **Rd2+** lost 481 cp, best Kd3, endgame, depth 15, 0.2359s, engine's own eval -1007  
  `4Q3/3K1P2/8/8/8/8/2k4r/8 b - - 0 65`
- game 1 @2900 (white, 0-1) ply 151 **h7** lost 473 cp, best Ke6, endgame, depth 11, 0.2358s, engine's own eval -1894  
  `8/8/5K1P/5N1q/8/1p1k4/8/8 w - - 0 76`
- game 10 @3000 (black, 1/2-1/2) ply 84 **Qg3** lost 407 cp, best a3, middlegame, depth 12, 0.2361s, engine's own eval 56  
  `r4rk1/2p1Qp2/p5q1/4p3/p7/2PpN3/BP6/2K4R b - - 1 42`
- game 1 @2900 (white, 0-1) ply 111 **f5** lost 397 cp, best Kf3, endgame, depth 18, 0.2359s, engine's own eval 54  
  `8/1p6/pP6/1k1N4/5P2/6KP/1b6/8 w - - 1 56`
- game 28 @3000 (black, 1/2-1/2) ply 96 **Rg7** lost 371 cp, best Rg7, middlegame, depth 69, 0.2357s, engine's own eval 0  
  `4RQ2/1P5r/1rp3pk/5n1p/5P2/7P/2P3PK/8 b - - 6 48`
- game 18 @3100 (black, 1-0) ply 54 **Kf6** lost 350 cp, best Kf6, middlegame, depth 12, 0.2359s, engine's own eval -956  
  `5r2/2pQ2k1/pbnp2p1/1p2p3/4P3/1BPP4/PP1K1P2/R7 b - - 3 27`

Annotated PGNs with `[%eval]` and best moves: `analysis/966bbcc/game_NN.pgn`.
