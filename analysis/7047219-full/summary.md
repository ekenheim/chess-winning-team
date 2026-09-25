# Analysis of `7047219-full`

elo **1784.6** ±143.5 · W/D/L 21/2/7 · target 1600 · wins@target 8 · 5.0s/move · avg depth 7.5 · 3542134 nps · host windows-amd64-Regenr

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 28.2 | 3 | 18 | 6.9 | 3.93s |
| middlegame | 522 | 64.5 | 42 | 54 | 7.3 | 3.82s |
| endgame | 392 | 49.8 | 22 | 22 | 8.1 | 3.24s |

## Where results were decided

- Losses: 7; the worst engine blunder fell in: endgame ×1, middlegame ×6
- Draws: 2; 2 of them were ≥ +1.5 for the engine at some point (wins slipped: game 1, game 19)
- Draw terminations: threefold repetition ×2
- Losses from a winning position (≥ +1.5 at some point): 3 (game 11, game 12, game 15)
- Wins: 21 (game 2 @1500, game 4 @1600, game 5 @1700, game 6 @1700, game 8 @1500, game 9 @1600, game 10 @1600, game 13 @1500, game 14 @1500, game 16 @1600, game 18 @1700, game 21 @1600, game 22 @1600, game 23 @1700, game 24 @1700, game 25 @1500, game 26 @1500, game 27 @1600, game 28 @1600, game 29 @1700, game 30 @1700)

## Time and depth

- Engine used on average 3.659s of 5.0s per move (73%); max 4.753s; 0 moves within 3% of the limit.
- Depth: avg 7.5, min 2, max 13. Blunders at depth ≤ 7: 35 of 67.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1500 | white | 1/2-1/2 | 167 | threefold repetition | 37.8 | 3 | ply 59 Rd3 (−633, best Ba5, middlegame) | Start position |
| 2 | 1500 | black | 0-1 | 90 | checkmate | 57.7 | 3 | ply 32 Qxa4 (−474, best Qxd2+, middlegame) | Start position |
| 3 | 1600 | white | 0-1 | 78 | checkmate | 77.2 | 3 | ply 67 Red1 (−950, best c4, middlegame) | Start position |
| 4 | 1600 | black | 0-1 | 48 | checkmate | 93.8 | 1 | ply 44 O-O-O (−1655, best Qxg2, middlegame) | Start position |
| 5 | 1700 | white | 1-0 | 65 | checkmate | 19.5 | 0 | ply 25 Bb3 (−93, best Bxd7, middlegame) | Start position |
| 6 | 1700 | black | 0-1 | 74 | checkmate | 96.4 | 6 | ply 72 Ne2 (−1252, best Qxe3, endgame) | Start position |
| 7 | 1500 | white | 0-1 | 52 | checkmate | 111.4 | 5 | ply 37 Nd6 (−623, best f4, middlegame) | Italian Game |
| 8 | 1500 | black | 0-1 | 58 | checkmate | 27.8 | 0 | ply 50 Rxh4 (−171, best Nxc4, endgame) | Italian Game |
| 9 | 1600 | white | 1-0 | 37 | checkmate | 37.3 | 2 | ply 23 Bxf7+ (−285, best Bxf7+, middlegame) | Italian Game |
| 10 | 1600 | black | 0-1 | 102 | checkmate | 42.4 | 1 | ply 92 e2 (−784, best e2, endgame) | Italian Game |
| 11 | 1700 | white | 0-1 | 60 | checkmate | 86.0 | 4 | ply 37 Rad1 (−796, best f4, middlegame) | Italian Game |
| 12 | 1700 | black | 1-0 | 119 | checkmate | 47.0 | 5 | ply 32 Kf7 (−322, best e4, middlegame) | Italian Game |
| 13 | 1500 | white | 1-0 | 67 | checkmate | 23.6 | 0 | ply 57 Rxf7 (−179, best Rxf7, endgame) | Ruy Lopez, Morphy Defence |
| 14 | 1500 | black | 0-1 | 46 | checkmate | 57.6 | 2 | ply 36 Bxf2+ (−274, best Bb6, middlegame) | Ruy Lopez, Morphy Defence |
| 15 | 1600 | white | 0-1 | 72 | checkmate | 76.8 | 3 | ply 61 b5 (−826, best f5, endgame) | Ruy Lopez, Morphy Defence |
| 16 | 1600 | black | 0-1 | 102 | checkmate | 63.9 | 5 | ply 94 a2 (−1105, best Rb6, endgame) | Ruy Lopez, Morphy Defence |
| 17 | 1700 | white | 0-1 | 136 | checkmate | 38.8 | 3 | ply 41 h3 (−298, best g3, middlegame) | Ruy Lopez, Morphy Defence |
| 18 | 1700 | black | 0-1 | 68 | checkmate | 59.9 | 2 | ply 62 Rxg7+ (−770, best Rxg7+, endgame) | Ruy Lopez, Morphy Defence |
| 19 | 1500 | white | 1/2-1/2 | 83 | threefold repetition | 65.8 | 3 | ply 76 Qxc7 (−996, best Qa8+, middlegame) | Scotch Game |
| 20 | 1500 | black | 1-0 | 48 | checkmate | 48.1 | 1 | ply 31 Nf6 (−252, best Ke6, middlegame) | Scotch Game |
| 21 | 1600 | white | 1-0 | 46 | checkmate | 82.6 | 1 | ply 42 Kxe1 (−1357, best Kxe1, endgame) | Scotch Game |
| 22 | 1600 | black | 0-1 | 83 | checkmate | 27.2 | 0 | ply 43 Bc8 (−151, best Rd8+, middlegame) | Scotch Game |
| 23 | 1700 | white | 1-0 | 74 | checkmate | 26.7 | 0 | ply 14 Nd2 (−162, best g3, opening) | Scotch Game |
| 24 | 1700 | black | 0-1 | 119 | checkmate | 51.9 | 2 | ply 111 Qg1 (−952, best d4, endgame) | Scotch Game |
| 25 | 1500 | white | 1-0 | 25 | checkmate | 29.0 | 0 | ply 15 Bxf7 (−110, best Bd5, opening) | Petroff Defence |
| 26 | 1500 | black | 0-1 | 136 | checkmate | 52.2 | 7 | ply 78 Rf7 (−431, best Re1+, endgame) | Petroff Defence |
| 27 | 1600 | white | 1-0 | 47 | checkmate | 45.0 | 1 | ply 27 Rxb7 (−436, best Bd4, middlegame) | Petroff Defence |
| 28 | 1600 | black | 0-1 | 94 | checkmate | 15.5 | 0 | ply 72 Kh3 (−156, best Kg2, endgame) | Petroff Defence |
| 29 | 1700 | white | 1-0 | 61 | checkmate | 73.9 | 3 | ply 57 Be5 (−970, best Qxa7, middlegame) | Petroff Defence |
| 30 | 1700 | black | 0-1 | 164 | checkmate | 32.0 | 1 | ply 16 Bd6 (−264, best d4, opening) | Petroff Defence |

