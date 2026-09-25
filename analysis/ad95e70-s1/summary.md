# Analysis of `ad95e70-s1`

elo **1784.6** ±143.5 · W/D/L 21/2/7 · target 1600 · wins@target 6 · 0.25s/move · avg depth 7.4 · 4967124 nps · host darwin-arm64-MacBook-Pro-som-tillhor-Regent.local

Stockfish 19 full strength, depth 14, evals in centipawns from the engine's side. Blunder ≥200, mistake ≥100, inaccuracy ≥50 cp lost.

## Engine move quality by phase

| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |
|---|---|---|---|---|---|---|
| opening | 300 | 35.9 | 11 | 18 | 6.5 | 0.19s |
| middlegame | 438 | 62.8 | 31 | 53 | 7.0 | 0.18s |
| endgame | 365 | 40.4 | 17 | 13 | 8.7 | 0.16s |

## Where results were decided

- Losses: 7; the worst engine blunder fell in: endgame ×1, middlegame ×5, opening ×1
- Draws: 2; 1 of them were ≥ +1.5 for the engine at some point (wins slipped: game 16)
- Draw terminations: threefold repetition ×1, insufficient material ×1
- Losses from a winning position (≥ +1.5 at some point): 3 (game 24, game 27, game 30)
- Wins: 21 (game 1 @1500, game 2 @1500, game 3 @1600, game 5 @1700, game 7 @1500, game 8 @1500, game 9 @1600, game 10 @1600, game 11 @1700, game 13 @1500, game 14 @1500, game 15 @1600, game 17 @1700, game 19 @1500, game 20 @1500, game 21 @1600, game 23 @1700, game 25 @1500, game 26 @1500, game 28 @1600, game 29 @1700)

## Time and depth

- Engine used on average 0.174s of 0.25s per move (70%); max 0.251s; 2 moves within 3% of the limit.
- Depth: avg 7.4, min 2, max 127. Blunders at depth ≤ 7: 45 of 59.

## Games

| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1500 | white | 1-0 | 33 | checkmate | 18.6 | 0 | ply 27 Rad1 (−86, best Qf7+, middlegame) | Sicilian, Open |
| 2 | 1500 | black | 0-1 | 42 | checkmate | 41.5 | 1 | ply 36 Be3 (−583, best Qe4, middlegame) | Sicilian, Open |
| 3 | 1600 | white | 1-0 | 95 | checkmate | 73.5 | 3 | ply 89 Qxh4+ (−1786, best Qxh4+, endgame) | Sicilian, Open |
| 4 | 1600 | black | 1-0 | 31 | checkmate | 80.1 | 2 | ply 22 Qxc3+ (−299, best Qxa1+, middlegame) | Sicilian, Open |
| 5 | 1700 | white | 1-0 | 45 | checkmate | 56.6 | 1 | ply 41 Qe5 (−924, best exf5, middlegame) | Sicilian, Open |
| 6 | 1700 | black | 1-0 | 81 | checkmate | 66.4 | 5 | ply 22 Be6 (−833, best f5, middlegame) | Sicilian, Open |
| 7 | 1500 | white | 1-0 | 45 | checkmate | 77.1 | 1 | ply 41 Bh4 (−1568, best Nxc7, middlegame) | Sicilian, Sveshnikov |
| 8 | 1500 | black | 0-1 | 52 | checkmate | 14.7 | 0 | ply 18 Bc5 (−120, best f6, opening) | Sicilian, Sveshnikov |
| 9 | 1600 | white | 1-0 | 151 | checkmate | 33.8 | 3 | ply 75 Ra1 (−260, best Ke5, endgame) | Sicilian, Sveshnikov |
| 10 | 1600 | black | 0-1 | 44 | checkmate | 18.5 | 0 | ply 28 Bg4 (−157, best O-O, middlegame) | Sicilian, Sveshnikov |
| 11 | 1700 | white | 1-0 | 37 | checkmate | 44.0 | 1 | ply 31 Kh1 (−563, best Kh1, middlegame) | Sicilian, Sveshnikov |
| 12 | 1700 | black | 1/2-1/2 | 78 | threefold repetition | 71.8 | 4 | ply 14 Qc8 (−282, best Qb6, opening) | Sicilian, Sveshnikov |
| 13 | 1500 | white | 1-0 | 73 | checkmate | 29.7 | 2 | ply 67 Nd3 (−575, best Kd2, endgame) | French Defence, Classical |
| 14 | 1500 | black | 0-1 | 56 | checkmate | 58.2 | 2 | ply 16 h6 (−430, best Nh5, opening) | French Defence, Classical |
| 15 | 1600 | white | 1-0 | 41 | checkmate | 12.6 | 0 | ply 21 Nxh7 (−75, best Nf3, middlegame) | French Defence, Classical |
| 16 | 1600 | black | 1/2-1/2 | 179 | insufficient material | 38.6 | 3 | ply 114 Ke6 (−256, best Bf5, endgame) | French Defence, Classical |
| 17 | 1700 | white | 1-0 | 59 | checkmate | 26.0 | 1 | ply 25 Bg3 (−250, best Bd2, middlegame) | French Defence, Classical |
| 18 | 1700 | black | 1-0 | 119 | checkmate | 59.3 | 2 | ply 28 Qa2 (−331, best Qa3, middlegame) | French Defence, Classical |
| 19 | 1500 | white | 1-0 | 77 | checkmate | 15.3 | 0 | ply 51 bxa3 (−93, best b3, middlegame) | Caro-Kann, Classical |
| 20 | 1500 | black | 0-1 | 60 | checkmate | 17.2 | 0 | ply 28 Rd7 (−170, best e3, middlegame) | Caro-Kann, Classical |
| 21 | 1600 | white | 1-0 | 99 | checkmate | 28.0 | 1 | ply 75 Nc4 (−237, best Nf5, endgame) | Caro-Kann, Classical |
| 22 | 1600 | black | 1-0 | 47 | checkmate | 85.1 | 2 | ply 38 Ne7 (−642, best Nf4, middlegame) | Caro-Kann, Classical |
| 23 | 1700 | white | 1-0 | 81 | checkmate | 35.3 | 1 | ply 17 Bg5 (−385, best Qf3, opening) | Caro-Kann, Classical |
| 24 | 1700 | black | 1-0 | 85 | checkmate | 115.2 | 7 | ply 64 Nd5 (−1643, best g5, endgame) | Caro-Kann, Classical |
| 25 | 1500 | white | 1-0 | 31 | checkmate | 12.7 | 0 | ply 19 Qxc7 (−48, best Bc6, opening) | Scandinavian Defence |
| 26 | 1500 | black | 0-1 | 120 | checkmate | 57.1 | 4 | ply 112 d1=Q+ (−755, best Bc3, endgame) | Scandinavian Defence |
| 27 | 1600 | white | 0-1 | 50 | checkmate | 92.9 | 4 | ply 37 g6 (−689, best Qf3, middlegame) | Scandinavian Defence |
| 28 | 1600 | black | 0-1 | 42 | checkmate | 62.0 | 1 | ply 36 Qe5 (−861, best Rxe1+, middlegame) | Scandinavian Defence |
| 29 | 1700 | white | 1-0 | 59 | checkmate | 25.8 | 1 | ply 39 Bg5+ (−242, best Qxh8, middlegame) | Scandinavian Defence |
| 30 | 1700 | black | 1-0 | 187 | checkmate | 52.3 | 7 | ply 18 Nd7 (−457, best Kd8, opening) | Scandinavian Defence |

