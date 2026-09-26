import { Suspense, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Tier } from "@/lib/three/flags";
import { PALETTE } from "@/lib/three/palette";
import { BoardStateProvider } from "./BoardContext";
import Studio from "./Studio";
import BoardMesh from "./BoardMesh";
import Floor from "./Floor";
import Pieces from "./Pieces";
import Trays from "./Trays";
import Highlights from "./Highlights";
import MoveArrows from "./MoveArrows";
import CameraRig from "./CameraRig";
import Effects from "./Effects";
import SceneInvalidator from "./SceneInvalidator";

/** Mounts once the piece set has resolved; fires after the first frame that actually shows it. */
function FirstFrame({ onFirstFrame }: { onFirstFrame(): void }) {
  const { gl, scene, camera, invalidate } = useThree();
  const fired = useRef(false);
  useEffect(() => {
    try {
      gl.compile(scene, camera); // warm the shaders so the fly-in does not stutter
    } catch {
      /* ignore */
    }
    invalidate();
  }, [gl, scene, camera, invalidate]);
  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    requestAnimationFrame(() => {
      onFirstFrame();
      window.dispatchEvent(new CustomEvent("board3d:ready"));
    });
  });
  return null;
}

export default function Scene({ tier, onFirstFrame }: { tier: Tier; onFirstFrame(): void }) {
  return (
    <BoardStateProvider>
      <color attach="background" args={[PALETTE.bg]} />
      <fog attach="fog" args={[PALETTE.bg, 16, 30]} />
      <Studio tier={tier} />
      <BoardMesh />
      <Floor tier={tier} />
      <Suspense fallback={<Pieces procedural />}>
        <Pieces />
        <FirstFrame onFirstFrame={onFirstFrame} />
      </Suspense>
      <Trays />
      <Highlights />
      <MoveArrows />
      <CameraRig />
      {tier === "high" && <Effects />}
      <SceneInvalidator />
    </BoardStateProvider>
  );
}
