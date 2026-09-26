#!/usr/bin/env python3
"""Dump every PGN under ../games (relative to the repo root) to JSON for scripts/check-piece-ids.ts.

Each record: {"f": path, "start": start FEN, "ucis": [uci...], "fens": [FEN after each move...],
              "ep": [ply indices of en passant captures], "promo": [ply indices of promotions],
              "castle": [ply indices of castling moves]}.
Needs python-chess (the anaconda interpreter has it):
    /opt/anaconda3/bin/python frontend/scripts/dump-games.py > /tmp/games.json
"""
import json
import sys
from pathlib import Path

import chess
import chess.pgn

ROOT = Path(__file__).resolve().parents[2]
GAMES = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "games"


def dump(path):
    out = []
    with open(path, encoding="utf-8", errors="replace") as fh:
        while True:
            game = chess.pgn.read_game(fh)
            if game is None:
                break
            board = game.board()
            rec = {"f": str(path.relative_to(ROOT)), "start": board.fen(), "ucis": [], "fens": [], "ep": [], "promo": [], "castle": []}
            for i, mv in enumerate(game.mainline_moves()):
                if board.is_en_passant(mv):
                    rec["ep"].append(i)
                if mv.promotion:
                    rec["promo"].append(i)
                if board.is_castling(mv):
                    rec["castle"].append(i)
                rec["ucis"].append(mv.uci())
                board.push(mv)
                rec["fens"].append(board.fen())
            if rec["ucis"]:
                out.append(rec)
    return out


def main():
    games = []
    for p in sorted(GAMES.rglob("*.pgn")):
        games.extend(dump(p))
    json.dump(games, sys.stdout)
    print(f"dumped {len(games)} games, {sum(len(g['ucis']) for g in games)} plies", file=sys.stderr)


if __name__ == "__main__":
    main()
