# Grandmaster review of run `c3a8a8b`

Reviewer's brief: our engine (material + piece-square tables, now tapered by non-pawn-material phase; alpha-beta with transposition table and capture-only quiescence, depth ~7 in 0.25 s) against Stockfish 19 at UCI_Elo 1700/1800/1900. Score 21/2/7, Elo 1985 ±144. Only wins count. This review covers the seven losses (8, 9, 11, 12, 17, 23, 28) and two draws (10, 16) and builds on `analysis/498eace/grandmaster.md`, `analysis/7047219-full/grandmaster.md` and `analysis/7308d5b/grandmaster.md`; their content is not repeated, only referenced. Evals in brackets are Stockfish depth 14 from White's side; "own" is the engine's score from its own side.

## Summary

**What changed.** The tapered evaluation did what it was meant to do: the queenless king walk (item 3 of the last review, three losses in `7047219-full`, two in `7308d5b`) is gone. Not one of the nine non-wins was caused by a king marching into rooks and minors with the queens off, and the engine's king moves in the queenless games were sound (game 7: Kf2-e3-d3 in a level R+B ending; game 10: forty king moves holding a lost ending to a draw). Every king-safety failure this run happened with the enemy queen on the board. Draws also remain correct behaviour: both (10 from −6.7, 16 from −7) were saved from lost positions by repetition or the fifty-move rule; no draw was taken from a better position.

**What persists.** (1) King safety with the enemy queen on is still the number-one cause: games 11, 17, 23 as White and 9, plus the slipped half-point in 16. (2) Mating nets below the horizon decided 8, 9 and 17 outright and finished 23; the search still has no check extension and its quiescence stands pat while in check (`engine/src/search.rs`, `quiescence`, no `board.checkers()` test), so a mate in 3 was missed at depth 5 (game 9, 23.d8=Q??). (3) Queen pawn-grabs (11: 13.Qxa4, 9: 17.Qc7, 16: 24...Qxb2, 12: 13...Nxa4) and one trapped bishop (9: 12.e5?? then 21.Bxc4 for two pawns).

**What is new.**
- **The Italian is a disaster: 1 win, 1 draw, 4 losses in games 7-12** (all other openings: 20 wins in 24 games; the start position 6/6). As Black (8, 10, 12) the engine never castled: 2...Ng4?!, 1...Qf6?!, 2...d5?! and the king ended on f7/g8 (8), f8 (10), e8 on an open e-file (12). As White (9, 11) the same 1.Nc3 2.O-O 3.d3 4.Be3/Bg5 setup led to the trapped Bb3 and the 8.Qc3?? fork.
- **The king blocks checks and walks onto open files because of the PST.** `KING_MG_PST` rates f8 +10 over e8 and g1 +30 over h1. So 8...Kf8 (game 28), 10...Kf8?? (game 10, −278, best Nec6) and 17...Kf8? (game 4, −164, best Be6) were chosen over interpositions, and in game 11 the engine kept its king on g1 in front of doubled black rooks on the g-file while Stockfish wanted Kh1 three times (moves 23, 26, 27; 26.c4?? −284, 27.Re1? −179).
- **Time is left on the table exactly where the games were lost.** `soft_limit = 0.4 × movetime` (0.10 s) means no new iteration starts after 0.10 s, so a depth-5 or depth-6 iteration that finishes at 0.11 s ends the search: 8.Qc3?? (0.13 s, d5), 13.Qxa4? (0.12 s, d6), 26.c4?? (0.16 s, d5), 27.Re1? (0.12 s, d6) in game 11; 16...Kg8? (0.13 s), 17...Bxc4? (0.14 s) in game 28; 12.Nce6? (0.21 s) in game 1. Average use is 73 % of the budget and 55 of the 74 blunders were at depth ≤ 7.

---

## The four losses from winning positions

### Game 8 (Black vs 1700, Italian, 1-0, 12 moves) — from −6.13 to mate in one move

After 5...Bxf2+ 6.Kf1? Bxe1 7.Bxf7+? Kxf7 8.Ng5+ Black is a rook up [−6.13]. 8...Ke8! (or Kg6) keeps everything. The engine played **8...Kg8?? (−1609, own +548, d6)** and was mated by 9.Qb3+ d5 10.exd6+ Be6 11.Qxe6+ Kf8 12.Qf7#. Seven plies, three of them checks, one pawn capture en passant-style on d6 that the capture-only quiescence does see but whose follow-up (Be6 forced, Qxe6+) it does not. With a check extension on Qb3+, exd6+ and Qxe6+ the line is within depth 6; without it the leaf after 10...Be6 is a quiescence node that reads "rook up". The PST contributed: Kg8 is +30, Ke8 is 0.

