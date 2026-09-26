// Procedural Staunton set: turned lathe profiles (48 segments) with arcs for the heads and collars, extruded
// crenellations on the rook, a bevelled two-box cross on the king, a crown of beads on the queen, and a bevelled
// extruded knight head on a turned base. It stands in while the GLB loads and whenever it cannot (missing file,
// decode error), so it is normalised exactly like the Poly Haven set: base centre at the origin (measured on the foot
// only, the knight head is asymmetric), feet on y = 0, one square = 1 unit, and the same heights per kind.
import * as THREE from "three";
import type { Kind } from "@/lib/three/pieceIds";

type Color = "w" | "b";
type P = [number, number]; // [radius, y]

/** Heights (units) measured on the normalised Poly Haven set, so the fallback swaps in at the same scale. */
export const PROCEDURAL_HEIGHTS: Record<Kind, number> = { p: 0.928, r: 1.046, n: 1.296, b: 1.482, q: 1.567, k: 1.641 };
const SEGMENTS = 48;

const cache = new Map<`${Color}${Kind}`, THREE.BufferGeometry>();
const mats = new Map<Color, THREE.MeshPhysicalMaterial>();

// ---------------------------------------------------------------------------------------------------------------
// profile helpers

/** Points on a circular arc (centre cx,cy in [r,y] space), angles in degrees, 0 = +r, 90 = +y. */
function arc(cx: number, cy: number, rad: number, a0: number, a1: number, n = 10): P[] {
  const out: P[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    out.push([Math.max(0, cx + rad * Math.cos(a)), cy + rad * Math.sin(a)]);
  }
  return out;
}

/** A turned bead/torus bulge from (r0,y0) out to `r` and back in to (r0,y1). */
function bead(r0: number, y0: number, y1: number, r: number, n = 8): P[] {
  const cy = (y0 + y1) / 2, h = (y1 - y0) / 2;
  const out: P[] = [];
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / n;
    out.push([r0 + (r - r0) * Math.cos(a), cy + h * Math.sin(a)]);
  }
  return out;
}

/** Concave cove (a flared neck) between two points, bowing inward by `depth`. */
function cove(a: P, b: P, depth: number, n = 8): P[] {
  const out: P[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    out.push([a[0] + (b[0] - a[0]) * t - Math.sin(Math.PI * t) * depth, a[1] + (b[1] - a[1]) * t]);
  }
  return out;
}

/** The shared Staunton foot: a flat underside, a rounded plinth, a bead and a cove up into the stem. */
function foot(R: number, stem: number, top: number): P[] {
  return [
    [0, 0],
    ...arc(R - 0.035, 0.035, 0.035, -90, 0, 4), // rounded plinth edge
    [R, 0.06],
    ...bead(R * 0.9, 0.06, 0.13, R * 0.97, 6).slice(1),
    [R * 0.8, 0.14],
    ...cove([R * 0.8, 0.15], [stem, top], (R * 0.8 - stem) * 0.35, 8),
  ];
}

