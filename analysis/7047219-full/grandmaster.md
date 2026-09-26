# Grandmaster review of run `7047219-full`

Reviewer's brief: our engine (material + Michniewski piece-square tables, alpha-beta with quiescence and a transposition table, depth 7-8 in 5 s) against Stockfish 19 at UCI_Elo 1500/1600/1700, 5 s per move, the competition's real time control. Score 21 wins, 2 draws, 7 losses. Only wins count.

Move numbers below are the PGN's own numbers (the fixed-opening games start from a FEN, so "1.d3" in game 7 is the fourth move of the Italian). Evals in brackets are Stockfish depth 14 from White's side; "own" is the engine's score from its own side when it has been recorded.

## Summary

Seven losses and two draws; five of those nine games were at least +1.5 for the engine at some point (11: +4.2, 12: +5.7, 15: +2.0, 19: +5.5, 1: +2.3) and every one of the five was thrown away. That is the story of this run: the engine wins material against 1500-1700 opposition almost at will, and then does not know what a won position needs.

Three things decided the nine games:

1. **The king walks into the middle of the board the moment the queens come off** (losses 15, 17, 20, and the slide in 12). The eval switches to the endgame king table as soon as no queen is on the board (`is_endgame` in `engine/src/eval.rs`), so with four rooks and four minor pieces still present the king marches Kd2-e3-e4 (game 15), Ke2-e3-f4 on moves 9-11 (game 17), Kd6-e5-xe4 (game 20) and is mated or hunted. This pattern was marginal in the fast run (only the wandering king of the old game 3); at 5 s it caused three of the seven losses. It is the cheapest fix in this report.
2. **King safety while the enemy queen is on the board** remains the biggest single cause of lost material edges (11, 19, 1, and losses 7, 3). The engine sits a piece up with no pawn shield and plays "developing" moves (19.Rad1?? in game 11, 22.a4??), grabs a pawn with the queen while its own king is in a perpetual net (39.Qxc7?? in game 19, own +390 while Stockfish read mate), steps its king next to the attacking pieces (35.Kh2?? game 19), or recaptures in a way that opens the files in front of its king (25.gxh3?? game 1; 13.Nxf6+ gxf6 game 3; 17.gxh3?? game 7).
3. **Endgame and conversion technique**: a passive rook left on a7 for 27 moves while two pawns up (game 12), trading the active piece for a passive one (17...Ne4?? game 12; 12.Nxg5? and 17.Nxf6+? game 1), pushes that create passed pawns for the opponent (36...b5?? allowing cxb6 e.p. in game 12; 29.Bxd4 cxd4 in game 3), and pawn pushes far from the action while the own king is in a mating net (27.b4?? 31.b5?? game 15).

Neither draw was a repetition from a better position: game 1 repeated from −5.5 after a lost R+B vs R+N ending, game 19 was a forced perpetual (40.Kh1 41.Kh2 42.Kh1 with mate the alternative). The slipped wins in both were lost in the middlegame, not at the repetition. The fast-run suggestion of a large draw contempt is therefore not supported by this run and is demoted (see suggestions).

### Which fast-run patterns persisted at 5 s per move, and which disappeared