### Game 11 (White vs 1900, Italian, 0-1, 63 moves) — +2.77 thrown by a fork, then a king on an open g-file for 35 moves

4.Bg5 a5? 5.Nd5 h6 6.Bxf6 gxf6 was +2.53 (Black's kingside pawns wrecked, king stuck in the centre). Then 7.Qd2? (−71, c3) and **8.Qc3?? (−448, 0.13 s, d5)** put the queen on a square hit by 8...Nd4: after 9.Nxd4 Bxd4 10.Qa3 c6 the d5 knight has one square (e3) and White has lost the thread [−3.04]. Stockfish then gave it back (11...d6? +2.75 swing) and **13.Qxa4? (−297, 0.12 s, d6, best d4)** grabbed the a-pawn while ...b5 shut the queen and bishop out; 14.Bxb5 cxb5 15.Qxb5+ was a piece for two pawns.

From move 20 the position was the same for 25 moves: Black's rooks doubled on the g-file (Rg6/Rg8, Rg5), pawn to h5-h4-h3 lodged on h3, queen on the a7-g1 diagonal; White's king on g1 with pawns g2/h2. Stockfish's best move was Kh1 at moves 23, 26 and 27 and Kf2/Ke2 at 28, 40, 43 and 44; the engine played 23.Rfd1?, 26.c4??, 27.Re1?, 28.Kf1?, 30.Kg1? — a rook to the d-file and the king back to g1 (+30 in the PST, h1 is +20). The finish was the pawn-shield version of the same blindness: **42.h3?? (−332)**, **44.h4?? (−457, Rxh4)**, **46.b4?? (−503)** Rh1+ 47.Ke2 Qg1 and the king was driven to a4 and mated. Stockfish-1900 was itself losing the thread (43...Rh6? −501 gave White −3.24 for one move); the engine had three separate chances to get the king off the g-file and never priced the file.

### Game 17 (White vs 1900, Ruy Lopez, 0-1, 30 moves) — +7.12, then a recapture that opened the g-file

After 11...h6?? White was +6.07 with the exchange and a pawn. Two chances went: 18.g3? (−84, e5) loosened f3/h3 with a black bishop on b7 pointing at g2; **20.e5?? (−669, own eval unknown, best Bxd6)** unblocked that bishop's diagonal and put Bb4 on the e1 rook (0.43). Stockfish-1900 returned the favour (21...Bc5?? +5.35), and after 22.Qxc5 Rxf4 the engine faced the run's defining decision: **23.gxf4?? (−1585, own +988, d6, best Qxc7)**. The g-pawn was the only thing between Qh5, Bb7 and the g1 king; 23...Qg4+ 24.Kf1 Bg2+ 25.Kg1 Bh3+ 26.Kh1 Qf3+ 27.Kg1 Qg2# is nine plies of which four are checks. The engine's own score, +988, says it counted the rook and nothing else. This is the `7047219-full` "gxh3 recapture reflex" in a new dress; a pawn-shield term prices it, a check extension sees it.

### Game 28 (Black vs 1800, Petroff, 1-0, 32 moves) — +1.92 with a king that had blocked a check on move 8

8.Qe3+ **Kf8** (−14 only, but strategically the game's root: the h8 rook was out of play for the next 14 moves and f7 became the target). 11...Ng4 12.Qg5? Nxf2 13.Qxd5 Be6 14.Qh5 Nxh1 won the exchange [−1.92 for White at move 15]. Then, with Bc4 and Qf1 aimed at f7 and Nf3-g5 available: 16...Kg8? (−137, 0.13 s, best Bb3), 17...Bxc4? (−160, 0.14 s, best Qb5 — trading the bishop that was blocking the a2-g8 diagonal), **18...h6?? (−676, own eval unknown, best Rf8)** and 19.Ng5 (threat Nxf7 with Qxf7#) Nd8 20.Nxf7 won back the exchange with attack; 20...Kh7? (−297, Qf6) and 22...Kxh8? (−159, Qf6) preferred the material recapture to the counter-attack on f2 and the king was mated on d8. The unmoved h8 rook and the undefended f7 were never scored; ...Rf8 was best at 16, 18 and again at 20.

## The other losses

### Game 9 (White vs 1800, Italian, 0-1, 25 moves) — a bishop trapped by pawns, then a mate in three missed at depth 5

11...c5 threatened c4 against the b3 bishop with ...b5 already covering a4. **12.e5?? (−201, best Bd5)**: after 12...c4 the bishop had no square and the engine spent 13-21 avoiding the loss of it (17.Qc7? −297 and 18.h3? −384, best Bxc4 both times: give it for two pawns immediately, before ...Nge3 forked queen and rook) and finally 21.Bxc4 bxc4 anyway. Then, a queen down, **23.d8=Q?? (−398, d5, best Kf2)** promoted into 23...Qe3+ 24.Kf1 Bg2+ 25.Ke1 Nf3#: five plies. At depth 5 the node after 25.Ke1 is a quiescence node; Black is not in check, Nf3# is a quiet move, so the engine stood pat a queen up. Even one ply of check extension on Qe3+ finds this; so does refusing to stand pat when the side to move is in check (which would already have shown 24.Kf1 to be hopeless).

### Game 12 (Black vs 1900, Italian, 1-0, 21 moves) — mated on the e-file without ever castling

2...d5?! 3.exd5 Nxd5 4.b4 Bb6 5.O-O Bg4 6.a4 a5 7.b5 Nce7 8.Ba3 c5? — nine moves without ...Nf6/...O-O; the king was on e8 with a white rook coming to e1. **9...Nxc6?? (−287, best bxc6)** recaptured toward the centre and left the e7 knight pinned once 10.Re1 arrived (+4.83); 10...f5? (−87, Nde7) and **13...Nxa4? (−239, best Qc7)** grabbed a pawn with the king still on e8, and 14.Nxe5 broke the file open: Bxf2+ 15.Kh1 Qc7 16.Nxc6+ and mate on the e-file. The engine's evaluation has no term for "king on an open file with castling rights lost"; the king PST alone rates e8 at 0 all game.

### Game 23 (White vs 1900, Scotch, 0-1, 27 moves) — a lodged h3 pawn, doubled rooks on the f-file, and a queenside pawn move

By move 20 Black had ...h5-h4-h3 lodged next to the g1 king (18...h3, 19.g3 forced) and rooks on f6/f8 after 20.Bxe6 fxe6 opened the f-file. The position was 0.01 and the only move was 21.Rf1 (or Rf2). **21.b4?? (−727, own +140, d6)** and 21...Rf2! — a quiet move — followed by 22...Rg2+ 23.Kh1 Rxh2+ 24.Kxh2 Rf2+ 25.Kh1 Qxg3 with Qh2# unstoppable. Two things: the enemy pawn on h3 turns every g2/h2 square into a mating square and the evaluation gives it nothing; and a rook landing on f2 next to the king is a quiet move that no extension finds, so this game is the evaluation's to fix, not the search's.

## The draws

**Game 16 (Black vs 1800, Ruy Lopez, threefold from −6.97).** The +1.79 came from Stockfish's 13.f4?? after the engine's own **12...g5?? (−269, own castled king, best exd3)** — a pawn push in front of its castled king with the white queen on c2 and knight on h4. 13...gxf4? (−279, Qd5) and later **24...Qxb2?? (−598, own eval unknown, best Rae8)** grabbed b2 with a knight one move from f6+ and the queen needed at home: 25.Ng4 Qxc3 26.Nf6+ Kh8 27.Rf2 and 27...Qxe1+ gave the queen to stop Qxh7#. The perpetual at moves 42-48 was the right decision from −7; the win was gone at move 24.

**Game 10 (Black vs 1800, Italian, fifty-move rule from −6.74).** Never castled: 1...Qf6?! 2...d6 3...Be6 4...Nge7 and **9...cxb4?? (−424, best O-O)**, 10.Bb5+ **Kf8?? (−278, best Nec6)**, from then on Rh8 was boxed in until move 33 and the engine defended a lost position for 150 moves. Stockfish-1800 could not convert R+B v B+N; credit to the engine's endgame king play (Kd6-c5-d5-e5, all at 0 loss), which is the tapered eval working, but the draw is a save, not a slipped win.

---

## Themes, with counts

| Theme | Games | Status vs previous reviews |
|---|---|---|
| Own king exposed with the enemy queen on: pawn-shield capture (17: gxf4), pawn moves in front of the king (16: g5; 11: h3, h4), open/half-open file not left (11: g-file, Kh1 ×3; 23: f-file), slow queenside pawn move instead of defence (23: b4; 11: b4, c4) | 11, 17, 23, 16, (9) | **Persists, #1** |
| Mating net below the horizon: 7 plies with 3 checks (8), 5 plies with 2 checks (9), 9 plies with 4 checks (17) | 8, 9, 17 | **Persists** — no check extension, stand-pat in check |
| Uncastled king in the Italian as Black; king blocking checks (Kf8) because of the PST | 8, 10, 12, 28, (4) | **New / returned** — 0 castled kings in 3 Italian games as Black |
| Queen pawn-grab or queen onto a forkable square | 11 (Qc3, Qxa4), 9 (Qc7), 16 (Qxb2), 12 (Nxa4) | Persists, smaller than before |
| Trapped piece | 9 (Bb3 after 12.e5) | Persists, one game |
| Queenless king walk | none | **Fixed by the tapered eval** |
| Draw from a better position | none | Unchanged: both draws were saves |
| Time: iteration not started after 0.10 s, decisive blunders at 0.12-0.16 s | 11 (×4), 28 (×2), 1 | **New observation** |

Where Stockfish's own strength mattered: every loss came at 1700-1900, and Stockfish-1900 blundered back into the engine's hands in 11 (11...d6?, 43...Rh6?) and 17 (21...Bc5??) and still won, because the engine then blundered again. Games 8 and 12 were lost in under 22 moves; the engine's opening ACPL (33) is now higher than its endgame ACPL (37 is close), and all seven opening blunders were in the Italian and Petroff FENs.

---

## Prioritised suggestions (engine-implementable)

1. **Check extension, and no stand-pat while in check.** In `negamax`, when the move just played gives check, search the reply at `depth` instead of `depth - 1` (cap total extension per line at ~3). In `quiescence`, if `board.checkers()` is non-empty generate all evasions instead of captures, do not stand pat, and return `-MATE + ply` when there is none. Evidence: 8...Kg8?? (7 plies, 3 checks, own +548), 23.d8=Q?? (5 plies, mate in 3, depth 5), 23.gxf4?? (9 plies, 4 checks, own +988), and the finish of 23. Three losses, all from positions ≥ +1.5 or a queen up.

2. **King safety with the enemy queen on, three cheap terms scored for both sides.** (a) Pawn shield: −15/−25 per missing/advanced pawn on the king's three files, −40 when the file directly in front is open (prices 23.gxf4, 12...g5, 42.h3/44.h4). (b) King on or adjacent to an open/half-open file with an enemy rook or queen able to reach it: −30 to −50 (prices Kh1 in game 11, Rf1 in game 23, the e-file in game 12). (c) Enemy pawn lodged on the sixth rank next to the king (h3/h6, f3/f6) with the enemy queen on: −30 (games 11 and 23). Multiply the whole term by 0 when the enemy queen is off, so the endgame king play that this run got right is untouched. Fixes 11, 17, 23 and the slip in 16.

3. **Castling and the central king.** While the enemy queen is on: −40 for a king on its home rank on the d/e/f files with castling rights lost, −20 per open or half-open file the king stands on, +20 for having castled, and remove the +10 for f1/f8 in `KING_MG_PST` (make f1/f8 equal to e1/e8) so that interposing a piece is not out-scored by stepping the king. Also order the root search to prefer castling over pawn captures at equal score in the first 10 moves. Evidence: 9...cxb4?? and 10...Kf8?? (game 10), 9...Nxc6?? with Re1 coming (game 12), 8...Kf8 and 16...Kg8/18...h6?? (game 28), 17...Kf8? (game 4), 8...Kg8?? (game 8). Would turn the Italian-as-Black score of 0/3 around.

4. **Use the clock: raise `soft_limit` from 0.40 to ~0.65 of `movetime` and never stop an iteration early when the root score dropped ≥ 100 cp against the previous iteration or the best move changed.** With `reserve` already protecting the hard limit, this adds one ply in most middlegame positions for free. Evidence: 8.Qc3?? (0.13 s, d5), 13.Qxa4? (0.12 s), 26.c4?? (0.16 s), 27.Re1? (0.12 s) in game 11; 16...Kg8? and 17...Bxc4? in game 28 at 0.13-0.14 s; average usage 73 %. Pair it with killer/history move ordering so the check extension in item 1 does not cost the ply back.

5. **Poisoned-pawn and forkable-square test for the queen, plus a minimal trapped-piece term.** Before crediting a queen capture of a pawn on the a/b/c files in the enemy half, require ≥ 2 safe retreat squares afterwards and no enemy knight able to reach a square attacking both the queen and the king/rook in one move; give a minor piece or queen with ≤ 1 safe square −60 (−120 in the enemy half). Evidence: 8.Qc3?? (Nd4 fork), 13.Qxa4? (game 11), 24...Qxb2?? (game 16, Ng4-f6+), 17.Qc7? (game 9), 13...Nxa4? (game 12), and 12.e5?? / the Bb3 trap in game 9 where 12.Bd5 was needed. Two losses partially, one draw.

Items 1-3 together cover all seven games that were lost from ≥ +1.5 or from a material edge; item 4 is a two-line change; item 5 is the residual material-greed leak that previous reviews already documented and that the tapered eval did not touch.
