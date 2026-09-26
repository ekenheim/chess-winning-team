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

/// King safety (middlegame only, and only while the opponent still has a
/// queen): a penalty per missing pawn in the shield in front of the king,
/// and a convex penalty for enemy pieces attacking the king zone once at
/// least two of them do. Every review of our games found the losses here.
const SHIELD_MISSING: i32 = 18;
const DANGER: [i32; 16] = [0, 0, 10, 22, 38, 58, 82, 110, 142, 178, 218, 262, 310, 360, 410, 460];

fn king_danger(board: &Board, color: Color) -> i32 {
    let them = !color;
    let enemy = board.colors(them);
    if (board.pieces(Piece::Queen) & enemy).is_empty() {
        return 0;
    }
    let ksq = board.king(color);
    let dir: i8 = if color == Color::White { 1 } else { -1 };

    let our_pawns = board.pieces(Piece::Pawn) & board.colors(color);
    let mut missing = 0;
    for df in -1..=1 {
        let mut found = false;
        for dr in 1..=2 {
            if let Some(sq) = ksq.try_offset(df, dr * dir) {
                if our_pawns.has(sq) {
                    found = true;
                }
            }
        }
        if !found {
            missing += 1;
        }
    }

    let zone = get_king_moves(ksq) | ksq.bitboard();
    let occ = board.occupied();
    let mut weight = 0;
    let mut attackers = 0;
    for sq in board.pieces(Piece::Knight) & enemy {
        if !(get_knight_moves(sq) & zone).is_empty() {
            weight += 2;
            attackers += 1;
        }
    }
    for sq in board.pieces(Piece::Bishop) & enemy {
        if !(get_bishop_moves(sq, occ) & zone).is_empty() {
            weight += 2;
            attackers += 1;
        }
    }
    for sq in board.pieces(Piece::Rook) & enemy {
        if !(get_rook_moves(sq, occ) & zone).is_empty() {
            weight += 3;
            attackers += 1;
        }
    }
    for sq in board.pieces(Piece::Queen) & enemy {
        if !((get_rook_moves(sq, occ) | get_bishop_moves(sq, occ)) & zone).is_empty() {
            weight += 5;
            attackers += 1;
        }
    }
    let danger = if attackers >= 2 { DANGER[(weight as usize).min(15)] } else { 0 };
    missing * SHIELD_MISSING + danger
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
