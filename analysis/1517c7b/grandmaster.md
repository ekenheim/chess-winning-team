# Grandmaster review of `1517c7b` (king danger v3) — 9/6/15 vs SF19 @2300/2400/2500, 0.25 s/move

Games read in full: losses 5, 7, 11, 12, 13, 15, 22, 24, 28, 29; draws 17, 27. Term as committed: units per attacked
king-zone square (N2 B2 R3 Q5), storm pawns 2/2/1/1 on four ranks, open/half-open king files 2/1 doubled with an
enemy rook or queen on them, score `3·units²` capped at 700, plus 15 per missing shield pawn; active only while the
opponent has a queen; no defenders counted, no attacker-count gate.

Note on the comparison: c9cb33a (21/3/6) was played at target 2200 (2100–2300), this run at target 2400 (2300–2500),
so part of the score drop is opposition. The per-move numbers are not: opening ACPL 46 vs 26, opening blunders
15 vs 2, depth essentially unchanged (9.1 vs 9.5 in the opening). The term, not the clock, changed the moves.

## 1. What the term did to the engine's play

It did **not** make the engine defensive. It made it a coffee-house attacker: the engine now sacrifices pieces to
strip the enemy king and dive in with the queen, and it believes it is winning while doing so. The same three
patterns account for 12 of the 15 losses and both slipped draws.

**(a) Speculative sacrifices on f7/f2/e5/h6/g7 for "exposure"** — the dominant failure.

