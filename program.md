# autoresearch

This is an experiment to have the LLM do research to evolve a chess engine that beats Stockfish at the highest possible Elo, under the competition rule of **max 5 seconds of thinking per move** (and a draw does not count as a win).

## Setup

To set up a new experiment, work with the user to:

1. **Agree on a run tag and your name**: propose a tag based on today's date plus the user's name (e.g. `sep25-robin`). Two people work on this repo at the same time — one on **macOS**, one on **Windows**, each on their own machine — each in their own **git worktree** on their own branch, so the branch `autoresearch/<tag>` must not already exist locally or on `origin` (`git fetch origin` first) — this is a fresh run for this person.
**Branch created before main had `tools/team.py`** (the two sep25 branches): run the first sync with main's copy of the script, `git fetch origin && git show origin/main:tools/team.py > ../team.py && python ../team.py sync`. After that the branch has `tools/team.py` itself. The first sync resets `TARGET_ELO` to main's, so Erik (whose branch proved 1600 and 1700 before the ladder moved to main) runs, right after his first sync and before any promote: `python tools/team.py ladder 0b5e357:games/proofs/beat-1600.pgn 0b5e357:games/proofs/beat-1700.pgn`. Robin records the engine already on main with `python tools/team.py promote fbc8c67`.

2. **Create the worktree**: `git fetch origin && git worktree add ../chess-<tag> -b autoresearch/<tag> origin/main` and work inside it, then `git push -u origin autoresearch/<tag>`. Starting from `origin/main` means you start from the **champion engine**, not the baseline. The two branches live on different machines, so the shared history only exists through the remote: **push every commit right away**.
   **How the two branches connect** (the rest of this file spells it out):
   - **`main` holds the champion engine.** When you keep a result, you **promote** it to main right away (`python tools/team.py promote <sha>`). At the start of every loop iteration the other branch **syncs** (`python tools/team.py sync`). When main's engine has changed, the sync adopts main's engine and the branch re-benches it on its own machine as a `[sync]` result. Engine code moves only this way. **Never merge one person's branch into the other's.**
   - **`LEDGER.md` on main is the shared history.** It lists every result from both of you: who, when, host, method, Elo, and whether that engine is in main. It also shows what is **in flight** right now. `python tools/team.py publish` rebuilds it from the git log after every result. `python tools/progress.py --print` shows it without writing anything. Do not start an idea that is in flight on the other branch or that the ledger already shows as tried, unless your hypothesis says what is different this time.
   - **Areas.** Each branch owns part of the engine, so the two of you don't build the same thing twice:
     - `sep25-robin` (macOS): **search, move ordering, pruning, time management, speed**.
     - `sep25-erik` (Windows): **evaluation**: king safety, pawn structure, mobility, tapered terms, and later tuning its weights on *our own* games' results (Texel-style). Tuning on Stockfish's evaluations or best moves stays forbidden, see "What you CANNOT do".
     - Work outside your area only for a bug fix, or when the ledger shows the owner hasn't touched an idea and you've said why in your hypothesis. Swap or change areas by editing this list on main.
   - **Updating main by hand:** use `git pull --ff-only` (or `--rebase`), never a merging `git pull`: a merge commit on main moves main's own commits off its first-parent line. Once per machine: `git config pull.ff only`.
   - Tooling, `program.md`, `arena/`, `games/proofs/` and the generated files (`README.md` scoreboard, `progress.svg`, `LEDGER.md`, `evidence/`) change **only on main**. Never edit them on your branch.
3. **Read the in-scope files**: The repo is small. Read these files for full context:
   - `README.md` — repository context, competition rules, chosen engine language, Stockfish version.
   - `LEDGER.md` — who has tried what, with what result, and what is in the champion engine on main.
   - `arena/util.py` — fixed constants, Stockfish configuration, the match harness, PGN saving, Elo estimation, **and integrity checks**. Do not modify.
   - `skills/` — sub-agent personas to use in the loop (read-only, like `arena/`):
     - `skills/chess-engine-expert.md` — an elite chess-engine developer (search, pruning, evaluation, TT, NNUE, time management, testing). Use it as the persona of the **engine-dev** agent in step 10, and spawn it whenever you want a second opinion while designing or debugging an experiment (e.g. "null-move or LMR first?", a search bug, a perft mismatch).
     - `skills/rust-perf.md` — a senior Rust / systems-performance developer: low-level speed work found by `make profile`, and turning a chosen technique into fast, simple Rust in our own code.
   - `engine/` — what you modify. Board representation, search, evaluation, move ordering, time management. The language is whatever the README says (it is not decided yet — if `engine/` is empty, agree on one with the user; raw speed matters). The engine is a standalone executable that speaks **UCI** on stdin/stdout, built by `make engine`. That contract is the only thing the arena knows about it, which is what keeps the rest of this file language-independent.
