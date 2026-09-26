# Grandmaster review of run `966bbcc` (2 wins, 16 draws, 12 losses vs Stockfish 19 @ 2900–3100, 0.25 s/move) — tapered mobility on top of the champion

Move numbers are the PGN's own (they restart at 1 from the `[FEN]` book position), `ply` is the ply in `moves.jsonl`. "Own" is the engine's reported score for the move it played, "SF" is full-strength Stockfish's `[%eval]` from the engine's side. The previous run `579a92f` (5/10/15, same Elo 2873) is the baseline throughout.

## 1. Headline: the mobility term changed the style, not the understanding

The hypothesis behind the patch was that the engine's optimism (+110/+140 cp against Stockfish) tracked the mobility it lacked. The games say otherwise:

| | 579a92f | 966bbcc |
|---|---|---|
| median own − SF, middlegame plies | +216 | **+233** |
| median own − SF, endgame plies | +186 | **+275** |
| engine plies with own score ≥ +150 | 337 (15.7 %) | 124 (6.9 %) |
| average game length (plies) | 143 | 120 |
| draws / of which from SF ≤ −2.5 | 10 / 7 | 16 / **13** |
| repetition draws | 9 | 15 |
| games with both queens off by ply 30 | 4 (2 as White) | **7 (5 as White)** |
| engine-initiated queen trades before move 12 as White | 0 | **5** (5: 11.Qe2, 19: 4.Qe2, 21: 4.Qxd5, 23: 3.Qxd8+, 25: 2.Qe2) |
| costly (≥ 50 cp) a/h-pawn pushes by the engine | 15 | **27** |
| middlegame engine moves that were captures / pawn moves | 23.7 % / 22.8 % | 20.0 % / 19.6 % |
| opening engine moves that were captures / pawn moves | 21.3 % / 25.7 % | 24.3 % / 29.3 % |
| median nps / share of full-time moves stuck at depth ≤ 13 | 3.41 M / 21.9 % | **2.99 M / 32.9 %** |
| wins as White / as Black | 3 / 2 | **0** / 2 |

