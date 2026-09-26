// Small helpers over the data the API already gives us (FEN per ply, evals, analysis).
import type { GameData, GameInfo, Move } from "./api";

export type Judgement = "blunder" | "mistake" | "inaccuracy" | "best" | null;

export const MATE_CP = 1000; // what a mate score maps to on the bar / graph

/** Full-strength analysis eval when we have it, else the players' own reported eval. White's view, cp. */
export function evalCp(m: Move | undefined): number | null {
  if (!m) return 0;
  if (m.analysis && m.analysis.cp != null) return m.analysis.cp;
  if (m.eval) {
    if (m.eval.mate != null) return m.eval.mate > 0 ? MATE_CP : -MATE_CP;
    return m.eval.cp;
  }
  return null;
}

export function mateIn(m: Move | undefined): number | null {
  if (!m?.eval || m.eval.mate == null) return null;
  return m.eval.mate;
}

export function judge(m: Move): Judgement {
  const a = m.analysis;
  if (!a || a.cp_loss == null) return null;
  if (a.cp_loss >= 200) return "blunder";
  if (a.cp_loss >= 100) return "mistake";
  if (a.cp_loss >= 50) return "inaccuracy";
  if (a.best && a.best === m.san && a.cp_loss === 0) return "best";
  return null;
}

export const JUDGE_GLYPH: Record<Exclude<Judgement, null>, string> = {
  blunder: "??",
  mistake: "?",
  inaccuracy: "?!",
  best: "★",
};

export const JUDGE_LABEL: Record<Exclude<Judgement, null>, string> = {
  blunder: "Blunder",
  mistake: "Mistake",
  inaccuracy: "Inaccuracy",
  best: "Best move",
};

/** The eval bar / graph clamp: ±MATE_CP mapped onto [-1, 1] with a soft knee so ±3 pawns still reads. */
export function evalToUnit(cp: number | null): number {
  if (cp == null) return 0;
  const clamped = Math.max(-MATE_CP, Math.min(MATE_CP, cp));
  // 2/pi * atan(x/300): ±100 -> ±0.2, ±300 -> ±0.5, ±1000 -> ±0.8
  return (2 / Math.PI) * Math.atan(clamped / 300);
}

export function formatEval(cp: number | null, mate: number | null): string {
  if (mate != null) return mate > 0 ? `M${mate}` : `−M${-mate}`;
  if (cp == null) return "—";
  const p = cp / 100;
  const s = Math.abs(p) >= 10 ? p.toFixed(0) : p.toFixed(1);
  return p > 0 ? `+${s}` : p < 0 ? `−${s.slice(1)}` : "0.0";
}

export function engineColor(data: Pick<GameData, "headers">): "white" | "black" {
  return data.headers.EngineColor === "black" ? "black" : "white";
}

/** Did our engine win this game? */
export function engineResult(g: { result: string; engine: string }): "win" | "loss" | "draw" | "unknown" {
  if (g.result === "1/2-1/2") return "draw";
  if (g.result === "1-0") return g.engine === "white" ? "win" : "loss";
  if (g.result === "0-1") return g.engine === "black" ? "win" : "loss";
  return "unknown";
}

export function gameResultFromData(d: GameData) {
  return engineResult({ result: d.headers.Result ?? "*", engine: engineColor(d) });
}

export function fmtNodes(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}G`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}k`;
  return String(n);
}

export function moveNumber(ply: number): string {
  return ply % 2 === 1 ? `${Math.ceil(ply / 2)}.` : `${Math.ceil(ply / 2)}…`;
}

export function shortName(name: string): string {
  return name.replace(/^chess-winning-team\s*/i, "CWT ").replace(/\s+\(.*\)$/, "");
}

export function gameTitle(g: GameInfo): string {
  return `${g.engine === "white" ? "White" : "Black"} vs Stockfish ${g.level ?? "?"}`;
}

/** Board square (0..7 file/rank from white's view) of a uci destination. */
export function squareCoords(sq: string, orientation: "white" | "black") {
  const file = sq.charCodeAt(0) - 97;
  const rank = parseInt(sq[1], 10) - 1;
  const x = orientation === "white" ? file : 7 - file;
  const y = orientation === "white" ? 7 - rank : rank;
  return { x, y };
}