## Worst engine moves (all games)

- game 3 @1600 (white, 1-0) ply 89 **Qxh4+** lost 1786 cp, best Qxh4+, endgame, depth 7, 0.2356s, engine's own eval 2055  
  `3Q4/6pk/4P3/8/7p/1P2B1P1/1Pb5/4R1K1 w - - 0 45`
- game 24 @1700 (black, 1-0) ply 64 **Nd5** lost 1643 cp, best g5, endgame, depth 8, 0.1139s, engine's own eval 115  
  `6rr/2R2p1p/P3pkp1/8/3p1BPP/2nB4/5P2/6K1 b - - 0 32`
- game 7 @1500 (white, 1-0) ply 41 **Bh4** lost 1568 cp, best Nxc7, middlegame, depth 6, 0.0401s, engine's own eval None  
  `3k4/p1q5/4Bp2/2pNp3/Q2pP3/6B1/PPP2PP1/1R3RK1 w - - 4 21`
- game 24 @1700 (black, 1-0) ply 62 **a5** lost 1008 cp, best g5, endgame, depth 8, 0.1116s, engine's own eval 190  
  `6rr/p1R2p1p/4pkp1/1P6/3p1BPP/2nB4/5P2/6K1 b - - 2 31`
- game 5 @1700 (white, 1-0) ply 41 **Qe5** lost 924 cp, best exf5, middlegame, depth 7, 0.1041s, engine's own eval 1900  
  `4kb1r/2B5/4p1pp/Q4p2/P3P3/8/1P3KPP/3RR3 w k - 0 21`
- game 28 @1600 (black, 0-1) ply 36 **Qe5** lost 861 cp, best Rxe1+, middlegame, depth 7, 0.1311s, engine's own eval 2660  
  `4kb1r/ppp3pp/4p3/8/P6P/8/2P2PP1/q1nrNK1R b k - 3 18`
- game 6 @1700 (black, 1-0) ply 22 **Be6** lost 833 cp, best f5, middlegame, depth 6, 0.2356s, engine's own eval 50  
  `r2q1rk1/pp3p1p/2n2p2/3bp2N/8/P1PB1P2/2P3PP/R2QK2R b KQ - 1 11`
- game 26 @1500 (black, 0-1) ply 112 **d1=Q+** lost 755 cp, best Bc3, endgame, depth 10, 0.2357s, engine's own eval 2115  
  `8/8/8/b5p1/8/1K3k2/3p4/8 b - - 3 56`
- game 27 @1600 (white, 0-1) ply 37 **g6** lost 689 cp, best Qf3, middlegame, depth 6, 0.2355s, engine's own eval 240  
  `2r2r1k/p1p3pp/b1NbR3/6P1/2PP1p1q/1Q5P/PP1B1P2/R5K1 w - - 0 19`
- game 22 @1600 (black, 1-0) ply 38 **Ne7** lost 642 cp, best Nf4, middlegame, depth 6, 0.2356s, engine's own eval -10  
  `r4b1r/pN3pp1/B1p2nn1/3bk3/1P1N3p/P3BP1P/6P1/2RR2K1 b - - 8 19`
- game 26 @1500 (black, 0-1) ply 110 **Ba5** lost 613 cp, best g4, endgame, depth 11, 0.2358s, engine's own eval 1820  
  `8/8/8/6p1/8/2b2k2/2Kp4/8 b - - 1 55`
- game 2 @1500 (black, 0-1) ply 36 **Be3** lost 583 cp, best Qe4, middlegame, depth 6, 0.1092s, engine's own eval 1885  
  `4k2r/pp3ppp/3n4/4q3/P5PP/8/1r1b1P2/3R1K1R b k - 0 18`

Annotated PGNs with `[%eval]` and best moves: `analysis/ad95e70-s1/game_NN.pgn`.
