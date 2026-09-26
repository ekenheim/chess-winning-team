import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReplay } from "@/store/replay";
import { JUDGE_LABEL, evalCp, fmtNodes, formatEval, judge, mateIn, moveNumber } from "@/lib/chess";
import Markdown from "./Markdown";

type Tab = "move" | "grandmaster" | "engine-dev" | "summary";

function Stat({ label, value, mono = true }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="eyebrow">{label}</div>
      <div className={`${mono ? "mono" : ""} truncate text-[13px] text-ink`}>{value}</div>
    </div>
  );
}

export default function Commentary() {
  const game = useReplay((s) => s.game);
  const ply = useReplay((s) => s.ply);
  const [tab, setTab] = useState<Tab>("move");
  if (!game) return null;
  const m = ply > 0 ? game.moves[ply - 1] : undefined;
  const a = m?.analysis;
  const v = m ? judge(m) : null;
  const reports = game.reports ?? {};
  const tabs: { id: Tab; label: string; on: boolean }[] = [
    { id: "move", label: "This move", on: true },
    { id: "grandmaster", label: "Grandmaster", on: !!reports.grandmaster },
    { id: "engine-dev", label: "Engine dev", on: !!reports["engine-dev"] },
    { id: "summary", label: "Run", on: !!reports.summary },
  ];
  const who = m ? (m.ply % 2 === 1 ? game.headers.White : game.headers.Black) : "";
  const byEngine = m ? (m.ply % 2 === 1) === (game.headers.EngineColor !== "black") : false;

  return (
    <div className="panel flex min-h-0 flex-col">
      <div className="flex gap-0.5 border-b border-line p-1.5" role="tablist">
        {tabs
          .filter((t) => t.on)
          .map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-md px-2.5 py-1 text-[12px] transition-colors ${
                tab === t.id ? "bg-bg-4 text-ink" : "text-ink-3 hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
      </div>
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto p-3">
        {tab === "move" && (
          <AnimatePresence mode="wait">
            <motion.div
              key={ply}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {!m ? (
                <p className="text-[13px] text-ink-2">
                  Start position. Press <kbd className="mono rounded bg-bg-3 px-1">space</kbd> to auto-play, or scrub the
                  graph below the board.
                </p>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-[22px] font-semibold tracking-tight">
                      {moveNumber(m.ply)} {m.san}
                    </span>
                    {v && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          v === "blunder"
                            ? "bg-loss text-white"
                            : v === "mistake"
                              ? "bg-accent-deep text-white"
                              : v === "inaccuracy"
                                ? "bg-inaccuracy text-accent-ink"
                                : "bg-win-deep text-white"
                        }`}
                      >
                        {JUDGE_LABEL[v]}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[12px] text-ink-3">
                    {byEngine ? "our engine" : "Stockfish"} · {who}
                    {a?.phase ? ` · ${a.phase}` : ""}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2.5">
                    <Stat label="Eval" value={formatEval(evalCp(m), mateIn(m))} />
                    <Stat label="Depth" value={m.search ? m.search.depth : (a?.depth ?? "—")} />
                    <Stat label="Time" value={m.search ? `${m.search.seconds.toFixed(2)} s` : a?.seconds != null ? `${a.seconds.toFixed(2)} s` : "—"} />
                    <Stat label="Nodes" value={fmtNodes(m.search?.nodes ?? a?.nodes)} />
                    {a?.cp_loss != null && (
                      <Stat label="Cp lost" value={a.cp_loss === 0 ? "0" : `−${a.cp_loss}`} />
                    )}
                    {a?.best && a.best !== m.san && (
                      <Stat label="Best was" value={<span className="text-win">{a.best}</span>} />
                    )}
                  </div>
                  {a?.comment && <p className="mt-3 text-[13px] leading-relaxed text-ink-2">{a.comment}</p>}
                  {!a && m.comment && (
                    <p className="mono mt-3 text-[11px] text-ink-3">{m.comment}</p>
                  )}
                  {!game.analysis_run && (
                    <p className="mt-3 text-[11px] text-ink-3">
                      No full-strength analysis for this run yet; depth and time are what the player reported.
                    </p>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}
        {tab === "grandmaster" && reports.grandmaster && <Markdown text={reports.grandmaster} />}
        {tab === "engine-dev" && reports["engine-dev"] && <Markdown text={reports["engine-dev"]} />}
        {tab === "summary" && reports.summary && <Markdown text={reports.summary} />}
      </div>
    </div>
  );
}
