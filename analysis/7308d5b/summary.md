# Analysis of `7308d5b`

elo **1824.5** ±128.0 · W/D/L 14/4/12 · target 1800 · wins@target 6 · 0.25s/move · avg depth 7.4 · 3970264 nps · host windows-amd64-Regenr

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 28.6 | 3 | 22 | 6.4 | 0.19s |
| middlegame | 496 | 64.9 | 41 | 48 | 7.1 | 0.18s |
| endgame | 464 | 46.8 | 24 | 20 | 8.5 | 0.17s |

## Where results were decided

- Losses: 12; the worst engine blunder fell in: endgame ×4, middlegame ×8
- Draws: 4; 2 of them were ≥ +1.5 for the engine at some point (wins slipped: game 11, game 25)
- Draw terminations: threefold repetition ×3, insufficient material ×1
- Losses from a winning position (≥ +1.5 at some point): 6 (game 2, game 3, game 6, game 8, game 19, game 29)
- Wins: 14 (game 1 @1700, game 4 @1800, game 10 @1800, game 12 @1900, game 13 @1700, game 14 @1700, game 16 @1800, game 17 @1900, game 18 @1900, game 21 @1800, game 23 @1900, game 24 @1900, game 27 @1800, game 28 @1800)

## Time and depth

- Engine used on average 0.179s of 0.25s per move (72%); max 0.245s; 4 moves within 3% of the limit.
- Depth: avg 7.4, min 2, max 127. Blunders at depth ≤ 7: 48 of 68.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1700 | white | 1-0 | 67 | checkmate | 22.4 | 0 | ply 9 d5 (−86, best dxe5, opening) | Start position |
| 2 | 1700 | black | 1-0 | 65 | checkmate | 86.9 | 6 | ply 40 Kb8 (−460, best a5, middlegame) | Start position |
| 3 | 1800 | white | 0-1 | 116 | checkmate | 36.7 | 1 | ply 105 Qe3+ (−371, best Qe3+, endgame) | Start position |
| 4 | 1800 | black | 0-1 | 54 | checkmate | 82.8 | 2 | ply 48 Bxf3 (−1265, best Bxf3, endgame) | Start position |
| 5 | 1900 | white | 1/2-1/2 | 85 | threefold repetition | 38.3 | 2 | ply 51 Rd2 (−264, best c3, endgame) | Start position |
| 6 | 1900 | black | 1-0 | 63 | checkmate | 63.8 | 1 | ply 58 Rxd2 (−1583, best Rf8, middlegame) | Start position |
| 7 | 1700 | white | 0-1 | 42 | checkmate | 96.1 | 4 | ply 23 Bf3 (−454, best Na4, middlegame) | Italian Game |
| 8 | 1700 | black | 1-0 | 67 | checkmate | 95.8 | 5 | ply 46 gxf6 (−762, best Ne5, middlegame) | Italian Game |
| 9 | 1800 | white | 0-1 | 82 | checkmate | 80.4 | 5 | ply 47 Qxa5 (−690, best Ng3, middlegame) | Italian Game |
| 10 | 1800 | black | 0-1 | 76 | checkmate | 38.7 | 1 | ply 70 a2 (−1135, best a2, endgame) | Italian Game |
| 11 | 1900 | white | 1/2-1/2 | 220 | insufficient material | 29.1 | 5 | ply 131 Rc7 (−367, best Kd3, endgame) | Italian Game |
| 12 | 1900 | black | 0-1 | 22 | checkmate | 7.6 | 0 | ply 8 Bg4 (−39, best O-O, opening) | Italian Game |
| 13 | 1700 | white | 1-0 | 51 | checkmate | 61.4 | 1 | ply 43 bxc3 (−1134, best bxc3, middlegame) | Ruy Lopez, Morphy Defence |
| 14 | 1700 | black | 0-1 | 92 | checkmate | 37.3 | 2 | ply 38 Nd4 (−391, best O-O, middlegame) | Ruy Lopez, Morphy Defence |
| 15 | 1800 | white | 0-1 | 74 | checkmate | 52.6 | 2 | ply 47 e5 (−678, best Rd4, middlegame) | Ruy Lopez, Morphy Defence |
| 16 | 1800 | black | 0-1 | 168 | checkmate | 37.2 | 2 | ply 98 Rg5 (−278, best h5, endgame) | Ruy Lopez, Morphy Defence |
| 17 | 1900 | white | 1-0 | 133 | checkmate | 23.6 | 0 | ply 29 Nxg7+ (−190, best Nxe7, middlegame) | Ruy Lopez, Morphy Defence |
| 18 | 1900 | black | 0-1 | 68 | checkmate | 27.9 | 0 | ply 28 Ke7 (−146, best Bf5, middlegame) | Ruy Lopez, Morphy Defence |
| 19 | 1700 | white | 0-1 | 63 | checkmate | 103.3 | 5 | ply 58 Rf4 (−369, best Bb8, middlegame) | Scotch Game |
| 20 | 1700 | black | 1/2-1/2 | 101 | threefold repetition | 45.3 | 3 | ply 19 Qe5 (−572, best Qc5, opening) | Scotch Game |
| 21 | 1800 | white | 1-0 | 120 | checkmate | 16.6 | 0 | ply 44 Be2 (−176, best b4, middlegame) | Scotch Game |
| 22 | 1800 | black | 1-0 | 108 | checkmate | 36.9 | 2 | ply 71 Rc5 (−637, best Ra8, endgame) | Scotch Game |
| 23 | 1900 | white | 1-0 | 84 | checkmate | 35.1 | 0 | ply 36 Bg5+ (−197, best Rhg1, middlegame) | Scotch Game |
| 24 | 1900 | black | 0-1 | 65 | checkmate | 84.6 | 4 | ply 57 Qxc1+ (−1378, best Qxc1+, endgame) | Scotch Game |
| 25 | 1700 | white | 1/2-1/2 | 49 | threefold repetition | 87.6 | 2 | ply 41 Qxd2 (−1011, best Qe4, middlegame) | Petroff Defence |
| 26 | 1700 | black | 1-0 | 91 | checkmate | 65.9 | 4 | ply 70 Bxa4 (−1354, best Ne7, endgame) | Petroff Defence |
| 27 | 1800 | white | 1-0 | 55 | checkmate | 83.2 | 2 | ply 53 Qc7 (−1146, best Qa8+, endgame) | Petroff Defence |
| 28 | 1800 | black | 0-1 | 86 | checkmate | 43.0 | 1 | ply 76 Rg1 (−1146, best Rg1, endgame) | Petroff Defence |
| 29 | 1900 | white | 0-1 | 90 | checkmate | 55.2 | 3 | ply 83 h5 (−726, best Rg1, endgame) | Petroff Defence |
| 30 | 1900 | black | 1-0 | 61 | checkmate | 73.7 | 3 | ply 48 g4 (−715, best Rge8, middlegame) | Petroff Defence |

