import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { api, type Ladder as LadderData, type Rung, type Top, type WDL } from "@/lib/api";
import TopBoard from "@/components/TopBoard";
import { href } from "@/lib/router";

function Bar({ wdl, tall }: { wdl: WDL; tall?: boolean }) {
  const n = wdl.w + wdl.d + wdl.l;
  if (n === 0) return <div className={`${tall ? "h-2.5" : "h-1"} w-full rounded-full bg-bg-4/60`} />;
  const seg = (v: number, cls: string, label: string) =>
    v > 0 && (
      <div
        className={`${cls} h-full`}
        style={{ width: `${(v / n) * 100}%` }}
        title={`${v} ${label}`}
      />
    );
  return (
    <div className={`flex w-full gap-px overflow-hidden rounded-full ${tall ? "h-2.5" : "h-1"}`} role="img" aria-label={`${wdl.w} wins, ${wdl.d} draws, ${wdl.l} losses`}>
      {seg(wdl.w, "bg-win", "wins")}
      {seg(wdl.d, "bg-draw", "draws")}
      {seg(wdl.l, "bg-loss", "losses")}
    </div>
  );
}

function RungRow({ r, highest, target, i }: { r: Rung; highest: number | null; target: number; i: number }) {
  const isTop = r.level === highest;
  const isTarget = r.level === target && !r.proof;
  const full = r.full.w + r.full.d + r.full.l;
  const fast = r.fast.w + r.fast.d + r.fast.l;
  const status = r.proof ? "beaten" : isTarget ? "next target" : r.status === "contested" ? "contested" : "locked";
  const statusCls = r.proof
    ? "text-win"
    : isTarget
      ? "text-accent"
      : r.status === "contested"
        ? "text-ink-2"
        : "text-ink-3";
  return (
    <motion.li
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 + i * 0.045, duration: 0.4, ease: "easeOut" }}
      className={`relative grid grid-cols-[76px_1fr_auto] items-center gap-4 rounded-xl border px-4 py-3 ${
        isTop
          ? "glow-accent border-accent/60 bg-bg-3"
          : isTarget
            ? "pulse-ring border-accent/30 bg-bg-2"
            : r.proof
              ? "border-line bg-bg-2"
              : "border-line/60 bg-bg/40"
      }`}
    >
      <div className={`font-display text-[28px] font-bold leading-none tracking-tight ${r.proof ? "text-ink" : "text-ink-3"}`}>
        {r.level}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[11px]">
          <span className={`mono uppercase tracking-[0.14em] ${statusCls}`}>{status}</span>
          {r.proof && (
            <span className="text-ink-3">
              {r.proof.termination}, {r.proof.plies} plies, as {r.proof.engine}
              {r.verified ? " · verified" : ""}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Bar wdl={r.full} tall />
          <span className="mono w-[86px] shrink-0 text-right text-[11px] text-ink-2 tabular-nums">
            {full ? `${r.full.w}-${r.full.d}-${r.full.l}` : "no 5 s games"}
          </span>
        </div>
        {fast > 0 && (
          <div className="mt-1 flex items-center gap-2 opacity-70">
            <Bar wdl={r.fast} />
            <span className="mono w-[86px] shrink-0 text-right text-[10px] text-ink-3 tabular-nums" title="fast experiments at 0.25 s/move">
              {r.fast.w}-{r.fast.d}-{r.fast.l} fast
            </span>
          </div>
        )}
      </div>
      <div>
        {r.proof ? (
          <a
            href={href({ view: "replay", run: "proofs", file: r.proof.file })}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              isTop ? "bg-accent text-accent-ink hover:bg-accent-deep" : "bg-bg-3 text-ink hover:bg-bg-4"
            }`}
          >
            Replay proof ›
          </a>
        ) : r.wins[0] ? (
          <a href={href({ view: "replay", run: r.wins[0].run, file: r.wins[0].file })} className="text-[12px] text-ink-2 hover:text-ink">
            a win ›
          </a>
        ) : (
          <span className="text-[12px] text-ink-3">—</span>
        )}
      </div>
    </motion.li>
  );
}

export default function Ladder() {
  const [data, setData] = useState<LadderData | null>(null);
  const [top, setTop] = useState<Top | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api.ladder().then(setData).catch((e) => setError(String(e.message ?? e)));
    // ?level=NNNN in the page URL shows the scoreboard for another level (default: the top one, 3190)
    const lv = parseInt(new URLSearchParams(window.location.search).get("level") ?? "", 10);
    api.top(Number.isFinite(lv) ? lv : undefined).then(setTop).catch(() => {});
  }, []);
  if (error) return <div className="panel m-6 p-6 text-ink-2">Could not load the ladder: <span className="mono text-loss">{error}</span></div>;
  if (!data) return <div className="grid h-[60vh] place-items-center text-ink-3">Loading…</div>;
  const rungs = [...data.rungs].sort((a, b) => b.level - a.level);
  const beaten = data.rungs.filter((r) => r.proof).length;
  const fullGames = data.rungs.reduce((s, r) => s + r.full.w + r.full.d + r.full.l, 0);
  const fullWins = data.rungs.reduce((s, r) => s + r.full.w, 0);
  const allGames = fullGames + data.rungs.reduce((s, r) => s + r.fast.w + r.fast.d + r.fast.l, 0);

  const board = top ?? data.top ?? null;

  return (
    <>
    {board && (
      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-6 pt-8">
        <TopBoard top={board} />
      </div>
    )}
    <div className="relative mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-10 px-6 pb-16 pt-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-[38%] h-[520px] w-[520px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(closest-side, oklch(0.68 0.16 62 / 0.55), transparent 70%)" }}
      />
      <section className="relative lg:sticky lg:top-8 lg:self-start">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="eyebrow">{data.opponent} · {data.move_time} s per move</div>
          <div className="mt-3 text-[15px] text-ink-2">Highest Stockfish rating beaten</div>
          <div className="hero-number mt-1 text-[clamp(120px,18vw,220px)]" aria-label={`Elo ${data.highest_beaten ?? "none yet"}`}>
            {data.highest_beaten ?? "—"}
          </div>
          <p className="mt-6 max-w-[420px] text-[15px] leading-relaxed text-ink-2">
            Every rung is a Stockfish 19 strength setting. A rung counts as beaten only with a real win at five seconds a move,
            and each proof game is saved and replayable below. Draws score nothing here.
          </p>
        </motion.div>
        <motion.dl
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }}
          className="mt-8 grid grid-cols-3 gap-3"
        >
          {[
            { k: "Rungs beaten", v: beaten },
            { k: "Wins at 5 s", v: `${fullWins} / ${fullGames}` },
            { k: "Games played", v: allGames },
          ].map((s) => (
            <motion.div key={s.k} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} className="panel p-3.5">
              <dt className="eyebrow">{s.k}</dt>
              <dd className="font-display mt-1 text-[26px] font-semibold leading-none tracking-tight tnum">{s.v}</dd>
            </motion.div>
          ))}
        </motion.dl>
        <div className="mt-6 flex items-center gap-2 text-[12px] text-ink-3">
          <span className="text-accent">Next target</span>
          <span className="mono text-ink">{data.target}</span>
          <span>· ladder step {data.step}</span>
        </div>
      </section>
      <section className="relative">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-[18px] font-semibold tracking-tight">The ladder</h2>
          <div className="flex items-center gap-3 text-[11px] text-ink-3">
            <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-full bg-win" /> win</span>
            <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-full bg-draw" /> draw</span>
            <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-full bg-loss" /> loss</span>
          </div>
        </div>
        <ol className="flex flex-col gap-2">
          {rungs.map((r, i) => (
            <RungRow key={r.level} r={r} highest={data.highest_beaten} target={data.target} i={i} />
          ))}
        </ol>
      </section>
    </div>
    </>
  );
}
