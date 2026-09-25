---
name: analyze-game
description: Analyze a finished match run against Stockfish (competition rule: after every run). Runs `make analyze RUN=...` (full-strength Stockfish annotation), then spawns two sub-agents in parallel — a grandmaster (Magnus Carlsen-strength) and a chess-engine developer — whose reports are saved as analysis/<run>/grandmaster.md and engine-dev.md. Use after every `make bench` / `make bench-full`, or when asked to analyze a game or run.
---

# Analyze a run

Input: a run directory `games/runs/<commit>/` (or `games/proofs/`). Output: `analysis/<run>/summary.md`, `grandmaster.md`, `engine-dev.md`, plus annotated PGNs.

## 1. Machine annotation

```
make analyze RUN=games/runs/<commit>/
```

This writes `analysis/<commit>/summary.md` (move quality by phase, where results were decided, time/depth usage, per-game table, the worst engine moves with FENs), `analysis.json` and `game_NN.pgn` annotated with `[%eval]` and best moves. Read `summary.md` yourself before spawning the agents.

## 2. Two sub-agents, in parallel (Agent tool, `general-purpose`)

Give both agents the same context: the run directory, the analysis directory, `engine/` (read-only for them), and the fact that only wins count (draws are worth nothing). Tell each agent to write its report itself with the Write tool and to return a 5-line digest.

**Grandmaster agent** → `analysis/<commit>/grandmaster.md`

> You are a world-class chess player of Magnus Carlsen's strength, reviewing games our engine (`chess-winning-team`) played against Stockfish limited to UCI_Elo <levels>. Read `analysis/<commit>/summary.md`, then the annotated PGNs in `analysis/<commit>/` (start with the losses and the drawn games that were once winning; `[%eval]` is Stockfish's full-strength assessment from White's side, comments mark our cp loss and the best move). For each loss and slipped draw, explain where the engine *misunderstood the position* in chess terms: opening choice and development, pawn structure, king safety, piece activity and coordination, trades (good or bad), the transition into the endgame, endgame technique, unnecessary repetition from a better position. Separate strategic misunderstandings from pure tactical oversights. End with a prioritised list of at most 7 concrete, engine-implementable chess suggestions (e.g. "penalise a king with no pawn shield when the opponent's queen is on", "reward rooks on open files", "avoid trading into pawn-down endings"), each tied to specific game/move evidence. Write the report to `analysis/<commit>/grandmaster.md`.

**Engine-developer agent** → `analysis/<commit>/engine-dev.md`

Start its prompt with the body of `skills/chess-engine-expert.md` (everything after the frontmatter) as its persona, then:

> You are an experienced chess-engine developer. Our engine is the Rust program in `engine/` (read `engine/src/*.rs` first: search, eval, move ordering, time management). Read `analysis/<commit>/summary.md`, `games/runs/<commit>/summary.txt`, `games/runs/<commit>/moves.jsonl` (per move: time, depth, nodes, nps, the engine's own score, pv) and the annotated PGNs in `analysis/<commit>/`. Diagnose from the evidence: horizon effects and missed tactics at the depths reached, cases where the engine's own eval disagreed wildly with Stockfish's, move-ordering quality visible in node counts, unused time and time spikes near the limit, depth by game phase, draws by repetition from good positions, and depth compared with our own earlier runs. Map each diagnosis to a known technique (transposition table, PVS, null-move, LMR, killers/history, check extensions, SEE, tapered eval, king safety, passed pawns, contempt, better time management, speed work…). End with a prioritised list of at most 7 concrete code changes for `engine/`, each with the evidence it rests on and the expected Elo effect. Suggest techniques, never another engine's code or constants (see the persona's Originality rules). Write the report to `analysis/<commit>/engine-dev.md`.

## 3. Synthesis

Read both reports. Look for patterns the two agree on, and for anything one saw that the other missed. Decide the next experiment from that evidence (see program.md, loop step 10): structural change over knob-tuning; ask whether the last failure was "slower" or "wrong idea". Commit the three reports together with the run's games in the experiment's commit.
