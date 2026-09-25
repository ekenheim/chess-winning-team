# Engine-developer review of `63ccb08`

Run: 30 games vs Stockfish 19 (UCI_Elo 1500/1600/1700), 0.25 s/move. W/D/L 25/1/4, Elo 1915 ±176.
Sources: `engine/src/{search,eval,main}.rs`, `games/runs/63ccb08/moves.jsonl` (1285 engine moves),
`analysis/63ccb08/analysis.json` and the annotated PGNs. I also re-ran four of the losing positions through
the current binary at `go movetime 5000` (the real rule) to see which mistakes more depth fixes and which it doesn't.

## 1. What the engine is

- Negamax alpha-beta with iterative deepening, a full window every iteration, and no aspiration windows.
- Move ordering is MVV-LVA for captures, then promotions, then quiet moves in generator order. The previous iteration's best move is not searched first, even at the root.
- No TT, PVS, null move, LMR, killers, history, check extension or SEE. The PV is only the root move (every `pv` in moves.jsonl has length 1).
- Quiescence searches captures and queen promotions only. It **stands pat even when in check**, so it misses mates and never looks at evasions.
- Eval is material plus Michniewski PST. The switch between middlegame and endgame king tables is a binary "endgame" test with no taper. There is no king safety, no castling bonus, no pawn structure and no passed pawns.
- Time: hard stop at `t − max(15ms, t/20)` (0.2375 s here). A new iteration may start only while elapsed < 40 % of budget. An aborted iteration is **thrown away completely**.
- A new `Searcher` is created for every `go`, so nothing carries over between moves.

## 2. Evidence

### 2.1 Depth gap and branching factor
| | engine | Stockfish (limited) |
|---|---|---|
| avg / median depth | 6.1 / 6 | 24 / 12 |
| nodes per move (median) | 862k | ~90k |
| nps | 5.4–9.4 M | ~0.36 M |

We search about 10× more nodes per move than Stockfish and reach half its nominal depth. That points at the tree shape (ordering and pruning), not at raw speed. Depth distribution: d5 299, d6 547, d7 277, d8 85. Only 14 % of moves reach depth 8.

Effective branching factor from the 5 s re-runs (nodes per completed iteration):

| position | d5 | d6 | d7 | d8 |
|---|---|---|---|---|
| g13 ply 7 | 146k | 846k | 8.3M | (aborted) |
| g24 ply 31 | 136k | 565k | 6.4M | 32.4M |
| g1 ply 31 | 193k | 1.07M | 6.7M | 32.8M |

The EBF is **5–10 per ply**. A reasonably ordered alpha-beta with TT and killers runs at about 3–4, and with NMP and LMR at about 2. Each depth-7 iteration alone costs as much as the whole 0.25 s budget. The odd/even jumps (×10 going to odd depths) are what you get from poor quiet-move ordering with no hash move.

Depth by phase is flat: opening 5.6, middlegame 6.1, endgame 6.7. Endgames with half the material should be searching 3–5 plies deeper, and here they gain only about 1.

### 2.2 Tactics missed at the depth reached (horizon)
I counted 61 real engine errors: cp_loss ≥ 200, the position after the move < +4 for us, and the move differs from Stockfish's best. Nearly all of them were played with the engine's own score between +150 and +500 while Stockfish rated the result ≤ 0. For all engine moves with an unclamped Stockfish eval, the engine's score minus Stockfish's is:

| phase | n | mean (engine − SF) | mean abs | cases > 300 cp |
|---|---|---|---|---|
| opening | 300 | +45 | 87 | 15 |
| middlegame | 573 | **+214** | 293 | 178 |
| endgame | 293 | **+300** | 374 | 124 |

The engine is **systematically optimistic**. Its PV stops just before the refutation, which is the classic horizon effect. Blunders at depth ≤ 6: 52 of 85.

Re-running the losing moves at 5 s:
- **g13 ply 7 `exd5??` (−602, all 4 losses were decided like this):** at d5 and d6 the engine likes exd5 (+140). At **d7 (1.1 s) it switches to O-O**. The refutation is ...Qe4+ with check and fork, which is exactly what a check extension or check evasions in qsearch would catch at depth 6.
- **g24 ply 31 `Bd6??` (−1154):** d6 says Bd6 +150. **d7 finds Ne4 and −155**, so the engine was already lost and could not see it. Earlier in that game (plies 21–29) it grabbed h2 with the queen and played Kf8, losing castling rights. Scores stayed around +200 while Stockfish went from +58 to −764.
- **g7 ply 53 `Nxg5` (−672):** still chosen at **d8 with +440**. More depth alone does not fix it. The engine is a piece up on paper while its king on h1 faces ...Qg7/Rg8 down the g-file. That is an **eval** failure (no king safety).
- **g1 ply 31 `Ke2` (−294, best O-O-O):** still chosen at **d8**. The e1 and e2 squares have the same PST value (0), and nothing rewards castling. That is also an **eval** failure.
- g23 (loss): the same pattern. It played Qxc7 pawn grabs with the king left in the centre (Nf3/Be2 instead of O-O-O), with eval about +250 while Stockfish was at −210 to −460.

