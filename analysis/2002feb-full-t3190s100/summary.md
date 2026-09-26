# Analysis of `2002feb-full-t3190s100`

elo **2978.0** ±141.7 · W/D/L 0/16/14 · target 3190 · wins@target 0 · 5.0s/move · avg depth 24.3 · 2588324 nps · host windows-amd64-Regenr

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 13.0 | 1 | 2 | 19.7 | 4.90s |
| middlegame | 903 | 25.3 | 6 | 43 | 20.6 | 4.90s |
| endgame | 1128 | 20.0 | 19 | 37 | 28.5 | 4.84s |

## Where results were decided

- Losses: 14; the worst engine blunder fell in: endgame ×11, middlegame ×3
- Draws: 16; 0 of them were ≥ +1.5 for the engine at some point (wins slipped: none)
- Draw terminations: threefold repetition ×13, insufficient material ×2, adjudicated draw at 400 plies ×1
- Losses from a winning position (≥ +1.5 at some point): 0 
- Wins: 0

## Time and depth

- Engine used on average 4.871s of 5.0s per move (97%); max 4.959s; 2316 moves within 3% of the limit.
- Depth: avg 24.3, min 11, max 127. Blunders at depth ≤ 24: 22 of 26.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 3090 | white | 1/2-1/2 | 123 | threefold repetition | 25.3 | 0 | ply 51 a4 (−195, best Nb4, middlegame) | Start position |
| 2 | 3090 | black | 1-0 | 165 | checkmate | 28.3 | 1 | ply 148 Rd6+ (−247, best Kf6, endgame) | Start position |
| 3 | 3190 | white | 1/2-1/2 | 99 | threefold repetition | 20.8 | 0 | ply 27 bxc5 (−91, best a4, middlegame) | Start position |
| 4 | 3190 | black | 1/2-1/2 | 158 | threefold repetition | 23.7 | 1 | ply 48 Ne7 (−217, best Re6, middlegame) | Start position |
| 5 | 3190 | white | 0-1 | 180 | checkmate | 15.5 | 2 | ply 155 a4 (−436, best Qb1+, endgame) | Start position |
| 6 | 3190 | black | 1/2-1/2 | 98 | threefold repetition | 54.3 | 2 | ply 90 Ka7 (−533, best Kb8, endgame) | Start position |
| 7 | 3090 | white | 1/2-1/2 | 148 | insufficient material | 5.0 | 0 | ply 97 c5 (−96, best Kb7, middlegame) | Italian Game |
| 8 | 3090 | black | 1-0 | 225 | checkmate | 24.5 | 1 | ply 190 Kf8 (−341, best a3, endgame) | Italian Game |
| 9 | 3190 | white | 1/2-1/2 | 129 | threefold repetition | 14.0 | 0 | ply 75 c5 (−67, best c5, endgame) | Italian Game |
| 10 | 3190 | black | 1-0 | 163 | checkmate | 22.3 | 1 | ply 130 Ke7 (−547, best Ke8, endgame) | Italian Game |
| 11 | 3190 | white | 0-1 | 110 | checkmate | 30.2 | 1 | ply 93 Rb1 (−286, best Ra1, endgame) | Italian Game |
| 12 | 3190 | black | 1-0 | 137 | checkmate | 36.9 | 2 | ply 112 Kd7 (−282, best Nd4, endgame) | Italian Game |
| 13 | 3090 | white | 0-1 | 132 | checkmate | 26.8 | 0 | ply 123 Qg1+ (−188, best c7, endgame) | Ruy Lopez, Morphy Defence |
| 14 | 3090 | black | 1-0 | 143 | checkmate | 27.5 | 2 | ply 94 Bc7 (−614, best Bf2, endgame) | Ruy Lopez, Morphy Defence |
| 15 | 3190 | white | 0-1 | 164 | checkmate | 30.3 | 2 | ply 125 Ke4 (−428, best Ke4, endgame) | Ruy Lopez, Morphy Defence |
| 16 | 3190 | black | 1/2-1/2 | 74 | threefold repetition | 32.8 | 0 | ply 68 Rb6 (−148, best Rb6, middlegame) | Ruy Lopez, Morphy Defence |
| 17 | 3190 | white | 0-1 | 136 | checkmate | 25.3 | 1 | ply 55 Rxd6 (−223, best Rf1, middlegame) | Ruy Lopez, Morphy Defence |
| 18 | 3190 | black | 1-0 | 181 | checkmate | 21.2 | 1 | ply 70 Nxd3 (−222, best Qf8, middlegame) | Ruy Lopez, Morphy Defence |
| 19 | 3090 | white | 1/2-1/2 | 116 | threefold repetition | 19.8 | 0 | ply 26 h5 (−119, best b3, middlegame) | Scotch Game |
| 20 | 3090 | black | 1/2-1/2 | 129 | threefold repetition | 30.8 | 1 | ply 99 Bd7 (−403, best Ba6, endgame) | Scotch Game |
| 21 | 3190 | white | 1/2-1/2 | 296 | threefold repetition | 4.8 | 0 | ply 22 Rb1 (−113, best a3, middlegame) | Scotch Game |
| 22 | 3190 | black | 1/2-1/2 | 400 | adjudicated draw at 400 plies | 3.7 | 0 | ply 383 Rg4 (−115, best f2, endgame) | Scotch Game |
| 23 | 3190 | white | 0-1 | 85 | checkmate | 25.7 | 1 | ply 70 a8=Q (−223, best Rg1, endgame) | Scotch Game |
| 24 | 3190 | black | 1-0 | 96 | checkmate | 35.5 | 2 | ply 69 a6 (−849, best Rb8, middlegame) | Scotch Game |
| 25 | 3090 | white | 1/2-1/2 | 193 | threefold repetition | 13.9 | 0 | ply 139 Rg2 (−143, best Rg6, endgame) | Petroff Defence |
| 26 | 3090 | black | 1/2-1/2 | 103 | insufficient material | 4.6 | 0 | ply 52 Rb4 (−42, best Ke7, endgame) | Petroff Defence |
| 27 | 3190 | white | 0-1 | 242 | checkmate | 22.9 | 2 | ply 205 Ke3 (−629, best Ke3, endgame) | Petroff Defence |
| 28 | 3190 | black | 1/2-1/2 | 128 | threefold repetition | 26.4 | 2 | ply 16 Bg4 (−265, best Rfe8, opening) | Petroff Defence |
| 29 | 3190 | white | 1/2-1/2 | 193 | threefold repetition | 24.1 | 0 | ply 161 Kxc5 (−169, best Ke7, endgame) | Petroff Defence |
| 30 | 3190 | black | 1/2-1/2 | 118 | threefold repetition | 28.1 | 1 | ply 114 Kc5 (−224, best Kb7, endgame) | Petroff Defence |

