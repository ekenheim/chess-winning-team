# Chess Frontend Research

Synthesized from a three-agent parallel workflow (2D board libraries, 3D/wow factor, presentation and judging), 2026-09-25.

## Recommendation

**Stack:** Vite + React 19 + TypeScript + Tailwind v4 + shadcn/ui + Motion. Board: **chessground** (lichess) for 2D, **React Three Fiber + drei** for a 3D layer on top. Optionally wrapped in Tauri 2.

**Build order:** 2D replay screen first (satisfies the hard rule), then a 3D view driven by the same game-state store, then polish. Do design tokens (fonts, colors, spacing) on day one.

All three agents independently landed on React + Vite. The 3D agent's verdict: 3D is worth it for this prize, but as a layer, not a bet.

## 1. 2D board library

| Library | License | Status | Verdict |
|---|---|---|---|
| **chessground** (@lichess-org/chessground) | GPL-3.0+ | v9.8, maintained by lichess | Top pick. Piece slide + capture fade, SVG arrows/circles, CSS-only themes, all lichess piece sets work. `set({fen, lastMove})` animates automatically. 10 KB, no deps. |
| **react-chessboard** | MIT | v5.11, very active | Runner-up. Typed, Storybook docs, most React examples. No capture fade. Safe pick if GPL is a problem. |
| **@lichess-org/pgn-viewer** | GPL-3.0+ | Active | Complete replay widget (move list, keyboard nav, flip) built on chessground. No eval or autoplay speed control. |
| cm-chessboard | MIT | v8.14, active | Honourable mention. No TypeScript types, which hurts Claude Code. |
| chessboard.js, chessboardjsx, svelte-chess | MIT | Dormant | Avoid. |

GPL note: chessground requires publishing the app's source. Fine for a competition entry.

## 2. Piece sets, boards, sounds (licensing)

- **Permissive:** cburnett and merida (GPLv2+), celtic/fantasy/spatial (MIT), chessnut (Apache 2.0), firi/kiwen-suwi/papercut/totoy (CC BY 4.0), rhosgfx (CC0). Source: lichess lila COPYING.md.
- **Non-commercial only (CC BY-NC-SA):** staunty, maestro, tatiana, fresca, gioco, cardinal, horsey, california, etc. OK for a competition.
- **Proprietary, do not ship:** chess.com Neo/Glass.
- **Board textures:** lichess board images are AGPLv3+. Alternatively CSS gradients or CC0 textures.
- **Sounds:** lichess standard sounds are non-free. Use lichess `piano`/`sfx`/`nes` (AGPL) or Kenney.nl audio (CC0), Freesound with CC0 filter.

## 3. 3D layer

**Stack:** React Three Fiber v9 + drei + @react-three/postprocessing + GSAP or @react-spring/three. Use gltfjsx to generate typed components from GLB files. `frameloop="demand"` keeps the GPU idle between moves.

**Assets (CC0):**
- Poly Haven Chess Set: vintage marble, board + pieces, PBR maps. Download 1K-2K glTF and run `gltf-transform optimize` to land at ~3-8 MB.
- Polyy.AI chess packs on itch.io: low-poly GLB, Bauhaus/Art Deco/Sci-fi/Egyptian styles. Cheap piece-set switcher. Verify license on page.
- HDRI from Poly Haven via drei `<Environment>`; ship locally.

**Wow techniques ranked by effort/payoff:**
1. PBR materials + local HDRI + AccumulativeShadows/ContactShadows. Half a day. Biggest visual jump.
2. Move tween with lift and ease, knights get a higher arc. Half a day.
3. Capture: piece sinks or slides to a side tray that doubles as material count. Half a day.
4. Camera fly-in on load, gentle orbit while paused, snap to white/black view. Half a day.
5. Last-move and check highlight via emissive square planes. Hours.
6. 3D eval bar as glowing column, selective bloom on the winning king at mate. Cheap. Skip SSAO/DOF on integrated GPUs.
7. 2D/3D toggle and synced 2D minimap. Essential for readability.

**Reference projects (reading material, not drop-in):** tchayen "Making of 3D Chess in React", nayeemahmed84/Chess-3D (React + Three + TS + Vite + chess.js, MIT), mrabhin03/3D-Chess-Game (Three + GSAP, MIT). Read the Medium post on stable piece IDs in R3F before coding, otherwise React remounts meshes instead of animating them.

**Risks:** 3D pieces hurt tactical readability (mitigate with a ~55 degree top-down default camera and a 2D toggle). Tauri WebView2 is Chromium so WebGL2 works, but test the packaged build early. 3D adds 4-7 days on top of the 2D UI.

Rejected: Babylon.js (fewer chess examples, awkward with React UI), PlayCanvas, Spline (not viable for programmatic replay). CSS 3D only as a cheap tilt effect on the 2D board.

## 4. Replay screen (the core deliverable)

Layout: board left (square, height-bound), right column with header (players, Elo, result), move list with badges, commentary card. Full-width eval graph under the board with a ply cursor. Transport bar: step, autoplay, speed 0.25x-4x, flip. Keyboard: arrows, space, Home/End, f.

Features:
- Eval bar animated with Motion springs, mate display.
- Eval graph synced to ply. Click or hover on graph scrubs the board. Blunder dots on the graph (lichess pattern), badges on the move list and destination square (chess.com pattern, the most recognizable premium cue). Compute from eval deltas already in SQLite.
- Arrows: engine best move (green) vs played move (orange) via chessground autoShapes.
- Depth/time per move from SQLite shown in the move list.
- Sound: move/capture/check/game-end with mute toggle.

