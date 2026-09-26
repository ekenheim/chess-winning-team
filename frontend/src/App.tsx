import { href, useRoute } from "@/lib/router";
import Ladder from "@/views/Ladder";
import Library from "@/views/Library";
import Replay from "@/views/Replay";

export default function App() {
  const route = useRoute();
  const nav = [
    { label: "Ladder", to: href({ view: "ladder" }), on: route.view === "ladder" },
    { label: "Games", to: href({ view: "library" }), on: route.view === "library" || route.view === "replay" },
  ];
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-12 w-full max-w-[1500px] items-center gap-6 px-4">
          <a href="#/" className="flex items-baseline gap-2">
            <span className="font-display text-[17px] font-bold tracking-tight">Chess Winning Team</span>
            <span className="mono text-[10.5px] uppercase tracking-[0.16em] text-ink-3">vs Stockfish</span>
          </a>
          <nav className="flex gap-1">
            {nav.map((n) => (
              <a
                key={n.label}
                href={n.to}
                className={`rounded-md px-2.5 py-1 text-[13px] transition-colors ${n.on ? "bg-bg-3 text-ink" : "text-ink-2 hover:text-ink"}`}
              >
                {n.label}
              </a>
            ))}
          </nav>
          <span className="ml-auto hidden text-[11px] text-ink-3 md:inline">
            ← → step · space play · f flip · a arrows · s sound
          </span>
        </div>
      </header>
      <main className="flex-1">
        {route.view === "ladder" && <Ladder />}
        {route.view === "library" && <Library run={route.run} />}
        {route.view === "replay" && <Replay key={`${route.run}/${route.file}`} run={route.run} file={route.file} startPly={route.ply} />}
      </main>
    </div>
  );
}
