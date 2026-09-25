# autoresearch

This is an experiment to have the LLM do research to evolve a chess engine that beats Stockfish at the highest possible Elo, under the competition rule of **max 5 seconds of thinking per move** (and a draw does not count as a win).

## Setup

To set up a new experiment, work with the user to:

1. **Agree on a run tag and your name**: propose a tag based on today's date plus the user's name (e.g. `sep25-robin`). Two people work on this repo at the same time — one on **macOS**, one on **Windows**, each on their own machine — each in their own **git worktree** on their own branch, so the branch `autoresearch/<tag>` must not already exist locally or on `origin` (`git fetch origin` first) — this is a fresh run for this person.
2. **Create the worktree**: `git worktree add ../chess-<tag> -b autoresearch/<tag> main` and work inside it, then `git push -u origin autoresearch/<tag>`. The two branches live on different machines, so the shared log only exists through the remote: **push after every experiment commit** and **`git fetch origin` before reading the log**. Before starting, and whenever you are choosing a new idea, run `git fetch origin && git log --oneline --all -20` to see what the *other* branch has tried — do not repeat an experiment the other branch has already logged as `[keep]` or `[discard]`; build on it or pick something else.
3. **Read the in-scope files**: The repo is small. Read these files for full context:
   - `README.md` — repository context, competition rules, chosen engine language, Stockfish version.
   - `arena/util.py` — fixed constants, Stockfish configuration, the match harness, PGN saving, Elo estimation, **and integrity checks**. Do not modify.
   - `skills/` — sub-agent personas to use in the loop (read-only, like `arena/`):
     - `skills/chess-engine-expert.md` — an elite chess-engine developer (search, pruning, evaluation, TT, NNUE, time management, testing). Use it as the persona of the **engine-dev** agent in step 10, and spawn it whenever you want a second opinion while designing or debugging an experiment (e.g. "null-move or LMR first?", a search bug, a perft mismatch).
     - `skills/cpp-pro.md` — a senior C++ / systems-performance developer who reads C++ engines (Stockfish, Ethereal, Weiss, …) and ports their techniques into our Rust, and does low-level speed work found by `make profile`. The engine stays Rust (`make engine` runs cargo and the integrity checks forbid linking C++), so it writes Rust, never C++.
   - `engine/` — what you modify. Board representation, search, evaluation, move ordering, time management. The language is whatever the README says (it is not decided yet — if `engine/` is empty, agree on one with the user; raw speed matters). The engine is a standalone executable that speaks **UCI** on stdin/stdout, built by `make engine`. That contract is the only thing the arena knows about it, which is what keeps the rest of this file language-independent.
4. **Verify the toolchain for your OS**: the pinned Stockfish is installed (`python tools/stockfish.py` — downloads the official release for your OS into the gitignored `tools/stockfish/` and verifies checksum and version; the arena locates it via `find_stockfish()`: `STOCKFISH_PATH` env var, then `tools/stockfish/`, then `PATH`, and refuses any other version), `make` and the engine's compiler are on `PATH`, and `make bench` runs end-to-end on the current engine. On Windows, run the loop from **Git Bash** (ships with Git for Windows) so `make`, `grep`, `tail` and the redirections below behave the same as on macOS.
5. **Initialize the log**: there is no results file — **git commits are the log** (see "Logging results"). Confirm the branch is clean and `git log --oneline` shows only the setup commit(s).
6. **Confirm and go**: Confirm setup looks good.

Once you get confirmation, kick off the experimentation.

## Experimentation

Each experiment runs on the **CPU** (no GPU/CUDA assumed — one user is on an Apple Silicon Mac, the other on a Windows PC, so hardware and speed differ between the two branches). The harness plays a **fixed number of games** (`NUM_GAMES`) against **Stockfish limited to a configured Elo** — `engine.configure({"UCI_LimitStrength": True, "UCI_Elo": level})`, `engine.play(board, chess.engine.Limit(time=MOVE_TIME_S))`, exactly as the rules require — alternating colours from a fixed opening set, at `TARGET_ELO` and one `LADDER_STEP` below and above it. You launch it simply as: `make bench`.

