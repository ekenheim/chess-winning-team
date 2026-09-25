# Analysis of `dd6c58b`

elo **1892.2** ±169.3 · W/D/L 23/4/3 · target 1600 · wins@target 8 · 0.25s/move · avg depth 5.9 · 4150855 nps · host darwin-arm64-MacBook-Pro-som-tillhor-Regent.local

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 40.6 | 11 | 23 | 5.4 | 0.20s |
| middlegame | 558 | 76.8 | 69 | 50 | 5.7 | 0.19s |
| endgame | 467 | 40.7 | 19 | 17 | 6.5 | 0.18s |

## Where results were decided

- Losses: 3; the worst engine blunder fell in: middlegame ×2, opening ×1
- Draws: 4; 1 of them were ≥ +1.5 for the engine at some point (wins slipped: game 18)
- Draw terminations: threefold repetition ×3, stalemate ×1
- Losses from a winning position (≥ +1.5 at some point): 2 (game 3, game 5)
- Wins: 23 (game 1 @1500, game 2 @1500, game 6 @1700, game 9 @1600, game 10 @1600, game 11 @1700, game 12 @1700, game 13 @1500, game 14 @1500, game 15 @1600, game 16 @1600, game 17 @1700, game 19 @1500, game 20 @1500, game 21 @1600, game 22 @1600, game 23 @1700, game 25 @1500, game 26 @1500, game 27 @1600, game 28 @1600, game 29 @1700, game 30 @1700)

## Time and depth

- Engine used on average 0.187s of 0.25s per move (75%); max 0.265s; 14 moves within 3% of the limit.
- Depth: avg 5.9, min 2, max 10. Blunders at depth ≤ 6: 36 of 99.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1500 | white | 1-0 | 103 | checkmate | 76.3 | 9 | ply 95 a5 (−797, best h4, endgame) | Start position |
| 2 | 1500 | black | 0-1 | 90 | checkmate | 26.7 | 0 | ply 38 Ba5+ (−192, best a6, endgame) | Start position |
| 3 | 1600 | white | 0-1 | 72 | checkmate | 111.1 | 7 | ply 51 b4 (−981, best c4, middlegame) | Start position |
| 4 | 1600 | black | 1/2-1/2 | 196 | threefold repetition | 49.3 | 10 | ply 82 Rf5 (−426, best Re8, middlegame) | Start position |
| 5 | 1700 | white | 0-1 | 86 | checkmate | 107.2 | 4 | ply 75 Bxc7 (−1449, best c4, middlegame) | Start position |
| 6 | 1700 | black | 0-1 | 92 | checkmate | 25.7 | 1 | ply 50 c4 (−438, best d4, endgame) | Start position |
| 7 | 1500 | white | 0-1 | 24 | checkmate | 111.7 | 2 | ply 13 Nxf7+ (−602, best Rf1, opening) | Italian Game |
| 8 | 1500 | black | 1/2-1/2 | 110 | threefold repetition | 48.5 | 3 | ply 34 gxf5 (−818, best Qxd5, middlegame) | Italian Game |
| 9 | 1600 | white | 1-0 | 71 | checkmate | 64.0 | 2 | ply 27 Bxh8 (−693, best Qd2, middlegame) | Italian Game |
| 10 | 1600 | black | 0-1 | 48 | checkmate | 87.8 | 2 | ply 40 Qxa1 (−932, best Qxg2+, middlegame) | Italian Game |
| 11 | 1700 | white | 1-0 | 147 | checkmate | 42.7 | 5 | ply 105 b8=Q (−671, best Qxh5+, middlegame) | Italian Game |
| 12 | 1700 | black | 0-1 | 72 | checkmate | 77.9 | 7 | ply 68 Bxa2 (−756, best Bxa2, endgame) | Italian Game |
| 13 | 1500 | white | 1-0 | 87 | checkmate | 68.9 | 2 | ply 75 Rf5+ (−1013, best Rxg7, endgame) | Ruy Lopez, Morphy Defence |
| 14 | 1500 | black | 0-1 | 76 | checkmate | 112.3 | 8 | ply 68 Rb2 (−546, best Qb5, middlegame) | Ruy Lopez, Morphy Defence |
| 15 | 1600 | white | 1-0 | 49 | checkmate | 62.0 | 3 | ply 15 Ne4 (−310, best Nb3, opening) | Ruy Lopez, Morphy Defence |
| 16 | 1600 | black | 0-1 | 72 | checkmate | 22.5 | 0 | ply 30 bxa3 (−139, best b3, middlegame) | Ruy Lopez, Morphy Defence |
| 17 | 1700 | white | 1-0 | 105 | checkmate | 88.1 | 6 | ply 89 Qg5+ (−804, best Rxc5, middlegame) | Ruy Lopez, Morphy Defence |
| 18 | 1700 | black | 1/2-1/2 | 118 | stalemate | 73.7 | 8 | ply 62 c4 (−507, best Bb4, endgame) | Ruy Lopez, Morphy Defence |
| 19 | 1500 | white | 1-0 | 42 | checkmate | 11.2 | 0 | ply 32 Nxd8 (−62, best f3, middlegame) | Scotch Game |
| 20 | 1500 | black | 0-1 | 117 | checkmate | 50.4 | 4 | ply 47 Re7 (−366, best Bd4, middlegame) | Scotch Game |
| 21 | 1600 | white | 1-0 | 48 | checkmate | 54.1 | 1 | ply 42 Re1 (−536, best Re1, endgame) | Scotch Game |
| 22 | 1600 | black | 0-1 | 95 | checkmate | 59.9 | 2 | ply 81 h3 (−1255, best a5, endgame) | Scotch Game |
| 23 | 1700 | white | 1-0 | 74 | checkmate | 99.1 | 3 | ply 66 c7 (−1709, best c7, middlegame) | Scotch Game |
| 24 | 1700 | black | 1/2-1/2 | 245 | threefold repetition | 36.2 | 4 | ply 21 a6 (−322, best Qxd3, middlegame) | Scotch Game |
| 25 | 1500 | white | 1-0 | 47 | checkmate | 17.3 | 0 | ply 11 Bf5 (−119, best Nce2, opening) | Petroff Defence |
| 26 | 1500 | black | 0-1 | 74 | checkmate | 8.1 | 0 | ply 48 Rf4+ (−98, best c5, endgame) | Petroff Defence |
| 27 | 1600 | white | 1-0 | 75 | checkmate | 44.0 | 2 | ply 37 Bf4 (−510, best Rxe6, middlegame) | Petroff Defence |
| 28 | 1600 | black | 0-1 | 118 | checkmate | 30.4 | 2 | ply 106 Rd4 (−304, best Bf8, endgame) | Petroff Defence |
| 29 | 1700 | white | 1-0 | 31 | checkmate | 19.1 | 0 | ply 15 Qxa8 (−176, best Be4, opening) | Petroff Defence |
| 30 | 1700 | black | 0-1 | 54 | checkmate | 44.3 | 2 | ply 18 Qe4 (−569, best Ne5, opening) | Petroff Defence |

