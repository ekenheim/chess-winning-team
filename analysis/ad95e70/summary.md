# Analysis of `ad95e70`

elo **1914.6** ±176.4 · W/D/L 24/3/3 · target 1600 · wins@target 7 · 0.25s/move · avg depth 7.5 · 4800787 nps · host darwin-arm64-MacBook-Pro-som-tillhor-Regent.local

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 34.0 | 9 | 16 | 6.6 | 0.19s |
| middlegame | 549 | 67.6 | 45 | 45 | 7.2 | 0.18s |
| endgame | 397 | 34.1 | 11 | 23 | 8.7 | 0.15s |

## Where results were decided

- Losses: 3; the worst engine blunder fell in: middlegame ×3
- Draws: 3; 0 of them were ≥ +1.5 for the engine at some point (wins slipped: none)
- Draw terminations: threefold repetition ×3
- Losses from a winning position (≥ +1.5 at some point): 1 (game 20)
- Wins: 24 (game 2 @1500, game 3 @1600, game 4 @1600, game 5 @1700, game 6 @1700, game 7 @1500, game 8 @1500, game 9 @1600, game 10 @1600, game 11 @1700, game 12 @1700, game 13 @1500, game 14 @1500, game 15 @1600, game 17 @1700, game 18 @1700, game 19 @1500, game 23 @1700, game 24 @1700, game 25 @1500, game 27 @1600, game 28 @1600, game 29 @1700, game 30 @1700)

## Time and depth

- Engine used on average 0.176s of 0.25s per move (70%); max 0.263s; 2 moves within 3% of the limit.
- Depth: avg 7.5, min 2, max 127. Blunders at depth ≤ 8: 46 of 65.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1500 | white | 1/2-1/2 | 97 | threefold repetition | 89.2 | 6 | ply 95 Rb8 (−554, best Qf1, middlegame) | Start position |
| 2 | 1500 | black | 0-1 | 66 | checkmate | 51.9 | 1 | ply 64 g5 (−1298, best Qg2+, endgame) | Start position |
| 3 | 1600 | white | 1-0 | 67 | checkmate | 45.3 | 2 | ply 63 Bxe8 (−393, best Kf1, endgame) | Start position |
| 4 | 1600 | black | 0-1 | 116 | checkmate | 88.6 | 7 | ply 112 e1=Q (−1191, best Rxc7, middlegame) | Start position |
| 5 | 1700 | white | 1-0 | 123 | checkmate | 37.4 | 1 | ply 57 Nxe5 (−1014, best Nxg5, middlegame) | Start position |
| 6 | 1700 | black | 0-1 | 116 | checkmate | 19.1 | 1 | ply 24 Be4 (−202, best g6, middlegame) | Start position |
| 7 | 1500 | white | 1-0 | 65 | checkmate | 76.8 | 3 | ply 51 Qxc5 (−976, best Nf5, middlegame) | Italian Game |
| 8 | 1500 | black | 0-1 | 44 | checkmate | 91.6 | 1 | ply 38 f4+ (−1718, best f4+, middlegame) | Italian Game |
| 9 | 1600 | white | 1-0 | 45 | checkmate | 35.7 | 1 | ply 17 Nb3 (−210, best Qh5+, opening) | Italian Game |
| 10 | 1600 | black | 0-1 | 74 | checkmate | 22.5 | 1 | ply 20 d5 (−202, best Qd7, opening) | Italian Game |
| 11 | 1700 | white | 1-0 | 107 | checkmate | 34.2 | 2 | ply 27 Kd2 (−346, best O-O-O, middlegame) | Italian Game |
| 12 | 1700 | black | 0-1 | 88 | checkmate | 36.0 | 2 | ply 52 Qxb2 (−237, best Rhe8, middlegame) | Italian Game |
| 13 | 1500 | white | 1-0 | 43 | checkmate | 8.1 | 0 | ply 11 O-O (−35, best Be3, opening) | Ruy Lopez, Morphy Defence |
| 14 | 1500 | black | 0-1 | 60 | checkmate | 64.7 | 1 | ply 52 Rxf2 (−1387, best Rxf2, middlegame) | Ruy Lopez, Morphy Defence |
| 15 | 1600 | white | 1-0 | 65 | checkmate | 29.3 | 1 | ply 57 Rxg7 (−270, best Bxd6+, middlegame) | Ruy Lopez, Morphy Defence |
| 16 | 1600 | black | 1/2-1/2 | 44 | threefold repetition | 102.5 | 3 | ply 34 Bxe4 (−900, best Rf8, middlegame) | Ruy Lopez, Morphy Defence |
| 17 | 1700 | white | 1-0 | 69 | checkmate | 40.2 | 1 | ply 31 Kf1 (−746, best Kd2, middlegame) | Ruy Lopez, Morphy Defence |
| 18 | 1700 | black | 0-1 | 66 | checkmate | 49.7 | 1 | ply 54 Qa2+ (−857, best Qb2+, middlegame) | Ruy Lopez, Morphy Defence |
| 19 | 1500 | white | 1-0 | 36 | checkmate | 40.2 | 1 | ply 6 Nxc6 (−202, best Bxf6, opening) | Scotch Game |
| 20 | 1500 | black | 1-0 | 166 | checkmate | 64.1 | 6 | ply 31 Qa1+ (−1046, best Ke7, middlegame) | Scotch Game |
| 21 | 1600 | white | 1/2-1/2 | 124 | threefold repetition | 51.6 | 3 | ply 18 Be3 (−706, best Ke2, opening) | Scotch Game |
| 22 | 1600 | black | 1-0 | 82 | checkmate | 57.1 | 4 | ply 29 Nd3+ (−560, best Ng6, middlegame) | Scotch Game |
| 23 | 1700 | white | 1-0 | 82 | checkmate | 21.2 | 0 | ply 38 Bh5 (−152, best a4, middlegame) | Scotch Game |
| 24 | 1700 | black | 0-1 | 85 | checkmate | 73.0 | 6 | ply 55 Rgf8 (−698, best Nxh3, middlegame) | Scotch Game |
| 25 | 1500 | white | 1-0 | 61 | checkmate | 14.1 | 0 | ply 45 Rd1 (−116, best O-O-O, endgame) | Petroff Defence |
| 26 | 1500 | black | 1-0 | 221 | checkmate | 47.2 | 7 | ply 32 Bxc5 (−714, best Ka7, middlegame) | Petroff Defence |
| 27 | 1600 | white | 1-0 | 39 | checkmate | 22.0 | 0 | ply 17 Qc4+ (−126, best Nxc5, opening) | Petroff Defence |
| 28 | 1600 | black | 0-1 | 134 | checkmate | 42.8 | 2 | ply 54 Kf7 (−368, best Rd8, endgame) | Petroff Defence |
| 29 | 1700 | white | 1-0 | 55 | checkmate | 64.7 | 1 | ply 45 Kf6 (−1384, best b7, endgame) | Petroff Defence |
| 30 | 1700 | black | 0-1 | 40 | checkmate | 14.9 | 0 | ply 22 Kxe7 (−107, best Bxe7, middlegame) | Petroff Defence |

