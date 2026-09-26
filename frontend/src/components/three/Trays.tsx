// Capture trays: two walnut trays beside the board (pieces captured FROM white at x=-5.4, from black at x=+5.4) and a
// flat "+N" material-balance label at the end of the leading side's tray. The captured pieces themselves are rendered
// by Pieces.tsx (same keyed list as the board pieces, so they fly in and out instead of remounting); this component
// only draws the furniture. The label texture is redrawn only when N changes (and once the self-hosted font loads).
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { PIECE_VALUE, trayPos } from "@/lib/three/coords";
import { PALETTE } from "@/lib/three/palette";
import { requestFrame } from "@/lib/three/animating";
import type { Piece } from "@/lib/three/pieceIds";
import { useBoard } from "./BoardContext";

const TRAY_W = 1.1;
const TRAY_WIDE = 1.6; // grows outward once a second column is needed (13+ captures of one colour)
const TRAY_LEN = 8;
const TRAY_Y = -0.17;
const LABEL_W = 1.0;
const LABEL_H = 0.5;
const FONT = '600 88px "JetBrains Mono", ui-monospace, monospace';

const material = (pieces: Piece[]) => pieces.reduce((n, p) => n + PIECE_VALUE[p.kind], 0);

function Tray({ side, count }: { side: -1 | 1; count: number }) {
  const wide = count > 12;
  const w = wide ? TRAY_WIDE : TRAY_W;
  const x = side * (5.4 + (w - TRAY_W) / 2);
  return (
    <RoundedBox args={[w, 0.08, TRAY_LEN]} radius={0.035} smoothness={4} position={[x, TRAY_Y, 0]} receiveShadow castShadow>
      <meshPhysicalMaterial color={PALETTE.walnut} roughness={0.48} clearcoat={0.6} clearcoatRoughness={0.22} />
    </RoundedBox>
  );
}

function useLabelTexture(n: number) {
  const [fontReady, setFontReady] = useState(false);
  const { canvas, tex } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 128;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return { canvas: c, tex: t };
  }, []);

  useEffect(() => {
    let alive = true;
    try {
      document.fonts
        ?.load(FONT)
        .then(() => alive && setFontReady(true))
        .catch(() => {});
    } catch {
      /* no FontFaceSet */
    }
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (n > 0) {
      // a soft pill so the number reads against the dark floor, then the amber figure
      ctx.fillStyle = "rgba(18, 13, 9, 0.72)";
      ctx.beginPath();
      ctx.roundRect(6, 10, 244, 108, 30);
      ctx.fill();
      ctx.strokeStyle = "rgba(251, 182, 54, 0.55)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.font = FONT;
      ctx.fillStyle = PALETTE.accent;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`+${n}`, 128, 68);
    }
    tex.needsUpdate = true;
    requestFrame();
  }, [n, fontReady, canvas, tex]);

  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

export default function Trays() {
  const { captured, orientation } = useBoard();
  // White's gains are the black pieces it captured, and vice versa.
  const diff = material(captured.b) - material(captured.w);
  const n = Math.abs(diff);
  const tex = useLabelTexture(n);

  // Label: flat on the leading side's tray, just past its last slot, turned to read from the current camera side.
  const leaderTray: "w" | "b" = diff > 0 ? "b" : "w"; // tray holding the leader's captures
  const [lx, ly] = trayPos(leaderTray, 0);
  const [, , lastZ] = trayPos(leaderTray, 11);
  const lz = lastZ - 0.55;
  const yaw = orientation === "white" ? 0 : Math.PI;
  const labelX = lx + (leaderTray === "w" ? -1 : 1) * ((captured[leaderTray].length > 12 ? TRAY_WIDE : TRAY_W) - TRAY_W) / 2;

  return (
    <group>
      <Tray side={-1} count={captured.w.length} />
      <Tray side={1} count={captured.b.length} />
      <mesh visible={n > 0} position={[labelX, ly + 0.006, lz]} rotation={[-Math.PI / 2, 0, yaw]} renderOrder={2}>
        <planeGeometry args={[LABEL_W, LABEL_H]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
    </group>
  );
}