function lathe(profile: P[]): THREE.BufferGeometry {
  const pts = profile.map(([r, y]) => new THREE.Vector2(Math.max(0, r), y));
  const g = new THREE.LatheGeometry(pts, SEGMENTS);
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------------------------------------------------------
// profiles (unscaled units; every piece is rescaled to its PROCEDURAL_HEIGHTS entry)

function pawnProfile(): P[] {
  return [
    ...foot(0.25, 0.1, 0.34),
    [0.085, 0.46],
    ...bead(0.085, 0.47, 0.53, 0.155, 6),
    [0.075, 0.55],
    ...arc(0, 0.73, 0.19, -68, 90, 14),
  ];
}

function bishopProfile(): P[] {
  return [
    ...foot(0.28, 0.1, 0.36),
    [0.075, 0.76],
    ...bead(0.08, 0.78, 0.84, 0.17, 6),
    [0.11, 0.86],
    ...bead(0.07, 0.87, 0.9, 0.13, 4),
    [0.07, 0.92],
    // the mitre: an egg, widest low, pointed top
    ...Array.from({ length: 15 }, (_, i): P => {
      const t = i / 14; // 0..1 bottom to top
      const y = 0.92 + t * 0.44;
      const r = 0.155 * Math.sin(Math.PI * Math.pow(t, 0.8)) + (t < 0.1 ? 0.07 * (1 - t / 0.1) : 0);
      return [r, y];
    }),
    [0.03, 1.37],
    ...arc(0, 1.41, 0.045, -60, 90, 8),
  ];
}

function queenProfile(): P[] {
  return [
    ...foot(0.35, 0.12, 0.4),
    [0.085, 0.9],
    ...bead(0.09, 0.92, 1.0, 0.2, 6),
    [0.11, 1.02],
    ...bead(0.08, 1.03, 1.07, 0.15, 4),
    // flared crown cup
    ...cove([0.09, 1.08], [0.23, 1.36], -0.03, 8),
    [0.2, 1.38],
    [0.13, 1.39],
    // low dome and finial
    ...arc(0, 1.38, 0.13, 20, 90, 6).slice(1),
    [0.035, 1.5],
    ...arc(0, 1.54, 0.05, -60, 90, 8),
  ];
}

function kingProfile(): P[] {
  return [
    ...foot(0.36, 0.13, 0.42),
    [0.09, 0.95],
    ...bead(0.095, 0.97, 1.05, 0.21, 6),
    [0.115, 1.07],
    ...bead(0.085, 1.08, 1.12, 0.16, 4),
    ...cove([0.095, 1.13], [0.22, 1.33], -0.02, 8),
    [0.2, 1.35],
    ...arc(0, 1.33, 0.2, 5, 70, 6).slice(1),
    [0.05, 1.42],
    [0.05, 1.44],
    [0, 1.44],
  ];
}

function rookProfile(): P[] {
  // body and the turret floor; the merlons are separate solids on top
  return [
    ...foot(0.315, 0.2, 0.3),
    ...cove([0.2, 0.3], [0.19, 0.74], 0.02, 6).slice(1),
    ...bead(0.2, 0.75, 0.81, 0.24, 4),
    [0.26, 0.83],
    [0.28, 0.87],
    [0.28, 0.97],
    [0.2, 0.97],
    [0.2, 0.92],
    [0, 0.92],
  ];
}

// ---------------------------------------------------------------------------------------------------------------
// extra solids

/** Four merlons on the rook turret: annular sectors extruded upward, bevelled so they catch the light. */
function merlons(): THREE.BufferGeometry[] {
  const out: THREE.BufferGeometry[] = [];
  const rOut = 0.28, rIn = 0.2, gap = 0.2; // gap in radians at the outer wall
  const span = Math.PI / 2 - gap;
  for (let i = 0; i < 4; i++) {
    const a0 = (i * Math.PI) / 2 + Math.PI / 4 - span / 2 + gap / 2;
    const s = new THREE.Shape();
    s.absarc(0, 0, rOut - 0.01, a0, a0 + span, false);
    s.absarc(0, 0, rIn + 0.01, a0 + span, a0, true);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 2, curveSegments: 10 });
    g.rotateX(-Math.PI / 2); // extrude along +y
    g.translate(0, 0.967, 0);
    out.push(g);
  }
  return out;
}

/** The king's cross: two bevelled bars. */
function cross(): THREE.BufferGeometry[] {
  const bar = (w: number, h: number) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, -h / 2);
    s.lineTo(w / 2, -h / 2);
    s.lineTo(w / 2, h / 2);
    s.lineTo(-w / 2, h / 2);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2 });
    g.translate(0, 0, -0.025);
    return g;
  };
  const v = bar(0.06, 0.24);
  v.translate(0, 1.55, 0);
  const h = bar(0.18, 0.055);
  h.translate(0, 1.58, 0);
  return [v, h];
}

/** The queen's crown: a ring of small beads on the cup rim. */
function crownBeads(): THREE.BufferGeometry[] {
  const out: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const g = new THREE.SphereGeometry(0.032, 12, 8);
    g.translate(Math.cos(a) * 0.215, 1.395, Math.sin(a) * 0.215);
    out.push(g);
  }
  return out;
}

/** Knight: a turned base plus a bevelled extruded head, muzzle along +x before orientation. */
function knightParts(): THREE.BufferGeometry[] {
  const base = lathe([
    ...foot(0.33, 0.2, 0.26),
    ...bead(0.2, 0.27, 0.33, 0.25, 6).slice(1),
    [0.2, 0.35],
    [0, 0.35],
  ]);
  const s = new THREE.Shape();
  s.moveTo(-0.22, 0.3); // back of the neck at the collar
  s.bezierCurveTo(-0.26, 0.55, -0.22, 0.85, -0.12, 1.05); // mane
  s.quadraticCurveTo(-0.08, 1.14, -0.04, 1.2); // poll
  s.lineTo(-0.02, 1.3); // ear
  s.lineTo(0.05, 1.19);
  s.quadraticCurveTo(0.14, 1.13, 0.2, 1.02); // forehead
  s.quadraticCurveTo(0.3, 0.9, 0.35, 0.8); // nose
  s.quadraticCurveTo(0.37, 0.74, 0.32, 0.71); // muzzle tip
  s.quadraticCurveTo(0.24, 0.7, 0.2, 0.74); // mouth
  s.quadraticCurveTo(0.12, 0.78, 0.06, 0.74); // jaw
  s.quadraticCurveTo(0.02, 0.62, 0.1, 0.5); // throat
  s.quadraticCurveTo(0.2, 0.4, 0.2, 0.3); // chest
  s.closePath();
  const head = new THREE.ExtrudeGeometry(s, {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.045,
    bevelSegments: 5,
    curveSegments: 18,
  });
  head.translate(0, 0, -0.07);
  head.computeVertexNormals();
  // eyes: two small beads either side of the head
  const eyes = [-1, 1].map((side) => {
    const e = new THREE.SphereGeometry(0.028, 10, 8);
    e.translate(0.12, 1.02, side * 0.115);
    return e;
  });
  return [base, head, ...eyes];
}

