"""Annotate every game of a run with full-strength Stockfish and write
analysis/<run>/summary.md (+ analysis.json and annotated PGNs).

    python arena/analyze.py games/runs/<commit>/        (= make analyze RUN=...)

The report is the evidence the grandmaster and engine-dev sub-agents read
(see .claude/skills/analyze-game). It is deterministic: fixed depth, one
thread per game.
"""

import json
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import chess
import chess.engine
import chess.pgn

sys.path.insert(0, str(Path(__file__).resolve().parent))
import util  # noqa: E402

ANALYSIS_DEPTH = 14
MATE_CP = 1000
BLUNDER, MISTAKE, INACCURACY = 200, 100, 50


def phase_of(board, ply):
    """opening / middlegame / endgame by ply and non-pawn material."""
    if ply <= 20:
        return "opening"
    values = {chess.KNIGHT: 3, chess.BISHOP: 3, chess.ROOK: 5, chess.QUEEN: 9}
    npm = sum(v * (len(board.pieces(p, chess.WHITE)) + len(board.pieces(p, chess.BLACK))) for p, v in values.items())
    return "endgame" if npm <= 26 else "middlegame"


def analyse_game(pgn_path, sf_path, moves_by_game):
    with open(pgn_path, encoding="utf-8") as f:
        game = chess.pgn.read_game(f)
    h = game.headers
    engine_white = h.get("EngineColor", "white") == "white"
    idx = int(h.get("Round", "0"))
    sf = chess.engine.SimpleEngine.popen_uci(sf_path)
    sf.configure({"Threads": 1, "Hash": 64})
    limit = chess.engine.Limit(depth=ANALYSIS_DEPTH)
    board = game.board()
    plies = []
    annotated = chess.pgn.Game()
    annotated.headers.update(h)
    if board.fen() != chess.STARTING_FEN:
        annotated.setup(board)
    anode = annotated
    try:
        info = sf.analyse(board, limit)
        eval_w = info["score"].white().score(mate_score=MATE_CP)
        best = info.get("pv", [None])[0]
        for ply, node in enumerate(game.mainline(), start=1):
            mv = node.move
            mover_engine = board.turn == (chess.WHITE if engine_white else chess.BLACK)
            fen_before = board.fen()
            san = board.san(mv)
            best_san = board.san(best) if best is not None and best in board.legal_moves else None
            ph = phase_of(board, ply)
            board.push(mv)
            if board.is_game_over(claim_draw=True):
                outcome = board.outcome(claim_draw=True)
                if outcome and outcome.winner is not None:
                    eval_after_w = MATE_CP if outcome.winner == chess.WHITE else -MATE_CP
                else:
                    eval_after_w = 0
                next_best = None
            else:
                info = sf.analyse(board, limit)
                eval_after_w = info["score"].white().score(mate_score=MATE_CP)
                next_best = info.get("pv", [None])[0]
            sign = 1 if not board.turn else -1  # mover was White if it is now Black's turn
            mover_before = eval_w * (1 if sign == 1 else -1)
            mover_after = eval_after_w * (1 if sign == 1 else -1)
            loss = max(0, min(mover_before - mover_after, 2 * MATE_CP))
            log = moves_by_game.get(idx, {}).get(ply, {})
            plies.append({
                "ply": ply, "san": san, "uci": mv.uci(), "by": "engine" if mover_engine else "stockfish",
                "phase": ph, "fen_before": fen_before, "eval_before_white": eval_w,
                "eval_after_white": eval_after_w, "cp_loss": loss, "best": best_san,
                "depth": log.get("depth"), "seconds": log.get("seconds"), "nodes": log.get("nodes"),
                "engine_score_cp": log.get("score_cp"),
            })
            anode = anode.add_variation(mv)
            tag = "E" if mover_engine else "S"
            comment = f"{tag} loss {loss}"
            if loss >= INACCURACY and best_san and best_san != san:
                comment += f" best {best_san}"
            if log.get("depth") is not None:
                comment += f" d{log['depth']} {log.get('seconds', 0):.2f}s"
            anode.comment = comment
            anode.set_eval(chess.engine.PovScore(chess.engine.Cp(eval_after_w), chess.WHITE), ANALYSIS_DEPTH)
            eval_w, best = eval_after_w, next_best
    finally:
        sf.quit()

    ours = [p for p in plies if p["by"] == "engine"]
    engine_evals = [(p["eval_after_white"] if engine_white else -p["eval_after_white"]) for p in plies]
    result = h.get("Result", "*")
    score = 0.5 if result == "1/2-1/2" else (1.0 if (result == "1-0") == engine_white else 0.0)
    worst = max(ours, key=lambda p: p["cp_loss"], default=None)
    return {
        "game": idx, "pgn": pgn_path.name, "level": int(h.get("StockfishElo", "0")),
        "engine_color": "white" if engine_white else "black", "result": result, "score": score,
        "termination": h.get("Termination", ""), "opening": h.get("Opening", ""), "plies": len(plies),
        "acpl": round(sum(p["cp_loss"] for p in ours) / max(1, len(ours)), 1),
        "blunders": sum(1 for p in ours if p["cp_loss"] >= BLUNDER),
        "mistakes": sum(1 for p in ours if MISTAKE <= p["cp_loss"] < BLUNDER),
        "inaccuracies": sum(1 for p in ours if INACCURACY <= p["cp_loss"] < MISTAKE),
        "worst": worst, "max_engine_eval": max(engine_evals, default=0), "min_engine_eval": min(engine_evals, default=0),
        "moves": plies, "annotated": str(annotated) + "\n\n",
    }


