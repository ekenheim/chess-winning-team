// Procedural board textures: 1024² canvases driven by a seeded PRNG (mulberry32, seed 1337), so the board is
// deterministic, ships no image files and works offline.
//
//   map / roughnessMap / normalMap   the 8x8 playing surface: maple and walnut squares, each its own board of wood
//                                    (grain direction alternates per square, a small per-square tone shift, pores),
//                                    1 px darker seams. The normal map is a Sobel pass over a height canvas, run once.
//   rimMap / rimRoughness / rimNormal the RIM_UNITS² rim plane: walnut grain running along each side, mitred corners,
//                                    a-h / 1-8 engraved on ALL four sides (each readable from outside the board, so a
//                                    flip needs no redraw) and a transparent 8x8 hole.
//   frameMap / frameRoughness         a tiling walnut grain for the frame's sides.
import * as THREE from "three";
import { PALETTE } from "@/lib/three/palette";
import { requestFrame } from "@/lib/three/animating";

export interface BoardTextures {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  rimMap: THREE.CanvasTexture;
  rimRoughness: THREE.CanvasTexture;
  rimNormal: THREE.CanvasTexture;
  frameMap: THREE.CanvasTexture;
  frameRoughness: THREE.CanvasTexture;
}

const SIZE = 1024;
/** The rim plane covers the flat top of the 9.2 frame inside its 0.14 rounded edge, so the bevel stays visible. */
export const RIM_UNITS = 9.2 - 2 * 0.14;
const RIM_CORNER = 0.03; // a hint of rounding on the plane's corners
const SEED = 1337;
const FONT_FAMILY = '"JetBrains Mono"';
const COORD_COLOR = "rgba(216,200,168,0.7)"; // #d8c8a8 at 70 %

// The 2D board tokens, pushed a little warmer and deeper: under AgX and a neutral studio HDRI the exact 2D hex values
// render as a cold grey-beige. Hue is kept, so 2D and 3D still read as the same set.
const MAPLE = PALETTE.sqLight; // #e7dcc4
const WALNUT_SQ = PALETTE.sqDark; // #9b7353
const MAPLE_TINT = "rgba(236,190,120,0.26)";
const WALNUT_TINT = "rgba(120,62,24,0.18)";

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

function ctx2d(c: HTMLCanvasElement) {
  return c.getContext("2d", { willReadFrequently: true })!;
}

type Mode = "albedo" | "rough" | "height";

/**
 * Wood grain inside a rect: low-alpha sine strokes, horizontal or vertical. Each stroke gets its own amplitude,
 * frequency and phase; a second, slower sine bends groups of strokes together so the figure looks grown, not drawn.
 */
