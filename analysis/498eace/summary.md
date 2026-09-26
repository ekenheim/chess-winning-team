# Analysis of `498eace`

elo **1800.4** ±146.4 · W/D/L 20/5/5 · target 1600 · wins@target 7 · 0.25s/move · avg depth 6.0 · 4044545 nps · host windows-amd64-Regenr

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 36.5 | 9 | 19 | 5.5 | 0.20s |
| middlegame | 552 | 69.6 | 57 | 52 | 5.7 | 0.19s |
| endgame | 333 | 41.0 | 10 | 18 | 7.0 | 0.18s |

## Where results were decided

- Losses: 5; the worst engine blunder fell in: endgame ×1, middlegame ×4
- Draws: 5; 1 of them were ≥ +1.5 for the engine at some point (wins slipped: game 29)
- Draw terminations: threefold repetition ×5
- Losses from a winning position (≥ +1.5 at some point): 0 
- Wins: 20 (game 1 @1500, game 2 @1500, game 4 @1600, game 5 @1700, game 6 @1700, game 10 @1600, game 11 @1700, game 12 @1700, game 13 @1500, game 14 @1500, game 15 @1600, game 16 @1600, game 17 @1700, game 18 @1700, game 19 @1500, game 20 @1500, game 21 @1600, game 22 @1600, game 24 @1700, game 28 @1600)

## Time and depth

- Engine used on average 0.187s of 0.25s per move (75%); max 0.239s; 0 moves within 3% of the limit.
- Depth: avg 6.0, min 2, max 127. Blunders at depth ≤ 6: 62 of 76.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1500 | white | 1-0 | 53 | checkmate | 26.8 | 0 | ply 23 O-O (−108, best a3, middlegame) | Start position |
| 2 | 1500 | black | 0-1 | 66 | checkmate | 21.0 | 0 | ply 46 Bg4 (−179, best Rfe8, middlegame) | Start position |
| 3 | 1600 | white | 0-1 | 152 | checkmate | 64.4 | 5 | ply 135 Kb2 (−944, best g6, endgame) | Start position |
| 4 | 1600 | black | 0-1 | 60 | checkmate | 41.5 | 1 | ply 54 Rf1 (−688, best Rf6, middlegame) | Start position |
| 5 | 1700 | white | 1-0 | 77 | checkmate | 40.9 | 1 | ply 61 Qg4 (−271, best Bg4, middlegame) | Start position |
| 6 | 1700 | black | 0-1 | 88 | checkmate | 17.2 | 1 | ply 46 d3 (−314, best a5, middlegame) | Start position |
| 7 | 1500 | white | 0-1 | 102 | checkmate | 87.3 | 11 | ply 69 c5 (−470, best Na7+, middlegame) | Italian Game |
| 8 | 1500 | black | 1/2-1/2 | 134 | threefold repetition | 40.4 | 1 | ply 8 Bg4 (−622, best a6, opening) | Italian Game |
| 9 | 1600 | white | 0-1 | 38 | checkmate | 86.1 | 4 | ply 21 Nxa8 (−496, best Be6, middlegame) | Italian Game |
| 10 | 1600 | black | 0-1 | 114 | checkmate | 48.0 | 3 | ply 46 Qxf1+ (−429, best Qg6, middlegame) | Italian Game |
| 11 | 1700 | white | 1-0 | 71 | checkmate | 114.2 | 5 | ply 53 axb7 (−1580, best Nf1, middlegame) | Italian Game |
| 12 | 1700 | black | 0-1 | 120 | checkmate | 28.4 | 2 | ply 80 Rc2 (−213, best Ra3, endgame) | Italian Game |
| 13 | 1500 | white | 1-0 | 47 | checkmate | 39.4 | 1 | ply 31 Bxc7 (−222, best O-O, middlegame) | Ruy Lopez, Morphy Defence |
| 14 | 1500 | black | 0-1 | 76 | checkmate | 32.5 | 1 | ply 50 Qb6 (−366, best Re3, middlegame) | Ruy Lopez, Morphy Defence |
| 15 | 1600 | white | 1-0 | 29 | checkmate | 15.3 | 0 | ply 13 Qd2 (−87, best Bf4, opening) | Ruy Lopez, Morphy Defence |
| 16 | 1600 | black | 0-1 | 66 | checkmate | 71.5 | 2 | ply 58 Rb2+ (−1055, best Rb2+, middlegame) | Ruy Lopez, Morphy Defence |
| 17 | 1700 | white | 1-0 | 57 | checkmate | 67.4 | 1 | ply 9 Nxf7 (−393, best d4, opening) | Ruy Lopez, Morphy Defence |
| 18 | 1700 | black | 0-1 | 62 | checkmate | 91.1 | 1 | ply 56 Rf8 (−1843, best Rh1+, endgame) | Ruy Lopez, Morphy Defence |
| 19 | 1500 | white | 1-0 | 108 | checkmate | 23.3 | 0 | ply 44 Re1 (−152, best a4, endgame) | Scotch Game |
| 20 | 1500 | black | 0-1 | 81 | checkmate | 72.6 | 6 | ply 43 Nxg4 (−889, best Rgd8, middlegame) | Scotch Game |
| 21 | 1600 | white | 1-0 | 90 | checkmate | 31.4 | 1 | ply 82 bxc5 (−572, best bxc5, endgame) | Scotch Game |
| 22 | 1600 | black | 0-1 | 73 | checkmate | 44.1 | 3 | ply 13 Nxa1 (−381, best Qg4+, opening) | Scotch Game |
| 23 | 1700 | white | 1/2-1/2 | 112 | threefold repetition | 32.6 | 2 | ply 38 Ra3 (−210, best Ba4, middlegame) | Scotch Game |
| 24 | 1700 | black | 0-1 | 59 | checkmate | 62.6 | 2 | ply 35 Bxg2 (−542, best Ke7, middlegame) | Scotch Game |
| 25 | 1500 | white | 0-1 | 86 | checkmate | 88.4 | 6 | ply 75 Qxf7+ (−1086, best dxe5, middlegame) | Petroff Defence |
| 26 | 1500 | black | 1-0 | 47 | checkmate | 126.3 | 4 | ply 36 Rd7 (−1314, best Qc6, middlegame) | Petroff Defence |
| 27 | 1600 | white | 1/2-1/2 | 93 | threefold repetition | 57.7 | 3 | ply 89 Rf5+ (−272, best Rh5, endgame) | Petroff Defence |
| 28 | 1600 | black | 0-1 | 48 | checkmate | 18.8 | 0 | ply 40 Nf5 (−85, best Rxd4, middlegame) | Petroff Defence |
| 29 | 1700 | white | 1/2-1/2 | 69 | threefold repetition | 58.1 | 2 | ply 27 f3 (−483, best Qxg7, middlegame) | Petroff Defence |
| 30 | 1700 | black | 1/2-1/2 | 82 | threefold repetition | 81.9 | 7 | ply 10 Nxh1 (−410, best Nxf1, opening) | Petroff Defence |

