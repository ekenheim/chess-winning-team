// One piece, keyed by its stable id for the whole game (pieceIds.ts). Its target (a square, or a tray slot once
// captured) is authoritative; when it changes the tween restarts from the mesh's CURRENT position and scale, so rapid
// stepping retargets smoothly and never teleports. While anything moves it holds an animation key (animating.ts) so
// frameloop="demand" keeps rendering; when idle, useFrame returns immediately.
//
// Choreography per transition mode (BoardContext):
//   step  board->board  arc, eased; knights hop high and pitch along the travel axis; landing squash; castling rook late
//         board->tray   the victim waits until the mover's eased progress reaches CAPTURE_AT, pops up with a seeded tilt,
//                       then arcs into its tray slot shrinking to TRAY_SCALE (shared material: no fade, no transparency)
//         tray->board   the reverse arc (a backward step returns the captured piece)
//         tray->tray    value-sorted slots re-pack with a short flat slide, timed with the incoming capture
//         promotion     past e = 0.5 the geometry swaps to the new kind, spins 2π about Y and pulses its scale
//   jump  200 ms flat slide (board<->tray gets a low lift so it does not scythe through pieces)
//   snap  (hover scrub, game change, prefers-reduced-motion) everything is placed instantly
// The mated king topples about its base at the final ply (static under reduced motion) and stands up again on the way back.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { Kind, Piece } from "@/lib/three/pieceIds";
import { squareToWorld, trayPos } from "@/lib/three/coords";
import { endAnim, requestFrame, startAnim } from "@/lib/three/animating";
import { urlFlag } from "@/lib/three/flags";
import {
  CAPTURE_AT,
  JUMP_MS,
  POP_H,
  POP_MS,
  ROOK_DELAY_MS,
  SQUASH_MS,
  TOPPLE_ANGLE,
  TOPPLE_MS,
  TRAY_ARC_MS,
  TRAY_H,
  TRAY_SCALE,
  arcHeight,
  easeInOutCubic,
  easeInOutCubicInverse,
  easeOutCubic,
  moveDuration,
  reducedMotion,
  seeded,
  toppleCurve,
} from "@/lib/three/tween";
import { useReplay } from "@/store/replay";
import { useBoard, type BoardState } from "./BoardContext";
import { KNIGHT_YAW, type PieceSet } from "./usePieceSet";

type AnimKind = "arc" | "flat" | "snap" | "tray";

interface Anim {
  from: THREE.Vector3;
  to: THREE.Vector3;
  fromScale: number;
  toScale: number;
  t0: number;
  dur: number;
  delay: number;
  h: number;
  kind: AnimKind;
  phase: "idle" | "fly" | "squash";
  /** Capture pop before the tray arc (units of lift; 0 = none). */
  pop: number;
  /** Seeded tumble: axis (unit, horizontal) and peak angle. `tiltIn` = the tilt grows during the pop and decays in flight. */
  tiltAxis: THREE.Vector3;
  tilt: number;
  tiltIn: boolean;
  squash: boolean;
  /** Promotion (or un-promotion on a backward step) waiting to swap geometry at e = 0.5. */
  promo: { to: Kind; swapped: boolean } | null;
}

interface Topple {
  angle: number; // current rotation.z of the topple group
  from: number;
  to: number;
  t0: number;
  dur: number;
  delay: number;
  active: boolean;
}

const Y = new THREE.Vector3(0, 1, 0);
const axis = new THREE.Vector3();
const qTilt = new THREE.Quaternion();
const qSpin = new THREE.Quaternion();
const PROMO_SWAP_AT = 0.5;
const PROMO_PULSE = 0.15;
const T_CAPTURE = easeInOutCubicInverse(CAPTURE_AT); // mover's normalised time when its eased progress hits CAPTURE_AT

/** Did this colour castle in the current step? (king moved two files between the two frames) */
function castledThisStep(b: BoardState, color: "w" | "b"): boolean {
  if (b.transition.mode !== "step") return false;
  const a = b.frames[b.transition.from]?.find((p) => p.kind === "k" && p.color === color);
  const z = b.frames[b.transition.to]?.find((p) => p.kind === "k" && p.color === color);
  return !!a && !!z && Math.abs(a.square.charCodeAt(0) - z.square.charCodeAt(0)) === 2;
}

