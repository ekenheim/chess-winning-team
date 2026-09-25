//! Static evaluation: material + piece-square tables (Michniewski's
//! "Simplified Evaluation Function" tables), tapered between a middlegame
//! and an endgame score by the non-pawn material left on the board.
//!
//! The evaluation is kept incrementally: `EvalState` holds the White-relative
//! middlegame and endgame sums and the phase, and `state_after` updates it
//! for a move in O(1) instead of rescanning the board.

use cozy_chess::{Board, Color, File, Move, Piece, Rank, Square};

pub const PAWN: i32 = 100;
pub const KNIGHT: i32 = 320;
pub const BISHOP: i32 = 330;
pub const ROOK: i32 = 500;
pub const QUEEN: i32 = 900;

pub fn piece_value(piece: Piece) -> i32 {
    match piece {
        Piece::Pawn => PAWN,
        Piece::Knight => KNIGHT,
        Piece::Bishop => BISHOP,
        Piece::Rook => ROOK,
        Piece::Queen => QUEEN,
        Piece::King => 0,
    }
}

// Tables are written as seen from White's side with rank 8 at the top,
// exactly as on the Chess Programming Wiki.
#[rustfmt::skip]
const PAWN_PST: [i32; 64] = [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
];

/// Endgame pawn table: advancement is what matters once the pieces are off.
#[rustfmt::skip]
const PAWN_EG_PST: [i32; 64] = [
     0,  0,  0,  0,  0,  0,  0,  0,
    90, 90, 90, 90, 90, 90, 90, 90,
    55, 55, 55, 55, 55, 55, 55, 55,
    30, 30, 30, 30, 30, 30, 30, 30,
    15, 15, 15, 15, 15, 15, 15, 15,
     5,  5,  5,  5,  5,  5,  5,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
     0,  0,  0,  0,  0,  0,  0,  0,
];

#[rustfmt::skip]
const KNIGHT_PST: [i32; 64] = [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
];

#[rustfmt::skip]
const BISHOP_PST: [i32; 64] = [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
];

#[rustfmt::skip]
const ROOK_PST: [i32; 64] = [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0,
];

#[rustfmt::skip]
const QUEEN_PST: [i32; 64] = [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
];

#[rustfmt::skip]
const KING_MG_PST: [i32; 64] = [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20,
];

#[rustfmt::skip]
const KING_EG_PST: [i32; 64] = [
    -50,-40,-30,-20,-20,-30,-40,-50,
    -30,-20,-10,  0,  0,-10,-20,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-30,  0,  0,  0,  0,-30,-30,
    -50,-30,-30,-30,-30,-30,-30,-50,
];

/// Index into a White-perspective table for a piece of `color` on `sq`.
/// cozy-chess squares are A1 = 0 … H8 = 63, so White flips the rank.
#[inline]
fn pst_index(color: Color, sq: Square) -> usize {
    let i = sq as usize;
    match color {
        Color::White => i ^ 56,
        Color::Black => i,
    }
}

#[inline]
fn tables(piece: Piece) -> (&'static [i32; 64], &'static [i32; 64]) {
    match piece {
        Piece::Pawn => (&PAWN_PST, &PAWN_EG_PST),
        Piece::Knight => (&KNIGHT_PST, &KNIGHT_PST),
        Piece::Bishop => (&BISHOP_PST, &BISHOP_PST),
        Piece::Rook => (&ROOK_PST, &ROOK_PST),
        Piece::Queen => (&QUEEN_PST, &QUEEN_PST),
        Piece::King => (&KING_MG_PST, &KING_EG_PST),
    }
}

/// (middlegame, endgame) worth of a piece on a square, from White's view.
#[inline]
fn psq(color: Color, piece: Piece, sq: Square) -> (i32, i32) {
    let (mg, eg) = tables(piece);
    let i = pst_index(color, sq);
    let v = piece_value(piece);
    let sign = if color == Color::White { 1 } else { -1 };
    (sign * (v + mg[i]), sign * (v + eg[i]))
}

/// Total phase weight of all non-pawn material at the start of the game:
/// 4 minors x1 + 4 rooks x2 + 2 queens x4 over both sides.
pub const PHASE_MAX: i32 = 24;

#[inline]
fn phase_of(piece: Piece) -> i32 {
    match piece {
        Piece::Knight | Piece::Bishop => 1,
        Piece::Rook => 2,
        Piece::Queen => 4,
        _ => 0,
    }
}

