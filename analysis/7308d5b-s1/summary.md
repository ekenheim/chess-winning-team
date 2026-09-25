# Analysis of `7308d5b-s1`

elo **1969.5** ±141.0 · W/D/L 20/3/7 · target 1800 · wins@target 6 · 0.25s/move · avg depth 7.9 · 3906245 nps · host windows-amd64-Regenr

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 34.2 | 9 | 11 | 6.2 | 0.19s |
| middlegame | 480 | 63.3 | 31 | 57 | 7.4 | 0.17s |
| endgame | 552 | 43.0 | 23 | 43 | 9.1 | 0.17s |

## Where results were decided

- Losses: 7; the worst engine blunder fell in: endgame ×2, middlegame ×5
- Draws: 3; 3 of them were ≥ +1.5 for the engine at some point (wins slipped: game 5, game 8, game 24)
- Draw terminations: threefold repetition ×3
- Losses from a winning position (≥ +1.5 at some point): 4 (game 6, game 15, game 20, game 22)
- Wins: 20 (game 1 @1700, game 2 @1700, game 3 @1800, game 4 @1800, game 7 @1700, game 9 @1800, game 11 @1900, game 13 @1700, game 14 @1700, game 17 @1900, game 18 @1900, game 19 @1700, game 21 @1800, game 23 @1900, game 25 @1700, game 26 @1700, game 27 @1800, game 28 @1800, game 29 @1900, game 30 @1900)

## Time and depth

- Engine used on average 0.174s of 0.25s per move (70%); max 0.244s; 11 moves within 3% of the limit.
- Depth: avg 7.9, min 2, max 127. Blunders at depth ≤ 8: 48 of 63.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1700 | white | 1-0 | 57 | checkmate | 41.7 | 1 | ply 49 Rxe6 (−504, best exf6+, endgame) | Sicilian, Open |
| 2 | 1700 | black | 0-1 | 50 | checkmate | 40.4 | 1 | ply 44 Qa7+ (−328, best Rc2, middlegame) | Sicilian, Open |
| 3 | 1800 | white | 1-0 | 105 | checkmate | 32.7 | 1 | ply 99 e8=Q (−537, best e8=Q, endgame) | Sicilian, Open |
| 4 | 1800 | black | 0-1 | 64 | checkmate | 35.0 | 1 | ply 58 d2 (−562, best d2, middlegame) | Sicilian, Open |
| 5 | 1900 | white | 1/2-1/2 | 79 | threefold repetition | 53.9 | 1 | ply 53 exd7 (−721, best Rf1, middlegame) | Sicilian, Open |
| 6 | 1900 | black | 1-0 | 107 | checkmate | 77.6 | 6 | ply 24 cxb2 (−794, best Qd7, middlegame) | Sicilian, Open |
| 7 | 1700 | white | 1-0 | 45 | checkmate | 12.6 | 0 | ply 29 Bg7 (−118, best dxe5, middlegame) | Sicilian, Sveshnikov |
| 8 | 1700 | black | 1/2-1/2 | 78 | threefold repetition | 78.6 | 4 | ply 18 Bg4+ (−540, best Nb4, opening) | Sicilian, Sveshnikov |
| 9 | 1800 | white | 1-0 | 39 | checkmate | 16.1 | 0 | ply 21 e5 (−149, best Qe3, middlegame) | Sicilian, Sveshnikov |
| 10 | 1800 | black | 1-0 | 223 | checkmate | 36.8 | 3 | ply 22 Nxd5 (−466, best Rac8, middlegame) | Sicilian, Sveshnikov |
| 11 | 1900 | white | 1-0 | 61 | checkmate | 60.3 | 2 | ply 51 Rxc6+ (−836, best Rxc6+, endgame) | Sicilian, Sveshnikov |
| 12 | 1900 | black | 1-0 | 167 | checkmate | 49.0 | 3 | ply 152 Bg7 (−736, best Bg3, endgame) | Sicilian, Sveshnikov |
| 13 | 1700 | white | 1-0 | 47 | checkmate | 58.0 | 1 | ply 45 Bd4 (−1214, best Rfxd1, middlegame) | French Defence, Classical |
| 14 | 1700 | black | 0-1 | 90 | checkmate | 45.7 | 2 | ply 88 Nd3 (−722, best Qb4+, endgame) | French Defence, Classical |
| 15 | 1800 | white | 0-1 | 166 | checkmate | 52.6 | 6 | ply 37 Na4 (−406, best Ne4, middlegame) | French Defence, Classical |
| 16 | 1800 | black | 1-0 | 75 | checkmate | 73.9 | 5 | ply 52 Nf5+ (−409, best Qe3+, middlegame) | French Defence, Classical |
| 17 | 1900 | white | 1-0 | 83 | checkmate | 35.0 | 2 | ply 39 dxc5 (−305, best Rd1, endgame) | French Defence, Classical |
| 18 | 1900 | black | 0-1 | 76 | checkmate | 53.8 | 1 | ply 74 Qde1 (−1284, best Qff4+, middlegame) | French Defence, Classical |
| 19 | 1700 | white | 1-0 | 45 | checkmate | 15.0 | 0 | ply 25 Bg5 (−99, best Ne7+, middlegame) | Caro-Kann, Classical |
| 20 | 1700 | black | 1-0 | 167 | checkmate | 39.5 | 4 | ply 54 Kd5 (−298, best Kf5, endgame) | Caro-Kann, Classical |
| 21 | 1800 | white | 1-0 | 53 | checkmate | 29.4 | 0 | ply 37 d5 (−197, best Na4, middlegame) | Caro-Kann, Classical |
| 22 | 1800 | black | 1-0 | 59 | checkmate | 65.0 | 2 | ply 36 c5 (−1056, best f6, middlegame) | Caro-Kann, Classical |
| 23 | 1900 | white | 1-0 | 87 | checkmate | 88.2 | 3 | ply 81 gxf5 (−1962, best gxf5, middlegame) | Caro-Kann, Classical |
| 24 | 1900 | black | 1/2-1/2 | 84 | threefold repetition | 88.8 | 5 | ply 76 Nf6 (−781, best Qe4+, middlegame) | Caro-Kann, Classical |
| 25 | 1700 | white | 1-0 | 69 | checkmate | 39.9 | 2 | ply 67 Rg7 (−393, best Rhxh7+, endgame) | Scandinavian Defence |
| 26 | 1700 | black | 0-1 | 90 | checkmate | 61.9 | 3 | ply 68 Rxd3 (−545, best Bf5, endgame) | Scandinavian Defence |
| 27 | 1800 | white | 1-0 | 37 | checkmate | 28.8 | 0 | ply 25 Be5 (−194, best Bxc7, middlegame) | Scandinavian Defence |
| 28 | 1800 | black | 0-1 | 140 | checkmate | 38.0 | 1 | ply 10 Qxb2 (−370, best Nd4, opening) | Scandinavian Defence |
| 29 | 1900 | white | 1-0 | 95 | checkmate | 31.1 | 1 | ply 87 Bb4+ (−589, best Bb4+, endgame) | Scandinavian Defence |
| 30 | 1900 | black | 0-1 | 118 | checkmate | 41.8 | 2 | ply 110 Rxd6 (−529, best b1=Q, endgame) | Scandinavian Defence |

