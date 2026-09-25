//! Static evaluation: material + piece-square tables
//! (Tomasz Michniewski's "Simplified Evaluation Function"), a king table
//! tapered between middlegame and endgame by material, and king safety
//! (pawn shelter, open files, a king stuck in the centre), from the side to
//! move's point of view, in centipawns.

use cozy_chess::{Board, Color, Piece, Square};

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

fn table(piece: Piece) -> &'static [i32; 64] {
    match piece {
        Piece::Pawn => &PAWN_PST,
        Piece::Knight => &KNIGHT_PST,
        Piece::Bishop => &BISHOP_PST,
        Piece::Rook => &ROOK_PST,
        Piece::Queen => &QUEEN_PST,
        Piece::King => &KING_MG_PST,
    }
}

/// Game phase from the pieces left: 24 with all pieces on (middlegame),
/// 0 with only kings and pawns (endgame).
pub const MAX_PHASE: i32 = 24;

fn phase(board: &Board) -> i32 {
    let minors = (board.pieces(Piece::Knight) | board.pieces(Piece::Bishop)).len() as i32;
    let rooks = board.pieces(Piece::Rook).len() as i32;
    let queens = board.pieces(Piece::Queen).len() as i32;
    (minors + 2 * rooks + 4 * queens).min(MAX_PHASE)
}

const SHELTER_ADVANCED: i32 = 10; // shield pawn two ranks in front instead of one
const SHELTER_MISSING: i32 = 25; // no shield pawn within two ranks in front
const OPEN_FILE_NEAR_KING: i32 = 15; // no own pawn at all on a file next to the king
const KING_IN_CENTRE: i32 = 15; // king on files c-f
const KING_CANNOT_CASTLE: i32 = 25; // ... and no castling rights left

/// Middlegame king danger for `color`, as a positive penalty.
fn king_danger(board: &Board, color: Color) -> i32 {
    let king = board.king(color);
    let kf = king.file() as i32;
    let kr = king.rank() as i32;
    let own_pawns = board.pieces(Piece::Pawn) & board.colors(color);
    let forward = if color == Color::White { 1 } else { -1 };
    let mut danger = 0;
    for f in (kf - 1).max(0)..=(kf + 1).min(7) {
        let file_pawns = own_pawns.0 & (0x0101_0101_0101_0101u64 << f);
        if file_pawns == 0 {
            danger += OPEN_FILE_NEAR_KING;
        }
        let on = |rank: i32| (0..8).contains(&rank) && file_pawns & (1u64 << (rank * 8 + f)) != 0;
        if on(kr + forward) {
        } else if on(kr + 2 * forward) {
            danger += SHELTER_ADVANCED;
        } else {
            danger += SHELTER_MISSING;
        }
    }
    if (2..=5).contains(&kf) {
        danger += KING_IN_CENTRE;
        let rights = board.castle_rights(color);
        if rights.short.is_none() && rights.long.is_none() {
            danger += KING_CANNOT_CASTLE;
        }
    }
    danger
}

/// Score from the side to move's point of view.
pub fn evaluate(board: &Board) -> i32 {
    let phase = phase(board);
    let mut score = 0;
    for color in [Color::White, Color::Black] {
        let sign = if color == Color::White { 1 } else { -1 };
        let side = board.colors(color);
        for piece in Piece::ALL {
            let pst = table(piece);
            let value = piece_value(piece);
            for sq in board.pieces(piece) & side {
                score += sign * (value + pst[pst_index(color, sq)]);
            }
        }
        // The king table above is the middlegame one; taper towards the
        // endgame table and fade king safety out as material comes off.
        let ksq = pst_index(color, board.king(color));
        let king_eg = KING_EG_PST[ksq] - KING_MG_PST[ksq];
        score += sign * (king_eg * (MAX_PHASE - phase) / MAX_PHASE);
        score -= sign * (king_danger(board, color) * phase / MAX_PHASE);
    }
    if board.side_to_move() == Color::White {
        score
    } else {
        -score
    }
}
