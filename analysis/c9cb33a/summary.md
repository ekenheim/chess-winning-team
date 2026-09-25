# Analysis of `c9cb33a`

elo **2400.4** ±146.4 · W/D/L 21/3/6 · target 2200 · wins@target 8 · 0.25s/move · avg depth 10.8 · 2981514 nps · host windows-amd64-Regenr

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 26.0 | 2 | 8 | 9.5 | 0.21s |
| middlegame | 681 | 41.2 | 23 | 59 | 10.3 | 0.21s |
| endgame | 553 | 40.7 | 22 | 17 | 12.3 | 0.19s |

## Where results were decided

- Losses: 6; the worst engine blunder fell in: endgame ×2, middlegame ×3, opening ×1
- Draws: 3; 2 of them were ≥ +1.5 for the engine at some point (wins slipped: game 5, game 25)
- Draw terminations: threefold repetition ×2, insufficient material ×1
- Losses from a winning position (≥ +1.5 at some point): 2 (game 22, game 24)
- Wins: 21 (game 1 @2100, game 2 @2100, game 3 @2200, game 4 @2200, game 7 @2100, game 8 @2100, game 9 @2200, game 10 @2200, game 11 @2300, game 12 @2300, game 14 @2100, game 16 @2200, game 19 @2100, game 20 @2100, game 21 @2200, game 23 @2300, game 26 @2100, game 27 @2200, game 28 @2200, game 29 @2300, game 30 @2300)

## Time and depth

- Engine used on average 0.201s of 0.25s per move (81%); max 0.241s; 0 moves within 3% of the limit.
- Depth: avg 10.8, min 2, max 127. Blunders at depth ≤ 11: 32 of 47.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2100 | white | 1-0 | 61 | checkmate | 11.3 | 0 | ply 21 Qf3 (−144, best Rad1, middlegame) | Start position |
| 2 | 2100 | black | 0-1 | 56 | checkmate | 9.1 | 0 | ply 46 a4 (−99, best O-O, middlegame) | Start position |
| 3 | 2200 | white | 1-0 | 63 | checkmate | 25.2 | 1 | ply 55 Be2+ (−404, best Be2+, endgame) | Start position |
| 4 | 2200 | black | 0-1 | 176 | checkmate | 33.4 | 2 | ply 40 Nxc3 (−316, best Qc8, middlegame) | Start position |
| 5 | 2300 | white | 1/2-1/2 | 134 | threefold repetition | 30.9 | 2 | ply 45 Qxg6 (−481, best Rfe1, middlegame) | Start position |
| 6 | 2300 | black | 1-0 | 81 | checkmate | 64.5 | 3 | ply 60 a5 (−757, best Kh8, middlegame) | Start position |
| 7 | 2100 | white | 1-0 | 85 | checkmate | 34.5 | 1 | ply 77 Qf4+ (−654, best Qh4, middlegame) | Italian Game |
| 8 | 2100 | black | 0-1 | 66 | checkmate | 76.2 | 2 | ply 58 Be7+ (−1653, best Be7+, endgame) | Italian Game |
| 9 | 2200 | white | 1-0 | 93 | checkmate | 43.4 | 2 | ply 85 b7 (−862, best b7, endgame) | Italian Game |
| 10 | 2200 | black | 0-1 | 36 | checkmate | 17.9 | 0 | ply 16 Qe7 (−84, best a5, opening) | Italian Game |
| 11 | 2300 | white | 1-0 | 127 | checkmate | 31.0 | 1 | ply 117 Nd7 (−881, best Ke2, endgame) | Italian Game |
| 12 | 2300 | black | 0-1 | 68 | checkmate | 34.2 | 1 | ply 42 f5 (−210, best Be5, middlegame) | Italian Game |
| 13 | 2100 | white | 0-1 | 24 | checkmate | 143.0 | 1 | ply 15 Ne1 (−1610, best Re1, opening) | Ruy Lopez, Morphy Defence |
| 14 | 2100 | black | 0-1 | 76 | checkmate | 14.1 | 0 | ply 46 Qc5 (−65, best e4, middlegame) | Ruy Lopez, Morphy Defence |
| 15 | 2200 | white | 1/2-1/2 | 229 | threefold repetition | 62.3 | 4 | ply 207 Kxb2 (−2000, best Kxb2, endgame) | Ruy Lopez, Morphy Defence |
| 16 | 2200 | black | 0-1 | 192 | checkmate | 21.5 | 2 | ply 162 Re4 (−433, best Kg5, endgame) | Ruy Lopez, Morphy Defence |
| 17 | 2300 | white | 0-1 | 76 | checkmate | 52.5 | 4 | ply 41 gxf3 (−431, best Qc4+, middlegame) | Ruy Lopez, Morphy Defence |
| 18 | 2300 | black | 1-0 | 79 | checkmate | 48.7 | 3 | ply 42 Kh7 (−263, best fxe5, middlegame) | Ruy Lopez, Morphy Defence |
| 19 | 2100 | white | 1-0 | 108 | checkmate | 26.1 | 1 | ply 18 a3 (−285, best f4, opening) | Scotch Game |
| 20 | 2100 | black | 0-1 | 109 | checkmate | 59.0 | 3 | ply 77 Rd3+ (−926, best Rxc1, endgame) | Scotch Game |
| 21 | 2200 | white | 1-0 | 118 | checkmate | 19.0 | 0 | ply 74 R4f2 (−193, best Rh4, endgame) | Scotch Game |
| 22 | 2200 | black | 1-0 | 120 | checkmate | 53.2 | 3 | ply 65 Kg6 (−290, best Be7, endgame) | Scotch Game |
| 23 | 2300 | white | 1-0 | 102 | checkmate | 25.8 | 0 | ply 18 h4 (−126, best Rad1, opening) | Scotch Game |
| 24 | 2300 | black | 1-0 | 210 | checkmate | 50.5 | 4 | ply 175 Ke4 (−2000, best Kc5, endgame) | Scotch Game |
| 25 | 2100 | white | 1/2-1/2 | 117 | insufficient material | 15.8 | 1 | ply 109 Bd5 (−450, best Bf5, endgame) | Petroff Defence |
| 26 | 2100 | black | 0-1 | 60 | checkmate | 77.1 | 1 | ply 54 Qxc1 (−1496, best Qxc1, middlegame) | Petroff Defence |
| 27 | 2200 | white | 1-0 | 129 | checkmate | 31.9 | 2 | ply 73 Rxe8 (−582, best Nb3, middlegame) | Petroff Defence |
| 28 | 2200 | black | 0-1 | 90 | checkmate | 31.1 | 2 | ply 78 Re6+ (−314, best Re6+, endgame) | Petroff Defence |
| 29 | 2300 | white | 1-0 | 61 | checkmate | 17.7 | 0 | ply 45 Bxa8 (−104, best Ba3, middlegame) | Petroff Defence |
| 30 | 2300 | black | 0-1 | 114 | checkmate | 29.3 | 1 | ply 102 Qg1+ (−347, best Qg1+, endgame) | Petroff Defence |

