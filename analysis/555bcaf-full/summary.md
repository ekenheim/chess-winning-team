# Analysis of `555bcaf-full`

elo **2400.4** ±146.4 · W/D/L 19/7/4 · target 2200 · wins@target 5 · 5.0s/move · avg depth 15.4 · 2595436 nps · host windows-amd64-Regenr

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 23.0 | 3 | 9 | 13.0 | 4.41s |
| middlegame | 626 | 43.2 | 25 | 46 | 13.0 | 4.33s |
| endgame | 783 | 17.6 | 10 | 17 | 18.1 | 4.27s |

## Where results were decided

- Losses: 4; the worst engine blunder fell in: endgame ×1, middlegame ×3
- Draws: 7; 3 of them were ≥ +1.5 for the engine at some point (wins slipped: game 7, game 21, game 24)
- Draw terminations: threefold repetition ×5, insufficient material ×1, fifty moves ×1
- Losses from a winning position (≥ +1.5 at some point): 0 
- Wins: 19 (game 1 @2100, game 2 @2100, game 3 @2200, game 6 @2300, game 8 @2100, game 9 @2200, game 10 @2200, game 11 @2300, game 13 @2100, game 14 @2100, game 15 @2200, game 18 @2300, game 19 @2100, game 20 @2100, game 23 @2300, game 25 @2100, game 27 @2200, game 29 @2300, game 30 @2300)

## Time and depth

- Engine used on average 4.320s of 5.0s per move (86%); max 4.956s; 966 moves within 3% of the limit.
- Depth: avg 15.4, min 2, max 127. Blunders at depth ≤ 15: 36 of 38.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2100 | white | 1-0 | 129 | checkmate | 29.7 | 1 | ply 45 Bxa4 (−349, best Qb7, middlegame) | Start position |
| 2 | 2100 | black | 0-1 | 74 | checkmate | 45.7 | 1 | ply 72 Qxc4 (−939, best Qxc4, middlegame) | Start position |
| 3 | 2200 | white | 1-0 | 153 | checkmate | 35.3 | 4 | ply 143 Rb7+ (−482, best Kd7, endgame) | Start position |
| 4 | 2200 | black | 1-0 | 101 | checkmate | 42.6 | 2 | ply 42 Nc6 (−309, best Nd5, middlegame) | Start position |
| 5 | 2300 | white | 1/2-1/2 | 157 | threefold repetition | 26.1 | 1 | ply 75 Ra1 (−201, best Rd2, middlegame) | Start position |
| 6 | 2300 | black | 0-1 | 144 | checkmate | 26.7 | 0 | ply 48 Nc4 (−197, best g6, middlegame) | Start position |
| 7 | 2100 | white | 1/2-1/2 | 149 | threefold repetition | 44.0 | 5 | ply 37 Qd1 (−626, best Qg5, middlegame) | Italian Game |
| 8 | 2100 | black | 0-1 | 84 | checkmate | 22.1 | 0 | ply 40 Qb3 (−154, best c3, middlegame) | Italian Game |
| 9 | 2200 | white | 1-0 | 59 | checkmate | 55.8 | 1 | ply 55 Bxg8 (−1330, best Bxg8, middlegame) | Italian Game |
| 10 | 2200 | black | 0-1 | 44 | checkmate | 16.0 | 0 | ply 12 c6 (−158, best Nexd5, opening) | Italian Game |
| 11 | 2300 | white | 1-0 | 37 | checkmate | 8.7 | 0 | ply 23 Rfe1 (−67, best Rad1, middlegame) | Italian Game |
| 12 | 2300 | black | 1/2-1/2 | 108 | threefold repetition | 15.8 | 0 | ply 42 Bxf2 (−92, best Kf8, middlegame) | Italian Game |
| 13 | 2100 | white | 1-0 | 61 | checkmate | 53.0 | 3 | ply 31 bxc7 (−409, best g3, middlegame) | Ruy Lopez, Morphy Defence |
| 14 | 2100 | black | 0-1 | 42 | checkmate | 24.4 | 0 | ply 24 Re5 (−130, best f5, middlegame) | Ruy Lopez, Morphy Defence |
| 15 | 2200 | white | 1-0 | 95 | checkmate | 20.1 | 0 | ply 47 Be3 (−139, best Rxe7+, endgame) | Ruy Lopez, Morphy Defence |
| 16 | 2200 | black | 1/2-1/2 | 162 | insufficient material | 33.3 | 3 | ply 114 Nc5 (−276, best Rf8, endgame) | Ruy Lopez, Morphy Defence |
| 17 | 2300 | white | 0-1 | 92 | checkmate | 41.7 | 2 | ply 73 Qd2 (−702, best Kf1, middlegame) | Ruy Lopez, Morphy Defence |
| 18 | 2300 | black | 0-1 | 60 | checkmate | 14.8 | 0 | ply 56 b2 (−122, best b2, endgame) | Ruy Lopez, Morphy Defence |
| 19 | 2100 | white | 1-0 | 64 | checkmate | 14.0 | 0 | ply 18 Qe1 (−85, best f4, opening) | Scotch Game |
| 20 | 2100 | black | 0-1 | 109 | checkmate | 26.1 | 0 | ply 45 Nxf3 (−143, best Qf4, middlegame) | Scotch Game |
| 21 | 2200 | white | 1/2-1/2 | 275 | fifty moves | 14.3 | 1 | ply 22 Ra1 (−217, best Ne2, middlegame) | Scotch Game |
| 22 | 2200 | black | 1-0 | 226 | checkmate | 43.4 | 5 | ply 211 Ke7 (−932, best Ba8, endgame) | Scotch Game |
| 23 | 2300 | white | 1-0 | 94 | checkmate | 35.7 | 1 | ply 92 g3 (−252, best Qh7, endgame) | Scotch Game |
| 24 | 2300 | black | 1/2-1/2 | 365 | threefold repetition | 6.1 | 0 | ply 75 Kd6 (−153, best c4, endgame) | Scotch Game |
| 25 | 2100 | white | 1-0 | 105 | checkmate | 20.8 | 1 | ply 41 Qxa7 (−370, best Qc6, middlegame) | Petroff Defence |
| 26 | 2100 | black | 1-0 | 83 | checkmate | 51.4 | 3 | ply 46 Ne7 (−283, best Nxd4, middlegame) | Petroff Defence |
| 27 | 2200 | white | 1-0 | 79 | checkmate | 26.6 | 2 | ply 67 Qh5+ (−263, best Rxa7, middlegame) | Petroff Defence |
| 28 | 2200 | black | 1/2-1/2 | 80 | threefold repetition | 26.7 | 0 | ply 54 Bf5 (−133, best Ne4, middlegame) | Petroff Defence |
| 29 | 2300 | white | 1-0 | 59 | checkmate | 60.9 | 1 | ply 55 Rh4+ (−1291, best Rh4+, middlegame) | Petroff Defence |
| 30 | 2300 | black | 0-1 | 118 | checkmate | 19.3 | 1 | ply 38 Nh6 (−244, best Qe6, middlegame) | Petroff Defence |

