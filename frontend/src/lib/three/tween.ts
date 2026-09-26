import type { Kind } from "./pieceIds";
export { reducedMotion } from "./flags";

export const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/** Flight time of a step move, in ms, for the autoplay speed multiplier. */
export function moveDuration(speed: number): number {
  return Math.max(160, Math.min(700, 420 / speed));
}

export const JUMP_MS = 200;
export const CAPTURE_AT = 0.7;
export const TRAY_ARC_MS = 450;
export const ROOK_DELAY_MS = 70;
export const SQUASH_MS = 110;
/** The captured piece's pop off its square before it arcs into the tray. */
export const POP_MS = 90;
export const POP_H = 0.4;
export const TRAY_H = 1.5;
export const TRAY_SCALE = 0.62;
/** Mated king topple: fall time and resting angle (radians about the base). */
export const TOPPLE_MS = 900;
export const TOPPLE_ANGLE = 1.35;

/** Peak lift of a move arc: knights hop over pieces, everything else glides with a lift that grows with distance. */
export function arcHeight(kind: Kind, dist: number): number {
  return kind === "n" ? 1.15 : 0.28 + 0.04 * dist;
}

/** Inverse of easeInOutCubic: the normalised time at which the eased progress reaches `e` (0..1). */
export function easeInOutCubicInverse(e: number): number {
  if (e <= 0) return 0;
  if (e >= 1) return 1;
  return e < 0.5 ? Math.cbrt(e / 4) : 1 - Math.cbrt(2 * (1 - e)) / 2;
}

/**
 * Topple curve (0..1 -> 0..~1): the king falls with gravity (ease-in) for the first 55 %, rebounds 12 % off the
 * board and settles with a damped wobble, ending exactly at 1.
 */
export function toppleCurve(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const FALL = 0.55;
  if (t < FALL) {
    const u = t / FALL;
    return u * u;
  }
  const u = (t - FALL) / (1 - FALL);
  return 1 - 0.12 * Math.sin(Math.PI * 2 * u) * Math.exp(-3 * u) * (1 - u);
}

/** Deterministic 0..1 random from a string (the piece id), so a capture tilt is the same every replay. */
export function seeded(id: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
