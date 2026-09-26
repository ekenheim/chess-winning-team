//! Search: iterative deepening, principal-variation search with a
//! transposition table (kept across moves), null-move pruning, late-move
//! reductions, check extensions, move ordering by hash move, MVV-LVA
//! captures, killer moves and a history heuristic, quiescence search (all
//! evasions when in check), repetition and 50-move detection, and a simple
//! time manager.

use cozy_chess::{Board, Move, Piece, Rank, Square};
use std::time::{Duration, Instant};

use crate::eval;

pub const MATE: i32 = 30_000;
pub const MAX_PLY: usize = 128;
const INF: i32 = 100_000;
/// Check the clock every this many nodes.
const NODE_CHECK_MASK: u64 = 1023;
/// Pushed on the repetition stack before a null move's position.
const NULL_BARRIER: u64 = 0;
/// Null move: reduce by NULL_BASE_REDUCTION + depth / NULL_DEPTH_DIVISOR,
/// only at depth >= NULL_MIN_DEPTH.
const NULL_MIN_DEPTH: i32 = 3;
const NULL_BASE_REDUCTION: i32 = 2;
const NULL_DEPTH_DIVISOR: i32 = 4;
/// LMR: quiet moves from the LMR_FIRST_MOVE-th on (0-based) lose one ply at
/// depth >= LMR_MIN_DEPTH, two from LMR_DEEP_MOVE on at depth >= LMR_DEEP_DEPTH.
const LMR_MIN_DEPTH: i32 = 3;
const LMR_FIRST_MOVE: usize = 3;
const LMR_DEEP_MOVE: usize = 8;
const LMR_DEEP_DEPTH: i32 = 6;

/// Does `color` have anything besides king and pawns?
fn has_pieces(board: &Board, color: cozy_chess::Color) -> bool {
    let pawns_and_king = board.pieces(Piece::Pawn) | board.pieces(Piece::King);
    !(board.colors(color) & !pawns_and_king).is_empty()
}

/// History scores stay below the killer keys.
const HISTORY_MAX: i32 = 7_000;
static EMPTY_HISTORY: [[i32; 64]; 64] = [[0; 64]; 64];
/// Transposition table entries (power of two); 2^21 x 24 bytes = 48 MB.
const TT_ENTRIES: usize = 1 << 21;

#[derive(Clone, Copy, PartialEq, Eq)]
enum Bound {
    Exact,
    Lower,
    Upper,
}

#[derive(Clone, Copy)]
struct TtEntry {
    key: u64,
    mv: Option<Move>,
    score: i32,
    depth: i8,
    bound: Bound,
}

const EMPTY_ENTRY: TtEntry = TtEntry { key: 0, mv: None, score: 0, depth: -1, bound: Bound::Upper };

/// Mate scores are stored relative to the node, not the root.
fn score_to_tt(score: i32, ply: usize) -> i32 {
    if score >= MATE - MAX_PLY as i32 {
        score + ply as i32
    } else if score <= -MATE + MAX_PLY as i32 {
        score - ply as i32
    } else {
        score
    }
}

fn score_from_tt(score: i32, ply: usize) -> i32 {
    if score >= MATE - MAX_PLY as i32 {
        score - ply as i32
    } else if score <= -MATE + MAX_PLY as i32 {
        score + ply as i32
    } else {
        score
    }
}

#[derive(Default, Clone, Debug)]
pub struct SearchLimits {
    pub move_time: Option<Duration>,
    pub depth: Option<u8>,
    pub nodes: Option<u64>,
    pub infinite: bool,
}

#[allow(dead_code)]
pub struct SearchResult {
    pub best_move: Option<Move>,
    pub score: i32,
    pub depth: u8,
    pub nodes: u64,
}

pub struct Searcher {
    nodes: u64,
    start: Instant,
    /// Abort the search (mid-iteration) once this much time has passed.
    hard_limit: Option<Duration>,
    /// Do not start a new iteration after this much time has passed.
    soft_limit: Option<Duration>,
    node_limit: Option<u64>,
    stopped: bool,
    /// Hashes of the game history followed by the current search path.
    stack: Vec<u64>,
    root_move: Option<Move>,
    tt: Vec<TtEntry>,
    /// Two quiet moves per ply that recently caused a beta cutoff.
    killers: [[Option<Move>; 2]; MAX_PLY],
    /// Butterfly history [side][from][to]: how often a quiet move cut off, weighted by depth.
    history: Box<[[[i32; 64]; 64]; 2]>,
}

