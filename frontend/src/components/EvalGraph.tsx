import { useCallback, useMemo, useRef, useState } from "react";
import { useReplay } from "@/store/replay";
import { evalCp, evalToUnit, formatEval, judge, mateIn, moveNumber } from "@/lib/chess";

const H = 120;
const PAD = { l: 8, r: 8, t: 10, b: 18 };

/** Full-width eval graph under the board, synced to the ply. Hover scrubs the board, click jumps. */
export default function EvalGraph() {
  const game = useReplay((s) => s.game);
  const ply = useReplay((s) => s.ply);
  const goto = useReplay((s) => s.goto);
  const setHoverPly = useReplay((s) => s.setHoverPly);
  const hoverPly = useReplay((s) => s.hoverPly);
  const svg = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(600);

  const ref = useCallback((el: SVGSVGElement | null) => {
    (svg as React.MutableRefObject<SVGSVGElement | null>).current = el;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
  }, []);

  const n = game?.moves.length ?? 0;
  const innerW = Math.max(1, width - PAD.l - PAD.r);
  const innerH = H - PAD.t - PAD.b;
  const x = (p: number) => PAD.l + (n === 0 ? 0 : (p / n) * innerW);
  const y = (unit: number) => PAD.t + ((1 - unit) / 2) * innerH;
  const zero = y(0);

  const { linePath, whiteArea, blackArea, marks } = useMemo(() => {
    if (!game || n === 0) return { linePath: "", whiteArea: "", blackArea: "", marks: [] as { px: number; py: number; ply: number; v: string }[] };
    const pts = [{ p: 0, u: 0 }];
    game.moves.forEach((m, i) => {
      const mate = mateIn(m);
      const u = mate != null ? (mate > 0 ? 0.95 : -0.95) : evalToUnit(evalCp(m));
      pts.push({ p: i + 1, u });
    });
    const line = pts.map((pt, i) => `${i === 0 ? "M" : "L"}${x(pt.p).toFixed(1)},${y(pt.u).toFixed(1)}`).join(" ");
    const closeW = `L${x(n).toFixed(1)},${zero} L${x(0)},${zero} Z`;
    const area = `${line} ${closeW}`;
    const marks = game.moves
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => judge(m) === "blunder" || judge(m) === "mistake")
      .map(({ m, i }) => ({ px: x(i + 1), py: y(pts[i + 1].u), ply: i + 1, v: judge(m) as string }));
    return { linePath: line, whiteArea: area, blackArea: area, marks };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, n, width]);

  const plyFromEvent = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const fx = (e.clientX - r.left - PAD.l) / innerW;
    return Math.max(0, Math.min(n, Math.round(fx * n)));
  };

  if (!game) return null;
  const shown = hoverPly ?? ply;
  const shownMove = shown > 0 ? game.moves[shown - 1] : undefined;
  const cx = x(shown);
  const tipLabel = shownMove
    ? `${moveNumber(shownMove.ply)} ${shownMove.san}  ${formatEval(evalCp(shownMove), mateIn(shownMove))}`
    : "start";
  const tipW = 8 + tipLabel.length * 6.6;
  const tipX = Math.min(Math.max(cx - tipW / 2, PAD.l), width - PAD.r - tipW);

  return (
    <div className="panel px-2 pt-2 pb-1">
      <div className="flex items-baseline justify-between px-1">
        <span className="eyebrow">Evaluation · white's view</span>
        <span className="mono text-[11px] text-ink-3">
          {game.analysis_run ? "Stockfish 19 full strength" : "as reported by the players"}
        </span>
      </div>
      <svg
        ref={ref}
        className="block w-full cursor-crosshair select-none touch-none"
        height={H}
        role="img"
        aria-label="evaluation over the game"
        onPointerMove={(e) => setHoverPly(plyFromEvent(e))}
        onPointerLeave={() => setHoverPly(null)}
        onPointerDown={(e) => {
          goto(plyFromEvent(e));
          setHoverPly(null);
        }}
      >
        <defs>
          <clipPath id="clip-white">
            <rect x={0} y={0} width={width} height={zero} />
          </clipPath>
          <clipPath id="clip-black">
            <rect x={0} y={zero} width={width} height={H - zero} />
          </clipPath>
        </defs>
        <rect x={PAD.l} y={PAD.t} width={innerW} height={innerH} rx={4} fill="var(--bg-3)" />
        <path d={whiteArea} fill="#ece4d3" clipPath="url(#clip-white)" opacity={0.92} />
        <path d={blackArea} fill="#17140f" clipPath="url(#clip-black)" opacity={0.95} />
        <line x1={PAD.l} x2={PAD.l + innerW} y1={zero} y2={zero} stroke="var(--line-2)" strokeWidth={1} />
        <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth={1.5} strokeLinejoin="round" opacity={0.85} />
        {marks.map((m) => (
          <circle
            key={m.ply}
            cx={m.px}
            cy={m.py}
            r={m.v === "blunder" ? 4.5 : 3.5}
            fill={m.v === "blunder" ? "var(--loss)" : "var(--accent-deep)"}
            stroke="var(--bg-2)"
            strokeWidth={2}
          />
        ))}
        {/* ply cursor */}
        <line x1={cx} x2={cx} y1={PAD.t} y2={PAD.t + innerH} stroke="var(--ink)" strokeWidth={1} strokeDasharray={hoverPly != null ? "3 3" : undefined} />
        <circle cx={cx} cy={y(shownMove ? (mateIn(shownMove) != null ? (mateIn(shownMove)! > 0 ? 0.95 : -0.95) : evalToUnit(evalCp(shownMove))) : 0)} r={4} fill="var(--accent)" stroke="var(--bg)" strokeWidth={2} />
        <g transform={`translate(${tipX}, ${H - 15})`}>
          <rect width={tipW} height={14} rx={3} fill="var(--bg-4)" />
          <text x={4} y={10} className="mono" fontSize={10} fill="var(--ink)" fontFamily="var(--font-mono)">
            {tipLabel}
          </text>
        </g>
      </svg>
    </div>
  );
}
