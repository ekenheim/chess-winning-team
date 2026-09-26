// The only place that asks fiber for frames: store changes, held animation keys and (via drei) camera transitions.
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useReplay } from "@/store/replay";
import { bindInvalidate, endAnimsWithPrefix, frameStats, isAnimating } from "@/lib/three/animating";
import { urlFlag } from "@/lib/three/flags";

export default function SceneInvalidator() {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    bindInvalidate(() => invalidate());
    invalidate();
    const unsub = useReplay.subscribe((s, prev) => {
      if (s.game !== prev.game || s.ply !== prev.ply || s.hoverPly !== prev.hoverPly || s.orientation !== prev.orientation || s.arrows !== prev.arrows) invalidate();
    });
    const onVis = () => {
      if (document.hidden) endAnimsWithPrefix("idle:");
    };
    document.addEventListener("visibilitychange", onVis);
    if (urlFlag("debug") === "1") (window as unknown as { __r3f: typeof frameStats }).__r3f = frameStats;
    return () => {
      unsub();
      document.removeEventListener("visibilitychange", onVis);
      bindInvalidate(() => {});
    };
  }, [invalidate]);

  // Two settle frames after the last animation ends: ContactShadows renders in its own useFrame, which can run
  // before the piece hooks on a given frame, so the final tween frame would leave the shadow one step behind.
  const settle = useRef(0);
  useFrame(() => {
    frameStats.count++;
    if (isAnimating()) {
      settle.current = 2;
      invalidate();
    } else if (settle.current > 0) {
      settle.current--;
      invalidate();
    }
  });
  return null;
}
