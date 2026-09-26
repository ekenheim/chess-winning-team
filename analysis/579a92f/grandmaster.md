# Grandmaster review of run `579a92f` (5 wins, 10 draws, 15 losses vs Stockfish 19 @ 2900–3100, 0.25 s/move)

Move numbers below are the PGN's own (they restart at 1 from the book position given in the `[FEN]` tag), and `ply` is the ply in `moves.jsonl`. "Own" is the engine's reported score for the move it played; "SF" is full-strength Stockfish's `[%eval]` from the engine's side.

## 1. Headline

The run was not lost on tactics alone. The engine's evaluation is, on average, **1.5–2 pawns more optimistic than Stockfish in every phase and never the other way round** (751 middlegame plies: median own − SF = +92 cp; 432 early-endgame plies: +197; 521 endgame plies: +175; zero plies anywhere in which SF ≥ +1.5 while the engine thought ≤ +0.5). In games 11, 12, 14, 18, 19, 23 and 28 there were 11–19 plies each where SF said ≤ −1.5 and the engine said ≥ −0.5. Those stretches are pure positional blindness: nothing was hanging, the engine simply did not know that its structure, king or minor pieces were bad. The recurring chess causes, in order of damage:

1. **The king in the centre with queens on** (never castled in games 4, 13, 14, 19, 20, 22, 23, 24 — 0 wins from those 8; all five wins castled by move 8).
2. **Queen sorties and pawn grabs in the opening** (Scotch 4...Qh4/5...Qxe4 in 20, 22, 24; the queen tour in game 5; 14.Qxc6 in 13; 17...Qxc3 in 30; 10...Bxh3 in 12; 15.Nxc7 in 15).
3. **Pawn-structure blindness**: doubled, isolated and over-extended pawns are free (11, 14, 18, 23, 19, 21).
4. **Minor-piece quality**: the bishop pair is given away in 17 of 30 games at zero cost (B = 330 vs N = 320), bad bishops and knight outposts do not exist (18, 23, 29, 13/15/17).
5. **Piece activity**: open files, the seventh rank and trapped pieces are invisible (21, 28, 8, 1).
6. **Endgame technique**: the king goes to the centre instead of to the pawns; pieces are traded when worse; R vs B+N and pawn-down minor-piece endings are scored as "−1" when they are lost (11, 21, 23).

The draws are a different story: all nine repetition draws came from positions Stockfish had at −2.5 to −10 for the engine; the engine's repetition hunting (score 0 at depth 30–127 in games 4, 11, 18, 19, 22, 23) is *earning* half points. Only three draws were real slipped wins (15, 20, 25) and in each the win slipped in the middlegame, not by a premature repetition.

## 2. Strategic misunderstandings (with evidence)

### 2.1 King safety: the king that never castles, and the "queen off = safe" fallacy

The only castling incentive is +30 cp from `KING_MG_PST` (g1 = 30 vs e1 = 0), and the shield masks count d2/e2/f2 as a full shield for a king on e1, so an uncastled king with queens on looks perfectly safe. A pawn (+100) is always worth more than castling.

