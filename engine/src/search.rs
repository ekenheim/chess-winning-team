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
/// Frontier pruning. Variant "B" (build with P1_VARIANT_B=1) is a conservative
/// control: margins x1.3 and reverse futility one ply shallower.
const VARIANT_B: bool = option_env!("P1_VARIANT_B").is_some();
/// Reverse futility: at depth <= RFP_MAX_DEPTH a non-PV node whose static
/// eval beats beta by RFP_MARGIN per ply (one ply less when improving) returns.
const RFP_MAX_DEPTH: i32 = if VARIANT_B { 5 } else { 6 };
const RFP_MARGIN: i32 = if VARIANT_B { 117 } else { 90 };
/// Futility: at depth <= 3 skip quiet moves when static eval + margin <= alpha.
const FUT_MARGIN: [i32; 4] = if VARIANT_B { [0, 143, 273, 403] } else { [0, 110, 210, 310] };
/// Late-move pruning: at depth <= LMP_MAX_DEPTH skip quiet moves after
/// LMP_BASE + depth^2 of them (half that when not improving).
const LMP_MAX_DEPTH: i32 = 5;
const LMP_BASE: i32 = 3;

/// Does `color` have anything besides king and pawns?
fn has_pieces(board: &Board, color: cozy_chess::Color) -> bool {
    let pawns_and_king = board.pieces(Piece::Pawn) | board.pieces(Piece::King);
    !(board.colors(color) & !pawns_and_king).is_empty()
}

/// History scores stay below the killer keys.
const HISTORY_MAX: i32 = 7_000;
static EMPTY_HISTORY: [[i32; 64]; 64] = [[0; 64]; 64];
/// Default transposition table size in MB (`setoption name Hash`).
pub const DEFAULT_HASH_MB: usize = 128;
/// Also store quiescence results (depth 0, empty or same-key slots only).
const QS_STORE: bool = false;
/// Probe the table in quiescence (cutoffs at non-PV nodes, hash move ordering).
const QS_PROBE: bool = false;
/// Allow table cutoffs at PV nodes too (the engine reports no PV beyond the root move).
const PV_CUTOFFS: bool = true;

#[derive(Clone, Copy, PartialEq, Eq)]
enum Bound {
    Exact = 1,
    Lower = 2,
    Upper = 3,
}

/// One 16-byte table slot. `gen_bound` = generation (6 bits) << 2 | bound
/// (2 bits, 0 = empty slot).
#[repr(C)]
#[derive(Clone, Copy, Default)]
struct TtEntry {
    key: u64,
    mv: u16,
    score: i16,
    eval: i16,
    depth: i8,
    gen_bound: u8,
}

impl TtEntry {
    #[inline]
    fn bound(&self) -> Option<Bound> {
        match self.gen_bound & 3 {
            1 => Some(Bound::Exact),
            2 => Some(Bound::Lower),
            3 => Some(Bound::Upper),
            _ => None,
        }
    }
    #[inline]
    fn gen(&self) -> u8 {
        self.gen_bound >> 2
    }
}

/// Four slots sharing one cache line.
#[repr(C, align(64))]
#[derive(Clone, Copy, Default)]
struct Bucket([TtEntry; 4]);

/// from | to << 6 | promotion << 12 (1..4 = N/B/R/Q); 0 = no move.
#[inline]
fn encode_move(mv: Option<Move>) -> u16 {
    match mv {
        None => 0,
        Some(m) => {
            let promo = match m.promotion {
                None => 0,
                Some(Piece::Knight) => 1,
                Some(Piece::Bishop) => 2,
                Some(Piece::Rook) => 3,
                Some(_) => 4,
            };
            m.from as u16 | (m.to as u16) << 6 | promo << 12
        }
    }
}

#[inline]
fn decode_move(v: u16) -> Option<Move> {
    if v == 0 {
        return None;
    }
    let promotion = match v >> 12 {
        1 => Some(Piece::Knight),
        2 => Some(Piece::Bishop),
        3 => Some(Piece::Rook),
        4 => Some(Piece::Queen),
        _ => None,
    };
    Some(Move { from: Square::index((v & 63) as usize), to: Square::index(((v >> 6) & 63) as usize), promotion })
}

