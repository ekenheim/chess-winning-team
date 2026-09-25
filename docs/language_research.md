# Chess Engine Language Research

Synthesized from three parallel research agents (performance, ecosystem, development velocity), 2026-09-25.

## Recommendation

**Engine: Rust.** Match runner: Python with python-chess. Replay UI: web (TypeScript + chessground from lichess), optionally wrapped in Tauri 2.

All three agents ranked Rust first, C++ second, C# third for the engine core. They independently arrived at the same three-layer architecture.

## Why Rust for the engine

- **Top-tier strength.** Rust engines sit alongside C++ at the top of CCRL: Reckless 3644, Alexandria 3635, Coda 3633, Viridithas 3632. There is no measurable speed penalty versus C++ at the top.
- **Proven with Claude Code.** Coda (Rust, ~3600 CCRL, every line written by Claude Code) and clrsrc (Rust, self-trained NNUE) show the exact workflow we plan to use works in Rust.
- **Skip move generation risk.** cozy-chess (MIT, ~318M nps perft) is an engine-grade move generator. Move-gen bugs are the number one hobby-engine killer; reusing a proven crate removes that risk entirely.
- **NNUE pipeline is native.** Bullet, the trainer used by most top engines, is written in Rust. Every AI-built engine above ~2500 in the sources used a self-trained NNUE net.
- **No silent corruption.** The borrow checker eliminates the undefined-behavior class of bugs that turn into silent search corruption in C++, which AI agents debug slowly.
- **One-command Windows toolchain.** rustup plus VS Build Tools. `cargo build --release` in seconds, `cargo test` hosts perft suites.

## Why not the others

| Language | Verdict | Reason |
|---|---|---|
| C++ | Strong runner-up | Largest reference corpus (Stockfish, Ethereal, Berserk). Sable reached ~3200 CCRL in a week. Downsides: UB/memory bugs, Windows toolchain friction (MSVC unofficial for Stockfish-style code, use MSYS2 clang64). |
| C# | Viable third | Leorik ~3370, NoaChess ~3300 with Vector256 intrinsics. Costs ~100-200 Elo versus native. Engine-grade movegen libraries weaker. GC allocation pitfalls in hot paths. |
| Zig | Honorable mention | Pawnocchio 3642 but immature Windows tooling. |
| Java | Not recommended | Calvin 3618 blitz shows it can work, but no mature Bullet/NNUE pipeline. |
| Go | Not recommended | No SIMD intrinsics, ~300-400 Elo tax. |
| JS/TS | Not for the engine | ~700 Elo tax. Excellent for the UI. |
| Python | Not for the engine | ~600x slower than C++. Hobby ceiling 1900-2200. Ideal as the orchestrator. |

## What it takes to actually WIN against Stockfish

Stockfish UCI_Elo range is 1320-3190. Weakening works by MultiPV random move selection at a shallow depth; the search still runs at full strength, so it blunders "smart". UCI_Elo 3190 is skill level ~18.4, near full strength (~3650 CCRL single-thread).

Because draws don't count, the engine needs a real strength margin. Draw rates rise with absolute level (roughly 22% at 2000, 45% at 3000).

| Stockfish UCI_Elo | Engine strength needed for a reliable win |
|---|---|
| 2000 | ~2400+ |
| 2500 | ~2900-3000 |
| 2800 | ~3200-3300 |
| 3190 | Must outplay a ~3600 engine. Not realistic except via its random blunders. |

Reachable in 3-5 weeks of AI-assisted iteration: Rust/C++ hand-crafted eval 2600-2900, with NNUE 3100-3300. That puts UCI_Elo 2500-2800 in range with NNUE.

## Strategy

1. Use cozy-chess for move generation. Effort goes into search and eval.
2. Use Rustic (rustic-chess.org, updated May 2026), Viridithas, and Stormphrax as architectural templates, not copy-paste. Rustic's progress log: TT +42, TT move ordering +103, killers +56, PVS +55, tapered tuned eval +248.
3. Test with fastchess (Windows zip, pentanomial SPRT) on every change.
4. Once hand-crafted eval plateaus (~2600-2800), train an NNUE net with Bullet. Needs NVIDIA GPU + CUDA toolkit locally, or train in the cloud. LC0 training data is ODbL and intended for third-party use.
5. Licensing: cozy-chess, Bullet, and Disservin's chess-library are MIT. Stockfish, shakmaty, Rustic are GPL-3. Train our own net rather than copying Stockfish's; TCEC's originality rule (2 of 3 among trainer, net, engine must be original) is a good guide for "your own player".

## Architecture

```
Rust engine (UCI .exe)  <--stdin/stdout-->  Python match runner (python-chess)  <--stdin/stdout-->  Stockfish 19
                                                       |
                                                       v
                                        PGN + SQLite (Elo, per-move eval, depth, time)
                                                       |
                                                       v
                                 Web replay UI: Vite + TypeScript + chessground (+ FastAPI or Tauri 2)
```

- **Match runner in Python** matches the rules' own example nearly verbatim. Windows subprocess handling works via python-chess's event loop policy.
- **Chessground** is the lichess board: move animation, last-move and check highlights, arrows, CSS theming, 10 KB, no deps. Highest "wow" per hour for the UX bonus prize. react-chessboard (MIT) is the fallback if we use React.
- **Persistence:** PGN with custom tags (`[StockfishElo "1600"]`, `[TimePerMove "5"]`) plus SQLite sidecar for per-move stats.
- **Stockfish 19** (Sept 2026) ships universal Windows binaries that auto-select AVX2/AVX-512 at runtime.

## Windows 11 setup

- rustup-init.exe (auto-installs VS Build Tools). Build with `RUSTFLAGS=-C target-cpu=native`.
- Python 3.14, Node 24 LTS via winget.
- Stockfish: `python tools/stockfish.py` (pinned SF 19, same on macOS). No separate install needed.
- fastchess Windows release for SPRT testing.
- Bullet training: NVIDIA GPU + CUDA toolkit, or cloud.

## Key sources

- Polyglot LLM engine study: https://blog.mathieuacher.com/FromScratchChessEnginesPolyglot/
- Coda (Rust, Claude Code): https://github.com/Arzam18/coda
- Sable (C++, NNUE in a week): https://talkchess.com/viewtopic.php?t=86419
- SeaJay (C++, Claude Code): https://github.com/namebrandon/seajay-chess
- cozy-chess: https://github.com/analog-hors/cozy-chess
- Bullet trainer: https://github.com/jw1912/bullet
- Rustic book: https://rustic-chess.org/
- fastchess: https://github.com/Disservin/fastchess
- Stockfish UCI docs: https://official-stockfish.github.io/docs/stockfish-wiki/UCI-Protocol-and-Stockfish-Commands.html
- Stockfish skill-level code: https://raw.githubusercontent.com/official-stockfish/Stockfish/master/src/search.cpp
- Chessground: https://github.com/lichess-org/chessground
- python-chess engine docs: https://python-chess.readthedocs.io/en/latest/engine.html
- CCRL 40/15: https://computerchess.org.uk/ccrl/4040/rating_list_all.html
- Engine draw rates: https://beuke.org/chess-engine-draws/
