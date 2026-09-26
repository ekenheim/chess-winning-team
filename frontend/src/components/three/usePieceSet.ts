// Piece geometry + materials. The Poly Haven set (CC0) is normalised once per (colour, kind): base centre at the
// origin, feet on y=0, one square = 1 unit. The procedural set is the fallback when the GLB fails or is loading.
import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Kind } from "@/lib/three/pieceIds";
import { PROCEDURAL_HEIGHTS, proceduralGeometry, proceduralMaterial, disposeProcedural } from "./proceduralPieces";

export type PieceKey = `${"w" | "b"}${Kind}`;
export interface PieceSet {
  geometry(color: "w" | "b", kind: Kind): THREE.BufferGeometry;
  material(color: "w" | "b"): THREE.Material;
  height(kind: Kind): number;
}

export const PIECE_SET_URL = "/models/chess_set.glb";
const PH_SQUARE = 0.05789; // metres per square in the Poly Haven file
const SCALE = 1 / PH_SQUARE; // ≈ 17.27
const KIND_NAME: Record<Kind, string> = { p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" };
/** Per-colour knight yaw tuning. The whole set is turned by π so both colours already face the opponent. */
const AO_INTENSITY = 0.85;
export const KNIGHT_YAW: Record<"w" | "b", number> = { w: 0, b: 0 };

const geometries = new Map<PieceKey, THREE.BufferGeometry>();
const heights = new Map<Kind, number>();
const materials = new Map<"w" | "b", THREE.MeshPhysicalMaterial>();

/** The node for a piece: a Mesh, or a Group of Meshes when the glTF mesh has several primitives (the bishops). */
function findNode(nodes: Record<string, THREE.Object3D>, color: "w" | "b", kind: Kind): THREE.Object3D | null {
  const base = `piece_${KIND_NAME[kind]}_${color === "w" ? "white" : "black"}`;
  return nodes[base] ?? nodes[`${base}_01`] ?? null;
}

function meshesOf(node: THREE.Object3D): THREE.Mesh[] {
  const out: THREE.Mesh[] = [];
  node.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) out.push(o as THREE.Mesh);
  });
  return out;
}

/**
 * The GLB is KHR_mesh_quantization'd: positions are normalised Int16 in [-1, 1] with the node scale undoing it, normals
 * Int8. Transforming those in place re-quantises into the same [-1, 1] range, so after the 17.27 scale every vertex
 * above one unit was clamped (kings, queens, bishops and knight heads came out with flat, cylinder-like tops). So
 * every kept attribute is first expanded to a plain Float32 attribute (getX() de-normalises).
 */
function toFloat32(attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute): THREE.BufferAttribute {
  const n = attr.count, size = attr.itemSize;
  const out = new Float32Array(n * size);
  for (let i = 0; i < n; i++)
    for (let c = 0; c < size; c++) out[i * size + c] = attr.getComponent(i, c);
  return new THREE.BufferAttribute(out, size);
}

function floatGeometry(src: THREE.BufferGeometry): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  // merging needs identical attribute sets: keep position/normal/uv only
  for (const name of ["position", "normal", "uv"]) {
    const a = src.getAttribute(name);
    if (a) g.setAttribute(name, toFloat32(a));
  }
  if (src.index) g.setIndex(new THREE.BufferAttribute(Uint32Array.from(src.index.array as ArrayLike<number>), 1));
  return g;
}

function normalise(node: THREE.Object3D): THREE.BufferGeometry {
  const parts = meshesOf(node).map((m) => {
    const c = floatGeometry(m.geometry).applyMatrix4(m.matrixWorld);
    if (c.getAttribute("normal")) c.normalizeNormals();
    return c;
  });
  if (parts.length === 0) throw new Error("piece node has no mesh");
  let g: THREE.BufferGeometry;
  if (parts.length === 1) g = parts[0];
  else {
    const merged = mergeGeometries(parts, false);
    g = merged ?? parts.reduce((a, b) => (a.getAttribute("position").count >= b.getAttribute("position").count ? a : b));
    if (merged) parts.forEach((p) => p.dispose());
  }
  g.rotateY(Math.PI); // PH white sits at -z; ours at +z
  g.computeBoundingBox();
  const bb = g.boundingBox!;
  const h = bb.max.y - bb.min.y;
  // Base centre from the foot vertices only: the knight head is asymmetric, so the full bbox would be off-centre.
  const pos = g.getAttribute("position");
  const cut = bb.min.y + 0.12 * h;
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y > cut) continue;
    const x = pos.getX(i), z = pos.getZ(i);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  const cx = Number.isFinite(minX) ? (minX + maxX) / 2 : (bb.min.x + bb.max.x) / 2;
  const cz = Number.isFinite(minZ) ? (minZ + maxZ) / 2 : (bb.min.z + bb.max.z) / 2;
  g.translate(-cx, -bb.min.y, -cz);
  g.scale(SCALE, SCALE, SCALE);
  if (!g.getAttribute("normal")) g.computeVertexNormals();
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}

