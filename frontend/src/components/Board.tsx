import { useEffect, useMemo, useRef } from "react";
import { Chessground } from "@lichess-org/chessground";
import type { Api } from "@lichess-org/chessground/api";
import type { DrawShape } from "@lichess-org/chessground/draw";
import type { Key } from "@lichess-org/chessground/types";
import { AnimatePresence, motion } from "motion/react";
import { useReplay } from "@/store/replay";
import { JUDGE_GLYPH, judge, squareCoords, type Judgement } from "@/lib/chess";

const BRUSHES = {
  best: { key: "best", color: "oklch(0.74 0.15 150)", opacity: 0.9, lineWidth: 10 },
  played: { key: "played", color: "oklch(0.68 0.16 62)", opacity: 0.85, lineWidth: 10 },
  green: { key: "green", color: "#15781B", opacity: 1, lineWidth: 10 },
  red: { key: "red", color: "#882020", opacity: 1, lineWidth: 10 },
  blue: { key: "blue", color: "#003088", opacity: 1, lineWidth: 10 },
  yellow: { key: "yellow", color: "#e68f00", opacity: 1, lineWidth: 10 },
};

const BADGE_BG: Record<Exclude<Judgement, null>, string> = {
  blunder: "var(--loss)",
  mistake: "var(--accent-deep)",
  inaccuracy: "var(--inaccuracy)",
  best: "var(--win)",
};

export default function Board() {
  const host = useRef<HTMLDivElement>(null);
  const cg = useRef<Api | null>(null);
  const game = useReplay((s) => s.game);
  const ply = useReplay((s) => s.ply);
  const orientation = useReplay((s) => s.orientation);
  const arrows = useReplay((s) => s.arrows);
  const hoverPly = useReplay((s) => s.hoverPly);

  const shownPly = hoverPly ?? ply;
  const move = game && shownPly > 0 ? game.moves[shownPly - 1] : undefined;
  const fen = game ? (move ? move.fen : game.start_fen) : "8/8/8/8/8/8/8/8 w - - 0 1";
  const turn = fen.split(" ")[1] === "b" ? "black" : "white";

  useEffect(() => {
    if (!host.current || cg.current) return;
    cg.current = Chessground(host.current, {
      viewOnly: true,
      coordinates: true,
      animation: { enabled: true, duration: 220 },
      highlight: { lastMove: true, check: true },
      drawable: { enabled: false, visible: true, brushes: BRUSHES },
      disableContextMenu: true,
    });
    return () => {
      cg.current?.destroy();
      cg.current = null;
    };
  }, []);

  const shapes = useMemo<DrawShape[]>(() => {
    if (!arrows || !move) return [];
    const out: DrawShape[] = [];
    const a = move.analysis;
    if (a?.best_uci && a.best_uci !== move.uci && (a.cp_loss ?? 0) >= 50) {
      out.push({ orig: move.uci.slice(0, 2) as Key, dest: move.uci.slice(2, 4) as Key, brush: "played" });
      out.push({ orig: a.best_uci.slice(0, 2) as Key, dest: a.best_uci.slice(2, 4) as Key, brush: "best" });
    }
    return out;
  }, [arrows, move]);

  useEffect(() => {
    const api = cg.current;
    if (!api) return;
    api.set({
      fen,
      orientation,
      turnColor: turn,
      lastMove: move ? [move.uci.slice(0, 2) as Key, move.uci.slice(2, 4) as Key] : undefined,
      check: move?.check ? turn : false,
      drawable: { autoShapes: shapes },
    });
  }, [fen, orientation, turn, move, shapes]);

  const verdict = move ? judge(move) : null;
  const badge = move && verdict ? { ...squareCoords(move.uci.slice(2, 4), orientation), verdict, key: move.ply } : null;

  return (
    <div className="relative w-full aspect-square">
      <div ref={host} className="cg-wrap" aria-label="chess board" />
      <AnimatePresence>
        {badge && (
          <motion.div
            key={badge.key}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 22 }}
            className="pointer-events-none absolute z-10 grid place-items-center rounded-full font-display font-bold shadow-[0_2px_6px_rgb(0_0_0/0.45)]"
            style={{
              width: "5.2%",
              height: "5.2%",
              left: `calc(${(badge.x + 1) * 12.5}% - 3.6%)`,
              top: `calc(${badge.y * 12.5}% - 1.6%)`,
              background: BADGE_BG[badge.verdict],
              color: badge.verdict === "inaccuracy" ? "var(--accent-ink)" : "#fff",
              fontSize: "clamp(9px, 1.9vmin, 15px)",
              lineHeight: 1,
            }}
            title={badge.verdict}
          >
            {JUDGE_GLYPH[badge.verdict]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
