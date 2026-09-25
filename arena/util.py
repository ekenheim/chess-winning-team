"""Match harness for the autoresearch loop. READ-ONLY (see program.md).

Fixed constants, the Stockfish opponent configuration, the game runner,
PGN + per-move logging, the Elo estimate and the integrity checks. The
engine is a black box to this file: a UCI executable at ENGINE_EXE built by
`make engine`.
"""

import json
import math
import os
import platform
import re
import socket
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path

import chess
import chess.engine
import chess.pgn

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
from stockfish import STOCKFISH_VERSION, find_stockfish  # noqa: E402

# --------------------------------------------------------------------------
# Fixed constants. Only TARGET_ELO may change, in a [ladder] commit.
# --------------------------------------------------------------------------
MOVE_TIME_S = 5.0          # the competition rule; the only time control victories count under
FAST_MOVE_TIME_S = 0.25    # what `make bench` uses so one experiment fits in ~5 minutes
NUM_GAMES = 30             # per run: 10 per ladder level = 5 openings x both colours
TARGET_ELO = 1800
LADDER_STEP = 100
ELO_KEEP_MARGIN = 30       # a change counts only if elo > best_elo + this
TIME_TOLERANCE_S = 0.10    # grace for pipe/scheduler jitter on top of the move budget
MAX_PLIES = 400            # longer games are adjudicated as draws

STOCKFISH_ELO_MIN, STOCKFISH_ELO_MAX = 1320, 3190
OPPONENT = f"Stockfish {STOCKFISH_VERSION} (UCI_LimitStrength)"

ENGINE_DIR = ROOT / "engine"
ENGINE_EXE = ENGINE_DIR / "target" / "release" / ("engine.exe" if os.name == "nt" else "engine")
OPENINGS = ROOT / "openings.epd"
GAMES_DIR = ROOT / "games"
RUNS_DIR = GAMES_DIR / "runs"
PROOFS_DIR = GAMES_DIR / "proofs"
ANALYSIS_DIR = ROOT / "analysis"

REQUIRED_PGN_HEADERS = ("WhiteElo", "BlackElo", "TimeControl", "Opponent", "EngineCommit")


# --------------------------------------------------------------------------
# Environment helpers
# --------------------------------------------------------------------------
def rel(path):
    """Path relative to the repo root as a posix string (absolute if outside it)."""
    path = Path(path)
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def git_commit():
    """Short hash of HEAD, with '-dirty' if engine/ has uncommitted changes."""
    try:
        sha = subprocess.run(["git", "rev-parse", "--short=7", "HEAD"], cwd=ROOT,
                             capture_output=True, text=True, check=True).stdout.strip()
        dirty = subprocess.run(["git", "status", "--porcelain", "--", "engine"], cwd=ROOT,
                               capture_output=True, text=True, check=True).stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return "nogit"
    return sha + ("-dirty" if dirty else "")


def host_string():
    return f"{platform.system().lower()}-{platform.machine().lower()}-{socket.gethostname()}"


