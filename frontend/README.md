# Frontend

The replay and results app the judges see. Built from `docs/frontend_research.md`: Vite + React 19 + TypeScript,
Tailwind v4, Motion, lichess **chessground** for the board. Data comes from the JSON API in `arena/app.py`, which reads
`games/`, `analysis/` and `evidence/` straight from the repo, so nothing is duplicated.

```sh
make app-build   # npm install + vite build  ->  frontend/dist
make app         # serves frontend/dist (or the old app/ page if there is no build) on http://127.0.0.1:8000
```

Development: `make app` in one terminal (the API), `cd frontend && npm run dev` in another (Vite on :5173 proxies `/api`).

## Screens

| Route | What |
|---|---|
| `#/` | **Ladder**: highest Stockfish Elo beaten as the hero number, every rung with W/D/L at 5 s (and fast runs), status, link to the proof game. |
| `#/library/<run>` | **Games**: every run (newest first, proofs pinned) and its games with result, ACPL, blunders. |
| `#/replay/<run>/<file>[/<ply>]` | **Replay**: chessground board with piece animation, last move + check, blunder/mistake badges on the square and the move list, played-vs-best arrows, spring eval bar, eval graph (hover scrubs, click jumps, blunder dots), depth per move, transport bar with 0.25×–4× autoplay whose pace slows around big swings, flip, synthesised sounds, confetti on a win, commentary card with the move's depth/time/nodes/cp-loss and the grandmaster / engine-dev / run reports. |

Keyboard: `←`/`→` step, `Home`/`End`, `space` play, `f` flip, `a` arrows, `s` sound.

## Layout

```
src/lib/api.ts        typed API client (runs, games, game, ladder)
src/lib/chess.ts      eval helpers, move judgement thresholds (≥200 blunder, ≥100 mistake, ≥50 inaccuracy)
src/lib/sound.ts      WebAudio move/capture/check/result sounds (no assets to license)
src/lib/router.ts     hash router
src/store/replay.ts   zustand store: game, ply, playing, speed, orientation… (a 3D view can read the same store)
src/components/       Board, EvalBar, EvalGraph, MoveList, Transport, Commentary, Markdown
src/views/            Ladder, Library, Replay
src/styles/index.css  design tokens (OKLCH, dark-first), chessground theme, report prose
```

## Next (from the research doc's plan)

1. 3D board layer (React Three Fiber) driven by the same store, with a 2D toggle.
2. Cinematic auto-replay: camera drift, caption bar from the analysis comments.
3. Share card (html-to-image), engine stat sparklines on the ladder, hall of fame.