| Fast-run pattern (`analysis/498eace/grandmaster.md`) | At 5 s/move |
|---|---|
| Own king exposed while the enemy queen is on (pawn moves in front of the king, king walks, castling into attack) | **Persisted, still #1.** Game 7 (8.Kh1??, 12.Nxa4??, 17.gxh3??, 19.Nd6??), game 11 (15.Nd2??, 19.Rad1??, 22.a4??), game 19 (35.Kh2??, 39.Qxc7??), game 1 (12.Nxg5?, 17.Nxf6+?, 25.gxh3??), game 3 (13.Nxf6+?, 23.g3?). |
| Material grab with a piece that ends trapped or offside | **Persisted in the "offside" form, disappeared in the "trapped" form.** No piece was actually trapped this run (the b4/a5 bishop trap was available against 6...Be6? in game 12 but Stockfish-1700 missed it). Offside grabs: 12.Nxa4?? and 15.Nb7/19.Nd6 (game 7), 39.Qxc7?? (game 19), 19...Kxe4?? (game 20, the king itself), 24.Nxh5? (game 15). |
| Trades that leave a worse structure or a lost ending | **Persisted.** 12.Nxg5? / 17.Nxf6+? (game 1), 13.Nxf6+? / 29.Bxd4 (game 3), 17...Ne4?? / 23...Rxf1? (game 12), 4.Qxd4 (game 15, the self-selected queenless middlegame). |
| Passed / hanging / weak pawns unpriced | **Persisted.** d4-d3-d2 (game 3, an exact replay of the fast-run game 3), 36...b5?? cxb6 e.p. (game 12), 27.b4?? / 31.b5?? (game 15). |
| Rooks with nothing to do; enemy rook on the 2nd rank tolerated | **Persisted.** Ra7 passive from move 20 to 47 and 24...d5?? instead of Ra8 (game 12); 26...Rf2 allowed and 27.Rc1? (game 3); 25.Rf2?, 27.b4?? instead of Rd1, 29.Ng3?? instead of Ra2 (game 15). |
| Failure to press an attack on a weakened king | **Persisted.** 12.f5? locking the position instead of Rae1 and Qd5 declined four times (game 19); the d5 break declined twice from +1.7 (game 1); exf5 declined three times (game 3). |
| Early queen sorties, undeveloped pieces, no castling | **Mostly disappeared.** Opening ACPL 28 with 3 blunders in 300 moves; no Qh5/Qf6 sorties, no uncastled kings in the middlegame with queens on. What remains is the Fried-Liver imitation 2.Ng5 (game 7, same as fast-run game 9: the knight defended only by a bishop, 6.Be3?? −402) and the reflex 1.Bxc6 (games 15, 17). |
| Repetition from a worse position, never from a better one | **Unchanged.** Game 1 from −5.5 (correct), game 19 forced. |
| Mating nets and desperados below the horizon | **Persisted despite ~1.5 extra plies.** The worst move in six of the nine games was an 8-12 ply mating net played at depth 7-8 with 2.3-4.75 s used: 19.Nd6?? (g7, d7), 19.Rad1?? (g11, d7), 31.b5?? (g15, d8), 39.Qxc7?? (g19, d7), 30.Rd3?? (g1, d8), 34.Red1?? (g3, d8). 32 of the 67 blunders were at depth ≥ 8. Depth is not the cure; a king-safety term and check extensions are. |
| *New at 5 s:* king walk in queenless middlegames | Games 15, 17, 20 (+12). See point 1 above. |

---

## The losses from winning positions

### Game 11 (White vs 1700, Italian, 0-1, 30 moves) — a piece up, no pawn shield, and a rook to the "open" file

Opening (from the Italian FEN): 1.d3 h6 2.Nc3 Nge7 3.h3 a6 4.O-O O-O 5.Be3 d6 6.d4 b5? 7.Bxf7+ Rxf7 8.dxc5 Be6 9.cxd6 cxd6 — a clean pawn (+0.9) with the bishop pair gone on both sides.

Strategic misunderstandings:
- **Not seeing the target on h3.** With Qd8-d7, Be6, Ng6 and Rf7 all pointing at h3/f2, Stockfish wants 11.Nh2, 13.Nh2 and again 15.Nh2 (a knight covering g4/f1-h3 and blocking the h-file). The engine played 11.Nd5? (−85, the +20 centre square), 12.a3? (−54) and 13.Qe2? (−71). It then correctly accepted the unsound 13...Bxh3? (+2.58) but answered 14...Qxh3 with 15.Nd2?? (−315) instead of 15.Nh2 hitting the queen; 16.Qf1? (−83, f4) and 17.Kh2? (Kh1) followed.
- **19.Rad1?? (−796, own +240, Stockfish +4.24 → −3.72).** After 17...Nd4?? 18.Bxd4 exd4 White is a piece for a pawn up. Black's attackers are Qg4, Nh4 and the rook on f7 heading to f3; White's king has no g- or h-pawn. The only move is 19.f4, which blocks the f-file (Rf7 cannot reach f3) and gives the king f2. The engine put its rook on the d-file, where there was nothing, because the rook table likes it and the eval has no notion of "three attackers next to a shieldless king".
- **22.a4?? (−537).** Stockfish-1700 blundered 21...Rh8?? (0.00, best Rf8) and 22.Nxd4 would have held; the engine pushed a pawn on the far side of the board. Same blindness, one move later.