## Worst engine moves (all games)

- game 8 @1500 (black, 0-1) ply 38 **f4+** lost 1718 cp, best f4+, middlegame, depth 7, 0.1876s, engine's own eval 2435  
  `r4rk1/ppp4p/2n3p1/5p2/7Q/P3B1KP/5Pb1/4bq2 b - - 3 19`
- game 14 @1500 (black, 0-1) ply 52 **Rxf2** lost 1387 cp, best Rxf2, middlegame, depth 7, 0.2355s, engine's own eval 985  
  `r4r2/1pp1b1k1/p5q1/2p1p3/4P3/3P3b/PPPN1Q2/RN2K3 b - - 0 26`
- game 29 @1700 (white, 1-0) ply 45 **Kf6** lost 1384 cp, best b7, endgame, depth 7, 0.2356s, engine's own eval 2610  
  `5k2/7p/1P6/p2PK2b/8/2P5/P2N1PPP/1R3B1R w - - 0 23`
- game 2 @1500 (black, 0-1) ply 64 **g5** lost 1298 cp, best Qg2+, endgame, depth 4, 0.0007s, engine's own eval None  
  `r4rk1/pp3ppp/8/B7/6P1/5pK1/4q2P/8 b - - 2 32`
- game 4 @1600 (black, 0-1) ply 112 **e1=Q** lost 1191 cp, best Rxc7, middlegame, depth 8, 0.2076s, engine's own eval None  
  `2b5/1pB5/2r5/5n2/6p1/3k4/4pQ1K/r7 b - - 3 56`
- game 20 @1500 (black, 1-0) ply 31 **Qa1+** lost 1046 cp, best Ke7, middlegame, depth 6, 0.2355s, engine's own eval 365  
  `r1b1k3/1ppp1pQp/p4p2/8/8/2qB4/P1P4P/2KR4 b - - 1 16`
- game 5 @1700 (white, 1-0) ply 57 **Nxe5** lost 1014 cp, best Nxg5, middlegame, depth 6, 0.2356s, engine's own eval 495  
  `6r1/2r1kp2/p2Rp3/1p2p1bp/1P2P3/1QN2N2/P1P2qPP/3R3K w - - 5 29`
- game 7 @1500 (white, 1-0) ply 51 **Qxc5** lost 976 cp, best Nf5, middlegame, depth 7, 0.2357s, engine's own eval 1075  
  `7k/p4B2/2p2P1p/1pb1p3/3N2r1/2Q3Pq/PP3P2/3R1RK1 w - - 0 26`
- game 16 @1600 (black, 1/2-1/2) ply 34 **Bxe4** lost 900 cp, best Rf8, middlegame, depth 6, 0.2357s, engine's own eval -85  
  `1r4kr/1pp1R2p/p1p2pb1/6p1/P3Nq2/Q2P4/1PP2PPP/4R1K1 b - - 10 17`
- game 4 @1600 (black, 0-1) ply 50 **Qh1** lost 872 cp, best Bd7, middlegame, depth 7, 0.1438s, engine's own eval 1210  
  `r1b1kr2/ppp3Qp/4p3/1P1n1p2/8/4P1P1/1B3P1q/4KB2 b q - 3 25`
- game 18 @1700 (black, 0-1) ply 54 **Qa2+** lost 857 cp, best Qb2+, middlegame, depth 8, 0.1238s, engine's own eval 1740  
  `r4k1r/1b1p3p/p4p2/2p3B1/8/2P5/3K4/1q2Q3 b - - 1 27`
- game 17 @1700 (white, 1-0) ply 31 **Kf1** lost 746 cp, best Kd2, middlegame, depth 8, 0.1422s, engine's own eval 530  
  `r1b2rk1/2P2ppp/p7/2B4q/3PQ3/P4N2/1PP2PnP/R3K2R w KQ - 0 16`

Annotated PGNs with `[%eval]` and best moves: `analysis/ad95e70/game_NN.pgn`.
