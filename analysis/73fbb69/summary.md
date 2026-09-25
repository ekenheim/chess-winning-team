# Analysis of `73fbb69`

elo **2092.2** ±169.3 · W/D/L 24/2/4 · target 1800 · wins@target 7 · 0.25s/move · avg depth 10.4 · 3771661 nps · host windows-amd64-Regenr

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 20.9 | 1 | 9 | 9.7 | 0.17s |
| middlegame | 601 | 51.5 | 31 | 57 | 9.5 | 0.16s |
| endgame | 566 | 32.0 | 19 | 23 | 11.7 | 0.15s |

## Where results were decided

- Losses: 4; the worst engine blunder fell in: endgame ×2, middlegame ×2
- Draws: 2; 1 of them were ≥ +1.5 for the engine at some point (wins slipped: game 23)
- Draw terminations: threefold repetition ×2
- Losses from a winning position (≥ +1.5 at some point): 2 (game 2, game 10)
- Wins: 24 (game 1 @1700, game 3 @1800, game 4 @1800, game 5 @1900, game 6 @1900, game 7 @1700, game 8 @1700, game 9 @1800, game 11 @1900, game 13 @1700, game 14 @1700, game 17 @1900, game 18 @1900, game 19 @1700, game 20 @1700, game 21 @1800, game 22 @1800, game 24 @1900, game 25 @1700, game 26 @1700, game 27 @1800, game 28 @1800, game 29 @1900, game 30 @1900)

## Time and depth

- Engine used on average 0.158s of 0.25s per move (63%); max 0.254s; 1 moves within 3% of the limit.
- Depth: avg 10.4, min 2, max 127. Blunders at depth ≤ 10: 42 of 51.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1700 | white | 1-0 | 97 | checkmate | 49.0 | 2 | ply 91 Rxf7+ (−536, best h5, endgame) | Start position |
| 2 | 1700 | black | 1-0 | 139 | checkmate | 66.5 | 7 | ply 60 g6 (−529, best Ke7, middlegame) | Start position |
| 3 | 1800 | white | 1-0 | 113 | checkmate | 37.9 | 2 | ply 109 Kc5 (−462, best Kc5, endgame) | Start position |
| 4 | 1800 | black | 0-1 | 54 | checkmate | 50.8 | 3 | ply 52 Bd7 (−398, best Qxf6, endgame) | Start position |
| 5 | 1900 | white | 1-0 | 69 | checkmate | 21.7 | 0 | ply 25 d5 (−98, best Qe2, middlegame) | Start position |
| 6 | 1900 | black | 0-1 | 190 | checkmate | 35.0 | 4 | ply 32 Qe6 (−349, best Bxf3, middlegame) | Start position |
| 7 | 1700 | white | 1-0 | 81 | checkmate | 39.4 | 2 | ply 73 Kf2 (−652, best e7, endgame) | Italian Game |
| 8 | 1700 | black | 0-1 | 42 | checkmate | 22.7 | 0 | ply 18 Nxb2 (−71, best Bxa3, opening) | Italian Game |
| 9 | 1800 | white | 1-0 | 67 | checkmate | 102.4 | 2 | ply 61 Qxf7+ (−1793, best Qxf7+, middlegame) | Italian Game |
| 10 | 1800 | black | 1-0 | 175 | checkmate | 27.6 | 2 | ply 24 Nxb2 (−474, best a6, middlegame) | Italian Game |
| 11 | 1900 | white | 1-0 | 153 | checkmate | 26.6 | 2 | ply 145 Rd6+ (−853, best Ra7, endgame) | Italian Game |
| 12 | 1900 | black | 1/2-1/2 | 162 | threefold repetition | 44.0 | 6 | ply 80 Rb1+ (−362, best Qd1+, middlegame) | Italian Game |
| 13 | 1700 | white | 1-0 | 69 | checkmate | 43.8 | 3 | ply 23 Qc1 (−369, best Bd4, middlegame) | Ruy Lopez, Morphy Defence |
| 14 | 1700 | black | 0-1 | 20 | checkmate | 8.7 | 0 | ply 18 fxg2+ (−52, best fxg2+, opening) | Ruy Lopez, Morphy Defence |
| 15 | 1800 | white | 0-1 | 96 | checkmate | 42.9 | 3 | ply 85 a5 (−362, best Rb8+, endgame) | Ruy Lopez, Morphy Defence |
| 16 | 1800 | black | 1-0 | 177 | checkmate | 50.2 | 3 | ply 164 Ke8 (−287, best Ke8, endgame) | Ruy Lopez, Morphy Defence |
| 17 | 1900 | white | 1-0 | 85 | checkmate | 28.8 | 2 | ply 61 Re3 (−236, best b4, middlegame) | Ruy Lopez, Morphy Defence |
| 18 | 1900 | black | 0-1 | 98 | checkmate | 32.0 | 1 | ply 74 exf4 (−411, best a3, endgame) | Ruy Lopez, Morphy Defence |
| 19 | 1700 | white | 1-0 | 142 | checkmate | 29.6 | 1 | ply 134 dxc5 (−452, best Qxc5+, endgame) | Scotch Game |
| 20 | 1700 | black | 0-1 | 59 | checkmate | 28.9 | 0 | ply 13 d4 (−199, best c4, opening) | Scotch Game |
| 21 | 1800 | white | 1-0 | 124 | checkmate | 20.5 | 1 | ply 82 Kc4 (−228, best Ke2, endgame) | Scotch Game |
| 22 | 1800 | black | 0-1 | 57 | checkmate | 25.3 | 0 | ply 35 Ra6 (−179, best Rg8, middlegame) | Scotch Game |
| 23 | 1900 | white | 1/2-1/2 | 128 | threefold repetition | 48.2 | 1 | ply 56 b4 (−266, best a4, middlegame) | Scotch Game |
| 24 | 1900 | black | 0-1 | 91 | checkmate | 66.2 | 2 | ply 79 b5+ (−1455, best b5+, middlegame) | Scotch Game |
| 25 | 1700 | white | 1-0 | 67 | checkmate | 22.0 | 0 | ply 53 Bxf6+ (−134, best Rxh6, middlegame) | Petroff Defence |
| 26 | 1700 | black | 0-1 | 74 | checkmate | 54.0 | 1 | ply 68 Re7 (−1020, best Re7, middlegame) | Petroff Defence |
| 27 | 1800 | white | 1-0 | 103 | checkmate | 13.5 | 0 | ply 25 Nxc7 (−191, best h3, middlegame) | Petroff Defence |
| 28 | 1800 | black | 0-1 | 52 | checkmate | 15.1 | 0 | ply 10 Ng3 (−113, best Nc3, opening) | Petroff Defence |
| 29 | 1900 | white | 1-0 | 77 | checkmate | 19.2 | 1 | ply 57 Rxc7 (−223, best Rf6, endgame) | Petroff Defence |
| 30 | 1900 | black | 0-1 | 62 | checkmate | 17.5 | 0 | ply 46 f4 (−67, best Re2, endgame) | Petroff Defence |

