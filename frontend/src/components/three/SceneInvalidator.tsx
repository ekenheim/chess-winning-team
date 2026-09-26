// The only place that asks fiber for frames: store changes, held animation keys and (via drei) camera transitions.
import { useEffect } from "react";
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

  useFrame(() => {
    frameStats.count++;
    if (isAnimating()) invalidate();
  });
  return null;
}
