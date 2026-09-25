# Grandmaster review: run `dd6c58b` (king safety in eval)

Score 23/4/3 against Stockfish 1500–1700 (Elo est. 1892, wins@1600 = 8). The baseline `63ccb08` scored 25/1/4 (1915, wins@1600 = 9). Move numbers follow the annotated PGNs, which start from the book position. `[%eval]` is from White's side. "(−N)" is Stockfish's cp loss for our move.

Note: the experiment was committed as `[discard]` and reverted (a1004d8/9a9aeef), so the run and analysis files are no longer in the working tree. I read them from `git show a1004d8:analysis/dd6c58b/...`. There is no `analysis/ad95e70/grandmaster.md` in the repo. The only earlier review is `63ccb08`, so that is the comparison used here.

**In one sentence:** the change fixed *when* the engine castles, but not *what it does after castling*. It now castles nearly every game, yet it still sends its queen and knights off to grab queenside pawns. Its two losses from winning positions (G3, G5) and its opening loss (G7) were all piece attacks on a **castled** king with an intact-looking shelter, and a term that only counts pawns cannot see that kind of attack.

---

## Were the `63ccb08` king-safety failures fixed?

| failure found last time | `63ccb08` | `dd6c58b` | verdict |
|---|---|---|---|
| Castling rate | 14/30 games, often late (move 10–18) | **26/30**, typically moves 2–9 | **Fixed** |
| Loss to a king stuck on e1/e8 (old G13, G23, G24) | 3 losses | 0 losses | **Fixed** |
| Castling rights thrown away by rook/king moves | 12...Rg8, 14...Kf8 (old G24) | G4 9...Rb8 + 23...Rg8, G18 6...Rb8 + 15...Rg8, G9 8.Bxh6 (−189, best O-O) | **Not fixed.** All 4 uncastled games came from this, and two of them were draws (G4, G18) |
| Middlegame king march with queens on (old G16 Kg8→Kb7) | frequent | G4 31...Ke7, 39...Kd8, 50...Kd7; G18 19...Kd8, 22...Kc7, 29...Kd7, 34...Ke7; G9 Kd3/Kb3 | **Partly fixed.** It is now limited to games where castling was forfeited |
| Endgame king use | good | good, endgame ACPL 81.7 → **40.7** | Improved (tapered king table) |
| Pieces leave the king to hunt pawns (old G7) | yes | G3, G5, G17, G23 (below) | **Not fixed.** This is now the main cause of losses |

Costs: middlegame ACPL went from 58 to **77**, middlegame blunders from 48 to **69**, and opening blunders from 5 to 11. NPS fell from 5.43M to 4.15M (−24%) and average depth from 6.1 to 5.9. G7 was searched at **depth 4** during its opening moves.

---

## The losses

### Game 3 (White vs 1600, 0-1): +4.9, then the queen went pawn-hunting in front of our own king
- 6.O-O-O and 10.Kb1 were fine. Black's king was stuck on f8, and after 18...Ra8? we were **+4.9**.
- **Strategic:** 15.a4 advanced a shield pawn of our b1-king in order to win material. Then 17.Qxb6 and **19.Qxd6+ (−455, best Bb7)** grabbed pawns and left Ba6 short of defenders. **20.Bb5 (−331)** Nxb5 axb5 then opened the a-file straight at b1. Black's Qa5xb5, ...Ra5/...Rea8 and ...Ra1+ mated along that file.
- **Tactical:** 23.Qd6 (−417), 24.Rhd1 (−608), 26.b4 (−981). The engine was still scoring +3.4/+3.7 at 18.Bxa6/19.Qxd6+. The shelter term gave only a small penalty for the a-pawn going to a4 and the a-file opening, far less than the pawns it won.

### Game 5 (White vs 1700, 0-1): +5.5 up the exchange, mated on the castled king
- 10.Qa6 (−86), 11.Qxc6 and 12.Qxd5 were three early queen captures, the same habit as old G23. It worked out, and by move 26 we were **+5.5**.
- **Strategic:** 27.a3 (−230), 28.Bc1 (−160), 32.Ra3 (−183) and **33.Nxa7 (−209)** sent every piece to the queenside. Meanwhile Black's queen, light-squared bishop and knight settled around g1 (...Nf5-h4, ...Qc4).
- **Tactical:** 35...Nxg2 36.Kxg2 Qd5+ **37.Kg1 (−1356, best f3)** and **38.Bxc7 (−1449, best c4)** allowed ...Bh3 followed by mate on f1/g2. Our own eval *rose* from +4.75 to **+8.36** (depth 6) while Stockfish saw mate. The only king-safety input was the missing g-pawn, worth about 40 cp before phase scaling. No term counts attackers next to the king.

