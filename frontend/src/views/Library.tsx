import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { api, type GameInfo, type RunInfo } from "@/lib/api";
import { engineResult } from "@/lib/chess";
import { href, navigate } from "@/lib/router";

const DOT = { win: "bg-win", loss: "bg-loss", draw: "bg-draw", unknown: "bg-bg-4" } as const;

function RunItem({ r, active }: { r: RunInfo; active: boolean }) {
  const s = r.summary;
  const isProofs = r.name === "proofs";
  return (
    <a
      href={href({ view: "library", run: r.name })}
      className={`block rounded-lg border px-3 py-2 transition-colors ${
        active ? "border-accent/50 bg-bg-3" : "border-transparent hover:bg-bg-3/60"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className={`mono text-[12.5px] ${isProofs ? "text-accent" : "text-ink"}`}>{isProofs ? "★ proofs" : r.name}</span>
        <span className="text-[11px] text-ink-3">{r.games} games</span>
      </div>
      {s && (
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-ink-3">
          <span className="text-ink-2">
            Elo {Math.round(s.elo ?? 0)}
            {s.elo_err95 ? <span className="text-ink-3"> ±{Math.round(s.elo_err95)}</span> : null}
          </span>
          <span>{s.wins}-{s.draws}-{s.losses}</span>
          <span>{s.move_time_s} s</span>
        </div>
      )}
      {isProofs && <div className="mt-0.5 text-[11px] text-ink-3">one winning game per beaten rung</div>}
    </a>
  );
}

export default function Library({ run }: { run?: string }) {
  const [runs, setRuns] = useState<RunInfo[] | null>(null);
  const [games, setGames] = useState<GameInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.runs().then(setRuns).catch((e) => setError(String(e.message ?? e)));
  }, []);
  useEffect(() => {
    if (!run && runs?.length) navigate({ view: "library", run: runs[0].name });
  }, [run, runs]);
  useEffect(() => {
    if (!run) return;
    setGames(null);
    api.games(run).then(setGames).catch((e) => setError(String(e.message ?? e)));
  }, [run]);

  if (error) return <div className="panel m-6 p-6 text-ink-2">Could not load the library: <span className="mono text-loss">{error}</span></div>;
  const current = runs?.find((r) => r.name === run);
  const s = current?.summary;

  return (
    <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-5 px-4 pb-10 pt-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="thin-scroll flex flex-col gap-0.5 lg:sticky lg:top-3 lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto">
        <div className="eyebrow mb-2 px-3">Runs · newest first</div>
        {runs?.map((r) => <RunItem key={r.name} r={r} active={r.name === run} />)}
      </aside>
      <section className="min-w-0">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="eyebrow">{run === "proofs" ? "Proof games" : "Run"}</div>
            <h1 className="font-display text-[26px] font-semibold leading-tight tracking-tight">
              {run === "proofs" ? "Every rung we have beaten" : run}
            </h1>
          </div>
          {s && (
            <dl className="flex gap-4 text-[12px]">
              {[
                ["Elo", `${Math.round(s.elo ?? 0)} ±${Math.round(s.elo_err95 ?? 0)}`],
                ["W-D-L", `${s.wins}-${s.draws}-${s.losses}`],
                ["Target", `${s.target_elo}`],
                ["Avg depth", `${s.avg_depth ?? "—"}`],
                ["Host", `${s.host ?? "—"}`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="eyebrow">{k}</dt>
                  <dd className="mono text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        {!games ? (
          <div className="grid h-[40vh] place-items-center text-ink-3">Loading games…</div>
        ) : (
          <motion.ol
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.02 } } }}
            className="grid grid-cols-1 gap-1.5 md:grid-cols-2 xl:grid-cols-3"
          >
            {games.map((g, i) => {
              const res = engineResult(g);
              return (
                <motion.li key={g.file} variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}>
                  <a
                    href={href({ view: "replay", run: run!, file: g.file })}
                    className="panel group flex items-center gap-3 px-3 py-2.5 transition-colors hover:border-line-2 hover:bg-bg-3"
                  >
                    <span className={`h-3 w-3 shrink-0 rounded-full ${DOT[res]}`} title={res} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-[15px] font-semibold tracking-tight">
                          {run === "proofs" ? `Beat ${g.level}` : `#${i + 1}`}
                        </span>
                        <span className="text-[12px] text-ink-2">
                          {run === "proofs" ? "" : `Stockfish ${g.level} · `}
                          as {g.engine}
                        </span>
                        <span className="mono ml-auto text-[12px] text-ink">{g.result}</span>
                      </div>
                      <div className="mt-0.5 truncate text-[11px] text-ink-3">
                        {g.opening && g.opening !== "Start position" ? `${g.opening} · ` : ""}
                        {g.plies} plies · {g.termination}
                        {g.stats?.acpl != null && ` · ACPL ${g.stats.acpl}`}
                        {g.stats?.blunders != null && g.stats.blunders > 0 && ` · ${g.stats.blunders} blunder${g.stats.blunders === 1 ? "" : "s"}`}
                      </div>
                    </div>
                    <span className="text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-ink">›</span>
                  </a>
                </motion.li>
              );
            })}
          </motion.ol>
        )}
      </section>
    </div>
  );
}