### 2.3 Time use
Moves by elapsed time: 604 of 1285 (**47 %**) end at 0.235–0.242 s, the hard stop. Each of those started an iteration before 0.10 s, could not finish it, and threw it away. So **≥ 0.137 s of 0.25 s (≥ 55 %) was wasted on almost half the moves**, and only ~0.1 s of useful search was done. The other half stopped between 0.10 and 0.23 s and left 10–60 % of the budget unused. That explains the reported 74 % average use.

Hard-limit hits by phase: opening 55 %, middlegame 49 %, endgame 38 %.

At the real 5 s rule the waste is worse in absolute terms. In g13, d7 finished at 1.15 s, then d8 ran until 4.75 s and was **discarded**. In g1, d8 finished at 3.75 s after starting at 0.78 s. The ~2 s soft limit gives depth 7–8 at 5 s, the same as depth 5–6 at 0.25 s. Because the root never searches the previous best move first, a partial iteration cannot be trusted, so this waste is built into the current design.

No moves came within 3 % of the limit, and there were 0 timeouts, so the reserve is safe and could be tightened slightly.

### 2.4 Draws, repetition and conversion
- **Correction to the premise:** game 16 was **not** a win that slipped. The engine (Black) was lost from move 42 on (Stockfish +4.6 to +15). Its own score was −470 to −770 for 100+ plies, and it escaped by threefold repetition because 1600-level Stockfish could not mate with Q+B vs R. The long list of "2000 cp blunders" in that game, with played move = best move, comes from mate-score clamping in the analyzer. Those are not engine errors. The same artifact explains g8 `Nxd5`, g17 `d8=Q` and g21 `c7`, where the engine was at +31 and stayed winning.
- There are no cases of the engine scoring 0 (repetition) while Stockfish had it ≥ +3, so contempt did not cost a win in this run. However, `is_repetition` scores a single earlier occurrence as exactly 0, and draws are worth nothing here, so the draw score should be negative for us. Game 16 shows that a contempt of about 50 cp would still have taken the save (−50 is better than −700).
- Conversion: median **33 plies** from first reaching +5 to mate, and 57 plies in the slowest win. Game 2 lasted 190 plies. Nothing in the eval pushes the enemy king to the edge or advances passed pawns, so endgame ACPL is the worst of the three phases (81.7), and endgame optimism is +300 cp.

## 3. Diagnosis mapped to techniques

| symptom (evidence) | technique |
|---|---|
| EBF 5–10, odd-depth ×10 jumps, no hash/PV move, new Searcher per move | **Transposition table** (persistent across moves) with hash move first; triangular PV |
| Quiet moves in generator order; about 10× Stockfish's nodes for half its depth | **Killers + history heuristic**, **PVS** |
| Depth 6 vs 12; d7 fixes g13 and g24 | **Null-move pruning**, **LMR** |
| g13 Qe4+ fork missed at d6; qsearch stands pat in check | **Check extension**, check evasions in qsearch, **SEE** to prune losing captures in qsearch |
| 47 % of moves discard an aborted iteration; the 40 % soft limit wastes time at 5 s | **Time management**: keep the partial root result, predict iteration cost from EBF |
| g1 Ke2, g7 Nxg5 at d8, g23/g24 pawn grabs with king in centre; middlegame optimism +214 cp | **King safety** (pawn shield, open files near king, attacker count), castling-rights bonus, **tapered eval** |
| Endgame optimism +300 cp, ACPL 81.7, 33-ply median conversion | **Passed-pawn** bonus by rank, mop-up (king to edge/corner) term |
| Draws are worth 0; a repetition is scored 0 | **Contempt** (draw = −contempt for our side) |

## 4. Prioritised code changes for `engine/` (max 7)