## Worst engine moves (all games)

- game 6 @1900 (black, 1-0) ply 58 **Rxd2** lost 1583 cp, best Rf8, middlegame, depth 6, 0.2358s, engine's own eval 440  
  `3r2k1/ppp2ppp/3r4/qP6/5R2/P4P1P/Q2RBb2/5K2 b - - 1 29`
- game 24 @1900 (black, 0-1) ply 57 **Qxc1+** lost 1378 cp, best Qxc1+, endgame, depth 7, 0.2359s, engine's own eval 2825  
  `r6r/p1p1kppp/2pp4/2P2b2/2q5/5P2/P7/2B1K3 b - - 3 29`
- game 26 @1700 (black, 1-0) ply 70 **Bxa4** lost 1354 cp, best Ne7, endgame, depth 6, 0.2359s, engine's own eval -65  
  `2r3k1/2pN4/ppn1N3/3p2P1/P2P4/2P5/1Pb4K/5R2 b - - 0 35`
- game 4 @1800 (black, 0-1) ply 48 **Bxf3** lost 1265 cp, best Bxf3, endgame, depth 7, 0.2359s, engine's own eval 2535  
  `1k3b1r/1ppnpppp/6q1/2P5/p2B2b1/5P2/PP4P1/6K1 b - - 1 24`
- game 27 @1800 (white, 1-0) ply 53 **Qc7** lost 1146 cp, best Qa8+, endgame, depth 6, 0.0027s, engine's own eval None  
  `3Q3R/7p/k1p5/1p4p1/2p5/p7/PPP2PPP/5RK1 w - - 0 27`
- game 28 @1800 (black, 0-1) ply 76 **Rg1** lost 1146 cp, best Rg1, endgame, depth 7, 0.2359s, engine's own eval 2510  
  `6k1/rpp1n1pp/p7/8/5K2/8/P4pr1/3b3R b - - 1 38`
- game 10 @1800 (black, 0-1) ply 70 **a2** lost 1135 cp, best a2, endgame, depth 7, 0.2358s, engine's own eval 2570  
  `6k1/2p1r1p1/p6p/2P1p3/1P5P/p4P1K/5P1B/1r2q3 b - - 1 35`
- game 13 @1700 (white, 1-0) ply 43 **bxc3** lost 1134 cp, best bxc3, middlegame, depth 7, 0.2358s, engine's own eval 1885  
  `2r3kB/8/b1p4Q/6p1/p2P4/2n5/PPP2P1P/1K1R2R1 w - - 0 22`
- game 25 @1700 (white, 1/2-1/2) ply 41 **Qxd2** lost 1011 cp, best Qe4, middlegame, depth 6, 0.2358s, engine's own eval 1550  
  `4N2k/Bp4p1/7p/8/8/7q/PPPrQP1P/R4RK1 w - - 1 21`
- game 27 @1800 (white, 1-0) ply 51 **d8=Q** lost 842 cp, best d8=Q, endgame, depth 7, 0.2359s, engine's own eval 2170  
  `7R/3P3p/k1p5/1p4p1/p1p5/8/PPP2PPP/5RK1 w - - 1 26`
- game 8 @1700 (black, 1-0) ply 46 **gxf6** lost 762 cp, best Ne5, middlegame, depth 6, 0.2357s, engine's own eval 460  
  `3r3k/pp3pp1/2n1bN1p/8/3p3Q/1q5P/3B1PP1/R5K1 b - - 3 23`
- game 29 @1900 (white, 0-1) ply 83 **h5** lost 726 cp, best Rg1, endgame, depth 6, 0.2357s, engine's own eval 180  
  `8/2p2k2/3p1b1K/pP1Pnr2/7P/1B6/1PP1NP2/7R w - - 4 42`

Annotated PGNs with `[%eval]` and best moves: `analysis/7308d5b/game_NN.pgn`.
