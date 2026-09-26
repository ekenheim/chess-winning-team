// Hosts the 2D chessground board (always mounted: it sizes the slot and underlays the canvas) and the lazily loaded
// 3D board. The 3D chunk (three + fiber + drei) is only fetched on hover of the 3D button or on the first toggle.
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReplay } from "@/store/replay";
import { reducedMotion } from "@/lib/three/flags";
import Board from "@/components/Board";

let chunk: Promise<typeof import("@/components/three/Board3D")> | null = null;
export const prefetch3D = (): Promise<unknown> => (chunk ??= import("@/components/three/Board3D"));
const Board3D = lazy(() => prefetch3D() as Promise<typeof import("@/components/three/Board3D")>);

const EXIT_MS = 380;
const READY_TIMEOUT_MS = 6000;

export default function BoardSwitch() {
  const view = useReplay((s) => s.view);
  const setView = useReplay((s) => s.setView);
  const label = useReplay((s) => {
    const shown = s.hoverPly ?? s.ply;
    const m = s.game && shown > 0 ? s.game.moves[shown - 1] : undefined;
    return `3D chess board, ${m ? `after ${m.san}` : "start position"}`;
  });
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(false); // the 3D fade-in has completed: only then is the 2D board hidden
  const [exiting, setExiting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const mounted3D = view === "3d" || exiting;
  const wasView = useRef(view);

  // Toggling back: keep the canvas up while the camera rises to top-down, then fade the 2D board back in.
  useEffect(() => {
    const prev = wasView.current;
    wasView.current = view;
    if (prev === "3d" && view === "2d") {
      setShown(false);
      if (reducedMotion() || !ready) {
        setExiting(false);
        setReady(false);
        return;
      }
      setExiting(true);
      window.dispatchEvent(new CustomEvent("board3d:exit"));
      const t = window.setTimeout(() => {
        setExiting(false);
        setReady(false);
      }, EXIT_MS);
      return () => window.clearTimeout(t);
    }
  }, [view, ready]);

  // Safety net: if the scene never reports its first frame, show the canvas anyway instead of hiding it forever.
  useEffect(() => {
    if (view !== "3d" || ready) return;
    const t = window.setTimeout(() => setReady(true), READY_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [view, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const fail = (reason: string) => {
    console.warn("[board3d] falling back to 2D:", reason);
    setReady(false);
    setShown(false);
    setExiting(false);
    setView("2d");
    setToast("3D unavailable on this GPU. Back to 2D.");
  };

  const hide2D = mounted3D && ready && shown && !exiting;
  const instant = reducedMotion();

  return (
    <div className="relative w-full aspect-square">
      <div
        aria-hidden={hide2D || undefined}
        inert={hide2D || undefined}
        style={{ opacity: hide2D ? 0 : 1, transition: instant ? "none" : "opacity 220ms ease" }}
      >
        <Board />
      </div>
      {mounted3D && (
        <motion.div
          className="absolute inset-0 z-10 overflow-hidden rounded-md"
          role="img"
          aria-label={label}
          initial={{ opacity: 0 }}
          animate={{ opacity: ready && !exiting ? 1 : exiting ? 0 : 0 }}
          transition={{ duration: instant ? 0 : exiting ? EXIT_MS / 1000 : 0.22, ease: "easeOut" }}
          onAnimationComplete={() => setShown(ready && !exiting)}
          style={{ pointerEvents: ready && !exiting ? "auto" : "none" }}
        >
          <Suspense fallback={null}>
            <Board3D onReady={() => setReady(true)} onFail={fail} />
          </Suspense>
        </motion.div>
      )}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="panel pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 px-3 py-1.5 text-[12px] text-ink-2"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