## Worst engine moves (all games)

- game 23 @1700 (white, 1-0) ply 66 **c7** lost 1709 cp, best c7, middlegame, depth 6, 0.102s, engine's own eval 2553  
  `4r1k1/5p2/2P3p1/4B3/4P3/1Q3P2/PP5P/R4R1K w - - 1 34`
- game 5 @1700 (white, 0-1) ply 75 **Bxc7** lost 1449 cp, best c4, middlegame, depth 6, 0.2363s, engine's own eval 836  
  `6k1/N1pb4/5p2/P2q2p1/3P4/R1P3B1/1P3P1P/4R1K1 w - - 3 38`
- game 5 @1700 (white, 0-1) ply 73 **Kg1** lost 1356 cp, best f3, middlegame, depth 6, 0.2368s, engine's own eval 729  
  `6k1/N1p5/4bp2/P2q2p1/3P4/R1P3B1/1P3PKP/4R3 w - - 1 37`
- game 22 @1600 (black, 0-1) ply 81 **h3** lost 1255 cp, best a5, endgame, depth 8, 0.1605s, engine's own eval 2020  
  `6k1/pp3pp1/2b5/5n2/7p/8/1K6/8 b - - 1 41`
- game 13 @1500 (white, 1-0) ply 75 **Rf5+** lost 1013 cp, best Rxg7, endgame, depth 8, 0.1186s, engine's own eval 1654  
  `8/2R2Rp1/7p/4P2k/1p2P3/4P3/2P3PP/2r3NK w - - 1 38`
- game 3 @1600 (white, 0-1) ply 51 **b4** lost 981 cp, best c4, middlegame, depth 6, 0.2308s, engine's own eval 125  
  `r7/3p1pk1/3Q1ppp/rq6/3P4/3R1P2/1PP2PPP/1KR5 w - - 6 26`
- game 13 @1500 (white, 1-0) ply 81 **e7** lost 956 cp, best Rf3+, endgame, depth 8, 0.2031s, engine's own eval 2122  
  `8/2R5/4P2p/5Rp1/1p2P3/4P1kP/2P3P1/2r3NK w - - 1 41`
- game 23 @1700 (white, 1-0) ply 42 **Bf1** lost 943 cp, best Bf4, middlegame, depth 5, 0.2358s, engine's own eval 1177  
  `N4rk1/5p1p/3p2p1/4P2q/2P1P3/1Q1BB2b/PP3P1P/R2R2K1 w - - 1 22`
- game 10 @1600 (black, 0-1) ply 40 **Qxa1** lost 932 cp, best Qxg2+, middlegame, depth 6, 0.1057s, engine's own eval 2575  
  `r5k1/ppp2rpp/2n5/8/5pn1/P1P2R2/1P2K1P1/R6q b - - 4 20`
- game 8 @1500 (black, 1/2-1/2) ply 34 **gxf5** lost 818 cp, best Qxd5, middlegame, depth 7, 0.1434s, engine's own eval 189  
  `r2n1rk1/pp3p2/2pp2pp/q2P1BN1/8/3Q3P/P4PP1/2R2RK1 b - - 0 17`
- game 17 @1700 (white, 1-0) ply 89 **Qg5+** lost 804 cp, best Rxc5, middlegame, depth 5, 0.2645s, engine's own eval 1508  
  `q7/7r/P4Pk1/R1p5/1P5P/4Q1PK/2P5/4R3 w - - 1 45`
- game 1 @1500 (white, 1-0) ply 95 **a5** lost 797 cp, best h4, endgame, depth 7, 0.2357s, engine's own eval 2291  
  `8/8/7k/8/P5R1/5B2/1PP2PPP/6K1 w - - 1 48`

Annotated PGNs with `[%eval]` and best moves: `analysis/dd6c58b/game_NN.pgn`.
