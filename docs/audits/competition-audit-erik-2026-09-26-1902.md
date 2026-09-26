# Competition audit: chess-winning-team ("The Chess Challenge – Beat Stockfish!")

Audit date: 2026-09-26. Auditor: independent (Claude Fable 5.1, run in Claude Code on the Windows team member's machine).
Repository audited: `C:\repos\chess-winning-team`, branch `main` at `aef3c37` (origin/main is one commit ahead, `46a039f`, which only rebuilds `LEDGER.md`).
Nothing in the entry was modified. This report is the only file written. Tests run during the audit are labelled **[audit test]**; everything else is inspection of stored records.

## 1. Overall verdict

**Insufficient evidence for full compliance.** The application, the team-developed player, the Stockfish configuration, the 5-second limit, complete game storage, replay, the highest victory (Elo 2900) and the Elo 3190 statistics are all verified from direct evidence. One mandatory requirement is not met by the records: the post-game analysis by a skill and by two sub-agents (rule F) exists for only 20 of the 41 Elo 3190 games and for none of the games played on the macOS team member's machine, including the six proof games for Elo 2400 to 2900. No direct evidence shows those analyses were done; no direct evidence shows they were not (that machine's conversation records are not accessible from here). Status of F is therefore UNVERIFIED, which blocks a "verified compliant" verdict.

| Item | Result |
|---|---|
| Highest verified victory | **Elo 2900**, `games/proofs/beat-2900.pgn` (copy of `games/runs/stack-v2-full-t3000s100/game_07.pgn`), engine White, 1-0 by checkmate, 103 plies, Stockfish 19, `UCI_LimitStrength=true`, `UCI_Elo=2900`, 5 s/move |
| Elo 3190 (5 s/move) | 0 wins, 20 draws, 21 losses, 41 games. Win ratio 0/41 = **0.0 %**. GUI shows `0 / 41 = 0.0%` |
| Average moves at 3190 (application metric) | GUI 74.8 full moves per game over all 41 games. Audit recomputation 149.51 plies = 74.76 full moves. No wins, so "avg moves in wins" shows "—" |
| Development workflow | `/loop` used: 8 invocations, 39 self-scheduled wake-ups, 21 sub-agent spawns recorded in Claude Code session transcripts on this machine |

## 2. Evidence located

| Evidence | Where | Notes |
|---|---|---|
| Application source and launch | `README.md` (Setup, Running experiments), `Makefile`, `arena/`, `app/index.html`, `frontend/` | `make engine`, `python tools/stockfish.py`, `make bench-full`, `make app` |
| Team player | `engine/src/main.rs` (UCI), `engine/src/search.rs` (1651 lines), `engine/src/eval.rs` (541 lines); `engine/Cargo.toml`; `engine/vendor/cozy-chess*` | Rust; only dependency is the vendored `cozy-chess` move generator (MIT) |
| Stockfish integration | `arena/util.py:266-392` (`play_game`), `tools/stockfish.py` (pinned Stockfish 19, SHA-256 checked) | binary `tools/stockfish/stockfish.exe`, reports version 19 **[audit test]** |
| Saved games | `games/runs/<run>/game_NN.pgn` (33 run dirs, 709 PGNs) + `games/proofs/beat-<elo>.pgn` (14) = 723 PGNs; `moves.jsonl` + `summary.json/.txt` in the 22 completed 30-game runs | every PGN carries `StockfishElo`, `WhiteElo/BlackElo`, `EngineColor`, `MoveTimeS`, `TimeControl`, `EngineCommit`, `Termination`, `PlyCount`, `FEN/SetUp` |
| Replay and statistics | `arena/app.py` (JSON API), `app/index.html` (plain page), `frontend/src/**` (React app; `frontend/dist` not built in this checkout) | `/api/top` is the 3190 scoreboard; `/api/ladder`, `/api/game` for replay |
| Development records | `~/.claude/projects/C--repos-chess-winning-team/*.jsonl` (11 sessions), `program.md`, git log of `autoresearch/*` branches, `LEDGER.md`, `evidence/manifest.json` | macOS member's sessions not accessible |
| Skill and sub-agent analyses | `.claude/skills/analyze-game/SKILL.md`, `skills/chess-engine-expert.md`, `analysis/<run>/{summary.md,grandmaster.md,engine-dev.md}` | 19 runs have `summary.md`, 16 of them also both agent reports |