## Worst engine moves (all games)

- game 23 @1900 (white, 1-0) ply 81 **gxf5** lost 1962 cp, best gxf5, middlegame, depth 7, 0.2359s, engine's own eval 3295  
  `Q7/p1P5/P4pp1/4pqk1/3P2Pp/8/1P2NP1P/RR5K w - - 1 41`
- game 18 @1900 (black, 0-1) ply 74 **Qde1** lost 1284 cp, best Qff4+, middlegame, depth 7, 0.2359s, engine's own eval 2770  
  `5rk1/p4p2/p5bp/3p4/3P2Q1/8/3q2PK/5q2 b - - 1 37`
- game 13 @1700 (white, 1-0) ply 45 **Bd4** lost 1214 cp, best Rfxd1, middlegame, depth 4, 0.0014s, engine's own eval None  
  `6k1/4Q1p1/p6p/1p1P4/8/P1N1B2P/5P1P/R2n1RK1 w - - 1 23`
- game 22 @1800 (black, 1-0) ply 36 **c5** lost 1056 cp, best f6, middlegame, depth 6, 0.2357s, engine's own eval 230  
  `r4r2/p4pkp/2p5/8/P1qp1N1Q/4b3/6PP/R4R1K b - - 3 18`
- game 11 @1900 (white, 1-0) ply 51 **Rxc6+** lost 836 cp, best Rxc6+, endgame, depth 7, 0.2359s, engine's own eval 1830  
  `4B3/8/pkp5/8/1P1RK2p/2R4P/P1P3P1/8 w - - 0 26`
- game 6 @1900 (black, 1-0) ply 24 **cxb2** lost 794 cp, best Qd7, middlegame, depth 6, 0.2358s, engine's own eval 215  
  `2kr1b1r/p4ppp/5n2/2p1pq2/Q7/P1p4P/NP3PP1/R1B1R1K1 b - - 1 12`
- game 24 @1900 (black, 1/2-1/2) ply 76 **Nf6** lost 781 cp, best Qe4+, middlegame, depth 6, 0.2357s, engine's own eval 285  
  `4n1kr/3R1pp1/7p/p1p1N3/2Bp1P2/4q1P1/6KP/5R2 b - - 3 38`
- game 12 @1900 (black, 1-0) ply 152 **Bg7** lost 736 cp, best Bg3, endgame, depth 10, 0.1056s, engine's own eval -1165  
  `8/5k1P/1P6/2R1b3/p2p4/P2K4/8/8 b - - 2 76`
- game 14 @1700 (black, 0-1) ply 88 **Nd3** lost 722 cp, best Qb4+, endgame, depth 4, 0.0015s, engine's own eval None  
  `8/ppp2pp1/6kp/8/P4n2/2q5/8/1K6 b - - 7 44`
- game 5 @1900 (white, 1/2-1/2) ply 53 **exd7** lost 721 cp, best Rf1, middlegame, depth 7, 0.2047s, engine's own eval 180  
  `3r4/k2r4/1p2P3/8/8/3n3Q/PPq2PPP/1R2R1K1 w - - 1 27`
- game 24 @1900 (black, 1/2-1/2) ply 56 **Qc7** lost 594 cp, best Qb4, middlegame, depth 6, 0.2357s, engine's own eval 120  
  `1r4kr/p4pp1/Rq2nn1p/2p1N3/2Qp4/6P1/1P3PBP/4R1K1 b - - 5 28`
- game 29 @1900 (white, 1-0) ply 87 **Bb4+** lost 589 cp, best Bb4+, endgame, depth 9, 0.1314s, engine's own eval 2170  
  `1Q2qk2/5pp1/8/3P3p/8/8/PP1B2PP/6K1 w - - 3 44`

Annotated PGNs with `[%eval]` and best moves: `analysis/7308d5b-s1/game_NN.pgn`.
