// Camera: a 55° elevation default pose (tactics stay readable), a top-down fly-in on mount that matches the 2D
// board's pixels, azimuth flip with the board orientation, `t` top view, double-click reset, and the exit rise.
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import type CameraControlsImpl from "camera-controls";
import { reducedMotion, urlFlag } from "@/lib/three/flags";
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
  const { orientation } = useBoard();
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