Charts: shadcn/ui Charts (Recharts 3, themed via CSS variables, dark-mode aware). Chess logic: chess.js (BSD-2) or chessops (GPL, what lichess uses).

## 5. Results and Elo presentation

- **Elo Ladder hero:** vertical ladder of Stockfish UCI_Elo rungs. Each rung shows W/D/L as a segmented bar and status (beaten / contested / locked). Highest beaten rung glows. This is the narrative.
- **Match timeline:** horizontal strip of games, color = result, height = Elo. Click to replay.
- **Engine stats:** sparklines in stat tiles (depth per move, nodes/s, time per move).
- **Hall of Fame:** card grid of wins with a mini board thumbnail of the decisive position.

## 6. Judging psychology

- Judges decide within seconds. Polish one or two features, not many.
- Most hackathon apps look like prototypes within five seconds because of inconsistent shades, padding and font sizes. A tokenized design system before the first screen fixes this. Avoid pure black; use a tinted near-black.
- **Panel of two judges:** they score against the listed criteria (board, animations, replay ease, results, wow). Hit each one explicitly.
- **Peer vote:** fellow engineers browsing quickly. They reward one memorable signature moment and a screenshot-able screen.
- Design for both: a 60-second demo path (open app, ladder, click best win, auto-replay with commentary, celebration) and one hero screenshot.

## 7. Signature feature ideas

| Feature | Effort | Wow |
|---|---|---|
| Cinematic auto-replay: pace tied to eval swings, slow-mo + zoom at critical moments, commentary caption bar, camera drift | 2-3 days | Very high |
| Engine "thinking" layer: PV arrows, live depth/nodes ticker, eval bar easing | 1-2 days | High |
| AI commentary from the analysis sub-agents, chess.com Coach style, hover a move to see the arrow | 1-2 days | High |
| "vs Stockfish" themed identity: Elo rungs as a mountain, the fish as antagonist | 1 day | High for voters |
| Shareable game card/poster via html-to-image or Satori | 0.5-1 day | Medium-high |
| Win celebration: canvas-confetti + sound | 2 hours | Medium, cheap |
| Sound design | 2-3 hours | Medium |

The rules already require two sub-agents to analyze every game. Their output is free content for the commentary feature.

## 8. Design system

- Tailwind v4 + shadcn/ui (Radix primitives, OKLCH tokens, `.dark` class). Motion (`motion/react`) for layout animations, AnimatePresence, staggered lists.
- Typography (Google Fonts): display Sora or Bricolage Grotesque, body Inter or IBM Plex Sans, mono JetBrains Mono with tabular figures for SAN and eval numbers.
- Palette: dark-first, background oklch ~0.17 slightly warm, board squares desaturated walnut/cream or slate/ivory, one accent (amber or teal), semantic green/red for badges.
- Accessibility: respect prefers-reduced-motion, 4.5:1 contrast, focus rings, ARIA move announcements, sound toggle.

## 9. Prioritized plan

| Priority | Investment | Effort |
|---|---|---|
| 1 | Design tokens, then 2D replay screen done properly (chessground + badges + synced eval graph + move list + transport) | 4-5 days |
| 2 | 3D board layer with R3F, PBR/HDRI, arcing moves, capture tray, 2D toggle | 4-7 days |
| 3 | Cinematic auto-replay with commentary + celebration | 3 days |
| 4 | Elo ladder hero + hall of fame + share card | 2-3 days |

## Key sources

- chessground: https://github.com/lichess-org/chessground
- react-chessboard: https://github.com/Clariity/react-chessboard
- pgn-viewer: https://github.com/lichess-org/pgn-viewer
- lichess asset licenses: https://github.com/lichess-org/lila/blob/master/COPYING.md
- React Three Fiber: https://github.com/pmndrs/react-three-fiber
- gltfjsx: https://github.com/pmndrs/gltfjsx
- R3F performance: https://r3f.docs.pmnd.rs/advanced/scaling-performance
- Poly Haven chess set (CC0): https://polyhaven.com/a/chess_set
- Polyy.AI chess pieces: https://polyyai.itch.io/3d-chess-pieces-pack
- Making of 3D Chess in React: https://tchayen.com/making-of-3d-chess-in-react
- Chess-3D reference: https://github.com/nayeemahmed84/Chess-3D
- R3F piece animation trick: https://medium.com/@badjessab/smooth-chess-piece-animations-in-react-three-fiber-with-unique-ids-c002e5af6b7c
- Bloom: https://react-postprocessing.docs.pmnd.rs/effects/bloom
- chess.com Game Review v2: https://www.chess.com/news/view/chesscom-launches-game-review-v2
- En Croissant (Tauri chess app): https://encroissant.org/docs/
- shadcn charts: https://ui.shadcn.com/docs/components/base/chart
- shadcn Tailwind v4: https://ui.shadcn.com/docs/tailwind-v4
- Motion: https://motion.dev/docs/react
- canvas-confetti: https://github.com/catdad/canvas-confetti
- Satori: https://github.com/vercel/satori
- Hackathon judging advice: https://medium.com/garyyauchan/ultimate-8-step-guide-to-winning-hackathons-84c9dacbe8e
- Devpost public voting: https://help.devpost.com/hc/en-us/articles/360024869792-Judging-public-voting
