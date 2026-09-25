# Analysis of `1a24270`

elo **2202.5** ±347.5 · W/D/L 28/2/0 · target 1600 · wins@target 9 · 0.25s/move · avg depth 11.1 · 5632143 nps · host darwin-arm64-MacBook-Pro-som-tillhor-Regent.local

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 21.2 | 3 | 8 | 11.0 | 0.16s |
| middlegame | 495 | 47.7 | 28 | 21 | 10.8 | 0.15s |
| endgame | 302 | 35.4 | 9 | 17 | 11.6 | 0.12s |

## Where results were decided

- Losses: 0; the worst engine blunder fell in: n/a
- Draws: 2; 2 of them were ≥ +1.5 for the engine at some point (wins slipped: game 22, game 30)
- Draw terminations: threefold repetition ×2
- Losses from a winning position (≥ +1.5 at some point): 0 
- Wins: 28 (game 1 @1500, game 2 @1500, game 3 @1600, game 4 @1600, game 5 @1700, game 6 @1700, game 7 @1500, game 8 @1500, game 9 @1600, game 10 @1600, game 11 @1700, game 12 @1700, game 13 @1500, game 14 @1500, game 15 @1600, game 16 @1600, game 17 @1700, game 18 @1700, game 19 @1500, game 20 @1500, game 21 @1600, game 23 @1700, game 24 @1700, game 25 @1500, game 26 @1500, game 27 @1600, game 28 @1600, game 29 @1700)

## Time and depth

- Engine used on average 0.142s of 0.25s per move (57%); max 0.252s; 3 moves within 3% of the limit.
- Depth: avg 11.1, min 2, max 127. Blunders at depth ≤ 11: 31 of 40.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1500 | white | 1-0 | 79 | checkmate | 51.7 | 2 | ply 71 d7 (−1168, best Kc4, endgame) | Start position |
| 2 | 1500 | black | 0-1 | 54 | checkmate | 16.7 | 1 | ply 46 Nxc2+ (−295, best Nd3+, middlegame) | Start position |
| 3 | 1600 | white | 1-0 | 67 | checkmate | 20.5 | 1 | ply 35 Bd4 (−210, best Nf4, middlegame) | Start position |
| 4 | 1600 | black | 0-1 | 30 | checkmate | 20.5 | 1 | ply 24 Bxf2+ (−241, best Ng4, middlegame) | Start position |
| 5 | 1700 | white | 1-0 | 67 | checkmate | 76.3 | 2 | ply 57 Qd6+ (−1695, best fxe8=R+, middlegame) | Start position |
| 6 | 1700 | black | 0-1 | 122 | checkmate | 24.0 | 2 | ply 110 h4 (−294, best h4, endgame) | Start position |
| 7 | 1500 | white | 1-0 | 81 | checkmate | 25.2 | 0 | ply 29 Rd1 (−179, best Nd6+, middlegame) | Italian Game |
| 8 | 1500 | black | 0-1 | 72 | checkmate | 21.1 | 0 | ply 52 cxd3 (−94, best Bxd3, middlegame) | Italian Game |
| 9 | 1600 | white | 1-0 | 59 | checkmate | 81.8 | 2 | ply 51 e7 (−1842, best Rfd1, endgame) | Italian Game |
| 10 | 1600 | black | 0-1 | 52 | checkmate | 16.1 | 1 | ply 32 Ng3+ (−212, best Be6, middlegame) | Italian Game |
| 11 | 1700 | white | 1-0 | 83 | checkmate | 22.4 | 0 | ply 19 f5 (−144, best Bd3, opening) | Italian Game |
| 12 | 1700 | black | 0-1 | 88 | checkmate | 27.5 | 1 | ply 80 Qd2+ (−492, best Qxa1, endgame) | Italian Game |
| 13 | 1500 | white | 1-0 | 49 | checkmate | 19.2 | 0 | ply 15 Rfd1 (−143, best Rad1, opening) | Ruy Lopez, Morphy Defence |
| 14 | 1500 | black | 0-1 | 74 | checkmate | 33.9 | 2 | ply 22 Nb4 (−376, best a5, middlegame) | Ruy Lopez, Morphy Defence |
| 15 | 1600 | white | 1-0 | 57 | checkmate | 12.6 | 0 | ply 15 h4 (−75, best Qd3, opening) | Ruy Lopez, Morphy Defence |
| 16 | 1600 | black | 0-1 | 116 | checkmate | 43.0 | 4 | ply 86 c5 (−338, best Bxd4, middlegame) | Ruy Lopez, Morphy Defence |
| 17 | 1700 | white | 1-0 | 57 | checkmate | 27.8 | 1 | ply 17 Qxa8 (−300, best O-O, opening) | Ruy Lopez, Morphy Defence |
| 18 | 1700 | black | 0-1 | 58 | checkmate | 25.1 | 1 | ply 38 Nf2+ (−222, best Qxh3, middlegame) | Ruy Lopez, Morphy Defence |
| 19 | 1500 | white | 1-0 | 48 | checkmate | 26.0 | 0 | ply 22 Bc4 (−136, best h4, middlegame) | Scotch Game |
| 20 | 1500 | black | 0-1 | 81 | checkmate | 20.6 | 0 | ply 35 Bb4 (−111, best Ke8, middlegame) | Scotch Game |
| 21 | 1600 | white | 1-0 | 46 | checkmate | 124.6 | 2 | ply 42 Kf1 (−2000, best Kd2, middlegame) | Scotch Game |
| 22 | 1600 | black | 1/2-1/2 | 147 | threefold repetition | 52.4 | 4 | ply 47 Kh8 (−545, best Rd6, middlegame) | Scotch Game |
| 23 | 1700 | white | 1-0 | 58 | checkmate | 18.7 | 0 | ply 28 Rh3 (−161, best a4, endgame) | Scotch Game |
| 24 | 1700 | black | 0-1 | 39 | checkmate | 35.5 | 1 | ply 17 Bxf2+ (−239, best Nge7, opening) | Scotch Game |
| 25 | 1500 | white | 1-0 | 139 | checkmate | 49.6 | 5 | ply 47 Rxb7 (−435, best Nf3, middlegame) | Petroff Defence |
| 26 | 1500 | black | 0-1 | 50 | checkmate | 34.0 | 1 | ply 38 Rxe6+ (−751, best Rxe6+, middlegame) | Petroff Defence |
| 27 | 1600 | white | 1-0 | 37 | checkmate | 6.9 | 0 | ply 3 d3 (−39, best Bxd7+, opening) | Petroff Defence |
| 28 | 1600 | black | 0-1 | 56 | checkmate | 8.9 | 0 | ply 16 Qd5 (−62, best Qd7, opening) | Petroff Defence |
| 29 | 1700 | white | 1-0 | 121 | checkmate | 45.7 | 3 | ply 23 Nd4 (−359, best Rfe1, middlegame) | Petroff Defence |
| 30 | 1700 | black | 1/2-1/2 | 92 | threefold repetition | 69.2 | 3 | ply 72 g6 (−1180, best Nd8, middlegame) | Petroff Defence |

