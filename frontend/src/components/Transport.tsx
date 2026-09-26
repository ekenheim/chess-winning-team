import { useEffect } from "react";
import { SPEEDS, useReplay, type Speed } from "@/store/replay";
import { supportsWebGL2 } from "@/lib/three/flags";
import { prefetch3D } from "@/components/BoardSwitch";

function Btn({
  onClick,
  title,
  children,
  primary,
  active,
  disabled,
  onPointerEnter,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  primary?: boolean;
  active?: boolean;
  disabled?: boolean;
  onPointerEnter?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      onPointerEnter={onPointerEnter}
      className={`grid h-9 min-w-9 place-items-center rounded-lg px-2 text-[15px] transition-colors disabled:opacity-40 ${
        primary
          ? "bg-accent text-accent-ink font-semibold hover:bg-accent-deep"
          : active
            ? "bg-bg-4 text-ink ring-1 ring-line-2"
            : "bg-bg-3 text-ink-2 hover:bg-bg-4 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export default function Transport() {
  const { ply, playing, speed, sound, arrows, game, view } = useReplay();
  const goto = useReplay((s) => s.goto);
  const step = useReplay((s) => s.step);
  const togglePlaying = useReplay((s) => s.togglePlaying);
  const setSpeed = useReplay((s) => s.setSpeed);
  const flip = useReplay((s) => s.flip);
  const toggleSound = useReplay((s) => s.toggleSound);
  const toggleArrows = useReplay((s) => s.toggleArrows);
  const toggleView = useReplay((s) => s.toggleView);
  const webgl = supportsWebGL2();
  const n = game?.moves.length ?? 0;

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA")) return;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          step(-1);
          break;
        case "ArrowRight":
          e.preventDefault();
          step(1);
          break;
        case "Home":
          e.preventDefault();
          goto(0);
          break;
        case "End":
          e.preventDefault();
          goto(n);
          break;
        case " ":
          e.preventDefault();
          togglePlaying();
          break;
        case "f":
          flip();
          break;
        case "s":
          toggleSound();
          break;
        case "a":
          toggleArrows();
          break;
        case "v":
          if (webgl) toggleView();
          break;
        case "t":
          if (view === "3d") window.dispatchEvent(new CustomEvent("board3d:top"));
          break;
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [step, goto, togglePlaying, flip, toggleSound, toggleArrows, toggleView, view, webgl, n]);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Btn onClick={() => goto(0)} title="First move (Home)" disabled={ply === 0}>
        ⇤
      </Btn>
      <Btn onClick={() => step(-1)} title="Previous move (←)" disabled={ply === 0}>
        ‹
      </Btn>
      <Btn onClick={togglePlaying} title={playing ? "Pause (space)" : "Play (space)"} primary>
        <span className="flex items-center gap-1.5 px-1">
          {playing ? "❚❚" : "▶"}
          <span className="text-[12px] font-semibold tracking-wide">{playing ? "Pause" : "Play"}</span>
        </span>
      </Btn>
      <Btn onClick={() => step(1)} title="Next move (→)" disabled={ply >= n}>
        ›
      </Btn>
      <Btn onClick={() => goto(n)} title="Last move (End)" disabled={ply >= n}>
        ⇥
      </Btn>
      <div className="mx-1 flex items-center rounded-lg bg-bg-3 p-0.5" role="radiogroup" aria-label="autoplay speed">
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={speed === s}
            onClick={() => setSpeed(s as Speed)}
            className={`mono rounded-md px-2 py-1 text-[11px] transition-colors ${
              speed === s ? "bg-bg-4 text-ink ring-1 ring-line-2" : "text-ink-3 hover:text-ink"
            }`}
          >
            {s}×
          </button>
        ))}
      </div>
      <Btn onClick={flip} title="Flip board (f)">
        ⇅
      </Btn>
      <Btn
        onClick={toggleView}
        title={!webgl ? "3D needs WebGL2 (unavailable)" : view === "3d" ? "2D board (v)" : "3D board (v)"}
        active={view === "3d"}
        disabled={!webgl}
        onPointerEnter={prefetch3D}
      >
        <span className="flex items-center gap-1">
          ⬒<span className="text-[10px] font-semibold tracking-wide">3D</span>
        </span>
      </Btn>
      <Btn onClick={toggleArrows} title="Best-move arrows (a)" active={arrows}>
        ➶
      </Btn>
      <Btn onClick={toggleSound} title={sound ? "Mute (s)" : "Unmute (s)"} active={sound}>
        {sound ? "♪" : "♪̸"}
      </Btn>
      <span className="mono ml-auto text-[11px] text-ink-3 tabular-nums">
        {ply} / {n}
      </span>
    </div>
  );
}
