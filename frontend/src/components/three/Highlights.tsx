// Board overlays. Lead build: last-move squares. Track C adds the impact ring, check disc, verdict ring + chip, halo.
import { useMemo } from "react";
import * as THREE from "three";
import { squareToWorld } from "@/lib/three/coords";
import { HL_LAST } from "@/lib/three/palette";
import { useBoard } from "./BoardContext";

let roundedTex: THREE.CanvasTexture | null = null;
function roundedSquare(): THREE.CanvasTexture {
  if (roundedTex) return roundedTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.roundRect(4, 4, 120, 120, 14);
  ctx.fill();
  roundedTex = new THREE.CanvasTexture(c);
  return roundedTex;
}

const LAST = new THREE.Color(...HL_LAST);

function Square({ sq, opacity }: { sq: string; opacity: number }) {
  const [x, z] = squareToWorld(sq);
  const alpha = useMemo(roundedSquare, []);
  return (
    <mesh position={[x, 0.004, z]} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[0.98, 0.98]} />
      <meshBasicMaterial color={LAST} alphaMap={alpha} transparent opacity={opacity} toneMapped={false} depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
    </mesh>
  );
}

export default function Highlights() {
  const { lastMove } = useBoard();
  if (!lastMove) return null;
  return (
    <>
      <Square sq={lastMove[0]} opacity={0.25} />
      <Square sq={lastMove[1]} opacity={0.45} />
    </>
  );
}
