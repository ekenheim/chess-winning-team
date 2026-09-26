import { MeshReflectorMaterial } from "@react-three/drei";
import type { Tier } from "@/lib/three/flags";

export default function Floor({ tier }: { tier: Tier }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.42} receiveShadow>
      <planeGeometry args={[60, 60]} />
      {tier === "high" ? (
        <MeshReflectorMaterial
          resolution={512}
          blur={[300, 80]}
          mixBlur={1}
          mixStrength={1.4}
          mirror={0.45}
          roughness={1}
          metalness={0.5}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#100d0b"
        />
      ) : (
        <meshStandardMaterial color="#100d0b" roughness={0.9} />
      )}
    </mesh>
  );
}
