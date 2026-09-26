import type { Kind } from "./pieceIds";
export { reducedMotion } from "./flags";

export const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Flight time of a step move, in ms, for the autoplay speed multiplier. */
export function moveDuration(speed: number): number {
  return Math.max(160, Math.min(700, 420 / speed));
}

export const JUMP_MS = 200;
export const CAPTURE_AT = 0.7;
export const TRAY_ARC_MS = 450;
export const ROOK_DELAY_MS = 70;
export const SQUASH_MS = 110;

/** Peak lift of a move arc: knights hop over pieces, everything else glides with a lift that grows with distance. */
export function arcHeight(kind: Kind, dist: number): number {
  return kind === "n" ? 1.15 : 0.28 + 0.04 * dist;
}
