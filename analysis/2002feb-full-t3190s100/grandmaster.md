# Grandmaster review of run `2002feb-full-t3190s100` (0 wins, 16 draws, 14 losses vs Stockfish 19 @ 3090–3190, 5 s/move)

Move numbers are the PGN's own (they restart at 1 from the `[FEN]` book position where one is given), `ply` is the ply used in the summary/`moves.jsonl`. "E loss" is the cp this run's annotator charges the engine's move against Stockfish's best (from the mover's own side); "S loss" is the same for Stockfish's move (almost always small — SF 19 at full strength barely errs). `[%eval]` is always from White's side. The two earlier reviews, `analysis/579a92f/grandmaster.md` (5/10/15, 0.25 s/move) and `analysis/966bbcc/grandmaster.md` (2/16/12, 0.25 s/move), are the baseline throughout.

## 1. Headline: search depth cured the opening disease; the endgame is now the whole problem

At 0.25 s/move (depth ~14–18) both earlier runs were lost mostly in the opening and middlegame: queen sorties on move 4–8, kings left on e1/e8/d8 all game, and one-ply tactical refutations the shallow search never saw. At 5 s/move (avg depth 24.3, 97% of the time budget used every move) almost all of that is gone:

| | 579a92f (0.25s) | 966bbcc (0.25s) | 2002feb (5s, this run) |
|---|---|---|---|
| opening ACPL / blunders | high, queen-out-by-move-5 in 8+ games | same disease, new move order | **13.0 / 1 blunder in 300 moves** |
| middlegame ACPL | 31 (depth ~15) | worse | **25.3 (6 blunders in 903 moves)** |
| endgame ACPL / blunders | — (folded into "technique", secondary) | — | **20.0 / 19 blunders in 1128 moves** |
| where the worst blunder of each loss falls | opening/middlegame, mostly | opening/middlegame, mostly | **endgame ×11, middlegame ×3, opening ×0 (of 14 losses)** |
| draws that were slipped wins (SF ≥ +1.5 at some point) | 3 of 10 | 2 of 16 | **0 of 16** |
| draws saved by repetition from a lost position | 9 of 10 | 15 of 16 | **13 of 16** (+2 insufficient material, +1 400-ply adjudication) |

So the deep search fixed the cheap one-ply tactics and, together with a book of real named openings (Italian, Ruy Lopez, Scotch, Petroff), largely fixed the "king stuck in the centre with the queen out by move 5" epidemic. What is left is almost entirely **endgame technique** — the same two items both earlier reports flagged and prioritised (king centralisation instead of opposition/pawn-race play, and "which piece controls the promotion square") were never implemented, and now that everything upstream got better, they are the largest single cause of losses in this run. A second, smaller thread survives unchanged from both earlier runs: **the Exchange Ruy Lopez book line still loses every time it's played**, at any search depth, because it's a repertoire choice, not a search problem.

Repetition-hunting from lost positions is still healthy and slightly *more* effective than before (13/16 draws are rescues) — this should not be touched. Unlike the earlier runs, no game was ever actually winning and then let go (0 of 16 draws reached SF ≤ −1.5 for the engine) — the engine simply never got a winning position this run, consistent with an Elo estimate (2978) still below the opponent's ceiling (3190).

## 2. Strategic misunderstandings (evaluation gaps), with evidence

### 2.1 Endgame king play: centralisation instead of racing the passed pawn (still unfixed from both prior reports' item 7)

- **Game 27 (W, Petroff, loss)**: a 242-ply bishop-and-rook-then-bishop endgame where Black's queenside a/c pawns and kingside g-pawn run simultaneously. From move 70 the king is repeatedly sent the wrong way: 70.Rc3? (−60, best Kg4), 72.Bb2? (−70), **73.Ba3+? (−71, best Kg3)**, **74.Bf8? (−51, best Kg4)**, **75.Bc5? (−75, best Kg4)**, 79.Ba3? (−60, best Be7), 82.Bf8? (−86, best Kf2), 95.Kd1? (−116, best Kd3), 96.Ke1? (−80, best Kd2), 97.Kf2? (−74, best Kd2), 98.Ke3? (−65, best Ke1). Forty moves of the king (and the lone bishop) drifting between the two flanks instead of planting itself in front of the pawn that actually queens; both the a/c-pawn duo and the g-pawn cross the board and the position, already lost, is finished off at move 103 (`c1=Q+`) and 108 (`g1=Q`).
- **Game 15 (W, Ruy Lopez, loss)**: in an already-lost king-and-pawn race, 63.Ke4? (−428, unfixed), **64.Kf5? (−304, best Ke5)**, 66.Kf7? (−189, best Ke7) — the king walks toward the centre/kingside instead of the queenside pawn it needed to escort or the enemy king it needed to block, exactly the `KING_EG_PST` centralisation bias (e4/f5 rewarded, regardless of where the pawns are) both earlier reports asked to replace with a "distance to the nearest passed pawn" term.

This is the single largest unaddressed item from both prior reports: it was suggestion #7 in `579a92f` and #7 in `966bbcc`, evidenced there by games 11/3/23/19/9, and it is still not implemented — it is now responsible for the worst blunder in 2 of the 14 losses outright and contributes to the technique failures in several more.

### 2.2 Endgame minor pieces: not controlling the promotion square (still unfixed from prior reports' item 7/4)

- **Game 14 (B, Ruy Lopez, loss)**: after 47.e5 Black's connected e/f-pawns need a piece to blockade or attack the queening squares; instead **47...Bc7?? (−614, best Bf2)**, **50...Bb6?? (−196, best Bd4)**, **57...Bf4? (−198, best Bg3)** send the only minor piece to squares that neither blockade e6/f7 nor attack the White rook shepherding the pawns. The position was already very bad (SF +12 to +15) but each of these moves throws away the drawing/defensive resource that a correctly-placed bishop would still offer.
- **Game 27**: the same bishop (2.1) never once sits on a diagonal that controls a1/c1 (Black's actual queening squares) even though it has eight moves in a row to choose one.

Both prior reports asked for exactly this (`579a92f` §2.6/#7: "the piece that controls the promotion square"; `966bbcc` #7: "unstoppable-passer test, square rule"). It remains missing and is now the second-largest endgame cause of loss.

### 2.3 The Exchange Ruy Lopez and the Scotch queen sortie: unchanged book choices, still 0 wins

- **Games 13, 15, 17 (all W, all losses)**: all three open **1.Bxc6** (E loss 33 every time, `[%eval]` barely moves — Stockfish is indifferent, the engine is giving away the bishop pair for a doubled pawn and no plan). None of the three games ever generates kingside or central compensation for the pair; all three later bleed 40–220 cp per move in the middlegame (game 13: 15.Rad1?/19.Qc3?/33.Rde1?/35.Rb1?; game 17: 9.Rxf4?/19.a5?/21.Rff1?/26.Rg6+?/28.Rxd6? each 40–220 cp) until the position is simply lost, well before any endgame. This is the exact 0/6-across-two-runs pattern both prior reports flagged (`579a92f` §2.4, `966bbcc` §2.4) — depth 24 does not fix a bad book move, because Stockfish's reply is not a tactic to calculate around, it is a structural fact (bishop pair, no compensation) the eval undervalues at move 1 and every move after.
- **Game 24 (B, Scotch, loss)**: 1...Qh4 (grabbing tempo) → 3...Qxe4 → **5...Kd8** (still never castling in this Black repertoire line, exactly as flagged in `579a92f` §2.2 for the same opening). The king sits on d8/c8/b8 all game; the position drifts to roughly −1.5/−2 for Black (i.e. Black doing fine materially) until **35...a6?? (−849, best Rb8)** — the single worst blunder of the whole run. Critically, the engine's *own* evaluation at that point was **−2.16 (thinking Black was better)** while Stockfish had **+14.63 (White winning)** — not a missed tactic so much as a sign-flipped read of the position (`k3r3/p1p1q3/2P2pb1/3R1p1p/1p3Q1P/5BP1/P4P2/6K1 b`): the king on a8, the c6-pawn, and White's queen+bishop+rook aimed at the back rank/queenside make a6 catastrophic (weakens b6, invites Rxa6/Ra5 ideas), and the engine had no term to notice the danger to its own unmoved king.

### 2.4 King safety after castling: luft and pawn storms still invisible

- **Game 8 (B, Italian, loss)**: **12...Bg6? (−113, best h6)**, **15...Bb6? (−86, best Kh8)**, **16...Kh8?? (−113, best Kh7)** — three chances to take luft or step off the long diagonal are declined in a row while White quietly builds Ng3–Nh2–Nf5–N1e3 and a exf6/Nxg7 combination; by move 22 SF already has +6.
- **Game 12 (B, Italian, loss)**: **15...Kh7?? (−162, best d5)** declines the central break and instead walks the king toward the coming storm; White's **16.g4 17.f4 18.g5** rolls through unopposed (SF 1.9 → 2.9 → 5.0 within eight moves) and the g/h-files are used to mate the king forty moves later.
- **Game 18 (B, Ruy Lopez, loss)**: **14...g5?? (−110, best Kh8)** is a self-inflicted weakening of the same kind — the pawn shield term only counts static pawns in front of the king; it does not penalise the king's own pawn moving away from it, nor reward the prophylactic king step that keeps the shield intact.

### 2.5 Material grabs that ignore king safety and coordination

- **Game 23 (W, Scotch, loss)**: **12.Bxa7?? (−193, best Ne2)** grabs a rook-pawn with the bishop while Black's rook, knight and g-pawn are already aimed at the kingside; the bishop then spends six more moves (13.Ba6+, 15.Bb7, 19.Bxb6, 20.Bxa8) hunting queenside pawns while the position slides from equal to −3, −5, −9. The eval sees "+1 pawn, then +1 exchange" and never the mounting attack.
- **Game 11 (W, Italian, loss)**: **16.Qxc7 18.Qxd5+** (two queen pawn-grabs) leave the queen and king uncoordinated against Black's developing pieces; the position goes from equal to −2 (22.Qc2?? −191) to −8 within ten moves, and **47.Rb1?? (−286, best Ra1)** then drops a rook to a slow-motion back-rank mate (…Rh1# eight moves later) — material was gone already, but the rook still went to the wrong corner of an undefended back rank.

## 3. Tactical oversights (search, not evaluation)

Far fewer than either earlier run, and concentrated in positions where the king had already been strategically compromised (2.4/2.5) rather than arising from nowhere:

- **Game 15**: 20.b3? 21.Kd4?? walks the king into the centre chasing material; **21...Ne3!** forks the queen and rook two moves later (22.Qf3 Nxc2+ 23... wait: 23.Ne4 Nxc2+ 24.Kd3 **Nxa1!**), winning a full rook. The search did not see the fork coming from three plies out once the king had already committed to d4.
- **Game 18**: **35...Nxd3?? (−222, best Qf8)** grabs a pawn straight into a tactical refutation, the classic "quiet move two plies later" shape from both earlier reports, still occurring occasionally at depth ~23.
- **Game 23**: **36.a8=Q?? (−223, best Rg1)** — the engine promotes a pawn without noticing that its own king on g1 has no defender against …Bg2#, which follows seven moves later; a one-tempo king-safety check before committing to "best" material-grabbing moves.
- **Game 24**: **35...a6?? (−849)** is as much a tactical miss (a concrete winning combination for White was on the board) as the evaluation-sign failure described in 2.3.

## 4. Game-by-game summary (losses only; no draw ever reached SF ≥ +1.5 for the engine, so none qualify as a slipped win)

| Game | Side/Elo | Where it went wrong | Type |
|---|---|---|---|
| 2 | B 3090 | slow 100-ply bleed (no single early blunder) as White's queenside pawns (a4–c5–b6) and kingside storm (g4–g5–h4) accumulate small edges; technique errors in a hopeless endgame at the end | strategic (structure/activity), not decisive |
| 5 | W 3190 | long positional drift (queen trade, many small mg/eg losses); decisive **78.a4?? (best Qb1+)** misses a defensive resource against Black's connected g/h passers | tactical (missed defence) in a drifted-worse position |
| 8 | B 3090 | **12...Bg6?/15...Bb6?/16...Kh8??** decline luft three times running into a knight/exf6/Nxg7 combination | strategic (king safety, luft) |
| 10 | B 3190 | **15...Kh7??** (as in 12) into a kingside storm; totally lost by move 40; late endgame technique errors don't change the result | strategic (king safety) |
| 11 | W 3190 | **16.Qxc7/18.Qxd5+** queen pawn-grabs without coordination; **47.Rb1?? (best Ra1)** drops a rook to a slow back-rank mate | strategic (material vs safety) + tactical (back rank) |
| 12 | B 3190 | **15...Kh7?? (best d5)** declines the centre break; White's g4–f4–g5–h4–h5–h6–h7 storm is never met; bishop-ending technique errors afterward in an already-lost game | strategic (king safety) |
| 13 | W 3090 | **1.Bxc6** Exchange Ruy, no compensation; rooks shuffle passively (15.Rad1?/33.Rde1?/35.Rb1?) while Black's attack builds | strategic (opening choice, rook activity) |
| 14 | B 3090 | **14...Be6?? (best h5)** allows a kingside pawn-storm/wedge (Nf5, gxf5, f6); bishop-ending technique fails to blockade e/f passers (**47...Bc7??, 50...Bb6??, 57...Bf4?**) | strategic (king safety) + endgame technique (promotion square) |
| 15 | W 3190 | 20.b3?/21.Kd4?? walks the king out; **21...Ne3!** fork wins a rook; later king-race technique errors (62–66) in an already-lost game | tactical (fork) + endgame technique |
| 17 | W 3190 | **1.Bxc6** Exchange Ruy; **9.Rxf4? (best Bxf4)** then a long chain of passive/mistimed rook moves (19.a5?/21.Rff1?/26.Rg6+?/28.Rxd6?) sliding equal → −9 | strategic (opening choice, rook activity) |
| 18 | B 3190 | **14...g5?? (best Kh8)** self-weakens the king; **35...Nxd3?? (best Qf8)** a quiet-refutation tactical blunder into a lost Q+R vs Q+B ending | strategic (king safety) + tactical |
| 23 | W 3190 | **12.Bxa7?? (best Ne2)** grabs a pawn while ignoring Black's building attack; **36.a8=Q?? (best Rg1)** promotes into a back-rank mate | strategic (material vs safety) + tactical (back rank) |
| 24 | B 3190 | Scotch **1...Qh4/…5...Kd8** (never castles); **35...a6?? (−849, own eval −2.16 vs SF +14.63)** — sign-flipped read of a queenside mating/material combination | strategic (opening choice, king safety) + tactical + evaluation blind spot |
| 27 | W 3190 | 242-ply bishop ending; king/bishop repeatedly sent the wrong way (**70, 73, 74, 75, 79, 82, 95, 96, 97, 98**) instead of blockading the a/c/g passed pawns | endgame technique (king race, promotion square) |

## 5. Prioritised, engine-implementable suggestions (max 7)

1. **Endgame king rule: distance to the most advanced passed pawn (own or enemy), not centralisation.** When queens are off, replace/augment `KING_EG_PST`'s flat centralisation bonus with roughly −6 cp per king-step of distance to the nearer of (a) the enemy's most advanced passed pawn, when the king must stop it, or (b) the own most advanced passed pawn, when the king should escort it. Evidence: game 27 (moves 70/73/74/75/79/82/95/96/97/98, ~40 moves of the king drifting between flanks while a/c and g pawns run), game 15 (63.Ke4??/64.Kf5??/66.Kf7?? — the king centralises instead of joining the race). This is the single largest unaddressed item carried over from both prior reports (their #7) and now the top cause of loss.

2. **Promotion-square / blockade term for the lone minor piece in an endgame against a passed pawn.** Score a bishop/knight higher when it sits on a square that controls the enemy's promotion square(s) or the pawn's stopping square, and penalise a minor piece that has moved for several plies without ever doing so while behind on the pawn race. Evidence: game 14 (47...Bc7??/50...Bb6??/57...Bf4? — the bishop never controls e8/f8 or a queening-relevant diagonal), game 27 (the bishop tours c1–a3–d4–b4–d4–g1 without ever covering a1/c1).

3. **Retire or replace the 4.Bxc6 Exchange Ruy Lopez White book line.** It has now gone 0/6 across two runs and three depths (13, 15, 17 here; three more at 0.25 s) with the same signature — bishop pair given away, no compensation, a slow bleed to −5…−9 by move 20–30. This is not fixable by search depth; it needs a book change (or, failing that, a bishop-pair term large enough — see #6 — to stop the book move from being selected at all).

4. **Kingside luft / self-weakening penalty independent of material.** Penalise (a) declining a luft move (…h6/…Kh8 available and not taken) when the opponent has ≥2 pawns past their 3rd/4th rank aimed at the king's file or the two adjacent files, and (b) a king-side pawn push (…g5, …g4) that opens a file or diagonal toward the own king while the opponent still has a queen or rook on that side. Evidence: game 8 (12...Bg6?/15...Bb6?/16...Kh8?? all decline luft), game 12 (15...Kh7?? declines d5 and the luft it buys), game 18 (14...g5?? self-inflicted).

5. **Back-rank / king-safety check before committing to a promotion or a big material grab.** Before playing a move that wins material or promotes, check whether the resulting position leaves the own king on the back rank with ≤1 escape square and an enemy rook/bishop/queen already aimed at that rank or diagonal; if so, prefer a defensive alternative (Rg1/Kh1-type luft) first. Evidence: game 23 (36.a8=Q?? best Rg1, mated on g1/h1 seven moves later), game 11 (47.Rb1?? best Ra1, back-rank mate eight moves later).

6. **Raise the bishop-pair and minor-piece values enough that giving up the pair for a structural gain is priced correctly.** Both prior reports asked for this (N=340/B=355, pair +30 mg/+45 eg) and it is still evidently absent — 1.Bxc6 is chosen with no compensation in three more games this run. Evidence: 13, 15, 17 (this run); 13/15/17 at 0.25 s (both prior reports).

7. **A material-grab / king-safety trade-off term:** while ahead in material by a pawn or exchange but behind in king safety (own king not castled, or fewer defenders in the king zone than the opponent has attackers), discount the value of a further pawn grab by ~30% until development/safety is restored. Evidence: game 23 (12.Bxa7?? then a long slide while the bishop hunts pawns instead of defending), game 11 (16.Qxc7/18.Qxd5+ two grabs in a row before the attack arrives), game 24 (Scotch Qxe4 grab with the king still on d8 for the whole game).