4. **Verify the toolchain for your OS**: the pinned Stockfish is installed (`python tools/stockfish.py` — downloads the official release for your OS into the gitignored `tools/stockfish/` and verifies checksum and version; the arena locates it via `find_stockfish()`: `STOCKFISH_PATH` env var, then `tools/stockfish/`, then `PATH`, and refuses any other version), `make` and the engine's compiler are on `PATH`, and `make bench` runs end-to-end on the current engine. On Windows, run the loop from **Git Bash** (ships with Git for Windows) so `make`, `grep`, `tail` and the redirections below behave the same as on macOS.
5. **Initialize the log**: there is no results file — **git commits are the log** (see "Logging results"). Confirm the branch is clean. Your first run benches the engine you branched from; log it as `[sync] … — adopt main@<sha>`. It is your starting `best_elo` on this host.
6. **Confirm and go**: Confirm setup looks good.

Once you get confirmation, kick off the experimentation.

## Experimentation

Each experiment runs on the **CPU** (no GPU/CUDA assumed — one user is on an Apple Silicon Mac, the other on a Windows PC, so hardware and speed differ between the two branches). The harness plays a **fixed number of games** (`NUM_GAMES`) against **Stockfish limited to a configured Elo** — `engine.configure({"UCI_LimitStrength": True, "UCI_Elo": level})`, `engine.play(board, chess.engine.Limit(time=MOVE_TIME_S))`, exactly as the rules require — alternating colours from a fixed opening set, at `TARGET_ELO` and one `LADDER_STEP` below and above it. You launch it simply as: `make bench`.

**Two time controls**: `MOVE_TIME_S = 5.0` is the **real rule** and the only one victories count under; a full-rate run (`make bench-full`) takes ~1-2 hours because Stockfish thinks too. `FAST_MOVE_TIME_S = 0.25` (both players) is what `make bench` uses so one experiment fits in ~5 minutes. Gains at 0.25 s almost always carry to 5 s, but time management and deep-search behaviour can differ.

**The competition is won by the highest proven rung, not by the estimated Elo**, so keep a full run going: whenever **main's champion engine** has no `[FULL]` at the current `TARGET_ELO` and the ledger shows none in flight, start one on it (see "Full runs" below). Do the same after any time-management change is promoted. Log it as `[FULL]`. A full run plays 10 games at `TARGET_ELO + LADDER_STEP` as well, and a 5 s win there proves that level too, so one run can climb two rungs. Commit a full run's games and analysis to the branch as soon as it ends, and commit those of an aborted or restarted full run too: 5 s games are the only ones the competition counts, so none may be left as untracked files. If a full run loses Elo while fast runs gained, the fast runs were fooling you. Go back to the last full-confirmed engine as a new experiment (see "Going back" below).