Tactical: 19...Rf3 and the Ne7+/Nf5 sequence are 8-10 plies with checks; depth 7 could not see them, but the eval should have rejected 19.Rad1 before the search was needed.

### Game 12 (Black vs 1700, Italian, 1-0, 60 moves) — two pawns up at move 13, a rook on a7 for 27 moves

Opening: 1.O-O d6 2.a4 Nf6 3.Re1 Nd4 4.c3 Nxf3+ 5.Qxf3 O-O? (−109, best a6) 6.h3 Be6? (−130, best a5) 7.d3 Bxc4 8.dxc4 a6? — twice the engine ignored the a4-a5 / b4 trap of its own bishop on c5 (the same trap that cost fast-run game 8); Stockfish-1700 missed 9.Bg5/b4 (−158) and the engine got away with it. 12.Kf1?? 13.Ke2?? by Stockfish gave 12...Nxe4 13...Nxf2: two pawns up, −5.5.

Strategic misunderstandings:
- **16...Kf7?? (−322, best e4).** Queens are off, so the engine's king table wants the king in the centre; but the knight on f2 needs e4 as a retreat and the f-file pawn chain needs fixing. 16...e4! keeps everything. Kf7 walks into the Re8+ / Rf8+ checks that dominated the rest of the game.
- **17...Ne4?? (−226, best Ke6).** Traded the only active piece (18.Nxe4 fxe4) and accepted doubled, isolated e-pawns. Two pawns up, the correct policy is to keep the piece that ties White down and trade rooks when they are equally placed, not the reverse.
- **The a7 rook.** After 20.Bxa7 Rxa7 the rook stood on a7 until move 47. 22...Rf4? (Raa8), 23...Rxf1? (Rf6, keeping the active rook) and **24...d5?? (−271, best Ra8; 0.20)** gave White 25.Rf8 and the 8th rank for nothing. With one rook a spectator the engine was effectively a rook down and its two extra pawns meant nothing. This is the single clearest conversion failure of the run.
- **36...b5?? (−229, best Ke7).** 37.cxb6 e.p. created a protected passed pawn on b6 that pinned the a7 rook permanently and became the winning queen (51.b7). The eval has no passed-pawn term, so the search rated the recapture as a pawn trade. It also never pushed its own connected passers (d5/e4/e5) until move 44, when it was already lost.
- Endgame technique: 31...g5? (−91), 39...Rg2+? (−114, a check that did nothing), 47...Rd7? (Kh6), 50...Rd4?? (Rf7).

Tactical: nothing; the game was lost by a sequence of quiet, strategically wrong moves at depths 8-12.

### Game 15 (White vs 1600, Ruy Lopez, 0-1, 36 moves) — the king as an attacking piece with four rooks on the board

