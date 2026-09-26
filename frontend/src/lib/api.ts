// Typed client for the JSON API that `make app` (arena/app.py) serves next to games/ and analysis/.

export interface RunSummary {
  elo?: number;
  elo_err95?: number;
  target_elo?: number;
  wins_at_target?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  games?: number;
  avg_depth?: number;
  avg_nodes_per_sec?: number;
  move_time_s?: number;
  host?: string;
  per_level?: Record<string, { wins: number; draws: number; losses: number }>;
  terminations?: Record<string, number>;
}

export interface RunInfo {
  name: string;
  games: number;
  summary: RunSummary | null;
  has_analysis: boolean;
}

export interface GameStats {
  acpl?: number | null;
  blunders?: number | null;
  mistakes?: number | null;
  inaccuracies?: number | null;
}

export interface GameInfo {
  file: string;
  white: string;
  black: string;
  result: string;
  level: string | null;
  engine: "white" | "black" | string;
  opening: string;
  plies: string;
  termination: string;
  date: string;
  move_time?: string | null;
  engine_commit?: string;
  stats?: GameStats;
  worst?: { ply: number; san: string; cp_loss: number; best: string; phase: string };
}

export interface MoveAnalysis {
  by?: "engine" | "stockfish";
  phase?: "opening" | "middlegame" | "endgame";
  cp_before?: number | null;
  cp?: number | null; // white's point of view, after the move
  cp_loss?: number | null;
  best?: string | null; // SAN
  best_uci?: string | null;
  depth?: number | null;
  seconds?: number | null;
  nodes?: number | null;
  engine_score_cp?: number | null;
  comment?: string | null;
}

export interface MoveSearch {
  by: "engine" | "stockfish";
  depth: number;
  seconds: number;
  nodes: number;
}

export interface Move {
  ply: number;
  san: string;
  uci: string;
  fen: string;
  comment: string;
  capture: boolean;
  check: boolean;
  eval: { cp: number | null; mate: number | null } | null;
  search?: MoveSearch;
  analysis: MoveAnalysis | null;
}

export interface GameData {
  headers: Record<string, string>;
  start_fen: string;
  moves: Move[];
  analysis_summary: string | null;
  reports: Partial<Record<"summary" | "grandmaster" | "engine-dev", string>>;
  analysis_run: string | null;
  stats?: GameStats & {
    worst?: { ply: number; san: string; cp_loss: number; best: string; phase: string; by: string } | null;
    max_engine_eval?: number;
    min_engine_eval?: number;
  };
}

export interface WDL {
  w: number;
  d: number;
  l: number;
}

export interface Rung {
  level: number;
  full: WDL;
  fast: WDL;
  proof: {
    file: string;
    engine: string;
    plies: string;
    termination: string;
    date: string;
    engine_commit: string;
    opening: string;
    result: string;
  } | null;
  verified: boolean | null;
  wins: { run: string; file: string }[];
  status: "beaten" | "contested" | "locked";
}

export interface Ladder {
  rungs: Rung[];
  highest_beaten: number | null;
  target: number;
  step: number;
  move_time: number;
  opponent: string;
}

async function get<T>(path: string): Promise<T> {
  const r = await fetch(path, { cache: "no-store" });
  if (!r.ok) {
    let msg = r.statusText;
    try {
      msg = (await r.json()).error ?? msg;
    } catch {
      /* not json */
    }
    throw new Error(msg);
  }
  return r.json() as Promise<T>;
}

export const api = {
  runs: () => get<RunInfo[]>("/api/runs"),
  games: (run: string) => get<GameInfo[]>(`/api/games?run=${encodeURIComponent(run)}`),
  game: (run: string, file: string) =>
    get<GameData>(`/api/game?run=${encodeURIComponent(run)}&file=${encodeURIComponent(file)}`),
  ladder: () => get<Ladder>("/api/ladder"),
};