- **Game 19 (W, 2900)**: 9.Qe3? (best O-O-O), 10.exd6, 11.dxc7 (two pawns grabbed with the king on e1), 12.Be2?? (−99, O-O-O again) and 13.c5?? (−152). Black answered 13...Nc4 hitting Qe3, 14...Rfe8 and 15...Rxe3+ — an exchange sacrifice that left the king on f1/g1/f2 to be checked by the queen for forty moves. Own eval 0 to −30 at moves 12–17 while SF said −3 to −5.
- **Game 21 (W, 3000)**: 13.O-O-O? into the half-open b-file after 12...Rb8, 17.Kd1, then 18.Rg1?? (own +80, SF −5.12). Look at the board: rooks on b8/c8, Bf5, Qb7, and the engine puts its rook on g1. 19.Qd5 Qxd5 20.Rxd5 Rxb2 — the queen trade "solves" the danger term (it is gated on the enemy queen) but the rooks invade: Rb1+, Bb4, Bc4, and the ending a pawn down was −7.
- **Game 22 (B, 3000)**: the king stayed on e8 the whole game, the f8-bishop moved first on move 18, and at 17...Rg8?? (own +97, SF +3.5) Black had Rd6, Rg8, Nd5, Qb7: not one piece defending the king. 24.Rb8+ Rd8?? and mate down the b-file.
- **Game 24 (B, 3100)**: 8...Kd8 after 7.Nb5; 10...Qe7? 14...Qc6?? allowed 15.Rxe5! dxe5 16.Be4+ and the king walked f7/e7 for the rest of the game.
- **Game 29 (W, 3100)**: five bishop moves in the first six, 8.Nxe4? dxe4 9.Bxe4 Re8 — the e-file pin on Ke1; 10.Qe2? walked into it and 11.Bg5? f6 12.Bh4 Qe7 13.Nd2 g5 lost the bishop. Castled at move 14 into a lost game.
- **Game 28 (B, 3000)**: 8...h6? (−87, best O-O) then 10...O-O-O into the b-file that 4.bxc3 had opened, plus Ba3 on the a3–f8 diagonal; the engine then won the exchange (18...Bxa1) with own +36 while SF said +1.3 for White, because every white piece pointed at c8. 27...Qa4?? and 31...Rge8?? wandered off while Ra3–b3/Qb2 came.
- **Games 10 and 12 (B)**: 14...Qd7?? in 10 allowed 15.Bxf6 gxf6 16.Nf5 — one attacker (the knight), open g-file, doubled f-pawns; `king_danger` needs ≥ 2 attackers to pay anything, and an open file next to the king is not a concept. In 12 the engine gave up its own g-file (Bxh3, Bxf2) and never saw White's Rg2/Rfg1 battery coming (own +54 at move 15, SF +4.7).
- **Game 1 (W, 2900)**: 13.h3?? (−190) with Black's f4/g5/h5 storm arriving. The h3 pawn still counts as shield in `SHIELD` (it is the "two ranks in front" square), but it is a hook: 15.Nxg5? then opened the g-file for Rg7 and the king was mated on the g-file. Pawn storms and hooks are not modelled.

### 2.2 The queen out early and pawn grabbing without development

There is no development or tempo term, so a pawn grabbed on move 8 is worth +100 no matter what is still on the back rank.

