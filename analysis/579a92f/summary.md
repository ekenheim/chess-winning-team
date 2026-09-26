# Analysis of `579a92f`

elo **2873.2** ±135.0 · W/D/L 5/10/15 · target 3000 · wins@target 2 · 0.25s/move · avg depth 17.0 · 2381763 nps · host windows-amd64-Regenr

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 17.4 | 1 | 7 | 13.7 | 0.24s |
| middlegame | 718 | 31.3 | 17 | 43 | 14.7 | 0.23s |
| endgame | 1135 | 19.9 | 17 | 30 | 19.3 | 0.23s |

## Where results were decided

- Losses: 15; the worst engine blunder fell in: endgame ×8, middlegame ×7
- Draws: 10; 3 of them were ≥ +1.5 for the engine at some point (wins slipped: game 15, game 20, game 25)
- Draw terminations: threefold repetition ×9, insufficient material ×1
- Losses from a winning position (≥ +1.5 at some point): 0 
- Wins: 5 (game 2 @2900, game 7 @2900, game 9 @3000, game 26 @2900, game 27 @3000)

## Time and depth

- Engine used on average 0.233s of 0.25s per move (93%); max 0.254s; 34 moves within 3% of the limit.
- Depth: avg 17.0, min 2, max 127. Blunders at depth ≤ 17: 30 of 35.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2900 | white | 0-1 | 68 | checkmate | 39.1 | 1 | ply 53 Kh1 (−426, best Bd8, middlegame) | Start position |
| 2 | 2900 | black | 0-1 | 162 | checkmate | 11.4 | 0 | ply 42 Ba4 (−113, best h5, middlegame) | Start position |
| 3 | 3000 | white | 1/2-1/2 | 107 | threefold repetition | 23.4 | 0 | ply 85 Ke3 (−186, best Nxf7, endgame) | Start position |
| 4 | 3000 | black | 1/2-1/2 | 208 | threefold repetition | 16.5 | 0 | ply 22 Nd7 (−194, best Qb2, middlegame) | Start position |
| 5 | 3100 | white | 0-1 | 70 | checkmate | 34.4 | 2 | ply 37 c5 (−487, best f4, middlegame) | Start position |
| 6 | 3100 | black | 1/2-1/2 | 132 | threefold repetition | 16.0 | 0 | ply 42 Rb8 (−157, best Ne7, middlegame) | Start position |
| 7 | 2900 | white | 1-0 | 115 | checkmate | 17.6 | 1 | ply 47 bxa4 (−202, best Rab1, middlegame) | Italian Game |
| 8 | 2900 | black | 1-0 | 143 | checkmate | 40.7 | 2 | ply 122 Rxe3 (−583, best Rxe3, endgame) | Italian Game |
| 9 | 3000 | white | 1-0 | 221 | checkmate | 17.1 | 2 | ply 215 Nxc3 (−333, best Bf4, middlegame) | Italian Game |
| 10 | 3000 | black | 1-0 | 65 | checkmate | 40.7 | 2 | ply 24 Qd7 (−263, best g6, middlegame) | Italian Game |
| 11 | 3100 | white | 0-1 | 196 | checkmate | 38.9 | 3 | ply 161 Ke4 (−986, best Kg6, endgame) | Italian Game |
| 12 | 3100 | black | 1-0 | 101 | checkmate | 44.1 | 1 | ply 80 b5 (−449, best c2, middlegame) | Italian Game |
| 13 | 2900 | white | 1/2-1/2 | 149 | threefold repetition | 25.4 | 0 | ply 27 Qxc6 (−188, best Qd2, middlegame) | Ruy Lopez, Morphy Defence |
| 14 | 2900 | black | 1-0 | 159 | checkmate | 34.4 | 0 | ply 82 Nf6 (−161, best Kg8, middlegame) | Ruy Lopez, Morphy Defence |
| 15 | 3000 | white | 1/2-1/2 | 107 | threefold repetition | 40.9 | 3 | ply 77 Ree5 (−780, best Ree5, endgame) | Ruy Lopez, Morphy Defence |
| 16 | 3000 | black | 1/2-1/2 | 88 | threefold repetition | 19.1 | 1 | ply 74 Re8 (−263, best f6, middlegame) | Ruy Lopez, Morphy Defence |
| 17 | 3100 | white | 1/2-1/2 | 163 | threefold repetition | 15.5 | 0 | ply 83 Kh2 (−70, best Ng1, endgame) | Ruy Lopez, Morphy Defence |
| 18 | 3100 | black | 1-0 | 153 | checkmate | 26.2 | 3 | ply 114 Ka4 (−323, best Ka4, endgame) | Ruy Lopez, Morphy Defence |
| 19 | 2900 | white | 0-1 | 201 | checkmate | 22.3 | 1 | ply 154 h4 (−270, best h3, endgame) | Scotch Game |
| 20 | 2900 | black | 1/2-1/2 | 89 | threefold repetition | 34.4 | 1 | ply 19 Nxf3 (−477, best a6, opening) | Scotch Game |
| 21 | 3000 | white | 0-1 | 163 | checkmate | 16.0 | 1 | ply 34 Rg1 (−311, best Ke2, middlegame) | Scotch Game |
| 22 | 3000 | black | 1-0 | 128 | checkmate | 34.3 | 2 | ply 119 Kd7 (−277, best Kd7, endgame) | Scotch Game |
| 23 | 3100 | white | 0-1 | 237 | checkmate | 21.6 | 2 | ply 208 Kf1 (−244, best Bc1+, endgame) | Scotch Game |
| 24 | 3100 | black | 1-0 | 106 | checkmate | 44.9 | 4 | ply 81 Rf7 (−370, best f4, endgame) | Scotch Game |
| 25 | 2900 | white | 1/2-1/2 | 181 | insufficient material | 9.4 | 1 | ply 49 Be3 (−405, best Rc1, endgame) | Petroff Defence |
| 26 | 2900 | black | 0-1 | 134 | checkmate | 14.1 | 0 | ply 100 Rb2+ (−100, best Nxa4, endgame) | Petroff Defence |
| 27 | 3000 | white | 1-0 | 351 | checkmate | 4.1 | 0 | ply 21 Bf4 (−89, best Nc4, middlegame) | Petroff Defence |
| 28 | 3000 | black | 1-0 | 91 | checkmate | 32.8 | 1 | ply 76 gxf6 (−309, best b3, middlegame) | Petroff Defence |
| 29 | 3100 | white | 0-1 | 140 | checkmate | 20.8 | 0 | ply 133 Ke1 (−114, best Kg1, endgame) | Petroff Defence |
| 30 | 3100 | black | 1/2-1/2 | 78 | threefold repetition | 28.5 | 1 | ply 34 Qxc3 (−513, best Bf5, middlegame) | Petroff Defence |

