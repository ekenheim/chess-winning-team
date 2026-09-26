import { motion, useReducedMotion } from "motion/react";
import { useReplay } from "@/store/replay";
import { evalCp, evalToUnit, formatEval, mateIn } from "@/lib/chess";

export default function EvalBar() {
  const game = useReplay((s) => s.game);
  const ply = useReplay((s) => s.ply);
  const hoverPly = useReplay((s) => s.hoverPly);
  const orientation = useReplay((s) => s.orientation);
  const reduce = useReducedMotion();
  const shown = hoverPly ?? ply;
  const move = game && shown > 0 ? game.moves[shown - 1] : undefined;
  const cp = move ? evalCp(move) : 0;
  const mate = mateIn(move);
  const unit = mate != null ? (mate > 0 ? 1 : -1) : evalToUnit(cp);
  // fraction of the bar that is white
  const whitePct = 50 + unit * 50;
  const whiteOnTop = orientation === "black";
  const label = formatEval(cp, mate);
  const whiteAhead = unit >= 0;

  return (
    <div
      className="relative h-full w-[22px] shrink-0 overflow-hidden rounded-md bg-[#2a2723] ring-1 ring-line"
      role="meter"
      aria-label="evaluation"
      aria-valuemin={-10}
      aria-valuemax={10}
      aria-valuenow={cp == null ? 0 : Math.round(cp) / 100}
      title={`Eval ${label} (white's view)`}
    >
      <motion.div
        className="absolute inset-x-0 bg-[#f1ebdc]"
        style={whiteOnTop ? { top: 0 } : { bottom: 0 }}
        animate={{ height: `${whitePct}%` }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20, mass: 0.6 }}
      />
      <div className="absolute inset-x-0 top-1/2 h-px bg-[oklch(0.5_0.02_70/0.5)]" />
      <div
        className={`mono absolute inset-x-0 text-center text-[9px] font-semibold leading-none ${
          (whiteAhead && !whiteOnTop) || (!whiteAhead && whiteOnTop) ? "bottom-1" : "top-1"
        }`}
        style={{ color: whiteAhead ? "#2a2723" : "#f1ebdc" }}
      >
        {label}
      </div>
    </div>
  );
}