function copyTexture(t: THREE.Texture | null | undefined, srgb = false): THREE.Texture | null {
  if (!t) return null;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = Math.max(t.anisotropy, 8);
  return t; // keep `.channel` from GLTFLoader, no uv1 copy needed
}

function buildMaterial(color: "w" | "b", src: THREE.Material | undefined): THREE.MeshPhysicalMaterial {
  const s = (src as THREE.MeshStandardMaterial | undefined) ?? null;
  const arm = copyTexture(s?.roughnessMap);
  const m = new THREE.MeshPhysicalMaterial({
    map: copyTexture(s?.map, true),
    normalMap: copyTexture(s?.normalMap),
    roughnessMap: arm,
    metalnessMap: copyTexture(s?.metalnessMap),
    // The glTF references no occlusion texture, but Poly Haven packs AO into the R channel of the ARM map (the same
    // texture GLTFLoader already bound as metallicRoughness, so its `.channel` matches). Three reads aoMap from R.
    aoMap: copyTexture(s?.aoMap) ?? arm,
    aoMapIntensity: AO_INTENSITY,
    metalness: 0, // the file says metallicFactor 0; never let a stray map make the marble read as metal
    roughness: 1, // multiplied by the ARM G channel
  });
  m.normalScale.set(0.8, 0.8);
  if (color === "w") {
    m.color.set("#f4ead6");
    m.clearcoat = 0.55;
    m.clearcoatRoughness = 0.12;
    m.sheen = 0.25;
    m.sheenRoughness = 0.6;
    m.sheenColor.set("#fff1d8");
  } else {
    // Spec asks clearcoat .8 / env 1.2; under studio_small_09 that turned the black marble into chrome, so the coat is
    // thinner and blurrier and the base rougher: polished stone, not metal. (envMapIntensity is NOT set: three r186
    // ignores it for materials lit by scene.environment and uses scene.environmentIntensity instead.)
    m.color.set("#d8d0c8");
    m.clearcoat = 0.45;
    m.clearcoatRoughness = 0.18;
    m.roughness = 1.15;
  }
  m.name = color === "w" ? "marble-ivory" : "marble-ebony";
  return m;
}

/** Suspends until the GLB is loaded (meshopt-compressed, decoded in-bundle; nothing is fetched from a CDN). */
export function usePieceSet(): PieceSet {
  const gltf = useGLTF(PIECE_SET_URL, false, true);
  return useMemo(() => {
    gltf.scene.updateMatrixWorld(true);
    const nodes = gltf.nodes as Record<string, THREE.Object3D>;
    const get = (color: "w" | "b", kind: Kind) => {
      const key: PieceKey = `${color}${kind}`;
      let g = geometries.get(key);
      if (!g) {
        const mesh = findNode(nodes, color, kind);
        if (!mesh) throw new Error(`piece node missing: ${color}${kind}`);
        g = normalise(mesh);
        geometries.set(key, g);
        if (!heights.has(kind)) heights.set(kind, g.boundingBox!.max.y);
      }
      return g;
    };
    for (const c of ["w", "b"] as const) for (const k of ["p", "n", "b", "r", "q", "k"] as const) get(c, k);
    for (const c of ["w", "b"] as const) {
      if (!materials.has(c)) {
        const node = findNode(nodes, c, "k");
        const mesh = node ? meshesOf(node)[0] : undefined;
        materials.set(c, buildMaterial(c, mesh?.material as THREE.Material | undefined));
      }
    }
    return {
      geometry: get,
      material: (c) => materials.get(c)!,
      height: (k) => heights.get(k) ?? 1,
    };
  }, [gltf]);
}

/** Lathe/extrude fallback set. Never suspends. */
export function useProceduralPieceSet(): PieceSet {
  return useMemo(
    () => ({
      geometry: (c, k) => proceduralGeometry(k, c),
      material: (c) => proceduralMaterial(c),
      height: (k) => PROCEDURAL_HEIGHTS[k],
    }),
    [],
  );
}

export function disposePieceSets(): void {
  for (const g of geometries.values()) g.dispose();
  geometries.clear();
  heights.clear();
  for (const m of materials.values()) m.dispose();
  materials.clear();
  disposeProcedural();
}
