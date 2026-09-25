# Analysis of `63ccb08`

elo **1914.6** ±176.4 · W/D/L 25/1/4 · target 1600 · wins@target 9 · 0.25s/move · avg depth 6.1 · 5428778 nps · host darwin-arm64-MacBook-Pro-som-tillhor-Regent.local

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 32.5 | 5 | 17 | 5.6 | 0.20s |
| middlegame | 611 | 58.2 | 48 | 60 | 6.1 | 0.19s |
| endgame | 374 | 81.7 | 32 | 23 | 6.7 | 0.17s |

## Where results were decided

- Losses: 4; the worst engine blunder fell in: middlegame ×3, opening ×1
- Draws: 1; 0 of them were ≥ +1.5 for the engine at some point (wins slipped: none)
- Draw terminations: threefold repetition ×1
- Losses from a winning position (≥ +1.5 at some point): 4 (game 7, game 13, game 23, game 24)
- Wins: 25 (game 1 @1500, game 2 @1500, game 3 @1600, game 4 @1600, game 5 @1700, game 6 @1700, game 8 @1500, game 9 @1600, game 10 @1600, game 11 @1700, game 12 @1700, game 14 @1500, game 15 @1600, game 17 @1700, game 18 @1700, game 19 @1500, game 20 @1500, game 21 @1600, game 22 @1600, game 25 @1500, game 26 @1500, game 27 @1600, game 28 @1600, game 29 @1700, game 30 @1700)

## Time and depth

- Engine used on average 0.186s of 0.25s per move (74%); max 0.242s; 0 moves within 3% of the limit.
- Depth: avg 6.1, min 2, max 127. Blunders at depth ≤ 6: 52 of 85.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1500 | white | 1-0 | 63 | checkmate | 41.5 | 2 | ply 31 Ke2 (−294, best O-O-O, middlegame) | Start position |
| 2 | 1500 | black | 0-1 | 190 | checkmate | 56.0 | 5 | ply 180 Rf1+ (−694, best Ne2+, endgame) | Start position |
| 3 | 1600 | white | 1-0 | 89 | checkmate | 23.2 | 0 | ply 55 b4 (−166, best Bd7, middlegame) | Start position |
| 4 | 1600 | black | 0-1 | 80 | checkmate | 32.2 | 0 | ply 18 Nf6 (−177, best a6, opening) | Start position |
| 5 | 1700 | white | 1-0 | 99 | checkmate | 47.6 | 4 | ply 55 c3 (−608, best Kf1, middlegame) | Start position |
| 6 | 1700 | black | 0-1 | 126 | checkmate | 39.0 | 3 | ply 72 Qe6 (−630, best Rb8, middlegame) | Start position |
| 7 | 1500 | white | 0-1 | 62 | checkmate | 94.4 | 6 | ply 53 Nxg5 (−491, best Nh2, middlegame) | Italian Game |
| 8 | 1500 | black | 0-1 | 78 | checkmate | 134.0 | 6 | ply 72 Nxd5 (−1639, best Nxd5, endgame) | Italian Game |
| 9 | 1600 | white | 1-0 | 45 | checkmate | 27.3 | 0 | ply 35 Bf1 (−159, best Rxg1, middlegame) | Italian Game |
| 10 | 1600 | black | 0-1 | 100 | checkmate | 33.7 | 1 | ply 96 Rxg2+ (−752, best Qxf3, middlegame) | Italian Game |
| 11 | 1700 | white | 1-0 | 73 | checkmate | 36.1 | 1 | ply 67 fxg5 (−302, best Ke2, endgame) | Italian Game |
| 12 | 1700 | black | 0-1 | 72 | checkmate | 17.1 | 1 | ply 48 Rb2 (−264, best Kd7, endgame) | Italian Game |
| 13 | 1500 | white | 0-1 | 92 | checkmate | 87.3 | 6 | ply 7 exd5 (−698, best Qe2, opening) | Ruy Lopez, Morphy Defence |
| 14 | 1500 | black | 0-1 | 62 | checkmate | 25.6 | 0 | ply 46 Qxc4 (−126, best Nf4, middlegame) | Ruy Lopez, Morphy Defence |
| 15 | 1600 | white | 1-0 | 59 | checkmate | 43.6 | 1 | ply 55 Re7+ (−584, best Re7+, endgame) | Ruy Lopez, Morphy Defence |
| 16 | 1600 | black | 1/2-1/2 | 274 | threefold repetition | 127.7 | 17 | ply 190 Kg6 (−2000, best Kg6, endgame) | Ruy Lopez, Morphy Defence |
| 17 | 1700 | white | 1-0 | 99 | checkmate | 62.6 | 2 | ply 91 d8=Q (−1176, best d8=Q, endgame) | Ruy Lopez, Morphy Defence |
| 18 | 1700 | black | 0-1 | 42 | checkmate | 29.3 | 0 | ply 18 Bxc3 (−183, best O-O, opening) | Ruy Lopez, Morphy Defence |
| 19 | 1500 | white | 1-0 | 94 | checkmate | 20.0 | 0 | ply 26 Kd4 (−135, best Kf3, middlegame) | Scotch Game |
| 20 | 1500 | black | 0-1 | 83 | checkmate | 44.0 | 3 | ply 37 Rd7 (−407, best Be6, middlegame) | Scotch Game |
| 21 | 1600 | white | 1-0 | 70 | checkmate | 52.2 | 1 | ply 62 c7 (−1263, best Bg5, endgame) | Scotch Game |
| 22 | 1600 | black | 0-1 | 43 | checkmate | 41.5 | 2 | ply 15 Bf5 (−403, best Bg4, opening) | Scotch Game |
| 23 | 1700 | white | 0-1 | 69 | checkmate | 81.3 | 5 | ply 46 Bc1 (−354, best Ba3, middlegame) | Scotch Game |
| 24 | 1700 | black | 1-0 | 58 | checkmate | 147.9 | 6 | ply 31 Bd6 (−1154, best Ne4, middlegame) | Scotch Game |
| 25 | 1500 | white | 1-0 | 71 | checkmate | 42.2 | 3 | ply 57 Bxb8 (−370, best Be3+, middlegame) | Petroff Defence |
| 26 | 1500 | black | 0-1 | 104 | checkmate | 33.0 | 3 | ply 66 h6 (−207, best e4, endgame) | Petroff Defence |
| 27 | 1600 | white | 1-0 | 61 | checkmate | 29.2 | 0 | ply 35 Bxa7 (−189, best Qg4, middlegame) | Petroff Defence |
| 28 | 1600 | black | 0-1 | 96 | checkmate | 45.5 | 3 | ply 82 Rxe2 (−525, best Re3+, middlegame) | Petroff Defence |
| 29 | 1700 | white | 1-0 | 55 | checkmate | 58.2 | 2 | ply 47 Qxf5 (−656, best exf6, middlegame) | Petroff Defence |
| 30 | 1700 | black | 0-1 | 50 | checkmate | 70.3 | 2 | ply 46 Bc4 (−980, best b1=Q, endgame) | Petroff Defence |