## Worst engine moves (all games)

- game 18 @1700 (black, 0-1) ply 56 **Rf8** lost 1843 cp, best Rh1+, endgame, depth 6, 0.2359s, engine's own eval 515  
  `r7/2p3p1/p7/R3pn2/1pk1p3/4B1p1/PP4Pr/4RK2 b - - 1 28`
- game 11 @1700 (white, 1-0) ply 53 **axb7** lost 1580 cp, best Nf1, middlegame, depth 7, 0.1546s, engine's own eval 695  
  `r4k2/pp6/P1p5/2p1p3/4PqP1/2PPN2r/1P1Q1P2/R3R1K1 w - - 1 27`
- game 26 @1500 (black, 1-0) ply 36 **Rd7** lost 1314 cp, best Qc6, middlegame, depth 5, 0.236s, engine's own eval -20  
  `2krb2r/R1p2ppp/1p3n2/1q1p4/5B2/1PPP3P/4BPP1/Q4RK1 b - - 2 18`
- game 25 @1500 (white, 0-1) ply 75 **Qxf7+** lost 1086 cp, best dxe5, middlegame, depth 5, 0.2357s, engine's own eval -125  
  `4r1k1/5pp1/2p4p/p1N1r3/P1QP2q1/8/2P2P2/3R1R1K w - - 5 38`
- game 16 @1600 (black, 0-1) ply 58 **Rb2+** lost 1055 cp, best Rb2+, middlegame, depth 6, 0.1375s, engine's own eval 1630  
  `1r4k1/4rppp/p7/3Q4/2p5/P3q1PP/7K/3R4 b - - 3 29`
- game 3 @1600 (white, 0-1) ply 135 **Kb2** lost 944 cp, best g6, endgame, depth 9, 0.1756s, engine's own eval -1325  
  `8/8/4p3/4PkP1/1b6/3p2Bp/2p5/2K5 w - - 3 68`
- game 20 @1500 (black, 0-1) ply 43 **Nxg4** lost 889 cp, best Rgd8, middlegame, depth 6, 0.2359s, engine's own eval 1065  
  `r5r1/ppk1Bppp/3p4/3Qn3/P5P1/8/1P3PK1/q7 b - - 1 22`
- game 11 @1700 (white, 1-0) ply 45 **Bxe6** lost 754 cp, best fxg4, middlegame, depth 6, 0.1457s, engine's own eval 525  
  `r4k2/pp1n1r2/2p1p3/P1p1p3/2B1Pqp1/2PPNP2/1P1Q1P2/R3R1K1 w - - 0 23`
- game 25 @1500 (white, 0-1) ply 69 **Qxc4** lost 718 cp, best Rcd1, middlegame, depth 6, 0.1588s, engine's own eval 230  
  `4r1k1/5pp1/2p2q1p/p1N5/P1pP4/2Q5/2P1rPK1/2R2R2 w - - 4 35`
- game 4 @1600 (black, 0-1) ply 54 **Rf1** lost 688 cp, best Rf6, middlegame, depth 6, 0.1711s, engine's own eval 2275  
  `2b2r1r/p1p1k2p/2p5/6R1/2p1P3/P5P1/6PK/4q3 b - - 0 27`
- game 8 @1500 (black, 1/2-1/2) ply 8 **Bg4** lost 622 cp, best a6, opening, depth 5, 0.1084s, engine's own eval 55  
  `r1b1k1nr/ppp2ppp/1bnp1q2/4p3/PPB1P3/2P2N2/3P1PPP/RNBQ1RK1 b kq - 0 4`
- game 26 @1500 (black, 1-0) ply 38 **Kb7** lost 580 cp, best Kb7, middlegame, depth 6, 0.2359s, engine's own eval -45  
  `R1k1b2r/2pr1ppp/1p3n2/1q1p4/5B2/1PPP3P/4BPP1/Q4RK1 b - - 4 19`

Annotated PGNs with `[%eval]` and best moves: `analysis/498eace/game_NN.pgn`.
