//! Baseline search: iterative deepening, plain alpha-beta negamax,
//! MVV-LVA capture ordering, quiescence search, repetition and 50-move
//! detection, and a simple time manager. Everything smarter is an experiment.

use cozy_chess::{Board, Move, Piece, Rank, Square};
use std::time::{Duration, Instant};

use crate::eval;

pub const MATE: i32 = 30_000;
pub const MAX_PLY: usize = 128;
const INF: i32 = 100_000;
/// Check the clock every this many nodes.
const NODE_CHECK_MASK: u64 = 1023;

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
        }
    }

    pub fn search(&mut self, board: &Board, history: &[u64], limits: &SearchLimits, report: bool) -> SearchResult {
        self.start = Instant::now();
        self.nodes = 0;
        self.stopped = false;
        self.node_limit = limits.nodes;
        // Time manager: reserve a slice for pipe latency and the granularity
        // of the node-count clock check, and only start an iteration when
        // less than 40% of the budget is gone.
        if let Some(t) = limits.move_time {
            let reserve = Duration::from_millis(15).max(t / 20);
            self.hard_limit = Some(t.saturating_sub(reserve));
            self.soft_limit = Some(t.mul_f64(0.4));
        } else {
            self.hard_limit = None;
            self.soft_limit = None;
        }
        self.stack.clear();
        self.stack.extend_from_slice(history);
        let max_depth = limits.depth.unwrap_or(MAX_PLY as u8 - 1).min(MAX_PLY as u8 - 1);

        let mut best_move: Option<Move> = first_legal_move(board);
        let mut best_score = 0;
        let mut completed_depth = 0;

        for depth in 1..=max_depth {
            self.root_move = None;
            let score = self.negamax(board, depth as i32, -INF, INF, 0);
            if self.stopped {
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
            if is_mate_score(score) && depth >= 2 {
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
        self.stack.iter().rev().skip(1).any(|&h| h == hash)
    }

    fn negamax(&mut self, board: &Board, depth: i32, mut alpha: i32, beta: i32, ply: usize) -> i32 {
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

        let moves = ordered_moves(board, false);
        if moves.is_empty() {
            return if board.checkers().is_empty() { 0 } else { -MATE + ply as i32 };
        }

        let mut best = -INF;
        let mut best_move = None;
        for (mv, _) in moves {
            let mut child = board.clone();
            child.play_unchecked(mv);
            self.stack.push(child.hash());
            let score = -self.negamax(&child, depth - 1, -beta, -alpha, ply + 1);
            self.stack.pop();
            if self.stopped {
                return 0;
            }
            if score > best {
                best = score;
                best_move = Some(mv);
                if score > alpha {
                    alpha = score;
                    if alpha >= beta {
                        break;
                    }
                }
            }
        }
        if ply == 0 {
            self.root_move = best_move;
        }
        best
    }

    fn quiescence(&mut self, board: &Board, mut alpha: i32, beta: i32, ply: usize) -> i32 {
        self.nodes += 1;
        if self.check_stop() {
            return 0;
        }
        let stand_pat = eval::evaluate(board);
        if stand_pat >= beta {
            return stand_pat;
        }
        if stand_pat > alpha {
            alpha = stand_pat;
        }
        if ply >= MAX_PLY - 1 {
            return stand_pat;
        }
        let mut best = stand_pat;
        for (mv, _) in ordered_moves(board, true) {
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
/// last. With `captures_only`, only captures and queen promotions are kept.
fn ordered_moves(board: &Board, captures_only: bool) -> Vec<(Move, i32)> {
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
            out.push((mv, key));
        }
        false
    });
    out.sort_unstable_by_key(|(_, k)| -*k);
    out
}
