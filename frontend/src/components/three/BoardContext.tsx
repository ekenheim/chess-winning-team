// Derives everything the 3D scene needs from the replay store exactly once per render, so pieces, highlights,
// trays and the camera all agree on the shown ply and on how we got there (step / jump / snap).
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import type { GameData, Move } from "@/lib/api";
import { judge, type Judgement } from "@/lib/chess";
import { useReplay } from "@/store/replay";
import { pieceFrames, type Piece } from "@/lib/three/pieceIds";
import { PIECE_VALUE } from "@/lib/three/coords";
import { reducedMotion } from "@/lib/three/flags";

export interface Finale {
  winner: "w" | "b";
  matedKingId: string;
  winnerKingId: string;
}

export interface BoardState {
  game: GameData;
  shownPly: number;
  move?: Move;
  turn: "white" | "black";
  frames: Piece[][];
  pieces: Piece[];
  captured: { w: Piece[]; b: Piece[] };
  lastMove?: [string, string];
  checkSquare?: string;
  verdict: Judgement;
  arrowPair?: { played: [string, string]; best: [string, string] };
  orientation: "white" | "black";
  transition: { from: number; to: number; mode: "step" | "jump" | "snap" };
  finale: Finale | null;
}

const Ctx = createContext<BoardState | null>(null);

const EMPTY_GAME: GameData = { headers: {}, start_fen: "8/8/8/8/8/8/8/8 w - - 0 1", moves: [], analysis_summary: null, reports: {}, analysis_run: null };

export function BoardStateProvider({ children }: { children: ReactNode }) {
  const game = useReplay((s) => s.game) ?? EMPTY_GAME;
  const ply = useReplay((s) => s.ply);
  const hoverPly = useReplay((s) => s.hoverPly);
  const orientation = useReplay((s) => s.orientation);
  const arrows = useReplay((s) => s.arrows);

  const shownPly = Math.min(hoverPly ?? ply, game.moves.length);
  const frames = useMemo(() => pieceFrames(game.start_fen, game.moves.map((m) => m.uci)), [game]);

  // The last committed ply (not updated while the eval graph hover scrubs), read during render, written after commit.
  const last = useRef<{ game: GameData; ply: number }>({ game, ply: shownPly });
  useEffect(() => {
    if (hoverPly == null) last.current = { game, ply: shownPly };
  });

  const value = useMemo<BoardState>(() => {
    const move = shownPly > 0 ? game.moves[shownPly - 1] : undefined;
    const fen = move ? move.fen : game.start_fen;
    const turn: "white" | "black" = fen.split(" ")[1] === "b" ? "black" : "white";
    const pieces = frames[shownPly] ?? frames[0] ?? [];

    // Captured pieces: ids present at the start but gone now, with the kind they last had (a promoted pawn stays a queen).
    const alive = new Set(pieces.map((p) => p.id));
    const captured: { w: Piece[]; b: Piece[] } = { w: [], b: [] };
    for (const p0 of frames[0] ?? []) {
      if (alive.has(p0.id)) continue;
      let lastSeen: Piece = p0;
      for (let i = shownPly - 1; i >= 0; i--) {
        const hit = frames[i].find((p) => p.id === p0.id);
        if (hit) {
          lastSeen = hit;
          break;
        }
      }
      captured[p0.color].push(lastSeen);
    }
    const byValue = (a: Piece, b: Piece) => PIECE_VALUE[b.kind] - PIECE_VALUE[a.kind] || a.id.localeCompare(b.id);
    captured.w.sort(byValue);
    captured.b.sort(byValue);

    const lastMove = move ? ([move.uci.slice(0, 2), move.uci.slice(2, 4)] as [string, string]) : undefined;
    const kingColor = turn === "white" ? "w" : "b";
    const checkSquare = move?.check ? pieces.find((p) => p.kind === "k" && p.color === kingColor)?.square : undefined;
    const verdict: Judgement = move ? judge(move) : null;
    const a = move?.analysis;
    const arrowPair =
      arrows && move && a?.best_uci && a.best_uci !== move.uci && (a.cp_loss ?? 0) >= 50
        ? { played: lastMove!, best: [a.best_uci.slice(0, 2), a.best_uci.slice(2, 4)] as [string, string] }
        : undefined;

    const prev = last.current;
    const from = prev.game === game ? prev.ply : shownPly;
    const diff = Math.abs(shownPly - from);
    const mode: BoardState["transition"]["mode"] =
      prev.game !== game || hoverPly != null || reducedMotion() || diff === 0 ? "snap" : diff === 1 ? "step" : "jump";

    let finale: Finale | null = null;
    const lastSan = game.moves[game.moves.length - 1]?.san;
    if (move && shownPly === game.moves.length && lastSan?.endsWith("#")) {
      const winner: "w" | "b" = kingColor === "w" ? "b" : "w";
      const mated = pieces.find((p) => p.kind === "k" && p.color === kingColor);
      const winning = pieces.find((p) => p.kind === "k" && p.color === winner);
      if (mated && winning) finale = { winner, matedKingId: mated.id, winnerKingId: winning.id };
    }

    return {
      game,
      shownPly,
      move,
      turn,
      frames,
      pieces,
      captured,
      lastMove,
      checkSquare,
      verdict,
      arrowPair,
      orientation,
      transition: { from, to: shownPly, mode },
      finale,
    };
  }, [game, frames, shownPly, hoverPly, orientation, arrows]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBoard(): BoardState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useBoard outside BoardStateProvider");
  return v;
}
