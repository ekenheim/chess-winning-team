import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { motion } from "motion/react";
import { api, type GameInfo } from "@/lib/api";
import { engineColor, gameResultFromData, judge, evalCp, shortName } from "@/lib/chess";
import { useReplay } from "@/store/replay";
import { sound } from "@/lib/sound";
import { href } from "@/lib/router";
import Board from "@/components/Board";
import EvalBar from "@/components/EvalBar";
import EvalGraph from "@/components/EvalGraph";
import MoveList from "@/components/MoveList";
import Transport from "@/components/Transport";
import Commentary from "@/components/Commentary";

function PlayerRow({ name, tag, side, active, result }: { name: string; tag: string; side: "white" | "black"; active: boolean; result?: string }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span
        className={`h-3.5 w-3.5 rounded-sm ring-1 ring-line-2 ${side === "white" ? "bg-[#f1ebdc]" : "bg-[#1a1713]"}`}
        aria-hidden
      />
      <span className={`truncate text-[14px] font-medium ${active ? "text-ink" : "text-ink-2"}`}>{name}</span>
      <span className="mono rounded bg-bg-3 px-1.5 py-0.5 text-[11px] text-ink-2">{tag}</span>
      {result && <span className="mono ml-auto text-[13px] font-semibold text-ink">{result}</span>}
      {active && <span className="ml-auto h-2 w-2 rounded-full bg-accent" title="to move" />}
    </div>
  );
}