So the optimism is untouched (the term is symmetric and both sides' pieces score about the same), and what the engine actually bought for 12 % of its speed was a set of habits that are bad chess:

1. **Rook-file pawn pushes.** Two extra squares for a rook on a1/h1 are worth +4 mg / +8 eg per pawn step, so the engine plays a4–a5–a6 and h3/h4/h5 with no plan behind them: game 29 (11.a4? 14.a5? 26.a6?, Ra1 on its home square each time, own score sliding +92 → +27 → −51 while it did it), 17 (13.a4? instead of f4), 21 (23.a4? 33.a5? instead of Bd3/g3), 25 (24.a6? −108, best Ra4), 3 (43.a4? 46.a5?), 19 (26.h5? 30.a4?), 7 (**21.h3??** −136 with own score 0 — the move gives the h1-rook the h2 square; g4 was the plan), 24 as Black (16...h5? 18...h4?), 8 as Black (**26...a6??** −182 at own +335, the only genuinely winning position of the run — the a7 pawn moved so the a8-rook gained a7).
2. **Early queen trades as White and queenless shuffling.** With the enemy queen gone `king_danger` is zero and mobility is symmetric, so the eval sees no cost in a queen trade: 3.Qxd8+ in the Scotch (23), 4.Qxd5 (21), 2.Qe2 Qe7 (25), 4.Qe2 (19), 11.Qe2 (5). Those five games scored 0 W / 3 D / 2 L, and the three draws were all rescued from SF −5.7 to −9.1. The five wins of the previous run all kept queens on past move 20 and castled by move 8; this run's two wins (20, 26) were both as Black at 2900 and were decided by Stockfish-limited blunders (20: 18.Kh1? 19.Ra3? 20.Bd2?; 26: 20.Nd1? 25.b4? 27.Nxh6+?) into a castled king with the queen at home.
3. **Knights and bishops chasing squares instead of purpose.** Game 11 **14.Ng6??** (own +88, SF −1.79, d13): the knight went to the square with the most "safe" squares (e7, f8, h8, e5, f4, h4) and was traded for the f8-rook after 14...Qc5 15.Bb3 a4 16.Nxf8 axb3 — R+P vs B+N judged +0.9 by the engine, −2 by Stockfish. Game 3 **22.Ne4??** (own +167, SF −1.39): the knight left the safe c5 for the "central" e4 and 22...f5! 23.Ng3 f4 forked bishop and knight — mobility counts only squares *currently* attacked by pawns, not squares a pawn can be pushed to. Game 1 moves 44–48 (Ng4?, Nf5?, Ne3?, Ng4?) and game 17 moves 3–9 (Bg5, Bd2, Bc3, Ba5, Bc3 — five bishop moves in nine) and game 29 moves 1–5 (Bb5+, Bd3, Be2, Bd3) are the same shuffle.
4. **Less depth where it mattered.** Every decisive middlegame blunder fell at depth 10–13 (2: 9...b5?? d15/12...Nxd4?? d13; 8: 26...a6?? **d10**; 10: 42...Qg3?? d12; 11: 14.Ng6?? d13; 12: 20...Nxe7?? d12; 18: 17...Qh6?? d12; 22: 10...Qc5?? d13; 24: 8...Nd5?? d13; 27: 26.Nxc6?? d11; 28: 17...Qb2?? d13; 29: 33.Qc5?? d11). One third of full-time moves never reached depth 14, against one fifth before.

Why 16 draws instead of 10: not because the engine repeated earlier from equal positions — it accepted repetition only at own scores of −150 to −900 (2, 3, 4, 6, 7, 10, 13, 15, 16, 19, 21, 24, 25, 28), which is exactly right, and twice at 0 in dead positions (8, 30). The count went up because more games reached lost-but-blocked positions (queenless, symmetric structures, closed flanks) where Stockfish-limited is happy to repeat, and it reached them earlier (draws averaged 106 plies against 130). Thirteen of the sixteen draws are rescues from ≤ −2.8; only game 8 (SF +1.56 at move 25) and game 13 (SF +2.47 at move 18) were slipped wins, and both slipped in the middlegame before any repetition.

Why 2 wins instead of 5: as White the engine converted nothing (0/15). The white games split into early queen trades with no plan (above), the Exchange Ruy (13, 15, 17: 0/3 again, 0/6 over the two runs), and the Petroff 1.Bb5+ (25, 27, 29: 0/3). Pawn breaks were replaced by flank pawn moves (section 2.3) and captures in the middlegame fell by a sixth. The two wins came from the one thing mobility did improve: in the Scotch as Black the engine now plays 4...Nf6 (games 20, 22, 24) instead of last run's 4...Qh4/5...Qxe4 — the g8-knight scores its squares — and game 20 was won with a castled king and the queen at home.

## 2. Strategic misunderstandings (evaluation), with evidence

### 2.1 Queen trades and the "queen off = nothing to play for" plan vacuum (White games 5, 19, 21, 23, 25; also 16 as Black)

- **Game 23 (W, 3100)**: 3.Qxd8+ Kxd8 is fine (SF +0.52, Black's king on d8), but the follow-up was 12.Bxe5 (bishop for knight, the pair gone), 16.Rd8+/17.Rxa8 (rook trade at 0.00), 27.Rxe8? (−140, best Rd7 — the last rook traded at −0.4), then **28.c4??** (−194, best c3) and **29.Nc3?** (−146, bxc5): 28...c5! 29...cxb4 30.axb4 a3! gave Black a protected passed a-pawn and the b4/c4 hanging pawns (18.b4 had created the a3 hole). Own 0 to −0.5 while SF went −2.3 to −4.7 by move 31. The knight ending was then lost by 36.Ke3? 37.f4? (king away from the g/h-pawns) and by shuffling the king a1–a2–b1 for twenty moves.
- **Game 21 (W, 3000)**: 4.Qxd5 cxd5 (−45), 9.f4? (c4), then **14.Kf1?** (−63, O-O was legal and best): the h1-rook was locked in until move 24, Black's Rb8–b1+–b2 got the second rank, 23.a4? 31.h5? 33.a5? (g3 both times) were the "plan", and 36.Rxb3 cxb3 traded into a B+N vs B+B ending with a passed b-pawn that was lost (39.g3? 43.Kf2?). Saved at SF −5.8 by a repetition.
- **Game 25 (W, 2900)**: 2.Qe2 Qe7 3.d3? (−48) Nxf2 4.Kxf2 — queens off by move 5 with the king on f2; 15.d4? (h3) 24.a6? (−108, Ra4!) fixed the a-pawn as a target; 32.Raa1? 33.Rf2? 35.Ra4? and the rook ending was −3, later −6.9. Saved at −5.7 because Stockfish-limited repeated.
- **Game 19 (W, 2900)**: 4.Qe2 and 7.exf6 Qxe2+ — queens off by move 7, king on e2/f1/f3 for the whole game; **23.Ke2??** (−206, Ne4) walked into 23...Re8+; 26.h5? 55.Bd2?? (−209, Ke3 — the king had to go to the c2 pawn) 56.Rf4? (−128). Saved at −6.0.
- **Game 5 (W, 3100)**: 5.Bxe4 and 7.Bxd5 gave both bishops for knights by move 7, 11.Qe2 traded queens; then rook trades 16.Rxd8+ and 28.Rxa4 into B vs N with Black's knight better; the engine's own score was correct in sign (−1.4 → −6) but it had already chosen the structure. Technique in the race (63.Kg3? 64.Bxc3??) is section 2.6.
- **Game 16 (B, 3000)**: 6...h6? (−135, Be7) invited 7.Bxf6 Qxf6 8.Qxf6 gxf6 — doubled f-pawns, queens off, king to d7/e6 (11...Kd7, 12...Ke6); passive R+B vs R+N from move 9 at SF +1 to +3 for White.

The common thread: nothing in the eval says "with queens on and the opponent's king less safe than mine, keep them on", and nothing says "after the queens go, the king belongs on g1, the rooks on open files, and pawn breaks are the plan".

### 2.2 King safety: castling is still optional

Nine games in which the engine never castled (2, 5, 6, 12, 16, 19, 21, 25, 28): 0 W / 7 D / 2 L, the seven draws all from SF ≤ −2.8. The king_danger term needs two attackers and an enemy queen; the mobility term is blind to it.

- **Game 21**: 14.Kf1? with O-O available (above).
- **Game 22 (B, 3000, Scotch)**: 3.Bg5 Qe7 4.Ne2 Qxe4 5.Bxf6 gxf6 7...Qf5 8.O-O-O **Qxf2?!** — two pawns grabbed with Bc8/Ra8/Rh8 at home and the king on e8; then **9...d6??** (−139, Qf4+ first and castle) and **10...Qc5??** (−200, O-O; own +74, SF −4.35): 11.Bxc6+ bxc6 12.Rhe1+ Be6 13.Qxf6 and the game was over at move 13 (SF +5.8), decided by the b4/a5–a7 passed pawn and later **40...c4??** (−529).
- **Game 24 (B, 3100, Scotch)**: 6...dxe4? (−116, O-O) and **8...Nd5??** (−225, O-O; own −86, SF −3.74) — the knight went to the "most mobile" square d5 while the king sat on e8; 9.Rfe1 Be6 10.Ng5 and the e-file/Qa5–c5 pressure won the a/c pawns. Castled long at move 10 straight into it.
- **Game 6 (B, 3100)**: **12...Kd7??** (−238, O-O-O) — the king walked instead of castling with the same tempo; 13.Rad1 Kc8 14.f3 and the d5/e4 knight fell apart; **19...Qxc3??** (−246, Kc8) walked into 20.Rxd5+.
- **Game 12 (B, 3100, Italian)**: 8...Nxd5? (−90, O-O) 9.Re1+ Kf8 lost castling; then three times (14...Qd6?, 16...b6?, **18...Bb7??** −144) the best move was h6/h5 — luft and a square for the queen — and **20...Nxe7??** (−207, h6) let 21.Bxe7 Qe8 22.Nf5 Ne4?? 23.Bxe4 build the mating net: Qf3+Re7+Ba3+Nf5 against a king with no luft and its rook on h8.
- **Game 18 (B, 3100, Ruy 4.Ba4)**: 8...Bd7? (−147, Be6) let 9.g4! Qg6 10.g5 hxg5 11.Rxg5 — a pawn storm against the castled king that the eval does not price; 15...Qxh2 grabbed the h-pawn and **17...Qh6??** (−195, Qh8) 18.Nxe6 Qxe6 gave a piece: the queen on h2/h6 had two safe squares and the mobility weight for a queen is 1 cp per square, far too small to say "trapped". 21...Kh7? 27...Kf6?? finished it.
- **Game 28 (B, 3000, Petroff)**: 8...Kf8? (−88, O-O-O) after 8.Qh5, king on f8 with the h8-rook buried; 16...Rc8? 17...Qb2?? (−176, Qd4) 18.Rxe6! fxe6 and the king on g8/h8 had no defenders — mated in all but name at move 26 (SF +7.3), then rescued from −9.9 by a repetition.
- **Game 13 (W, 2900)** at the end: **40.Rg2??** (−199, b8=Q; own **+799**): the engine counted a new queen and did not see that Qh3 + a black pawn on g3 in front of its king is a mating net (40...Rg4! 41.b8=Q Rh4). One attacker in the zone, danger 0.

### 2.3 Pawn breaks replaced by flank pawns; pawn structure still free

The engine plays plenty of pawn moves, but the wrong ones: a/h-pawns for rook squares, and never the central lever.

- **Game 7 (W, 2900)**: 19.Qc3? (Nf5), **20.Rde1?** (−109, g4!) **21.h3??** (−136, g4!) 22.Ref1? (−126, a3): twice the plan was g4 (kicking nothing yet, but taking g4 from the bishop and preparing Nf5/g5 against h6), and twice the engine preferred a rook shuffle and h3. 30.Qf2? (−87, c5!) declined the last pawn break; 31.gxh4? (−125, g4). SF −0.4 at move 19, −6.7 at move 31, no tactic anywhere.
- **Game 13 (W, 2900)**: from +2.13, **14.c6?** (−138, Rad1) pushed the extra c-pawn into a blockade for nothing, **19.Rab1?** (−100, f4! with e5 next), **22.f5?** (−127, e5! — f5 shut in the g3-bishop and gave Black e5), 23.Re2? (−83, Qb7). Own +2.3 all the way while SF went +2.1 → 0.0.
- **Game 15 (W, 3000)**: **11.g4?** (−80, exf5) a flank push in front of the castled king instead of the central capture; **16.dxc5?** (−144, d5!) gave up the centre; 19.Rad1? (Rae1); **25.Re1??** (−162, Rd7) traded the rook that was defending into a lost N vs B ending (section 2.6).
- **Game 29 (W, 3100)**: 20.h3?, **23.Kh2?**, **24.b3?** — three times b4! was the move (fixing c6/b5 and opening b-file play); instead g4–g5 (21–22) stormed a king that was not in danger and 26.a6? put the a-pawn en prise for the rest of the game.
- **Game 3 (W, 3000)**: **34.b4?** (−103, Rd8) and **42.c5?** (−146, Rd7) — queenside pawn pushes while Black's h5–h4 storm came; the rook on d2 never reached d7/d8.
- **Game 27 (W, 3000)**: 15.b3/17.b4 with Nc3 invited 17...b5! 18...a5! — the a-file opened for Black's rook (…Ra8–a3–a1) and the b4 pawn was a target; 13.Bxg6 hxg6 had already given Black a half-open h-file for free.
- **Game 23**: 18.b4 → a3/c3 holes; 28.c4?? 29.Nc3? → hanging pawns and a passed a-pawn (2.1).
- **Game 14 (B, 2900)**: 15...g5? (−80, Re7) 18...g4? (−61) — a pawn storm with the own king on g8, 21...gxh3? opened the h-file for Qh5/Qxh6; the resulting rook ending had b5/a6 targets.

### 2.4 Minor pieces: the bishop pair is still worth zero, and "mobile" squares are not "good" squares

- BxN with both bishops in hand, for nothing: 1 (4.Bxc6, 0-1), 5 (5.Bxe4 and 7.Bxd5), 11 (4.Bxf6), 13/15/17 (Exchange Ruy 0/3, 0/6 over two runs), 23 (12.Bxe5), 27 (13.Bxg6), 2 (7...Bxb1? −131), 8 (7...Bxf3), 16 (3...Bxf3). N = 320 / B = 330 makes every one of these a fair trade.
- Knights lured to attackable squares: 11 (14.Ng6??), 3 (22.Ne4?? met by f5–f4), 24 (8...Nd5?? with the king on e8), 1 (Ng4/Nf5/Ne3/Ng4 shuffle in a N+N vs B+B ending while Black's king walked to c4).
- R vs B+N: game 11's 14.Ng6?? line was scored +0.9 by the engine with R+P vs B+N and Black's bishop pair — Stockfish −2.
- Game 17: **17.Qd1?** (−62) and **20.hxg4??** (−175) — both times Bxd4 was best: the black knight on d4 was the piece that mattered; the engine kept its "mobile" bishop on c3 and lost to the h-file (…h4, …hxg3, …g2).

### 2.5 Development and queen sorties (same disease, new move orders)

- **Game 2 (B, 2900)**: 6...Qd6 7...Bxb1? 9...**b5??** (−162, Qa5+) 12...**Nxd4??** (−256, Nd8) 13...Qd6? — the queen was chased by Qa6/Qb7/Qxc7 while Bf8/Rh8 never moved; own +145 → +419 during a stretch SF had at −1.3 → −6.2 (position at ply 23: `r3kb1r/p1p2ppp/Q1n1p3/1p1q4/2pPnB2/P4NP1/1P2PPBP/1R3RK1`). Rescued from −8.8 at move 30 when Stockfish repeated.
- **Game 4 (B, 3000)**: 7...Qb6? (−88, Bc5) 9...Ng4? (−85) **10...Ngxe5??** (−232, Nh6) — the knight grabbed the e5 pawn into 11.Nxe5 Nxe5 12.Re1 f6 13.f4 and the pin cost a piece. Rescued from −8.5.
- **Game 22**: Qxe4/Qxf2/Qc5 with the king on e8 (2.2). **Game 18**: 15...Qxh2 → trapped (2.2). **Game 10 (B, 3000)**: 7...Qg6 8...Qg5 9...Bg4 10...Bh3 — queen and bishop out first, 13...Nc6? (Be6) 17...Bf3? 19...Bh3? (Kh8) and the bishop got trapped on h3/g4 by g4/Rg1; the rest was a king hunt (SF +2.8 by move 22); 42...Qg3?? (−407, a3) at own +56 when SF said −6.4.
- **Games 17, 29, 27**: bishop tours in the first nine moves (2.4); **29** also 15.Qd2? (−91, Qg4) allowing 15...Nxd4 and a pawn.

### 2.6 Endgame technique: the king wanders, the last rook is traded, races are misjudged

- **Game 1 (W, 2900)**: dead level N+N vs B+B until **56.f5??** (own +54, SF −4.44, d18; `8/1p6/pP6/1k1N4/5P2/6KP/1b6/8 w`): the f-pawn ran away from its king, 56...a5! 57.f6 Bxf6 58.Nxf6 a4 and the a-pawn could not be caught because the king was on g3 (Kf3 first was the move). Then 66.Kg4?? (Kg5), 68.Ng7?, 72.Ke5?? (Kg7), 73–75 Kf6/Ke5/Kf6 instead of h7, **76.h7??** (−473, Ke6) — the king shuffled between e5 and f6 with the h-pawn on h6 for five moves; own eval −6 to −19, so this is technique/search, not blindness.
- **Game 5 (W, 3100)**: connected b/c passers vs a lone bishop: 50.Ke2? (Kg3), 56.Bd2? (Be1), 60.Bf2? (Kd2), **63.Kg3?** (−204, Bxc3) **64.Bxc3??** (−239, Be5) — the king went to g3/h4/g5 for the h-pawn while the b-pawn queened. A K+B vs K+N+pawns race with no "distance to the enemy passed pawn" term.
- **Game 15**: **25.Re1??** (−162, Rd7 — the rook to the seventh, hitting b7/c7) traded rooks into N vs B a pawn down; 28.Rxd8+? (−64, Re5) traded the last rook. Then Nd3/Nc1/Nf2/Nh3 shuffles for twenty moves at own −4.
- **Game 23**: 27.Rxe8? (last rook, −140), 36.Ke3? 37.f4?; **Game 21**: 36.Rxb3 into the lost minor-piece ending; **Game 14 (B)**: 32...Red8? (−144, Rd3) 34...Rxg2+? (−72, R2d6) — rook trades into a rook ending with a6/b5 weak and White's king active; **Game 22 (B)**: 40...c4?? (−529, Kxc2).
- **Game 19**: **55.Bd2??** (−209, Ke3) and 56.Rf4? (−128, Ke3) — the c2 pawn was one square from queening and the king stayed on f3.
- **Game 9 (W, 3000)**: after a bad middlegame (7.Qe2? 14.Qd2? 16.axb4? 17.Rf4? 20.Rb1? 21.Nde2? — queenside pawns a3/b2 collapsing to …a4/…b4/…a3), the K+B vs K+R+P ending was already lost; 109.Kf3?? and 111.Kg3?? (own −14/−15) only shortened it.
- **Game 30 (B, 3100)**: not a slipped win (SF 0.00 from move 26), but the engine scored K+B+h2-pawn vs K+B (opposite colours, wrong-square h-pawn) at **+4.09** for thirty plies. Opposite-coloured bishops and wrong-rook-pawn draws do not exist in the eval.

## 3. Tactical oversights (search, not evaluation)

The same shape as last run — a capture or pawn move whose refutation is a quiet move two or three plies later — but now at lower depth (median full-time depth 14 vs 15, one third of moves at ≤ 13):

- Game 2, 9...b5?? (d15) — 10.Qa6! quiet; 12...Nxd4?? (d13) — 13.Rbd1! quiet.
- Game 4, 10...Ngxe5?? (d12) — 12.Re1 and 13.f4 pin.
- Game 6, 19...Qxc3?? (d14) — 20.Rxd5+.
- Game 8, 26...a6?? (**d10**, own +335) — the winning 26...Qc6 (hitting f3 and c3, Nxf3 next) replaced by a mobility pawn move; 28...Rf8? 29...Rfc8? 33...Qe6? (Rd8) then let White force a perpetual with 34.Rxh7+.
- Game 10, 42...Qg3?? (d12) — 43.Qf6! quiet.
- Game 11, 14.Ng6?? (d13) — 14...Qc5 quiet, hitting c4 and f2.
- Game 12, 20...Nxe7?? (d12) — 21.Bxe7 Qe8 22.Nf5 quiet net.
- Game 18, 17...Qh6?? (d12) — 18.Nxe6.
- Game 22, 10...Qc5?? (d13) — 11.Bxc6+ and 12.Rhe1+.
- Game 24, 8...Nd5?? (d13) — 9.Rfe1 quiet.
- Game 27, 26.Nxc6?? (d11, own +147, SF −3.54) — 26...Rxe1+ 27.Rxe1 Qc8! quiet, the knight has no retreat.
- Game 28, 17...Qb2?? (d13) — 18.Rxe6! sacrifice.
- Game 29, 33.Qc5?? (d11) — 33...Bxe5 34.fxe5 Qh4 quiet.
- Game 13, 40.Rg2?? (d13, own +799) — 40...Rg4! quiet mating net.
- Game 3, 22.Ne4?? (d11) — 22...f5! and f4.

Mobility made this worse in two ways: the nodes cost (−12 % nps) and, in the last three, the term actively liked the losing move (a centralised knight, an open a-file for the rook, a rook defending g2 instead of promoting). The threat/hanging-piece term and the "do not reduce quiet moves that attack a higher-valued piece" search rule from the last report are still the cheapest fix.

## 4. Game-by-game

| Game | Side / Elo | Result | Where it went wrong (chess terms) | Type |
|---|---|---|---|---|
| 1 | W 2900 | 0-1 | 4.Bxc6 pair away; level N+N vs B+B; 56.f5?? king away from the a-pawn; king shuffles e5/f6 with h6 pawn; 76.h7?? | strategic (pair) + endgame technique |
| 5 | W 3100 | 0-1 | both bishops for knights by move 7; queens off move 11; rook trades into B vs N; race misjudged 63.Kg3? 64.Bxc3?? | strategic (trades) + endgame |
| 9 | W 3000 | 0-1 | 7.Qe2? 14.Qd2? rook lift 17.Rf4?; a3/b2 queenside collapsed to …a4/b4/a3; lost R vs B ending | strategic (structure, activity) |
| 11 | W 3100 | 0-1 | 4.Bxf6 pair; 14.Ng6?? knight to the "mobile" square, R+P vs B+N at +0.9; 22.Rd1? | strategic (minors) + tactical |
| 12 | B 3100 | 1-0 | 8...Nxd5? lost castling; never made luft (h6 best three times); 20...Nxe7?? mating net | strategic (king) |
| 14 | B 2900 | 1-0 | 15...g5? 18...g4? storm with own king on g8; 21...gxh3? opened h-file; rook trades 32/34 into lost R ending | strategic (king, trades) |
| 17 | W 3100 | 0-1 | five bishop moves in nine; 13.a4? not f4; 17.Qd1?/20.hxg4?? not Bxd4; h-file storm vs h3 hook | strategic (development, minors, storm) |
| 18 | B 3100 | 1-0 | 8...Bd7? then g4–g5 storm; 15...Qxh2 17...Qh6?? queen trapped; 27...Kf6?? | strategic (king, queen sortie) |
| 22 | B 3000 | 1-0 | Qxe4/Qxf2 with king on e8; 9...d6?? 10...Qc5?? (O-O); 40...c4?? | strategic (development, king) |
| 23 | W 3100 | 0-1 | 3.Qxd8+ then no plan; 12.Bxe5; last rook traded 27.Rxe8?; 28.c4?? 29.Nc3? structure; king a1/a2 shuffle | strategic (queen trade, structure, endgame) |
| 27 | W 3000 | 0-1 | 13.Bxg6 free h-file; b3/b4 opened the a-file for Black; 26.Nxc6?? quiet refutation | strategic (structure) + tactical |
| 29 | W 3100 | 0-1 | four bishop moves; a4/a5/a6 for the a1-rook; b4 declined three times; g4–g5 storm; 33.Qc5?? | strategic (mobility artefact, breaks) + tactical |
| 8 | B 2900 | ½ (was +1.6) | 26...a6?? (d10, own +3.35) instead of Qc6; Rf8/Rfc8 shuffles; perpetual | tactical (depth) + mobility artefact |
| 13 | W 2900 | ½ (was +2.5) | 14.c6? 19.Rab1? 22.f5? 23.Re2? — breaks f4/e5 declined; 35.Rf1?? 40.Rg2?? mating net vs b8=Q | strategic (breaks) + king safety |
| 3, 7, 15, 19, 21, 25 | W | ½ from −5 … −9 | queenless/planless (19, 21, 25); breaks declined (7: g4×2, c5; 15: d5); rook-file pawn pushes (3, 7, 19, 21, 25); last rook traded (15) | rescues, not slipped wins |
| 2, 4, 6, 10, 16, 24, 28 | B | ½ from −2.8 … −9.9 | queen/knight sorties (2, 4, 10), king never castled (6, 16, 24, 28), 17...Qb2?? (28) | rescues |
| 30 | B 3100 | ½ (0.00) | opposite bishops scored +4.1; nothing lost | eval knowledge gap only |
| 20, 26 | B 2900 | 1-0 for us | 4...Nf6 not Qh4; castled by move 9; queen at home until the SF blunders (18.Kh1?, 25.b4?) | the winning template |

## 5. Should a mobility term be retried?

Not in this form. It did not move the optimism (+233/+275 cp against +216/+186), it cost 12 % of the nodes and a full ply of median depth, and its incentives are wrong in three specific ways the games expose: raw rook squares reward a/h-pawn pushes (games 29, 21, 17, 25, 3, 7, 8), "safe" means only "not attacked by a pawn now" so knights walk into f5–f4/…f5 kicks (3, 11, 24), and a linear 1–2 cp per queen square never says "trapped" (18, 2, 22). If it is retried it should be as three narrow terms rather than one broad one: (a) knights and bishops only, middlegame only, squares not attacked by enemy pawns *or pawn pushes* and not defended by lower-valued pieces, ±3 cp per square around the zero-mean; (b) a trapped-piece penalty (−50 for a minor, −80 for a queen with ≤ 1 safe square); (c) rook activity as open/semi-open file and seventh rank, never as raw squares. Items (b) and (c) are already in last run's list; the games of this run are the test set for them.

## 6. Prioritised, engine-implementable suggestions (max 7)

1. **Uncastled-king penalty and open-file/luft penalties, independent of the enemy queen.** −35 mg for a king on e1/e8 or one that has lost castling rights without castling while the opponent has ≥ 4 pieces; −20 per open, −12 per semi-open file on the king's file or adjacent; −15 when a castled king has no luft and the back rank holds an enemy rook or queen; enemy pawn on the 3rd rank (6th for Black) adjacent to the king −25. Evidence: 21 (14.Kf1? vs O-O), 22 (9...d6??/10...Qc5?? vs O-O), 24 (6...dxe4?/8...Nd5?? vs O-O twice), 6 (12...Kd7?? vs O-O-O), 28 (8...Kf8? vs O-O-O), 12 (h6 best three times, 20...Nxe7??), 13 (40.Rg2?? vs the g3 pawn + Qh3 net), 18 (g4–g5 storm). Nine uncastled games: 0/9 wins.
2. **Keep the queens on when equal and safer; trade-bias by the sign of the eval.** When material is level, own king castled and the enemy king not (or the enemy has ≥ 1 more open file next to its king), score a queen trade −30 mg; when the eval is ≤ −100, −15 per piece pair traded, and +10 when ≥ +100. Evidence: White queen trades in 5, 19, 21, 23, 25 (0 W / 3 D / 2 L), last rooks traded when worse in 15 (25.Re1??, 28.Rxd8+?), 23 (27.Rxe8?), 21 (36.Rxb3), 14 (32...Red8?, 34...Rxg2+?); wins 20/26 and last run's five all kept queens past move 20.
3. **Pawn-lever bonus and flank-pawn penalty (middlegame).** +12 for a pawn on the 4th/5th rank supported by a pawn and adjacent to an enemy pawn it can capture or fix (the "break is available" bonus, paid once the lever exists), −10 per a/h-pawn beyond the 3rd rank while both sides have ≥ 5 pieces and the own rook on that file has not left its home square (so the rook's mobility gain is cancelled). Evidence: 7 (20.Rde1?/21.h3?? vs g4, 30.Qf2? vs c5), 13 (19.Rab1? vs f4, 22.f5? vs e5), 15 (11.g4?, 16.dxc5? vs d5), 29 (b4 declined at 20/23/24; a4/a5/a6), 3 (34.b4?, 42.c5?, 43.a4?, 46.a5?), 17 (13.a4? vs f4), 21 (23.a4?, 33.a5?), 25 (24.a6?), 8 (26...a6??).
4. **Bishop pair and minor-piece values.** Pair +30 mg / +45 eg; N = 340, B = 355; −4 per own pawn on the bishop's colour; knight outpost (pawn-protected, no enemy pawn can attack it) +20 mg, and −20 for a knight on the 5th/6th rank that a pawn push can attack next move (Ng6 in 11, Ne4 in 3, Nd5 in 24). Evidence: BxN for nothing in 1, 5, 11, 13, 15, 17, 23, 27, 2, 8, 16; Exchange Ruy 0/6 over two runs; 17's Bxd4 declined twice. Also take 4.Bxc6 and 1.Bb5+ out of the book for White (0/6 and 0/3).
5. **Threat / hanging-piece term and quiet-move reduction guard.** −value/8 for a piece attacked by a lower-valued piece or attacked and undefended; do not LMR-reduce quiet moves that attack the enemy queen or a higher-valued piece, and do not futility-prune a move that attacks a piece with ≤ 1 safe square. Evidence: fifteen quiet refutations in section 3 at depth 10–13 (2, 3, 4, 8, 10, 11, 12, 13, 18, 22, 24, 27, 28, 29); 18's 17...Qh6?? and 2's queen hunt are trapped-queen cases.
6. **Development / tempo term for the first 12 moves.** −10 per own minor still at home while the opponent has a queen, −25 if the queen is beyond its 2nd rank before two minors are out, −8 per repeat move of the same minor piece before move 8, and captured pawns on the enemy 2nd/3rd rank count +60 not +100 while ≥ 2 own minors are undeveloped. Evidence: 22 (Qxe4/Qxf2/Qc5), 2 (Qd6/Qd5 hunt, 9...b5??), 4 (7...Qb6?, 10...Ngxe5??), 10 (Qg6/Qg5/Bg4/Bh3), 18 (15...Qxh2), 17 and 29 (four/five bishop moves), 27 (1.Bb5+ 2.Be2).
7. **Endgame king and passed-pawn rules.** Replace centralisation in `KING_EG_PST` by −6 per king step from the most advanced enemy passed pawn and +4 per step toward own passed pawn when no queens remain; +15 eg for a rook behind a passed pawn; unstoppable-passer test (square rule) when the defending side has only a king or a bishop of the wrong colour; opposite-coloured-bishop scaling ×0.5 and wrong-rook-pawn = 0. Evidence: 1 (56.f5??, Kg4??/Ke5??/h7??), 5 (63.Kg3?/64.Bxc3?? race), 19 (55.Bd2??/56.Rf4? vs Ke3), 23 (36.Ke3?/37.f4?, a1/a2 shuffle), 15 (Nd3/Nc1/Nf2 shuffles at −4), 30 (+4.1 for a dead draw), 9 (K+B vs K+R+P scored −14 but played Kf3??).
