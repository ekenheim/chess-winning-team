// sRGB hex values precomputed from the OKLCH tokens in src/styles/index.css (Track C re-verifies them with devAssertPalette).
import * as THREE from "three";

export const PALETTE = {
  bg: "#120d09",
  accent: "#fbb636",
  accentDeep: "#dc7d00",
  accentInk: "#1f1306",
  win: "#5ac576",
  loss: "#f0574e",
  inaccuracy: "#dabc43",
  sqLight: "#e7dcc4",
  sqDark: "#9b7353",
  walnut: "#3a2618",
  walnutDark: "#2a1a10",
  inlay: [1.9, 1.2, 0.45] as [number, number, number],
} as const;

// HDR triples for emissive highlights (rendered with toneMapped=false so they push over Bloom's threshold).
export const HL_LAST: [number, number, number] = [1.7, 1.05, 0.35];
export const HL_CHECK: [number, number, number] = [3, 0.35, 0.25];
export const HL_BEST: [number, number, number] = [0.45, 1.9, 0.95];
export const HL_PLAYED: [number, number, number] = [1.6, 0.9, 0.3];
export const HL_HALO: [number, number, number] = [3, 2, 0.6];

const CSS_VARS: Record<string, string> = {
  bg: "--bg",
  accent: "--accent",
  accentDeep: "--accent-deep",
  accentInk: "--accent-ink",
  win: "--win",
  loss: "--loss",
  inaccuracy: "--inaccuracy",
  sqLight: "--sq-light",
  sqDark: "--sq-dark",
};

/** Badge ring colours: the badge hex scaled x2 so the rings glow slightly. */
export function badgeRing(kind: "blunder" | "mistake" | "inaccuracy" | "best"): THREE.Color {
  const hex = { blunder: PALETTE.loss, mistake: PALETTE.accentDeep, inaccuracy: PALETTE.inaccuracy, best: PALETTE.win }[kind];
  return new THREE.Color(hex).multiplyScalar(2);
}

/** Dev-only: warns when the precomputed hex drifts from the live CSS token by more than 12/255 on any channel. */
export function devAssertPalette(): void {
  if (!import.meta.env.DEV) return;
  try {
    const cs = getComputedStyle(document.documentElement);
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    for (const [key, cssVar] of Object.entries(CSS_VARS)) {
      const live = cs.getPropertyValue(cssVar).trim();
      if (!live) continue;
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = live;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      const want = new THREE.Color((PALETTE as Record<string, unknown>)[key] as string);
      const dr = Math.abs(r - Math.round(want.r * 255));
      const dg = Math.abs(g - Math.round(want.g * 255));
      const db = Math.abs(b - Math.round(want.b * 255));
      if (Math.max(dr, dg, db) > 12)
        console.warn(`[palette] ${key} drifts from ${cssVar}: css=rgb(${r},${g},${b}) palette=${(PALETTE as Record<string, unknown>)[key]}`);
    }
  } catch {
    /* no DOM */
  }
}