### Game 7 (White vs 1500, 0-1): opening mate on f2/h2
- 2.Ng5 (also in G9) is an early knight raid. 4.O-O, then **6.Re1 (−192, best Qh5)** took the rook off f1, leaving f2 guarded only by the king while ...Ng4 was coming.
- **7.Nxf7+ (−602)** Rxf7 Bxf7 Qh4 hit f2 and h2 at once. 10.fxe3 (−351) Qxh2+ and mate. This was a tactical miss at depth 4–6, but the missing idea is a strategic one: an enemy queen and knight aimed at the squares next to our king. The king had castled and its pawns were untouched, so the shelter term scored it as perfectly safe.

## The draws (none of them would count as a win anyway)

- **G18 (Black vs 1700, stalemate): the one real slipped win.** The opening went badly: 8...Rxb2 (−186), 10...Qe7 (−323), 11...h6 (−417), plus 6...Rb8 and 15...Rg8, so we could not castle on either side. The king walked 19...Kd8, 22...Kc7, 29...Kd7, 34...Ke7 with queens on. Stockfish then blundered and we reached R+B+pawns vs Q at **−5.8** (winning for us) by move 48.
  - The **tapered king table** then did damage. With only W queen + B rook + B bishop left, phase = 7/24, so the king was scored about 70% by the *endgame* table even though the opponent still had a queen. Our king marched 36...Kf6, 39...Kg6, 40...Kh5, 42...Kxh4, 44...Kg4, 45...Kf4, 46...Ke4, 47...Kd4, **48...Kxd5 (−316, best Kc5)**, straight into queen checks.
  - Then **50...c3+ (−376, best a5)** and **53...c2+ (−257, best Kb4)**: these pawn checks took White's king's last free squares, which set up the desperado. Stockfish's eval was already 0.00 after c2+. Our engine saw the stalemate only at 55...Kb4 (ply 110, score 0). Before that it still rated c2+ at +3.34. The game ended 59.Qa2+ Kxa2 stalemate.
- **G4 (Black vs 1600):** a lucky save. We were lost from 10...Nb4 (−314) after an early 7...Qd6 (−115). The king stayed in the centre (9...Rb8, 23...Rg8, then ...f5/...g6/...h5 all pushed in front of an e8 king), 31...Ke7, 39...Kd8. White was up to +8.7. Stockfish failed to convert, and the game ended by threefold repetition in a ending where we were still worse.
- **G8 (Black vs 1500):** a lucky save. **17...gxf5 (−818, best Qxd5)** broke our own castled shelter with Ng5 and Qd3 already aimed at it, and 18...hxg5 (−212) followed. We were −10 to −15. The shelter term does charge for gxf5, but depth 7 still chose it.
- **G24 (Black vs 1700):** a lucky save. The queen made the opening: 4...Qc7, 5...Qe5, 6...Nxe4 (−97), 10...Qe4, then **11...a6 (−322)** lost the exchange. We were at +7 for White and survived a 245-ply defence.

Three of the four draws were saves from lost positions. Some of them would have been losses under the baseline, which is part of why the loss count fell from 4 to 3. That does nothing for the win count.

---

## Strategic vs tactical

| game | strategic error | tactical error |
|---|---|---|
| 3 | a4 in front of Kb1; queen hunting pawns (Qxb6, Qxd6+); opened a-file on own king | 19.Qxd6+, 20.Bb5, 24.Rhd1, 26.b4 |
| 5 | early queen raid; every piece to the queenside (Nxa7, Ra3) while Q+B+N gathered on g1 | 37.Kg1, 38.Bxc7 (mate missed, eval +8.4) |
| 7 | 2.Ng5 raid; 6.Re1 left f2 to the king alone | 7.Nxf7+ (Qh4 double attack), depth 4–6 |
| 18 | castling forfeited by rook moves; endgame king table used while the enemy queen was on; king grabbed pawns under queen checks | 48...Kxd5, 50...c3+, 53...c2+ (stalemate net) |
| 4, 24 | early queen, castling forfeited | 10...Nb4, 11...a6 |
| 8 | broke own shelter with gxf5 | 17...gxf5, 18...hxg5 |

## New problems from this change

