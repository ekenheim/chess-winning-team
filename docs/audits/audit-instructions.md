# Audit instructions

The prompt given to an independent auditor of an entry in Regent's "The Chess Challenge – Beat Stockfish!" competition. Audit reports produced from it live next to this file as `competition-audit-<who>-<YYYY-MM-DD>-<HHMM>.md`.

## Role

Act as an independent auditor for Regent's "The Chess Challenge – Beat Stockfish!" competition.

Audit this team's application, chess player, saved games, development history, and execution records against the rules below. Inspect actual evidence; do not accept documentation claims as proof by themselves.

Validate the entry without modifying it. Do not fabricate records or retrospectively perform missing analyses and present them as original evidence. You may run safe tests and create an audit report. Ask before starting new competitive games or changing stored results.

## 1. Locate the evidence

Find and inspect:

- Application source code and launch instructions.
- The team's computerized chess player.
- Stockfish integration, version, and configuration.
- Saved games, Elo settings, results, and timing records.
- Graphical replay and competition statistics.
- Development records demonstrating `/goal`, `/loop`, or a dynamic workflow.
- Per-game skill analyses and outputs from two different sub-agents.

Identify missing evidence precisely. An inaccessible conversation or absent log does not establish that an action never happened.

## 2. Audit each requirement

Use these statuses:

| Status | Meaning |
|---|---|
| **PASS** | Direct evidence supports compliance. |
| **FAIL** | Direct evidence demonstrates a violation. |
| **UNVERIFIED** | Evidence is missing, inaccessible, or insufficient. |
| **NOT APPLICABLE** | A conditional requirement was not triggered; explain why. |

Cite files and lines, game identifiers, logs, conversation records, or observed tests for each finding.

### A. Application and computerized player

- Verify that the application plays chess using a team-developed computerized player and runs matches against Stockfish through an API or local engine.
- Explain how the player chooses moves. Identify external engines, models, libraries, and services, and distinguish the team player from its Stockfish opponent.
- Any programming language and AI, machine learning, classical algorithms, heuristics, or combinations are allowed. Do not invent restrictions on libraries or techniques. Flag ambiguous ownership or engine reuse for organizer review.

### B. Required development workflow

- Verify that at least one of `/goal`, `/loop`, or a dynamic workflow was used during development.
- Look for execution or conversation records and resulting development activity. A README mention alone is insufficient.
- For a dynamic workflow, describe the observed process. Flag any qualification that depends on an undefined interpretation for organizer review.

### C. Maximum thinking time

- Verify that both players are limited to a maximum of 5 seconds of thinking time per move.
- Inspect match execution, retries, fallbacks, external requests, and timeout handling. Confirm that the team player's limit is enforced.
- For Stockfish, inspect the effective search limit, such as `Limit(time=5.0)` or a shorter limit. Separately inspect historical timing evidence: configuration alone does not establish measured timing for every historical move.
- Distinguish thinking time from identifiable transport, scheduling, or interface overhead. Report overages and uncertainty without inventing a grace period.

### D. Stockfish Elo configuration

Verify that rated challenge games actually enable:

```
UCI_LimitStrength = True
UCI_Elo = <the recorded target rating>
```

- The competition's maximum Elo is 3190. Verify that no rating above 3190 is treated as a valid competition level.
- Check the installed Stockfish version's supported range and whether settings were accepted. Detect overwritten settings, unsupported values, silent fallbacks, and discrepancies between displayed, saved, and effective Elo.
- Neither `Skill Level`, search depth, nor a GUI rating substitutes for the required UCI settings. Do not silently substitute a supported Elo for an unsupported request.

### E. Complete game storage

- Verify that every competition game is saved with the Stockfish Elo used.
- Check that each record allows reconstruction of the starting position, moves, player colors, and result. Validate move legality and result consistency using a rules-aware chess implementation where available.
- Reconcile saved games against match logs, analyses, and execution records. Investigate missing losses, draws, failed runs, and interrupted games. Distinguish completed games from abandoned attempts and explain ambiguity.
- If no independent record exists, state that completeness cannot be fully verified.

### F. Two different sub-agents after each game

For every competition game, verify analysis by two distinct sub-agents:

1. A world-class chess expert, using someone with Magnus Carlsen's playing strength as a model.
2. A chess-engine and chess-engine-development specialist.

- Verify distinct executions or identities, assigned roles, game-specific analysis, and concrete improvement suggestions.
- Two headings in one response do not prove two sub-agents. Different underlying models are not required. The expert role is an analytical perspective, not a measured grandmaster rating.
- Suggestions need not have been implemented. This analysis requirement also applies to every Elo 3190 game.

### G. Winning result and progression