## Worst engine moves (all games)

- game 9 @1800 (white, 1-0) ply 61 **Qxf7+** lost 1793 cp, best Qxf7+, middlegame, depth 8, 0.0008s, engine's own eval None  
  `4Q3/2p2r1k/2N4p/p3P3/2P2B2/6P1/PPq5/R5K1 w - - 0 31`
- game 24 @1900 (black, 0-1) ply 79 **b5+** lost 1455 cp, best b5+, middlegame, depth 9, 0.197s, engine's own eval None  
  `2r3r1/1p5k/2p5/p7/2K1P1R1/1P2Qp1p/Pq3N1P/6R1 b - - 0 40`
- game 26 @1700 (black, 0-1) ply 68 **Re7** lost 1020 cp, best Re7, middlegame, depth 10, 0.2359s, engine's own eval None  
  `4r3/2pk2Q1/p1pr4/6p1/5p2/3p3P/3P1qP1/7K b - - 1 34`
- game 11 @1900 (white, 1-0) ply 145 **Rd6+** lost 853 cp, best Ra7, endgame, depth 11, 0.2234s, engine's own eval None  
  `8/3R4/2k5/4pP1p/4N2P/6P1/3K4/8 w - - 5 73`
- game 7 @1700 (white, 1-0) ply 73 **Kf2** lost 652 cp, best e7, endgame, depth 12, 0.1856s, engine's own eval 1440  
  `6k1/1R6/2p1P3/7B/PP1P4/8/6KP/2r5 w - - 1 37`
- game 9 @1800 (white, 1-0) ply 59 **Rxh6+** lost 643 cp, best Rxh6+, middlegame, depth 9, 0.2359s, engine's own eval None  
  `4Q3/2p2rpk/2N4p/p3P3/2P2B2/6PR/PPq5/R5K1 w - - 2 30`
- game 1 @1700 (white, 1-0) ply 91 **Rxf7+** lost 536 cp, best h5, endgame, depth 8, 0.0068s, engine's own eval None  
  `8/5p1k/4pRp1/p3P1P1/Pp1K3P/6P1/2P5/1R6 w - - 5 46`
- game 2 @1700 (black, 1-0) ply 60 **g6** lost 529 cp, best Ke7, middlegame, depth 9, 0.2358s, engine's own eval 208  
  `r1b2r2/pp3kp1/4pb2/2p4Q/P1p2P2/1qN1P3/3BK3/R6R b - - 7 30`
- game 24 @1900 (black, 0-1) ply 69 **Kh7** lost 486 cp, best Rf6, middlegame, depth 9, 0.2361s, engine's own eval 25  
  `2r2rk1/1p4q1/2pp4/p7/2P1P1b1/1PNKQpRp/P6P/5R2 b - - 1 35`
- game 2 @1700 (black, 1-0) ply 84 **Kf8** lost 476 cp, best Kf8, middlegame, depth 9, 0.1791s, engine's own eval None  
  `4r1r1/pp1b1kb1/6Q1/2p1Pp2/P1p5/2N5/3B4/4K1R1 b - - 1 42`
- game 10 @1800 (black, 1-0) ply 24 **Nxb2** lost 474 cp, best a6, middlegame, depth 10, 0.1591s, engine's own eval 241  
  `r1bq1rk1/pp3ppp/8/3p4/B1p1p3/N1Pn4/PP1PN1PP/R1B2QK1 b - - 1 12`
- game 3 @1800 (white, 1-0) ply 109 **Kc5** lost 462 cp, best Kc5, endgame, depth 8, 0.0014s, engine's own eval None  
  `6R1/kp2p3/2p1N3/P4p1p/PPKP3P/8/8/8 w - - 2 55`

Annotated PGNs with `[%eval]` and best moves: `analysis/73fbb69/game_NN.pgn`.
