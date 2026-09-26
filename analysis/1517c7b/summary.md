# Analysis of `1517c7b`

elo **2325.7** ±130.2 · W/D/L 9/6/15 · target 2400 · wins@target 2 · 0.25s/move · avg depth 11.4 · 2816438 nps · host windows-amd64-Regenr

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 46.4 | 15 | 27 | 9.1 | 0.21s |
| middlegame | 776 | 51.5 | 42 | 67 | 9.5 | 0.21s |
| endgame | 708 | 24.9 | 11 | 27 | 14.5 | 0.20s |

## Where results were decided

- Losses: 15; the worst engine blunder fell in: middlegame ×9, opening ×6
- Draws: 6; 2 of them were ≥ +1.5 for the engine at some point (wins slipped: game 17, game 27)
- Draw terminations: threefold repetition ×6
- Losses from a winning position (≥ +1.5 at some point): 3 (game 11, game 13, game 24)
- Wins: 9 (game 1 @2300, game 3 @2400, game 9 @2400, game 14 @2300, game 19 @2300, game 20 @2300, game 25 @2300, game 26 @2300, game 30 @2500)

## Time and depth

- Engine used on average 0.209s of 0.25s per move (83%); max 0.241s; 0 moves within 3% of the limit.
- Depth: avg 11.4, min 2, max 127. Blunders at depth ≤ 11: 61 of 68.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2300 | white | 1-0 | 119 | checkmate | 32.7 | 2 | ply 111 c8=Q+ (−642, best c8=Q+, endgame) | Start position |
| 2 | 2300 | black | 1-0 | 101 | checkmate | 47.3 | 1 | ply 76 e4 (−215, best Qe6, middlegame) | Start position |
| 3 | 2400 | white | 1-0 | 101 | checkmate | 26.4 | 1 | ply 13 Bxc6+ (−405, best Ba4, opening) | Start position |
| 4 | 2400 | black | 1-0 | 97 | checkmate | 40.9 | 1 | ply 34 O-O (−359, best e5, middlegame) | Start position |
| 5 | 2500 | white | 0-1 | 240 | checkmate | 34.8 | 4 | ply 43 Rc2 (−353, best fxe6+, middlegame) | Start position |
| 6 | 2500 | black | 1-0 | 201 | checkmate | 44.5 | 4 | ply 62 Bb4 (−344, best Bd7, middlegame) | Start position |
| 7 | 2300 | white | 0-1 | 170 | checkmate | 34.6 | 3 | ply 1 Bxf7+ (−393, best O-O, opening) | Italian Game |
| 8 | 2300 | black | 1-0 | 163 | checkmate | 51.6 | 4 | ply 140 Kg8 (−725, best Qb8, middlegame) | Italian Game |
| 9 | 2400 | white | 1-0 | 101 | checkmate | 52.4 | 3 | ply 91 h7 (−714, best h7, endgame) | Italian Game |
| 10 | 2400 | black | 1/2-1/2 | 64 | threefold repetition | 59.6 | 3 | ply 10 Bxh3 (−352, best h6, opening) | Italian Game |
| 11 | 2500 | white | 0-1 | 128 | checkmate | 64.9 | 6 | ply 17 Qc4 (−493, best Kg1, opening) | Italian Game |
| 12 | 2500 | black | 1-0 | 169 | checkmate | 37.3 | 3 | ply 10 d6 (−311, best a5, opening) | Italian Game |
| 13 | 2300 | white | 0-1 | 102 | checkmate | 48.6 | 0 | ply 13 Nfxe5 (−194, best Bxc5, opening) | Ruy Lopez, Morphy Defence |
| 14 | 2300 | black | 0-1 | 154 | checkmate | 35.5 | 3 | ply 148 Qg7+ (−679, best Qe4, endgame) | Ruy Lopez, Morphy Defence |
| 15 | 2400 | white | 0-1 | 130 | checkmate | 47.8 | 3 | ply 107 Kf1 (−746, best Kf1, middlegame) | Ruy Lopez, Morphy Defence |
| 16 | 2400 | black | 1-0 | 83 | checkmate | 44.6 | 1 | ply 64 Rf7 (−209, best Rf7, middlegame) | Ruy Lopez, Morphy Defence |
| 17 | 2500 | white | 1/2-1/2 | 74 | threefold repetition | 29.0 | 1 | ply 41 Nc4 (−225, best Qc2, middlegame) | Ruy Lopez, Morphy Defence |
| 18 | 2500 | black | 1/2-1/2 | 82 | threefold repetition | 19.5 | 0 | ply 40 c5 (−133, best Ke5, endgame) | Ruy Lopez, Morphy Defence |
| 19 | 2300 | white | 1-0 | 118 | checkmate | 21.8 | 1 | ply 74 Rh1 (−240, best Rf2, endgame) | Scotch Game |
| 20 | 2300 | black | 0-1 | 81 | checkmate | 45.7 | 1 | ply 69 Qxg2+ (−1147, best Qxg2+, middlegame) | Scotch Game |
| 21 | 2400 | white | 1/2-1/2 | 226 | threefold repetition | 24.3 | 1 | ply 28 Bxc7 (−372, best Rhe1, middlegame) | Scotch Game |
| 22 | 2400 | black | 1-0 | 100 | checkmate | 55.8 | 5 | ply 13 Qe4 (−393, best d5, opening) | Scotch Game |
| 23 | 2500 | white | 1/2-1/2 | 102 | threefold repetition | 32.6 | 1 | ply 30 Kf3 (−272, best Kd3, middlegame) | Scotch Game |
| 24 | 2500 | black | 1-0 | 104 | checkmate | 51.2 | 4 | ply 35 Qe7 (−604, best d5, middlegame) | Scotch Game |
| 25 | 2300 | white | 1-0 | 75 | checkmate | 48.8 | 2 | ply 65 Qg7+ (−891, best Qg7+, middlegame) | Petroff Defence |
| 26 | 2300 | black | 0-1 | 58 | checkmate | 27.0 | 0 | ply 10 Ne5 (−166, best Qxe2, opening) | Petroff Defence |
| 27 | 2400 | white | 1/2-1/2 | 231 | threefold repetition | 23.1 | 2 | ply 31 Bxh6 (−452, best a3, middlegame) | Petroff Defence |
| 28 | 2400 | black | 1-0 | 73 | checkmate | 61.1 | 3 | ply 10 Nxf2 (−347, best gxf3, opening) | Petroff Defence |
| 29 | 2500 | white | 0-1 | 80 | checkmate | 78.2 | 5 | ply 59 Qxf8+ (−761, best Qe6+, middlegame) | Petroff Defence |
| 30 | 2500 | black | 0-1 | 42 | checkmate | 25.5 | 0 | ply 24 Bf5 (−171, best Qb2+, middlegame) | Petroff Defence |