1. **Transposition table plus hash-move ordering, kept across moves** (`search.rs`, `main.rs`). A Zobrist-keyed table of about 16–64 MB (depth, score with bound flag, best move, mate-score ply adjustment) is held in a `Searcher` that lives for the whole game and is not rebuilt on every `go`. Search the TT move first at every node, root included. Extract the PV from the TT for `info`.
   *Evidence:* EBF 5–10, no PV-first ordering, a new Searcher per move, 47 % of moves wasting their last iteration.
   *Expected:* **+100–150 Elo.** It is also the prerequisite for items 2–4.

2. **PVS + killer moves + history heuristic** (`search.rs` `ordered_moves`/`negamax`). The order becomes TT move, good captures (MVV-LVA/SEE), 2 killers per ply, then quiet moves sorted by history. Add a null-window re-search for non-PV moves.
   *Evidence:* quiet moves come in generator order, and we search about 10× Stockfish's nodes per move for half its depth.
   *Expected:* **+60–100 Elo** (EBF toward about 3.5, +1–2 plies).

3. **Null-move pruning (R = 2–3, off in check and in pawn-only endings) + LMR** (reduce late quiet moves by 1–2 plies at depth ≥ 3, after the first 3–4 moves, never for checks, captures or killers).
   *Evidence:* the depth-6 average accounts for 52 of 85 blunders. In the re-runs, **one extra ply** found the right move in g13 (exd5 → O-O at d7) and g24 (Bd6 → Ne4 at d7), and two of the four losses were decided by those moves.
   *Expected:* **+150–250 Elo.** This is the biggest single gain, but it needs 1 and 2 first for stable ordering.

4. **Time management rewrite** (`search.rs` `search`). (a) Keep the root best move from an aborted iteration when the first (TT/PV) move has been fully searched. (b) Do not start iteration d+1 when `elapsed × EBF_estimate > hard_limit` (use the last iteration's time ratio), instead of the fixed 40 % soft limit. (c) Use ~95 % of `movetime` as the hard limit (0 moves came within 3 %, so there is headroom).
   *Evidence:* 604 of 1285 moves ended at the hard limit with the iteration discarded, and ≥ 55 % of their budget was wasted. At 5 s, 3.6 s was thrown away in g13.
   *Expected:* **+30–60 Elo**, and more at the real 5 s rule.

5. **Check extension + qsearch fixes** (`search.rs`). Extend by 1 ply when the side to move is in check. In `quiescence`, when in check, do not stand pat and search all evasions (this catches mates). Prune captures with negative SEE in qsearch (it also speeds qsearch up).
   *Evidence:* g13 `exd5??` refuted by ...Qe4+ was missed at d6. The engine's score is +214 cp over Stockfish's on average in the middlegame, and the 61 real errors were almost all played at +150 to +500 where Stockfish saw ≤ 0.
   *Expected:* **+40–70 Elo.**

6. **King safety + castling + tapered eval** (`eval.rs`). Blend middlegame and endgame PST by a game-phase counter (N=1, B=1, R=2, Q=4). Add a pawn-shield bonus and penalties for semi-open or open files next to the king. Add an attacker count or weight in the king zone, scaled by the enemy queen's presence. Penalise losing castling rights while the king is still on the e-file.
   *Evidence:* g1 `Ke2` over O-O-O and g7 `Nxg5` (+440 vs −672) were still chosen at **depth 8**, so search cannot fix them. In the g23/g24 losses the engine grabbed pawns with its king left in the centre, with its own score around +200 and Stockfish's at −750.
   *Expected:* **+50–100 Elo.** Most of this is losses avoided: 3 of the 4 losses fit this pattern.

7. **Passed pawns, mop-up and contempt** (`eval.rs`, `search.rs`). Add a passed-pawn bonus that grows by rank (about 10/20/35/60/100 cp), plus a free-path or king-proximity term in the endgame. Add a mop-up term that pushes the losing king to the edge and brings our king closer when we are ahead by ≥ a rook. Score repetition and 50-move draws as `−contempt` (about 30–50 cp) from the root side's point of view, because draws are worth nothing here.
   *Evidence:* endgame ACPL 81.7 and +300 cp endgame optimism. Median 33 plies from +5 to mate, and 190 plies in g2. The draw rule is currently symmetric at 0. Game 16 shows the rule would still keep a save from a lost position.
   *Expected:* **+20–40 Elo** in wins per game, plus faster conversion, which matters for win-only scoring and the 5 s clock.

Implement 1 → 2 → 3 in that order and benchmark each step. Together they should roughly double the depth (6 → 10–12 at 0.25 s), and they account for most of the expected gain. Items 5–7 are cheap and independent, and they target the specific loss patterns seen here. The Elo figures are rough estimates against the 1500–1700 pool, overlap somewhat, and should not be summed naively.
