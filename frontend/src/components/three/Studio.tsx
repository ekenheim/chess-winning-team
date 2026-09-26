// Lighting: a small studio HDRI (Poly Haven, CC0, shipped in public/hdri) plus Lightformers for the marble
// reflections, one shadow-casting key light, and contact shadows on the board and under the frame.
import { Suspense } from "react";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type { Tier } from "@/lib/three/flags";
import ErrorBoundary from "./ErrorBoundary";

export const HDRI_URL = "/hdri/studio_small_09_1k.hdr";

function Formers() {
  return (
    <>
      <Lightformer form="rect" intensity={2.2} position={[-3, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 0.6, 1]} />
      <Lightformer form="rect" intensity={2.2} position={[3, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 0.6, 1]} />
      <Lightformer form="rect" intensity={1.6} color="#ffd6a0" position={[-7, 3, -2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
      <Lightformer form="ring" intensity={3} color="#f5b64a" position={[6, 3, 5]} scale={2} target={[0, 0, 0]} />
    </>
  );
}

function LightformerEnv() {
  return (
    <Environment resolution={256} frames={1} environmentIntensity={0.85}>
      <Formers />
    </Environment>
  );
}

function HdriEnv() {
  return (
    <Environment files={HDRI_URL} resolution={512} frames={1} environmentIntensity={0.85} environmentRotation={[0, 0.6, 0]}>
      <Formers />
    </Environment>
  );
}

// The post-processing composer (high tier) sets gl.autoClear = false and drei's ContactShadows never clears its render
// target itself, so every piece base that ever touched the board stayed baked in the shadow texture. These two run in
// mount order around the ContactShadows frame hooks: clear on for them, then back to whatever the composer wants.
let autoClearBefore = true;
function AutoClearOn() {
  const gl = useThree((s) => s.gl);
  useFrame(() => {
    autoClearBefore = gl.autoClear;
    gl.autoClear = true;
  });
  return null;
}
function AutoClearRestore() {
  const gl = useThree((s) => s.gl);
  useFrame(() => {
    gl.autoClear = autoClearBefore;
  });
  return null;
}

export default function Studio({ tier }: { tier: Tier }) {
  const mapSize = tier === "high" ? 2048 : 1024;
  return (
    <>
      <ErrorBoundary fallback={<LightformerEnv />}>
        <Suspense fallback={<LightformerEnv />}>
          <HdriEnv />
        </Suspense>
      </ErrorBoundary>
      <directionalLight
        castShadow
        position={[4.5, 9, 3.5]}
        intensity={1.4}
        color="#fff4e6"
        shadow-mapSize={[mapSize, mapSize]}
        shadow-radius={6}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
      <hemisphereLight intensity={0.15} color="#fff4e6" groundColor="#2a1a10" />
      <AutoClearOn />
      <ContactShadows position={[0, 0.002, 0]} scale={8.4} far={1.2} blur={2} opacity={0.5} resolution={512} color="#1a1008" />
      {/* baked once: only the board frame (y -0.425..-0.005) may fall into it, never the pieces, or their start-position shadows would stay forever */}
      <ContactShadows position={[0, -0.419, 0]} scale={14} far={0.5} blur={2.4} opacity={0.6} resolution={512} frames={1} color="#000000" />
      <AutoClearRestore />
    </>
  );
}