| game | ply / move | cp lost | what happened |
|---|---|---|---|
| 7, 11 | 1. Bxf7+?? | −393 | Italian start position, first move out of book. Bxf7+ Kxf7 Nxe5+ gives bishop for pawn to drag the king to f7. In 11 SF (2500!) mis-defended and the engine reached +7, then threw it away (see (c)). In 7 it was −4.6 by move 3 and never recovered. |
| 13, 15 | 7. Nfxe5? | −194 / −138 | Ruy Lopez exchange: knight for pawn + open f-file. Both lost. |
| 24 | 11...Nxf2? | −444 | Engine was +2.3 (up the exchange). Gave the knight back for a pawn to pull the king to f2 and open e/f/g. Engine's own eval afterwards: +2.8; Stockfish: −0.35. |
| 28 | 5...Nxf2?? | −347 | Petroff, after 3...g5?! 4...g4? (a pawn storm with the engine's own king still on e8). Knight for pawn to expose Kg1. |
| 27 (draw) | 16. Bxh6?? | −452 | +0.2 quiet position → −4.3. Bishop for pawn, Qxh6 next to Kg8. Nothing follows; engine then also played 18. Rxe6? (−208), a second exchange sac for the same attack. |
| 15 | 25. Bxg7?? | −301 | Bishop for pawn against a king on e8 that could simply take. |
| 29 | 9. Qg3?? | −535 | Left Bf5 hanging (9...Bxf5) because Qg3 keeps the threat Qxg7; engine then "won" g7 and f6 with the queen deep in the zone and was −6 with a piece down. |
| 5 | 12. Qxg7?? | −318 | Same: queen dives to g7 (zone squares f8/f7/h8/e7) instead of exd4; −4.1. |
| 22 | 7...Qe4?? / 9...Be7?? | −393 / −238 | Queen to e4 to hit e2 on the open e-file — into 8. O-O-O + Rhe1 skewering the engine's own king on e8. |

Why: a queen adjacent to the king typically attacks 3 zone squares = 15 units → 3·225 = 675, and with two open/half-open
files and two missing shield pawns it saturates the 700 cap. That is more than two minor pieces. Every Bxf7+/Nxf2/Bxh6
that gets the queen next to the king therefore scores as "+300 to +400 net" at the horizon, and 0.25 s (depth 8–10) is
not enough for the search to see that the attack evaporates after one defensive move (…Qe7, …Be6, …Kf8).

**(b) Refusing to consolidate / hanging material to keep "units" on the board.** Game 24, 18...Qe7?? (−604): the
bishop on a2 is attacked; d5 saves it. The engine kept the Q+R battery on the open e-file against Kf2 (queen hits e2 =
5 units, open e-file with a heavy piece = 4 units) and let the bishop go. Game 11, 18. c4? (−394) and 19. Be7?? (−263):
from +5.3 the engine pushed and sacrificed to keep pieces pointed at the king instead of 18. Nd2/19. Bf4 completing
development; it was lost five moves later. Game 13: rooks doubled on f7/f6 (21. Rf7?, 22. R1f6) against a king on c8,
while Black's h-pawn walked to h3 and the queen came to the engine's own h1 corner.

**(c) Pointless king shuffles to reduce the engine's own danger score.** Because the term is symmetric, when the enemy
queen is anywhere near, the engine spends tempi on Kh1/Kg1: game 11 7. Kh1? (−143) and 9. Qc4?? where Kg1 was best;
game 13 13. Kh1? (−63), 34. Qb4+? (best Kg1), 36. Kh1; game 15 14. Kh1? (−179, 14. Qxc7 wins a pawn); game 29 22. Kh1,
29. Kg1? (−200). 50–200 cp each, and they are the second-largest source of cp loss after the sacrifices.

**(d) The slipped draws.** Game 27 is (a). Game 17 (+3.9 at move 17): 19. g3? and 20. Kh1? weakened the engine's own
king to chase Nf4, 21. Nc4? (−225, Qc2 was needed) walked into ...a4/…h4, and at move 30 the engine, still slightly
better, went 30. Qxb8 straight into the Q+N perpetual on d1/f3. Consistent with the engine overrating Qh5+Nh3+Bg4 near
its own Kh1 and taking the draw; not provable from the PGN alone.

What I did **not** see: over-defensive pieces parked in front of the king, refusing to attack, or giving up material
to keep files closed. The bias is entirely the other way.

## 2. Which parts of the term drove it

1. **Queen weight 5 per zone square + `3·units²`.** This is the whole story. One queen on three zone squares already
   reaches the cap by itself; the v1 "two attackers" gate that prevented exactly this was removed. Knights/bishops (2)
   are fine on their own; the quadratic makes them lethal only in combination with the queen.
2. **No defenders.** Zone squares covered by the defender's own queen, bishop or king count fully. Qh6 next to Kg8 with
   ...Qd8/…Bf6 covering everything scores 700; in chess it is worth roughly zero.
3. **Open-file units doubled by a heavy piece.** Adds 4 per file for a rook or queen merely standing on the file; after
   a pawn capture on f7/f2 the e/f/g files typically add 6–8 units on top, which is what tips the sacrifices. It also
   rewards the queen-on-file moves (Qe4 in game 22, Qe7 in game 24).
4. **Storm pawns** were minor. The 4th-rank storm pawn (1 unit) only showed up in game 28 (...g5-g4 vs Kg1) and even
   there the sac 5...Nxf2 did the damage. Storm is not the cause and can stay, restricted to three ranks.
5. **Shield missing 15 × 3 for a king on ranks 1–2** is the right order of magnitude; it is what causes the Kh1
   shuffles only in combination with the inflated attack score.

## 3. What a correctly sized version looks like, in chess terms

- Castled king, intact shield, one enemy piece eyeing it (Ng5 or Bd3 looking at h7): **0–20 cp**. Noise.
- Qh5 + Ng5 "Scholar" battery against f7/h7 with the shield intact and ...Qe7/…Be6 available: **~50 cp**. Today: ~590.
- Rook on a fully open g-file against Kg8 with the queen nearby (g-pawn gone, opponent's queen off defence): **~150–200 cp**.
  Today: 700.
- Three pieces attacking, two shield pawns gone, king cannot run (a real Greek-gift position): **300–400 cp** and let the
  search find the mate. Today: 700 + 45 — and the same 700 is awarded to positions where nothing works.
- Cap at ~400; a term that can outscore a rook should never exist in a 0.25 s engine, because the search cannot verify it.
- A bishop sacrifice should only be "eval-profitable" when the resulting danger is ≥ 350: that must require queen + at
  least one other attacker on undefended zone squares AND an open file/shredded shield, not the queen alone.

With the current unit counts that means roughly `units²/2` (15 → 112, 20 → 200, 28 → 392), i.e. six times smaller than
`3·units²`, and only after defended zone squares have been removed from the count.

## 4. The opening losses (games 7, 11, 12, 13, 22, 28; also draw 10)

All decided within 10 moves of leaving the book, and none of them is an opening-knowledge problem: the engine's first
own move is a sacrifice or a queen sortie whose only justification is the king-danger score. Bxf7+ twice (Italian),
Nfxe5 twice (Ruy Lopez exchange), Nxf2 twice (Scotch/Petroff), Qe4?? (Scotch), 3...g5/4...g4 with an uncastled king
(Petroff). Game 12 is the exception: 5...d6?? (−311, a5 needed) and 6...Bb6?? (−289) simply let b4/a5 trap the bishop;
the engine then answered with 7...Bxf2+ — a losing "desperado" that the term makes look acceptable because Kxf2 exposes
the king. Opening ACPL 23–26 in the earlier runs versus 46 here, with the same depth, is the cleanest signature that the
term is mis-sized: in the opening every king is on e1/e8 with files closed, so a term that fires there is firing on
nothing.

## 5. Suggestions for the retry (max 4)

1. **Rescale and cap**: `units²/2` (or `3·units²/6`) with `DANGER_MAX = 400`. Keep the piece weights; cut the queen to
   4 if the quadratic still lets it saturate alone.
2. **Count only undefended zone squares** (squares in the zone not attacked by the defender's non-king pieces), and
   restore an attacker gate: queen units count only if at least one other enemy piece also attacks the zone. This removes
   Bxf7+/Bxh6/Qxg7 at the source.
3. **Open-file units only for a fully open file (no own pawn) with an enemy rook/queen actually on it** (2 per file, no
   separate half-open bonus); limit storm pawns to three ranks. This stops the queen-on-the-e-file moves (games 22, 24).
4. **Re-bench against the same opposition as c9cb33a (target 2200)** so the result is comparable, and check two numbers
   before the full run: opening ACPL should be back near 25 and the count of engine sacrifices in the first 10 moves
   should be zero.