1. **The shelter score makes a castled king look safe when it is not.** Every loss was to a castled king with most of its pawns in place (G3 Kb1, G5 Kg1, G7 Kg1). The term is pawn-only. It adds points for castling and then ignores the enemy queen, bishop and knight arriving next to the king. Pawn-grabbing with the queen and knights away from the king (G3, G5, G17 17.bxa6/19.Qa5 (−263), G23 17.Nxc7 (−343)/19.Nxa8) is as common as before.
2. **Phase is based on total material, not on the opponent's attacking material.** In Q vs R+B (G18) the king is scored as if in an endgame and walks into queen checks.
3. **Some passive defending, but little proof that the new term caused it.** G11 21.Rf1 (−275, best b6), 22.Bh2 (−228) and 29.Rdd1 (−433, best c3), and G23 22.Bf1 (−943, which allowed a Qg4+/Qf3+ perpetual). The new term scores only pawns, so these piece retreats are more likely search noise than shield obsession. The one pawn-shield case is G5 37.Kg1 instead of the shield push 37.f3.
4. **The eval is slower.** NPS dropped 24% and depth dropped by 0.2. Middlegame blunders rose from 48 to 69.
5. **The early queen and castling forfeited by rook moves** are still unaddressed (G3, G4, G5, G23, G24; G4, G18).

---

## Prioritised suggestions (engine-implementable)

1. **Attacker-based king danger on top of the shelter term.** For each side, count the enemy pieces that attack the king zone (king square + 8 neighbours + 3 squares in front). Use weights of about N=2, B=2, R=3, Q=5, apply a nonlinear table (e.g. `units² / 4`, capped around 500 cp), and apply it only if the enemy queen is on. Add a small penalty when f2/f7 (or the square next to the king) is defended only by the king.
   *Evidence:* G5 38.Bxc7 scored +8.36 with Q+B+N around g1 (mate); G7 6.Re1/7.Nxf7+ against Ng4+Qh4 on f2/h2; G23 22.Bf1 (−943); G3 rooks+queen on the a-file vs Kb1.
2. **Taper king safety and the king table by the *opponent's* non-pawn material, with the enemy queen dominant.** Keep the middlegame king table and the safety term at full weight while the opponent has a queen, instead of using total phase.
   *Evidence:* G18 36...Kf6 → 48...Kxd5 (−316) → 49...Kc5 walking into queen checks at phase 7/24; G4 31...Ke7/39...Kd8.
3. **Development / early-queen term (opening only).** Penalise each undeveloped minor piece (about −15) and a queen off its home square while two or more of our minors are still at home. Penalise queen captures of rim pawns in the opening by making the queen PST on a/h-files and on the opponent's 3rd rank negative.
   *Evidence:* G5 10.Qa6/11.Qxc6/12.Qxd5; G23 8.Qa4-9.Qxc6+-10.Qd5-11.Qxa5-12.Qa3-13.Qb3; G24 4...Qc7/5...Qe5/10...Qe4/11...a6 (−322); G4 7...Qd6 (−115); G3 17.Qxb6/19.Qxd6+ (−455).
4. **Penalty for losing castling rights without castling** (about −30 per side lost while the king is uncastled and the enemy queen is on). Right now the penalty only applies once both are gone *and* the king is on c–f, which is too late.
   *Evidence:* G18 6...Rb8 + 15...Rg8, G4 9...Rb8 + 23...Rg8, G9 8.Bxh6 (−189, best O-O). These are all four of our uncastled games, and two of them were draws.
5. **Defender bonus / "don't leave the king" term.** Give a small bonus (about +8) for each own minor piece within 2–3 squares of our king while the enemy queen is on, and scale down the knight PST on the a/h-files when enemy pieces attack our king zone (this works with suggestion 1).
   *Evidence:* G5 33.Nxa7 (−209) and 32.Ra3; G23 17.Nxc7 (−343)/19.Nxa8; G17 19.Qa5 (−263); G3 18.Bxa6.
6. **Stalemate and perpetual awareness when ahead.** (a) Add check extensions (or checks in the first quiescence ply) so that spite-check sequences are searched to the end. (b) In eval, when we are ahead by at least 300 and the opponent has only a queen and pawns (or less), penalise positions where the opponent king has zero safe squares and no pawn move. This stops pawn checks that build a stalemate cage.
   *Evidence:* G18 50...c3+ (−376) and 53...c2+ (−257), with stalemate seen only at ply 110; G23 22.Bf1 (−943) allowing the Qg4+/Qf3+ perpetual.
7. **Make `king_danger` cheap.** Precompute file masks and shelter masks per king square, and cache the pawn part per pawn structure. The −24% NPS cost may take away the ply that would have found G7's ...Qh4 (searched at depth 4) and G5's ...Bh3.