- Identify the highest configured Elo at which the team claims an actual victory, capped at 3190.
- Verify the player's identity and color, effective opponent settings, legal saved moves, result, termination evidence, and graphical replay.
- A draw is not a win. Do not automatically accept an engine crash, invalid move, or unexplained termination as a qualifying victory; flag uncertain adjudication for organizer review.
- Where Elo was raised after a win, check chronology. Do not invent mandatory starting ratings, increments, color requirements, or minimum game counts.

### H. Elo 3190 win ratio

Once the team reaches Elo 3190, verify that it measures and displays in the GUI:

> **Win ratio** = team wins against Stockfish at Elo 3190 ÷ total competition games at Elo 3190

Check all of the following:

- Only games played with effective `UCI_LimitStrength = True` and `UCI_Elo = 3190` enter this statistic.
- The numerator counts actual team victories.
- The denominator includes wins, draws, and losses at Elo 3190. Draws contribute zero wins but still count as games.
- The records cover all competition games at that level, including earlier games before the first victory at 3190. Detect selective date windows, resets, deleted results, or omitted batches.
- Each game is counted exactly once.
- Games at other Elo levels, test fixtures, and replay operations are excluded.
- Player colors and result notation are interpreted correctly.
- Interrupted games and disputed terminations are disclosed, with their treatment explained and referred for organizer review where the rules do not settle it.
- The GUI value agrees with an independent recalculation from saved records.
- Rounding is reasonable and does not misrepresent the underlying ratio.
- With no Elo 3190 games, the GUI avoids division by zero and a misleading performance claim.

For example, 6 wins, 3 draws, and 1 loss means 6 / 10 = 60%, not 6 / 7.

- Report the independently calculated wins, draws, losses, total, and win ratio. If unresolved game classifications affect the ratio, show their effect rather than silently excluding them.
- Inspect whether statistics persist across application restarts and update when results are recorded. Distinguish observed tests from source inspection.
- The GUI must display the win ratio. Showing the numerator and denominator is recommended for transparency, but do not invent it as an additional mandatory GUI requirement.
- If the team has not reached Elo 3190, mark historical measurement as NOT APPLICABLE and separately report whether the feature is implemented and testable.

### I. Average number of moves in the GUI

Verify that, upon reaching Elo 3190, the GUI also displays the average number of moves taken.

Inspect and report exactly how this average is defined:

- Does it cover all Elo 3190 games or only victories?
- Does "move" mean an individual player move (a ply), a full move consisting of White and Black turns, or the team player's moves?
- How are final partial turns, custom starting positions, and interrupted games handled?

The supplied rule does not specify these details. Do not invent a binding definition or fail an otherwise accurate implementation solely for choosing one reasonable interpretation. Flag ambiguity for organizer clarification, especially when comparing teams.

Independently reconstruct move counts from saved games and calculate the average using the application's stated definition. Verify that:

- The displayed average matches the underlying records and stated population.
- Other Elo levels and test fixtures do not contaminate the Elo 3190 statistic.
- Duplicate, missing, or selectively excluded games do not distort it.
- Zero qualifying games are handled sensibly.
- The value updates and persists consistently with the win-ratio statistic.

For judge comparison, report independently calculated average plies for both all completed Elo 3190 games and Elo 3190 victories, where available. Label these audit calculations separately from the application's metric.

Do not use average move count as a ranking criterion or tie-breaker unless the organizers explicitly establish that rule.

## 3. Produce the audit report

Write `competition-audit.md` in the project's appropriate output location and summarize it in your response.

Include:

| Section | Contents |
|---|---|
| Overall verdict | Verified compliant, confirmed rule violation, or insufficient evidence. |
| Highest verified victory | Elo, game ID, player color, result, Stockfish version, and evidence; or "No victory fully verified." |
| Elo 3190 results | Wins, draws, losses, total games, independently calculated win ratio, GUI value, and any unresolved classifications. |
| Average moves | GUI value, population, counting convention, independently calculated value, and comparison ambiguities. |
| Requirement table | Requirement, status, evidence, and finding. |
| Per-game table | Game ID, Elo, result, move count, timing evidence, storage/replay status, skill analysis, and both sub-agent analyses. |
| Discrepancies | Missing records, configuration issues, timing violations, inaccurate statistics, and inconsistent results. |
| Experience assessment | Observations relevant to the bonus. |
| Reproduction steps | How judges can launch the application, replay the highest verified victory, and inspect the Elo 3190 statistics. |
| Outstanding evidence or organizer decisions | What would resolve each failed or unverified item. |

- At Elo 3190, report win ratio as the new competitive comparison measure. Do not invent a minimum sample size, confidence threshold, or tie-breaker. Show the game count alongside the ratio in the audit report so judges can assess the evidence.
- Distinguish historical proof from tests performed during this audit. A successful test today cannot prove earlier compliance.
- Keep every conclusion factual and traceable. Do not declare full compliance while a mandatory applicable requirement remains failed or unverified.