impl Searcher {
    pub fn new() -> Self {
        Searcher {
            nodes: 0,
            start: Instant::now(),
            hard_limit: None,
            soft_limit: None,
            node_limit: None,
            stopped: false,
            stack: Vec::with_capacity(512),
            root_move: None,
            tt: vec![EMPTY_ENTRY; TT_ENTRIES],
            killers: [[None; 2]; MAX_PLY],
            history: Box::new([[[0; 64]; 64]; 2]),
        }
    }

    pub fn clear(&mut self) {
        self.tt.fill(EMPTY_ENTRY);
        self.history = Box::new([[[0; 64]; 64]; 2]);
    }

    #[inline]
    fn tt_index(hash: u64) -> usize {
        hash as usize & (TT_ENTRIES - 1)
    }

    pub fn search(&mut self, board: &Board, history: &[u64], limits: &SearchLimits, report: bool) -> SearchResult {
        self.start = Instant::now();
        self.nodes = 0;
        self.stopped = false;
        self.node_limit = limits.nodes;
        // Time manager: reserve a slice for pipe latency and the granularity
        // of the node-count clock check. A new iteration starts while less
        // than 60% of the budget is gone; an iteration cut off by the hard
        // limit still contributes its best root move so far (see negamax),
        // so time spent past the soft limit is not wasted.
        if let Some(t) = limits.move_time {
            // 5% of the budget, between 15 ms and 50 ms (measured pipe overhead is ~5 ms).
            let reserve = (t / 20).clamp(Duration::from_millis(15), Duration::from_millis(50));
            self.hard_limit = Some(t.saturating_sub(reserve));
            self.soft_limit = Some(t.mul_f64(0.6));
        } else {
            self.hard_limit = None;
            self.soft_limit = None;
        }
        self.stack.clear();
        self.stack.extend_from_slice(history);
        // Killers are position-specific; history carries over, aged.
        self.killers = [[None; 2]; MAX_PLY];
        for h in self.history.iter_mut().flatten().flatten() {
            *h /= 2;
        }
        let max_depth = limits.depth.unwrap_or(MAX_PLY as u8 - 1).min(MAX_PLY as u8 - 1);

        let mut best_move: Option<Move> = first_legal_move(board);
        let mut best_score = 0;
        let mut completed_depth = 0;

        for depth in 1..=max_depth {
            self.root_move = None;
            let score = self.negamax(board, depth as i32, -INF, INF, 0, true);
            if self.stopped {
                // Aborted iteration: a root move that was fully searched and
                // beat the previous best at this depth is better information
                // than the last completed depth's choice.
                if let Some(mv) = self.root_move {
                    best_move = Some(mv);
                }
                break;
            }
            completed_depth = depth;
            best_score = score;
            if let Some(mv) = self.root_move {
                best_move = Some(mv);
            }
            if report {
                self.report(board, depth, score);
            }
            // Stop early only on a mate for us that this depth already proves.
            if score > 0 && is_mate_score(score) && MATE - score < depth as i32 {
                break;
            }
            if let Some(soft) = self.soft_limit {
                if self.start.elapsed() >= soft {
                    break;
                }
            }
        }
        SearchResult { best_move, score: best_score, depth: completed_depth, nodes: self.nodes }
    }

    fn report(&self, board: &Board, depth: u8, score: i32) {
        let ms = self.start.elapsed().as_millis().max(1);
        let nps = self.nodes as u128 * 1000 / ms;
        let score_str = if is_mate_score(score) {
            let plies = MATE - score.abs();
            let moves = (plies + 1) / 2;
            format!("mate {}", if score > 0 { moves } else { -moves })
        } else {
            format!("cp {score}")
        };
        // Only the root move is tracked in the baseline (no triangular PV table).
        let pv = match self.root_move {
            Some(mv) => cozy_chess::util::display_uci_move(board, mv).to_string(),
            None => String::new(),
        };
        println!(
            "info depth {depth} score {score_str} nodes {} nps {nps} time {ms} pv {pv}",
            self.nodes
        );
    }

    #[inline]
    fn check_stop(&mut self) -> bool {
        if self.stopped {
            return true;
        }
        if self.nodes & NODE_CHECK_MASK == 0 {
            if let Some(hard) = self.hard_limit {
                if self.start.elapsed() >= hard {
                    self.stopped = true;
                }
            }
            if let Some(n) = self.node_limit {
                if self.nodes >= n {
                    self.stopped = true;
                }
            }
        }
        self.stopped
    }