def default_workers():
    """Games run in parallel; each game uses two single-threaded engines."""
    env = os.environ.get("WORKERS")
    if env:
        return max(1, int(env))
    return max(1, min(4, (os.cpu_count() or 4) // 4))


def run_dir_for(commit, full=False, seed=0):
    """games/runs/<commit>[-full][-s<seed>][-rN]/ — never reuses a non-empty dir."""
    base = commit + ("-full" if full else "") + (f"-s{seed}" if seed else "")
    path = RUNS_DIR / base
    n = 1
    while path.exists() and any(path.iterdir()):
        n += 1
        path = RUNS_DIR / f"{base}-r{n}"
    return path


# --------------------------------------------------------------------------
# Schedule
# --------------------------------------------------------------------------
@dataclass
class GameSpec:
    index: int
    level: int
    opening: str
    fen: str
    engine_white: bool


def load_openings(path=OPENINGS):
    openings = []
    for line in Path(path).read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        board, ops = chess.Board.from_epd(line)
        openings.append((str(ops.get("id", f"opening {len(openings) + 1}")), board.fen()))
    if not openings:
        raise RuntimeError(f"no openings in {path}")
    return openings


def ladder_levels(target=TARGET_ELO, step=LADDER_STEP):
    return [max(STOCKFISH_ELO_MIN, min(STOCKFISH_ELO_MAX, lv)) for lv in (target - step, target, target + step)]


def schedule(num_games=NUM_GAMES, seed=0, target=TARGET_ELO, step=LADDER_STEP):
    """Pairs of games (engine white, engine black) per opening, cycling the
    three ladder levels, so every opening is played from both sides at the
    same level. `seed` rotates which openings are used."""
    openings = load_openings()
    levels = ladder_levels(target, step)
    specs = []
    for pair in range(num_games // 2):
        level = levels[pair % len(levels)]
        name, fen = openings[(pair // len(levels) + seed * 5) % len(openings)]
        for engine_white in (True, False):
            specs.append(GameSpec(len(specs) + 1, level, name, fen, engine_white))
    return specs


# --------------------------------------------------------------------------
# One game
# --------------------------------------------------------------------------
@dataclass
class MoveRecord:
    game: int
    ply: int
    by: str            # "engine" or "stockfish"
    uci: str
    san: str
    seconds: float
    depth: int | None
    nodes: int | None
    nps: int | None
    score_cp: int | None     # from the mover's point of view
    score_mate: int | None
    pv: str


@dataclass
class GameRecord:
    spec: GameSpec
    result: str = "*"
    termination: str = ""
    plies: int = 0
    moves: list = field(default_factory=list)
    engine_alive: bool = True
    illegal_move: str | None = None
    missing_bestmove: bool = False
    child_processes: list = field(default_factory=list)
    peak_rss_mb: float = 0.0
    pgn_path: str = ""
    seconds: float = 0.0

    @property
    def engine_color(self):
        return "white" if self.spec.engine_white else "black"

    @property
    def score(self):
        """Engine's score: 1 win, 0.5 draw, 0 loss."""
        if self.result == "1/2-1/2":
            return 0.5
        if self.result == "1-0":
            return 1.0 if self.spec.engine_white else 0.0
        if self.result == "0-1":
            return 0.0 if self.spec.engine_white else 1.0
        return 0.0

    @property
    def engine_moves(self):
        return [m for m in self.moves if m.by == "engine"]


def _engine_pid(engine):
    for obj in (engine, getattr(engine, "protocol", None)):
        transport = getattr(obj, "transport", None)
        if transport is not None and hasattr(transport, "get_pid"):
            try:
                return transport.get_pid()
            except Exception:
                pass
    return None


def _peak_rss_mb(pid):
    if pid is None:
        return 0.0
    if os.name == "nt":
        import ctypes
        import ctypes.wintypes as wt

        class PMC(ctypes.Structure):
            _fields_ = [("cb", wt.DWORD), ("PageFaultCount", wt.DWORD),
                        ("PeakWorkingSetSize", ctypes.c_size_t), ("WorkingSetSize", ctypes.c_size_t),
                        ("QuotaPeakPagedPoolUsage", ctypes.c_size_t), ("QuotaPagedPoolUsage", ctypes.c_size_t),
                        ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t), ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                        ("PagefileUsage", ctypes.c_size_t), ("PeakPagefileUsage", ctypes.c_size_t)]
        try:
            k32 = ctypes.windll.kernel32
            handle = k32.OpenProcess(0x1000, False, pid)  # PROCESS_QUERY_LIMITED_INFORMATION
            if not handle:
                return 0.0
            pmc = PMC()
            pmc.cb = ctypes.sizeof(PMC)
            ok = ctypes.windll.psapi.GetProcessMemoryInfo(handle, ctypes.byref(pmc), pmc.cb)
            k32.CloseHandle(handle)
            return pmc.PeakWorkingSetSize / 2 ** 20 if ok else 0.0
        except Exception:
            return 0.0
    try:
        out = subprocess.run(["ps", "-o", "rss=", "-p", str(pid)], capture_output=True, text=True).stdout.strip()
        return int(out) / 1024 if out else 0.0
    except Exception:
        return 0.0


def _child_pids(pid):
    """Processes whose parent is `pid` (the engine must not spawn any)."""
    if pid is None:
        return []
    if os.name == "nt":
        cmd = ["powershell", "-NoProfile", "-NonInteractive", "-Command",
               f"(Get-CimInstance Win32_Process -Filter 'ParentProcessId={pid}').ProcessId"]
    else:
        cmd = ["pgrep", "-P", str(pid)]
    try:
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=30).stdout
    except Exception:
        return []
    return [int(x) for x in out.split() if x.isdigit()]


def _termination_name(board):
    outcome = board.outcome(claim_draw=True)
    return outcome.termination.name.lower().replace("_", " ") if outcome else "unknown"


def play_game(spec, move_time, out_dir, commit, sf_path=None, engine_exe=ENGINE_EXE, mode="fast"):
    """Play one game engine vs Stockfish(level) and save its PGN. Returns a GameRecord."""
    sf_path = sf_path or find_stockfish()
    rec = GameRecord(spec=spec)
    board = chess.Board(spec.fen)
    start_fen = board.fen()
    game = chess.pgn.Game()
    if start_fen != chess.STARTING_FEN:
        game.setup(board)
    t_game = time.perf_counter()

    engine = chess.engine.SimpleEngine.popen_uci(str(engine_exe), cwd=str(ENGINE_DIR))
    sf = chess.engine.SimpleEngine.popen_uci(str(sf_path))
    try:
        sf.configure({"UCI_LimitStrength": True, "UCI_Elo": spec.level, "Threads": 1, "Hash": 16})
        limit = chess.engine.Limit(time=move_time)
        token = object()
        node = game
        ply = 0
        while True:
            if board.is_game_over(claim_draw=True):
                rec.result = board.result(claim_draw=True)
                rec.termination = _termination_name(board)
                break
            if ply >= MAX_PLIES:
                rec.result = "1/2-1/2"
                rec.termination = f"adjudicated draw at {MAX_PLIES} plies"
                break
            ours = board.turn == (chess.WHITE if spec.engine_white else chess.BLACK)
            player = engine if ours else sf
            t0 = time.perf_counter()
            try:
                res = player.play(board, limit, info=chess.engine.INFO_ALL, game=token)
            except chess.engine.EngineError as exc:
                if not ours:
                    raise
                rec.engine_alive = False
                rec.termination = f"engine died: {exc}"
                rec.result = "0-1" if spec.engine_white else "1-0"
                break
            seconds = time.perf_counter() - t0
            mv = res.move
            if mv is None:
                if ours:
                    rec.missing_bestmove = True
                    rec.termination = "engine returned no bestmove"
                    rec.result = "0-1" if spec.engine_white else "1-0"
                else:
                    rec.termination = "stockfish returned no bestmove"
                    rec.result = "1-0" if spec.engine_white else "0-1"
                break
            if mv not in board.legal_moves:
                if ours:
                    rec.illegal_move = mv.uci()
                    rec.termination = f"engine played illegal move {mv.uci()}"
                    rec.result = "0-1" if spec.engine_white else "1-0"
                else:
                    rec.termination = f"stockfish played illegal move {mv.uci()}"
                    rec.result = "1-0" if spec.engine_white else "0-1"
                break
            info = res.info or {}
            score = info.get("score")
            pov = score.relative if score is not None else None
            pv = info.get("pv") or []
            try:
                pv_str = " ".join(m.uci() for m in pv[:8])
            except Exception:
                pv_str = ""
            san = board.san(mv)
            ply += 1
            rec.moves.append(MoveRecord(
                game=spec.index, ply=ply, by="engine" if ours else "stockfish", uci=mv.uci(), san=san,
                seconds=round(seconds, 4), depth=info.get("depth"), nodes=info.get("nodes"),
                nps=info.get("nps"), score_cp=pov.score() if pov is not None else None,
                score_mate=pov.mate() if pov is not None else None, pv=pv_str))
            board.push(mv)
            node = node.add_variation(mv)
            if score is not None:
                node.set_eval(score, info.get("depth"))
            tag = "E" if ours else "S"
            nodes = info.get("nodes")
            node.comment = (node.comment + " " if node.comment else "") + \
                f"{tag} d{info.get('depth', '?')} {seconds:.2f}s" + (f" {nodes / 1000:.0f}k" if nodes else "")
        rec.plies = ply
        rec.seconds = time.perf_counter() - t_game
        pid = _engine_pid(engine)
        rec.peak_rss_mb = round(_peak_rss_mb(pid), 1)
        rec.child_processes = _child_pids(pid)
    finally:
        for e in (engine, sf):
            try:
                e.quit()
            except Exception:
                try:
                    e.close()
                except Exception:
                    pass

    # PGN with the headers the integrity check requires.
    white_name = f"chess-winning-team {commit}" if spec.engine_white else f"Stockfish {STOCKFISH_VERSION}"
    black_name = f"Stockfish {STOCKFISH_VERSION}" if spec.engine_white else f"chess-winning-team {commit}"
    h = game.headers
    h["Event"] = f"autoresearch {mode} run"
    h["Site"] = host_string()
    h["Date"] = datetime.now(timezone.utc).strftime("%Y.%m.%d")
    h["Round"] = str(spec.index)
    h["White"] = white_name
    h["Black"] = black_name
    h["Result"] = rec.result
    h["WhiteElo"] = "-" if spec.engine_white else str(spec.level)
    h["BlackElo"] = str(spec.level) if spec.engine_white else "-"
    h["StockfishElo"] = str(spec.level)
    h["TimeControl"] = f"{move_time:g}s/move"
    h["MoveTimeS"] = f"{move_time:g}"
    h["Opponent"] = f"Stockfish {STOCKFISH_VERSION}"
    h["EngineCommit"] = commit
    h["EngineColor"] = rec.engine_color
    h["Opening"] = spec.opening
    h["Termination"] = rec.termination
    h["PlyCount"] = str(rec.plies)
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    pgn_path = out_dir / f"game_{spec.index:02d}.pgn"
    with open(pgn_path, "w", encoding="utf-8", newline="\n") as f:
        print(game, file=f, end="\n\n")
    rec.pgn_path = rel(pgn_path)
    return rec


# --------------------------------------------------------------------------
# Integrity checks — always run, never weakened.
# --------------------------------------------------------------------------
_FORBIDDEN_SOURCE = [
    (r"std::process", "spawning processes"),
    (r"Command::new", "spawning processes"),
    (r"std::net\b", "network sockets"),
    (r"\bTcpStream\b|\bTcpListener\b|\bUdpSocket\b", "network sockets"),
    (r"std::os::unix::net", "unix sockets"),
    (r"libc::(socket|connect|execv|fork|system)", "raw syscalls"),
    (r"#\[link\(", "linking foreign libraries"),
    (r"include_(bytes|str)!\s*\(\s*\"(\.\./\.\./|/|[A-Za-z]:)", "embedding files from outside engine/"),
]
_OUTSIDE_PATH_LITERAL = re.compile(r"\"(\.\.[/\\\\]|[A-Za-z]:[/\\\\]|/(home|Users|tmp|etc|var|usr|opt|dev|proc)[/\\\\])")


def _strip_comments(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"//[^\n]*", "", src)


def assert_self_contained(engine_dir=ENGINE_DIR):
    """The engine must be a single process that talks UCI on stdio: no child
    processes, no network, no files outside engine/. Sources (including the
    vendored crates) are scanned statically; child processes are checked at
    run time in assert_no_child_processes."""
    engine_dir = Path(engine_dir)
    problems = []
    for src_root in (engine_dir / "src", engine_dir / "vendor"):
        if not src_root.exists():
            continue
        for path in src_root.rglob("*.rs"):
            if any(part in ("tests", "benches", "examples") for part in path.relative_to(src_root).parts):
                continue
            text = _strip_comments(path.read_text(encoding="utf-8", errors="replace"))
            for pattern, why in _FORBIDDEN_SOURCE:
                if re.search(pattern, text):
                    problems.append(f"{path.relative_to(engine_dir)}: {why} ({pattern})")
            if src_root.name == "src" and _OUTSIDE_PATH_LITERAL.search(text):
                problems.append(f"{path.relative_to(engine_dir)}: path literal pointing outside engine/")
    if not ENGINE_EXE.is_file():
        problems.append(f"engine binary missing: {ENGINE_EXE} (run `make engine`)")
    if problems:
        raise RuntimeError("integrity: engine is not self-contained:\n  " + "\n  ".join(problems))


def assert_no_child_processes(game_log):
    bad = [(r.spec.index, r.child_processes) for r in game_log if r.child_processes]
    if bad:
        raise RuntimeError(f"integrity: engine spawned child processes: {bad}")


def assert_time_compliance(game_log, move_time):
    budget = move_time + TIME_TOLERANCE_S
    late = [(r.spec.index, m.ply, m.seconds) for r in game_log for m in r.engine_moves if m.seconds > budget]
    if late:
        worst = max(late, key=lambda x: x[2])
        raise RuntimeError(
            f"integrity: {len(late)} engine move(s) exceeded {move_time}s + {TIME_TOLERANCE_S}s "
            f"(worst: game {worst[0]} ply {worst[1]} took {worst[2]:.3f}s). Check the clock inside the search loop.")


def assert_legal_play(game_log):
    for r in game_log:
        if r.illegal_move:
            raise RuntimeError(f"integrity: game {r.spec.index}: engine played illegal move {r.illegal_move}")
        if r.missing_bestmove:
            raise RuntimeError(f"integrity: game {r.spec.index}: engine returned no bestmove")
        if not r.engine_alive:
            raise RuntimeError(f"integrity: game {r.spec.index}: {r.termination}")


def assert_games_saved(games_dir, expected=None):
    games_dir = Path(games_dir)
    pgns = sorted(games_dir.glob("game_*.pgn"))
    if expected is not None and len(pgns) != expected:
        raise RuntimeError(f"integrity: {games_dir} holds {len(pgns)} PGNs, expected {expected}")
    for path in pgns:
        with open(path, encoding="utf-8") as f:
            game = chess.pgn.read_game(f)
        if game is None:
            raise RuntimeError(f"integrity: {path} is not a readable PGN")
        missing = [k for k in REQUIRED_PGN_HEADERS if not game.headers.get(k)]
        if missing:
            raise RuntimeError(f"integrity: {path} lacks headers {missing}")
        if game.headers.get("Result") not in ("1-0", "0-1", "1/2-1/2"):
            raise RuntimeError(f"integrity: {path} has no result")


# --------------------------------------------------------------------------
# Elo estimate and run summary
# --------------------------------------------------------------------------
def estimate_elo(results):
    """Performance rating from (opponent_elo, score) pairs: the rating whose
    expected total score equals the actual total (maximum likelihood on the
    logistic Elo curve). Returns (elo, err95); err95 is the 95% half-width
    from the binomial variance of the games, so it is honest about how few
    games one run has."""
    results = [(float(lv), float(s)) for lv, s in results]
    n = len(results)
    if n == 0:
        return 0.0, 0.0
    total = sum(s for _, s in results)
    levels = [lv for lv, _ in results]

    def expected(r):
        return sum(1.0 / (1.0 + 10 ** ((lv - r) / 400.0)) for lv in levels)

    lo, hi = min(levels) - 1000.0, max(levels) + 1000.0
    if total <= 0:
        r = lo + 600.0
    elif total >= n:
        r = hi - 600.0
    else:
        for _ in range(200):
            mid = (lo + hi) / 2
            if expected(mid) < total:
                lo = mid
            else:
                hi = mid
        r = (lo + hi) / 2
    ps = [1.0 / (1.0 + 10 ** ((lv - r) / 400.0)) for lv in levels]
    var = sum(p * (1 - p) for p in ps)
    err = 1.96 * 400.0 / (math.log(10) * math.sqrt(var)) if var > 1e-9 else 0.0
    return round(r, 1), round(min(err, 999.0), 1)


def summarize(game_log, move_time, target, out_dir, total_seconds, seed=0):
    levels = sorted({r.spec.level for r in game_log})
    wdl = {lv: [0, 0, 0] for lv in levels}
    for r in game_log:
        wdl[r.spec.level][0 if r.score == 1 else 1 if r.score == 0.5 else 2] += 1
    wins = sum(v[0] for v in wdl.values())
    draws = sum(v[1] for v in wdl.values())
    losses = sum(v[2] for v in wdl.values())
    elo, err = estimate_elo((r.spec.level, r.score) for r in game_log)
    emoves = [m for r in game_log for m in r.engine_moves]
    secs = [m.seconds for m in emoves]
    depths = [m.depth for m in emoves if m.depth]
    node_moves = [m for m in emoves if m.nodes]
    total_nodes = sum(m.nodes for m in node_moves)
    total_node_secs = sum(m.seconds for m in node_moves)
    summary = {
        "elo": elo,
        "elo_err95": err,
        "target_elo": target,
        "wins_at_target": wdl.get(target, [0, 0, 0])[0],
        "score": round(sum(r.score for r in game_log) / max(1, len(game_log)), 3),
        "wins": wins, "draws": draws, "losses": losses,
        "per_level": {str(lv): {"wins": w, "draws": d, "losses": l} for lv, (w, d, l) in wdl.items()},
        "games": len(game_log),
        "timeouts": sum(1 for s in secs if s > move_time + TIME_TOLERANCE_S),
        "illegal_moves": sum(1 for r in game_log if r.illegal_move),
        "avg_move_seconds": round(sum(secs) / len(secs), 3) if secs else 0.0,
        "max_move_seconds": round(max(secs), 3) if secs else 0.0,
        "avg_depth": round(sum(depths) / len(depths), 1) if depths else 0.0,
        "avg_nodes_per_sec": int(total_nodes / total_node_secs) if total_node_secs else 0,
        "peak_ram_mb": round(max((r.peak_rss_mb for r in game_log), default=0.0), 1),
        "total_seconds": round(total_seconds, 1),
        "move_time_s": move_time,
        "opponent": OPPONENT,
        "games_dir": rel(out_dir) + "/",
        "host": host_string(),
        "seed": seed,
        "run": Path(out_dir).name,
        "terminations": {},
        "results": [{"game": r.spec.index, "level": r.spec.level, "engine": r.engine_color,
                     "opening": r.spec.opening, "result": r.result, "score": r.score,
                     "plies": r.plies, "termination": r.termination, "pgn": r.pgn_path}
                    for r in game_log],
    }
    for r in game_log:
        summary["terminations"][r.termination] = summary["terminations"].get(r.termination, 0) + 1
    return summary


def format_summary(s):
    per_level = "  ".join(f"{lv}: {v['wins']}/{v['draws']}/{v['losses']}" for lv, v in s["per_level"].items())
    lines = ["=== run summary ==="]
    rows = [
        ("elo", s["elo"]), ("elo_err95", s["elo_err95"]), ("target_elo", s["target_elo"]),
        ("wins_at_target", s["wins_at_target"]), ("score", s["score"]),
        ("wins/draws/losses", f"{s['wins']}/{s['draws']}/{s['losses']}"), ("per_level", per_level),
        ("games", s["games"]), ("timeouts", s["timeouts"]), ("illegal_moves", s["illegal_moves"]),
        ("avg_move_seconds", s["avg_move_seconds"]), ("max_move_seconds", s["max_move_seconds"]),
        ("avg_depth", s["avg_depth"]), ("avg_nodes_per_sec", s["avg_nodes_per_sec"]),
        ("peak_ram_mb", s["peak_ram_mb"]), ("total_seconds", s["total_seconds"]),
        ("move_time_s", s["move_time_s"]), ("opponent", s["opponent"]), ("games_dir", s["games_dir"]),
        ("host", s["host"]),
    ]
    for k, v in rows:
        lines.append(f"{k + ':':<24}{v}")
    return "\n".join(lines)


# --------------------------------------------------------------------------
# A whole run
# --------------------------------------------------------------------------
def run_match(full=False, seed=0, workers=None, num_games=NUM_GAMES, out_dir=None,
              target=TARGET_ELO, step=LADDER_STEP):
    move_time = MOVE_TIME_S if full else FAST_MOVE_TIME_S
    mode = "full" if full else "fast"
    workers = workers or default_workers()
    commit = git_commit()
    out_dir = Path(out_dir) if out_dir else run_dir_for(commit, full, seed)
    out_dir.mkdir(parents=True, exist_ok=True)
    sf_path = find_stockfish()
    assert_self_contained(ENGINE_DIR)
    specs = schedule(num_games, seed, target, step)

    print(f"=== {mode} run: {len(specs)} games at {move_time:g}s/move, levels {ladder_levels(target, step)}, "
          f"target {target}, seed {seed}, {workers} parallel games ===")
    print(f"engine: {rel(ENGINE_EXE)} @ {commit}   opponent: {OPPONENT} ({sf_path})")
    print(f"host: {host_string()}   games_dir: {rel(out_dir)}")
    sys.stdout.flush()

    start = time.time()
    records = [None] * len(specs)
    done = 0
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futures = {ex.submit(play_game, s, move_time, out_dir, commit, sf_path, ENGINE_EXE, mode): s for s in specs}
        for fut in as_completed(futures):
            rec = fut.result()
            records[rec.spec.index - 1] = rec
            done += 1
            depths = [m.depth for m in rec.engine_moves if m.depth]
            avg_d = sum(depths) / len(depths) if depths else 0
            max_t = max((m.seconds for m in rec.engine_moves), default=0)
            print(f"[{done:2d}/{len(specs)}] game {rec.spec.index:02d} @{rec.spec.level} engine={rec.engine_color:5s} "
                  f"{rec.result:7s} {rec.plies:3d} plies  depth {avg_d:4.1f}  max {max_t:.2f}s  "
                  f"{rec.termination}  ({rec.spec.opening})")
            sys.stdout.flush()
    total_seconds = time.time() - start

    with open(out_dir / "moves.jsonl", "w", encoding="utf-8", newline="\n") as f:
        for r in records:
            for m in r.moves:
                f.write(json.dumps(asdict(m)) + "\n")

    # Integrity checks: a failure crashes the run by design.
    assert_legal_play(records)
    assert_time_compliance(records, move_time)
    assert_no_child_processes(records)
    assert_games_saved(out_dir, len(specs))

    summary = summarize(records, move_time, target, out_dir, total_seconds, seed)
    text = format_summary(summary)
    with open(out_dir / "summary.json", "w", encoding="utf-8", newline="\n") as f:
        json.dump(summary, f, indent=2)
    with open(out_dir / "summary.txt", "w", encoding="utf-8", newline="\n") as f:
        f.write(text + "\n")
    print()
    print(text)
    sys.stdout.flush()
    return summary
