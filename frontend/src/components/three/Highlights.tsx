// Board overlays: last-move squares, a landing impact ring, a pulsing check disc, the verdict ring + Html chip
// (reusing the 2D badge's glyph and colours), and the mate-finale halo. All layers sit at y=.004, unlit
// (toneMapped=false) and depthWrite=false with a polygon offset so they never z-fight the board surface.
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { motion } from "motion/react";
import { JUDGE_GLYPH, type Judgement } from "@/lib/chess";
import { squareToWorld } from "@/lib/three/coords";
import { HL_CHECK, HL_HALO, HL_LAST, badgeRing } from "@/lib/three/palette";
import { endAnim, startAnim } from "@/lib/three/animating";
import { moveDuration } from "@/lib/three/tween";
import { reducedMotion } from "@/lib/three/flags";
import { useReplay } from "@/store/replay";
import { useBoard } from "./BoardContext";

const IMPACT_MS = 250;
const IMPACT_FROM = 0.3;
const IMPACT_TO = 0.55;
const CHECK_PULSE_MS = 6000;
const HALO_MS = 1200;

// Same mapping as Board.tsx's badge (that constant isn't exported, so it's mirrored here).
const BADGE_BG: Record<Exclude<Judgement, null>, string> = {
  blunder: "var(--loss)",
  mistake: "var(--accent-deep)",
  inaccuracy: "var(--inaccuracy)",
  best: "var(--win)",
};

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
const CHECK = new THREE.Color(...HL_CHECK);
const HALO = new THREE.Color(...HL_HALO);

function Square({ sq, opacity }: { sq: string; opacity: number }) {
  const [x, z] = squareToWorld(sq);
  const alpha = roundedSquare();
  return (
    <mesh position={[x, 0.004, z]} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[0.98, 0.98]} />
      <meshBasicMaterial color={LAST} alphaMap={alpha} transparent opacity={opacity} toneMapped={false} depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
    </mesh>
  );
}