- **Scotch as Black (20, 22, 24: 0/3)**: 4...Qh4 (own +16, SF +0.63) 5...Qxe4. In game 20 the queen made five of Black's first eight moves (Qh4, Qxe4, Qxg2, Qg6, …) with Ng8, Bc8, Ra8, Rh8 all at home and the king on d8; 13...Nxf3?? (own +152, SF −5) was punished by the quiet 14.Bf4! against c7. In game 24 the same line left the king on d8 and cost the exchange on e5.
- **Game 5 (W, 3100)**: 7.Qd3, 10.Qb5, 11.Ne5, 12.Nxc6, 13.Qxc6, 14.Qa6, 15.Qxa7, 16.Qa4, 20.Qb3, 23.Qxd5 — ten queen moves in the first 23 while Ra1 and Bc1 never moved; SF said 0.00 throughout, the engine +1.0 to +1.3 (two pawns). At 19.c5?? (own +226, SF −6.86) Black had Rh5, Ng5, Qc8 against h3/f3 and 20...Nf3+! 21.gxf3 e5 opened the king. The board at ply 37 is the picture of "material up, development down".
- **Game 13 (W, draw from lost)**: 14.Qxc6?? (own +109, SF −2.39): the queen took c6 and was chased by Rb8, Rb6, Qc5 Rg6, position collapsed.
- **Game 30 (B, draw from lost)**: 17...Qxc3?? (own +22, SF −5.7, d13): pawn grab in front of an undeveloped Bc8/Ra8; 18.Rac1 traps the queen's retreat and 19.Ng5/Rxf7 follows.
- **Game 15 (W, slipped win)**: from +1.5 (Black's shattered c-pawns after 4.Bxc6 bxc6 5...f6 7.exf6) the engine played 13.Qe4? (−126; h4! kicking Ng6 was the plan) 14.Nb5?! 15.Nxc7? (own +117, SF −1.49) — grabbing c7 while ...Nh4, ...Nxf3+ and ...d5 came, then 23.c4? and 27.Bd8? and the game was lost (saved later by a perpetual).
- **Game 25 (W, slipped win)**: 5.Qb5? (−99) and later 25.Be3?? (see 2.6).
- **Game 12 (B)**: 13...Bxh3?? (own +35, SF +2.57 for White): a minor piece for three pawns in a middlegame with all pieces on. With N = 320 / B = 330 and pawns 100 each, three pawns is a fair price for the engine; for a human it is a well-known losing trade unless there is mate.
- **Game 4 (B, draw from lost)**: 6...Qd6? 7...Qb4? 9...Qxb2 10...Qxa1 — the queen collected a rook (own +155) and was shut out at a1/a2 while White got Qc6/Ne5/b8=Q; SF +2.8 to +7.7.

### 2.3 Pawn structure

The evaluation has no doubled/isolated/backward pawn terms, so the engine accepts every structural concession and creates its own weaknesses with pawn pushes. Typical own-vs-SF gap during these stretches: 1.5–2 pawns with nothing tactical on the board.

- **Game 11 (W, 3100)**: 7.Bxc3 8.dxc3 doubled c-pawns, 9.b5 and 5.a3/6.b4 created the a3 weakness that fell at move 22 (…Rxa3); 16.f4, 17.c4 b5 18.cxb5 cxb5 19.Qxb5 opened everything on the side where Black had the pieces. SF −1 to −2 from move 10, engine 0 until move 23.
- **Game 18 (B, 3100)**: after 4...dxc6 (doubled c) the engine traded its compensation, then 16...Qe6? 17.Qxe6 fxe6 (doubled e, open f-file), 19...g5?! 21...g4, and 23...b6?? (own +12, SF +4.0): 24.axb6 Rxb6 left a6 isolated, the b-file open for nothing and after 28.f3! the f-file open on the king. By move 42 a6 fell and the ending was hopeless. No tactic anywhere — twenty moves of "equal" while SF said +4 to +7.
- **Game 14 (B, 2900)**: 22...b5? (−123; Bxc4 into a drawish ending), 28...d3 (over-extended passed pawn, blockaded, later lost), 29...h5?, 30...b4? created a6/b4/d3/h5 as four targets; own eval ≈ 0, SF +1.5 to +3.4; the pawns fell one by one (Rxa6, Bxb4+).
- **Game 23 (W, 3100)**: 10...Bxc3 11.bxc3 gave White c2/c3 doubled behind Black's c4; 42.exf5? (own 0, SF −2.08) undoubled nothing and handed Black d5 and a protected passed c4; 103.f5? the same. The whole game was a lesson in pawn weaknesses being "free".
- **Games 19 and 21 (W)**: 13.c5?? / 10.c5? — the c-pawn pushed to c5 in front of an uncastled king to gain space that nothing supported, leaving d5 to Black's knight.
- **Game 1 (W)**: 13.h3? (hook) — see 2.1.

### 2.4 Minor pieces: bishop pair, bad bishop, outposts, trapped pieces

The engine captured a knight with a bishop while still holding both bishops in 17 games; it happily plays the Ruy Lopez Exchange (13, 15, 17: 4.Bxc6, 0 wins) and 1.Bb5+ Bd7 2.Bxd7+ (25) and 6.Bxg6 (5) and 6.Bxc6+ (1), then has nothing to show for it.

- **Game 29**: 22.Nf5 Qf7 23.Qxf7 Bxf7 reached R+N vs R+2B a pawn down; own −111, SF −4.3. Two bishops on an open board ran White's king down (…Bf4, …Bh2, …Bf3/Be4).
- **Game 18**: 6...Bxf3?! surrendered the only compensation Black has in the Exchange Ruy (the pair); White's Bg5/Bd2 dominated the ending.
- **Game 23**: the rook trades at 50–52 produced a *bad* dark-squared bishop (own pawns on c3, f4, g3, h4) against a knight on d5/c4/e4 with a protected passed c4-pawn: own −100 to −109 for sixty moves, SF −3.5 to −7.
- **Game 8**: 22...Bc8?? (−261, own −28!) — Bh7 kept the b1–h7 diagonal and the Ne4 defended; after Bc8 the knight on e4 had no retreat (d6 covered by e5) and 25.f3 simply won it. A mobility/trapped-piece term would have shown the knight had one square before the bishop retreated; the search did not see the quiet f3 at depth 12.
- **Game 14**: 23...Be2 24.f3 — the bishop was shut out on e2/d3 for thirty moves.
- **Game 6 (draw)**: 20...Bxe5?! and 21...Rb8? gave up the last active piece.

### 2.5 Rooks and piece activity

There is no open-file, seventh-rank or rook-behind-passed-pawn term and no mobility term, so the engine parks rooks where they do nothing and lets the opponent's rooks in.

- **Game 21**: 18.Rg1?? with Kd1 — the rook on h1/g1 shut in by its own king, while Black's Rb8/Rc8 took the open b/c-files: 20...Rxb2, 22...Rb1+, then 30...Rxa2 and Ra3+ a rook on the 7th/2nd for the rest of the game; the engine still scored the R+B ending at −2 (SF −7).
- **Game 28**: 19...Rg8?? (−141; Re8 on the open e-file). White's Re1–e3–g3 and Ra1–a3–b3 lifts decided the game.
- **Game 1**: after 15.Nxg5? Black's Rg7 on the half-open g-file mated the king.
- **Game 24**: White's Rb1 behind the b-pawn (b4–b5–b6–b7) vs the engine's Rf8/Rf7 in front of nothing.
- **Game 23**: Black's Ra6/Ra5 doubled on the a-file against the a4 pawn from move 20 on — full compensation for the pawn the engine had won at 16.Rxa7 (own +1.1, SF 0.0).

### 2.6 Endgame technique

- **King goes to the centre, not to the pawns.** `KING_EG_PST` gives e4 +40, f5 +30, g6 −10, g5 −10. Game 11 ply 161 (`8/8/8/5K1p/6p1/6P1/7k/8 w`): 81.Ke4?? (−986) instead of Kg6/Kg5 against the h-pawn; ply 149 75.Ke4?? the same. Game 3: 43.Ke3? (−186) instead of Nxf7, 44.Nf3? instead of Nxh7 — king centralisation preferred to winning pawns back. Game 23 moves 54–95: Kf3/Ke3/Ke2 shuffles (own eval frozen at −109) while Black's king marched d6–c5–d5–c4–d3.
- **Wrong trades when worse.** Game 23: 49.Rb1? 50.Rba1? Rxa4 51.Rxa4 Rxa4 52.Rxa4 Nxa4 — trading both rooks at −3 into the bad-bishop ending. Game 11: 28.Qf2 Qxf2+ a pawn down, then 56.Rc1 Bc6 57.Rxc6?! Ne5+ 58.Kf4 Nxc6 (rook for bishop, own −229) into K+N+2P vs K+3P at −2.4 (SF −4.8), then 63.Kf5?? Nd6+ 64.Ke5 Nxe4 — walking into a two-ply fork. Game 29: the queen trade 23.Qxf7 a piece down.
- **Wrong trade when better.** Game 25 ply 49 (`6k1/3P1ppp/4n3/2b5/5B2/5N2/1r3PPP/5RK1 w`): 25.Be3?? (own +195, SF from +4.15 to +0.10). 25.Rc1! attacks the c5 bishop, which has no square, and d8=Q follows (the Bf4 controls b8/d8). Instead the engine traded the *good* bishop (the one controlling the queening squares) for the passive c5 bishop, Black's knight blockaded on d8 and the d7 pawn was dead. Passed pawns are the teammate's job, but the point here is "which piece to keep": the piece that controls the promotion square.
- **Rook vs. minor pieces, pawn-down minor endings.** Game 11 valued R vs B+N (+3 pawns each) at −1.2 (SF −1.9), and later "knight vs pawn" at −2.4 when it was lost; game 21 R+B vs R+B a pawn down with the enemy rook on the 2nd rank at −2 (SF −7).
- **Passivity in lost endings** is actually paying: the repetition hunting (own score 0 at depth 24–127) in games 3, 4, 6, 13, 16, 17, 30 produced seven half-points from positions SF had at −2.5 to −10. Contempt must not switch this off when the engine is worse.

## 3. Tactical oversights (search, not evaluation)

Middlegame ACPL is 31 at average depth 14.7. The decisive blunders share one shape: a capture or pawn push whose refutation is a **quiet move two or three plies later**, which LMR/futility apparently reduces away:

- Game 20, 13...Nxf3?? (d14, own +152, SF −4.77): refuted by the quiet 14.Bf4! (threat Bxc7+/Nxc7).
- Game 5, 19.c5?? (d14, own +226, SF −6.86): refuted by the quiet 19...Ra6 (queen trapped/pinned) and 20...Nf3+.
- Game 10, 14...Qd7?? (d13, −263): 15.Bxf6 gxf6 16.Nf5 — the quiet knight hop after the capture.
- Game 30, 17...Qxc3?? (d13, −513): 18.Rac1 quiet, the queen has no retreat.
- Game 21, 18.Rg1?? (d12, −311): 18...Bf8 quiet, hitting the queen with Rxb2 coming.
- Game 8, 22...Bc8?? (d12, −261): 25.f3 quiet, winning the trapped knight.
- Game 11, 63.Kf5?? (d18, −58 nominal but decisive): a two-ply fork (Nd6+/Nxe4) — the engine saw it (own −210 → −330) and still misjudged the resulting pawn ending as "−3".
- Game 12, 13...Bxh3?? (d13): a speculative sacrifice; the eval, not the search, is the problem.

A cheap remedy on the evaluation side is a **threat/hanging-piece term** (piece attacked by a lower-valued piece or undefended and attacked) so the quiet refutation shows up in the static eval one ply earlier; on the search side, do not reduce quiet moves that attack the enemy queen or a higher-valued piece.

## 4. Game-by-game summary

| Game | Side / Elo | Result | Where it went wrong (chess terms) | Type |
|---|---|---|---|---|
| 1 | W 2900 | 0-1 | 6.Bxc6+ pair away, no plan vs f5–f4/h5/g5 storm; 13.h3?? hook, 15.Nxg5? opened the g-file | strategic (king, storm, files) |
| 5 | W 3100 | 0-1 | ten queen moves grabbing a7/c6, Ra1/Bc1 at home; 19.c5?? then Nf3+ sac | strategic (development) + tactical |
| 11 | W 3100 | 0-1 | doubled c-pawns, a3/b5 weaknesses; R vs B+N; 57.Rxc6; 63.Kf5?? fork; 81.Ke4?? PST king | strategic (structure, endgame) |
| 19 | W 2900 | 0-1 | never castled; pawn grabs with the king on e1; 12.Be2?? 13.c5?? then …Rxe3+ | strategic (king) |
| 21 | W 3000 | 0-1 | 10.c5?, castled long into open b-file; 18.Rg1??; queen trade did not save the king; passive R+B ending | strategic (king, files, endgame) |
| 23 | W 3100 | 0-1 | doubled c-pawns; 16.Rxa7 "+1" vs a-file pressure; 42.exf5?; rook trades into bad bishop vs knight | strategic (structure, minors, trades) |
| 29 | W 3100 | 0-1 | five bishop moves; 8.Nxe4? 10.Qe2? 11.Bg5? trapped on the e-file pin; queen trade a piece down; R+N vs R+2B | strategic (development, king, pair) |
| 8 | B 2900 | 1-0 | 22...Bc8?? knight on e4 trapped by f3; passive retreats | tactical (trap) + activity |
| 10 | B 3000 | 1-0 | 14...Qd7?? Bxf6 gxf6 Nf5 — g-file and doubled f-pawns in front of the king | strategic (king) |
| 12 | B 3100 | 1-0 | 13...Bxh3?? piece for three pawns; own g-file opened; 33...a5?? counterplay while being mated | strategic (imbalance, king) |
| 14 | B 2900 | 1-0 | queenless by move 10; 22...b5?, 28...d3, 30...b4 — four weak pawns; 37...Rh8?? (Rxe4!) | strategic (structure, endgame) |
| 18 | B 3100 | 1-0 | 6...Bxf3?! pair away; doubled c and e pawns; 23...b6?? isolated a6, f-file opened; 40...Ke7+?? | strategic (structure, pair, king) |
| 22 | B 3000 | 1-0 | Qh4/Qxe4; king on e8 all game, Bf8 out on move 18; 17...Rg8?? 24...Rd8?? | strategic (king, development) |
| 24 | B 3100 | 1-0 | Qh4/Qxe4, Kd8; 14...Qc6?? Rxe5!; never fought the a/b passed pawns; 41...Rf7?? | strategic (king, passed pawns) |
| 28 | B 3000 | 1-0 | 8...h6? then 10...O-O-O into the open b-file; won the exchange into a mating attack; 19...Rg8??, Qa4 wandering | strategic (king, activity) |
| 15 | W 3000 | ½ (was +1.5) | 13.Qe4? 15.Nxc7? grabbing instead of h4/consolidating; 23.c4? 27.Bd8?; saved by perpetual from −8 | strategic (development/greed) |
| 20 | B 2900 | ½ (was +1.8) | Kd8, queen made 5 of 8 moves; 11...Qg6? 13...Nxf3?? (14.Bf4!); saved by SF repetition | strategic + tactical |
| 25 | W 2900 | ½ (was +4.2) | 25.Be3?? traded the bishop controlling d8; d7 pawn blockaded; K+N+P race drawn | strategic (trade choice, passed pawn) |
| 3,4,6,13,16,17,30 | mixed | ½ from −2.5…−10 | queen grabs (4: Qxb2/Qxa1, 13: Qxc6??, 30: Qxc3??), 16: 37...Re8?? g-file, 3: 43.Ke3? king to centre, 6/17: passive play with the pair gone | escapes, not slipped wins |

The wins (2, 7, 9, 26, 27) all had the king castled by move 8, kept the queen home until the minor pieces were out, and were decided by Stockfish (reduced) errors in queen-and-rook middlegames — i.e. exactly the positions where the king-danger term already works.

## 5. Notes on the teammate's items

Contempt: make it one-sided — avoid repetition only when the engine's own eval is ≥ +0.5; the nine repetition escapes (all from lost positions) are the run's best asset. Endgame draw scaling: game 25's Q+N vs Q at +3.7 (SF 0.00) and game 11's "−2.4" K+N+2P vs K+3P show both directions are needed. Passed pawns: games 25 (d7), 24 (a/b duo), 23 (c4) and 14 (d3 blockaded and lost — a passed pawn that cannot be supported is a weakness) are the test positions.

## 6. Prioritised, engine-implementable suggestions

1. **Uncastled-king and open-file king penalties, not gated on the enemy queen.** With the opponent having a queen or ≥ 2 rooks/minors: −35 mg for a king still on e1/e8 (or that has lost castling rights without castling); −20 per open file and −12 per semi-open file (no own pawn) on the king's file or the two adjacent files; when the enemy queen is off, keep `king_danger` at ~40 % instead of 0 while enemy rooks remain. Evidence: games 19 (12.Be2??/13.c5??), 21 (18.Rg1??, 19.Qd5 "safe" queen trade), 22 (17...Rg8??), 24 (Kd8), 29 (10.Qe2?), 28 (O-O-O into the b-file), 10 (g-file after Bxf6), 12 (g-file after Bxh3); 0/8 in games without castling.
2. **Development / tempo term in the opening.** While the opponent has a queen: −10 per own minor piece still on its home square, −25 if the queen has left its first two ranks before ≥ 2 minors are developed, and count captured pawns on ranks 6–7 of the enemy's half as +60 instead of +100 while ≥ 2 own minors are undeveloped. Evidence: game 5 (ten queen moves, Ra1/Bc1 at home, 19.c5??), Scotch 4...Qh4/Qxe4 in 20/22/24 (0/3), 13 (14.Qxc6??), 30 (17...Qxc3??), 15 (15.Nxc7?), 25 (5.Qb5?), 4 (Qxb2/Qxa1).
3. **Pawn-structure terms.** Doubled −12 mg / −20 eg, isolated −10 / −18 (double it on a half-open file), backward on a semi-open file −8 / −12; plus a pawn-storm/hook term: −8 per enemy pawn on the 4th/5th rank on the king's file or adjacent files, −10 extra for an own pawn on h3/g3 (h6/g6) with an enemy pawn on g5/h5 (game 1's 13.h3??). Evidence: games 11 (dxc3, a3/b5), 18 (23...b6??, doubled e/c), 14 (b5/b4/d3/h5), 23 (bxc3, 42.exf5?), 19/21 (c5 over-extension).
4. **Bishop pair, bad bishop, outposts; raise the minor pieces.** Bishop pair +30 mg / +45 eg; −4 per own pawn on the bishop's colour (−2 for each such pawn on the central files); knight outpost (protected by a pawn, cannot be attacked by an enemy pawn) +20 mg / +15 eg; raise N/B to ~340/355 mg so that a minor for three pawns is not a fair trade. Evidence: 17 games with BxN giving up the pair, 29 (R+N vs R+2B at "−1"), 18 (6...Bxf3?!), 23 (bad bishop vs Nd5), 12 (13...Bxh3?? for three pawns), 13/15/17 (Exchange Ruy 0 wins), 25 (2.Bxd7+).
5. **Rook activity.** Rook on an open file +20 mg / +12 eg, semi-open +10; rook on the 7th with the enemy king on the 8th or enemy pawns on the 7th +25 mg / +30 eg (connected rooks on the 7th ×2); rook behind a passed pawn (own or enemy) +15 eg; −25 for a rook trapped by its own uncastled king (Rg1/Rh1 with Kd1/Ke1/Kf1 — game 21's 18.Rg1??). Evidence: 21 (Rxb2/Rb1+/Ra2), 28 (19...Rg8?? vs Re8), 1 (Rg7 on the g-file), 24 (Rb1 behind the b-pawn), 23 (Ra6/Ra5 on the a-file).
6. **Mobility and trapped pieces + a threat term.** Knight/bishop mobility counted on squares not attacked by enemy pawns (about +4 per square around a zero at 4 squares for knights, 7 for bishops), with a −50 penalty when a minor piece has ≤ 1 safe square and can be attacked by a pawn; and a hanging-piece term (−piece value/8 for a piece attacked by a lower-valued piece or attacked and undefended) so quiet refutations such as 14.Bf4 (game 20), 19...Ra6 (game 5), 25.f3 (game 8), 18.Rac1 (game 30) and 18...Bf8 (game 21) are visible one ply earlier. Evidence: game 8 (Ne4 trapped), 29 (Bh4 trapped by f6/g5), 14 (Be2 shut out), 13 (queen trapped after Qxc6), and the six quiet-refutation blunders listed in section 3.
7. **Endgame king and trade rules.** (a) Replace pure centralisation in `KING_EG_PST` with "distance to the nearest pawn / to the enemy passed pawn" (−6 per king step from the most advanced enemy pawn when no queens are left): game 11 plies 149/161 (Ke4?? vs Kg5/Kg6), game 3 (43.Ke3? vs Nxf7), game 23 (Kf3/Ke2 shuffles). (b) A trade-bias term: when the static eval is ≤ −100, penalise entering positions with fewer non-pawn pieces (roughly −10 per piece pair removed); when ≥ +100 the opposite — the engine traded down at −3 in game 23 (moves 49–52), a pawn down in game 11 (28.Qf2, 57.Rxc6), a piece down in game 29 (23.Qxf7), and traded away the piece that controlled the queening square in game 25 (25.Be3??). (c) Score R vs B+N with the material sign only when the minor pieces are uncoordinated; otherwise add −40 for the rook side (game 11 moves 29–56).
