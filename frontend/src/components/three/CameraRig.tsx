// Camera: a 55° elevation default pose (tactics stay readable), a top-down fly-in on mount that matches the 2D
// board's pixels, azimuth flip with the board orientation, `t` top view, double-click reset, the exit rise, a
// mate-finale push-in toward the winning king, and (high tier, stretch) an idle sway.
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import type CameraControlsImpl from "camera-controls";
import { squareToWorld } from "@/lib/three/coords";
import { initialTier, reducedMotion, urlFlag } from "@/lib/three/flags";
import { endAnim, startAnim } from "@/lib/three/animating";
import { useReplay } from "@/store/replay";
import { useBoard } from "./BoardContext";

const DEFAULT_POLAR = 0.611; // 35° from vertical = 55° elevation
const DEFAULT_DIST = 17; // 13.2 crops the near ranks at fov 32 on a square canvas; 17 fits the whole frame at 55°
const TOP_POLAR = 0.001;
const TOP_DIST = 4 / Math.tan((16 * Math.PI) / 180); // ≈ 13.95: the 8x8 board fills the square canvas at fov 32

/** The azimuth equivalent to `az` that is closest to the controls' current azimuth (shortest swing). */
function nearestAz(cc: CameraControlsImpl, az: number): number {
  const k = Math.round((cc.azimuthAngle - az) / (2 * Math.PI));
  return az + k * 2 * Math.PI;
}

export default function CameraRig() {
  const ref = useRef<CameraControlsImpl>(null);
  const gl = useThree((s) => s.gl);
  const { orientation, finale, pieces } = useBoard();
  const az = orientation === "white" ? 0 : Math.PI;
  const azRef = useRef(az);
  azRef.current = az;
  const top = useRef(false);
  const flown = useRef(false);

  const goDefault = (transition: boolean) => {
    const cc = ref.current;
    if (!cc) return;
    cc.smoothTime = 0.55;
    cc.rotateTo(nearestAz(cc, azRef.current), DEFAULT_POLAR, transition);
    cc.dollyTo(DEFAULT_DIST, transition);
    cc.setTarget(0, 0, 0, transition);
    top.current = false;
  };
  const goTop = (transition: boolean, smooth = 0.55) => {
    const cc = ref.current;
    if (!cc) return;
    cc.smoothTime = smooth;
    cc.rotateTo(nearestAz(cc, azRef.current), TOP_POLAR, transition);
    cc.dollyTo(TOP_DIST, transition);
    cc.setTarget(0, 0, 0, transition);
    top.current = true;
  };

  // Mount: sit top-down at the 2D-matching distance, then fly to the default pose once the first frame is up.
  useEffect(() => {
    const cc = ref.current;
    if (!cc) return;
    if (urlFlag("debug") === "1") (window as unknown as { __cc: CameraControlsImpl }).__cc = cc;
    const a = azRef.current;
    cc.setLookAt(Math.sin(a) * 0.001, TOP_DIST, Math.cos(a) * 0.001, 0, 0, 0, false);
    if (reducedMotion()) {
      goDefault(false);
      flown.current = true;
      return;
    }
    const onReady = () => {
      if (flown.current) return;
      flown.current = true;
      requestAnimationFrame(() => goDefault(true));
    };
    window.addEventListener("board3d:ready", onReady);
    // in case the ready event was already dispatched
    const fallback = window.setTimeout(onReady, 1500);
    return () => {
      window.removeEventListener("board3d:ready", onReady);
      window.clearTimeout(fallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flip: swing the azimuth the short way round.
  useEffect(() => {
    const cc = ref.current;
    if (!cc || !flown.current) return;
    cc.smoothTime = 0.55;
    cc.rotateAzimuthTo(nearestAz(cc, az), !reducedMotion());
  }, [az]);

  useEffect(() => {
    const onTop = () => (top.current ? goDefault(!reducedMotion()) : goTop(!reducedMotion()));
    const onExit = () => goTop(!reducedMotion(), 0.25);
    const onDbl = () => goDefault(!reducedMotion());
    window.addEventListener("board3d:top", onTop);
    window.addEventListener("board3d:exit", onExit);
    const el = gl.domElement;
    el.addEventListener("dblclick", onDbl);
    return () => {
      window.removeEventListener("board3d:top", onTop);
      window.removeEventListener("board3d:exit", onExit);
      el.removeEventListener("dblclick", onDbl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl]);

  // Mate finale (stretch): push in 25% closer, re-targeted toward the winning king. Stepping away restores
  // the default pose. Skipped under reduced motion, where the board simply stays put.
  useEffect(() => {
    const cc = ref.current;
    if (!cc || !flown.current || reducedMotion()) return;
    cc.smoothTime = 0.55;
    if (finale) {
      const king = pieces.find((p) => p.id === finale.winnerKingId);
      if (king) {
        const [kx, kz] = squareToWorld(king.square);
        cc.setTarget(kx * 0.5, 0, kz * 0.5, true);
        cc.dollyTo(DEFAULT_DIST * 0.75, true);
        return;
      }
    }
    goDefault(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finale]);

  // Idle sway (stretch, high tier only): after 5 s with no pointer/key input, not playing, not reduced motion
  // and the page visible, the azimuth sways gently. Capped at 45 s; any input or a state change ends it.
  const sway = useRef<{ on: boolean; t0: number; baseAz: number }>({ on: false, t0: 0, baseAz: 0 });
  useEffect(() => {
    if (initialTier() !== "high") return;
    let idleTimer: number | undefined;
    const stop = () => {
      if (!sway.current.on) return;
      sway.current.on = false;
      endAnim("idle:sway");
    };
    const resetIdle = () => {
      stop();
      window.clearTimeout(idleTimer);
      if (reducedMotion() || document.hidden) return;
      idleTimer = window.setTimeout(() => {
        const cc = ref.current;
        if (!cc || document.hidden || reducedMotion() || useReplay.getState().playing) return;
        sway.current = { on: true, t0: performance.now(), baseAz: cc.azimuthAngle };
        startAnim("idle:sway");
      }, 5000);
    };
    const onVis = () => (document.hidden ? stop() : resetIdle());
    window.addEventListener("pointerdown", resetIdle);
    window.addEventListener("pointermove", resetIdle);
    window.addEventListener("keydown", resetIdle);
    document.addEventListener("visibilitychange", onVis);
    resetIdle();
    return () => {
      window.clearTimeout(idleTimer);
      window.removeEventListener("pointerdown", resetIdle);
      window.removeEventListener("pointermove", resetIdle);
      window.removeEventListener("keydown", resetIdle);
      document.removeEventListener("visibilitychange", onVis);
      stop();
    };
  }, []);
  useFrame(() => {
    const s = sway.current;
    const cc = ref.current;
    if (!s.on || !cc) return;
    const t = (performance.now() - s.t0) / 1000;
    if (t > 45 || useReplay.getState().playing) {
      s.on = false;
      endAnim("idle:sway");
      return;
    }
    cc.rotateTo(s.baseAz + 0.1 * Math.sin(t * 0.35), cc.polarAngle, false);
  });

  return (
    <CameraControls
      ref={ref}
      makeDefault
      smoothTime={0.55}
      minPolarAngle={0.001}
      maxPolarAngle={1.15}
      minDistance={8}
      maxDistance={20}
      truckSpeed={0}
      dollyToCursor={false}
    />
  );
}
