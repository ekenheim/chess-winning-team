# Analysis of `36032fd-s1`

elo **1954.8** ±138.7 · W/D/L 19/4/7 · target 1800 · wins@target 6 · 0.25s/move · avg depth 7.3 · 2634918 nps · host windows-amd64-Regenr

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 33.5 | 7 | 20 | 6.1 | 0.19s |
| middlegame | 541 | 70.5 | 52 | 59 | 6.2 | 0.19s |
| endgame | 482 | 29.5 | 15 | 12 | 9.4 | 0.17s |

## Where results were decided

- Losses: 7; the worst engine blunder fell in: middlegame ×7
- Draws: 4; 3 of them were ≥ +1.5 for the engine at some point (wins slipped: game 9, game 17, game 19)
- Draw terminations: threefold repetition ×3, insufficient material ×1
- Losses from a winning position (≥ +1.5 at some point): 3 (game 6, game 7, game 23)
- Wins: 19 (game 1 @1700, game 2 @1700, game 3 @1800, game 4 @1800, game 5 @1900, game 8 @1700, game 10 @1800, game 11 @1900, game 12 @1900, game 13 @1700, game 14 @1700, game 16 @1800, game 20 @1700, game 21 @1800, game 24 @1900, game 25 @1700, game 27 @1800, game 29 @1900, game 30 @1900)

## Time and depth

- Engine used on average 0.183s of 0.25s per move (73%); max 0.259s; 11 moves within 3% of the limit.
- Depth: avg 7.3, min 2, max 127. Blunders at depth ≤ 7: 66 of 74.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1700 | white | 1-0 | 57 | checkmate | 77.0 | 3 | ply 49 Qe7+ (−978, best Qe7+, middlegame) | Sicilian, Open |
| 2 | 1700 | black | 0-1 | 92 | checkmate | 53.2 | 3 | ply 44 Rhe8 (−442, best g6, middlegame) | Sicilian, Open |
| 3 | 1800 | white | 1-0 | 95 | checkmate | 40.5 | 1 | ply 63 Rge1 (−457, best Qxf7, middlegame) | Sicilian, Open |
| 4 | 1800 | black | 0-1 | 118 | checkmate | 31.5 | 1 | ply 102 Qc1+ (−694, best Qc1+, endgame) | Sicilian, Open |
| 5 | 1900 | white | 1-0 | 121 | checkmate | 32.9 | 5 | ply 95 Rxf5 (−299, best Rg6+, endgame) | Sicilian, Open |
| 6 | 1900 | black | 1-0 | 79 | checkmate | 63.6 | 4 | ply 42 a6 (−433, best Kh8, middlegame) | Sicilian, Open |
| 7 | 1700 | white | 0-1 | 54 | checkmate | 88.8 | 3 | ply 25 Qxe7 (−615, best O-O, middlegame) | Sicilian, Sveshnikov |
| 8 | 1700 | black | 0-1 | 78 | checkmate | 64.7 | 3 | ply 72 d1=Q (−905, best d1=Q, endgame) | Sicilian, Sveshnikov |
| 9 | 1800 | white | 1/2-1/2 | 151 | threefold repetition | 34.6 | 2 | ply 27 Bxf7+ (−667, best g3, middlegame) | Sicilian, Sveshnikov |
| 10 | 1800 | black | 0-1 | 72 | checkmate | 64.4 | 1 | ply 64 gxh6 (−1432, best gxh6, endgame) | Sicilian, Sveshnikov |
| 11 | 1900 | white | 1-0 | 45 | checkmate | 16.5 | 0 | ply 17 Bxh7 (−172, best Bb3, opening) | Sicilian, Sveshnikov |
| 12 | 1900 | black | 0-1 | 52 | checkmate | 20.6 | 0 | ply 8 O-O (−124, best Qc7, opening) | Sicilian, Sveshnikov |
| 13 | 1700 | white | 1-0 | 69 | checkmate | 80.9 | 3 | ply 63 Ne8+ (−1026, best Rxd6, middlegame) | French Defence, Classical |
| 14 | 1700 | black | 0-1 | 82 | checkmate | 42.8 | 2 | ply 70 Rxe5 (−374, best Rh6, endgame) | French Defence, Classical |
| 15 | 1800 | white | 1/2-1/2 | 95 | threefold repetition | 66.5 | 2 | ply 87 Kf4 (−994, best exf6, endgame) | French Defence, Classical |
| 16 | 1800 | black | 0-1 | 52 | checkmate | 34.2 | 1 | ply 42 Rxf2+ (−374, best Bf1, endgame) | French Defence, Classical |
| 17 | 1900 | white | 1/2-1/2 | 363 | threefold repetition | 10.1 | 1 | ply 301 Be7 (−259, best Kb3, endgame) | French Defence, Classical |
| 18 | 1900 | black | 1-0 | 55 | checkmate | 87.2 | 2 | ply 46 Qxg3 (−572, best Be6, middlegame) | French Defence, Classical |
| 19 | 1700 | white | 1/2-1/2 | 117 | insufficient material | 26.0 | 1 | ply 105 Rf7+ (−227, best Rf7+, endgame) | Caro-Kann, Classical |
| 20 | 1700 | black | 0-1 | 116 | checkmate | 90.6 | 11 | ply 110 Qxd1 (−834, best Qxd1, endgame) | Caro-Kann, Classical |
| 21 | 1800 | white | 1-0 | 63 | checkmate | 24.9 | 1 | ply 57 Qf4 (−492, best Qf4, middlegame) | Caro-Kann, Classical |
| 22 | 1800 | black | 1-0 | 45 | checkmate | 133.5 | 6 | ply 38 Bxg5 (−495, best Nxc3, middlegame) | Caro-Kann, Classical |
| 23 | 1900 | white | 0-1 | 40 | checkmate | 71.8 | 2 | ply 29 Ne5 (−727, best Re1, middlegame) | Caro-Kann, Classical |
| 24 | 1900 | black | 0-1 | 78 | checkmate | 34.1 | 1 | ply 40 f6 (−499, best Bd6, middlegame) | Caro-Kann, Classical |
| 25 | 1700 | white | 1-0 | 75 | checkmate | 40.7 | 1 | ply 73 Qxd3 (−521, best Rxd8+, middlegame) | Scandinavian Defence |
| 26 | 1700 | black | 1-0 | 41 | checkmate | 151.4 | 6 | ply 36 Bxf1 (−997, best Rxb7, middlegame) | Scandinavian Defence |
| 27 | 1800 | white | 1-0 | 93 | checkmate | 74.7 | 3 | ply 87 Rxa3 (−1285, best Rxa3, middlegame) | Scandinavian Defence |
| 28 | 1800 | black | 1-0 | 81 | checkmate | 55.5 | 4 | ply 48 Qc5 (−475, best Ne4, middlegame) | Scandinavian Defence |
| 29 | 1900 | white | 1-0 | 97 | checkmate | 31.4 | 1 | ply 93 Qf8 (−599, best Qf3+, endgame) | Scandinavian Defence |
| 30 | 1900 | black | 0-1 | 62 | checkmate | 21.0 | 0 | ply 22 Nxg4 (−157, best Qc5, middlegame) | Scandinavian Defence |