// ?debug=1: window.__pieces[id]() reports what each actor is really showing (for headless checks of the choreography).
const DEBUG = typeof window !== "undefined" && urlFlag("debug") === "1";
type DebugInfo = () => { kind: Kind; target: string; tray: number | null; x: number; y: number; z: number; s: number; topple: number };
const debugRegistry: Record<string, DebugInfo> = {};
if (DEBUG) (window as unknown as { __pieces: typeof debugRegistry }).__pieces = debugRegistry;

function animKey(id: string) {
  return `piece:${id}`;
}

export function PieceActor({ piece, set, dying, trayIndex }: { piece: Piece; set: PieceSet; dying?: boolean; trayIndex?: number }) {
  const pivot = useRef<THREE.Group>(null);
  const toppleG = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const board = useBoard();
  const anim = useRef<Anim>({
    from: new THREE.Vector3(),
    to: new THREE.Vector3(),
    fromScale: 1,
    toScale: 1,
    t0: 0,
    dur: 0,
    delay: 0,
    h: 0,
    kind: "snap",
    phase: "idle",
    pop: 0,
    tiltAxis: new THREE.Vector3(1, 0, 0),
    tilt: 0,
    tiltIn: false,
    squash: false,
    promo: null,
  });
  const topple = useRef<Topple>({ angle: 0, from: 0, to: 0, t0: 0, dur: 0, delay: 0, active: false });
  const first = useRef(true);
  const wasInTray = useRef(trayIndex != null);
  const [shownKind, setShownKind] = useState<Kind>(piece.kind);

  const geometry = set.geometry(piece.color, shownKind);
  const material = set.material(piece.color);
  const face = useMemo(() => new THREE.Quaternion().setFromAxisAngle(Y, shownKind === "n" ? KNIGHT_YAW[piece.color] : 0), [shownKind, piece.color]);
  const faceRef = useRef(face);
  faceRef.current = face;

  const inTray = trayIndex != null;
  const [tx, ty, tz] = inTray ? trayPos(piece.color, trayIndex) : (([x, z]) => [x, 0, z] as const)(squareToWorld(piece.square));
  const scale = inTray ? TRAY_SCALE : 1;
  const lateRook = piece.kind === "r" && !inTray && castledThisStep(board, piece.color);

  const stop = () => {
    const a = anim.current;
    if (a.phase !== "idle") {
      a.phase = "idle";
      endAnim(animKey(piece.id));
    }
  };

  // ---- position / scale retargeting -------------------------------------------------------------------------------
  useLayoutEffect(() => {
    const g = pivot.current;
    const m = mesh.current;
    if (!g) return;
    const entering = inTray && !wasInTray.current; // board -> tray (captured this transition)
    const leaving = !inTray && wasInTray.current; // tray -> board (a backward step / jump restores it)
    const repack = inTray && wasInTray.current; // tray slot changed (value sort shifted it)
    wasInTray.current = inTray;
    const to = new THREE.Vector3(tx, ty, tz);
    const a = anim.current;
    if (first.current) {
      first.current = false;
      g.position.copy(to);
      g.scale.setScalar(scale);
      return;
    }
    if (g.position.distanceToSquared(to) < 1e-6 && Math.abs(g.scale.y - scale) < 1e-4) {
      // Already there (e.g. a captured piece still waiting on its square when the user steps back): cancel any
      // pending flight so it does not leave for a target that is no longer current.
      if (a.phase !== "idle") {
        m?.quaternion.copy(faceRef.current);
        a.promo = null;
        stop();
        requestFrame();
      }
      return;
    }

    const { mode, from: fromPly, to: toPly } = board.transition;
    const rm = reducedMotion();
    const D = moveDuration(useReplay.getState().speed);
    if (mode === "snap" || rm) {
      g.position.copy(to);
      g.scale.setScalar(scale);
      m?.quaternion.copy(faceRef.current);
      a.promo = null;
      stop();
      requestFrame();
      return;
    }

    const dist = Math.hypot(to.x - g.position.x, to.z - g.position.z);
    a.from.copy(g.position);
    a.to.copy(to);
    a.fromScale = g.scale.x; // retarget from the current (possibly mid-flight) scale
    a.toScale = scale;
    a.t0 = performance.now();
    a.pop = 0;
    a.tilt = 0;
    a.tiltIn = false;
    a.squash = false;
    a.delay = 0;
    if (a.promo?.swapped) a.promo = null; // a finished swap must not keep spinning on the next flight

    if (mode === "step") {
      const forward = toPly > fromPly;
      if (entering) {
        // the victim waits for the capturer to (almost) arrive, pops, and arcs into the tray
        a.kind = "tray";
        a.delay = forward ? T_CAPTURE * D : 0;
        a.dur = TRAY_ARC_MS;
        a.h = TRAY_H;
        a.pop = POP_H;
        a.tiltIn = true;
      } else if (leaving) {
        // the backward step lifts it out of the tray and lands it back on its square
        a.kind = "tray";
        a.dur = Math.max(TRAY_ARC_MS, D);
        a.h = TRAY_H;
      } else if (repack) {
        a.kind = "flat";
        a.delay = forward ? T_CAPTURE * D + POP_MS : 0;
        a.dur = TRAY_ARC_MS * 0.6;
        a.h = 0.12;
      } else {
        a.kind = "arc";
        a.dur = D;
        a.delay = lateRook ? ROOK_DELAY_MS : 0;
        a.h = lateRook ? 0.25 : arcHeight(piece.kind, dist);
        a.squash = true;
      }
      if (a.kind === "tray") {
        // seeded tumble: a small tilt about a random horizontal axis, the same on every replay of this piece
        const ang = seeded(piece.id, 1) * Math.PI * 2;
        a.tiltAxis.set(Math.cos(ang), 0, Math.sin(ang));
        a.tilt = (0.25 + 0.2 * seeded(piece.id, 2)) * (seeded(piece.id, 3) < 0.5 ? -1 : 1);
      }
    } else {
      // jump: everything slides in JUMP_MS; board<->tray gets a low lift so it clears the pieces
      a.kind = "flat";
      a.dur = JUMP_MS;
      a.h = entering || leaving ? 0.6 : 0;
    }
    if (a.phase === "idle") startAnim(animKey(piece.id));
    a.phase = "fly";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx, ty, tz, scale]);

  // ---- promotion: hold the old geometry until mid-flight on an animated step, else swap now ------------------------
  useLayoutEffect(() => {
    const a = anim.current;
    if (piece.kind === shownKind) {
      a.promo = null; // stepped back before the swap happened
      return;
    }
    if (a.phase === "fly" && board.transition.mode === "step" && !reducedMotion()) {
      a.promo = { to: piece.kind, swapped: false };
    } else {
      a.promo = null;
      setShownKind(piece.kind);
      requestFrame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piece.kind]);

  // ---- mate finale: the mated king topples about its base ----------------------------------------------------------
  const mated = !inTray && board.finale?.matedKingId === piece.id;
  useLayoutEffect(() => {
    const tg = toppleG.current;
    if (!tg) return;
    const tp = topple.current;
    // fall away from the board centre so the king does not land on its neighbours
    const target = mated ? TOPPLE_ANGLE * (tx > 0 ? -1 : 1) : 0;
    if (Math.abs(target - tp.angle) < 1e-4 && !tp.active) return;
    const mode = board.transition.mode;
    if (reducedMotion() || mode === "snap" || first.current) {
      tp.angle = target;
      tg.rotation.z = target;
      if (tp.active) {
        tp.active = false;
        endAnim(`topple:${piece.id}`);
      }
      requestFrame();
      return;
    }
    tp.from = tp.angle;
    tp.to = target;
    tp.t0 = performance.now();
    tp.dur = mated ? TOPPLE_MS : 350;
    // let the mating move land (and the check disc show) before the king goes over
    tp.delay = mated ? (mode === "step" ? moveDuration(useReplay.getState().speed) + 120 : JUMP_MS + 80) : 0;
    if (!tp.active) startAnim(`topple:${piece.id}`);
    tp.active = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mated]);

  const shownRef = useRef(shownKind);
  shownRef.current = shownKind;
  useEffect(() => {
    if (!DEBUG) return;
    const r = (n: number) => Math.round(n * 1000) / 1000;
    debugRegistry[piece.id] = () => {
      const g = pivot.current;
      return { kind: shownRef.current, target: piece.square, tray: trayIndex ?? null, x: r(g?.position.x ?? NaN), y: r(g?.position.y ?? NaN), z: r(g?.position.z ?? NaN), s: r(g?.scale.y ?? NaN), topple: r(topple.current.angle) };
    };
    return () => {
      delete debugRegistry[piece.id];
    };
  });

  useEffect(
    () => () => {
      endAnim(animKey(piece.id));
      endAnim(`topple:${piece.id}`);
    },
    [piece.id],
  );

  useFrame(() => {
    const a = anim.current;
    const tp = topple.current;
    if (a.phase === "idle" && !tp.active) return;
    const now = performance.now();

    if (tp.active && toppleG.current) {
      const t = (now - tp.t0 - tp.delay) / tp.dur;
      if (t >= 1) {
        tp.angle = tp.to;
        tp.active = false;
        endAnim(`topple:${piece.id}`);
      } else if (t > 0) {
        const k = tp.to !== 0 ? toppleCurve(t) : easeInOutCubic(t);
        tp.angle = tp.from + (tp.to - tp.from) * k;
      }
      toppleG.current.rotation.z = tp.angle;
    }

    const g = pivot.current;
    const m = mesh.current;
    if (!g || !m || a.phase === "idle") return;
    const face = faceRef.current;

    if (a.phase === "fly") {
      const el = now - a.t0 - a.delay;
      if (el < 0) return; // waiting (the captured piece holds its square until the capturer arrives)
      // capture pop: rise POP_H while the tumble grows, then the arc starts from the popped position
      if (a.pop > 0 && el < POP_MS) {
        const u = easeOutCubic(el / POP_MS);
        g.position.set(a.from.x, a.from.y + a.pop * u, a.from.z);
        qTilt.setFromAxisAngle(a.tiltAxis, a.tilt * u);
        m.quaternion.copy(qTilt).multiply(face);
        return;
      }
      const t = Math.min(1, (el - (a.pop > 0 ? POP_MS : 0)) / a.dur);
      const e = easeInOutCubic(t);
      const y0 = a.from.y + a.pop;
      g.position.set(
        a.from.x + (a.to.x - a.from.x) * e,
        y0 + (a.to.y - y0) * e + a.h * 4 * e * (1 - e),
        a.from.z + (a.to.z - a.from.z) * e,
      );
      let s = a.fromScale + (a.toScale - a.fromScale) * e;

      // orientation: tray tumble / knight pitch / promotion spin, composed onto the facing yaw
      qTilt.identity();
      if (a.kind === "tray" && a.tilt !== 0) {
        const k = a.tiltIn ? 1 - e : Math.sin(Math.PI * e);
        qTilt.setFromAxisAngle(a.tiltAxis, a.tilt * k);
      } else if (piece.kind === "n" && shownKind === "n" && a.kind === "arc" && a.h > 0.5) {
        // hop pitch about the horizontal axis perpendicular to the travel direction
        axis.set(a.to.z - a.from.z, 0, -(a.to.x - a.from.x));
        if (axis.lengthSq() > 1e-8) qTilt.setFromAxisAngle(axis.normalize(), 0.3 * Math.sin(Math.PI * e));
      }
      qSpin.identity();
      const pr = a.promo;
      if (pr) {
        if (!pr.swapped && e >= PROMO_SWAP_AT) {
          pr.swapped = true;
          setShownKind(pr.to);
        }
        if (pr.swapped) {
          const u = Math.max(0, Math.min(1, (e - PROMO_SWAP_AT) / (1 - PROMO_SWAP_AT)));
          qSpin.setFromAxisAngle(Y, Math.PI * 2 * easeOutCubic(u));
          s *= 1 + PROMO_PULSE * Math.sin(Math.PI * u);
        }
      }
      m.quaternion.copy(qTilt).multiply(qSpin).multiply(face);
      g.scale.setScalar(s);

      if (t >= 1) {
        g.position.copy(a.to);
        m.quaternion.copy(face);
        if (pr && !pr.swapped) setShownKind(pr.to); // very short flights can skip past the swap point
        a.promo = null;
        if (!a.squash || a.h === 0 || reducedMotion()) {
          g.scale.setScalar(a.toScale);
          stop();
          return;
        }
        a.phase = "squash";
        a.t0 = now;
      }
      return;
    }

    // landing squash: scale.y .92 -> 1, scale.xz 1.04 -> 1
    const t = Math.min(1, (now - a.t0) / SQUASH_MS);
    const k = 1 - t * t;
    const sc = a.toScale;
    g.scale.set(sc * (1 + 0.04 * k), sc * (1 - 0.08 * k), sc * (1 + 0.04 * k));
    if (t >= 1) {
      g.scale.setScalar(sc);
      stop();
    }
  });

  return (
    <group ref={pivot} visible={!dying}>
      <group ref={toppleG}>
        <mesh ref={mesh} geometry={geometry} material={material} quaternion={face} castShadow receiveShadow />
      </group>
    </group>
  );
}
