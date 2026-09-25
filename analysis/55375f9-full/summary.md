# Analysis of `55375f9-full`

elo **2396.8** ±209.2 · W/D/L 27/0/3 · target 2000 · wins@target 7 · 5.0s/move · avg depth 13.1 · 3091027 nps · host windows-amd64-Regenr

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 21.5 | 0 | 11 | 12.8 | 3.41s |
| middlegame | 730 | 35.4 | 15 | 51 | 12.8 | 3.33s |
| endgame | 316 | 33.5 | 13 | 8 | 13.9 | 2.88s |

## Where results were decided

- Losses: 3; the worst engine blunder fell in: endgame ×2, middlegame ×1
- Draws: 0; 0 of them were ≥ +1.5 for the engine at some point (wins slipped: none)
- Losses from a winning position (≥ +1.5 at some point): 0 
- Wins: 27 (game 1 @1900, game 2 @1900, game 3 @2000, game 5 @2100, game 6 @2100, game 7 @1900, game 8 @1900, game 10 @2000, game 11 @2100, game 12 @2100, game 13 @1900, game 14 @1900, game 15 @2000, game 16 @2000, game 17 @2100, game 18 @2100, game 19 @1900, game 20 @1900, game 21 @2000, game 23 @2100, game 24 @2100, game 25 @1900, game 26 @1900, game 27 @2000, game 28 @2000, game 29 @2100, game 30 @2100)

## Time and depth

- Engine used on average 3.241s of 5.0s per move (65%); max 4.755s; 0 moves within 3% of the limit.
- Depth: avg 13.1, min 2, max 127. Blunders at depth ≤ 13: 23 of 28.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1900 | white | 1-0 | 49 | checkmate | 15.1 | 0 | ply 39 Rae1 (−188, best Qe3, middlegame) | Start position |
| 2 | 1900 | black | 0-1 | 118 | checkmate | 24.7 | 0 | ply 78 f6 (−154, best c6, middlegame) | Start position |
| 3 | 2000 | white | 1-0 | 167 | checkmate | 12.2 | 0 | ply 61 Rbd1 (−100, best Bb2, middlegame) | Start position |
| 4 | 2000 | black | 1-0 | 101 | checkmate | 80.6 | 4 | ply 84 Kg8 (−619, best Kg8, middlegame) | Start position |
| 5 | 2100 | white | 1-0 | 93 | checkmate | 21.9 | 0 | ply 71 Rc1 (−134, best Bd2, middlegame) | Start position |
| 6 | 2100 | black | 0-1 | 56 | checkmate | 24.0 | 0 | ply 46 c3+ (−99, best c3+, middlegame) | Start position |
| 7 | 1900 | white | 1-0 | 69 | checkmate | 38.5 | 2 | ply 43 Rg1 (−320, best Kg3, middlegame) | Italian Game |
| 8 | 1900 | black | 0-1 | 80 | checkmate | 35.8 | 1 | ply 74 Rf2+ (−562, best Nd4, endgame) | Italian Game |
| 9 | 2000 | white | 0-1 | 104 | checkmate | 44.1 | 2 | ply 87 Rc2 (−381, best bxa5, endgame) | Italian Game |
| 10 | 2000 | black | 0-1 | 62 | checkmate | 46.5 | 1 | ply 54 Be4+ (−922, best Be4+, endgame) | Italian Game |
| 11 | 2100 | white | 1-0 | 65 | checkmate | 75.4 | 1 | ply 57 Nxh6+ (−2000, best Nxh6+, middlegame) | Italian Game |
| 12 | 2100 | black | 0-1 | 84 | checkmate | 65.7 | 3 | ply 48 hxg5 (−546, best Qg7, middlegame) | Italian Game |
| 13 | 1900 | white | 1-0 | 103 | checkmate | 36.0 | 0 | ply 59 b4 (−173, best Qc4, middlegame) | Ruy Lopez, Morphy Defence |
| 14 | 1900 | black | 0-1 | 60 | checkmate | 16.0 | 0 | ply 14 Bg4 (−81, best e4, opening) | Ruy Lopez, Morphy Defence |
| 15 | 2000 | white | 1-0 | 65 | checkmate | 22.0 | 0 | ply 55 Nd5 (−163, best Nc5, endgame) | Ruy Lopez, Morphy Defence |
| 16 | 2000 | black | 0-1 | 74 | checkmate | 6.8 | 0 | ply 28 Bxe3 (−70, best Bf5, middlegame) | Ruy Lopez, Morphy Defence |
| 17 | 2100 | white | 1-0 | 35 | checkmate | 60.9 | 1 | ply 33 Rxd4 (−651, best Bxd4, middlegame) | Ruy Lopez, Morphy Defence |
| 18 | 2100 | black | 0-1 | 44 | checkmate | 22.2 | 1 | ply 22 Kd7 (−270, best Be7, middlegame) | Ruy Lopez, Morphy Defence |
| 19 | 1900 | white | 1-0 | 132 | checkmate | 33.2 | 0 | ply 84 Nc1 (−181, best Bxh6, middlegame) | Scotch Game |
| 20 | 1900 | black | 0-1 | 59 | checkmate | 47.5 | 1 | ply 55 dxc2 (−691, best d2, endgame) | Scotch Game |
| 21 | 2000 | white | 1-0 | 148 | checkmate | 44.4 | 2 | ply 142 d7 (−1407, best d7, endgame) | Scotch Game |
| 22 | 2000 | black | 1-0 | 148 | checkmate | 34.6 | 3 | ply 117 Kd5 (−398, best Kd5, endgame) | Scotch Game |
| 23 | 2100 | white | 1-0 | 64 | checkmate | 15.3 | 0 | ply 46 Rxd7 (−81, best Bxd7+, middlegame) | Scotch Game |
| 24 | 2100 | black | 0-1 | 85 | checkmate | 21.6 | 0 | ply 69 Bxf3 (−154, best fxg3, endgame) | Scotch Game |
| 25 | 1900 | white | 1-0 | 117 | checkmate | 24.5 | 1 | ply 21 Bxc6 (−336, best Bd3, middlegame) | Petroff Defence |
| 26 | 1900 | black | 0-1 | 162 | checkmate | 23.1 | 2 | ply 152 c2 (−251, best Ra1+, endgame) | Petroff Defence |
| 27 | 2000 | white | 1-0 | 117 | checkmate | 27.7 | 2 | ply 107 dxc6 (−378, best dxc6, endgame) | Petroff Defence |
| 28 | 2000 | black | 0-1 | 106 | checkmate | 12.2 | 0 | ply 14 O-O-O (−89, best Bf6, opening) | Petroff Defence |
| 29 | 2100 | white | 1-0 | 53 | checkmate | 12.4 | 0 | ply 41 Qf7 (−81, best Qg4, middlegame) | Petroff Defence |
| 30 | 2100 | black | 0-1 | 60 | checkmate | 27.2 | 1 | ply 54 gxf4 (−231, best Nf3+, middlegame) | Petroff Defence |