Missing or inaccessible evidence, stated precisely:
- No `analysis/` directory for any run played on macOS (`4340e04-dirty-full`, `4340e04-dirty-full-r2`, `stack-v2-full-t2700s100`, `stack-v2-full-t3000s100`, `v4-ead1002-full-t3100s90`, `v4t2-139c887-full-t3100s90`, `v4t2-139c887-full-t3190s0`, `c50-139c887-b-full-t3190s0`, `c120-9492e36-full-t3190s0`, `t8c120x1-92521ec-full-t3190s0`, `t8c120x2-92521ec-full-t3190s0`), nor for the aborted Windows run `2002feb-full-t3190s0-s1` (9 games at 3190). Searched the working tree, `origin/autoresearch/sep26-robin` and the whole git history (`git log --all -- 'analysis/*'`).
- No conversation records from the macOS machine (branches `sep25-robin`, `sep26-robin`).
- No `moves.jsonl`/`summary.json` for the 11 partial runs (interrupted before 30 games); their per-move timing exists only as PGN comments (`E d24 4.93s`, `S d31 5.01s`).
- Games that were in flight when a parallel run was stopped were never written (file numbering gaps, e.g. `t8c120x2-…/game_01, game_03`; `v4t2-139c887-full-t3190s0/game_02..06`). Their number and state are unknown.
- 9 further games (2910/3000/3090, 0/7/2) exist only on `origin/autoresearch/sep25-erik` at `f848182`, not on `main`. They are not at 3190 and do not affect the statistics.

## 3. Requirement table

| Req | Status | Evidence | Finding |
|---|---|---|---|
| A. Application and team player | **PASS** | `engine/src/*.rs`; `arena/util.py:277-281`; `assert_self_contained` `util.py:416-438`; `Cargo.toml` | Own Rust alpha-beta engine plays Stockfish 19 over UCI via python-chess. See §4 for how moves are chosen. |
| B. `/goal`, `/loop` or dynamic workflow | **PASS** | Session `b268f74c…jsonl`: `Skill loop` at 2026-09-25 09:16:20 UTC; 29 `ScheduleWakeup` calls 09:21–16:52 UTC; `/loop` re-invoked 10:41, 11:02, 14:12, 15:18, 16:14 UTC; session `ab689d15…jsonl`: `/loop` 2026-09-26 07:42–09:50 UTC, 10 wake-ups. Resulting activity: the `[exp]/[keep]/[discard]/[FULL]` commits on `autoresearch/sep25-erik` in the same windows | Records are execution records, not a README mention. macOS branch's workflow is unverifiable from here but the rule needs only one use. |
| C. Max 5 s thinking per move | **PASS with overages to review** | `util.py:34,281,298` (`Limit(time=5.0)` for both players); `search.rs:589-593` (hard limit = movetime − 5 %, capped 100 ms → 4.90 s); `moves.jsonl` of 6 full runs; PGN comments of the rest; `assert_time_compliance` `util.py:447-454` | Engine wall time ≤ 4.959 s in every Windows game and every 3190 game. Three macOS games contain one engine move each measured at 5.03–5.04 s wall clock (incl. pipe overhead), one of them the proof `beat-2700.pgn`. Stockfish wall time 5.007–5.068 s (its own limit 5.0 s plus transport). No retries or fallbacks exist. |
| D. `UCI_LimitStrength`/`UCI_Elo` | **PASS** | `util.py:280`: `sf.configure({"UCI_LimitStrength": True, "UCI_Elo": spec.level, "Threads": 1, "Hash": 16})`; `ladder_levels` clamps to 1320–3190 (`util.py:43,130`); `git log -S'UCI_LimitStrength' -- arena/util.py` → unchanged since first commit `498eace`; **[audit test]** Stockfish 19 reports `UCI_Elo` spin 1320–3190, 3190 accepted, 3191 and 1319 rejected by python-chess | No `Skill Level`, depth or GUI rating is used. python-chess raises on out-of-range values, so no silent fallback is possible. Max level in any saved game is 3190. Effective settings are not logged per game (no UCI trace); the code path is the only one and its history is clean. |
| E. Every game saved with Stockfish Elo | **PASS** (completeness partly unverifiable) | 723 PGNs replayed **[audit test]**: 0 illegal moves, 0 result/termination mismatches, 0 header gaps, 0 PlyCount mismatches; `assert_games_saved` `util.py:467-481`; run dirs never deleted (`run_dir_for` `util.py:93-101`); macOS game files on `main` byte-identical to the branch | Games killed mid-run were never written (no partial-game record exists), so completeness of abandoned attempts cannot be verified. All ledger W/D/L claims reconcile with `summary.json` and with my recount. |
| F. Skill + two sub-agents per game | **UNVERIFIED** (partly not done in the records) | `analysis/2002feb-full-t3190s100/{summary,grandmaster,engine-dev}.md`; transcripts: two distinct `Agent` calls (IDs `a666…`, `aff6…`) at 09:29:36/09:29:53 UTC with different role prompts, completed 09:35:39 and 09:42:08 UTC; commits `c0e2fe4`, `5178a42` | Covered: 20 of 41 Elo 3190 games and 16 of the 22 completed 30-game runs. Not covered: 21 Elo 3190 games (9 aborted-run games on Windows, 12 macOS games), all macOS 5 s runs including the proofs for 2400–2900, and Robin's fast runs `1a24270`, `aecf98e` (summary only). |
| G. Winning result and progression | **PASS** (highest = 2900) | `games/proofs/beat-2900.pgn` ≡ `games/runs/stack-v2-full-t3000s100/game_07.pgn` (identical move list); `[FULL] e5d57de` 2026-09-26 09:11:49 +02:00; `[ladder] 823c402` 09:11:59; tag `beat-2900`; `evidence/manifest.json` verified; replay via `/api/game?run=proofs&file=beat-2900.pgn` **[audit test]** (103 moves, book start FEN) | Checkmate, not a crash or timeout. Chronology: each ladder bump follows the winning `[FULL]` commit. `EngineCommit` is `4340e04-dirty` (uncommitted engine at play time), see §8. |
| H. Elo 3190 win ratio in GUI | **PASS** | `arena/app.py:349-413`; `TopBoard.tsx:44-53`, `App.tsx:41-49`, `app/index.html:245-262`; **[audit test]** `/api/top` → `games 41, wins 0, draws 20, losses 21, win_ratio 0.0` | Matches the audit recount exactly. Denominator includes draws and losses. Zero games handled (`win_ratio: null`, "No games at 3190 yet") **[audit test]** with `level=3195`. |
| I. Average moves in GUI | **PASS** (definition flagged) | `app.py:334-345`; same UI files | Definition: full moves = PlyCount/2 over all 3190 games at 5 s; a second value over wins only. Book moves (openings.epd) are excluded because PGNs start from the book FEN. GUI 74.8 = audit 74.76. |