/// Incrementally maintained evaluation terms, all from White's point of view.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct EvalState {
    pub mg: i32,
    pub eg: i32,
    /// Non-pawn material phase: PHASE_MAX at the start, 0 with only pawns
    /// and kings left (can exceed PHASE_MAX after promotions; clamped on use).
    pub phase: i32,
}

impl EvalState {
    #[inline]
    fn add(&mut self, color: Color, piece: Piece, sq: Square) {
        let (mg, eg) = psq(color, piece, sq);
        self.mg += mg;
        self.eg += eg;
        self.phase += phase_of(piece);
    }

    #[inline]
    fn remove(&mut self, color: Color, piece: Piece, sq: Square) {
        let (mg, eg) = psq(color, piece, sq);
        self.mg -= mg;
        self.eg -= eg;
        self.phase -= phase_of(piece);
    }
}

/// Full recomputation from the board (used at the root and in tests).
pub fn full_state(board: &Board) -> EvalState {
    let mut st = EvalState { mg: 0, eg: 0, phase: 0 };
    for color in [Color::White, Color::Black] {
        let side = board.colors(color);
        for piece in Piece::ALL {
            for sq in board.pieces(piece) & side {
                st.add(color, piece, sq);
            }
        }
    }
    st
}

/// The state after playing `mv` (legal, not yet played) on `board`.
/// Handles captures, en passant, promotions and cozy-chess's
/// king-takes-rook castling encoding.
pub fn state_after(board: &Board, st: EvalState, mv: Move) -> EvalState {
    let us = board.side_to_move();
    let them = !us;
    let piece = board.piece_on(mv.from).expect("move from an empty square");
    let mut st = st;

    // Castling: the king "captures" its own rook.
    if board.colors(us).has(mv.to) {
        let rank = mv.from.rank();
        let (king_to, rook_to) = if mv.to.file() > mv.from.file() {
            (Square::new(File::G, rank), Square::new(File::F, rank))
        } else {
            (Square::new(File::C, rank), Square::new(File::D, rank))
        };
        st.remove(us, Piece::King, mv.from);
        st.remove(us, Piece::Rook, mv.to);
        st.add(us, Piece::King, king_to);
        st.add(us, Piece::Rook, rook_to);
        return st;
    }

    if let Some(victim) = board.piece_on(mv.to) {
        st.remove(them, victim, mv.to);
    } else if piece == Piece::Pawn && mv.from.file() != mv.to.file() {
        // En passant: the captured pawn sits beside the moving pawn.
        st.remove(them, Piece::Pawn, Square::new(mv.to.file(), mv.from.rank()));
    }
    st.remove(us, piece, mv.from);
    st.add(us, mv.promotion.unwrap_or(piece), mv.to);
    st
}

/// Tapered score from the side to move's point of view.
#[inline]
pub fn score(side_to_move: Color, st: &EvalState) -> i32 {
    let p = st.phase.min(PHASE_MAX);
    let s = (st.mg * p + st.eg * (PHASE_MAX - p)) / PHASE_MAX;
    if side_to_move == Color::White {
        s
    } else {
        -s
    }
}

/// Convenience: evaluate a board from scratch.
pub fn evaluate(board: &Board) -> i32 {
    score(board.side_to_move(), &full_state(board))
}

#[allow(dead_code)]
fn _unused(_: Rank) {}

#[cfg(test)]
mod tests {
    use super::*;

    fn walk(board: &Board, st: EvalState, depth: u32, checked: &mut u64) {
        assert_eq!(st, full_state(board), "state mismatch at {board}");
        *checked += 1;
        if depth == 0 {
            return;
        }
        board.generate_moves(|moves| {
            for mv in moves {
                let next = state_after(board, st, mv);
                let mut child = board.clone();
                child.play_unchecked(mv);
                walk(&child, next, depth - 1, checked);
            }
            false
        });
    }

    #[test]
    fn incremental_matches_full() {
        let fens = [
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1",
            "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1",
            "r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1",
            "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8",
            "r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10",
            "rnbqkb1r/ppp1pppp/5n2/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3",
            "r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1",
        ];
        let mut checked = 0;
        for fen in fens {
            let board = Board::from_fen(fen, false).unwrap();
            walk(&board, full_state(&board), 3, &mut checked);
        }
        assert!(checked > 10_000, "only {checked} positions checked");
    }
}
