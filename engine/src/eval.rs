//! Static evaluation: material + piece-square tables
//! (Tomasz Michniewski's "Simplified Evaluation Function"), a king table
//! tapered by the opponent's material, and king safety (pawn shelter, open
//! files, a king left in the centre, enemy pieces attacking the king zone),
//! from the side to move's point of view, in centipawns.

use cozy_chess::{
    get_bishop_moves, get_king_moves, get_knight_moves, get_rook_moves, BitBoard, Board, Color, Piece, Square,
};

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

/// How much attacking material `color` has: minor 1, rook 2, queen 4, capped
/// at MAX_ATTACK_PHASE (a full set). The *opponent's* value decides how much
/// our king must still hide (middlegame table, king safety) versus centralise.
const MAX_ATTACK_PHASE: i32 = 12;

fn attack_phase(board: &Board, color: Color) -> i32 {
    let side = board.colors(color);
    let minors = ((board.pieces(Piece::Knight) | board.pieces(Piece::Bishop)) & side).len() as i32;
    let rooks = (board.pieces(Piece::Rook) & side).len() as i32;
    let queens = (board.pieces(Piece::Queen) & side).len() as i32;
    (minors + 2 * rooks + 4 * queens).min(MAX_ATTACK_PHASE)
}

const FILE_A: u64 = 0x0101_0101_0101_0101;
const SHELTER_ADVANCED: i32 = 10; // shield pawn two ranks in front instead of one
const SHELTER_MISSING: i32 = 25; // no shield pawn within two ranks in front
const OPEN_FILE_NEAR_KING: i32 = 15; // no own pawn at all on a file next to the king
const KING_IN_CENTRE: i32 = 15; // king on the d or e file
const KING_CANNOT_CASTLE: i32 = 25; // ... with no castling rights left
/// Attack units per enemy piece that hits the king zone.
const UNITS_MINOR: i32 = 2;
const UNITS_ROOK: i32 = 3;
const UNITS_QUEEN: i32 = 5;
/// Zone penalty = units^2 * ATTACK_SCALE, capped, once two or more pieces attack.
const ATTACK_SCALE: i32 = 2;
const ATTACK_CAP: i32 = 500;

/// Middlegame king danger for `color` as a positive penalty: pawn shelter,
/// open files, a king left in the centre, and (while the enemy queen is on)
/// enemy pieces bearing on the squares around the king.
fn king_danger(board: &Board, color: Color) -> i32 {
    let king = board.king(color);
    let kf = king.file() as i32;
    let kr = king.rank() as i32;
    let own_pawns = (board.pieces(Piece::Pawn) & board.colors(color)).0;
    let forward: i32 = if color == Color::White { 1 } else { -1 };
    let mut danger = 0;

    // Per file next to the king: nothing with a pawn one step ahead,
    // SHELTER_ADVANCED with one two steps ahead, SHELTER_MISSING otherwise,
    // and OPEN_FILE_NEAR_KING more if the file has no pawn of ours at all.
    let bit = |f: i32, r: i32| if (0..8).contains(&r) { 1u64 << (8 * r + f) } else { 0 };
    for f in (kf - 1).max(0)..=(kf + 1).min(7) {
        if own_pawns & bit(f, kr + forward) != 0 {
        } else if own_pawns & bit(f, kr + 2 * forward) != 0 {
            danger += SHELTER_ADVANCED;
        } else {
            danger += SHELTER_MISSING;
        }
        if own_pawns & (FILE_A << f) == 0 {
            danger += OPEN_FILE_NEAR_KING;
        }
    }
    if kf == 3 || kf == 4 {
        danger += KING_IN_CENTRE;
        let rights = board.castle_rights(color);
        if rights.short.is_none() && rights.long.is_none() {
            danger += KING_CANNOT_CASTLE;
        }
    }

    let enemy = board.colors(!color);
    if !(board.pieces(Piece::Queen) & enemy).is_empty() {
        let around = get_king_moves(king) | king.bitboard();
        let ahead = if color == Color::White { around.0 << 8 } else { around.0 >> 8 };
        let zone = around | BitBoard(ahead);
        let occupied = board.occupied();
        let (mut attackers, mut units) = (0, 0);
        for sq in (board.pieces(Piece::Knight) | board.pieces(Piece::Bishop)) & enemy {
            let hits = if board.pieces(Piece::Knight).has(sq) {
                get_knight_moves(sq)
            } else {
                get_bishop_moves(sq, occupied)
            };
            if !(hits & zone).is_empty() {
                attackers += 1;
                units += UNITS_MINOR;
            }
        }
        for sq in board.pieces(Piece::Rook) & enemy {
            if !(get_rook_moves(sq, occupied) & zone).is_empty() {
                attackers += 1;
                units += UNITS_ROOK;
            }
        }
        for sq in board.pieces(Piece::Queen) & enemy {
            if !((get_rook_moves(sq, occupied) | get_bishop_moves(sq, occupied)) & zone).is_empty() {
                attackers += 1;
                units += UNITS_QUEEN;
            }
        }
        if attackers >= 2 {
            danger += (units * units * ATTACK_SCALE).min(ATTACK_CAP);
        }
    }
    danger
}

/// Score from the side to move's point of view.
pub fn evaluate(board: &Board) -> i32 {
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
        // The king table above is the middlegame one; the less attacking
        // material the opponent has, the more it moves to the endgame table
        // and the less king safety matters.
        let threat = attack_phase(board, !color);
        let ksq = pst_index(color, board.king(color));
        let king_eg = KING_EG_PST[ksq] - KING_MG_PST[ksq];
        score += sign * (king_eg * (MAX_ATTACK_PHASE - threat) / MAX_ATTACK_PHASE);
        if threat > 0 {
            score -= sign * (king_danger(board, color) * threat / MAX_ATTACK_PHASE);
        }
    }
    if board.side_to_move() == Color::White {
        score
    } else {
        -score
    }
}