## 4. A. How the team player chooses moves

- **Player**: `chess-winning-team`, Rust, `engine/src/`. `main.rs` speaks UCI (`position`, `go movetime N`, `bestmove`). `search.rs` is iterative-deepening alpha-beta with a transposition table (4-way buckets), principal-variation search, aspiration windows, null-move pruning, reverse-futility/futility/late-move pruning, log-based late-move reductions, killer/history/countermove ordering, a staged move picker with static exchange evaluation, check extensions, in-check quiescence, repetition and fifty-move detection, contempt, and Lazy SMP helper threads (default 2 on `main`; 8 in the macOS `92521ec` games). `eval.rs` is a hand-written tapered material + piece-square evaluation with a king-safety term, endgame draw scaling and passed pawns. No neural network, no opening book beyond the arena's 24 balanced start positions in `openings.epd` (given to both players).
- **External components**: `cozy-chess` (move generation, vendored, MIT). Stockfish 19 is the opponent and the post-game annotator only; `assert_self_contained` scans the sources for process spawning, sockets, FFI and outside-path literals, and `_child_pids` checks at run time. Threads inside the engine are allowed by the rules (only time is limited).
- **Ownership**: engine authored in-repo by the two members with Claude (author string `Erik Adolfsson + Claude`). Flag for organizers: for the macOS proof games 2400–2900 the `EngineCommit` header is `4340e04-dirty`, i.e. the engine source had uncommitted changes at play time; the ledger attributes them to `cfdaa47`/`888bd24` committed minutes later, but the exact revision that played is not pinned by a hash.

## 5. B. Observed development workflow