## Worst engine moves (all games)

- game 11 @2100 (white, 1-0) ply 57 **Nxh6+** lost 2000 cp, best Nxh6+, middlegame, depth 10, 4.7508s, engine's own eval None  
  `5rk1/1p1P4/pPp4p/5q2/1P4N1/P3Q1P1/r6P/3RR1K1 w - - 5 29`
- game 21 @2000 (white, 1-0) ply 142 **d7** lost 1407 cp, best d7, endgame, depth 12, 0.4366s, engine's own eval None  
  `R7/6p1/3P3k/5P2/4P3/6pP/6P1/7K w - - 1 72`
- game 10 @2000 (black, 0-1) ply 54 **Be4+** lost 922 cp, best Be4+, endgame, depth 11, 2.3841s, engine's own eval None  
  `6k1/p4ppp/pq6/3p1b2/5B2/2r1PK1P/2P3P1/8 b - - 0 27`
- game 20 @1900 (black, 0-1) ply 55 **dxc2** lost 691 cp, best d2, endgame, depth 10, 0.4815s, engine's own eval None  
  `8/2p2p1p/p4k2/2n4b/P3p3/3p1P2/KPP4P/4r3 b - - 0 28`
- game 17 @2100 (white, 1-0) ply 33 **Rxd4** lost 651 cp, best Bxd4, middlegame, depth 6, 0.0043s, engine's own eval None  
  `4k3/2pr1pB1/p1Q5/8/3bP1pr/8/PPP2PP1/RN1R2K1 w - - 2 17`
- game 4 @2000 (black, 1-0) ply 84 **Kg8** lost 619 cp, best Kg8, middlegame, depth 12, 4.751s, engine's own eval None  
  `4rk2/2p3r1/1p1p1Q2/p4P2/2P3N1/5P2/3R4/6K1 b - - 1 42`
- game 8 @1900 (black, 0-1) ply 74 **Rf2+** lost 562 cp, best Nd4, endgame, depth 11, 0.3761s, engine's own eval None  
  `1N4k1/5pp1/7p/P3p3/6P1/4p3/2n4r/1R3K2 b - - 1 37`
- game 12 @2100 (black, 0-1) ply 48 **hxg5** lost 546 cp, best Qg7, middlegame, depth 13, 3.0757s, engine's own eval 253  
  `1rb2qk1/bpp2p2/p2p3p/P2Bn1PQ/1P2R2P/2Pp1P2/8/5R1K b - - 0 24`
- game 21 @2000 (white, 1-0) ply 140 **d6** lost 517 cp, best d6, endgame, depth 13, 4.7509s, engine's own eval None  
  `R7/6pk/8/3P1P2/4P3/6pP/6P1/7K w - - 0 71`
- game 4 @2000 (black, 1-0) ply 86 **Rf8** lost 507 cp, best Rf8, middlegame, depth 12, 4.7509s, engine's own eval None  
  `4r1k1/2p3r1/1p1p1Q2/p4P2/2P3N1/5P2/7R/6K1 b - - 3 43`
- game 4 @2000 (black, 1-0) ply 48 **b6** lost 483 cp, best Qxg4, middlegame, depth 12, 4.7511s, engine's own eval 169  
  `r3r1k1/1ppb1pp1/2np3p/p1n1pP2/2P1P1Nq/2PPBR2/4B1P1/3R1QK1 b - - 3 24`
- game 12 @2100 (black, 0-1) ply 30 **exd3** lost 476 cp, best d6, middlegame, depth 11, 2.9735s, engine's own eval 190  
  `r1bqr1k1/bppp1pp1/p1n4n/P2N2pQ/1P2p2P/1BPP4/5PP1/R1B2RK1 b - - 0 15`

Annotated PGNs with `[%eval]` and best moves: `analysis/55375f9-full/game_NN.pgn`.
