// Played-vs-best 3D arrows: a Bezier tube with a cone head, drawn in over 350 ms. Shown only under the same
// condition as the 2D board's arrows (computed once, in BoardContext, as `arrowPair`).
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { squareToWorld } from "@/lib/three/coords";
import { HL_BEST, HL_PLAYED } from "@/lib/three/palette";
import { endAnim, startAnim } from "@/lib/three/animating";
import { reducedMotion } from "@/lib/three/flags";
import { useBoard } from "./BoardContext";

const DRAW_MS = 350;
const TUBE_SEGMENTS = 64;
const RADIAL_SEGMENTS = 10;
const TUBE_RADIUS = 0.055;
const CONE_ARGS: [number, number, number] = [0.16, 0.35, 16];

function buildCurve(from: [number, number], to: [number, number], heightScale: number): THREE.QuadraticBezierCurve3 {
  const [fx, fz] = from;
  const [tx, tz] = to;
  const dist = Math.hypot(tx - fx, tz - fz);
  const midY = (0.7 + 0.12 * dist) * heightScale;
  return new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(fx, 0.05, fz),
    new THREE.Vector3((fx + tx) / 2, midY, (fz + tz) / 2),
    new THREE.Vector3(tx, 0.05, tz),
  );
}

function Arrow({ squares, color, heightScale, opacity, animKey }: { squares: [string, string]; color: [number, number, number]; heightScale: number; opacity: number; animKey: string }) {
  const from = squareToWorld(squares[0]);
  const to = squareToWorld(squares[1]);
  const col = useMemo(() => new THREE.Color(...color), [color]);

  const built = useMemo(() => {
    const curve = buildCurve(from, to, heightScale);
    const geo = new THREE.TubeGeometry(curve, TUBE_SEGMENTS, TUBE_RADIUS, RADIAL_SEGMENTS, false);
    const full = geo.index ? geo.index.count : geo.attributes.position.count;
    return { curve, geo, full };
    // from/to are plain number tuples (new each render), so key on the squares + heightScale instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [squares[0], squares[1], heightScale]);

  const coneRef = useRef<THREE.Mesh>(null);
  const drawn = useRef({ t0: performance.now(), done: false });

  useEffect(() => {
    const { geo, full } = built;
    if (reducedMotion()) {
      geo.setDrawRange(0, full);
      drawn.current.done = true;
      if (coneRef.current) coneRef.current.visible = true;
    } else {
      geo.setDrawRange(0, 0);
      drawn.current = { t0: performance.now(), done: false };
      if (coneRef.current) coneRef.current.visible = false;
      startAnim(animKey);
    }
    return () => {
      geo.dispose();
      endAnim(animKey);
    };
  }, [built, animKey]);

  useFrame(() => {
    if (drawn.current.done) return;
    const t = Math.min(1, (performance.now() - drawn.current.t0) / DRAW_MS);
    const count = Math.round((built.full * t) / 3) * 3;
    built.geo.setDrawRange(0, count);
    if (t >= 1) {
      drawn.current.done = true;
      if (coneRef.current) coneRef.current.visible = true;
      endAnim(animKey);
    }
  });

  const point = built.curve.getPoint(1);
  const tangent = built.curve.getTangent(1).normalize();
  const quat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent), [tangent]);

  return (
    <group>
      <mesh geometry={built.geo}>
        <meshBasicMaterial color={col} transparent opacity={opacity} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh ref={coneRef} position={[point.x, point.y, point.z]} quaternion={[quat.x, quat.y, quat.z, quat.w]} visible={false}>
        <coneGeometry args={CONE_ARGS} />
        <meshBasicMaterial color={col} transparent opacity={opacity} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function MoveArrows() {
  const { arrowPair } = useBoard();
  if (!arrowPair) return null;
  return (
    <>
      <Arrow squares={arrowPair.best} color={HL_BEST} heightScale={1} opacity={1} animKey="arrow:best" />
      <Arrow squares={arrowPair.played} color={HL_PLAYED} heightScale={0.6} opacity={0.6} animKey="arrow:played" />
    </>
  );
}
