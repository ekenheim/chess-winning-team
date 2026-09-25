# Analysis of `36032fd`

elo **1887.1** ±131.1 · W/D/L 17/3/10 · target 1800 · wins@target 7 · 0.25s/move · avg depth 8.0 · 3696336 nps · host windows-amd64-Regenr

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 28.7 | 3 | 16 | 6.4 | 0.19s |
| middlegame | 496 | 61.1 | 35 | 59 | 7.1 | 0.18s |
| endgame | 737 | 38.5 | 34 | 45 | 9.2 | 0.17s |

## Where results were decided

- Losses: 10; the worst engine blunder fell in: middlegame ×9, opening ×1
- Draws: 3; 2 of them were ≥ +1.5 for the engine at some point (wins slipped: game 21, game 24)
- Draw terminations: threefold repetition ×2, insufficient material ×1
- Losses from a winning position (≥ +1.5 at some point): 5 (game 1, game 2, game 12, game 17, game 25)
- Wins: 17 (game 4 @1800, game 5 @1900, game 6 @1900, game 7 @1700, game 8 @1700, game 10 @1800, game 13 @1700, game 14 @1700, game 15 @1800, game 16 @1800, game 19 @1700, game 22 @1800, game 23 @1900, game 26 @1700, game 27 @1800, game 28 @1800, game 29 @1900)

## Time and depth

- Engine used on average 0.178s of 0.25s per move (71%); max 0.244s; 14 moves within 3% of the limit.
- Depth: avg 8.0, min 2, max 127. Blunders at depth ≤ 8: 42 of 72.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1700 | white | 0-1 | 112 | checkmate | 53.9 | 4 | ply 87 Qxd5 (−837, best Qd7+, middlegame) | Start position |
| 2 | 1700 | black | 1-0 | 71 | checkmate | 50.4 | 3 | ply 42 Kg5 (−649, best Ke7, middlegame) | Start position |
| 3 | 1800 | white | 0-1 | 44 | checkmate | 59.7 | 2 | ply 29 Nxc6 (−614, best f3, middlegame) | Start position |
| 4 | 1800 | black | 0-1 | 118 | checkmate | 45.4 | 5 | ply 58 g6 (−327, best Ra3+, endgame) | Start position |
| 5 | 1900 | white | 1-0 | 165 | checkmate | 20.9 | 1 | ply 143 Bg3 (−264, best h5, endgame) | Start position |
| 6 | 1900 | black | 0-1 | 110 | checkmate | 32.9 | 2 | ply 58 Kb6 (−259, best Nd3, middlegame) | Start position |
| 7 | 1700 | white | 1-0 | 83 | checkmate | 65.1 | 4 | ply 73 Qxd6 (−545, best Qxg7+, endgame) | Italian Game |
| 8 | 1700 | black | 0-1 | 56 | checkmate | 28.5 | 1 | ply 16 Nxc3 (−272, best Qd7, opening) | Italian Game |
| 9 | 1800 | white | 0-1 | 58 | checkmate | 45.8 | 1 | ply 43 Rfe1 (−691, best Ne2, middlegame) | Italian Game |
| 10 | 1800 | black | 0-1 | 46 | checkmate | 22.8 | 0 | ply 10 Bxf2+ (−158, best Nf4, opening) | Italian Game |
| 11 | 1900 | white | 0-1 | 98 | checkmate | 41.2 | 0 | ply 81 Kh1 (−190, best Nf3, middlegame) | Italian Game |
| 12 | 1900 | black | 1-0 | 35 | checkmate | 85.4 | 1 | ply 30 Bxb3 (−1187, best Qc7, middlegame) | Italian Game |
| 13 | 1700 | white | 1-0 | 63 | checkmate | 46.5 | 2 | ply 25 exd6 (−497, best Bf2, middlegame) | Ruy Lopez, Morphy Defence |
| 14 | 1700 | black | 0-1 | 56 | checkmate | 43.8 | 1 | ply 50 Kf7 (−806, best Rae8, endgame) | Ruy Lopez, Morphy Defence |
| 15 | 1800 | white | 1-0 | 75 | checkmate | 26.3 | 0 | ply 17 Qf3 (−149, best f4, opening) | Ruy Lopez, Morphy Defence |
| 16 | 1800 | black | 0-1 | 194 | checkmate | 52.7 | 6 | ply 40 Kg8 (−377, best Be7, middlegame) | Ruy Lopez, Morphy Defence |
| 17 | 1900 | white | 0-1 | 90 | checkmate | 63.1 | 3 | ply 33 Qe3 (−607, best e6, middlegame) | Ruy Lopez, Morphy Defence |
| 18 | 1900 | black | 1-0 | 169 | checkmate | 37.8 | 3 | ply 8 Nf6 (−490, best f6, opening) | Ruy Lopez, Morphy Defence |
| 19 | 1700 | white | 1-0 | 132 | checkmate | 54.0 | 6 | ply 42 g3 (−451, best c4, middlegame) | Scotch Game |
| 20 | 1700 | black | 1/2-1/2 | 225 | threefold repetition | 58.0 | 6 | ply 175 Kd3 (−2000, best c4, endgame) | Scotch Game |
| 21 | 1800 | white | 1/2-1/2 | 146 | threefold repetition | 54.6 | 4 | ply 28 Qxg7 (−796, best f5, middlegame) | Scotch Game |
| 22 | 1800 | black | 0-1 | 111 | checkmate | 13.9 | 0 | ply 5 Bxd4 (−110, best Nxd4, opening) | Scotch Game |
| 23 | 1900 | white | 1-0 | 102 | checkmate | 45.8 | 4 | ply 94 a7 (−734, best c7, endgame) | Scotch Game |
| 24 | 1900 | black | 1/2-1/2 | 215 | insufficient material | 22.6 | 3 | ply 31 Rf7 (−287, best Qh6, middlegame) | Scotch Game |
| 25 | 1700 | white | 0-1 | 58 | checkmate | 90.5 | 4 | ply 45 Kb2 (−890, best Qf7, middlegame) | Petroff Defence |
| 26 | 1700 | black | 0-1 | 48 | checkmate | 81.3 | 1 | ply 44 Qxc1+ (−1443, best Qxc1+, endgame) | Petroff Defence |
| 27 | 1800 | white | 1-0 | 69 | checkmate | 56.8 | 2 | ply 61 Nxd6 (−464, best Nd8, endgame) | Petroff Defence |
| 28 | 1800 | black | 0-1 | 120 | checkmate | 37.1 | 1 | ply 80 Bb7 (−534, best Nfe4, endgame) | Petroff Defence |
| 29 | 1900 | white | 1-0 | 137 | checkmate | 26.5 | 1 | ply 33 c3 (−441, best Rxe7+, middlegame) | Petroff Defence |
| 30 | 1900 | black | 1-0 | 55 | checkmate | 37.1 | 1 | ply 36 f6 (−612, best Bd6, middlegame) | Petroff Defence |