## Worst engine moves (all games)

- game 4 @1600 (black, 0-1) ply 44 **O-O-O** lost 1655 cp, best Qxg2, middlegame, depth 8, 2.9143s, engine's own eval None  
  `r3k2r/2p2ppp/p7/1p2p3/6n1/6PP/P1KB2R1/b4q2 b kq - 0 22`
- game 21 @1600 (white, 1-0) ply 42 **Kxe1** lost 1357 cp, best Kxe1, endgame, depth 8, 0.0859s, engine's own eval None  
  `6k1/2R2p2/2P2Bp1/7p/2P2P2/1B6/2P3PP/4rK1R w - - 1 22`
- game 6 @1700 (black, 0-1) ply 72 **Ne2** lost 1252 cp, best Qxe3, endgame, depth 4, 0.0023s, engine's own eval None  
  `3r2k1/2pb1ppp/p6P/P2p4/4p3/4P3/5qPK/2n5 b - - 0 36`
- game 16 @1600 (black, 0-1) ply 94 **a2** lost 1105 cp, best Rb6, endgame, depth 9, 4.7511s, engine's own eval 2050  
  `8/1pp3p1/4k1P1/8/2n1p3/p3P3/2P4K/1r6 b - - 1 47`
- game 19 @1500 (white, 1/2-1/2) ply 76 **Qxc7** lost 996 cp, best Qa8+, middlegame, depth 7, 4.7509s, engine's own eval 390  
  `5k2/2p3p1/2Qp1p1p/5r2/4P2P/P1B2q2/1PP4K/4R3 w - - 0 39`
- game 29 @1700 (white, 1-0) ply 57 **Be5** lost 970 cp, best Qxa7, middlegame, depth 8, 1.8799s, engine's own eval None  
  `1B4rk/pQ2R1b1/2p4p/2P3p1/6P1/8/P4P1P/1K3R2 w - - 0 29`
- game 24 @1700 (black, 0-1) ply 111 **Qg1** lost 952 cp, best d4, endgame, depth 9, 4.7509s, engine's own eval 2225  
  `8/p1p5/8/2kp1p2/8/3K3p/7P/2q5 b - - 1 56`
- game 3 @1600 (white, 0-1) ply 67 **Red1** lost 950 cp, best c4, middlegame, depth 8, 2.5727s, engine's own eval -395  
  `5r2/1pk5/p2p4/4p2p/4P3/P1P2qPQ/1P1p1r1P/R3R1K1 w - - 0 34`
- game 15 @1600 (white, 0-1) ply 61 **b5** lost 826 cp, best f5, endgame, depth 8, 4.7514s, engine's own eval 95  
  `3r4/1kp3p1/1pp1p3/4P1P1/1PP1KP1n/3r3P/4NR2/7R w - - 5 31`
- game 11 @1700 (white, 0-1) ply 37 **Rad1** lost 796 cp, best f4, middlegame, depth 7, 3.4253s, engine's own eval 240  
  `1r4k1/5rp1/p2p3p/1p1N4/3pP1qn/P7/1PPN1P1K/R3RQ2 w - - 0 19`
- game 10 @1600 (black, 0-1) ply 92 **e2** lost 784 cp, best e2, endgame, depth 10, 2.188s, engine's own eval 1730  
  `8/2p2pp1/pb5p/7P/2P5/4pk2/2K5/8 b - - 1 46`
- game 18 @1700 (black, 0-1) ply 62 **Rxg7+** lost 770 cp, best Rxg7+, endgame, depth 8, 0.2727s, engine's own eval None  
  `6rk/2p3B1/p1pbn3/4p3/p3P3/2PP1P2/5PK1/1q2N3 b - - 1 31`

Annotated PGNs with `[%eval]` and best moves: `analysis/7047219-full/game_NN.pgn`.
