// Procedural chess set: turned-wood lathe profiles plus an extruded knight head. Used while the GLB loads and
// whenever it cannot (missing file, decode error). Normalised like the GLB set: base at the origin, one square = 1.
import * as THREE from "three";
import type { Kind } from "@/lib/three/pieceIds";

// [radius, height] pairs, bottom to top.
const PROFILES: Record<Exclude<Kind, "n">, [number, number][]> = {
  p: [[0, 0], [0.3, 0], [0.3, 0.06], [0.24, 0.1], [0.14, 0.18], [0.1, 0.36], [0.16, 0.4], [0.1, 0.44], [0.15, 0.52], [0.14, 0.6], [0.08, 0.66], [0, 0.68]],
  r: [[0, 0], [0.33, 0], [0.33, 0.07], [0.26, 0.12], [0.2, 0.2], [0.18, 0.62], [0.26, 0.66], [0.26, 0.82], [0.2, 0.82], [0.2, 0.74], [0, 0.74]],
  b: [[0, 0], [0.32, 0], [0.32, 0.07], [0.24, 0.12], [0.13, 0.22], [0.1, 0.58], [0.2, 0.62], [0.1, 0.66], [0.17, 0.8], [0.13, 0.92], [0.05, 0.98], [0.06, 1.02], [0, 1.04]],
  q: [[0, 0], [0.35, 0], [0.35, 0.08], [0.26, 0.14], [0.14, 0.26], [0.1, 0.78], [0.22, 0.84], [0.12, 0.88], [0.24, 1.08], [0.12, 1.1], [0.07, 1.16], [0, 1.18]],
  k: [[0, 0], [0.36, 0], [0.36, 0.08], [0.27, 0.14], [0.15, 0.26], [0.11, 0.84], [0.23, 0.9], [0.12, 0.94], [0.2, 1.1], [0.05, 1.14], [0.05, 1.18], [0, 1.18]],
};
// Target heights (units) matching the Poly Haven set so the fallback swaps in at the same scale.
const HEIGHTS: Record<Kind, number> = { p: 0.93, r: 1.05, n: 1.3, b: 1.49, q: 1.55, k: 1.64 };
const SEGMENTS = 48;

const cache = new Map<Kind, THREE.BufferGeometry>();
const mats = new Map<"w" | "b", THREE.MeshPhysicalMaterial>();

function lathe(profile: [number, number][]) {
  return new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), SEGMENTS);
}

function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const ni = parts.map((p) => (p.index ? p.toNonIndexed() : p));
  const out = new THREE.BufferGeometry();
  for (const name of ["position", "normal"] as const) {
    const arrays = ni.map((p) => p.getAttribute(name).array as Float32Array);
    const total = arrays.reduce((n, a) => n + a.length, 0);
    const m = new Float32Array(total);
    let o = 0;
    for (const a of arrays) {
      m.set(a, o);
      o += a.length;
    }
    out.setAttribute(name, new THREE.BufferAttribute(m, 3));
  }
  return out;
}

function build(kind: Kind): THREE.BufferGeometry {
  let g: THREE.BufferGeometry;
  if (kind === "n") {
    const base = lathe(PROFILES.p.slice(0, 6));
    const s = new THREE.Shape();
    s.moveTo(-0.16, 0.3);
    s.lineTo(0.18, 0.3);
    s.quadraticCurveTo(0.2, 0.7, 0.05, 0.95);
    s.lineTo(-0.28, 0.72);
    s.lineTo(-0.24, 0.62);
    s.quadraticCurveTo(-0.05, 0.66, -0.16, 0.3);
    const head = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 16 });
    head.translate(0, 0, -0.08);
    head.rotateY(Math.PI / 2); // the muzzle points along -z, toward the opponent
    g = merge([base, head]);
  } else if (kind === "r") {
    const body = lathe(PROFILES.r);
    // four crenellations
    const notches: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 4; i++) {
      const b = new THREE.BoxGeometry(0.11, 0.1, 0.16);
      b.translate(0, 0.86, 0.19);
      b.rotateY((i * Math.PI) / 2 + Math.PI / 4);
      notches.push(b);
    }
    g = merge([body, ...notches]);
  } else if (kind === "k") {
    const body = lathe(PROFILES.k);
    const v = new THREE.BoxGeometry(0.06, 0.26, 0.06);
    v.translate(0, 1.3, 0);
    const h = new THREE.BoxGeometry(0.18, 0.06, 0.06);
    h.translate(0, 1.33, 0);
    g = merge([body, v, h]);
  } else {
    g = lathe(PROFILES[kind]);
  }
  g.computeVertexNormals();
  g.computeBoundingBox();
  const bb = g.boundingBox!;
  const k = HEIGHTS[kind] / (bb.max.y - bb.min.y);
  g.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
  g.scale(k, k, k);
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}

export function proceduralGeometry(kind: Kind): THREE.BufferGeometry {
  let g = cache.get(kind);
  if (!g) {
    g = build(kind);
    cache.set(kind, g);
  }
  return g;
}

export function proceduralMaterial(color: "w" | "b"): THREE.MeshPhysicalMaterial {
  let m = mats.get(color);
  if (!m) {
    m =
      color === "w"
        ? new THREE.MeshPhysicalMaterial({ color: "#efe6d2", roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.15, sheen: 0.3, sheenColor: new THREE.Color("#fff3d6") })
        : new THREE.MeshPhysicalMaterial({ color: "#231812", roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.1 });
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