## Worst engine moves (all games)

- game 9 @2200 (white, 1-0) ply 55 **Bxg8** lost 1330 cp, best Bxg8, middlegame, depth 6, 0.0058s, engine's own eval None  
  `6rk/1p3B2/2p3pp/8/1Q2P3/2P5/RP3PPP/5RK1 w - - 0 28`
- game 29 @2300 (white, 1-0) ply 55 **Rh4+** lost 1291 cp, best Rh4+, middlegame, depth 10, 3.9415s, engine's own eval None  
  `8/2B1Q1pk/p5q1/8/1R6/8/P1P2PPP/5RK1 w - - 0 28`
- game 2 @2100 (black, 0-1) ply 72 **Qxc4** lost 939 cp, best Qxc4, middlegame, depth 8, 0.0369s, engine's own eval None  
  `4r1kr/5q1p/p7/8/2Q5/5PbP/P7/7K b - - 0 36`
- game 22 @2200 (black, 1-0) ply 211 **Ke7** lost 932 cp, best Ba8, endgame, depth 12, 4.9509s, engine's own eval None  
  `1Q6/P2k3p/7P/2P2P2/3p2p1/5b2/3K4/8 b - - 3 106`
- game 17 @2300 (white, 0-1) ply 73 **Qd2** lost 702 cp, best Kf1, middlegame, depth 11, 4.951s, engine's own eval -809  
  `1k5r/1pp5/p1n5/2PQ1p2/P6q/2P1r3/1P4P1/R2R2K1 w - - 1 37`
- game 7 @2100 (white, 1/2-1/2) ply 37 **Qd1** lost 626 cp, best Qg5, middlegame, depth 12, 4.9508s, engine's own eval 363  
  `3q3k/bBp3pp/3p1r2/4p3/3nP1p1/3P4/PPPQ1PPP/1R3RK1 w - - 0 19`
- game 3 @2200 (white, 1-0) ply 143 **Rb7+** lost 482 cp, best Kd7, endgame, depth 11, 4.9517s, engine's own eval None  
  `1r6/2R1P3/4K2R/1kP5/8/1P6/8/8 w - - 1 72`
- game 13 @2100 (white, 1-0) ply 31 **bxc7** lost 409 cp, best g3, middlegame, depth 10, 4.9509s, engine's own eval 299  
  `r4b1r/1kpq4/pPp1bp1n/8/3PPPp1/2QNB2p/1PP3PP/RN3RK1 w - - 0 16`
- game 3 @2200 (white, 1-0) ply 145 **e8=Q+** lost 383 cp, best e8=Q+, endgame, depth 11, 4.9519s, engine's own eval None  
  `8/1r2P3/4K2R/1kP5/8/1P6/8/8 w - - 0 73`
- game 7 @2100 (white, 1/2-1/2) ply 57 **Bf5** lost 372 cp, best Bd7, endgame, depth 15, 4.9511s, engine's own eval 39  
  `7k/b1p4p/3pBqp1/4p3/4P1P1/3P4/PPP2P1P/1R3RK1 w - - 4 29`
- game 7 @2100 (white, 1/2-1/2) ply 139 **Bh5** lost 371 cp, best Kg2, endgame, depth 13, 4.951s, engine's own eval 0  
  `8/P5kq/3b4/3P2p1/6B1/5P1K/7P/3R3R w - - 3 70`
- game 25 @2100 (white, 1-0) ply 41 **Qxa7** lost 370 cp, best Qc6, middlegame, depth 15, 4.9509s, engine's own eval 221  
  `1r6/pQpn1qkp/3b1pp1/B2P4/3P4/5N1P/PP3PP1/4R1K1 w - - 1 21`

Annotated PGNs with `[%eval]` and best moves: `analysis/555bcaf-full/game_NN.pgn`.
