// Renders one PieceActor per stable piece id. The Poly Haven set suspends while loading; the procedural set is the
// Suspense fallback (in Scene) and the error fallback (here), so the board is never empty.
import { useBoard } from "./BoardContext";
import ErrorBoundary from "./ErrorBoundary";
import { PieceActor } from "./PieceActor";
import { usePieceSet, useProceduralPieceSet, type PieceSet } from "./usePieceSet";

function PieceList({ set }: { set: PieceSet }) {
  const { pieces } = useBoard();
  return (
    <>
      {pieces.map((p) => (
        <PieceActor key={p.id} piece={p} set={set} />
      ))}
    </>
  );
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