## Worst engine moves (all games)

- game 20 @2300 (black, 0-1) ply 69 **Qxg2+** lost 1147 cp, best Qxg2+, middlegame, depth 13, 0.1702s, engine's own eval 2163  
  `8/p5kp/2pRbr2/6p1/2p2pq1/8/6Q1/5K2 b - - 0 35`
- game 25 @2300 (white, 1-0) ply 65 **Qg7+** lost 891 cp, best Qg7+, middlegame, depth 9, 0.235s, engine's own eval None  
  `r3qn2/1Q6/5k2/p2p1N2/P4n2/1PNB2P1/2P5/6K1 w - - 4 33`
- game 29 @2500 (white, 0-1) ply 59 **Qxf8+** lost 761 cp, best Qe6+, middlegame, depth 9, 0.1566s, engine's own eval -1197  
  `4kr2/pp1r4/3b3Q/4q1P1/2p1P3/3nR2P/PP1P4/R1B3K1 w - - 5 30`
- game 15 @2400 (white, 0-1) ply 107 **Kf1** lost 746 cp, best Kf1, middlegame, depth 10, 0.1909s, engine's own eval -1036  
  `5k2/2pr4/5P2/1P3P2/2bq4/7p/2Q1R2P/4K3 w - - 4 54`
- game 8 @2300 (black, 1-0) ply 140 **Kg8** lost 725 cp, best Qb8, middlegame, depth 10, 0.2359s, engine's own eval -1042  
  `4q2k/6p1/8/6Nb/4p2p/4B2Q/6P1/5BK1 b - - 8 70`
- game 9 @2400 (white, 1-0) ply 91 **h7** lost 714 cp, best h7, endgame, depth 10, 0.2359s, engine's own eval 1764  
  `5k2/5P2/2pNb2P/p1P5/P2PR1P1/r7/5K2/8 w - - 3 46`
- game 14 @2300 (black, 0-1) ply 148 **Qg7+** lost 679 cp, best Qe4, endgame, depth 12, 0.179s, engine's own eval 2246  
  `8/1q6/3R4/1kp5/p6p/8/3p4/6K1 b - - 1 74`
- game 1 @2300 (white, 1-0) ply 111 **c8=Q+** lost 642 cp, best c8=Q+, endgame, depth 8, 0.1813s, engine's own eval None  
  `8/2P5/P1k5/P1B3p1/8/4P3/8/7K w - - 1 56`
- game 24 @2500 (black, 1-0) ply 35 **Qe7** lost 604 cp, best d5, middlegame, depth 9, 0.2197s, engine's own eval 280  
  `r3rqk1/pp3ppp/3p4/2p5/1P6/2B2N2/bP1QBK1P/R7 b - - 1 18`
- game 29 @2500 (white, 0-1) ply 17 **Qg3** lost 535 cp, best Qf4, opening, depth 10, 0.1534s, engine's own eval 145  
  `r1bqkn1r/pp2b1pp/2p2p2/3pQB2/8/8/PPPP1PPP/RNB1R1K1 w kq - 0 9`
- game 11 @2500 (white, 0-1) ply 17 **Qc4** lost 493 cp, best Kg1, opening, depth 8, 0.1784s, engine's own eval 373  
  `r1b1k2r/pp1p2pp/2p5/4N3/1b1Pn2q/8/PPP1QPPP/RNB2R1K w - - 0 9`
- game 8 @2300 (black, 1-0) ply 142 **Bg6** lost 478 cp, best Qc6, middlegame, depth 11, 0.2361s, engine's own eval -891  
  `4q1k1/6p1/8/5QNb/4p2p/4B3/6P1/5BK1 b - - 10 71`

Annotated PGNs with `[%eval]` and best moves: `analysis/1517c7b/game_NN.pgn`.