## Worst engine moves (all games)

- game 24 @3190 (black, 1-0) ply 69 **a6** lost 849 cp, best Rb8, middlegame, depth 18, 4.9021s, engine's own eval -216  
  `k3r3/p1p1q3/2P2pb1/3R1p1p/1p3Q1P/5BP1/P4P2/6K1 b - - 2 35`
- game 27 @3190 (white, 0-1) ply 205 **Ke3** lost 629 cp, best Ke3, endgame, depth 16, 4.9017s, engine's own eval None  
  `4b3/4P3/7p/8/3B4/1k4p1/p1pK4/8 w - - 0 103`
- game 14 @3090 (black, 1-0) ply 94 **Bc7** lost 614 cp, best Bf2, endgame, depth 22, 4.9023s, engine's own eval None  
  `6k1/5p2/1bp2P2/p3P3/P1p2K2/2P4R/8/8 b - - 0 47`
- game 10 @3190 (black, 1-0) ply 130 **Ke7** lost 547 cp, best Ke8, endgame, depth 20, 4.9018s, engine's own eval None  
  `8/5k2/1p6/5Q2/1p1p4/3P4/1P4PK/8 b - - 1 65`
- game 6 @3190 (black, 1/2-1/2) ply 90 **Ka7** lost 533 cp, best Kb8, endgame, depth 57, 4.9012s, engine's own eval -50  
  `4B3/1kp3p1/p5P1/3Q4/6P1/2p1P3/8/6K1 b - - 7 45`
- game 5 @3190 (white, 0-1) ply 155 **a4** lost 436 cp, best Qb1+, endgame, depth 22, 4.9016s, engine's own eval -30  
  `8/1p5k/2b2p2/P1P3pp/7P/P3BqP1/7K/6Q1 w - - 0 78`
- game 15 @3190 (white, 0-1) ply 125 **Ke4** lost 428 cp, best Ke4, endgame, depth 23, 4.9018s, engine's own eval None  
  `8/8/8/p7/P7/1k1K4/2p5/8 w - - 0 63`
- game 20 @3090 (black, 1/2-1/2) ply 99 **Bd7** lost 403 cp, best Ba6, endgame, depth 19, 4.902s, engine's own eval None  
  `2bk4/R6n/2p1p2P/p1P1B3/3p4/3B1P2/P7/6K1 b - - 3 50`
- game 6 @3190 (black, 1/2-1/2) ply 88 **Kb7** lost 379 cp, best Kb7, endgame, depth 18, 4.9015s, engine's own eval None  
  `4B3/k1p3p1/p5P1/Q7/6P1/2p1P3/8/6K1 b - - 5 44`
- game 8 @3090 (black, 1-0) ply 190 **Kf8** lost 341 cp, best a3, endgame, depth 17, 4.9018s, engine's own eval None  
  `6k1/5b2/7K/6P1/pp3R2/4B3/1P6/8 b - - 4 95`
- game 15 @3190 (white, 0-1) ply 127 **Kf5** lost 304 cp, best Ke5, endgame, depth 21, 4.9016s, engine's own eval None  
  `8/8/8/p7/k3K3/8/2p5/8 w - - 0 64`
- game 11 @3190 (white, 0-1) ply 93 **Rb1** lost 286 cp, best Ra1, endgame, depth 38, 4.9012s, engine's own eval None  
  `4r3/6pk/7p/7r/Pp6/5pP1/5P2/5RK1 w - - 0 47`

Annotated PGNs with `[%eval]` and best moves: `analysis/2002feb-full-t3190s100/game_NN.pgn`.