    fn is_repetition(&self, hash: u64) -> bool {
        // A single earlier occurrence already scores the line as a draw:
        // that is what the opponent can force, and it keeps the search cheap.
        // A null move pushes NULL_BARRIER: positions before it are not
        // reachable repetitions of positions after it.
        self.stack.iter().rev().skip(1).take_while(|&&h| h != NULL_BARRIER).any(|&h| h == hash)
    }

    fn negamax(&mut self, board: &Board, mut depth: i32, mut alpha: i32, beta: i32, ply: usize, null_ok: bool) -> i32 {
        let in_check = !board.checkers().is_empty();
        // Check extension: never drop into quiescence (or reduce the last
        // ply) while in check.
        if in_check {
            depth += 1;
        }
        if depth <= 0 {
            return self.quiescence(board, alpha, beta, ply);
        }
        self.nodes += 1;
        if self.check_stop() {
            return 0;
        }
        if ply > 0 && (board.halfmove_clock() >= 100 || self.is_repetition(board.hash())) {
            return 0;
        }
        if ply >= MAX_PLY - 1 {
            return eval::evaluate(board);
        }

        let hash = board.hash();
        let entry = self.tt[Self::tt_index(hash)];
        let hit = entry.key == hash;
        if hit && ply > 0 && entry.depth as i32 >= depth {
            let score = score_from_tt(entry.score, ply);
            match entry.bound {
                Bound::Exact => return score,
                Bound::Lower if score >= beta => return score,
                Bound::Upper if score <= alpha => return score,
                _ => {}
            }
        }
        let hash_move = if hit { entry.mv } else { None };

        let pv_node = beta - alpha > 1;
        let us = board.side_to_move();

        // Null-move pruning: if passing still fails high on a reduced search,
        // a real move will too. Not in check, not twice in a row, and not with
        // only pawns left (zugzwang).
        if null_ok && !pv_node && !in_check && ply > 0 && depth >= NULL_MIN_DEPTH && has_pieces(board, us) {
            if eval::evaluate(board) >= beta {
                if let Some(child) = board.null_move() {
                    let r = NULL_BASE_REDUCTION + depth / NULL_DEPTH_DIVISOR;
                    self.stack.push(NULL_BARRIER);
                    self.stack.push(child.hash());
                    let score = -self.negamax(&child, depth - 1 - r, -beta, -beta + 1, ply + 1, false);
                    self.stack.pop();
                    self.stack.pop();
                    if self.stopped {
                        return 0;
                    }
                    if score >= beta {
                        return if is_mate_score(score) { beta } else { score };
                    }
                }
            }
        }

        let side = us as usize;
        let killers = self.killers[ply];
        let moves = ordered_moves(board, false, hash_move, killers, &self.history[side]);
        if moves.is_empty() {
            return if board.checkers().is_empty() { 0 } else { -MATE + ply as i32 };
        }

        let enemy = board.colors(!us);
        let alpha_orig = alpha;
        let mut best = -INF;
        let mut best_move = None;
        for (i, (mv, _)) in moves.into_iter().enumerate() {
            let mut child = board.clone();
            child.play_unchecked(mv);
            self.stack.push(child.hash());
            let quiet = !enemy.has(mv.to) && mv.promotion.is_none();
            // PVS: full window for the first move, a null window for the
            // rest, re-searched only if one unexpectedly beats alpha. Late
            // quiet moves are first searched shallower (LMR).
            let mut score;
            if i == 0 {
                score = -self.negamax(&child, depth - 1, -beta, -alpha, ply + 1, true);
            } else {
                let mut r = 0;
                if depth >= LMR_MIN_DEPTH
                    && i >= LMR_FIRST_MOVE
                    && quiet
                    && !in_check
                    && child.checkers().is_empty()
                    && !killers.contains(&Some(mv))
                {
                    r = 1 + (i >= LMR_DEEP_MOVE && depth >= LMR_DEEP_DEPTH) as i32;
                }
                score = -self.negamax(&child, depth - 1 - r, -alpha - 1, -alpha, ply + 1, true);
                if r > 0 && score > alpha && !self.stopped {
                    score = -self.negamax(&child, depth - 1, -alpha - 1, -alpha, ply + 1, true);
                }
                if score > alpha && score < beta && !self.stopped {
                    score = -self.negamax(&child, depth - 1, -beta, -alpha, ply + 1, true);
                }
            }
            self.stack.pop();
            if self.stopped {
                return 0;
            }
            if score > best {
                best = score;
                best_move = Some(mv);
                if score > alpha {
                    alpha = score;
                    if ply == 0 {
                        // Fully searched (not stopped) and it raised alpha.
                        self.root_move = Some(mv);
                    }
                    if alpha >= beta {
                        if quiet {
                            let k = &mut self.killers[ply];
                            if k[0] != Some(mv) {
                                k[1] = k[0];
                                k[0] = Some(mv);
                            }
                            let h = &mut self.history[side][mv.from as usize][mv.to as usize];
                            *h = (*h + depth * depth).min(HISTORY_MAX);
                        }
                        break;
                    }
                }
            }
        }
        if ply == 0 {
            self.root_move = best_move;
        }
        let bound = if best >= beta {
            Bound::Lower
        } else if best > alpha_orig {
            Bound::Exact
        } else {
            Bound::Upper
        };
        // On a fail-low every move scored <= alpha, so the "best" one is
        // noise; keep the move the table already had.
        let tt_move = if bound == Bound::Upper { hash_move.or(best_move) } else { best_move };
        self.tt[Self::tt_index(hash)] = TtEntry {
            key: hash,
            mv: tt_move,
            score: score_to_tt(best, ply),
            depth: depth as i8,
            bound,
        };
        best
    }