## Worst engine moves (all games)

- game 21 @1600 (white, 1-0) ply 42 **Kf1** lost 2000 cp, best Kd2, middlegame, depth 2, 0.0007s, engine's own eval None  
  `4r3/2P2p1k/5Qp1/3p3p/3B1P2/P1P3P1/2P4P/R3K2R w KQ - 2 22`
- game 9 @1600 (white, 1-0) ply 51 **e7** lost 1842 cp, best Rfd1, endgame, depth 10, 0.0778s, engine's own eval None  
  `8/2N4k/2N1P1p1/2p4p/8/2B5/PPP2P1P/R4RK1 w - - 1 26`
- game 5 @1700 (white, 1-0) ply 57 **Qd6+** lost 1695 cp, best fxe8=R+, middlegame, depth 12, 0.0933s, engine's own eval None  
  `1k2r3/1p2rP2/5Q2/p6p/1RB2P2/2N5/4N1PP/4K2R w K - 1 29`
- game 30 @1700 (black, 1/2-1/2) ply 72 **g6** lost 1180 cp, best Nd8, middlegame, depth 9, 0.2357s, engine's own eval 285  
  `5rk1/1pp2pp1/p1nr3p/3B3Q/P2P4/2P1RR2/5PK1/q7 b - - 27 36`
- game 1 @1500 (white, 1-0) ply 71 **d7** lost 1168 cp, best Kc4, endgame, depth 10, 0.0551s, engine's own eval None  
  `6k1/8/3P4/6pp/8/P1K2N2/P4PPP/4R3 w - - 1 36`
- game 26 @1500 (black, 0-1) ply 38 **Rxe6+** lost 751 cp, best Rxe6+, middlegame, depth 12, 0.1159s, engine's own eval 2375  
  `r3k3/ppp1r1pp/1bn1Bp2/8/P7/7b/4K2P/2R5 b q - 7 19`
- game 22 @1600 (black, 1/2-1/2) ply 47 **Kh8** lost 545 cp, best Rd6, middlegame, depth 9, 0.1369s, engine's own eval 25  
  `1r1r4/pp3pk1/5N2/q6p/2b3PQ/4B3/2P3PP/4R1K1 b - - 2 24`
- game 30 @1700 (black, 1/2-1/2) ply 80 **Nxd4** lost 542 cp, best Ne7, middlegame, depth 10, 0.1081s, engine's own eval -310  
  `5rk1/1pp2p2/p1n3p1/8/P2P1Q2/2P1R2R/5PK1/3q4 b - - 2 40`
- game 22 @1600 (black, 1/2-1/2) ply 123 **b5** lost 520 cp, best Rc7, endgame, depth 14, 0.2358s, engine's own eval -1795  
  `2k5/5Q2/1pr3PP/p7/6K1/8/2P5/8 b - - 6 62`
- game 21 @1600 (white, 1-0) ply 8 **Nxa7** lost 509 cp, best a3, opening, depth 9, 0.1476s, engine's own eval 150  
  `r1b1k1nr/pppp1ppp/3b1q2/1N6/1n2P3/2N1B3/PPP2PPP/R2QKB1R w KQkq - 7 5`
- game 12 @1700 (black, 0-1) ply 80 **Qd2+** lost 492 cp, best Qxa1, endgame, depth 10, 0.0316s, engine's own eval None  
  `6k1/1p3ppp/p7/P7/2p1b3/8/5K1P/B2q4 b - - 1 40`
- game 25 @1500 (white, 1-0) ply 47 **Rxb7** lost 435 cp, best Nf3, middlegame, depth 10, 0.1478s, engine's own eval 155  
  `3r1rk1/1p2b1pp/2p5/P2q1pN1/2bP4/P3B3/2P2PPP/1R1Q2KR w - - 4 24`

Annotated PGNs with `[%eval]` and best moves: `analysis/1a24270/game_NN.pgn`.