## Worst engine moves (all games)

- game 11 @3100 (white, 0-1) ply 161 **Ke4** lost 986 cp, best Kg6, endgame, depth 127, 0.119s, engine's own eval 0  
  `8/8/8/5K1p/6p1/6P1/7k/8 w - - 14 81`
- game 15 @3000 (white, 1/2-1/2) ply 77 **Ree5** lost 780 cp, best Ree5, endgame, depth 17, 0.236s, engine's own eval -822  
  `8/6p1/5k2/6R1/5Pp1/3p3b/PP2RP1P/3qB1K1 w - - 8 39`
- game 11 @3100 (white, 0-1) ply 149 **Ke4** lost 732 cp, best Kg5, endgame, depth 23, 0.2381s, engine's own eval -1857  
  `8/8/8/7p/5Kp1/6P1/7k/8 w - - 2 75`
- game 8 @2900 (black, 1-0) ply 122 **Rxe3** lost 583 cp, best Rxe3, endgame, depth 10, 0.2359s, engine's own eval None  
  `3Q4/7k/4r2P/pp4p1/8/2BpN3/5K2/8 b - - 0 61`
- game 30 @3100 (black, 1/2-1/2) ply 34 **Qxc3** lost 513 cp, best Bf5, middlegame, depth 13, 0.236s, engine's own eval 22  
  `r1b3k1/ppp2ppp/2n5/1B6/P2Pr3/2P1qN2/Q5PP/R4R1K b - - 1 17`
- game 5 @3100 (white, 0-1) ply 37 **c5** lost 487 cp, best f4, middlegame, depth 14, 0.2359s, engine's own eval 226  
  `2q3k1/2p2pp1/1r2p1p1/3p2nr/Q1PP4/4P2P/P1P2PP1/R1B2RK1 w - - 1 19`
- game 20 @2900 (black, 1/2-1/2) ply 19 **Nxf3** lost 477 cp, best a6, opening, depth 14, 0.2364s, engine's own eval 152  
  `r1bk2nr/pppp2pp/5pq1/1N2n3/8/2P2B2/P1PBQP1P/2KR3R b - - 5 10`
- game 12 @3100 (black, 1-0) ply 80 **b5** lost 449 cp, best c2, middlegame, depth 11, 0.236s, engine's own eval -1316  
  `1r6/1pp2Nqk/5p1p/6pQ/P4p2/1Bp5/7R/6RK b - - 1 40`
- game 15 @3000 (white, 1/2-1/2) ply 71 **Rg5+** lost 441 cp, best Rg5+, endgame, depth 17, 0.236s, engine's own eval -818  
  `8/6p1/6k1/7R/5Pp1/3p3b/PP2RP1P/3qB1K1 w - - 2 36`
- game 1 @2900 (white, 0-1) ply 53 **Kh1** lost 426 cp, best Bd8, middlegame, depth 13, 0.236s, engine's own eval -792  
  `4k3/4b1q1/2pp4/B1p1p3/3PP2p/P4rPb/1PP1NP2/1R2R1K1 w - - 0 27`
- game 11 @3100 (white, 0-1) ply 151 **Kf4** lost 425 cp, best Kf4, endgame, depth 127, 0.057s, engine's own eval 0  
  `8/8/8/7p/4K1p1/6Pk/8/8 w - - 4 76`
- game 25 @2900 (white, 1/2-1/2) ply 49 **Be3** lost 405 cp, best Rc1, endgame, depth 15, 0.2358s, engine's own eval 195  
  `6k1/3P1ppp/4n3/2b5/5B2/5N2/1r3PPP/5RK1 w - - 0 25`

Annotated PGNs with `[%eval]` and best moves: `analysis/579a92f/game_NN.pgn`.