def load_move_log(run_dir):
    by_game = {}
    path = run_dir / "moves.jsonl"
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                m = json.loads(line)
                by_game.setdefault(m["game"], {})[m["ply"]] = m
    return by_game


def write_summary(run_dir, out_dir, games, summary):
    move_time = summary.get("move_time_s") if summary else None
    L = []
    L.append(f"# Analysis of `{run_dir.name}`\n")
    if summary:
        L.append(f"elo **{summary['elo']}** ±{summary['elo_err95']} · W/D/L {summary['wins']}/{summary['draws']}/{summary['losses']} "
                 f"· target {summary['target_elo']} · wins@target {summary['wins_at_target']} · {summary['move_time_s']}s/move "
                 f"· avg depth {summary['avg_depth']} · {summary['avg_nodes_per_sec']} nps · host {summary['host']}\n")
    L.append(f"Stockfish {util.STOCKFISH_VERSION} full strength, depth {ANALYSIS_DEPTH}, evals in centipawns from the engine's side. "
             f"Blunder ≥{BLUNDER}, mistake ≥{MISTAKE}, inaccuracy ≥{INACCURACY} cp lost.\n")

    ours = [p for g in games for p in g["moves"] if p["by"] == "engine"]
    L.append("## Engine move quality by phase\n")
    L.append("| phase | moves | ACPL | blunders | mistakes | avg depth | avg time |")
    L.append("|---|---|---|---|---|---|---|")
    for ph in ("opening", "middlegame", "endgame"):
        ms = [p for p in ours if p["phase"] == ph]
        if not ms:
            continue
        depths = [p["depth"] for p in ms if p.get("depth")]
        secs = [p["seconds"] for p in ms if p.get("seconds") is not None]
        L.append(f"| {ph} | {len(ms)} | {sum(p['cp_loss'] for p in ms) / len(ms):.1f} | "
                 f"{sum(1 for p in ms if p['cp_loss'] >= BLUNDER)} | {sum(1 for p in ms if MISTAKE <= p['cp_loss'] < BLUNDER)} | "
                 f"{(sum(depths) / len(depths)) if depths else 0:.1f} | {(sum(secs) / len(secs)) if secs else 0:.2f}s |")
    L.append("")

    losses = [g for g in games if g["score"] == 0]
    draws = [g for g in games if g["score"] == 0.5]
    wins = [g for g in games if g["score"] == 1]
    L.append("## Where results were decided\n")
    by_phase = {}
    for g in losses:
        if g["worst"]:
            by_phase[g["worst"]["phase"]] = by_phase.get(g["worst"]["phase"], 0) + 1
    L.append(f"- Losses: {len(losses)}; the worst engine blunder fell in: " +
             (", ".join(f"{k} ×{v}" for k, v in sorted(by_phase.items())) or "n/a"))
    slipped = [g for g in draws if g["max_engine_eval"] >= 150]
    L.append(f"- Draws: {len(draws)}; {len(slipped)} of them were ≥ +1.5 for the engine at some point (wins slipped: "
             + (", ".join(f"game {g['game']}" for g in slipped) or "none") + ")")
    terms = {}
    for g in draws:
        terms[g["termination"]] = terms.get(g["termination"], 0) + 1
    if terms:
        L.append("- Draw terminations: " + ", ".join(f"{k} ×{v}" for k, v in terms.items()))
    thrown = [g for g in losses if g["max_engine_eval"] >= 150]
    L.append(f"- Losses from a winning position (≥ +1.5 at some point): {len(thrown)} "
             + ("(" + ", ".join(f"game {g['game']}" for g in thrown) + ")" if thrown else ""))
    L.append(f"- Wins: {len(wins)}" + (" (" + ", ".join(f"game {g['game']} @{g['level']}" for g in wins) + ")" if wins else ""))
    L.append("")

    if move_time:
        secs = [p["seconds"] for p in ours if p.get("seconds") is not None]
        if secs:
            near = sum(1 for s in secs if s > move_time * 0.97)
            L.append("## Time and depth\n")
            L.append(f"- Engine used on average {sum(secs) / len(secs):.3f}s of {move_time}s per move "
                     f"({100 * sum(secs) / len(secs) / move_time:.0f}%); max {max(secs):.3f}s; "
                     f"{near} moves within 3% of the limit.")
            depths = [p["depth"] for p in ours if p.get("depth")]
            if depths:
                L.append(f"- Depth: avg {sum(depths) / len(depths):.1f}, min {min(depths)}, max {max(depths)}. "
                         f"Blunders at depth ≤ {sum(depths) / len(depths):.0f}: "
                         f"{sum(1 for p in ours if p['cp_loss'] >= BLUNDER and p.get('depth') and p['depth'] <= sum(depths) / len(depths))} "
                         f"of {sum(1 for p in ours if p['cp_loss'] >= BLUNDER)}.")
            L.append("")

    L.append("## Games\n")
    L.append("| # | level | engine | result | plies | termination | ACPL | blunders | worst engine move | opening |")
    L.append("|---|---|---|---|---|---|---|---|---|---|")
    for g in games:
        w = g["worst"]
        worst = f"ply {w['ply']} {w['san']} (−{w['cp_loss']}, best {w['best']}, {w['phase']})" if w else ""
        L.append(f"| {g['game']} | {g['level']} | {g['engine_color']} | {g['result']} | {g['plies']} | {g['termination']} | "
                 f"{g['acpl']} | {g['blunders']} | {worst} | {g['opening']} |")
    L.append("")

    L.append("## Worst engine moves (all games)\n")
    worst_moves = sorted(((g, p) for g in games for p in g["moves"] if p["by"] == "engine"), key=lambda gp: -gp[1]["cp_loss"])[:12]
    for g, p in worst_moves:
        if p["cp_loss"] < INACCURACY:
            break
        L.append(f"- game {g['game']} @{g['level']} ({g['engine_color']}, {g['result']}) ply {p['ply']} **{p['san']}** lost {p['cp_loss']} cp, "
                 f"best {p['best']}, {p['phase']}, depth {p.get('depth')}, {p.get('seconds')}s, engine's own eval {p.get('engine_score_cp')}  \n"
                 f"  `{p['fen_before']}`")
    L.append("")
    L.append(f"Annotated PGNs with `[%eval]` and best moves: `{util.rel(out_dir)}/game_NN.pgn`.\n")
    (out_dir / "summary.md").write_text("\n".join(L), encoding="utf-8", newline="\n")


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    run_dir = Path(sys.argv[1]).resolve()
    if not run_dir.is_dir():
        run_dir = (util.ROOT / sys.argv[1]).resolve()
    pgns = sorted(run_dir.glob("game_*.pgn"))
    if not pgns:
        sys.exit(f"no game_*.pgn in {run_dir}")
    out_dir = util.ANALYSIS_DIR / run_dir.name
    out_dir.mkdir(parents=True, exist_ok=True)
    sf_path = util.find_stockfish()
    moves_by_game = load_move_log(run_dir)
    summary = None
    if (run_dir / "summary.json").exists():
        summary = json.loads((run_dir / "summary.json").read_text(encoding="utf-8"))
    print(f"analysing {len(pgns)} games of {run_dir.name} with Stockfish depth {ANALYSIS_DEPTH} ...")
    with ThreadPoolExecutor(max_workers=util.default_workers()) as ex:
        games = list(ex.map(lambda p: analyse_game(p, sf_path, moves_by_game), pgns))
    games.sort(key=lambda g: g["game"])
    for g in games:
        (out_dir / g["pgn"]).write_text(g.pop("annotated"), encoding="utf-8", newline="\n")
    (out_dir / "analysis.json").write_text(json.dumps(games, indent=1), encoding="utf-8", newline="\n")
    write_summary(run_dir, out_dir, games, summary)
    print(f"wrote {util.rel(out_dir)}/summary.md")


if __name__ == "__main__":
    main()