## Worst engine moves (all games)

- game 20 @1700 (black, 1/2-1/2) ply 175 **Kd3** lost 2000 cp, best c4, endgame, depth 33, 0.1204s, engine's own eval 0  
  `8/8/3K4/2pB4/3k4/1P6/8/8 b - - 18 88`
- game 26 @1700 (black, 0-1) ply 44 **Qxc1+** lost 1443 cp, best Qxc1+, endgame, depth 7, 0.2364s, engine's own eval 2773  
  `5b1r/p1pk1ppp/3p4/3p4/P5n1/4P3/2q5/2B1K3 b - - 0 22`
- game 12 @1900 (black, 1-0) ply 30 **Bxb3** lost 1187 cp, best Qc7, middlegame, depth 6, 0.2358s, engine's own eval 389  
  `r4k1r/pp3ppp/4b3/2p5/3p1q2/1R3N2/P1P1QPPP/4R1K1 b - - 3 15`
- game 20 @1700 (black, 1/2-1/2) ply 179 **Kf4** lost 997 cp, best Kf4, endgame, depth 12, 0.1309s, engine's own eval -1242  
  `6B1/8/8/2K5/8/1P2k3/8/8 b - - 2 90`
- game 25 @1700 (white, 0-1) ply 45 **Kb2** lost 890 cp, best Qf7, middlegame, depth 7, 0.1438s, engine's own eval 603  
  `r3r3/1kpq4/3p3N/1p1P3Q/2P5/P3B3/n1K2PPP/5B1R w - - 2 23`
- game 1 @1700 (white, 0-1) ply 87 **Qxd5** lost 837 cp, best Qd7+, middlegame, depth 7, 0.1536s, engine's own eval 690  
  `6r1/6k1/p3Q3/1p1pP2b/4nPpq/PP6/2P1N2N/3RR1K1 w - - 1 44`
- game 14 @1700 (black, 0-1) ply 50 **Kf7** lost 806 cp, best Rae8, endgame, depth 8, 0.2004s, engine's own eval 1880  
  `r5k1/2p3p1/pbp1r3/5pp1/8/5PPK/P7/8 b - - 1 25`
- game 21 @1800 (white, 1/2-1/2) ply 28 **Qxg7** lost 796 cp, best f5, middlegame, depth 6, 0.2267s, engine's own eval 406  
  `r1bk3r/2p1bQp1/2pp2n1/7q/4PP2/1BN1B2P/P1P3P1/R4RK1 w - - 1 15`
- game 23 @1900 (white, 1-0) ply 94 **a7** lost 734 cp, best c7, endgame, depth 12, 0.1181s, engine's own eval 2645  
  `8/4k3/P1P5/7P/4K3/8/8/8 w - - 1 48`
- game 9 @1800 (white, 0-1) ply 43 **Rfe1** lost 691 cp, best Ne2, middlegame, depth 6, 0.236s, engine's own eval 143  
  `4rr2/4qnkp/2p1p1p1/Q2pP3/6n1/2NN4/PPP3PP/R4R1K w - - 1 22`
- game 2 @1700 (black, 1-0) ply 42 **Kg5** lost 649 cp, best Ke7, middlegame, depth 7, 0.1461s, engine's own eval 326  
  `r1b1rq2/1p1p1p1p/2p2k2/p1bB4/8/PQ3R2/5PPP/5RK1 b - - 3 21`
- game 3 @1800 (white, 0-1) ply 29 **Nxc6** lost 614 cp, best f3, middlegame, depth 7, 0.1086s, engine's own eval 456  
  `2rqk2r/Bp3pp1/2n1p1p1/3pP1n1/Qb1N4/2N5/PPP2PPP/R4RK1 w k - 3 15`

Annotated PGNs with `[%eval]` and best moves: `analysis/36032fd/game_NN.pgn`.