## Worst engine moves (all games)

- game 16 @1600 (black, 1/2-1/2) ply 190 **Kg6** lost 2000 cp, best Kg6, endgame, depth 8, 0.1579s, engine's own eval -705  
  `8/8/8/6k1/2p2Q2/1r5p/2K4B/8 b - - 19 95`
- game 16 @1600 (black, 1/2-1/2) ply 220 **Ke7** lost 2000 cp, best Ke7, endgame, depth 7, 0.1487s, engine's own eval -730  
  `8/3r4/5k2/8/8/2Q4p/2K4B/8 b - - 2 110`
- game 16 @1600 (black, 1/2-1/2) ply 230 **Ke6** lost 2000 cp, best Kf7, endgame, depth 7, 0.1904s, engine's own eval 0  
  `8/3rk3/8/Q7/8/7p/2K4B/8 b - - 12 115`
- game 16 @1600 (black, 1/2-1/2) ply 258 **Re8** lost 2000 cp, best Rf8, endgame, depth 6, 0.2357s, engine's own eval -770  
  `2r5/5k2/8/4Q3/1K6/8/7B/8 b - - 20 129`
- game 8 @1500 (black, 0-1) ply 72 **Nxd5** lost 1639 cp, best Nxd5, endgame, depth 7, 0.2355s, engine's own eval 3110  
  `r2r4/1pp2p2/1b1p1k2/3Pp3/p7/P1n2P2/3K3p/8 b - - 1 36`
- game 16 @1600 (black, 1/2-1/2) ply 218 **Rd7** lost 1591 cp, best Rd7, endgame, depth 6, 0.2355s, engine's own eval -725  
  `8/8/5k2/8/2Q5/3r3p/2K4B/8 b - - 0 109`
- game 21 @1600 (white, 1-0) ply 62 **c7** lost 1263 cp, best Bg5, endgame, depth 7, 0.2354s, engine's own eval 3100  
  `5k2/8/2P5/8/4N3/3K4/PP3PPP/R1B3R1 w - - 1 32`
- game 17 @1700 (white, 1-0) ply 91 **d8=Q** lost 1176 cp, best d8=Q, endgame, depth 7, 0.2357s, engine's own eval 1860  
  `8/3P2p1/R7/5kP1/3p1P1P/2r5/P1P3K1/2R5 w - - 0 46`
- game 24 @1700 (black, 1-0) ply 31 **Bd6** lost 1154 cp, best Ne4, middlegame, depth 6, 0.2357s, engine's own eval 150  
  `r1b2kr1/ppppbppp/5n2/8/P2B1q2/1BN5/1PP1QP2/RK2R3 b - - 2 16`
- game 30 @1700 (black, 0-1) ply 46 **Bc4** lost 980 cp, best b1=Q, endgame, depth 7, 0.1521s, engine's own eval 2770  
  `r4b1r/p3k1pp/3pbp2/2p5/5PB1/K2n2P1/1p1B3P/8 b - - 1 23`
- game 16 @1600 (black, 1/2-1/2) ply 234 **Rd8** lost 805 cp, best Re7, endgame, depth 6, 0.2356s, engine's own eval -710  
  `8/3r1k2/8/8/4Q3/7p/2K4B/8 b - - 16 117`
- game 10 @1600 (black, 0-1) ply 96 **Rxg2+** lost 752 cp, best Qxf3, middlegame, depth 6, 0.2356s, engine's own eval 690  
  `6k1/1pp3p1/2b4p/8/1Q6/3q1P1P/4r1PK/R7 b - - 9 48`

Annotated PGNs with `[%eval]` and best moves: `analysis/63ccb08/game_NN.pgn`.
