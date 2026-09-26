// Stable piece identities across a game: React keys pieces by id, so a moved piece
// animates instead of being unmounted/remounted (the "stable piece IDs" pitfall).
export type Color = "w" | "b";
export type Kind = "p" | "n" | "b" | "r" | "q" | "k";
export interface Piece { id: string; color: Color; kind: Kind; square: string }
type Board = Map<string, Piece>; // square -> piece

const FILES = "abcdefgh";

export function parseFen(fen: string): Board {
  const board: Board = new Map();
  const rows = fen.split(" ")[0].split("/");
  const counters: Record<string, number> = {};
  rows.forEach((row, i) => {
    const rank = 8 - i;
    let file = 0;
    for (const ch of row) {
      if (ch >= "1" && ch <= "8") { file += Number(ch); continue; }
      const color: Color = ch === ch.toUpperCase() ? "w" : "b";
      const kind = ch.toLowerCase() as Kind;
      const square = FILES[file] + rank;
      const tag = color + kind;
      counters[tag] = (counters[tag] ?? 0) + 1;
      // Id is born from the START square/order, never from the current square.
      board.set(square, { id: `${tag}${counters[tag]}`, color, kind, square });
      file++;
    }
  });
  return board;
}

/** Apply one UCI move (standard chess UCI as python-chess emits it). Pure: returns a new board. */
export function applyUci(prev: Board, uci: string): Board {
  const b: Board = new Map(prev);
  const from = uci.slice(0, 2), to = uci.slice(2, 4), promo = uci[4] as Kind | undefined;
  const mover = b.get(from);
  if (!mover) return b; // defensive: unknown move leaves the board unchanged
  b.delete(from);
  // en passant: pawn changes file onto an empty square -> remove the pawn beside it
  if (mover.kind === "p" && from[0] !== to[0] && !b.has(to)) b.delete(to[0] + from[1]);
  // castling: king moves two files -> move the rook too (same id, so it animates)
  if (mover.kind === "k" && Math.abs(FILES.indexOf(from[0]) - FILES.indexOf(to[0])) === 2) {
    const kingside = to[0] === "g";
    const rFrom = (kingside ? "h" : "a") + from[1], rTo = (kingside ? "f" : "d") + from[1];
    const rook = b.get(rFrom);
    if (rook) { b.delete(rFrom); b.set(rTo, { ...rook, square: rTo }); }
  }
  // capture on `to` is implicit: overwriting drops the captured piece's id
  b.set(to, { ...mover, square: to, kind: promo ?? mover.kind });
  return b;
}

/** One frame per ply (index 0 = start). Precompute once per game; O(plies * 32). */
export function pieceFrames(startFen: string, ucis: string[]): Piece[][] {
  let board = parseFen(startFen);
  const frames: Piece[][] = [[...board.values()]];
  for (const u of ucis) { board = applyUci(board, u); frames.push([...board.values()]); }
  return frames;
}

export function placement(pieces: Piece[]): string {
  const grid: string[][] = Array.from({ length: 8 }, () => Array(8).fill(""));
  for (const p of pieces) {
    const f = FILES.indexOf(p.square[0]), r = Number(p.square[1]) - 1;
    grid[7 - r][f] = p.color === "w" ? p.kind.toUpperCase() : p.kind;
  }
  return grid.map(row => {
    let s = "", e = 0;
    for (const c of row) { if (!c) { e++; continue; } if (e) { s += e; e = 0; } s += c; }
    return s + (e ? e : "");
  }).join("/");
}