export default function Replay({ run, file, startPly }: { run: string; file: string; startPly?: number }) {
  const { game, ply, playing, speed, sound: soundOn, orientation } = useReplay();
  const load = useReplay((s) => s.load);
  const goto = useReplay((s) => s.goto);
  const [error, setError] = useState<string | null>(null);
  const [siblings, setSiblings] = useState<GameInfo[]>([]);
  const prevPly = useRef(0);
  const celebrated = useRef(false);

  useEffect(() => {
    let alive = true;
    setError(null);
    api
      .game(run, file)
      .then((g) => {
        if (!alive) return;
        load(run, file, g);
        if (startPly != null) goto(startPly);
      })
      .catch((e) => alive && setError(String(e.message ?? e)));
    api.games(run).then((gs) => alive && setSiblings(gs)).catch(() => {});
    celebrated.current = false;
    prevPly.current = 0;
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, file, load]);

  // autoplay: pace slows down around big eval swings (the cinematic bit)
  useEffect(() => {
    if (!playing || !game) return;
    const next = game.moves[ply];
    if (!next) return;
    let ms = 900 / speed;
    const v = judge(next);
    const swing = Math.abs((evalCp(next) ?? 0) - (evalCp(game.moves[ply - 1]) ?? 0));
    if (v === "blunder" || swing >= 200) ms *= 2.2;
    else if (v === "mistake" || swing >= 100) ms *= 1.5;
    if (next.capture || next.check) ms *= 1.15;
    const t = window.setTimeout(() => goto(ply + 1), ms);
    return () => window.clearTimeout(t);
  }, [playing, ply, speed, game, goto]);

  // sounds + celebration
  useEffect(() => {
    if (!game) return;
    const forward = ply === prevPly.current + 1;
    prevPly.current = ply;
    const m = ply > 0 ? game.moves[ply - 1] : undefined;
    if (forward && m && soundOn) {
      if (m.check) sound.check();
      else if (m.capture) sound.capture();
      else sound.move();
    }
    if (ply === game.moves.length && ply > 0 && !celebrated.current) {
      celebrated.current = true;
      const r = gameResultFromData(game);
      if (soundOn) (r === "win" ? sound.win : r === "loss" ? sound.loss : sound.draw)();
      if (r === "win" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const colors = ["#f0c060", "#f1ebdc", "#9b7353", "#e8a33a"];
        confetti({ particleCount: 140, spread: 75, origin: { y: 0.55 }, colors, ticks: 220 });
        window.setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors }), 250);
        window.setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors }), 400);
      }
    }
  }, [ply, game, soundOn]);

  if (error)
    return (
      <div className="panel m-6 p-6 text-ink-2">
        Could not load this game: <span className="mono text-loss">{error}</span>
      </div>
    );
  if (!game || useReplay.getState().file !== file)
    return <div className="grid h-[60vh] place-items-center text-ink-3">Loading game…</div>;

  const h = game.headers;
  const eng = engineColor(game);
  const level = h.StockfishElo ?? h.BlackElo ?? h.WhiteElo ?? "?";
  const result = gameResultFromData(game);
  const resultWord = result === "win" ? "Win" : result === "loss" ? "Loss" : result === "draw" ? "Draw" : "—";
  const resultColor = result === "win" ? "bg-win-deep text-white" : result === "loss" ? "bg-loss text-white" : "bg-bg-4 text-ink";
  const turn = (ply > 0 ? game.moves[ply - 1].fen : game.start_fen).split(" ")[1] === "w" ? "white" : "black";
  const finished = ply === game.moves.length;
  const top = orientation === "white" ? "black" : "white";
  const bottom = orientation;
  const names = { white: shortName(h.White ?? "White"), black: shortName(h.Black ?? "Black") };
  const tags = { white: eng === "white" ? "our engine" : `Elo ${level}`, black: eng === "black" ? "our engine" : `Elo ${level}` };
  const idx = siblings.findIndex((g) => g.file === file);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const scoreOf = (side: "white" | "black") =>
    finished ? (h.Result === "1/2-1/2" ? "½" : (h.Result === "1-0") === (side === "white") ? "1" : "0") : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-4 px-4 pb-6 pt-3 lg:grid-cols-[minmax(0,1fr)_400px]"
    >
      {/* board column */}
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-center gap-3 text-[12px] text-ink-3">
          <a href={href({ view: "library", run })} className="hover:text-ink">
            ‹ {run === "proofs" ? "Proofs" : `Run ${run}`}
          </a>
          <span className="mono">{file}</span>
          <span className="ml-auto flex gap-1">
            <a
              className={`rounded-md bg-bg-3 px-2 py-1 hover:bg-bg-4 hover:text-ink ${prev ? "" : "pointer-events-none opacity-40"}`}
              href={prev ? href({ view: "replay", run, file: prev.file }) : undefined}
            >
              ‹ prev game
            </a>
            <a
              className={`rounded-md bg-bg-3 px-2 py-1 hover:bg-bg-4 hover:text-ink ${next ? "" : "pointer-events-none opacity-40"}`}
              href={next ? href({ view: "replay", run, file: next.file }) : undefined}
            >
              next game ›
            </a>
          </span>
        </div>
        <div className="mx-auto w-full" style={{ maxWidth: "min(100%, calc(100vh - 300px))" }}>
          <PlayerRow name={names[top]} tag={tags[top]} side={top} active={turn === top && !finished} result={scoreOf(top)} />
          <div className="flex items-stretch gap-2.5">
            <EvalBar />
            <div className="min-w-0 flex-1 rounded-md shadow-[0_18px_50px_-12px_rgb(0_0_0/0.7)]">
              <Board />
            </div>
          </div>
          <PlayerRow name={names[bottom]} tag={tags[bottom]} side={bottom} active={turn === bottom && !finished} result={scoreOf(bottom)} />
        </div>
        <Transport />
        <EvalGraph />
      </div>

      {/* right column */}
      <div className="flex min-h-0 flex-col gap-3 lg:h-[calc(100vh-88px)] lg:sticky lg:top-3">
        <div className="panel p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="eyebrow">{h.Event ?? "game"} · {h.Date ?? ""}</div>
              <h1 className="font-display mt-1 text-[22px] font-semibold leading-tight tracking-tight">
                Stockfish {level} <span className="text-ink-3">·</span> {eng === "white" ? "we play White" : "we play Black"}
              </h1>
              <div className="mt-1 text-[12px] text-ink-2">
                {h.Opening && h.Opening !== "Start position" ? `${h.Opening} · ` : ""}
                {h.PlyCount} plies · {h.Termination} · {h.MoveTimeS ?? "?"} s/move
                {game.stats?.acpl != null && ` · ACPL ${game.stats.acpl}`}
              </div>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold ${resultColor}`}>
              {resultWord} {h.Result}
            </span>
          </div>
        </div>
        <div className="panel flex min-h-[220px] flex-1 flex-col p-2.5 lg:min-h-0">
          <div className="mb-1.5 flex items-center justify-between px-1">
            <span className="eyebrow">Moves</span>
            <span className="eyebrow">depth</span>
          </div>
          <MoveList />
        </div>
        <div className="min-h-[240px] flex-[1.15] lg:min-h-0">
          <Commentary />
        </div>
      </div>
    </motion.div>
  );
}
