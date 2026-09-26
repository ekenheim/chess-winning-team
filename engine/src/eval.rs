//! Static evaluation: material + piece-square tables (Michniewski's
//! "Simplified Evaluation Function" tables), tapered between a middlegame
//! and an endgame score by the non-pawn material left on the board. From the
//! side to move's point of view, in centipawns.

use cozy_chess::{get_bishop_moves, get_king_moves, get_knight_moves, get_rook_moves, Board, Color, Piece, Square};

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
     30, 30, 10,  0,  0, 10, 30, 30,
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

/// Total phase weight of all non-pawn material at the start of the game:
/// 4 minors x1 + 4 rooks x2 + 2 queens x4 per both sides.
pub const PHASE_MAX: i32 = 24;

/// Game phase from remaining non-pawn material: PHASE_MAX at the start,
/// 0 with only pawns and kings. Middlegame and endgame scores are blended by
/// this weight, so the king only creeps out as material actually comes off
/// (rather than the moment the queens are traded).
pub fn phase(board: &Board) -> i32 {
    let minors = (board.pieces(Piece::Knight) | board.pieces(Piece::Bishop)).len() as i32;
    let rooks = board.pieces(Piece::Rook).len() as i32;
    let queens = board.pieces(Piece::Queen).len() as i32;
    (minors + 2 * rooks + 4 * queens).min(PHASE_MAX)
}

/// King danger (middlegame only, and only while the opponent still has a
/// queen). Attack units per attacked king-zone square (N2 B2 R3 Q5 each),
/// storm pawns up to four ranks ahead (2/2/1/1), and open or half-open files
/// through the king's three files (2 / 1, doubled with an enemy rook or
/// queen on that file) are summed and squared, so one attacker already
/// counts and a full-scale attack counts a lot. Missing shield pawns cost
/// extra, but only for a king on its first two ranks.
const SHIELD_MISSING: i32 = 15;
const DANGER_MAX: i32 = 700;

fn king_danger(board: &Board, color: Color) -> i32 {
    let them = !color;
    let enemy = board.colors(them);
    if (board.pieces(Piece::Queen) & enemy).is_empty() {
        return 0;
    }
    let ksq = board.king(color);
    let dir: i8 = if color == Color::White { 1 } else { -1 };
    let pawns = board.pieces(Piece::Pawn);
    let our_pawns = pawns & board.colors(color);
    let their_pawns = pawns & enemy;
    let heavy = (board.pieces(Piece::Rook) | board.pieces(Piece::Queen)) & enemy;
    let king_home = (ksq.rank().relative_to(color) as usize) < 2;

    let mut units = 0;
    let mut shield_missing = 0;
    for df in -1..=1 {
        let Some(fsq) = ksq.try_offset(df, 0) else { continue };
        let file = fsq.file().bitboard();
        // Shield and storm: the three ranks in front of the king on this file.
        let mut shield = false;
        for dr in 1..=4 {
            if let Some(sq) = ksq.try_offset(df, dr * dir) {
                if dr <= 2 && our_pawns.has(sq) {
                    shield = true;
                }
                if their_pawns.has(sq) {
                    units += if dr <= 2 { 2 } else { 1 };
                }
            }
        }
        if king_home && !shield {
            shield_missing += 1;
        }
        // Open / half-open file through the king.
        let file_units = if (file & pawns).is_empty() {
            2
        } else if (file & our_pawns).is_empty() {
            1
        } else {
            0
        };
        units += if !(file & heavy).is_empty() { 2 * file_units } else { file_units };
    }

    let zone = get_king_moves(ksq) | ksq.bitboard();
    let occ = board.occupied();
    for sq in board.pieces(Piece::Knight) & enemy {
        units += 2 * (get_knight_moves(sq) & zone).len() as i32;
    }
    for sq in board.pieces(Piece::Bishop) & enemy {
        units += 2 * (get_bishop_moves(sq, occ) & zone).len() as i32;
    }
    for sq in board.pieces(Piece::Rook) & enemy {
        units += 3 * (get_rook_moves(sq, occ) & zone).len() as i32;
    }
    for sq in board.pieces(Piece::Queen) & enemy {
        units += 5 * ((get_rook_moves(sq, occ) | get_bishop_moves(sq, occ)) & zone).len() as i32;
    }
    (3 * units * units).min(DANGER_MAX) + shield_missing * SHIELD_MISSING
}

/// Score from the side to move's point of view (tapered evaluation).
pub fn evaluate(board: &Board) -> i32 {
    let mut mg = 0;
    let mut eg = 0;
    for color in [Color::White, Color::Black] {
        let sign = if color == Color::White { 1 } else { -1 };
        let side = board.colors(color);
        for piece in Piece::ALL {
            let (mg_pst, eg_pst) = tables(piece);
            let value = piece_value(piece);
            for sq in board.pieces(piece) & side {
                let i = pst_index(color, sq);
                mg += sign * (value + mg_pst[i]);
                eg += sign * (value + eg_pst[i]);
            }
        }
        mg -= sign * king_danger(board, color);
    }
    let p = phase(board);
    let score = (mg * p + eg * (PHASE_MAX - p)) / PHASE_MAX;
    if board.side_to_move() == Color::White {
        score
    } else {
        -score
    }
}
