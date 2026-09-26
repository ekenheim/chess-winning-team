// The 3D replay board. Lazy-loaded by BoardSwitch; everything three-related lives behind this import.
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, type RootState } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { initialTier, urlFlag, type Tier } from "@/lib/three/flags";
import { isAnimating } from "@/lib/three/animating";
import { devAssertPalette } from "@/lib/three/palette";
import ErrorBoundary from "./ErrorBoundary";
import Scene from "./Scene";
import { disposePieceSets } from "./usePieceSet";
import { disposeBoardTextures } from "./boardTextures";

/** One-way tier drop when animated frames run slow. Only samples consecutive animated frames, because a
 * demand-driven loop has long idle gaps that a plain fps counter would misread as a stall. */
function PerfGuard({ onDecline }: { onDecline(): void }) {
  const acc = useRef({ n: 0, sum: 0, wasAnimating: false, done: false });
  useFrame((_, dt) => {
    const a = acc.current;
    if (a.done) return;
    const now = isAnimating();
    if (now && a.wasAnimating && dt < 1) {
      a.n++;
      a.sum += dt;
      if (a.n >= 90) {
        if (a.sum / a.n > 1 / 28) {
          a.done = true;
          onDecline();
        } else {
          a.n = 0;
          a.sum = 0;
        }
      }
    }
    a.wasAnimating = now;
  });
  return null;
}

export default function Board3D({ onReady, onFail }: { onReady(): void; onFail(reason: string): void }) {
  const forced = urlFlag("gl") != null;
  const [tier, setTier] = useState<Tier>(initialTier);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    devAssertPalette();
    return () => {
      disposePieceSets();
      disposeBoardTextures();
    };
  }, []);

  // low: no composer, the renderer tone-maps. high: the composer's ToneMapping pass does it.
  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    gl.toneMapping = tier === "low" ? THREE.AgXToneMapping : THREE.NoToneMapping;
  }, [tier]);

  const onCreated = (state: RootState) => {
    const { gl } = state;
    glRef.current = gl;
    if (urlFlag("debug") === "1") {
      (window as unknown as { __gl: THREE.WebGLRenderer }).__gl = gl;
      (window as unknown as { __state: RootState }).__state = state;
    }
    gl.domElement.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      onFail("context lost");
    });
    if (!forced) {
      try {
        const ctx = gl.getContext();
        const ext = ctx.getExtension("WEBGL_debug_renderer_info");
        const renderer = ext ? String(ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
        if (/swiftshader|llvmpipe|software/i.test(renderer)) setTier("low");
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <Canvas
      frameloop="demand"
      shadows="percentage"
      dpr={[1, tier === "high" ? 1.75 : 1]}
      camera={{ fov: 32, near: 0.1, far: 80, position: [0, 13.95, 0.001] }}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: tier === "low" ? THREE.AgXToneMapping : THREE.NoToneMapping,
      }}
      onCreated={onCreated}
      style={{ width: "100%", height: "100%" }}
    >
      <ErrorBoundary onError={() => onFail("scene error")}>
        <Scene tier={tier} onFirstFrame={onReady} />
      </ErrorBoundary>
      {!forced && <PerfGuard onDecline={() => setTier("low")} />}
      <AdaptiveDpr pixelated={false} />
    </Canvas>
  );
}