    fn quiescence(&mut self, board: &Board, mut alpha: i32, beta: i32, ply: usize) -> i32 {
        self.nodes += 1;
        if self.check_stop() {
            return 0;
        }
        // In check there is no standing pat: every evasion is searched, and
        // having none is mate.
        let in_check = !board.checkers().is_empty();
        let stand_pat = if in_check { -MATE + ply as i32 } else { eval::evaluate(board) };
        if stand_pat >= beta {
            return stand_pat;
        }
        if stand_pat > alpha {
            alpha = stand_pat;
        }
        if ply >= MAX_PLY - 1 {
            return if in_check { eval::evaluate(board) } else { stand_pat };
        }
        let mut best = stand_pat;
        for (mv, _) in ordered_moves(board, !in_check, None, [None; 2], &EMPTY_HISTORY) {
            let mut child = board.clone();
            child.play_unchecked(mv);
            let score = -self.quiescence(&child, -beta, -alpha, ply + 1);
            if self.stopped {
                return 0;
            }
            if score > best {
                best = score;
                if score > alpha {
                    alpha = score;
                    if alpha >= beta {
                        break;
                    }
                }
            }
        }
        best
    }
}

pub fn is_mate_score(score: i32) -> bool {
    score.abs() >= MATE - MAX_PLY as i32
}

fn first_legal_move(board: &Board) -> Option<Move> {
    let mut first = None;
    board.generate_moves(|moves| {
        first = moves.into_iter().next();
        true
    });
    first
}

/// Generate moves with an ordering key: captures by MVV-LVA (most valuable
/// victim first, cheapest attacker first), queen promotions high, quiet moves
/// after them killers, then the remaining quiet moves by history; the hash
/// move, if any, goes first. With `captures_only`, only captures and queen
/// promotions are kept.
fn ordered_moves(
    board: &Board,
    captures_only: bool,
    hash_move: Option<Move>,
    killers: [Option<Move>; 2],
    history: &[[i32; 64]; 64],
) -> Vec<(Move, i32)> {
    let us = board.side_to_move();
    let enemy = board.colors(!us);
    let ep_square = board.en_passant().map(|file| Square::new(file, Rank::Sixth.relative_to(us)));
    let mut out: Vec<(Move, i32)> = Vec::with_capacity(48);
    board.generate_moves(|moves| {
        let attacker = moves.piece;
        for mv in moves {
            let victim = if attacker == Piece::Pawn && Some(mv.to) == ep_square {
                Some(Piece::Pawn)
            } else if enemy.has(mv.to) {
                board.piece_on(mv.to)
            } else {
                None
            };
            let is_capture = victim.is_some();
            if captures_only && !is_capture && mv.promotion != Some(Piece::Queen) {
                continue;
            }
            let mut key = 0;
            if let Some(v) = victim {
                key += 10_000 + 10 * eval::piece_value(v) - eval::piece_value(attacker);
            }
            if let Some(p) = mv.promotion {
                key += if p == Piece::Queen { 9_000 } else { -5_000 };
            }
            if !is_capture && mv.promotion.is_none() {
                key = if Some(mv) == killers[0] {
                    8_000
                } else if Some(mv) == killers[1] {
                    7_900
                } else {
                    history[mv.from as usize][mv.to as usize]
                };
            }
            if Some(mv) == hash_move {
                key = 1_000_000;
            }
            out.push((mv, key));
        }
        false
    });
    out.sort_unstable_by_key(|(_, k)| -*k);
    out
}