**What you CAN do:**
- Modify anything under `engine/` — this is the only code you edit. It must build and run on **both macOS and Windows** with `make engine`: no OS-specific headers or syscalls without a portable fallback, no hard-coded `/` vs `\` paths or executable names, and no `-march=native`-style flags that make one machine's build invalid on the other. Everything is fair game: search, pruning, extensions, move ordering, evaluation, board representation, time management, opening book or tables you generate yourself under `engine/data/`, even a rewrite in a faster language (the UCI contract makes that a legitimate bold experiment).

**What you CANNOT do:**
- Modify `arena/`, `openings.epd`, or the `Makefile`. They are read-only. They contain the match harness, Stockfish setup, PGN saving, Elo estimation (`estimate_elo`), the integrity checks (see below), and the fixed constants (`MOVE_TIME_S`, `FAST_MOVE_TIME_S`, `NUM_GAMES`, `TARGET_ELO`, `LADDER_STEP`, `ELO_KEEP_MARGIN`, `TIME_TOLERANCE_S`). The single exception: bumping `TARGET_ELO` after a proven win (loop step 10).
- Install new packages or add dependencies to the arena. The engine must build offline with `make engine`.
- Wrap, shell out to, or embed an existing chess engine (Stockfish, lc0, …) or ship weights you did not train yourself. Stockfish is the opponent and a post-game analysis tool, never part of the player.
- Copy another engine's solution. This is a hackathon and the engine must be our own work. Using published *techniques* (alpha-beta, TT, null move, LMR, NNUE, …) is fine; reading, fetching or porting another engine's source (Stockfish, Ethereal, Weiss, …), reusing its tuned constants, or training/tuning on Stockfish's evaluations or best moves is not. Implement from a technique's description and set every number by our own measurements. If our own experiments end up somewhere that resembles a strong engine, fine — but get there by evidence, not by copying.
- Delete or rewrite anything in `games/` or `analysis/`. Every game must stay saved and replayable.
- Bypass, disable, or work around the integrity checks. They are part of the ground truth.

## Integrity checks (always run)

`arena/util.py` contains integrity checks that guard the validity of every result. **These checks always run** — they are invoked automatically inside the match harness, so every `make bench` exercises them. Do not remove, weaken, or route around them.

- **`assert_time_compliance(game_log)`** — fails the run (`RuntimeError`) if any move by our engine took longer than the budget plus `TIME_TOLERANCE_S` (a small grace for pipe jitter). An Elo earned by thinking past the clock is meaningless.
- **`assert_legal_play(game_log)`** — fails the run if the engine returned an illegal move, no `bestmove`, or died mid-game.
- **`assert_self_contained(engine_dir)`** — fails the run if the engine spawns another engine process, opens a network socket, or reads files outside `engine/`.
- **`assert_games_saved(games_dir)`** — fails the run if any game is missing from `games/runs/<commit>/` or its PGN lacks the headers `WhiteElo`/`BlackElo` (Stockfish's `UCI_Elo`), `TimeControl`, `Opponent` (Stockfish version) and `EngineCommit`.

If a check fails, the run **crashes by design** — treat it like any other crash (log `[crash]`) and fix the *cause* in `engine/` (e.g. check the clock inside the search loop, not just between iterative-deepening iterations). Never "fix" it by editing `arena/` or loosening a tolerance. A run that does not pass the checks is not a valid result and must never be logged as `[keep]`.

**The goal is simple: get the highest `elo`** — the Elo estimate from the games against Stockfish at the three ladder levels, anchored to Stockfish's own scale; higher is better. Also report `wins_at_target` (the number the competition actually credits — draws do not count), score, W/D/L per level, average depth reached and nodes per second — but `elo` is the optimized objective, and a **win at `TARGET_ELO` in a full-rate run is the milestone**. Elo is noisy (`elo_err95` is a few tens of Elo), so a change only counts if `elo > best_elo + ELO_KEEP_MARGIN`, where **`best_elo` is the highest `[keep]` or `[sync]` Elo on your branch since your last `[sync]`**, all on your own machine. Do not chase +5 Elo coin flips. A big idea landing just inside the margin may be re-run once with `SEED=1 make bench`, never more. The re-run is **pooled** with the first run: the result line reports the combined games, and the result commit adds both run dirs. Once `elo` is near `TARGET_ELO`, favour changes that convert draws into wins (contempt, avoiding repetition from better positions, sharper book lines).

**Aim for fundamental changes, not micro-tuning**: Your default move should be a *substantive algorithmic change* — for example: quiescence search, a transposition table, iterative deepening with aspiration windows, principal-variation search, null-move pruning, late-move reductions, check/singular extensions, futility or razoring, killer/history/counter-move ordering, a tapered (middlegame/endgame) evaluation, pawn-structure or king-safety terms, mobility, a pawn hash, bitboards replacing a mailbox board, a generated opening book, a self-trained NNUE-style evaluation, a smarter time manager (less on forced moves, more on unstable positions), etc. Be creative but pragmatic; do not limit yourself to this list. Treat small numeric tweaks (nudging piece values, a PST entry, an LMR constant, a futility margin) as lower-value: only spend 1-2 turns on them to fine-tune *after* a structural change has landed, never as the main idea. Before each experiment, briefly ask "is this a new algorithm/representation, or just a knob?" — if it's just a knob, reach for something bigger. If recent iterations have all been tweaks, deliberately make the next one a bold redesign. Remember: at a fixed time budget, **speed is depth and depth is Elo** — a 2× faster search usually beats any evaluation term, so `make profile` is a first-class source of ideas.

**Simplicity criterion**: All else being equal, simpler is better. A small improvement that adds ugly complexity is not worth it. Conversely, removing something and getting equal or better results is a great outcome — that's a simplification win. When evaluating whether to keep a change, weigh the complexity cost against the improvement magnitude. +12 Elo for 60 lines of special-case code? Probably not worth it. An improvement from deleting an evaluation term nobody could justify? Definitely keep. An improvement of ~0 but much simpler code? Keep.

**The first run**: your very first run benches the engine as is: main's champion, logged as `[sync]` (Setup step 5).

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

`total_seconds` and `avg_nodes_per_sec` vary with whatever else the CPU is doing — compare `avg_depth` and `elo`, not raw node counts, across runs. **Only compare results produced on the same machine**: the Mac and the Windows PC run at different speeds, so the same engine reaches different depths (and Elo) on each. `best_elo` for the keep rule is always your own branch's result on your own machine (see above), which is why adopting main's engine is re-benched as a `[sync]`. Treat the other branch's numbers as evidence about *ideas*, not as a bar to beat. Put the OS/machine in every commit body (e.g. `host: macos-m3` / `host: windows-ryzen7`). Memory is reported as `peak_ram_mb` (host RSS). Every game's PGN (with the required headers) and a per-move log (time, depth, nodes, score, PV) are written to `games/runs/<commit>/` on every run. You can extract the key metrics from the log file:

```
grep "^elo:\|^wins_at_target:" run.log
```

## Logging results

There is no results file: **the git history is the experiment log**. Every experiment produces an `[exp]` commit (the engine change and its hypothesis) and then a result commit whose message carries the result and which adds the run's games (`games/runs/<exp-sha>/`), so the log and its evidence can never drift apart. The git author on each commit records who ran it. Commits are **never amended or force-pushed**, so every sha that is pushed stays valid.

| Subject | Where | What |
|---|---|---|
| `[exp] — <desc>` | your branch | Changes only `engine/`. The body starts with `Hypothesis: …` and gives the evidence for it. Push it before benching; it shows as *in flight* in the ledger. |
| `[keep\|discard\|crash\|FULL] elo=… — <desc>` | your branch | A **new commit** after the `[exp]` that adds exactly the run's dir(s), the `games_dir:` of `run.log` (plus its `-s1` re-run). Body: `host: <id>` and `exp: <exp-sha>`. |
| `[sync] elo=… — adopt main@<sha>` | your branch | Your bench of main's champion engine after `team.py sync` adopted it. Your new `best_elo`. |
| `[promote] <tag>@<sha> elo=… @<T> host=<id> — <desc>` | main | Written by `team.py promote`: main's engine becomes that result's. |
| `[ladder] TARGET_ELO a -> b — proof …` | main | Written by `team.py ladder`: proof games, the `TARGET_ELO` bump, and a `beat-<level>` tag. |
| `Ledger: rebuild from the log` | main | Written by `team.py publish`. |

Commit message first line (free-form notes may follow after a blank line):

```
[<status>] elo=<elo>±<err> W/D/L=<w>/<d>/<l> @<target> wins@target=<n> — <short description>
```

1. `<status>`: `keep`, `discard`, `crash`, `FULL`, or `sync` (`[ladder]` and `[promote]` are written on main by `tools/team.py`)
2. elo and elo_err95 achieved (e.g. `1412±42`) — use `0±0` for crashes
3. W/D/L over all games, the `TARGET_ELO` used, and wins at that target
4. short text description of what this experiment tried (prefix `search:`, `eval:`, `time:`, `speed:`, `book:`, `simplify:`, or `adopt main@<sha>` for a `[sync]`). This is the "method" column of the ledger, so name the technique.

Example `git log --first-parent --format='%h %an %s'` on a branch (oldest at the bottom):

```
b8c9d0e Robin   analysis: 4d5e6f7 — losses are king walks in the endgame
a7b8c9d Robin   Revert "[exp] — eval: mobility term"
f6a7b8c Robin   [discard] elo=1490±42 W/D/L=6/2/8 @1600 wins@target=0 — eval: mobility term (slower, depth -0.4)
e5f6a7b Robin   [exp] — eval: mobility term
d4e5f6a Robin   [keep] elo=1561±40 W/D/L=9/3/4 @1600 wins@target=2 — search: transposition table 64MB + PV ordering
c3d4e5f Robin   [exp] — search: transposition table 64MB + PV ordering
b2c3d4e Robin   [sync] elo=1412±42 W/D/L=5/4/7 @1600 wins@target=0 — adopt main@9a8b7c6
a1b2c3d Robin   Merge origin/main: adopt the champion engine main@9a8b7c6
```

and on main: `[promote] sep25-robin@d4e5f6a elo=1561±40 @1600 host=macos-m1pro — search: transposition table 64MB + PV ordering`, `[ladder] TARGET_ELO 1600 -> 1800 — proof games/proofs/beat-1700.pgn`, `Ledger: rebuild from the log`.

**The ledger, Elo over time and evidence**: `python tools/progress.py` walks each `autoresearch/*` branch along its own first-parent line, so merges never hide or re-attribute anything, plus the `[promote]`/`[ladder]` commits on main. It writes `LEDGER.md` (in flight, the champion lineage, and every result from both of you with its state: `in main`, `branch`, `dropped` or `reverted`), `progress.svg` (one team chart: every attempt by both of you in time order, the team's running best Elo, and the highest Stockfish level proven with a 5 s win, which is what the competition scores) and the README scoreboard. `python tools/evidence.py` re-verifies every claimed Elo from its games into `evidence/`. Both run **only on main**, through `python tools/team.py publish`. They only understand the exact first-line formats above, so keep to them.

Useful views: `python tools/progress.py --print` (the whole ledger), `git log --first-parent --format='%h %an %s' origin/main --grep='^\[promote\]\|^\[ladder\]'` (the champion lineage), `git tag -l 'beat-*'` (the proofs), and `evidence/README.md` on main.

## The experiment loop

The experiment runs on a dedicated branch in its own worktree (e.g. `autoresearch/sep25-robin`), driven by `/loop` as the competition requires.

LOOP FOREVER:

1. **Sync and read the ledger**: `python tools/team.py sync`, then `python tools/progress.py --print`.
   - If sync says **program.md changed**, re-read it now.
   - If sync says **ADOPTED**, main has a new champion engine or a new `TARGET_ELO`, and your engine has been replaced by main's. Run `make bench`, log the result as `[sync] elo=… — adopt main@<sha>` (steps 4-7, with no keep/discard decision), and use it as your new `best_elo`. Kept ideas of yours that are not in main now show as `dropped` in the ledger. Re-apply them as your next experiments and bench each one on top of the champion. The idea's code is its `[exp]` commit, named in the result's body (`git show -s --format=%B <result> | grep ^exp:`): `git cherry-pick --no-commit <exp-sha>` (an `[exp]` only touches `engine/`, so this usually applies cleanly). For an old-style result with no `exp:` line: `git diff <result>^1 <result> -- engine | git apply --3way`.
   - In the ledger, don't pick an idea that is **in flight** on the other branch, or one it already shows as kept or discarded, unless your hypothesis says what is different now. A result from the other branch that is `branch`-only (kept but not yet promoted) is theirs to promote. Don't copy it.
2. Tune `engine/` with an experimental idea by directly hacking the code. `make engine` must succeed.
3. Commit **only `engine/`** as `[exp] — <description>`, with a body starting `Hypothesis:` that gives the evidence behind it (which report, game or statistic). **Push it right away** (`git push`) so the ledger shows it in flight on the other machine. `[exp]` commits are never amended.
4. **Gauntlet first, then Stockfish.** 30 Stockfish games can't resolve much under ~150 Elo, but a few hundred fast self-play games can. Run `python tools/gauntlet.py > gauntlet.log 2>&1` (the engine you just built against the engine of your last `[keep]`/`[sync]`, 200 games at 0.05 s/move, about a minute), then `grep "^gauntlet_elo:\|^wins/draws\|^verdict:" gauntlet.log`.
   - `verdict: fail` (clearly worse than its predecessor): skip Stockfish. Log `[discard] — <desc> (gauntlet <elo>±<err> vs <base-sha>, <n> games)` (no `elo=` part: it isn't a Stockfish result) with `git add games/gauntlet/<exp-sha>/` and `exp: <exp-sha>` in the body, revert as in step 9, and go back to step 1. No Stockfish games means no step-10 analysis for this one.
   - `pass` or `unclear`: run the Stockfish bench, `make bench > run.log 2>&1` (redirect everything — do NOT use tee or let output flood your context). Mention the gauntlet line in the result commit's body, and add `games/gauntlet/<exp-sha>/` to the result commit in step 7.
   - Pure speed or time-management changes can mislead a gauntlet at 0.05 s/move. For those, go straight to the bench.
5. Read out the results: `grep "^games_dir:\|^elo:\|^elo_err95:\|^wins_at_target:\|^score:\|^wins/draws/losses:\|^per_level:\|^timeouts:\|^avg_depth:\|^max_move_seconds:" run.log`
6. If the grep output is empty, the run crashed. Run `tail -n 50 run.log` to read the stack trace / engine stderr. Log the crashed run as `[crash]` (step 7, with its partial run dir). Then commit a fix as a new `[exp] — fix: …`, push it, and bench again. Never bench with uncommitted `engine/` changes: a `-dirty` run dir is not a valid result. If you can't get it to work after a few attempts, revert (step 9) and move on.
7. **Record the result as a new commit** (no amend, no force-push): decide the status (step 8/9), then `git add <games_dir> && git commit -m "[<status>] elo=… — <desc>" -m "host: <id>" -m "exp: <exp-sha>" && git push`. `<games_dir>` is the `games_dir:` line of `run.log`. For a pooled SEED=1 re-run, add both dirs and take the result numbers from `python tools/pool.py <dir> <dir>-s1`, which computes them exactly as evidence re-checks them. Never `git add games` wholesale: a leftover partial dir would be pooled into your claim. Do not run `tools/progress.py` without `--print` on your branch (it rewrites the generated files), and never commit `README.md`, `progress.svg` or `LEDGER.md` there.
   - **After a `[keep]` (or a `[FULL]` of an engine not yet on main), promote it right away**: `python tools/team.py promote <result-sha>`. Main's engine becomes yours, and the other branch adopts it at its next sync. If promote refuses because the other machine promoted first, your keep was measured against an old champion: run step 1 (sync, re-bench), then re-apply the idea as your next experiment.
   - **After every result** (including `[discard]`, `[crash]`, `[FULL]` and `[sync]`), run `python tools/team.py publish`. It rebuilds `LEDGER.md`, the scoreboard, the chart and `evidence/` on main, and retries if the other machine pushed first. If it reports an UNVERIFIED claim (games missing, the Elo doesn't recompute, a move over the budget, or a proof that isn't a 5 s win), fix the record before the next experiment.
8. If `elo` improved by more than `ELO_KEEP_MARGIN` over `best_elo` (or the change is a simplification and Elo is within the margin), the status is `[keep]`: the branch advances.
9. If not, the status is `[discard]` (or `[crash]`). After the result commit, undo the engine change: `git revert --no-edit <exp-sha> && git push`. The `[exp]` commit touched only `engine/`, so the run's games and analysis stay on the branch.
10. **Analyze the games to form the next hypothesis** (this step is mandated by the competition rules, after *every* Stockfish run): run the analysis skill, `make analyze RUN=<games_dir>`, which annotates every game with full-strength Stockfish and writes `analysis/<run>/summary.md`. After a revert, the engine that played is no longer in `engine/`, so tell the engine-dev agent to read it with `git show <exp-sha>:engine/src/<file>`. Then spawn two sub-agents in parallel on the same run directory and save their reports next to it: a **grandmaster** agent (a world-class player modelled on Magnus Carlsen's strength — where did our engine misunderstand the position: opening choice, structure, king safety, piece activity, endgame technique, trades; which losses were strategic rather than tactical; prioritised chess-level suggestions → `grandmaster.md`), and an **engine-dev** agent (a chess-engine developer — give it the persona in `skills/chess-engine-expert.md` by including that file's body in its prompt — reading the PGNs *and* the per-move logs — horizon effects, missed tactics at depth N, ordering visible in node counts, unused time, time spikes; which known techniques address each; prioritised code changes for `engine/` → `engine-dev.md`). Commit the analysis on its own (`git add analysis/<run>/ && git commit -m "analysis: <run> — <one-line takeaway>" && git push`). Look for patterns across the reports — losses concentrated in endgames (→ endgame eval / king activity / passed pawns), tactical blunders at low depth (→ quiescence, extensions, speed), draws by repetition from winning positions (→ contempt; draws don't count), unused time (→ time manager), time spikes near the limit (→ clock checks inside the search), `avg_depth` stalling across runs or tactics missed by one ply (→ speed, ordering, pruning). Let that evidence drive a *structural* next change, not random guessing. After a revert, ask *why* it failed: slower (check `avg_depth`) or wrong idea (depth held, play got worse)? **Milestone** (full runs confirm main's champion, so the proof's engine is already on main; promote any pending `[keep]` *before* laddering): if a `[FULL]` run won any game at `TARGET_ELO` or above, run `python tools/team.py ladder <full-result-sha>:games/runs/<run>/<game>.pgn [...]` with one winning game per level. It checks that each is a 5 s win for our engine, copies it to `games/proofs/beat-<level>.pgn` on main, sets `TARGET_ELO` to the highest level beaten + `LADDER_STEP` in a `[ladder]` commit, tags `beat-<level>` and publishes. Both branches pick up the new target at their next sync. Check that `make app` replays the proof on the graphical board.

**Full runs** (`make bench-full`, ~1-2 h) confirm **main's champion engine**. Run them in a separate detached worktree, `git worktree add --detach ../chess-<tag>-full origin/main`, so your branch worktree can keep rebuilding the engine (symlink or copy `tools/stockfish/` into it). First announce the run: `git commit --allow-empty -m "[exp] — full: confirm main@<sha>" -m "Hypothesis: …" && git push` on your branch. It shows as in flight in the ledger, so the other machine doesn't start the same run. When it ends, copy `games/runs/<sha>-full/` into your branch worktree and commit it as `[FULL] elo=… — confirm main@<sha> (<desc>)` with `host:`, `engine: <sha>` and `exp: <announce-sha>` in the body. Then publish, and ladder any win at `TARGET_ELO` or above.

The idea is that you are a completely autonomous researcher trying things out. If they work, keep. If they don't, discard. And you're advancing the branch so that you can iterate. **Going back**: if you are stuck, you can return to an earlier engine, but do it very sparingly and never with reset or force-push. Make it a new experiment: `git checkout <sha> -- engine && git commit -m "[exp] — simplify: back to the engine of <sha>"`, then bench it.

**Timeout**: Each fast experiment should take ~5-6 minutes total (a fixed number of games at 0.25 s/move for both players plus overhead). If a fast run exceeds 12 minutes, kill it and treat it as a failure (discard and revert) — something is ignoring the clock. A `make bench-full` run is expected to take ~1-2 hours; kill it at 3 hours.

**Crashes**: If a run crashes (illegal move, timeout, build error, engine died, OOM, etc.), use your judgment: If it's something dumb and easy to fix (e.g. a typo, a missing clock check in a new loop), log the `[crash]`, commit the fix as a new `[exp] — fix: …` and re-run (step 6). If the idea itself is fundamentally broken, log `[crash]`, revert it (step 9) and move on.

**NEVER STOP**: Once the experiment loop has begun (after the initial setup), do NOT pause to ask the human if you should continue. Do NOT ask "should I keep going?" or "is this a good stopping point?". The human might be asleep, or gone from a computer and expects you to continue working *indefinitely* until you are manually stopped. You are autonomous. If you run out of ideas, think harder — ask a `skills/chess-engine-expert.md` agent what the next structural step for this engine should be — re-read the last five runs' sub-agent reports, re-read the lost games, check the ledger for what the other branch has kept and promoted, and combine the champion with your own `dropped` ideas and near-misses, profile the search for hot spots, try more radical redesigns of search, evaluation or representation. The loop runs until the human interrupts you, period.

As an example use case, a user might leave you running while they sleep. If each fast experiment takes you ~5 minutes then you can run approx 10/hour (analysis included), for a total of about 80 over the duration of the average human sleep, with a handful of full 5 s/move confirmations sprinkled in. The user then wakes up to a stronger engine, a git log that reads as a research diary, a folder of replayable games, and — with luck — a new `beat-<elo>` tag, all completed while they slept!
