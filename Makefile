# Read-only (see program.md). Run from Git Bash on Windows, any shell on macOS.
SHELL := /bin/sh
PY ?= python
ifeq ($(OS),Windows_NT)
ENGINE_EXE := engine/target/release/engine.exe
else
ENGINE_EXE := engine/target/release/engine
endif

.PHONY: engine bench bench-full profile analyze app test clean

## Build the UCI engine (offline: dependencies are vendored under engine/vendor).
engine:
	cd engine && cargo build --release --offline

## One fast experiment: NUM_GAMES games at FAST_MOVE_TIME_S per move (~5 min).
bench: engine
	$(PY) arena/bench.py --fast

## The real rule: NUM_GAMES games at MOVE_TIME_S per move (~1 hour).
bench-full: engine
	$(PY) arena/bench.py --full

## Fixed-position speed check (nodes/s at a fixed depth) for speed experiments.
profile: engine
	./$(ENGINE_EXE) bench $(if $(DEPTH),$(DEPTH),7)

## Annotate a run with full-strength Stockfish: make analyze RUN=games/runs/<commit>/
analyze:
	$(PY) arena/analyze.py $(RUN)

## Replay any saved game on a graphical board in the browser.
app:
	$(PY) arena/app.py

test:
	cd engine && cargo test --release --offline

clean:
	cd engine && cargo clean
