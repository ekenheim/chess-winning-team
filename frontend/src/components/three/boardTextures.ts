// Procedural board textures: 1024² canvases with a seeded PRNG, so the board is deterministic and ships no image files.
import * as THREE from "three";
import { PALETTE } from "@/lib/three/palette";
import { requestFrame } from "@/lib/three/animating";

export interface BoardTextures {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  rimMap: THREE.CanvasTexture;
  rimRoughness: THREE.CanvasTexture;
}

const SIZE = 1024;
const RIM_UNITS = 9.2; // rim plane is 9.2 x 9.2 world units; the board is the inner 8 x 8
const SEED = 1337;
let cached: BoardTextures | null = null;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(size = SIZE) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return c;
}

/** Wood grain: low-alpha sine strokes across a rect, direction alternating per call. */
function grain(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rng: () => number, horizontal: boolean, stroke: (i: number) => string, count: [number, number]) {
  const n = count[0] + Math.floor(rng() * (count[1] - count[0]));
  ctx.lineWidth = 1;
  for (let i = 0; i < n; i++) {
    ctx.strokeStyle = stroke(i);
    ctx.beginPath();
    const off = rng() * (horizontal ? h : w);
    const amp = 1 + rng() * 3;
    const freq = 0.01 + rng() * 0.03;
    const phase = rng() * Math.PI * 2;
    const len = horizontal ? w : h;
    for (let s = 0; s <= len; s += 4) {
      const wob = Math.sin(s * freq + phase) * amp;
      const px = horizontal ? x + s : x + off + wob;
      const py = horizontal ? y + off + wob : y + s;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
}

function drawSquares(ctx: CanvasRenderingContext2D, rng: () => number, mode: "albedo" | "rough" | "height") {
  const s = SIZE / 8;
  for (let r = 0; r < 8; r++)
    for (let f = 0; f < 8; f++) {
      const light = (f + r) % 2 === 0;
      const x = f * s, y = r * s;
      ctx.fillStyle = mode === "albedo" ? (light ? PALETTE.sqLight : PALETTE.sqDark) : mode === "rough" ? "rgb(97,97,97)" : "rgb(128,128,128)";
      ctx.fillRect(x, y, s, s);
      const horizontal = (f + r) % 2 === 0;
      grain(
        ctx,
        x, y, s, s, rng, horizontal,
        (i) =>
          mode === "albedo"
            ? i % 3 === 0
              ? `rgba(255,255,255,${light ? 0.12 : 0.07})`
              : `rgba(0,0,0,${light ? 0.05 : 0.09})`
            : mode === "rough"
              ? "rgba(128,128,128,0.6)"
              : i % 2 ? "rgba(140,140,140,0.5)" : "rgba(116,116,116,0.5)",
        [40, 80],
      );
    }
  // seams
  ctx.fillStyle = mode === "albedo" ? "rgba(20,12,6,0.55)" : mode === "rough" ? "rgb(179,179,179)" : "rgb(96,96,96)";
  for (let i = 0; i <= 8; i++) {
    ctx.fillRect(Math.min(i * s, SIZE - 1), 0, 1, SIZE);
    ctx.fillRect(0, Math.min(i * s, SIZE - 1), SIZE, 1);
  }
}

/** Sobel over a height canvas -> tangent-space normal map. Runs once. */
function normalFromHeight(height: HTMLCanvasElement, strength = 2.2): HTMLCanvasElement {
  const w = height.width, h = height.height;
  const src = height.getContext("2d")!.getImageData(0, 0, w, h).data;
  const out = canvas(w);
  const octx = out.getContext("2d")!;
  const img = octx.createImageData(w, h);
  const d = img.data;
  const at = (x: number, y: number) => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const tl = at(x - 1, y - 1), t = at(x, y - 1), tr = at(x + 1, y - 1);
      const l = at(x - 1, y), r = at(x + 1, y);
      const bl = at(x - 1, y + 1), b = at(x, y + 1), br = at(x + 1, y + 1);
      const dx = (tr + 2 * r + br - (tl + 2 * l + bl)) * strength;
      const dy = (bl + 2 * b + br - (tl + 2 * t + tr)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * w + x) * 4;
      d[i] = ((-dx / len) * 0.5 + 0.5) * 255;
      d[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      d[i + 2] = (1 / len) * 0.5 * 255 + 127.5;
      d[i + 3] = 255;
    }
  octx.putImageData(img, 0, 0);
  return out;
}

function drawRim(ctx: CanvasRenderingContext2D, rng: () => number, mode: "albedo" | "rough", fontReady: boolean) {
  const px = SIZE / RIM_UNITS; // pixels per world unit
  const inner0 = 0.6 * px, inner1 = 8.6 * px;
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = mode === "albedo" ? PALETTE.walnut : "rgb(115,115,115)";
  ctx.fillRect(0, 0, SIZE, SIZE);
  // grain runs along each side
  grain(ctx, 0, 0, SIZE, inner0, rng, true, (i) => (mode === "albedo" ? (i % 4 === 0 ? "rgba(90,60,35,0.35)" : "rgba(10,5,2,0.35)") : "rgba(150,150,150,0.5)"), [120, 160]);
  grain(ctx, 0, inner1, SIZE, SIZE - inner1, rng, true, (i) => (mode === "albedo" ? (i % 4 === 0 ? "rgba(90,60,35,0.35)" : "rgba(10,5,2,0.35)") : "rgba(150,150,150,0.5)"), [120, 160]);
  grain(ctx, 0, 0, inner0, SIZE, rng, false, (i) => (mode === "albedo" ? (i % 4 === 0 ? "rgba(90,60,35,0.35)" : "rgba(10,5,2,0.35)") : "rgba(150,150,150,0.5)"), [120, 160]);
  grain(ctx, inner1, 0, SIZE - inner1, SIZE, rng, false, (i) => (mode === "albedo" ? (i % 4 === 0 ? "rgba(90,60,35,0.35)" : "rgba(10,5,2,0.35)") : "rgba(150,150,150,0.5)"), [120, 160]);
  // the 8x8 hole
  ctx.clearRect(inner0, inner0, inner1 - inner0, inner1 - inner0);
  if (mode !== "albedo") return;
  // coordinates on all four sides, each readable from outside the board
  ctx.font = `600 ${Math.round(px * 0.3)}px ${fontReady ? '"JetBrains Mono", ' : ""}ui-monospace, Menlo, monospace`;
  ctx.fillStyle = "rgba(216,200,168,0.7)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const sq = px; // one square in pixels
  const mid = inner0 / 2;
  for (let i = 0; i < 8; i++) {
    const file = "abcdefgh"[i];
    const rank = String(i + 1);
    const cx = inner0 + sq * (i + 0.5); // file i, left->right
    const cy = inner1 - sq * (i + 0.5); // rank i+1, bottom->top (canvas top = black side)
    // bottom rim (white side): upright
    ctx.save(); ctx.translate(cx, inner1 + mid); ctx.fillText(file, 0, 0); ctx.restore();
    // top rim (black side): rotated 180
    ctx.save(); ctx.translate(cx, mid); ctx.rotate(Math.PI); ctx.fillText(file, 0, 0); ctx.restore();
    // left rim: read from the left (rotate -90)
    ctx.save(); ctx.translate(mid, cy); ctx.rotate(-Math.PI / 2); ctx.fillText(rank, 0, 0); ctx.restore();
    // right rim: read from the right (rotate +90)
    ctx.save(); ctx.translate(inner1 + mid, cy); ctx.rotate(Math.PI / 2); ctx.fillText(rank, 0, 0); ctx.restore();
  }
}

function tex(c: HTMLCanvasElement, srgb: boolean) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

export function makeBoardTextures(): BoardTextures {
  if (cached) return cached;
  const albedo = canvas(), rough = canvas(), height = canvas(), rim = canvas(), rimRough = canvas();
  drawSquares(albedo.getContext("2d")!, mulberry32(SEED), "albedo");
  drawSquares(rough.getContext("2d")!, mulberry32(SEED), "rough");
  drawSquares(height.getContext("2d")!, mulberry32(SEED), "height");
  const normal = normalFromHeight(height);
  const rimCtx = rim.getContext("2d")!;
  drawRim(rimCtx, mulberry32(SEED + 1), "albedo", false);
  drawRim(rimRough.getContext("2d")!, mulberry32(SEED + 1), "rough", false);
  const out: BoardTextures = {
    map: tex(albedo, true),
    roughnessMap: tex(rough, false),
    normalMap: tex(normal, false),
    rimMap: tex(rim, true),
    rimRoughness: tex(rimRough, false),
  };
  cached = out;
  // Redraw the coordinates with the self-hosted font once it is available (works offline).
  try {
    document.fonts.load('600 32px "JetBrains Mono"').then(() => {
      if (cached !== out) return;
      drawRim(rimCtx, mulberry32(SEED + 1), "albedo", true);
      out.rimMap.needsUpdate = true;
      requestFrame();
    }).catch(() => {});
  } catch {
    /* no FontFaceSet */
  }
  return out;
}

export function disposeBoardTextures(): void {
  if (!cached) return;
  for (const t of Object.values(cached)) t.dispose();
  cached = null;
}
