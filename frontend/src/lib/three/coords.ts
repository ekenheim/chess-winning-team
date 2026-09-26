// World conventions for the 3D board. One square = 1 unit; the board is centred on the origin and never rotates.
// x = file - 3.5, z = 3.5 - (rank - 1): a1 = (-3.5, 3.5), so white sits at +z and the camera azimuth 0 looks from white's side.
import type { Kind } from "./pieceIds";

export const BOARD_Y = 0; // top of the squares

export function squareToWorld(sq: string): [x: number, z: number] {
  const file = sq.charCodeAt(0) - 97;
  const rank = parseInt(sq[1], 10);
  return [file - 3.5, 3.5 - (rank - 1)];
}

/** Tray slot for a captured piece. Pieces captured FROM white go to x=-5.4, from black to x=+5.4. */
export function trayPos(color: "w" | "b", index: number): [x: number, y: number, z: number] {
  const x = color === "w" ? -5.4 : 5.4;
  const col = index >= 12 ? 1 : 0; // a second column, pushed outward, once the first holds 12
  const i = index % 12;
  return [x + col * 0.45 * (color === "w" ? -1 : 1), BOARD_Y - 0.13, 3.6 - i * 0.62];
}

export const PIECE_VALUE: Record<Kind, number> = { q: 9, r: 5, b: 3, n: 3, p: 1, k: 0 };
