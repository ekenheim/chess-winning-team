// One store drives the 2D board, the eval bar/graph, the move list and (later) a 3D view.
import { create } from "zustand";
import type { GameData } from "@/lib/api";
import { engineColor } from "@/lib/chess";

export const SPEEDS = [0.25, 0.5, 1, 2, 4] as const;
export type Speed = (typeof SPEEDS)[number];

interface ReplayState {
  game: GameData | null;
  run: string | null;
  file: string | null;
  ply: number; // 0 = start position
  playing: boolean;
  speed: Speed;
  orientation: "white" | "black";
  sound: boolean;
  arrows: boolean;
  hoverPly: number | null;
  load(run: string, file: string, game: GameData): void;
  goto(ply: number): void;
  step(delta: number): void;
  setPlaying(v: boolean): void;
  togglePlaying(): void;
  setSpeed(s: Speed): void;
  flip(): void;
  toggleSound(): void;
  toggleArrows(): void;
  setHoverPly(p: number | null): void;
}

export const useReplay = create<ReplayState>((set, get) => ({
  game: null,
  run: null,
  file: null,
  ply: 0,
  playing: false,
  speed: 1,
  orientation: "white",
  sound: true,
  arrows: true,
  hoverPly: null,
  load: (run, file, game) =>
    set({ game, run, file, ply: 0, playing: false, hoverPly: null, orientation: engineColor(game) }),
  goto: (ply) => {
    const g = get().game;
    if (!g) return;
    const max = g.moves.length;
    const next = Math.max(0, Math.min(max, ply));
    set({ ply: next, playing: next >= max ? false : get().playing });
  },
  step: (delta) => get().goto(get().ply + delta),
  setPlaying: (playing) => {
    const g = get().game;
    if (!g) return;
    if (playing && get().ply >= g.moves.length) set({ ply: 0 });
    set({ playing });
  },
  togglePlaying: () => get().setPlaying(!get().playing),
  setSpeed: (speed) => set({ speed }),
  flip: () => set({ orientation: get().orientation === "white" ? "black" : "white" }),
  toggleSound: () => set({ sound: !get().sound }),
  toggleArrows: () => set({ arrows: !get().arrows }),
  setHoverPly: (hoverPly) => set({ hoverPly }),
}));