**Two time controls**: `MOVE_TIME_S = 5.0` is the **real rule** and the only one victories count under; a full-rate run (`make bench-full`) takes ~1-2 hours because Stockfish thinks too. `FAST_MOVE_TIME_S = 0.25` (both players) is what `make bench` uses so one experiment fits in ~5 minutes. Gains at 0.25 s almost always carry to 5 s, but time management and deep-search behaviour can differ, so **after every 5 keeps, after any time-management change, and whenever a fast run wins at `TARGET_ELO`, run `make bench-full` once** and log it as `[FULL]`. If a full run loses Elo while fast runs gained, the fast runs were fooling you — reset to the last full-confirmed commit.

**What you CAN do:**
- Modify anything under `engine/` — this is the only code you edit. It must build and run on **both macOS and Windows** with `make engine`: no OS-specific headers or syscalls without a portable fallback, no hard-coded `/` vs `\` paths or executable names, and no `-march=native`-style flags that make one machine's build invalid on the other. Everything is fair game: search, pruning, extensions, move ordering, evaluation, board representation, time management, opening book or tables you generate yourself under `engine/data/`, even a rewrite in a faster language (the UCI contract makes that a legitimate bold experiment).

**What you CANNOT do:**
- Modify `arena/`, `openings.epd`, or the `Makefile`. They are read-only. They contain the match harness, Stockfish setup, PGN saving, Elo estimation (`estimate_elo`), the integrity checks (see below), and the fixed constants (`MOVE_TIME_S`, `FAST_MOVE_TIME_S`, `NUM_GAMES`, `TARGET_ELO`, `LADDER_STEP`, `ELO_KEEP_MARGIN`, `TIME_TOLERANCE_S`). The single exception: bumping `TARGET_ELO` after a proven win (loop step 10).
- Install new packages or add dependencies to the arena. The engine must build offline with `make engine`.
- Wrap, shell out to, or embed an existing chess engine (Stockfish, lc0, …) or ship weights you did not train yourself. Stockfish is the opponent and a post-game analysis tool, never part of the player.
- Delete or rewrite anything in `games/` or `analysis/`. Every game must stay saved and replayable.
- Bypass, disable, or work around the integrity checks. They are part of the ground truth.

## Integrity checks (always run)

`arena/util.py` contains integrity checks that guard the validity of every result. **These checks always run** — they are invoked automatically inside the match harness, so every `make bench` exercises them. Do not remove, weaken, or route around them.

- **`assert_time_compliance(game_log)`** — fails the run (`RuntimeError`) if any move by our engine took longer than the budget plus `TIME_TOLERANCE_S` (a small grace for pipe jitter). An Elo earned by thinking past the clock is meaningless.
- **`assert_legal_play(game_log)`** — fails the run if the engine returned an illegal move, no `bestmove`, or died mid-game.
- **`assert_self_contained(engine_dir)`** — fails the run if the engine spawns another engine process, opens a network socket, or reads files outside `engine/`.
- **`assert_games_saved(games_dir)`** — fails the run if any game is missing from `games/runs/<commit>/` or its PGN lacks the headers `WhiteElo`/`BlackElo` (Stockfish's `UCI_Elo`), `TimeControl`, `Opponent` (Stockfish version) and `EngineCommit`.

If a check fails, the run **crashes by design** — treat it like any other crash (log `[crash]`) and fix the *cause* in `engine/` (e.g. check the clock inside the search loop, not just between iterative-deepening iterations). Never "fix" it by editing `arena/` or loosening a tolerance. A run that does not pass the checks is not a valid result and must never be logged as `[keep]`.

**The goal is simple: get the highest `elo`** — the Elo estimate from the games against Stockfish at the three ladder levels, anchored to Stockfish's own scale; higher is better. Also report `wins_at_target` (the number the competition actually credits — draws do not count), score, W/D/L per level, average depth reached and nodes per second — but `elo` is the optimized objective, and a **win at `TARGET_ELO` in a full-rate run is the milestone**. Elo is noisy (`elo_err95` is a few tens of Elo), so a change only counts if `elo > best_elo + ELO_KEEP_MARGIN`; do not chase +5 Elo coin flips. A big idea landing just inside the margin may be re-run once with `SEED=1 make bench`, never more. Once `elo` is near `TARGET_ELO`, favour changes that convert draws into wins (contempt, avoiding repetition from better positions, sharper book lines).

**Aim for fundamental changes, not micro-tuning**: Your default move should be a *substantive algorithmic change* — for example: quiescence search, a transposition table, iterative deepening with aspiration windows, principal-variation search, null-move pruning, late-move reductions, check/singular extensions, futility or razoring, killer/history/counter-move ordering, a tapered (middlegame/endgame) evaluation, pawn-structure or king-safety terms, mobility, a pawn hash, bitboards replacing a mailbox board, a generated opening book, a self-trained NNUE-style evaluation, a smarter time manager (less on forced moves, more on unstable positions), etc. Be creative but pragmatic; do not limit yourself to this list. Treat small numeric tweaks (nudging piece values, a PST entry, an LMR constant, a futility margin) as lower-value: only spend 1-2 turns on them to fine-tune *after* a structural change has landed, never as the main idea. Before each experiment, briefly ask "is this a new algorithm/representation, or just a knob?" — if it's just a knob, reach for something bigger. If recent iterations have all been tweaks, deliberately make the next one a bold redesign. Remember: at a fixed time budget, **speed is depth and depth is Elo** — a 2× faster search usually beats any evaluation term, so `make profile` is a first-class source of ideas.

**Simplicity criterion**: All else being equal, simpler is better. A small improvement that adds ugly complexity is not worth it. Conversely, removing something and getting equal or better results is a great outcome — that's a simplification win. When evaluating whether to keep a change, weigh the complexity cost against the improvement magnitude. +12 Elo for 60 lines of special-case code? Probably not worth it. An improvement from deleting an evaluation term nobody could justify? Definitely keep. An improvement of ~0 but much simpler code? Keep.

**The first run**: Your very first run should always be to establish the baseline, so you will run the harness on the engine as is.

## Output format

Once the harness finishes it prints a `=== run summary ===` block like this:

```
=== run summary ===
elo:                    1412.3
elo_err95:              41.7
target_elo:             1600
wins_at_target:         0
score:                  0.438
wins/draws/losses:      5/4/7
per_level:              1500: 3/2/1  1600: 2/1/3  1700: 0/1/3
games:                  16
timeouts:               0
illegal_moves:          0
avg_move_seconds:       0.238
max_move_seconds:       0.251
avg_depth:              5.8
avg_nodes_per_sec:      41200
peak_ram_mb:            212.4
total_seconds:          318.2
move_time_s:            0.25
opponent:               Stockfish 19 (UCI_LimitStrength)
games_dir:              games/runs/<commit>/
```

`total_seconds` and `avg_nodes_per_sec` vary with whatever else the CPU is doing — compare `avg_depth` and `elo`, not raw node counts, across runs. **Only compare results produced on the same machine**: the Mac and the Windows PC run at different speeds, so the same engine reaches different depths (and Elo) on each. `best_elo` for the keep rule is always your own branch's best on your own machine; treat the other branch's numbers as evidence about *ideas*, not as a bar to beat. Put the OS/machine in every commit body (e.g. `host: macos-m3` / `host: windows-ryzen7`). Memory is reported as `peak_ram_mb` (host RSS). Every game's PGN (with the required headers) and a per-move log (time, depth, nodes, score, PV) are written to `games/runs/<commit>/` on every run. You can extract the key metrics from the log file:

```
grep "^elo:\|^wins_at_target:" run.log
```

## Logging results

There is no results file: **the git history of the branch is the experiment log**, and because both users' branches live in the same repo, `git log --oneline --all` is the shared log. Every experiment produces exactly one commit whose message carries the result, and that commit also contains the run's games (`games/runs/<commit>/`) and analysis (`analysis/<commit>/`), so the log and its evidence can never drift apart.

Commit message first line (free-form notes may follow after a blank line):

```
[<status>] elo=<elo>±<err> W/D/L=<w>/<d>/<l> @<target> wins@target=<n> — <short description>
```

1. `<status>`: `keep`, `discard`, `crash`, `FULL`, or `ladder`
2. elo and elo_err95 achieved (e.g. `1412±42`) — use `0±0` for crashes
3. W/D/L over all games, the `TARGET_ELO` used, and wins at that target
4. short text description of what this experiment tried (prefix `search:`, `eval:`, `time:`, `speed:`, `book:`, `simplify:`)

Example `git log --oneline`:

```
f6g7h8i [ladder] TARGET_ELO 1600 -> 1700 — proof games/proofs/beat-1600.pgn, tag beat-1600
e5f6g7h [FULL] elo=1631±18 W/D/L=7/5/4 @1600 wins@target=3 — confirm at 5s/move
d4e5f6g [keep] elo=1561±40 W/D/L=9/3/4 @1600 wins@target=2 — search: transposition table 64MB + PV ordering
c3d4e5f [discard] elo=1490±42 W/D/L=6/2/8 @1600 wins@target=0 — eval: mobility term (slower, depth -0.4)
b2c3d4e [crash] elo=0±0 W/D/L=0/0/0 @1600 wins@target=0 — search: null-move pruning, timed out move 34 game 7
a1b2c3d [keep] elo=1412±42 W/D/L=5/4/7 @1600 wins@target=0 — baseline
```

**Elo over time**: `python tools/progress.py` parses these result lines on every `autoresearch/*` branch (local and `origin`) and writes `progress.svg` (one dot per experiment, grey = discarded, labelled dots = kept, a running-best line per branch going up, diamonds = `[FULL]`, dashed line = `TARGET_ELO`) and the Progress scoreboard in `README.md` (best Elo, best FULL Elo, target, wins, proofs per branch). It only understands the exact first-line format above, so keep to it. The loop runs it after every experiment (step 7), starting with the baseline, so the chart has every run from the start.

Useful views: `git log --oneline --all` (both users), `git log --oneline --grep='^\[keep\]\|^\[FULL\]'` (the ascent), `git tag -l 'beat-*'` (the proofs).

## The experiment loop

The experiment runs on a dedicated branch in its own worktree (e.g. `autoresearch/sep25-robin`), driven by `/loop` as the competition requires.

LOOP FOREVER:

1. Look at the git state: the current branch/commit we're on, and `git fetch origin && git log --oneline --all -20` to see what both branches have tried.
2. Tune `engine/` with an experimental idea by directly hacking the code. `make engine` must succeed.
3. git commit (provisional message `[exp] — <description>`; it is rewritten in step 8/9) with a short body giving the hypothesis and the evidence behind it (which report, game or statistic), and **push it right away** (`git push`) so the other machine sees what is being tested before the result is in and does not start the same idea. `[exp]` commits are ignored by `tools/progress.py`; only the final result line counts
4. Run the experiment: `make bench > run.log 2>&1` (redirect everything — do NOT use tee or let output flood your context)
5. Read out the results: `grep "^elo:\|^elo_err95:\|^wins_at_target:\|^score:\|^wins/draws/losses:\|^per_level:\|^timeouts:\|^avg_depth:\|^max_move_seconds:" run.log`
6. If the grep output is empty, the run crashed. Run `tail -n 50 run.log` to read the stack trace / engine stderr and attempt a fix. If you can't get things to work after more than a few attempts, give up.
7. Record the results: `git add games analysis` and rewrite the commit message with the real result (`git commit --amend`) — the commit is the log entry. Push it after step 8/9 (`git push --force-with-lease`, needed because of the amend) so the other machine sees it. Just before pushing, **update the Elo chart and scoreboard** in the same commit: `git fetch origin && python tools/progress.py && git add progress.svg README.md && git commit --amend --no-edit` (it reads the final result line from the log, so run it only after the message is written)
8. If `elo` improved by more than `ELO_KEEP_MARGIN` (or the change is a simplification and Elo is within the margin), you "advance" the branch, keeping the git commit as `[keep]`
9. If not, undo the engine change but keep the record: `git revert --no-edit HEAD`, then `git add games analysis && git commit --amend` with the `[discard]` (or `[crash]`) message. Engine code is back where it started; the attempt, its games and its analysis stay in history
10. **Analyze the games to form the next hypothesis** (this step is mandated by the competition rules, after *every* run): run the analysis skill, `make analyze RUN=games/runs/<commit>/`, which annotates every game with full-strength Stockfish and writes `analysis/<commit>/summary.md`. Then spawn two sub-agents in parallel on the same run directory and save their reports next to it: a **grandmaster** agent (a world-class player modelled on Magnus Carlsen's strength — where did our engine misunderstand the position: opening choice, structure, king safety, piece activity, endgame technique, trades; which losses were strategic rather than tactical; prioritised chess-level suggestions → `grandmaster.md`), and an **engine-dev** agent (a chess-engine developer — give it the persona in `skills/chess-engine-expert.md` by including that file's body in its prompt — reading the PGNs *and* the per-move logs — horizon effects, missed tactics at depth N, ordering visible in node counts, unused time, time spikes; which known techniques address each; prioritised code changes for `engine/` → `engine-dev.md`). Look for patterns across the reports — losses concentrated in endgames (→ endgame eval / king activity / passed pawns), tactical blunders at low depth (→ quiescence, extensions, speed), draws by repetition from winning positions (→ contempt; draws don't count), unused time (→ time manager), time spikes near the limit (→ clock checks inside the search), a big gap between `avg_depth` and Stockfish's (→ speed, ordering, pruning). Let that evidence drive a *structural* next change, not random guessing. After a revert, ask *why* it failed: slower (check `avg_depth`) or wrong idea (depth held, play got worse)? **Milestone**: if a `[FULL]` run has `wins_at_target ≥ 1`, copy the winning PGN to `games/proofs/beat-<target>.pgn`, `git tag beat-<target>`, bump `TARGET_ELO` in a `[ladder]` commit, and check `make app` replays the proof on the graphical board.

The idea is that you are a completely autonomous researcher trying things out. If they work, keep. If they don't, discard. And you're advancing the branch so that you can iterate. If you feel like you're getting stuck in some way, you can rewind but you should probably do this very very sparingly (if ever).

**Timeout**: Each fast experiment should take ~5-6 minutes total (a fixed number of games at 0.25 s/move for both players plus overhead). If a fast run exceeds 12 minutes, kill it and treat it as a failure (discard and revert) — something is ignoring the clock. A `make bench-full` run is expected to take ~1-2 hours; kill it at 3 hours.

**Crashes**: If a run crashes (illegal move, timeout, build error, engine died, OOM, etc.), use your judgment: If it's something dumb and easy to fix (e.g. a typo, a missing clock check in a new loop), fix it and re-run. If the idea itself is fundamentally broken, just skip it, log `[crash]` in the commit, and move on.

**NEVER STOP**: Once the experiment loop has begun (after the initial setup), do NOT pause to ask the human if you should continue. Do NOT ask "should I keep going?" or "is this a good stopping point?". The human might be asleep, or gone from a computer and expects you to continue working *indefinitely* until you are manually stopped. You are autonomous. If you run out of ideas, think harder — ask a `skills/chess-engine-expert.md` agent what the next structural step for this engine should be — re-read the last five runs' sub-agent reports, re-read the lost games, check what the other worktree has kept and combine it with your own near-misses, profile the search for hot spots, try more radical redesigns of search, evaluation or representation. The loop runs until the human interrupts you, period.

As an example use case, a user might leave you running while they sleep. If each fast experiment takes you ~5 minutes then you can run approx 10/hour (analysis included), for a total of about 80 over the duration of the average human sleep, with a handful of full 5 s/move confirmations sprinkled in. The user then wakes up to a stronger engine, a git log that reads as a research diary, a folder of replayable games, and — with luck — a new `beat-<elo>` tag, all completed while they slept!