/** Expanding, fading ring at the destination square, timed to land exactly when the piece tween finishes. */
function ImpactRing() {
  const board = useBoard();
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const anim = useRef<{ t0: number } | null>(null);
  const prevGame = useRef(board.game);

  useEffect(() => {
    const gameChanged = prevGame.current !== board.game;
    prevGame.current = board.game;
    if (gameChanged || board.transition.mode !== "step" || reducedMotion() || !board.lastMove) return;
    const dur = moveDuration(useReplay.getState().speed);
    const [x, z] = squareToWorld(board.lastMove[1]);
    const timer = window.setTimeout(() => {
      const mesh = meshRef.current;
      if (mesh) {
        mesh.position.x = x;
        mesh.position.z = z;
        mesh.visible = true;
      }
      anim.current = { t0: performance.now() };
      startAnim("impact-ring");
    }, dur);
    return () => window.clearTimeout(timer);
    // Deliberately keyed on the step transition alone; a new `to` (or a new game) restarts the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board.transition.to, board.transition.mode, board.game]);

  useFrame(() => {
    const a = anim.current;
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!a || !mesh || !mat) return;
    const t = Math.min(1, (performance.now() - a.t0) / IMPACT_MS);
    mesh.scale.setScalar(THREE.MathUtils.lerp(1, IMPACT_TO / IMPACT_FROM, t));
    mat.opacity = 0.6 * (1 - t);
    if (t >= 1) {
      mesh.visible = false;
      anim.current = null;
      endAnim("impact-ring");
    }
  });

  return (
    <mesh ref={meshRef} rotation-x={-Math.PI / 2} position-y={0.004} visible={false}>
      <ringGeometry args={[IMPACT_FROM - 0.02, IMPACT_FROM + 0.02, 48]} />
      <meshBasicMaterial ref={matRef} color={LAST} transparent opacity={0} toneMapped={false} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
}

/** A radial disc under the king in check; pulses while paused, capped at 6 s, static otherwise. */
function CheckDisc() {
  const { checkSquare } = useBoard();
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const born = useRef(performance.now());
  const prevSq = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (checkSquare && checkSquare !== prevSq.current) born.current = performance.now();
    prevSq.current = checkSquare;
    return () => endAnim("check");
  }, [checkSquare]);

  useFrame(() => {
    const mat = matRef.current;
    if (!mat || !checkSquare) return;
    const elapsed = performance.now() - born.current;
    const pulsing = !useReplay.getState().playing && !reducedMotion() && elapsed < CHECK_PULSE_MS;
    if (pulsing) {
      startAnim("check");
      mat.opacity = 0.65 + 0.15 * Math.sin((elapsed / 1000) * Math.PI * 2 * 1.2);
    } else {
      endAnim("check");
      mat.opacity = 0.65;
    }
  });

  if (!checkSquare) return null;
  const [x, z] = squareToWorld(checkSquare);
  return (
    <mesh position={[x, 0.004, z]} rotation-x={-Math.PI / 2}>
      <circleGeometry args={[0.42, 32]} />
      <meshBasicMaterial ref={matRef} color={CHECK} transparent opacity={0.65} toneMapped={false} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
}

/** The judged-move ring plus the floating chip, in the same glyph/colour as the 2D badge. */
function VerdictMark() {
  const { verdict, lastMove } = useBoard();
  if (!verdict || !lastMove) return null;
  const [x, z] = squareToWorld(lastMove[1]);
  const ringColor = badgeRing(verdict);
  const ink = verdict === "inaccuracy" ? "var(--accent-ink)" : "#fff";
  const rm = reducedMotion();
  return (
    <group>
      <mesh position={[x, 0.004, z]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.36, 0.46, 48]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0.85} toneMapped={false} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      <Html key={lastMove.join("-")} center distanceFactor={9} position={[x, 1.9, z]} zIndexRange={[20, 0]}>
        <motion.div
          initial={rm ? false : { scale: 0.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={rm ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 22 }}
          className="pointer-events-none grid place-items-center rounded-full font-display font-bold shadow-[0_2px_6px_rgb(0_0_0/0.45)]"
          style={{ width: 34, height: 34, background: BADGE_BG[verdict], color: ink, fontSize: 15, lineHeight: 1 }}
        >
          {JUDGE_GLYPH[verdict]}
        </motion.div>
      </Html>
    </group>
  );
}

/** A ring under the winning king that ramps in once the mating move is shown. */
function FinaleHalo() {
  const { finale, pieces } = useBoard();
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const start = useRef<number | null>(null);

  useEffect(() => {
    start.current = finale ? performance.now() : null;
    if (finale) startAnim("finale-halo");
    return () => endAnim("finale-halo");
  }, [finale]);

  useFrame(() => {
    const mat = matRef.current;
    if (!mat || !finale || start.current == null) return;
    const t = Math.min(1, (performance.now() - start.current) / HALO_MS);
    mat.opacity = 0.85 * (reducedMotion() ? 1 : t);
    if (t >= 1) endAnim("finale-halo");
  });

  if (!finale) return null;
  const king = pieces.find((p) => p.id === finale.winnerKingId);
  if (!king) return null;
  const [x, z] = squareToWorld(king.square);
  return (
    <mesh position={[x, 0.004, z]} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[0.4, 0.62, 48]} />
      <meshBasicMaterial ref={matRef} color={HALO} transparent opacity={0} toneMapped={false} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
}

export default function Highlights() {
  const { lastMove } = useBoard();
  return (
    <>
      {lastMove && (
        <>
          <Square sq={lastMove[0]} opacity={0.25} />
          <Square sq={lastMove[1]} opacity={0.45} />
        </>
      )}
      <ImpactRing />
      <CheckDisc />
      <VerdictMark />
      <FinaleHalo />
    </>
  );
}
