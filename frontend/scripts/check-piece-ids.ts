// Self-check for the stable piece ids used by the 3D board: replays every game with pieceIds.ts and asserts that
// (1) the placement of every frame equals the FEN board field python-chess produced, and (2) ids are unique per ply.
// Usage (from frontend/):
//   /opt/anaconda3/bin/python scripts/dump-games.py > /tmp/games.json && node scripts/check-piece-ids.ts /tmp/games.json
// Node strips the TypeScript types natively; the import is relative so no path alias is needed.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pieceFrames, placement } from "../src/lib/three/pieceIds.ts";

interface Rec { f: string; start: string; ucis: string[]; fens: string[]; ep?: number[]; promo?: number[]; castle?: number[] }

const arg = process.argv[2];
const raw = arg
  ? readFileSync(arg, "utf8")
  : execFileSync(process.env.PYTHON ?? "/opt/anaconda3/bin/python", [new URL("./dump-games.py", import.meta.url).pathname], { maxBuffer: 1 << 30, encoding: "utf8" });
const games: Rec[] = JSON.parse(raw);

let plies = 0, mismatches = 0, dupPlies = 0, ep = 0, promo = 0, castle = 0;
for (const g of games) {
  const frames = pieceFrames(g.start, g.ucis);
  if (placement(frames[0]) !== g.start.split(" ")[0]) {
    mismatches++;
    console.log("MISMATCH start", g.f);
  }
  g.fens.forEach((fen, i) => {
    plies++;
    const got = placement(frames[i + 1]);
    if (got !== fen.split(" ")[0]) {
      if (mismatches++ < 5) console.log("MISMATCH", g.f, `ply ${i + 1}`, g.ucis[i], got, "!=", fen.split(" ")[0]);
    }
    const ids = frames[i + 1].map((p) => p.id);
    if (new Set(ids).size !== ids.length) {
      if (dupPlies++ < 5) console.log("DUPLICATE ids", g.f, `ply ${i + 1}`);
    }
  });
  ep += g.ep?.length ?? 0;
  promo += g.promo?.length ?? 0;
  castle += g.castle?.length ?? 0;
}
console.log(JSON.stringify({ games: games.length, plies, mismatches, dupPlies, enPassant: ep, promotions: promo, castles: castle }));
if (mismatches || dupPlies) process.exit(1);