The `/loop` skill (Claude Code's self-paced recurring prompt) drove the research loop described in `program.md`. Observed in the transcripts: the user invoked `/loop "Follow program.md's experiment loop …"`; the model then alternated engine edits, `make bench`, commits, the `analyze-game` skill, two `Agent` spawns per run, and `ScheduleWakeup` calls (delays 600–1800 s) 39 times over two days; a final `stop: true` at 2026-09-25 16:52 UTC and 2026-09-26 10:01 UTC. The `[exp]`, `[keep]`, `[discard]`, `[FULL]` and `[ladder]` commits on `autoresearch/sep25-erik` fall inside those windows. `/goal` and the Workflow tool appear only in tool definitions, not as invocations.

## 6. C and D. Timing and configuration details

- Both players: `chess.engine.Limit(time=move_time)` with `move_time = 5.0` for `make bench-full` (`util.py:34,281`). Wall time is measured around `player.play()` in Python (`util.py:296-306`), so it includes pipe and scheduling overhead. The engine additionally stops itself at `movetime − reserve` where reserve = 5 % clamped to 15–100 ms (`search.rs:589-593`); the version that played the 2400–2900 proofs (`4340e04-dirty`) predates this exact formula.
- Integrity: an engine move over `5.0 + 0.10` s aborts the whole run (`util.py:447-454,636`); Stockfish moves are not checked. There are no retries, no fallback moves, no external requests. An engine crash, missing bestmove or illegal move is scored as a loss for the engine (`util.py:299-325`); none occurred in any stored game.
- Measured (per-move logs where they exist, PGN comments otherwise):

| Run | Host | Engine max | Engine > 5.0 s | Stockfish max |
|---|---|---|---|---|
| 2002feb-full-t3190s100 (20 games at 3190) | Windows | 4.959 s | 0 of 2331 | 5.012 s |
| 2002feb-full-t3190s0-s1 (9 at 3190) | Windows | 4.94 s (PGN) | 0 | 5.01 s |
| macOS 3190 runs (12 games) | macOS | 4.96 s (PGN) | 0 | 5.04 s |
| 4340e04-dirty-full-r2 (proofs 2400, 2500) | macOS | 5.033 s | 2 of 1457 | 5.068 s |
| stack-v2-full-t2700s100 (proofs 2600, 2700, 2800) | macOS | 5.04 s (game_10 = beat-2700) | 1 game | 5.03 s |
| stack-v2-full-t3000s100 (proof 2900) | macOS | 4.92 s | 0 | 5.04 s |
| 555bcaf-full, 55375f9-full, b46124c-full, 7047219-full | Windows | 4.956 s | 0 | 5.014 s |

The overages of 33–40 ms on macOS are wall-clock including transport; the engine's internal thinking time for those moves is not recorded. I report them as measured and do not apply a grace period; the harness's own 0.10 s tolerance is the team's choice, not the rule's. Stockfish's wall times of 5.007–5.068 s are `Limit(time=5.0)` plus process overhead.

## 7. E. Storage and reconciliation

- 723 PGNs replayed with python-chess **[audit test]**: all moves legal, every `Result` equals the board's outcome (`checkmate`, `threefold repetition`, `insufficient material`, `fifty moves`) except one game adjudicated as a draw at the harness's 400-ply cap (`2002feb-full-t3190s100/game_22.pgn`), which is consistent with its `Termination` header. 569 games start from a book FEN (`SetUp "1"`, `FEN`), 154 from the standard start.
- Ledger vs files: every `[keep]/[FULL]/[sync]` row in `LEDGER.md` maps to a run directory whose `summary.json` has the same W/D/L; the team's `evidence/manifest.json` lists 31 claims, all `verified` with empty `problems`; my independent replay agrees.
- Partial runs: 11 directories hold only PGNs (runs stopped early on purpose, per commit messages such as "stopped for the 3190-only rule", "aborted … stopped to re-aim"). Their completed games are real, finished games and are counted. Games still running at the stop were never saved.

## 8. G. Highest verified victory

| Field | Value |
|---|---|
| Elo | 2900 (`UCI_LimitStrength=true`, `UCI_Elo=2900`, `Threads=1`, `Hash=16`) |
| Game | `games/proofs/beat-2900.pgn` = `games/runs/stack-v2-full-t3000s100/game_07.pgn` |
| Player / colour | chess-winning-team, White (`EngineColor "white"`, `White "chess-winning-team 4340e04-dirty"`, `Black "Stockfish 19"`) |
| Result / termination | 1-0, checkmate, 103 plies, from book position Giuoco Piano (`r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w`) |
| Timing | engine max 4.91 s, Stockfish max 5.02 s (PGN comments; no `moves.jsonl`) |
| Stockfish version | 19 (`Opponent "Stockfish 19"`; both machines pin release `sf_19` by checksum) |
| Provenance | played on macOS 2026-09-26, committed in `[FULL] e5d57de` (09:11:49 +02:00), copied to proofs by `tools/team.py ladder` in `823c402` (09:11:59), tag `beat-2900`, verified in `evidence/README.md` |
| Replay | `/api/game?run=proofs&file=beat-2900.pgn` returns 103 moves with FENs **[audit test]**; graphical replay in `app/index.html` and `frontend` (Replay view) |
| Caveats | engine revision `-dirty` (see §4); no skill or sub-agent analysis of this game exists in the repo; macOS session records not available |

Progression: proofs exist for every 100-point level from 1600 to 2900 (14 files, all checkmates, all 5 s/move, all matching a run game). Ladder commits: 1600/1700 (`0b5e357`, Sep 25 12:12), 1800/1900 (`7df0139`, 16:29), 2000/2100 (`0c5f5a4`, 17:22), 2200/2300 (`4340e04`, 18:38), then on main 2400–2800 (`d519e4e`, Sep 26 09:08) and 2900 (`823c402`, 09:11). Each follows its winning `[FULL]` commit. Wins above 2900 at 5 s/move: none (3000: 0/1/0, 3010: 0/3/0, 3090: 0/6/4, 3100: 0/3/1, 3190: 0/20/21).

## 9. H. Elo 3190 win ratio

Population rule in `app.py:_api_top`: every PGN under `games/runs/*` with `StockfishElo == 3190` and `MoveTimeS == "5"`, with a decided `Result`; proofs (copies) and `games/gauntlet` (self-play, no `StockfishElo`) excluded; each file counted once; outcome from `EngineColor`.

Independent recount **[audit test]** from the PGN files:

| | Wins | Draws | Losses | Total | Win ratio |
|---|---|---|---|---|---|
| All Elo 3190 games at 5 s/move | 0 | 20 | 21 | 41 | 0/41 = 0.0 % |
| GUI (`/api/top`, `TopBoard`, `App` badge, `app/index.html`) | 0 | 20 | 21 | 41 | `0 / 41 = 0.0%` |

Checks: numerator counts engine wins only; denominator includes draws (Windows: 11 threefold repetitions and 1 draw adjudicated at 400 plies; macOS: 7 threefold repetitions and 1 insufficient material); games before the first 3190 win are included (there is no 3190 win, so the whole history is in); no date window or reset exists (the tally is rebuilt from all files on every request, cache keyed on directory mtimes, `app.py:307-317,392-398`); statistics therefore persist across restarts and update when a new PGN appears (source inspection; the restart behaviour was observed by starting a fresh server process during the audit, the update-on-new-game behaviour was not exercised to avoid writing into the entry). Rounding `toFixed(1)` → `0.0%`. Zero games → `win_ratio null`, "No games at 3190 yet" **[audit test]**. Unresolved classifications: none among the 41 saved games; the unknown number of unsaved in-flight games at run stops is disclosed above and is for organizers to rule on.

Per engine revision (also shown in the GUI): `2002feb` 0/12/17 (29 games, Windows), `139c887` 0/3/3, `92521ec` 0/4/1, `9492e36` 0/1/0 (macOS).

## 10. I. Average number of moves

Application definition (`app.py:334-345`, labelled in the UI): "Avg moves / game" = mean of `PlyCount / 2` over all Elo 3190 games at 5 s (74.8); "Avg moves in wins" = the same over wins only ("—", no wins). A final White-only turn counts as half a move. Book moves before the start FEN are not counted (PGN move numbers restart at 1). Interrupted games are not stored and so not counted. Zero games → "—".

Audit calculations (labelled separately from the application's metric):

| Population | Games | Mean plies | Mean full moves |
|---|---|---|---|
| All completed Elo 3190 games | 41 | 149.51 | 74.76 |
| Elo 3190 victories | 0 | — | — |
| Windows games only (`2002feb`) | 29 | 156.9 | 78.4 |
| macOS games only | 12 | 131.8 | 65.9 |

The rule text does not define the count; this implementation is a reasonable one. For cross-team comparison organizers should fix (a) plies vs full moves, (b) whether book moves count, (c) all games vs wins only.

## 11. Per-game table

Columns: timing = source of per-move times (J = `moves.jsonl` and PGN, P = PGN comments only) with the engine's slowest move; storage/replay = PGN on disk with full headers and replayable through the app (all Y); skill = `analysis/<run>/summary.md` (`make analyze`); GM / Dev = grandmaster and engine-dev sub-agent reports covering the run.

### Elo 3190, 5 s/move (41 games)

| Game | Elo | Engine | Result | Plies | Termination | Timing | Store/replay | Skill | GM | Dev |
|---|---|---|---|---|---|---|---|---|---|---|
| 2002feb-full-t3190s100/game_03 | 3190 | W | draw | 99 | threefold | J 4.93 | Y | Y | Y | Y |
| 2002feb-full-t3190s100/game_04 | 3190 | B | draw | 158 | threefold | J 4.93 | Y | Y | Y | Y |
| 2002feb-full-t3190s100/game_05 | 3190 | W | loss | 180 | checkmate | J 4.93 | Y | Y | Y | Y |
| 2002feb-full-t3190s100/game_06 | 3190 | B | draw | 98 | threefold | J 4.93 | Y | Y | Y | Y |
| 2002feb-full-t3190s100/game_09 | 3190 | W | draw | 129 | threefold | J 4.93 | Y | Y | Y | Y |
| 2002feb-full-t3190s100/game_10 | 3190 | B | loss | 163 | checkmate | J 4.93 | Y | Y | Y | Y |
| 2002feb-full-t3190s100/game_11 | 3190 | W | loss | 110 | checkmate | J 4.93 | Y | Y | Y | Y |
| 2002feb-full-t3190s100/game_12 | 3190 | B | loss | 137 | checkmate | J 4.93 | Y | Y | Y | Y |
| 2002feb-full-t3190s100/game_15 | 3190 | W | loss | 164 | checkmate | J 4.93 | Y | Y | Y | Y |
| 2002feb-full-t3190s100/game_16 | 3190 | B | draw | 74 | threefold | J 4.93 | Y | Y | Y | Y |
| 2002feb-full-t3190s100/game_17 | 3190 | W | loss | 136 | checkmate | J 4.94 | Y | Y | Y | Y |
| 2002feb-full-t3190s100/game_18 | 3190 | B | loss | 181 | checkmate | J 4.93 | Y | Y | Y | Y |
| 2002feb-full-t3190s100/game_21 | 3190 | W | draw | 296 | threefold | J 4.94 | Y | Y | Y | Y |
| 2002feb-full-t3190s100/game_22 | 3190 | B | draw | 400 | adjudicated at 400 plies | J 4.94 | Y | Y | Y | Y |
| 2002feb-full-t3190s100/game_23 | 3190 | W | loss | 85 | checkmate | J 4.94 | Y | Y | Y | Y |
| 2002feb-full-t3190s100/game_24 | 3190 | B | loss | 96 | checkmate | J 4.94 | Y | Y | Y | Y |
| 2002feb-full-t3190s100/game_27 | 3190 | W | loss | 242 | checkmate | J 4.93 | Y | Y | Y | Y |
| 2002feb-full-t3190s100/game_28 | 3190 | B | draw | 128 | threefold | J 4.93 | Y | Y | Y | Y |
| 2002feb-full-t3190s100/game_29 | 3190 | W | draw | 193 | threefold | J 4.93 | Y | Y | Y | Y |
| 2002feb-full-t3190s100/game_30 | 3190 | B | draw | 118 | threefold | J 4.96 | Y | Y | Y | Y |
| 2002feb-full-t3190s0-s1/game_01 | 3190 | W | draw | 215 | threefold | P 4.94 | Y | N | N | N |
| 2002feb-full-t3190s0-s1/game_02 | 3190 | B | loss | 71 | checkmate | P 4.94 | Y | N | N | N |
| 2002feb-full-t3190s0-s1/game_03 | 3190 | W | draw | 201 | threefold | P 4.94 | Y | N | N | N |
| 2002feb-full-t3190s0-s1/game_04 | 3190 | B | loss | 169 | checkmate | P 4.94 | Y | N | N | N |
| 2002feb-full-t3190s0-s1/game_05 | 3190 | W | loss | 168 | checkmate | P 4.93 | Y | N | N | N |
| 2002feb-full-t3190s0-s1/game_06 | 3190 | B | loss | 187 | checkmate | P 4.94 | Y | N | N | N |
| 2002feb-full-t3190s0-s1/game_07 | 3190 | W | loss | 76 | checkmate | P 4.94 | Y | N | N | N |
| 2002feb-full-t3190s0-s1/game_08 | 3190 | B | loss | 107 | checkmate | P 4.93 | Y | N | N | N |
| 2002feb-full-t3190s0-s1/game_09 | 3190 | W | loss | 168 | checkmate | P 4.94 | Y | N | N | N |
| v4t2-139c887-full-t3190s0/game_02 | 3190 | B | draw | 82 | threefold | P 4.91 | Y | N | N | N |
| v4t2-139c887-full-t3190s0/game_03 | 3190 | W | loss | 192 | checkmate | P 4.91 | Y | N | N | N |
| v4t2-139c887-full-t3190s0/game_04 | 3190 | B | draw | 98 | threefold | P 4.91 | Y | N | N | N |
| v4t2-139c887-full-t3190s0/game_05 | 3190 | W | draw | 106 | threefold | P 4.94 | Y | N | N | N |
| v4t2-139c887-full-t3190s0/game_06 | 3190 | B | loss | 189 | checkmate | P 4.91 | Y | N | N | N |
| c50-139c887-b-full-t3190s0/game_01 | 3190 | W | loss | 98 | checkmate | P 4.91 | Y | N | N | N |
| c120-9492e36-full-t3190s0/game_02 | 3190 | B | draw | 116 | threefold | P 4.91 | Y | N | N | N |
| t8c120x2-92521ec-full-t3190s0/game_01 | 3190 | W | draw | 204 | insufficient material | P 4.91 | Y | N | N | N |
| t8c120x2-92521ec-full-t3190s0/game_03 | 3190 | W | draw | 87 | threefold | P 4.96 | Y | N | N | N |
| t8c120x1-92521ec-full-t3190s0/game_01 | 3190 | W | draw | 163 | threefold | P 4.92 | Y | N | N | N |
| t8c120x1-92521ec-full-t3190s0/game_02 | 3190 | B | draw | 90 | threefold | P 4.93 | Y | N | N | N |
| t8c120x1-92521ec-full-t3190s0/game_03 | 3190 | W | loss | 156 | checkmate | P 4.92 | Y | N | N | N |

### Proof games (the wins that raised the ladder)

| Proof | Elo | Engine | Result | Plies | Source run game | Timing | Store/replay | Skill | GM | Dev |
|---|---|---|---|---|---|---|---|---|---|---|
| beat-1600 | 1600 | W | win, mate | 37 | 7047219-full/game_09 | J 4.75 | Y | Y | Y | Y |
| beat-1700 | 1700 | W | win, mate | 61 | 7047219-full/game_29 | J 4.75 | Y | Y | Y | Y |
| beat-1800 | 1800 | B | win, mate | 46 | b46124c-full/game_28 | J 4.75 | Y | Y | Y | Y |
| beat-1900 | 1900 | B | win, mate | 40 | b46124c-full/game_12 | J 4.75 | Y | Y | Y | Y |
| beat-2000 | 2000 | B | win, mate | 62 | 55375f9-full/game_10 | J 4.75 | Y | Y | Y | Y |
| beat-2100 | 2100 | W | win, mate | 35 | 55375f9-full/game_17 | J 4.75 | Y | Y | Y | Y |
| beat-2200 | 2200 | B | win, mate | 44 | 555bcaf-full/game_10 | J 4.96 | Y | Y | Y | Y |
| beat-2300 | 2300 | W | win, mate | 37 | 555bcaf-full/game_11 | J 4.95 | Y | Y | Y | Y |
| beat-2400 | 2400 | W | win, mate | 125 | 4340e04-dirty-full-r2/game_03 | J 4.96 | Y | N | N | N |
| beat-2500 | 2500 | W | win, mate | 195 | 4340e04-dirty-full-r2/game_05 | J 4.96 | Y | N | N | N |
| beat-2600 | 2600 | W | win, mate | 71 | stack-v2-full-t2700s100/game_01 | P 4.91 | Y | N | N | N |
| beat-2700 | 2700 | B | win, mate | 190 | stack-v2-full-t2700s100/game_10 | P **5.04** | Y | N | N | N |
| beat-2800 | 2800 | W | win, mate | 207 | stack-v2-full-t2700s100/game_05 | P 4.91 | Y | N | N | N |
| beat-2900 | 2900 | W | win, mate | 103 | stack-v2-full-t3000s100/game_07 | P 4.91 | Y | N | N | N |

Sub-agent analysis for the covered runs (from transcripts on this machine): baseline `498eace` (agents at 2026-09-25 09:20 UTC), `7047219-full` (10:11), `7308d5b` + `7308d5b-s1` (10:20), `c3a8a8b` (10:30), `36032fd` + `36032fd-s1` and `3f28668` (13:33), `73fbb69` (13:38), `b46124c-full` + `03fdcdc` (14:34), `55375f9-full` + `c9cb33a` (15:27), `555bcaf-full` (16:39), `1517c7b` (2026-09-26 07:08), `579a92f` (07:40), `966bbcc` (08:16), `2002feb-full-t3190s100` (09:29). Each pair consists of two separate `Agent` tool calls with distinct role prompts (Carlsen-strength grandmaster; engine developer with the `skills/chess-engine-expert.md` persona) and separate completion notifications. The reports are game-specific (move-level citations) and end with prioritised lists of at most 7 concrete suggestions. macOS runs `63ccb08`, `97aee56` have both reports; `1a24270`, `aecf98e` have only `summary.md` (reviews of the neighbouring discarded runs `498a47b`, `dd6c58b` refer to them).

## 12. Discrepancies

1. **Analysis coverage (rule F)**: no skill output or sub-agent reports for 21 of the 41 Elo 3190 games, for any macOS 5 s run, and therefore for the proof games 2400–2900. Not retrospectively created by this audit.
2. **Engine revision of the 2400–2900 proofs**: `EngineCommit "4340e04-dirty"`; the engine source that played is not identified by a commit hash (ownership is the team's; exact revision is unproven).
3. **Timing overages (macOS)**: engine wall time 5.033 s (two moves, `4340e04-dirty-full-r2`) and 5.04 s (one move, `stack-v2-full-t2700s100/game_10` = `beat-2700.pgn`), measured around the UCI exchange. Within the harness's 0.10 s tolerance, over the rule's 5.0 s if transport overhead is not excluded. Not present in any Elo 3190 game or in the 2900 proof.
4. **Stockfish wall time** 5.007–5.068 s in every 5 s game: `Limit(time=5.0)` plus process overhead. Stockfish's own thinking time is not separately recorded.
5. **Unsaved in-flight games**: parallel runs stopped early leave numbering gaps; the harness only writes finished games. The count of abandoned games at 3190 is unknown.
6. **Partial runs without logs**: 11 run directories lack `summary.json`/`moves.jsonl`; only PGN comments carry per-move times.
7. **Games outside `main`**: 9 games (2910/3000/3090, 0/7/2) at `origin/autoresearch/sep25-erik@f848182` are not merged into `main`; local `main` is one ledger commit behind `origin/main`.
8. **Report inaccuracy**: `analysis/2002feb-full-t3190s100/engine-dev.md` states the engine is single-threaded; the source at `2002feb` sets `DEFAULT_THREADS = 2` with Lazy SMP. Does not affect compliance.
9. **README scoreboard** shows "Best FULL Elo 3190 ±681" for `sep26-robin`; that is a performance estimate from one drawn game, not a win, and could mislead a casual reader. The Elo 3190 win ratio in the GUI is the correct competition figure.
10. **Frontend build absent** in this checkout (`frontend/dist` missing), so `make app` serves the plain `app/index.html` page until `make app-build` is run. Both pages show the required statistics.

## 13. Experience assessment (bonus, observations only)

Inspected in source, not observed in a browser during this audit (no `frontend/dist` build present; no browser test was run):
- React + Vite + TypeScript app (`frontend/src`): Ladder view with hero number for the highest beaten level, per-rung W/D/L bars and proof links; Library of runs and games with ACPL/blunder stats; Replay view using lichess `chessground` with animated pieces, last-move and check highlights, blunder/mistake badges, played-vs-best arrows, eval bar and eval graph with hover scrubbing and blunder dots, depth/time/nodes per move, autoplay at 0.25×–4× that slows around big swings, flip, synthesised sounds, confetti on a win, and the grandmaster / engine-dev / run reports rendered next to the board. An opt-in 3D "Studio Set" board (React Three Fiber, HDRI lighting, CC0 models) with camera rig and capture trays.
- The 3190 scoreboard (`TopBoard`) shows win ratio, W/D/L, average moves, average moves in wins, fastest win, per-engine breakdown and a list of winning games.
- Fallback `app/index.html`: the same data on a plain board, with keyboard navigation. Observed via its JSON API **[audit test]**.
- `progress.svg` and the README scoreboard present Elo over time.

## 14. Reproduction steps for judges

1. Setup (README "Setup"): Rust toolchain, GNU make, Python 3.11+ with `python-chess`, then `python tools/stockfish.py` (downloads and checksums Stockfish 19) and `make engine`.
2. Launch the replay app: `make app` → http://127.0.0.1:8000 (plain page). For the React UI first run `make app-build` (needs Node ≥ 20), then `make app`.
3. Replay the highest verified victory: plain page → run selector `proofs` → `beat-2900.pgn`, or open `http://127.0.0.1:8000/?run=proofs&game=beat-2900.pgn`; React UI → Ladder → rung 2900 → proof, route `#/replay/proofs/beat-2900.pgn`.
4. Inspect the Elo 3190 statistics: top of the plain page ("3190 scoreboard"), or the React Ladder view / header badge; raw values at `http://127.0.0.1:8000/api/top` (expect `games 41, wins 0, draws 20, losses 21, win_ratio 0.0, avg_moves 74.8`).
5. Independent recount without the app:
   ```
   python - <<'X'
   import chess.pgn, glob, collections
   c=collections.Counter(); plies=[]
   for p in glob.glob('games/runs/*/game_*.pgn'):
       h=chess.pgn.read_headers(open(p, encoding='utf-8'))
       if h.get('StockfishElo')!='3190' or h.get('MoveTimeS')!='5': continue
       r,e=h['Result'],h['EngineColor']; plies.append(int(h['PlyCount']))
       c['d' if r=='1/2-1/2' else 'w' if (r=='1-0')==(e=='white') else 'l']+=1
   print(c, sum(c.values()), c['w']/sum(c.values()), sum(plies)/len(plies)/2)
   X
   ```
6. Verify provenance: `git tag` (beat-1600 … beat-2900), `git show e5d57de --stat` (the 2900 win's run commit), `git show 823c402` (ladder), `python tools/evidence.py` after `git fetch origin` rebuilds `evidence/README.md` with replay and Elo recomputation.
7. Verify the Stockfish configuration: `arena/util.py:280`; `git log -S'UCI_LimitStrength' -- arena/util.py` shows it has been unchanged since `498eace`.

## 15. Outstanding evidence and organizer decisions

| Item | Status | What would resolve it |
|---|---|---|
| Rule F for 21 Elo 3190 games and all macOS 5 s runs (incl. proofs 2400–2900) | UNVERIFIED | Session transcripts or committed `analysis/<run>/{summary,grandmaster,engine-dev}.md` from the macOS machine showing the analyses were made after those games. Any analysis produced now must be labelled retrospective. |
| Engine revision `4340e04-dirty` behind the 2400–2900 proofs | Organizer decision | Accept the team's attribution (`cfdaa47`/`888bd24`) or require a proof game whose `EngineCommit` is a clean hash (the 1600–2300 proofs and all 3190 games are clean). |
| Engine wall-clock 5.03–5.04 s on three macOS moves, one in `beat-2700.pgn` | Organizer decision | Rule whether transport overhead is excluded from "thinking time". No effect on the 2900 proof or on the 3190 statistics. |
| Unsaved games that were in flight when runs were stopped | Organizer decision | Rule whether abandoned, unfinished attempts must appear in the 3190 denominator; the harness cannot produce them after the fact. |
| Move-count definition for cross-team comparison | Organizer clarification | Fix plies vs full moves, book-move treatment, all games vs wins. |
| macOS development records (`/loop` use on `sep26-robin`) | UNVERIFIED, not required | Rule B is already met by the Windows records. |
