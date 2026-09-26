//! Static evaluation: material + piece-square tables (Michniewski's
//! "Simplified Evaluation Function" tables), tapered between a middlegame
//! and an endgame score by the non-pawn material left on the board. From the
//! side to move's point of view, in centipawns.

use cozy_chess::{
    get_bishop_moves, get_bishop_rays, get_king_moves, get_knight_moves, get_rook_moves, get_rook_rays, BitBoard, Board,
    Color, File, Move, Piece, Rank, Square,
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
    let queens = board.pieces(Piece::Queen);
    if (queens & enemy).is_empty() {
        return 0;
    }
    let ksq = board.king(color);

    let our_pawns = board.pieces(Piece::Pawn) & board.colors(color);
    let mut missing = 0;
    for mask in &SHIELD[color as usize][ksq as usize] {
        if (*mask & our_pawns).is_empty() {
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
    // Sliders: the occupancy lookup is skipped when even the empty-board
    // rays miss the zone (then the real attacks miss it too).
    let diag_zone = |sq: Square| !(get_bishop_rays(sq) & zone).is_empty() && !(get_bishop_moves(sq, occ) & zone).is_empty();
    let orth_zone = |sq: Square| !(get_rook_rays(sq) & zone).is_empty() && !(get_rook_moves(sq, occ) & zone).is_empty();
    for sq in board.pieces(Piece::Bishop) & enemy {
        if diag_zone(sq) {
            weight += 2;
            attackers += 1;
        }
    }
    for sq in board.pieces(Piece::Rook) & enemy {
        if orth_zone(sq) {
            weight += 3;
            attackers += 1;
        }
    }
    for sq in queens & enemy {
        if orth_zone(sq) || diag_zone(sq) {
            weight += 5;
            attackers += 1;
        }
    }
    let danger = if attackers >= 2 { DANGER[(weight as usize).min(15)] } else { 0 };
    missing * SHIELD_MISSING + danger
}

/// Pawn-shield masks [color][king square][file offset -1..=1]: the one or two
/// squares one and two ranks in front of the king on that file (empty off the
/// board, which then counts as a missing shield pawn).
static SHIELD: [[[BitBoard; 3]; 64]; 2] = build_shield();

const fn build_shield() -> [[[BitBoard; 3]; 64]; 2] {
    let mut t = [[[BitBoard::EMPTY; 3]; 64]; 2];
    let mut c = 0;
    while c < 2 {
        let dir: i32 = if c == 0 { 1 } else { -1 };
        let mut sq = 0;
        while sq < 64 {
            let (f, r) = ((sq % 8) as i32, (sq / 8) as i32);
            let mut k = 0;
            while k < 3 {
                let file = f + k as i32 - 1;
                let mut bits = 0u64;
                let mut dr = 1;
                while dr <= 2 {
                    let rank = r + dr * dir;
                    if file >= 0 && file < 8 && rank >= 0 && rank < 8 {
                        bits |= 1u64 << (rank * 8 + file);
                    }
                    dr += 1;
                }
                t[c][sq][k] = BitBoard(bits);
                k += 1;
            }
            sq += 1;
        }
        c += 1;
    }
    t
}

/// Material + piece-square sums (middlegame, endgame) of one piece, from
/// White's point of view.
#[inline(always)]
fn psq_of(piece: Piece, color: Color, sq: Square) -> (i32, i32) {
    let (mg_pst, eg_pst) = tables(piece);
    let value = piece_value(piece);
    let i = pst_index(color, sq);
    let (mg, eg) = (value + mg_pst[i], value + eg_pst[i]);
    if color == Color::White {
        (mg, eg)
    } else {
        (-mg, -eg)
    }
}

/// Material + piece-square (middlegame, endgame) sums from White's point of
/// view, computed from scratch. The search keeps them incrementally with
/// `psq_delta`.
pub fn psq(board: &Board) -> (i32, i32) {
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
    }
    (mg, eg)
}

/// Change of `psq` when the legal move `mv` is played on `board`.
#[inline]
pub fn psq_delta(board: &Board, mv: Move) -> (i32, i32) {
    let us = board.side_to_move();
    let piece = board.piece_on(mv.from).unwrap_or(Piece::Pawn);
    let (mut mg, mut eg) = (0, 0);
    let mut add = |p: Piece, c: Color, sq: Square, sign: i32| {
        let (m, e) = psq_of(p, c, sq);
        mg += sign * m;
        eg += sign * e;
    };
    if piece == Piece::King && board.colors(us).has(mv.to) {
        // Castling is encoded as king-takes-own-rook.
        let back = Rank::First.relative_to(us);
        let (king_file, rook_file) = if mv.to.file() > mv.from.file() { (File::G, File::F) } else { (File::C, File::D) };
        add(Piece::King, us, mv.from, -1);
        add(Piece::Rook, us, mv.to, -1);
        add(Piece::King, us, Square::new(king_file, back), 1);
        add(Piece::Rook, us, Square::new(rook_file, back), 1);
        return (mg, eg);
    }
    add(piece, us, mv.from, -1);
    add(mv.promotion.unwrap_or(piece), us, mv.to, 1);
    if board.colors(!us).has(mv.to) {
        if let Some(victim) = board.piece_on(mv.to) {
            add(victim, !us, mv.to, -1);
        }
    } else if piece == Piece::Pawn && mv.from.file() != mv.to.file() {
        // En passant: the captured pawn stands beside the destination.
        add(Piece::Pawn, !us, Square::new(mv.to.file(), mv.from.rank()), -1);
    }
    (mg, eg)
}

/// Passed-pawn bonus by relative rank (index 0 = own back rank). Kept small:
/// the endgame pawn table already rewards advancement for every pawn.
const PASSED_MG: [i32; 8] = [0, 0, 5, 10, 15, 25, 40, 0];
const PASSED_EG: [i32; 8] = [0, 5, 10, 20, 35, 55, 80, 0];

#[inline]
fn north_fill(mut b: u64) -> u64 {
    b |= b << 8;
    b |= b << 16;
    b |= b << 32;
    b
}

#[inline]
fn south_fill(mut b: u64) -> u64 {
    b |= b >> 8;
    b |= b >> 16;
    b |= b >> 32;
    b
}

/// Squares on the same and neighbouring files as `span`.
#[inline]
fn widen(span: u64) -> u64 {
    span | ((span & !FILE_H) << 1) | ((span & !FILE_A) >> 1)
}

/// Light squares (b1, a2, ...). a1 is dark.
const LIGHT_SQUARES: u64 = 0x55AA_55AA_55AA_55AA;
const FILE_A: u64 = 0x0101_0101_0101_0101;
const FILE_H: u64 = FILE_A << 7;

/// Scale factors are out of 64 (64 = no change).
const SCALE_NORMAL: i32 = 64;

#[inline]
fn chebyshev(a: Square, b: Square) -> i32 {
    let df = (a.file() as i32 - b.file() as i32).abs();
    let dr = (a.rank() as i32 - b.rank() as i32).abs();
    df.max(dr)
}

/// Material summary of one side.
struct Side {
    pawns: u64,
    knights: u32,
    bishops: u32,
    rooks: u32,
    queens: u32,
    /// Non-pawn material in centipawns.
    npm: i32,
}

fn side_material(board: &Board, color: Color) -> Side {
    let c = board.colors(color);
    let knights = (board.pieces(Piece::Knight) & c).len();
    let bishops = (board.pieces(Piece::Bishop) & c).len();
    let rooks = (board.pieces(Piece::Rook) & c).len();
    let queens = (board.pieces(Piece::Queen) & c).len();
    Side {
        pawns: (board.pieces(Piece::Pawn) & c).0,
        knights,
        bishops,
        rooks,
        queens,
        npm: knights as i32 * KNIGHT + bishops as i32 * BISHOP + rooks as i32 * ROOK + queens as i32 * QUEEN,
    }
}

/// Endgame knowledge: how much of the (positive) score the stronger side
/// can realistically convert, out of 64. Pure chess rules of thumb:
/// no pawns and less than a rook up rarely wins, a lone minor never wins,
/// the wrong rook-pawn bishop draws with the king in the corner, opposite
/// bishops and one-extra-pawn rook endings are drawish.
fn scale_factor(board: &Board, strong: Color) -> i32 {
    let weak = !strong;
    let s = side_material(board, strong);
    let w = side_material(board, weak);
    let s_pawns = s.pawns.count_ones() as i32;
    let w_pawns = w.pawns.count_ones() as i32;

    // The side without pawns needs a real material edge to win.
    if s_pawns == 0 {
        // A lone minor (or nothing) cannot mate.
        if s.npm <= BISHOP {
            return 0;
        }
        // Two knights cannot force mate against a bare king.
        if s.npm == 2 * KNIGHT && s.knights == 2 && w.npm == 0 {
            return if w_pawns == 0 { 0 } else { 16 };
        }
        let diff = s.npm - w.npm;
        if diff <= BISHOP {
            // Minor-piece edge or less (R v B, R+B v R, Q v R+B ...).
            return 6;
        }
        if diff < ROOK && !(s.queens > 0 && w.queens == 0) {
            // Q v R is a known win; other sub-rook edges are hard work.
            return 32;
        }
        return SCALE_NORMAL;
    }

    // Bishop + rook pawn(s) on one file where the bishop does not control
    // the queening square, weak king already on/next to it: a dead draw.
    if s.npm == BISHOP && s.bishops == 1 {
        let on_a = s.pawns & !FILE_A == 0;
        let on_h = s.pawns & !FILE_H == 0;
        if on_a || on_h {
            let promo_idx: u64 = match (strong, on_a) {
                (Color::White, true) => 56,
                (Color::White, false) => 63,
                (Color::Black, true) => 0,
                (Color::Black, false) => 7,
            };
            let bishop_light = (board.pieces(Piece::Bishop) & board.colors(strong)).0 & LIGHT_SQUARES != 0;
            let promo_light = (1u64 << promo_idx) & LIGHT_SQUARES != 0;
            if bishop_light != promo_light {
                let promo = Square::index(promo_idx as usize);
                if chebyshev(board.king(weak), promo) <= 1 {
                    return 0;
                }
            }
        }
    }

    // Opposite-coloured bishops.
    if s.bishops == 1 && w.bishops == 1 {
        let sb = (board.pieces(Piece::Bishop) & board.colors(strong)).0 & LIGHT_SQUARES != 0;
        let wb = (board.pieces(Piece::Bishop) & board.colors(weak)).0 & LIGHT_SQUARES != 0;
        if sb != wb {
            if s.npm == BISHOP && w.npm == BISHOP {
                let diff = (s_pawns - w_pawns).max(0);
                return (12 + 8 * (diff - 1).max(0)).min(40);
            }
            return 48;
        }
    }

    // Rook endings (one rook each, nothing else).
    if s.npm == ROOK && w.npm == ROOK && s.rooks == 1 && w.rooks == 1 {
        let on_a = s.pawns & !FILE_A == 0;
        let on_h = s.pawns & !FILE_H == 0;
        // All pawns on a single file (e.g. doubled): effectively one pawn.
        let one_file = [0u32, 1, 2, 3, 4, 5, 6, 7].iter().any(|&f| s.pawns & !(FILE_A << f) == 0);
        if w_pawns == 0 && (on_a || on_h) {
            return 8;
        }
        if w_pawns == 0 && one_file {
            return 32;
        }
        if s_pawns - w_pawns <= 1 {
            return 40;
        }
    }

    SCALE_NORMAL
}

/// Score from the side to move's point of view (tapered evaluation).
pub fn evaluate(board: &Board) -> i32 {
    let (mg, eg) = psq(board);
    evaluate_with(board, mg, eg)
}

/// `evaluate` given the material + piece-square sums (`psq`) of `board`.
#[inline]
pub fn evaluate_with(board: &Board, mut mg: i32, mut eg: i32) -> i32 {
    mg -= king_danger(board, Color::White);
    mg += king_danger(board, Color::Black);

    // Passed pawns: no enemy pawn ahead on the same or a neighbouring file.
    let wp = (board.pieces(Piece::Pawn) & board.colors(Color::White)).0;
    let bp = (board.pieces(Piece::Pawn) & board.colors(Color::Black)).0;
    let mut w_passed = wp & !widen(south_fill(bp >> 8));
    while w_passed != 0 {
        let r = (w_passed.trailing_zeros() / 8) as usize;
        mg += PASSED_MG[r];
        eg += PASSED_EG[r];
        w_passed &= w_passed - 1;
    }
    let mut b_passed = bp & !widen(north_fill(wp << 8));
    while b_passed != 0 {
        let r = 7 - (b_passed.trailing_zeros() / 8) as usize;
        mg -= PASSED_MG[r];
        eg -= PASSED_EG[r];
        b_passed &= b_passed - 1;
    }

    let p = phase(board);
    let mut score = (mg * p + eg * (PHASE_MAX - p)) / PHASE_MAX;

    // Endgame scaling only once few pieces remain (cheap gate).
    if p <= 6 && score != 0 {
        let strong = if score > 0 { Color::White } else { Color::Black };
        let sf = scale_factor(board, strong);
        if sf != SCALE_NORMAL {
            score = score * sf / SCALE_NORMAL;
        }
    }

    // Approaching the fifty-move rule: nothing is being made of the edge.
    let hm = board.halfmove_clock() as i32;
    if hm > 60 {
        score = score * (100 - hm).max(0) / 40;
    }
    if board.side_to_move() == Color::White {
        score
    } else {
        -score
    }
}
