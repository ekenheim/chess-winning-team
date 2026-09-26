import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { PALETTE } from "@/lib/three/palette";
import { makeBoardTextures } from "./boardTextures";
import { useBoard } from "./BoardContext";

const INLAY = new THREE.Color(...PALETTE.inlay);

export default function BoardMesh() {
  const t = useMemo(() => makeBoardTextures(), []);
  const finale = useBoard().finale;
  const inlayOpacity = finale ? 0.9 : 0.35;
  return (
    <group>
      {/* playing surface */}
      <mesh rotation-x={-Math.PI / 2} position-y={0} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshPhysicalMaterial
          map={t.map}
          roughnessMap={t.roughnessMap}
          normalMap={t.normalMap}
          normalScale={new THREE.Vector2(0.35, 0.35)}
          clearcoat={1}
          clearcoatRoughness={0.06}
        />
      </mesh>
      {/* walnut frame (top face sits just under the rim plane so nothing z-fights) */}
      <RoundedBox args={[9.2, 0.42, 9.2]} radius={0.14} smoothness={6} position-y={-0.215} receiveShadow castShadow>
        <meshPhysicalMaterial color={PALETTE.walnut} roughness={0.5} clearcoat={0.7} clearcoatRoughness={0.2} />
      </RoundedBox>
      {/* rim with coordinates; the 8x8 hole is transparent */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.001} receiveShadow>
        <planeGeometry args={[9.2, 9.2]} />
        <meshPhysicalMaterial map={t.rimMap} roughnessMap={t.rimRoughness} transparent alphaTest={0.5} clearcoat={0.6} clearcoatRoughness={0.25} />
      </mesh>
      {/* amber inlay along the 8x8 border */}
      {[
        [0, 4.015, 8.06, 0.03],
        [0, -4.015, 8.06, 0.03],
        [4.015, 0, 0.03, 8.06],
        [-4.015, 0, 0.03, 8.06],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 0.004, z]}>
          <boxGeometry args={[w, 0.006, d]} />
          <meshBasicMaterial color={INLAY} toneMapped={false} transparent opacity={inlayOpacity} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