function grain(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  rng: () => number,
  horizontal: boolean,
  stroke: (i: number, r: number) => string,
  count: [number, number],
  width: [number, number] = [0.6, 1.6],
) {
  const n = count[0] + Math.floor(rng() * (count[1] - count[0]));
  const across = horizontal ? h : w;
  const len = horizontal ? w : h;
  const bendAmp = 2 + rng() * 6;
  const bendFreq = 0.004 + rng() * 0.01;
  const bendPhase = rng() * Math.PI * 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  for (let i = 0; i < n; i++) {
    const r = rng();
    ctx.strokeStyle = stroke(i, r);
    ctx.lineWidth = width[0] + rng() * (width[1] - width[0]);
    ctx.beginPath();
    const off = rng() * across;
    const amp = 0.5 + rng() * 2.5;
    const freq = 0.01 + rng() * 0.03;
    const phase = rng() * Math.PI * 2;
    for (let s = -4; s <= len + 4; s += 4) {
      const wob = Math.sin(s * freq + phase) * amp + Math.sin(s * bendFreq + bendPhase + off * 0.02) * bendAmp;
      const px = horizontal ? x + s : x + off + wob;
      const py = horizontal ? y + off + wob : y + s;
      if (s === -4) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** Tiny elongated pores along the grain (open-pore walnut look). */
function pores(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rng: () => number, horizontal: boolean, style: string, n: number) {
  ctx.fillStyle = style;
  for (let i = 0; i < n; i++) {
    const px = x + rng() * w, py = y + rng() * h;
    const l = 2 + rng() * 5;
    if (horizontal) ctx.fillRect(px, py, l, 1);
    else ctx.fillRect(px, py, 1, l);
  }
}

function drawSquares(ctx: CanvasRenderingContext2D, rng: () => number, mode: Mode) {
  const s = SIZE / 8;
  for (let r = 0; r < 8; r++)
    for (let f = 0; f < 8; f++) {
      const light = (f + r) % 2 === 0;
      const x = f * s, y = r * s;
      const horizontal = (f + r) % 2 === 0;
      const tone = rng(); // per-square variation: every square is its own piece of wood
      if (mode === "albedo") {
        ctx.fillStyle = light ? MAPLE : WALNUT_SQ;
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = light ? MAPLE_TINT : WALNUT_TINT;
        ctx.fillRect(x, y, s, s);
        const shift = (tone - 0.5) * (light ? 0.1 : 0.14);
        ctx.fillStyle = shift > 0 ? `rgba(255,236,200,${shift})` : `rgba(40,20,8,${-shift})`;
        ctx.fillRect(x, y, s, s);
      } else if (mode === "rough") {
        const v = Math.round(97 + (tone - 0.5) * 16); // ~0.38
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x, y, s, s);
      } else {
        ctx.fillStyle = "rgb(128,128,128)";
        ctx.fillRect(x, y, s, s);
      }
      grain(
        ctx, x, y, s, s, rng, horizontal,
        (i, rr) =>
          mode === "albedo"
            ? i % 3 === 0
              ? `rgba(255,246,228,${(light ? 0.1 : 0.06) + rr * 0.05})`
              : `rgba(${light ? "90,56,24" : "30,14,4"},${(light ? 0.05 : 0.1) + rr * 0.06})`
            : mode === "rough"
              ? `rgba(128,128,128,${0.35 + rr * 0.3})` // grain ~0.5
              : i % 2
                ? `rgba(150,150,150,${0.3 + rr * 0.3})`
                : `rgba(104,104,104,${0.3 + rr * 0.3})`,
        [40, 80],
      );
      if (mode !== "rough")
        pores(ctx, x, y, s, s, rng, horizontal, mode === "albedo" ? (light ? "rgba(110,70,30,0.12)" : "rgba(20,8,2,0.18)") : "rgba(90,90,90,0.5)", light ? 60 : 90);
      else pores(ctx, x, y, s, s, rng, horizontal, "rgba(150,150,150,0.4)", 60);
    }
  // seams: 1 px, darker, rougher and recessed
  ctx.fillStyle = mode === "albedo" ? "rgba(20,12,6,0.55)" : mode === "rough" ? "rgb(179,179,179)" : "rgb(70,70,70)";
  for (let i = 0; i <= 8; i++) {
    ctx.fillRect(Math.min(i * s, SIZE - 1), 0, 1, SIZE);
    ctx.fillRect(0, Math.min(i * s, SIZE - 1), SIZE, 1);
  }
}

/** Sobel over a height canvas -> tangent-space (OpenGL, +Y up in UV) normal map. Runs once per canvas. */
function normalFromHeight(height: HTMLCanvasElement, strength = 2.2, wrap = true): HTMLCanvasElement {
  const w = height.width, h = height.height;
  const src = ctx2d(height).getImageData(0, 0, w, h).data;
  const out = canvas(w);
  const octx = out.getContext("2d")!;
  const img = octx.createImageData(w, h);
  const d = img.data;
  const at = wrap
    ? (x: number, y: number) => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255
    : (x: number, y: number) => src[(Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))) * 4] / 255;
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

const RIM_STROKE = (mode: Mode) => (i: number, r: number) =>
  mode === "albedo"
    ? i % 4 === 0
      ? `rgba(120,80,46,${0.18 + r * 0.2})`
      : `rgba(10,5,2,${0.2 + r * 0.25})`
    : mode === "rough"
      ? `rgba(150,150,150,${0.3 + r * 0.3})`
      : i % 2
        ? `rgba(160,160,160,${0.3 + r * 0.3})`
        : `rgba(96,96,96,${0.3 + r * 0.3})`;

/** Rim: 4 mitred walnut boards around a transparent 8x8 hole, with engraved coordinates on every side. */
function drawRim(ctx: CanvasRenderingContext2D, rng: () => number, mode: Mode, fontReady: boolean) {
  const px = SIZE / RIM_UNITS; // pixels per world unit
  const inner0 = ((RIM_UNITS - 8) / 2) * px, inner1 = SIZE - inner0;
  ctx.clearRect(0, 0, SIZE, SIZE);
  if (mode === "height") {
    // flat everywhere the plane is transparent, so the Sobel pass puts no ridge along the hole or the corners
    ctx.fillStyle = "rgb(128,128,128)";
    ctx.fillRect(0, 0, SIZE, SIZE);
  }
  ctx.save();
  // barely rounded outer corners (the frame's own bevel does the real rounding)
  ctx.beginPath();
  ctx.roundRect(0, 0, SIZE, SIZE, RIM_CORNER * px);
  ctx.clip();
  const base = mode === "albedo" ? PALETTE.walnut : mode === "rough" ? "rgb(110,110,110)" : "rgb(128,128,128)";
  // Four boards meeting in 45° mitres. Each is clipped to its trapezoid so the grain turns the corner like real joinery.
  const boards: { poly: [number, number][]; horizontal: boolean; rect: [number, number, number, number] }[] = [
    { poly: [[0, 0], [SIZE, 0], [inner1, inner0], [inner0, inner0]], horizontal: true, rect: [0, 0, SIZE, inner0] },
    { poly: [[0, SIZE], [SIZE, SIZE], [inner1, inner1], [inner0, inner1]], horizontal: true, rect: [0, inner1, SIZE, SIZE - inner1] },
    { poly: [[0, 0], [inner0, inner0], [inner0, inner1], [0, SIZE]], horizontal: false, rect: [0, 0, inner0, SIZE] },
    { poly: [[SIZE, 0], [inner1, inner0], [inner1, inner1], [SIZE, SIZE]], horizontal: false, rect: [inner1, 0, SIZE - inner1, SIZE] },
  ];
  for (const b of boards) {
    ctx.save();
    ctx.beginPath();
    b.poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = base;
    ctx.fillRect(...b.rect);
    if (mode === "albedo") {
      // darker walnut heartwood streaks
      ctx.fillStyle = `rgba(42,26,16,${0.25 + rng() * 0.2})`; // PALETTE.walnutDark
      ctx.fillRect(...b.rect);
    }
    grain(ctx, ...b.rect, rng, b.horizontal, RIM_STROKE(mode), [140, 190], [0.6, 2]);
    if (mode !== "rough") pores(ctx, ...b.rect, rng, b.horizontal, mode === "albedo" ? "rgba(8,4,2,0.3)" : "rgba(80,80,80,0.6)", 500);
    ctx.restore();
  }
  // mitre lines
  ctx.strokeStyle = mode === "albedo" ? "rgba(8,4,2,0.6)" : mode === "rough" ? "rgb(170,170,170)" : "rgb(80,80,80)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(inner0, inner0);
  ctx.moveTo(SIZE, 0); ctx.lineTo(inner1, inner0);
  ctx.moveTo(0, SIZE); ctx.lineTo(inner0, inner1);
  ctx.moveTo(SIZE, SIZE); ctx.lineTo(inner1, inner1);
  ctx.stroke();
  // a thin bevelled lip where the rim meets the squares
  ctx.strokeStyle = mode === "albedo" ? "rgba(255,225,180,0.12)" : mode === "rough" ? "rgb(80,80,80)" : "rgb(170,170,170)";
  ctx.lineWidth = 2;
  ctx.strokeRect(inner0 - 2, inner0 - 2, inner1 - inner0 + 4, inner1 - inner0 + 4);
  ctx.restore();
  // the 8x8 hole
  if (mode === "height") {
    ctx.fillStyle = "rgb(128,128,128)";
    ctx.fillRect(inner0, inner0, inner1 - inner0, inner1 - inner0);
  } else ctx.clearRect(inner0, inner0, inner1 - inner0, inner1 - inner0);

  // coordinates on all four sides, each readable from outside the board
  const fontPx = Math.round(px * 0.3);
  ctx.font = `600 ${fontPx}px ${fontReady ? `${FONT_FAMILY}, ` : ""}ui-monospace, Menlo, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const mid = inner0 / 2;
  const glyphs: { t: string; x: number; y: number; rot: number }[] = [];
  for (let i = 0; i < 8; i++) {
    const file = "abcdefgh"[i];
    const rank = String(i + 1);
    const cx = inner0 + px * (i + 0.5); // file i, left->right (canvas left = a-file = world -x)
    const cy = inner1 - px * (i + 0.5); // rank i+1, bottom->top (canvas top = black side = world -z)
    glyphs.push({ t: file, x: cx, y: inner1 + mid, rot: 0 }); // white side: upright
    glyphs.push({ t: file, x: cx, y: mid, rot: Math.PI }); // black side
    glyphs.push({ t: rank, x: mid, y: cy, rot: -Math.PI / 2 }); // a-file side, read from the left
    glyphs.push({ t: rank, x: inner1 + mid, y: cy, rot: Math.PI / 2 }); // h-file side, read from the right
  }
  const paint = (style: string, dx: number, dy: number) => {
    ctx.fillStyle = style;
    for (const g of glyphs) {
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.rot);
      ctx.fillText(g.t, dx, dy);
      ctx.restore();
    }
  };
  if (mode === "albedo") {
    // engraved: a dark cut on the upper edge, a light catch on the lower edge, then the inlaid fill
    paint("rgba(0,0,0,0.55)", 0, -1.5);
    paint("rgba(255,236,200,0.12)", 0, 1.5);
    paint(COORD_COLOR, 0, 0);
  } else if (mode === "rough") {
    paint("rgb(60,60,60)", 0, 0); // the inlay is polished
  } else {
    paint("rgb(40,40,40)", 0, 0); // cut into the wood
  }
}

/** A seamless walnut plank for the frame sides (RepeatWrapping). */
function drawFrame(ctx: CanvasRenderingContext2D, rng: () => number, mode: Mode, size: number) {
  ctx.fillStyle = mode === "albedo" ? PALETTE.walnut : "rgb(115,115,115)";
  ctx.fillRect(0, 0, size, size);
  if (mode === "albedo") {
    const g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, "rgba(42,26,16,0.0)");
    g.addColorStop(0.5, "rgba(42,26,16,0.35)");
    g.addColorStop(1, "rgba(42,26,16,0.0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  // draw the grain twice, offset by the canvas height, so the vertical tiling is seamless enough under a clip
  const stroke = RIM_STROKE(mode);
  const seed = rng() * 1e9;
  for (const oy of [0, -size, size]) {
    const r2 = mulberry32(seed);
    ctx.save();
    ctx.translate(0, oy);
    grain(ctx, 0, 0, size, size, r2, true, stroke, [110, 140], [0.6, 2]);
    ctx.restore();
  }
  if (mode === "albedo") pores(ctx, 0, 0, size, size, rng, true, "rgba(8,4,2,0.3)", 700);
}

function tex(c: HTMLCanvasElement, srgb: boolean, repeat = false) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  t.wrapS = t.wrapT = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  return t;
}

export function makeBoardTextures(): BoardTextures {
  if (cached) return cached;
  const albedo = canvas(), rough = canvas(), height = canvas();
  drawSquares(ctx2d(albedo), mulberry32(SEED), "albedo");
  drawSquares(ctx2d(rough), mulberry32(SEED), "rough");
  drawSquares(ctx2d(height), mulberry32(SEED), "height");
  const normal = normalFromHeight(height, 2.2, true);

  const rim = canvas(), rimRough = canvas();
  const drawRimSet = (fontReady: boolean) => {
    drawRim(ctx2d(rim), mulberry32(SEED + 1), "albedo", fontReady);
    drawRim(ctx2d(rimRough), mulberry32(SEED + 1), "rough", fontReady);
    const rimHeight = canvas();
    drawRim(ctx2d(rimHeight), mulberry32(SEED + 1), "height", fontReady);
    return normalFromHeight(rimHeight, 2.6, false);
  };
  const rimNormalCanvas = drawRimSet(false);

  const FRAME = 512;
  const frame = canvas(FRAME), frameRough = canvas(FRAME);
  drawFrame(ctx2d(frame), mulberry32(SEED + 2), "albedo", FRAME);
  drawFrame(ctx2d(frameRough), mulberry32(SEED + 2), "rough", FRAME);

  const out: BoardTextures = {
    map: tex(albedo, true),
    roughnessMap: tex(rough, false),
    normalMap: tex(normal, false),
    rimMap: tex(rim, true),
    rimRoughness: tex(rimRough, false),
    rimNormal: tex(rimNormalCanvas, false),
    frameMap: tex(frame, true, true),
    frameRoughness: tex(frameRough, false, true),
  };
  cached = out;
  // Redraw the coordinates with the self-hosted font once it is available (works offline: fontsource ships it).
  try {
    document.fonts
      .load(`600 32px ${FONT_FAMILY}`)
      .then((faces) => {
        if (cached !== out || faces.length === 0) return;
        const n = drawRimSet(true);
        (out.rimNormal.image as HTMLCanvasElement).getContext("2d")!.drawImage(n, 0, 0);
        out.rimMap.needsUpdate = true;
        out.rimRoughness.needsUpdate = true;
        out.rimNormal.needsUpdate = true;
        requestFrame();
      })
      .catch(() => {});
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
