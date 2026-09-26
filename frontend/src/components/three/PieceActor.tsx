// One piece. Its target square is authoritative; when it changes, the tween restarts from the mesh's CURRENT
// position (so rapid stepping never teleports). Holds an animation key while moving so demand mode keeps rendering.
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { Piece } from "@/lib/three/pieceIds";
import { squareToWorld, trayPos } from "@/lib/three/coords";
import { endAnim, requestFrame, startAnim } from "@/lib/three/animating";
import { JUMP_MS, ROOK_DELAY_MS, SQUASH_MS, arcHeight, easeInOutCubic, moveDuration, reducedMotion } from "@/lib/three/tween";
import { useReplay } from "@/store/replay";
import { useBoard, type BoardState } from "./BoardContext";
import { KNIGHT_YAW, type PieceSet } from "./usePieceSet";

interface Anim {
  from: THREE.Vector3;
  to: THREE.Vector3;
  t0: number;
  dur: number;
  delay: number;
  h: number;
  kind: "arc" | "flat" | "snap" | "tray";
  phase: "idle" | "fly" | "squash";
}

const Y = new THREE.Vector3(0, 1, 0);
const axis = new THREE.Vector3();
const tilt = new THREE.Quaternion();

/** Did this colour castle in the current step? (king moved two files between the two frames) */
function castledThisStep(b: BoardState, color: "w" | "b"): boolean {
  if (b.transition.mode !== "step") return false;
  const a = b.frames[b.transition.from]?.find((p) => p.kind === "k" && p.color === color);
  const z = b.frames[b.transition.to]?.find((p) => p.kind === "k" && p.color === color);
  return !!a && !!z && Math.abs(a.square.charCodeAt(0) - z.square.charCodeAt(0)) === 2;
}

export function PieceActor({ piece, set, dying, trayIndex }: { piece: Piece; set: PieceSet; dying?: boolean; trayIndex?: number }) {
  const pivot = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const board = useBoard();
  const anim = useRef<Anim>({ from: new THREE.Vector3(), to: new THREE.Vector3(), t0: 0, dur: 0, delay: 0, h: 0, kind: "snap", phase: "idle" });
  const first = useRef(true);

  const geometry = set.geometry(piece.color, piece.kind);
  const material = set.material(piece.color);
  const face = useMemo(() => new THREE.Quaternion().setFromAxisAngle(Y, piece.kind === "n" ? KNIGHT_YAW[piece.color] : 0), [piece.kind, piece.color]);

  const inTray = trayIndex != null;
  const [tx, ty, tz] = inTray ? trayPos(piece.color, trayIndex) : (([x, z]) => [x, 0, z] as const)(squareToWorld(piece.square));
  const scale = inTray ? 0.62 : 1;
  const lateRook = piece.kind === "r" && !inTray && castledThisStep(board, piece.color);

  useLayoutEffect(() => {
    const g = pivot.current;
    if (!g) return;
    const to = new THREE.Vector3(tx, ty, tz);
    if (first.current) {
      first.current = false;
      g.position.copy(to);
      g.scale.setScalar(scale);
      return;
    }
    if (g.position.distanceToSquared(to) < 1e-6) return;
    const a = anim.current;
    const mode = board.transition.mode;
    let dur = mode === "step" ? moveDuration(useReplay.getState().speed) : mode === "jump" ? JUMP_MS : 0;
    if (reducedMotion()) dur = 0;
    if (dur === 0) {
      g.position.copy(to);
      g.scale.setScalar(scale);
      mesh.current?.quaternion.copy(face);
      if (a.phase !== "idle") {
        a.phase = "idle";
        endAnim(piece.id);
      }
      requestFrame();
      return;
    }
    const dist = Math.hypot(to.x - g.position.x, to.z - g.position.z);
    a.from.copy(g.position);
    a.to.copy(to);
    a.t0 = performance.now();
    a.dur = dur;
    a.delay = lateRook ? ROOK_DELAY_MS : 0;
    a.h = mode === "step" ? (lateRook ? 0.25 : inTray ? 1.5 : arcHeight(piece.kind, dist)) : 0;
    a.kind = inTray ? "tray" : mode === "step" ? "arc" : "flat";
    a.phase = "fly";
    startAnim(piece.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx, ty, tz]);

  useFrame(() => {
    const a = anim.current;
    const g = pivot.current;
    const m = mesh.current;
    if (!g || !m || a.phase === "idle") return;
    const now = performance.now();
    if (a.phase === "fly") {
      let t = (now - a.t0 - a.delay) / a.dur;
      if (t < 0) t = 0;
      if (t >= 1) {
        g.position.copy(a.to);
        m.quaternion.copy(face);
        if (a.h === 0 || reducedMotion()) {
          g.scale.setScalar(scale);
          a.phase = "idle";
          endAnim(piece.id);
          return;
        }
        a.phase = "squash";
        a.t0 = now;
        return;
      }
      const e = easeInOutCubic(t);
      g.position.lerpVectors(a.from, a.to, e);
      g.position.y = a.from.y + (a.to.y - a.from.y) * e + a.h * 4 * e * (1 - e);
      const s = THREE.MathUtils.lerp(g.scale.x, scale, 0.2);
      g.scale.setScalar(s);
      if (piece.kind === "n" && a.h > 0.5) {
        // nose-up hop about the axis perpendicular to the travel direction
        axis.set(a.to.z - a.from.z, 0, -(a.to.x - a.from.x));
        if (axis.lengthSq() > 1e-8) {
          axis.normalize();
          tilt.setFromAxisAngle(axis, 0.3 * Math.sin(Math.PI * e));
          m.quaternion.copy(tilt).multiply(face);
        }
      }
    } else {
      // landing squash: scale.y .92 -> 1, scale.xz 1.04 -> 1
      const t = Math.min(1, (now - a.t0) / SQUASH_MS);
      const k = 1 - t * t;
      g.scale.set(scale * (1 + 0.04 * k), scale * (1 - 0.08 * k), scale * (1 + 0.04 * k));
      if (t >= 1) {
        g.scale.setScalar(scale);
        a.phase = "idle";
        endAnim(piece.id);
      }
    }
  });

  return (
    <group ref={pivot} visible={!dying}>
      <mesh ref={mesh} geometry={geometry} material={material} quaternion={face} castShadow receiveShadow />
    </group>
  );
}
