import { useEffect, useRef } from "react";
import { useReplay } from "@/store/replay";
import { JUDGE_GLYPH, judge, type Judgement } from "@/lib/chess";
import type { Move } from "@/lib/api";

const BADGE: Record<Exclude<Judgement, null>, string> = {
  blunder: "bg-loss text-white",
  mistake: "bg-accent-deep text-white",
  inaccuracy: "bg-inaccuracy text-accent-ink",
  best: "bg-win-deep text-white",
};

function MoveCell({ m, current, onClick }: { m: Move; current: boolean; onClick: () => void }) {
  const v = judge(m);
  const s = m.search;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-1.5 rounded-md px-1.5 py-[3px] text-left transition-colors ${
        current ? "bg-accent text-accent-ink" : "hover:bg-bg-3"
      }`}
      aria-current={current ? "step" : undefined}
    >
      <span className={`mono text-[13px] font-medium ${v === "blunder" && !current ? "text-loss" : v === "mistake" && !current ? "text-accent-deep" : ""}`}>
        {m.san}
      </span>
      {v && (
        <span className={`mono rounded px-1 text-[9.5px] font-bold leading-[14px] ${current ? "bg-accent-ink/80 text-accent" : BADGE[v]}`}>
          {JUDGE_GLYPH[v]}
        </span>
      )}
      {s && (
        <span className={`mono ml-auto text-[10px] tabular-nums ${current ? "text-accent-ink/70" : "text-ink-3"}`} title={`depth ${s.depth} · ${s.seconds.toFixed(2)} s`}>
          d{s.depth}
        </span>
      )}
    </button>
  );
}

export default function MoveList() {
  const game = useReplay((s) => s.game);
  const ply = useReplay((s) => s.ply);
  const goto = useReplay((s) => s.goto);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // scroll only the list, never the page (scrollIntoView would drag the window along on narrow layouts)
    const b = box.current;
    const el = b?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!b || !el) return;
    const top = el.offsetTop - b.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < b.scrollTop) b.scrollTo({ top: top - 8, behavior: "smooth" });
    else if (bottom > b.scrollTop + b.clientHeight) b.scrollTo({ top: bottom - b.clientHeight + 8, behavior: "smooth" });
  }, [ply]);

  if (!game) return null;
  const rows: { n: number; w?: Move; b?: Move }[] = [];
  game.moves.forEach((m) => {
    if (m.ply % 2 === 1) rows.push({ n: Math.ceil(m.ply / 2), w: m });
    else {
      const last = rows[rows.length - 1];
      if (last && !last.b) last.b = m;
      else rows.push({ n: Math.ceil(m.ply / 2), b: m });
    }
  });

  return (
    <div ref={box} className="thin-scroll min-h-0 flex-1 overflow-y-auto pr-1">
      <div className="grid grid-cols-[34px_1fr_1fr] gap-x-1 gap-y-px">
        {rows.map((r) => (
          <div key={r.n} className="contents">
            <span className="mono self-center text-right text-[11px] text-ink-3 pr-1">{r.n}.</span>
            {r.w ? <MoveCell m={r.w} current={ply === r.w.ply} onClick={() => goto(r.w!.ply)} /> : <span />}
            {r.b ? <MoveCell m={r.b} current={ply === r.b.ply} onClick={() => goto(r.b!.ply)} /> : <span />}
          </div>
        ))}
      </div>
    </div>
  );
}