fn bucket_count(mb: usize) -> usize {
    let n = (mb.max(1) << 20) / std::mem::size_of::<Bucket>();
    // Round down to a power of two.
    1usize << (usize::BITS - 1 - n.leading_zeros())
}

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
    /// Score of `root_move` (valid when it is Some).
    root_score: i32,
    tt: Vec<Bucket>,
    /// Search generation (6 bits), bumped at every search() call.
    gen: u8,
    /// Two quiet moves per ply that recently caused a beta cutoff.
    killers: [[Option<Move>; 2]; MAX_PLY],
    /// Butterfly history [side][from][to]: how often a quiet move cut off, weighted by depth.
    history: Box<[[[i32; 64]; 64]; 2]>,
    /// Static eval per ply of the current path (-INF when in check).
    eval_stack: [i32; MAX_PLY],
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
            root_score: -INF,
            // vec! writes every bucket, so the pages are touched here and
            // not during the first move.
            tt: vec![Bucket::default(); bucket_count(DEFAULT_HASH_MB)],
            gen: 0,
            killers: [[None; 2]; MAX_PLY],
            history: Box::new([[[0; 64]; 64]; 2]),
            eval_stack: [-INF; MAX_PLY],
        }
    }

    pub fn clear(&mut self) {
        self.tt.fill(Bucket::default());
        self.gen = 0;
        self.history = Box::new([[[0; 64]; 64]; 2]);
    }

    /// Resize the table to `mb` megabytes (rounded down to a power of two), cleared.
    pub fn set_hash_mb(&mut self, mb: usize) {
        self.tt = Vec::new();
        self.tt = vec![Bucket::default(); bucket_count(mb)];
        self.gen = 0;
    }

    #[inline]
    fn tt_index(&self, hash: u64) -> usize {
        hash as usize & (self.tt.len() - 1)
    }

    #[inline]
    fn tt_probe(&self, hash: u64) -> Option<TtEntry> {
        self.tt[self.tt_index(hash)].0.iter().find(|e| e.key == hash && e.gen_bound & 3 != 0).copied()
    }

    fn tt_store(&mut self, hash: u64, mv: Option<Move>, score: i32, depth: i32, bound: Bound) {
        let gen = self.gen;
        let idx = self.tt_index(hash);
        let bucket = &mut self.tt[idx].0;
        let new = TtEntry {
            key: hash,
            mv: encode_move(mv),
            score: score.clamp(i16::MIN as i32 + 1, i16::MAX as i32) as i16,
            eval: i16::MIN,
            depth: depth.clamp(-1, 127) as i8,
            gen_bound: gen << 2 | bound as u8,
        };
        if let Some(e) = bucket.iter_mut().find(|e| e.key == hash && e.gen_bound & 3 != 0) {
            // Keep a deeper result from this search unless the new one is exact.
            if (new.depth as i32) < e.depth as i32 - 2 && e.gen() == gen && bound != Bound::Exact {
                if new.mv != 0 {
                    e.mv = new.mv;
                }
                return;
            }
            let old_mv = e.mv;
            *e = new;
            if e.mv == 0 {
                e.mv = old_mv;
            }
            return;
        }
        if let Some(e) = bucket.iter_mut().find(|e| e.gen_bound & 3 == 0) {
            *e = new;
            return;
        }
        // Replace the shallowest slot, older generations counting as shallower.
        let victim = bucket
            .iter_mut()
            .min_by_key(|e| e.depth as i32 - 8 * (gen.wrapping_sub(e.gen()) & 63) as i32)
            .unwrap();
        *victim = new;
    }

    /// Quiescence store: only into an empty slot or over the same position.
    fn tt_store_qs(&mut self, hash: u64, mv: Option<Move>, score: i32, bound: Bound) {
        let gen = self.gen;
        let idx = self.tt_index(hash);
        let bucket = &mut self.tt[idx].0;
        let new = TtEntry {
            key: hash,
            mv: encode_move(mv),
            score: score.clamp(i16::MIN as i32 + 1, i16::MAX as i32) as i16,
            eval: i16::MIN,
            depth: 0,
            gen_bound: gen << 2 | bound as u8,
        };
        if let Some(e) = bucket.iter_mut().find(|e| e.key == hash && e.gen_bound & 3 != 0) {
            if e.depth <= 0 {
                let old_mv = e.mv;
                *e = new;
                if e.mv == 0 {
                    e.mv = old_mv;
                }
            }
            return;
        }
        if let Some(e) = bucket.iter_mut().find(|e| e.gen_bound & 3 == 0) {
            *e = new;
        }
    }

    pub fn search(&mut self, board: &Board, history: &[u64], limits: &SearchLimits, report: bool) -> SearchResult {
        self.start = Instant::now();
        self.nodes = 0;
        self.stopped = false;
        self.node_limit = limits.nodes;
        self.gen = (self.gen + 1) & 63;
        // Time manager (movetime): nothing carries over to the next move and
        // an iteration cut off by the hard limit still contributes its best
        // root move so far, so keep iterating until the hard stop. Reserve a
        // slice for pipe latency and the node-count clock granularity.
        if let Some(t) = limits.move_time {
            // 5% of the budget, between 15 ms and 100 ms.
            let reserve = (t / 20).clamp(Duration::from_millis(15), Duration::from_millis(100));
            self.hard_limit = Some(t.saturating_sub(reserve));
            self.soft_limit = None;
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

        let log = std::env::var_os("ENGINE_TIMELOG").is_some();
        let mut total_researches = 0u32;
        let mut iter_start = self.start.elapsed();
        for depth in 1..=max_depth {
            // Aspiration window around the last completed score, widened
            // (doubling) on each failure and opened fully after 4 failures.
            let use_asp = depth >= 5 && !is_mate_score(best_score);
            let mut delta = 25;
            let (mut a, mut b) = if use_asp { (best_score - delta, best_score + delta) } else { (-INF, INF) };
            let a0 = a;
            let mut fails = 0;
            let mut score;
            loop {
                self.root_move = None;
                self.root_score = -INF;
                score = self.negamax(board, depth as i32, a, b, 0, true);
                if self.stopped {
                    break;
                }
                if score <= a {
                    fails += 1;
                    a = if fails >= 4 { -INF } else { (a - delta).max(-INF) };
                    delta *= 2;
                    continue;
                }
                if score >= b {
                    if let Some(m) = self.root_move {
                        best_move = Some(m);
                    }
                    fails += 1;
                    b = if fails >= 4 { INF } else { (b + delta).min(INF) };
                    delta *= 2;
                    continue;
                }
                break;
            }
            total_researches += fails;
            if self.stopped {
                // Aborted iteration: a fully searched root move that beats the
                // original aspiration floor (built from the last completed
                // score) is better information than the last depth's choice.
                if let Some(mv) = self.root_move {
                    if self.root_score > a0 {
                        best_move = Some(mv);
                    }
                }
                break;
            }
            completed_depth = depth;
            best_score = score;
            if let Some(mv) = self.root_move {
                best_move = Some(mv);
            }
            if log {
                let now = self.start.elapsed();
                eprintln!("timelog iter depth {depth} ms {} researches {fails}", (now - iter_start).as_millis());
                iter_start = now;
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
        if log {
            eprintln!(
                "timelog done depth {completed_depth} researches {total_researches} elapsed_ms {:.1} hard_ms {}",
                self.start.elapsed().as_secs_f64() * 1000.0,
                self.hard_limit.map_or(0, |h| h.as_millis())
            );
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

        let pv_node = beta - alpha > 1;
        let hash = board.hash();
        let entry = self.tt_probe(hash);
        let mut hash_move = None;
        if let Some(e) = entry {
            // PV nodes never cut off on the table, so the PV stays whole.
            if (PV_CUTOFFS || !pv_node) && ply > 0 && e.depth as i32 >= depth {
                let score = score_from_tt(e.score as i32, ply);
                match e.bound() {
                    Some(Bound::Exact) => return score,
                    Some(Bound::Lower) if score >= beta => return score,
                    Some(Bound::Upper) if score <= alpha => return score,
                    _ => {}
                }
            }
            hash_move = decode_move(e.mv);
        }
        let us = board.side_to_move();
        let static_eval = if in_check { -INF } else { eval::evaluate(board) };
        self.eval_stack[ply] = static_eval;
        let improving =
            !in_check && ply >= 2 && self.eval_stack[ply - 2] != -INF && static_eval > self.eval_stack[ply - 2];

        // Reverse futility pruning: far enough above beta near the leaves,
        // assume a quiet move keeps it there.
        if !pv_node
            && !in_check
            && ply > 0
            && depth <= RFP_MAX_DEPTH
            && !is_mate_score(beta)
            && static_eval - RFP_MARGIN * (depth - improving as i32) >= beta
        {
            return static_eval;
        }

        // Null-move pruning: if passing still fails high on a reduced search,
        // a real move will too. Not in check, not twice in a row, and not with
        // only pawns left (zugzwang).
        if null_ok && !pv_node && !in_check && ply > 0 && depth >= NULL_MIN_DEPTH && has_pieces(board, us) {
            if static_eval >= beta {
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
        let ep_square = board.en_passant().map(|file| Square::new(file, Rank::Sixth.relative_to(us)));
        let mut quiets_seen = 0i32;
        let alpha_orig = alpha;
        let mut best = -INF;
        let mut best_move = None;
        for (i, (mv, _)) in moves.into_iter().enumerate() {
            let is_ep = board.piece_on(mv.from) == Some(Piece::Pawn) && Some(mv.to) == ep_square;
            let quiet = !enemy.has(mv.to) && !is_ep && mv.promotion.is_none();
            let mut child = board.clone();
            child.play_unchecked(mv);
            self.stack.push(child.hash());
            let gives_check = !child.checkers().is_empty();
            // Frontier pruning of late quiet moves (LMP and futility).
            if i > 0
                && !pv_node
                && !in_check
                && quiet
                && !gives_check
                && best > -MATE + MAX_PLY as i32
                && !killers.contains(&Some(mv))
            {
                let lmp_limit = if improving { LMP_BASE + depth * depth } else { (LMP_BASE + depth * depth) / 2 };
                let lmp = depth <= LMP_MAX_DEPTH && quiets_seen >= lmp_limit;
                let futile = depth <= 3 && static_eval + FUT_MARGIN[depth as usize] <= alpha;
                if lmp || futile {
                    self.stack.pop();
                    continue;
                }
            }
            if quiet {
                quiets_seen += 1;
            }
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
                    && !gives_check
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
                        self.root_score = score;
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
        self.tt_store(hash, tt_move, score_to_tt(best, ply), depth, bound);
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
        let hash = board.hash();
        let mut hash_move = None;
        if QS_PROBE && !in_check {
            if let Some(e) = self.tt_probe(hash) {
                // Every stored depth is >= 0, the quiescence depth.
                if beta - alpha == 1 {
                    let score = score_from_tt(e.score as i32, ply);
                    match e.bound() {
                        Some(Bound::Exact) => return score,
                        Some(Bound::Lower) if score >= beta => return score,
                        Some(Bound::Upper) if score <= alpha => return score,
                        _ => {}
                    }
                }
                hash_move = decode_move(e.mv);
            }
        }
        let alpha_orig = alpha;
        let stand_pat = if in_check { -MATE + ply as i32 } else { eval::evaluate(board) };
        if stand_pat >= beta {
            if QS_STORE && !in_check {
                self.tt_store_qs(hash, None, score_to_tt(stand_pat, ply), Bound::Lower);
            }
            return stand_pat;
        }
        if stand_pat > alpha {
            alpha = stand_pat;
        }
        if ply >= MAX_PLY - 1 {
            return if in_check { eval::evaluate(board) } else { stand_pat };
        }
        let mut best = stand_pat;
        let mut best_move = None;
        for (mv, _) in ordered_moves(board, !in_check, hash_move, [None; 2], &EMPTY_HISTORY) {
            let mut child = board.clone();
            child.play_unchecked(mv);
            let score = -self.quiescence(&child, -beta, -alpha, ply + 1);
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
        if QS_STORE && !in_check {
            let bound = if best >= beta {
                Bound::Lower
            } else if best > alpha_orig {
                Bound::Exact
            } else {
                Bound::Upper
            };
            self.tt_store_qs(hash, best_move, score_to_tt(best, ply), bound);
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