## Worst engine moves (all games)

- game 15 @2200 (white, 1/2-1/2) ply 207 **Kxb2** lost 2000 cp, best Kxb2, endgame, depth 14, 0.2364s, engine's own eval -717  
  `8/8/kp6/2p5/2P5/1KP5/1q6/4r3 w - - 0 104`
- game 24 @2300 (black, 1-0) ply 175 **Ke4** lost 2000 cp, best Kc5, endgame, depth 127, 0.0107s, engine's own eval 0  
  `8/6P1/5K2/8/3k4/8/8/8 b - - 4 88`
- game 8 @2100 (black, 0-1) ply 58 **Be7+** lost 1653 cp, best Be7+, endgame, depth 7, 0.2358s, engine's own eval None  
  `r3rk2/ppp2p2/5K1R/8/5p2/b3n3/2p3P1/8 b - - 1 29`
- game 13 @2100 (white, 0-1) ply 15 **Ne1** lost 1610 cp, best Re1, opening, depth 10, 0.2362s, engine's own eval 171  
  `r3k2r/1pp1npp1/p1pb1q2/4p3/4P1p1/2NPBN2/PPP2PP1/R2Q1RK1 w kq - 0 8`
- game 26 @2100 (black, 0-1) ply 54 **Qxc1** lost 1496 cp, best Qxc1, middlegame, depth 9, 0.1718s, engine's own eval None  
  `4rb1r/1ppk1ppp/p7/2p5/5P2/P1q1N3/6K1/2B5 b - - 0 27`
- game 20 @2100 (black, 0-1) ply 77 **Rd3+** lost 926 cp, best Rxc1, endgame, depth 11, 0.2361s, engine's own eval 777  
  `7k/p2Q4/4p1p1/2P1p3/1P1p4/1K6/5r2/2Br1b2 b - - 9 39`
- game 11 @2300 (white, 1-0) ply 117 **Nd7** lost 881 cp, best Ke2, endgame, depth 13, 0.1599s, engine's own eval 1752  
  `8/8/1N3p2/1P2p3/P3P1P1/5P1k/5K2/8 w - - 2 59`
- game 9 @2200 (white, 1-0) ply 85 **b7** lost 862 cp, best b7, endgame, depth 9, 0.2359s, engine's own eval None  
  `8/7k/1P5p/6p1/3P4/1R4PP/PP3p2/5N1K w - - 0 43`
- game 15 @2200 (white, 1/2-1/2) ply 209 **Kc2** lost 851 cp, best Kb3, endgame, depth 15, 0.1552s, engine's own eval -727  
  `8/k7/1p6/2p5/2P5/2P5/1K6/4r3 w - - 1 105`
- game 20 @2100 (black, 0-1) ply 97 **d2** lost 845 cp, best d2, endgame, depth 12, 0.236s, engine's own eval None  
  `2K3k1/p2r4/r1b1p1p1/4p1B1/1P6/3p4/8/8 b - - 1 49`
- game 6 @2300 (black, 1-0) ply 60 **a5** lost 757 cp, best Kh8, middlegame, depth 8, 0.1972s, engine's own eval -126  
  `r1b2r2/1p2R1pk/p2p1p2/3Q2p1/2p2bPP/5P2/PBP5/6K1 b - - 2 30`
- game 7 @2100 (white, 1-0) ply 77 **Qf4+** lost 654 cp, best Qh4, middlegame, depth 10, 0.2364s, engine's own eval None  
  `8/q7/2p3pk/7N/1PQ5/P6P/2P2P1K/3R1R2 w - - 1 39`

Annotated PGNs with `[%eval]` and best moves: `analysis/c9cb33a/game_NN.pgn`.