// ---------------------------------------------------------------------------------------------------------------
// assembly

function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  // Normals are computed per part before merging (smooth lathes, crisp bevels), so the result is never faceted.
  const ni = parts.map((p) => (p.index ? p.toNonIndexed() : p));
  const out = new THREE.BufferGeometry();
  for (const name of ["position", "normal"] as const) {
    const arrays = ni.map((p) => p.getAttribute(name).array as Float32Array);
    const m = new Float32Array(arrays.reduce((n, a) => n + a.length, 0));
    let o = 0;
    for (const a of arrays) {
      m.set(a, o);
      o += a.length;
    }
    out.setAttribute(name, new THREE.BufferAttribute(m, 3));
  }
  for (const p of parts) p.dispose();
  for (const p of ni) p.dispose();
  return out;
}

/** Same normalisation as the GLB set: base centre from the bottom 12 % of vertices, feet on y = 0, fixed height. */
function normalise(g: THREE.BufferGeometry, kind: Kind) {
  g.computeBoundingBox();
  const bb = g.boundingBox!;
  const h = bb.max.y - bb.min.y;
  const pos = g.getAttribute("position");
  const cut = bb.min.y + 0.12 * h;
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    if (pos.getY(i) > cut) continue;
    const x = pos.getX(i), z = pos.getZ(i);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  g.translate(-(minX + maxX) / 2, -bb.min.y, -(minZ + maxZ) / 2);
  const k = PROCEDURAL_HEIGHTS[kind] / h;
  g.scale(k, k, k);
  g.computeBoundingBox();
  g.computeBoundingSphere();
}

function build(kind: Kind, color: Color): THREE.BufferGeometry {
  let parts: THREE.BufferGeometry[];
  switch (kind) {
    case "p":
      parts = [lathe(pawnProfile())];
      break;
    case "b":
      parts = [lathe(bishopProfile())];
      break;
    case "q":
      parts = [lathe(queenProfile()), ...crownBeads()];
      break;
    case "k":
      parts = [lathe(kingProfile()), ...cross()];
      break;
    case "r":
      parts = [lathe(rookProfile()), ...merlons()];
      break;
    case "n":
      parts = knightParts();
      break;
  }
  const g = merge(parts);
  if (kind === "n") {
    // muzzle +x -> -z (toward black) for white; black is turned to face +z. Matches the GLB set, so KNIGHT_YAW is 0.
    g.rotateY(Math.PI / 2 + (color === "b" ? Math.PI : 0));
  }
  // (the king's cross is extruded along z, so its broad face already looks toward both players)
  normalise(g, kind);
  return g;
}

export function proceduralGeometry(kind: Kind, color: Color = "w"): THREE.BufferGeometry {
  const key = `${color}${kind}` as const;
  let g = cache.get(key);
  if (!g) {
    g = build(kind, color);
    cache.set(key, g);
  }
  return g;
}

export function proceduralMaterial(color: Color): THREE.MeshPhysicalMaterial {
  let m = mats.get(color);
  if (!m) {
    m =
      color === "w"
        ? new THREE.MeshPhysicalMaterial({
            name: "procedural-ivory",
            color: "#efe6d2",
            roughness: 0.32,
            clearcoat: 1,
            clearcoatRoughness: 0.12,
            sheen: 0.3,
            sheenRoughness: 0.5,
            sheenColor: new THREE.Color("#fff3d6"),
          })
        : new THREE.MeshPhysicalMaterial({
            name: "procedural-ebony",
            color: "#231812",
            roughness: 0.38,
            clearcoat: 1,
            clearcoatRoughness: 0.1,
            sheen: 0.2,
            sheenRoughness: 0.6,
            sheenColor: new THREE.Color("#6b4a32"),
          });
    mats.set(color, m);
  }
  return m;
}

export function disposeProcedural(): void {
  for (const g of cache.values()) g.dispose();
  cache.clear();
  for (const m of mats.values()) m.dispose();
  mats.clear();
}
