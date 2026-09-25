# Analysis of `498a47b`

elo **2074.7** ±250.8 · W/D/L 28/0/2 · target 1600 · wins@target 9 · 0.25s/move · avg depth 10.6 · 4648915 nps · host darwin-arm64-MacBook-Pro-som-tillhor-Regent.local

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 298 | 26.3 | 6 | 11 | 10.1 | 0.16s |
| middlegame | 494 | 37.1 | 14 | 43 | 10.5 | 0.14s |
| endgame | 289 | 53.5 | 17 | 14 | 11.5 | 0.12s |

## Where results were decided

- Losses: 2; the worst engine blunder fell in: middlegame ×1, opening ×1
- Draws: 0; 0 of them were ≥ +1.5 for the engine at some point (wins slipped: none)
- Losses from a winning position (≥ +1.5 at some point): 1 (game 5)
- Wins: 28 (game 1 @1500, game 2 @1500, game 3 @1600, game 4 @1600, game 6 @1700, game 7 @1500, game 8 @1500, game 9 @1600, game 10 @1600, game 11 @1700, game 12 @1700, game 13 @1500, game 14 @1500, game 16 @1600, game 17 @1700, game 18 @1700, game 19 @1500, game 20 @1500, game 21 @1600, game 22 @1600, game 23 @1700, game 24 @1700, game 25 @1500, game 26 @1500, game 27 @1600, game 28 @1600, game 29 @1700, game 30 @1700)

## Time and depth

- Engine used on average 0.141s of 0.25s per move (56%); max 0.266s; 4 moves within 3% of the limit.
- Depth: avg 10.6, min 2, max 20. Blunders at depth ≤ 11: 18 of 37.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1500 | white | 1-0 | 91 | checkmate | 19.2 | 0 | ply 49 Ne2 (−139, best Nb5, middlegame) | Start position |
| 2 | 1500 | black | 0-1 | 28 | checkmate | 16.4 | 0 | ply 14 Bd6 (−63, best g5, opening) | Start position |
| 3 | 1600 | white | 1-0 | 81 | checkmate | 49.9 | 1 | ply 79 Rg1 (−1059, best Qh5+, endgame) | Start position |
| 4 | 1600 | black | 0-1 | 74 | checkmate | 36.9 | 1 | ply 68 Nxe5 (−355, best Nxe5, endgame) | Start position |
| 5 | 1700 | white | 0-1 | 172 | checkmate | 46.3 | 3 | ply 87 g4 (−514, best c6, middlegame) | Start position |
| 6 | 1700 | black | 0-1 | 70 | checkmate | 43.2 | 1 | ply 64 Bd5 (−691, best Rf4, middlegame) | Start position |
| 7 | 1500 | white | 1-0 | 47 | checkmate | 8.2 | 0 | ply 15 Nb3 (−46, best Nf3, opening) | Italian Game |
| 8 | 1500 | black | 0-1 | 50 | checkmate | 28.4 | 1 | ply 12 Kh8 (−274, best Nc6, opening) | Italian Game |
| 9 | 1600 | white | 1-0 | 57 | checkmate | 85.1 | 2 | ply 51 Qxf6+ (−1764, best a7, endgame) | Italian Game |
| 10 | 1600 | black | 0-1 | 76 | checkmate | 59.8 | 2 | ply 70 Qg8 (−888, best Qc1, endgame) | Italian Game |
| 11 | 1700 | white | 1-0 | 57 | checkmate | 28.0 | 1 | ply 13 Nxd4 (−268, best Bxf6, opening) | Italian Game |
| 12 | 1700 | black | 0-1 | 68 | checkmate | 20.3 | 0 | ply 34 Rae8 (−111, best Rad8, middlegame) | Italian Game |
| 13 | 1500 | white | 1-0 | 71 | checkmate | 46.6 | 3 | ply 63 h4 (−533, best Ra5, endgame) | Ruy Lopez, Morphy Defence |
| 14 | 1500 | black | 0-1 | 88 | checkmate | 35.7 | 1 | ply 80 Rd5 (−634, best Rc5+, endgame) | Ruy Lopez, Morphy Defence |
| 15 | 1600 | white | 0-1 | 16 | checkmate | 128.4 | 1 | ply 9 Nxe5 (−881, best d3, opening) | Ruy Lopez, Morphy Defence |
| 16 | 1600 | black | 0-1 | 56 | checkmate | 14.7 | 0 | ply 18 O-O (−132, best Qf6, opening) | Ruy Lopez, Morphy Defence |
| 17 | 1700 | white | 1-0 | 65 | checkmate | 57.0 | 5 | ply 59 Nc4+ (−320, best Ne4+, middlegame) | Ruy Lopez, Morphy Defence |
| 18 | 1700 | black | 0-1 | 130 | checkmate | 29.7 | 2 | ply 120 e2 (−258, best Kf5, endgame) | Ruy Lopez, Morphy Defence |
| 19 | 1500 | white | 1-0 | 52 | checkmate | 68.1 | 1 | ply 46 Rd8 (−1584, best Qe3, middlegame) | Scotch Game |
| 20 | 1500 | black | 0-1 | 125 | checkmate | 45.1 | 4 | ply 117 f4 (−833, best f4, endgame) | Scotch Game |
| 21 | 1600 | white | 1-0 | 22 | checkmate | 14.6 | 0 | ply 12 e5 (−87, best O-O-O, opening) | Scotch Game |
| 22 | 1600 | black | 0-1 | 95 | checkmate | 28.7 | 1 | ply 87 Rd1 (−361, best Rc3, endgame) | Scotch Game |
| 23 | 1700 | white | 1-0 | 62 | checkmate | 23.3 | 0 | ply 38 c5 (−150, best Nf5+, middlegame) | Scotch Game |
| 24 | 1700 | black | 0-1 | 65 | checkmate | 57.0 | 2 | ply 43 Be6 (−960, best c5, middlegame) | Scotch Game |
| 25 | 1500 | white | 1-0 | 75 | checkmate | 49.1 | 2 | ply 29 Qh3 (−262, best f4, middlegame) | Petroff Defence |
| 26 | 1500 | black | 0-1 | 88 | checkmate | 26.3 | 0 | ply 82 Rff2 (−189, best Qe6, middlegame) | Petroff Defence |
| 27 | 1600 | white | 1-0 | 57 | checkmate | 54.7 | 1 | ply 51 Qd8+ (−988, best Qe5+, endgame) | Petroff Defence |
| 28 | 1600 | black | 0-1 | 64 | checkmate | 25.5 | 1 | ply 42 a6 (−204, best Nxe2, middlegame) | Petroff Defence |
| 29 | 1700 | white | 1-0 | 45 | checkmate | 18.1 | 0 | ply 27 h3 (−153, best f3, middlegame) | Petroff Defence |
| 30 | 1700 | black | 0-1 | 102 | checkmate | 26.6 | 1 | ply 58 Rg5 (−219, best c3, endgame) | Petroff Defence |

