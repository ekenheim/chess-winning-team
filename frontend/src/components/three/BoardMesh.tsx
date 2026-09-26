// The board: a lacquered maple/walnut playing surface, a rounded walnut frame, an engraved rim with coordinates on all
// four sides, and a faint amber inlay around the 8x8 that brightens at checkmate. Static: nothing here animates per
// frame, so it never holds an animation key (frameloop="demand" stays idle).
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { PALETTE } from "@/lib/three/palette";
import { requestFrame } from "@/lib/three/animating";
import { RIM_UNITS, makeBoardTextures } from "./boardTextures";
import { useBoard } from "./BoardContext";

const INLAY = new THREE.Color(...PALETTE.inlay);
const SURFACE_NORMAL = new THREE.Vector2(0.35, 0.35);
const RIM_NORMAL = new THREE.Vector2(0.6, 0.6);
const FRAME_NORMAL_UV = 0.22; // frame grain repeat: texture tiles per ~4.5 world units
const INLAY_W = 0.03;
const INLAY_AT = 4 + INLAY_W / 2 + 0.002;
const INLAY_BARS: [number, number, number, number][] = [
  [0, INLAY_AT, 8 + 2 * INLAY_W, INLAY_W],
  [0, -INLAY_AT, 8 + 2 * INLAY_W, INLAY_W],
  [INLAY_AT, 0, INLAY_W, 8],
  [-INLAY_AT, 0, INLAY_W, 8],
];

/**
 * RoundedBox's ExtrudeGeometry UVs run the wrong way on two of the four sides (grain would stand vertically), so the
 * frame gets box-projected UVs once: each vertex takes the two world axes perpendicular to its dominant normal, with
 * the grain (texture u) running along each side's length.
 */
function boxProjectUVs(g: THREE.BufferGeometry) {
  const pos = g.getAttribute("position");
  const nor = g.getAttribute("normal");
  if (!pos || !nor) return;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const ax = Math.abs(nor.getX(i)), ay = Math.abs(nor.getY(i)), az = Math.abs(nor.getZ(i));
    let u: number, v: number;
    if (ax >= ay && ax >= az) (u = z), (v = y); // ±x sides: grain along z
    else if (az >= ay) (u = x), (v = y); // ±z sides: grain along x
    else (u = x), (v = z); // top/bottom
    uv[i * 2] = u * FRAME_NORMAL_UV;
    uv[i * 2 + 1] = v * FRAME_NORMAL_UV + 0.5;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
}

export default function BoardMesh() {
  const t = useMemo(() => makeBoardTextures(), []);
  const finale = useBoard().finale;
  const inlayOpacity = finale ? 0.9 : 0.35;
  const frameRef = useRef<THREE.Mesh>(null);
  const gl = useThree((s) => s.gl);

  // The canvas is created with alpha:false, which makes three clear every render target to alpha 1. drei's
  // ContactShadows renders into its own target and expects alpha 0 where nothing is, so with alpha 1 both contact
  // shadow planes became a uniform black film: the board rendered at ~half brightness and the maple read as grey.
  // The canvas has no alpha channel, so clearing with alpha 0 changes nothing else (scene.background paints the ground).
  useLayoutEffect(() => {
    if (gl.getClearAlpha() !== 0) {
      gl.setClearAlpha(0);
      requestFrame();
    }
  }, [gl]);

  useLayoutEffect(() => {
    const g = frameRef.current?.geometry;
    if (!g || g.userData.boxUV) return;
    boxProjectUVs(g);
    g.userData.boxUV = true;
    requestFrame();
  });

  useLayoutEffect(() => {
    requestFrame();
  }, [inlayOpacity]);

  return (
    <group>
      {/* playing surface: lacquered, so the clearcoat carries the sharp reflections over the wood's own roughness */}
      <mesh rotation-x={-Math.PI / 2} position-y={0} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshPhysicalMaterial
          map={t.map}
          roughnessMap={t.roughnessMap}
          roughness={1}
          normalMap={t.normalMap}
          normalScale={SURFACE_NORMAL}
          clearcoat={1}
          clearcoatRoughness={0.06}
        />
      </mesh>
      {/* walnut frame (top face sits just under the rim plane so nothing z-fights) */}
      <RoundedBox ref={frameRef} args={[9.2, 0.42, 9.2]} radius={0.14} smoothness={6} position-y={-0.215} receiveShadow castShadow>
        <meshPhysicalMaterial
          map={t.frameMap}
          roughnessMap={t.frameRoughness}
          roughness={1}
          clearcoat={0.7}
          clearcoatRoughness={0.14}
        />
      </RoundedBox>
      {/* engraved rim with coordinates on all four sides; the 8x8 hole is transparent */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.001} receiveShadow>
        <planeGeometry args={[RIM_UNITS, RIM_UNITS]} />
        <meshPhysicalMaterial
          map={t.rimMap}
          roughnessMap={t.rimRoughness}
          roughness={1}
          normalMap={t.rimNormal}
          normalScale={RIM_NORMAL}
          alphaTest={0.5}
          clearcoat={0.7}
          clearcoatRoughness={0.14}
        />
      </mesh>
      {/* amber inlay along the 8x8 border: emissive-only (toneMapped off) so it is the one board part Bloom picks up */}
      {INLAY_BARS.map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 0.003, z]}>
          <boxGeometry args={[w, 0.006, d]} />
          <meshBasicMaterial color={INLAY} toneMapped={false} transparent opacity={inlayOpacity} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