## Worst engine moves (all games)

- game 10 @1800 (black, 0-1) ply 64 **gxh6** lost 1432 cp, best gxh6, endgame, depth 7, 0.236s, engine's own eval 2680  
  `r7/p4ppp/2kb3P/8/r4p2/5P2/2pp4/5RK1 b - - 0 32`
- game 27 @1800 (white, 1-0) ply 87 **Rxa3** lost 1285 cp, best Rxa3, middlegame, depth 6, 0.1242s, engine's own eval 2676  
  `2Q5/5pk1/1P2p3/2P3pp/4Q3/r7/1b2BPPP/R5K1 w - - 1 44`
- game 13 @1700 (white, 1-0) ply 63 **Ne8+** lost 1026 cp, best Rxd6, middlegame, depth 7, 0.2362s, engine's own eval 2413  
  `5b2/2k3N1/p2q1p2/1p3Q2/2p1N3/8/PPP2P1P/3R1RK1 w - - 1 32`
- game 26 @1700 (black, 1-0) ply 36 **Bxf1** lost 997 cp, best Rxb7, middlegame, depth 6, 0.2398s, engine's own eval 513  
  `1r2k2r/1Np2ppp/8/8/1Q2n2q/B1p2P2/B3b1PP/5RK1 b k - 0 18`
- game 15 @1800 (white, 1/2-1/2) ply 87 **Kf4** lost 994 cp, best exf6, endgame, depth 8, 0.2367s, engine's own eval 0  
  `4k3/1R1b4/4p3/2PpPp1r/6K1/3B4/2P4r/4R3 w - f6 0 44`
- game 1 @1700 (white, 1-0) ply 49 **Qe7+** lost 978 cp, best Qe7+, middlegame, depth 7, 0.2358s, engine's own eval 2627  
  `8/2N4k/3Qprp1/1R5p/8/2P5/P1P1pPPP/R5K1 w - - 1 25`
- game 8 @1700 (black, 0-1) ply 72 **d1=Q** lost 905 cp, best d1=Q, endgame, depth 8, 0.1562s, engine's own eval 1945  
  `1r4k1/1p3p1p/7p/8/6P1/7P/3p1PK1/2b5 b - - 0 36`
- game 20 @1700 (black, 0-1) ply 110 **Qxd1** lost 834 cp, best Qxd1, endgame, depth 9, 0.1135s, engine's own eval 1921  
  `8/k7/6PP/p7/P7/3K4/3p1b2/2qR4 b - - 0 55`
- game 23 @1900 (white, 0-1) ply 29 **Ne5** lost 727 cp, best Re1, middlegame, depth 6, 0.2359s, engine's own eval 379  
  `r3k2r/pp2bpp1/2N1p1p1/2P4n/1P3B2/6Pq/P1P1NP1P/R2Q1RK1 w kq - 1 15`
- game 4 @1800 (black, 0-1) ply 102 **Qc1+** lost 694 cp, best Qc1+, endgame, depth 7, 0.2365s, engine's own eval 1180  
  `8/4k3/3r4/1R2p1p1/4B3/2p2P2/2Kb4/7q b - - 1 51`
- game 9 @1800 (white, 1/2-1/2) ply 27 **Bxf7+** lost 667 cp, best g3, middlegame, depth 7, 0.2363s, engine's own eval 327  
  `5rk1/1Q3ppp/3p4/4p1q1/2B1P3/4b2b/PPP2PPP/R4RK1 w - - 0 14`
- game 7 @1700 (white, 0-1) ply 25 **Qxe7** lost 615 cp, best O-O, middlegame, depth 6, 0.1638s, engine's own eval 415  
  `5rk1/pb2bppp/8/8/3q2n1/P1N5/1PP1QPPP/R1B1K2R w KQ - 4 13`

Annotated PGNs with `[%eval]` and best moves: `analysis/36032fd-s1/game_NN.pgn`.