Opening: 1.Bxc6 dxc6 2.Nc3 Qd6 3.d4 exd4 4.Qxd4 Qxd4 5.Nxd4 — the engine chose a queen trade on move 4, which is exactly the phase in which its evaluation is worst. 6.h3 Be6? 7.Nxe6 fxe6 8.Bf4 O-O-O 9.Rd1 Re8 gave White a good Exchange-Ruy structure (kingside majority, Black's c6/c7/e6 weak); 14.f4 Bc5?? 15.Ne4 Be7 was +2.0.

Strategic misunderstandings:
- **The king walk.** 11.Kd2? (−97, best Ke2), 20.Ke3, 23.Ke4. The eval's endgame rule fired (no queens) and the king table paid +30/+40 for e3/e4 while Black still had two rooks, a bishop and a knight. From e4 the king was in the d-file's cross-fire: 30...Rd3, 31...Rfd7 and mate on d4.
- **Pawn pushes instead of piece play.** 16.g4? (−93, g3), 17.c4? (−56, Rhf1), 21.g5? (−102, Ng5), 22.Ng3? (b4), 24.Nxh5? (b4), 27.b4?? (−134, Rd1), 29.Ng3?? (−338, Ra2 — the a-file White had just opened), **31.b5?? (−826, own +95, Stockfish −9.96, best f5)**. Every pawn push loosened a square the knight later used (g4 → Nh4; c4 → d3/d4 for the rooks; b4/b5 → the queenside lines toward the king). Stockfish's suggestions from move 17 on are almost all rook moves (Rhf1, Rd1, Ra2) that the engine never chose because the rook table does not distinguish an open file from a closed one.
- **Trades:** 18.Bxe7 Nxe7 handed Black's undeveloped knight a route (Ng6-h4-f5) while the e5/f4 clamp lost its bishop.

Tactical: 31.b5 loses to ...cxb5, ...Nf5 and R8d4#, a 6-ply mate the engine missed at depth 8 because its king was already in a net it had rated +95.

### Game 19 (White vs 1500, Scotch, draw, forced perpetual) — +5.5, then the king stepped next to the knight and the queen went shopping

Opening from the Scotch FEN: 1...a5? 2.Nxc6? (−78, Nc3) bxc6 3.Nc3 Bb4 4.Bd2 d6 5.a3 Bxc3 6.Bxc3 f6?? 7.Bd3 Nh6 8.Qh5+ Kf8 9.O-O Be6 10.f4 Qe8 11.Qe2 c5 (+5.2). A near-winning position by move 11 against a king on f8 with the bishop pair, the f- and e-files coming.

Strategic misunderstandings:
- **12.f5? (−303, best Rae1).** The pawn push attacks the bishop and locks the position; Rae1 followed by e5 opens the e-file onto a king that cannot castle. The engine consistently prefers a pawn that hits a piece to a rook that hits nothing yet.
- **Declining domination.** Qd5 was Stockfish's best on moves 22, 24, 25 and 27 (queen on d5 hitting a8/c6/f7 and freezing Black); the engine played 22.Qe6+?, 24.Rxa8? (trading the rook that was doing the attacking), 25.Rd2?. 15.Bd7? (−123, h3) started the trade of the good bishop for the bad one.
- **35.Kh2?? (−354, +3.54 → 0.00, best Kf1).** After 33.h4 the king's shield was g2/h4; Kh2 walked into 35...Nf3+ 36.gxf3 Qf2+ with a perpetual. A king-safety term would price h2 as worse than f1 with a knight on g5 and a queen on a7.
- **39.Qxc7?? (−996, own +390, Stockfish mate).** Black had just played 38...Rxf5, so the position was a dead perpetual (0.00). The engine's search saw a free pawn and no immediate mate; 39.Qa8+ was the only move. This is fast-run game 25 (35.Qxc4??) again: material minus king safety equals material.

Tactical: the mating idea after 39.Qxc7 (…Qf2+, …Qf3+, …Rh5) is 8-10 plies of checks; Stockfish-1500 then missed 42...Qxh4+ (−997) and took the draw. The repetition was forced.

### Game 1 (White vs 1500, Caro-Kann Advance/Classical hybrid, draw from −5.5) — traded the pieces that were attacking and opened its own king

1.e4 c6 2.d4 e6 3.Nc3 d5 4.Bd3 Nd7 5.Nge2 Bb4 6.O-O Nf8? 7.a3 dxe4 8.Nxe4 Be7 9.Be3 h6? 10.N2g3 Nh7 11.Qg4 Ng5? (+2.31). White has the bishop pair, space, an uncastled black king and two misplaced black knights.

Strategic misunderstandings:
- **12.Nxg5? hxg5 (−139, best Rad1).** Traded the dominant e4 knight for a rim knight and gave Black the half-open h-file toward White's own king. **17.Nxf6+? gxf6 (−73, best h4)** gave Black the g-file too. With 18...O-O-O Black had Rh8/Rhg8 against Kg1 and the initiative had changed hands (−0.14).
- **No plan with the bishops.** 21.Bc3? (−148) and 23.Be2?? (−159) when d5! was right twice: the central break that opens the position for the two bishops against a king on c8/b8. The eval gives nothing for open diagonals, so the search saw d5 exd5 cxd5 as a pawn swap.
- **King safety.** 24.c5? 25.gxh3?? (−264, Qg3) recaptured toward the open g-file; 26.Bf1?? (−289, Kf1) left the king on g1 with f4-f3 coming; 30.Rd3?? (−633, Ba5) allowed 30...Bxh3 and −16.
- **The draw.** After Stockfish-1500's 31...e4?? (−1246) the engine won the queen back with 32.Ba5 and reached R+B vs R+N a pawn down but with a bad structure (−6.8). It defended 50 moves, and repeated at 84.Kc2 from −5.5. Correct in the circumstances; the win had been lost at moves 12-30.

Tactical: 30.Rd3?? was the only one-move blunder.

---

## The other losses

### Game 7 (White vs 1500, Italian, 0-1, 26 moves) — the fast-run king attack, replayed at 5 s

1.d3 a5 2.Ng5 Nh6 3.Nc3 O-O 4.h3 Nd4 5.O-O d6 6.Be3?? (−402, best Kh1). The knight on g5 was defended only by the bishop that had just gone to e3: 6...b5! 7.Bb3 Nxb3 8.axb3 Bxe3 9.fxe3 Qxg5 wins it (Stockfish-1500 missed it, −377). 8.Kh1?? (−399, best a4) Nxf3 lost a pawn anyway; 9.Bxh6? (Bxc5).

Strategic misunderstandings:
- **Opening choice.** 2.Ng5 is the same Fried-Liver imitation that lost fast-run game 9, now with the knight reliant on a single defender.
- **Material grab with the enemy queen next to the king.** 12.Nxa4?? (−356, best Kh2) took a pawn with Black's Qh4 already on the kingside and Bd7xh3 available; 13...Bxh3 followed. 15.Nb7? and **19.Nd6?? (−623, mate in 7, best f4)** put the knight on "good" squares on the far side while Re6-g6, f5-f4 and Qxh3 rolled over Kg1. Own eval was positive throughout.
- **17.gxh3?? (−450, best Bxd4)** recaptured with the g-pawn and opened the g-file in front of its own king for a bishop it could have ignored.

Tactical: 6.Be3 and 8.Kh1 were 9-ply quiet-then-tactical lines below depth 6-7. The mate after 19.Nd6 was a consequence, not a cause.

### Game 3 (White vs 1600, 1.e4 e5 2.Nc3, 0-1, 39 moves) — trades that opened its own king, then a passer it never priced

1.e4 e5 2.Nc3 Nf6 3.Nge2 c5 4.Ng3 Nc6 5.Bc4 Be7 6.d3 a6 7.Nd5 d6 8.Nxe7 Qxe7 9.Bg5 Rg8? 10.O-O Be6 11.Bxe6 fxe6 (+1.0, the bishop pair gone but Black's e6/d6 weak).

Strategic misunderstandings:
- **13.Nxf6+? gxf6 (−69, best Bxf6).** With Black's rook already on g8, opening the g-file toward Kg1 is the one thing not to do; 12.Nh5? (f4!) had already put the knight on the wrong square. From here Black's whole game (Qg6, h5, Rg7, O-O-O, f5, Rgf8) was on the g- and f-files.
- **Refusing to open the position in its own favour.** exf5 was best on 22, 25 (−236, −165) and Rxe4 on 26 (−135): all keep the e6 pawn weak and the e-file for White's rook. Instead 22.Bd2?, 23.g3? (−119, weakening f3/h3), 24.Bc3?, 25.Rad1? and 26.dxe4? let 26...Rf2 land on the 2nd rank unchallenged (27.Rc1?, best Rd3).
- **29.Bxd4 cxd4** created a protected passed pawn on d4 with the rooks on f2/f8 supporting it; 32.c3?? (−229, b4) d3 33.Ra1? (b4) d2 34.Red1?? (−950, own −395, c4) Re2 and the pawn promoted with mate. The fast-run game 3 lost to the identical c- and d-pawn march.

Tactical: 34.Red1 was the only blunder proper; the loss was structural from move 22.

### Game 17 (White vs 1700, Ruy Lopez, 0-1, 68 moves) — the king on f4 on move 11, and a 25-move king hunt

1.Bxc6 bxc6 2.Nxe5 Qe7 3.d4 d6 4.Nxc6 Qxe4+ 5.Qe2 Bf5 6.Nc3 Qe6? 7.Nb4? (Be3) Qxe2+ 8.Kxe2 — level, queenless, all eight pieces each still on the board.

Strategic misunderstandings:
- **9.Ke3? (−76, Nbd5), 11.Kf4?! (−45).** The king climbed to f4 because the endgame table said so. From then on every black pawn move was a tempo against it: 19...f5, 20...Rh6 (g5+ threatened), 21.h3?? (−298, g3) h4 (Stockfish missed Ng6+ / g5+, −2.78), 23...g5, 26...g4+, 27.hxg4? fxg4+, 28...h3. 20.Bb4? (−193, Kf3) and 24.Ned1? / 25.Nc3? (−186, −145) were pieces going nowhere while the king needed to get home.
- **A king that keeps walking.** After the material was gone (−5), the king went 41.Ke5? 45.Ke6 46.Ke7 47.Ke8 48.Kd8 50.Kc8 52.Kc8 — into the enemy rook and bishops — and was mated on e8. The table rewards every step toward the centre or the enemy camp; nothing counts the enemy pieces around it.
- **Reflex 1.Bxc6** again gave up the bishop pair on move 1 for nothing (fine at +0.03, but the pattern feeds the queenless positions it plays worst).

Tactical: none decisive; the whole game was a king-placement error.

### Game 20 (Black vs 1500, Scotch, 1-0, 25 moves) — mated in the centre at move 25 with queens off

1...Nf6 2.Nxc6 dxc6 3.Qxd8+ Kxd8 4.Nd2 Bc5 5.f3 Ke7 6.Nb3 Bb6 7.c3 Be6 8.Be2 Bxb3? 9.axb3 Nd7 10.g4 Rae8 11.h4.

Strategic misunderstandings:
- **11...Kd6? (−82) 12...Ke5?? (Stockfish +1.94) 19...Kxe4?? (−145).** The king went to e5 on move 12 with two rooks, a bishop and a knight on each side and White's pawns f3/g4/h4 and Bg5 pointing at it. 16...Nf6?? (−252, Ke6) and 17...h5? (Ke6) refused to retreat; 19...Kxe4 took a pawn on the fourth rank and 25.Re2# followed. This is the eval's endgame king table acting on a middlegame position; there was no tactical trick, just a king in a box.
- 8...Bxb3? (−40) gave up the bishop pair to double White's b-pawns, which only opened the a-file for White's rook; 14...c5? and 15...Rd8? (−153, cxb4) opened the queenside further.

Tactical: none.

---

## Where the engine misunderstood positions, by theme

| Theme | Games | Type |
|---|---|---|
| King to the centre as soon as the queens are off, with rooks and minors still on (`is_endgame` = "no queens") | 15 (Kd2-e3-e4), 17 (Ke3-f4; later Ke5-e8-d8), 20 (Kd6-e5-xe4), 12 (16...Kf7) | strategic (eval phase) |
| Own king safety with the enemy queen on: shield pawns, attackers, recaptures that open files, pawn grabs from a net | 11 (15.Nd2, 19.Rad1, 22.a4), 19 (35.Kh2, 39.Qxc7), 1 (12.Nxg5, 17.Nxf6+, 25.gxh3, 26.Bf1), 7 (12.Nxa4, 17.gxh3, 19.Nd6), 3 (13.Nxf6+, 23.g3) | strategic, exposed by tactics |
| Converting: prophylaxis and consolidation when ahead | 11 (f4/Nh2/Nxd4 never played), 19 (h3, Kf1, Qa8+), 12 (e4, Ra8) | strategic |
| Rook activity: open files, 2nd/7th rank, passive rooks | 12 (Ra7, 24...d5), 3 (Rf2 allowed), 15 (Rd1/Ra2 never played, 25.Rf2), 19 (12.f5 instead of Rae1) | strategic |
| Passed pawns and structure | 12 (36...b5?? e.p. passer; own d/e passers unpushed), 3 (29.Bxd4 → d4-d3-d2), 15 (27.b4, 31.b5) | strategic |
| Trades: giving up the active piece, opening own king, creating enemy passers | 1 (Nxg5, Nxf6+), 3 (Nxf6+, Bxd4), 12 (Ne4, Rxf1), 15 (4.Qxd4, Bxe7) | strategic |
| Pawn pushes instead of piece moves; pawn levers refused | 15 (g4, c4, g5, b4, b5), 19 (12.f5), 1 (d5 refused), 3 (exf5 refused three times) | strategic |
| Offside minor pieces | 7 (Nb7, Nd6), 15 (Nh5), 17 (Ned1/Nc3/Nd3 shuffle) | strategic |
| Opening: 2.Ng5, reflex Bxc6, self-selected queen trade, bishop-trap blindness | 7, 15, 17, 12 (5...O-O?, 6...Be6?) | opening |
| Mating nets of 8-12 plies at depth 7-8 | 7, 11, 15, 19, 1, 3 | tactical (search) |
| Repetition from a better position | none | — |

Own-eval versus Stockfish at the decisive moves: game 11 +240 (actual −3.72), game 19 +390 (mate against), game 15 +95 (−9.96), game 3 −395 (−20.5); and in a game that was still won, game 16 47...a2?? at own +2050 was −11.05 by Stockfish. The same shape as the fast run: material right, assessment wrong by 4-10 pawns, always on king safety or pawn structure.

---

## Prioritised suggestions (engine-implementable, slipped wins first)

1. **King safety with the enemy queen on: pawn shield, attacker count, and check extensions.** Penalise each missing or advanced pawn on the three files in front of the king (this automatically prices gxf6/hxg5/gxh3 recaptures), add a penalty per enemy piece attacking the king zone that grows with the number of attackers, and multiply by 2 when the enemy queen is on the board; score it for both sides so the engine also attacks. In the search, extend one ply on checks (and do not stand pat in quiescence when in check). Evidence, slipped wins: game 11 19.Rad1?? (own +240, +4.24 → −3.72; 19.f4 needed) and 22.a4?? (Nxd4 = 0.00); game 19 35.Kh2?? (+3.54 → 0.00) and 39.Qxc7?? (own +390, mate); game 1 12.Nxg5?/17.Nxf6+? (files opened toward Kg1 from +2.3) and 25.gxh3??/26.Bf1??. Losses: game 7 12.Nxa4??, 17.gxh3??, 19.Nd6?? (mate in 7); game 3 13.Nxf6+ gxf6 with Rg8 on the file. Six of the nine worst moves in these games were 8-12 ply mating nets played at depth 7-8; the check extension is what lets depth 7 see them, the shield term is what stops the engine reaching them.

2. **Game phase from non-pawn material, not from queens: taper the king table.** Replace `is_endgame` (true whenever no queen is on the board) with a phase value from remaining N/B/R/Q (e.g. Fruit's 1/1/2/4 weights, 24 = opening) and interpolate KING_MG_PST → KING_EG_PST; treat the position as an endgame for the king only when each side has at most about a rook and a minor. Evidence: game 15 11.Kd2? 20.Ke3 23.Ke4 then 31.b5?? mate with four rooks and four minors on (+2.0 slipped); game 17 9.Ke3? 11.Kf4 on move 11, 21.h3?? h4 hunted the king, later Ke6-e7-e8-d8 mated; game 20 11...Kd6? 12...Ke5?? 19...Kxe4?? mated on move 25; game 12 16...Kf7?? (best e4) walking into Re8+/Rf8+ for the rest of the game. Three losses and one slipped win from a twenty-line change.

3. **Rook activity: open and half-open file bonus, 7th-rank bonus, penalty for a rook with no open file and for an enemy rook on our 2nd rank.** Evidence: game 12 24...d5?? (best Ra8; +5.5 → 0.20) with the a7 rook passive from move 20 to 47, and 22...Rf4? / 23...Rxf1? trading the active rook; game 15 27.b4?? (Rd1), 29.Ng3?? (Ra2 on the file the engine had just opened), 25.Rf2?; game 3 26...Rf2 tolerated, 27.Rc1? (Rd3), 34...Re2 mating; game 19 12.f5? instead of Rae1. The rook table cannot tell d1 with a closed d-file from d1 with an open one, which is why "rook to the centre file" (19.Rad1 in game 11) looks the same as a real rook move.

4. **Passed pawns and pawn structure.** Passed-pawn bonus rising steeply with rank (and with the enemy king's distance, larger without queens), penalties for doubled and isolated pawns, a small bonus for connected passers, and a penalty for an enemy protected passer. Evidence: game 12 36...b5?? cxb6 e.p. (played at depth 10; the b6 passer became the winning queen) and the d5/e4/e5 mass left unpushed until move 44; game 3 29.Bxd4 cxd4 then 32.c3?? d3 33.Ra1? d2 (fast-run game 3 lost the same way); game 15 27.b4?? / 31.b5?? pushes that made no passer and opened the king; game 1 the c5 push (24.c5?) instead of the d5 break.

5. **Trade policy from the evaluation delta, not from piece values.** Before an equal exchange, compare the full eval (with terms 1-4) after the recapture: refuse trades that open files toward the own king, that remove the only active piece when ahead, or that create an enemy passer; when ahead, prefer trades of the opponent's active pieces and rook-for-rook only when the remaining rook is the better one. Evidence: game 1 12.Nxg5? hxg5 and 17.Nxf6+? gxf6 (+2.3 → 0); game 3 13.Nxf6+? gxf6 and 29.Bxd4 cxd4; game 12 17...Ne4?? Nxe4 fxe4 (active knight into doubled pawns) and 23...Rxf1? (kept the passive rook); game 15 4.Qxd4?! (a queen trade on move 4 into the phase the engine plays worst) and 18.Bxe7. With terms 1-4 in place most of this comes for free; the residual is a small "when ahead by ≥150, exchanges of the side's most mobile piece cost extra" rule.

6. **Mobility with an offside/immobile-piece floor, which also finds the pawn breaks.** Count safe squares for knights, bishops, rooks and the queen; large penalty for 0-1 safe squares, extra when the piece is in the enemy half; a knight defended by a single piece that can be exchanged (2.Ng5 with Be3) should read as loose. Bishop mobility is also what makes d5 (game 1, moves 21 and 23) and exf5 (game 3, moves 22, 25, 26) score: they open diagonals and files. Evidence: game 7 6.Be3?? (Ng5 lost to ...b5/...Bxe3), 15.Nb7, 19.Nd6??; game 15 24.Nxh5? then 29.Ng3??; game 17 24.Ned1? 25.Nc3? 26.Nd3 shuffles while the king was chased; game 12 16...e4 (giving the f2 knight a retreat) never considered.

7. **Opening rules for the five fixed openings, and demote draw contempt.** A tiny book or three rules: no Ng5 without a second defender and f7 actually attackable (game 7), no Bxc6 without a structural reason (games 15, 17), avoid queen trades before move 15 unless the eval is ≥ +150 (game 15; and 6...Qe6? in game 17 handed Stockfish the same trade), and a6/a5 or ...Bb6 before b4/a5 can trap the bishop (game 12, 5...O-O? 6...Be6?, unpunished by 1700 but not by 1700 every time). Opening ACPL is already low (28), so this is last. Draw contempt (fast-run suggestion 3) is demoted: neither draw was a repetition from a better position (game 1 from −5.5 after 50 moves of defence, game 19 a forced perpetual); keep a modest −50 so the engine does not repeat from equal positions, and spend the effort on items 1-4.

Items 1 and 2 would have changed the result of games 11, 19, 15, 17, 20 and 7 and the course of game 1; items 3 and 4 are game 12 and game 3; item 5 is the residual of games 1, 3 and 12; item 6 covers game 7's opening and the refused breaks; item 7 is hygiene.
