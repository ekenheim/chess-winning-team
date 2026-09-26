import { motion } from "motion/react";
import type { Top } from "@/lib/api";
import { href } from "@/lib/router";

const pct = (r: number | null) => (r == null ? "—" : `${(r * 100).toFixed(1)}%`);
const mv = (m: number | null | undefined) => (m == null ? "—" : Number.isInteger(m) ? String(m) : m.toFixed(1));

function WdlBar({ w, d, l }: { w: number; d: number; l: number }) {
  const n = w + d + l;
  if (!n) return <div className="h-2.5 w-full rounded-full bg-bg-4/60" />;
  return (
    <div className="flex h-2.5 w-full gap-px overflow-hidden rounded-full" role="img" aria-label={`${w} wins, ${d} draws, ${l} losses`}>
      {w > 0 && <div className="h-full bg-win" style={{ width: `${(w / n) * 100}%` }} title={`${w} wins`} />}
      {d > 0 && <div className="h-full bg-draw" style={{ width: `${(d / n) * 100}%` }} title={`${d} draws`} />}
      {l > 0 && <div className="h-full bg-loss" style={{ width: `${(l / n) * 100}%` }} title={`${l} losses`} />}
    </div>
  );
}

/** The scoreboard the judges rank by: win ratio against Stockfish at its maximum UCI_Elo, plus game length. */
export default function TopBoard({ top }: { top: Top }) {
  const empty = top.games === 0;
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="panel glow-accent relative border-accent/50 p-5 md:p-6"
      aria-label={`${top.level} scoreboard`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="eyebrow text-accent">
          {top.level} scoreboard · {top.opponent} · {top.move_time} s per move
        </div>
        <div className="text-[11px] text-ink-3">win ratio = wins / all games at {top.level}; draws and losses are non-wins</div>
      </div>

      {empty ? (
        <div className="mt-4 font-display text-[26px] font-semibold tracking-tight text-ink-2">No games at {top.level} yet</div>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-1 items-end gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div>
              <div className="text-[15px] text-ink-2">Win ratio at {top.level}</div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="hero-number text-[clamp(64px,8vw,104px)]">{pct(top.win_ratio)}</span>
                <span className="font-display text-[26px] font-semibold tracking-tight text-ink tnum">
                  {top.wins} / {top.games}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <WdlBar w={top.wins} d={top.draws} l={top.losses} />
                <span className="mono shrink-0 text-[12px] tabular-nums text-ink-2">
                  <span className="text-win">{top.wins} W</span> · <span className="text-draw">{top.draws} D</span> ·{" "}
                  <span className="text-loss">{top.losses} L</span>
                </span>
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-3">
              <div className="panel p-3.5">
                <dt className="eyebrow">Avg moves / game</dt>
                <dd className="font-display mt-1 text-[28px] font-semibold leading-none tracking-tight tnum">{mv(top.avg_moves)}</dd>
              </div>
              <div className="panel p-3.5">
                <dt className="eyebrow">Avg moves in wins</dt>
                <dd className="font-display mt-1 text-[28px] font-semibold leading-none tracking-tight tnum">{mv(top.avg_moves_wins)}</dd>
              </div>
              <div className="panel p-3.5">
                <dt className="eyebrow">Fastest win</dt>
                <dd className="font-display mt-1 text-[28px] font-semibold leading-none tracking-tight tnum">
                  {top.fastest_win ? (
                    <a
                      href={href({ view: "replay", run: top.fastest_win.run, file: top.fastest_win.file })}
                      className="text-accent hover:underline"
                      title={`${top.fastest_win.run}/${top.fastest_win.file} · ${top.fastest_win.termination}`}
                    >
                      {mv(top.fastest_win.moves)} ›
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="min-w-0">
              <h3 className="eyebrow mb-2">By engine</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="mono text-left text-[10.5px] uppercase tracking-[0.08em] text-ink-3">
                      <th className="py-1.5 pr-3 font-medium">Engine</th>
                      <th className="py-1.5 pr-3 text-right font-medium">Win ratio</th>
                      <th className="py-1.5 pr-3 text-right font-medium">W-D-L</th>
                      <th className="py-1.5 pr-3 text-right font-medium">Avg mv</th>
                      <th className="py-1.5 pr-3 text-right font-medium">Avg mv wins</th>
                      <th className="py-1.5 text-right font-medium">Fastest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {top.engines.map((e) => (
                      <tr key={e.commit} className="border-t border-line/70">
                        <td className="mono py-1.5 pr-3 text-ink" title={e.runs.join(", ")}>{e.commit}</td>
                        <td className="py-1.5 pr-3 text-right font-semibold tnum">
                          {pct(e.win_ratio)} <span className="font-normal text-ink-3">({e.wins}/{e.games})</span>
                        </td>
                        <td className="mono py-1.5 pr-3 text-right tabular-nums text-ink-2">
                          {e.wins}-{e.draws}-{e.losses}
                        </td>
                        <td className="py-1.5 pr-3 text-right tnum text-ink-2">{mv(e.avg_moves)}</td>
                        <td className="py-1.5 pr-3 text-right tnum text-ink-2">{mv(e.avg_moves_wins)}</td>
                        <td className="py-1.5 text-right tnum">
                          {e.fastest_win ? (
                            <a href={href({ view: "replay", run: e.fastest_win.run, file: e.fastest_win.file })} className="text-accent hover:underline">
                              {mv(e.fastest_win.moves)} ›
                            </a>
                          ) : (
                            <span className="text-ink-3">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="eyebrow mb-2">Wins at {top.level} ({top.win_games.length})</h3>
              {top.win_games.length === 0 ? (
                <div className="text-[13px] text-ink-3">No wins at {top.level} yet.</div>
              ) : (
                <ul className="thin-scroll flex max-h-[220px] flex-col gap-1 overflow-y-auto pr-1">
                  {top.win_games.map((g) => (
                    <li key={`${g.run}/${g.file}`}>
                      <a
                        href={href({ view: "replay", run: g.run, file: g.file })}
                        className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg px-2.5 py-1.5 text-[12.5px] hover:bg-bg-3"
                      >
                        <i className="inline-block h-2 w-2 rounded-full bg-win" />
                        <span className="min-w-0 truncate">
                          <span className="mono text-ink">{g.run}/{g.file}</span>
                          <span className="text-ink-3"> · {g.termination} · as {g.engine} · {g.date}</span>
                        </span>
                        <span className="tnum text-ink-2">{mv(g.moves)} moves ›</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </motion.section>
  );
}
