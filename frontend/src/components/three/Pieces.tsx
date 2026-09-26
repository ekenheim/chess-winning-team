// Renders one PieceActor per stable piece id: the live pieces on their squares AND the captured pieces in their tray
// slots, in one keyed list. Because a captured piece keeps its React key when it moves from the board list into the
// tray list, it is never remounted: it arcs into the tray on a forward step and arcs back on a backward step, and any
// jump re-derives both lists from `captured` (so the trays are always exactly right).
// The Poly Haven set suspends while loading; the procedural set is the Suspense fallback (in Scene) and the error
// fallback (here), so the board is never empty.
import { useBoard } from "./BoardContext";
import ErrorBoundary from "./ErrorBoundary";
import { PieceActor } from "./PieceActor";
import { usePieceSet, useProceduralPieceSet, type PieceSet } from "./usePieceSet";

function PieceList({ set }: { set: PieceSet }) {
  const { pieces, captured } = useBoard();
  // ONE array: keys are only matched within a single child list, so board and tray pieces must share it.
  const actors = [
    ...pieces.map((p) => <PieceActor key={p.id} piece={p} set={set} />),
    ...captured.w.map((p, i) => <PieceActor key={p.id} piece={p} set={set} trayIndex={i} />),
    ...captured.b.map((p, i) => <PieceActor key={p.id} piece={p} set={set} trayIndex={i} />),
  ];
  return <>{actors}</>;
}

function ProceduralPieces() {
  const set = useProceduralPieceSet();
  return <PieceList set={set} />;
}

function GltfPieces() {
  const set = usePieceSet();
  return <PieceList set={set} />;
}

export default function Pieces({ procedural }: { procedural?: boolean }) {
  if (procedural) return <ProceduralPieces />;
  return (
    <ErrorBoundary fallback={<ProceduralPieces />} onError={(e) => console.warn("[board3d] piece set failed, using procedural pieces", e)}>
      <GltfPieces />
    </ErrorBoundary>
  );
}