## Worst engine moves (all games)

- game 9 @1600 (white, 1-0) ply 51 **Qxf6+** lost 1764 cp, best a7, endgame, depth 8, 0.0279s, engine's own eval None  
  `7k/5p2/P1Q2p2/8/2N1P1p1/8/1PP2P1P/R6K w - - 1 26`
- game 19 @1500 (white, 1-0) ply 46 **Rd8** lost 1584 cp, best Qe3, middlegame, depth 10, 0.0048s, engine's own eval None  
  `5r1k/Q1P3p1/8/1N5p/8/8/PP3PPP/3R2KR w - - 0 24`
- game 3 @1600 (white, 1-0) ply 79 **Rg1** lost 1059 cp, best Qh5+, endgame, depth 6, 0.0015s, engine's own eval None  
  `7k/8/p7/5Q2/1b5p/5P2/PP1P1P1P/R1B2R1K w - - 3 40`
- game 27 @1600 (white, 1-0) ply 51 **Qd8+** lost 988 cp, best Qe5+, endgame, depth 8, 0.004s, engine's own eval None  
  `rk6/1p2Q3/2p5/p4p2/3P4/8/PP2NPPP/R1B3K1 w - - 0 26`
- game 24 @1700 (black, 0-1) ply 43 **Be6** lost 960 cp, best c5, middlegame, depth 8, 0.2363s, engine's own eval 302  
  `1r1q2k1/ppp1Rp2/3p1n1r/5b2/2P2P1p/3P1Q1P/PB4P1/4R1K1 b - - 1 22`
- game 10 @1600 (black, 0-1) ply 70 **Qg8** lost 888 cp, best Qc1, endgame, depth 14, 0.1649s, engine's own eval 1207  
  `1b5k/2pR4/pp3p1p/4pNqP/4P3/5P2/4KP2/r7 b - - 5 35`
- game 15 @1600 (white, 0-1) ply 9 **Nxe5** lost 881 cp, best d3, opening, depth 11, 0.2357s, engine's own eval 41  
  `r2qkbnr/1pp2pp1/p1p5/4p3/4P1p1/5N2/PPPP1PP1/RNBQ1RK1 w kq - 0 5`
- game 20 @1500 (black, 0-1) ply 117 **f4** lost 833 cp, best f4, endgame, depth 13, 0.1627s, engine's own eval 1900  
  `8/1p6/p1p2k1p/2P2p2/8/4r3/8/3K4 b - - 1 59`
- game 6 @1700 (black, 0-1) ply 64 **Bd5** lost 691 cp, best Rf4, middlegame, depth 2, 0.0016s, engine's own eval None  
  `1r3r2/1p4k1/p1n1b2p/7p/P2p3q/8/2P1Q1P1/6K1 b - - 1 32`
- game 14 @1500 (black, 0-1) ply 80 **Rd5** lost 634 cp, best Rc5+, endgame, depth 13, 0.13s, engine's own eval None  
  `8/1pp1R3/1b5k/p4r1p/P4p2/5q2/1PK5/8 b - - 1 40`
- game 13 @1500 (white, 1-0) ply 63 **h4** lost 533 cp, best Ra5, endgame, depth 11, 0.1496s, engine's own eval None  
  `8/8/7k/6Rp/N2B4/8/P4PPP/5K2 w - - 1 32`
- game 5 @1700 (white, 0-1) ply 87 **g4** lost 514 cp, best c6, middlegame, depth 10, 0.2357s, engine's own eval 318  
  `3r2k1/5pp1/4p1p1/2P3nq/P2B1R2/P5P1/2P2P1P/Q6K w - - 19 44`

Annotated PGNs with `[%eval]` and best moves: `analysis/498a47b/game_NN.pgn`.
