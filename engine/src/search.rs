//! Search: iterative deepening, principal-variation search with a
//! transposition table (kept across moves), null-move pruning, late-move
//! reductions (log table), check extensions, staged move ordering (hash
//! move, captures that do not lose material by SEE in MVV-LVA order, killers,
//! countermove, quiet moves by a gravity history, losing captures last),
//! quiescence search (SEE and delta pruning; all evasions when in check),
//! repetition and 50-move detection, and a simple time manager.

use cozy_chess::{
    get_between_rays, get_bishop_moves, get_bishop_rays, get_king_moves, get_knight_moves, get_pawn_attacks,
    get_rook_moves, get_rook_rays, BitBoard, Board, Color, Move, Piece, PieceMoves, Rank, Square};
use std::mem::MaybeUninit;
use std::sync::atomic::Ordering::Relaxed;
use std::sync::atomic::{AtomicBool, AtomicU64};
use std::sync::Arc;
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
/// LMR: a quiet move searched after others at depth >= LMR_MIN_DEPTH loses
/// LMR_BASE + ln(depth) * ln(move index) / LMR_DIVISOR plies (table in
/// 1/1024 ply), adjusted per move (see `negamax`). Build-time overrides
/// LMR_BASE_X100 / LMR_DIV_X100 exist for measurement only.
const LMR_MIN_DEPTH: i32 = 3;
const LMR_BASE: f64 = match option_env!("LMR_BASE_X100") {
    Some(s) => parse_x100(s),
    None => 0.50,
};
const LMR_DIVISOR: f64 = match option_env!("LMR_DIV_X100") {
    Some(s) => parse_x100(s),
    None => 2.50,
};
/// History score worth one ply of reduction (either way).
const LMR_HISTORY_PER_PLY: i32 = 8_192;

const fn parse_x100(s: &str) -> f64 {
    let b = s.as_bytes();
    let mut v = 0i64;
    let mut i = 0;
    while i < b.len() {
        v = v * 10 + (b[i] - b'0') as i64;
        i += 1;
    }
    v as f64 / 100.0
}
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

/// History scores stay within +-HISTORY_MAX (gravity update), below the
/// countermove and killer ordering keys.
const HISTORY_MAX: i32 = 16_384;
/// Bonus (cutoff move) / malus (quiet moves tried before it): min(HIST_MUL * depth^2, HIST_CAP).
const HIST_MUL: i32 = 32;
const HIST_CAP: i32 = 2_400;
static EMPTY_HISTORY: [[i32; 64]; 64] = [[0; 64]; 64];
/// Ordering keys. The picker is staged, so a key only competes within its
/// stage: noisy (captures, queen promotions), quiet (killers, countermove,
/// history, underpromotions), losing captures.
const KEY_CAPTURE: i32 = 100_000;
const KEY_QUEEN_PROMO: i32 = 90_000;
const KEY_KILLER0: i32 = 80_000;
const KEY_KILLER1: i32 = 79_000;
const KEY_COUNTER: i32 = 78_000;
const KEY_UNDERPROMO: i32 = -50_000;

/// Gravity update: moves toward +-HISTORY_MAX by `bonus`, slowing as it nears it.
#[inline]
fn history_update(h: &mut i32, bonus: i32) {
    *h += bonus - *h * bonus.abs() / HISTORY_MAX;
}
/// Lazy SMP: play a helper's move when it completed a deeper iteration than the main thread.
const PREFER_DEEPER_HELPER: bool = true;
/// Default transposition table size in MB (`setoption name Hash`).
pub const DEFAULT_HASH_MB: usize = 128;
/// Also store quiescence results (depth 0, empty or same-key slots only).
const QS_STORE: bool = false;
/// Probe the table in quiescence (cutoffs at non-PV nodes, hash move ordering).
const QS_PROBE: bool = false;
/// Allow table cutoffs at PV nodes too (the engine reports no PV beyond the root move).
const PV_CUTOFFS: bool = true;
/// Quiescence delta pruning: skip a capture when stand pat + victim value +
/// this margin still cannot reach alpha.
const DELTA_MARGIN: i32 = 200;

#[derive(Clone, Copy, PartialEq, Eq)]
enum Bound {
    Exact = 1,
    Lower = 2,
    Upper = 3,
}

/// One table slot, as unpacked from the shared table. `gen_bound` =
/// generation (6 bits) << 2 | bound (2 bits, 0 = empty slot).
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
    #[inline]
    fn pack(&self) -> u64 {
        self.mv as u64
            | (self.score as u16 as u64) << 16
            | (self.eval as u16 as u64) << 32
            | (self.depth as u8 as u64) << 48
            | (self.gen_bound as u64) << 56
    }
    #[inline]
    fn unpack(key: u64, d: u64) -> Self {
        TtEntry {
            key,
            mv: d as u16,
            score: (d >> 16) as u16 as i16,
            eval: (d >> 32) as u16 as i16,
            depth: (d >> 48) as u8 as i8,
            gen_bound: (d >> 56) as u8,
        }
    }
}

/// Four slots sharing one cache line. Each slot is two words: (key ^ data,
/// data). Threads read and write them without locks; a slot torn by a
/// concurrent write fails the xor check and reads as some other position.
#[repr(C, align(64))]
#[derive(Default)]
struct Bucket([AtomicU64; 8]);

impl Bucket {
    /// Slot `i` with its key recovered (a torn slot yields a wrong key).
    #[inline]
    fn load(&self, i: usize) -> TtEntry {
        let k = self.0[2 * i].load(Relaxed);
        let d = self.0[2 * i + 1].load(Relaxed);
        TtEntry::unpack(k ^ d, d)
    }
    #[inline]
    fn store(&self, i: usize, e: &TtEntry) {
        let d = e.pack();
        self.0[2 * i + 1].store(d, Relaxed);
        self.0[2 * i].store(e.key ^ d, Relaxed);
    }
    #[inline]
    fn clear(&self) {
        for w in &self.0 {
            w.store(0, Relaxed);
        }
    }
}

/// The transposition table shared by every search thread.
pub struct Tt {
    buckets: Box<[Bucket]>,
}

impl Tt {
    fn new(mb: usize) -> Self {
        // Writing every bucket touches the pages here, not during the first move.
        let buckets: Box<[Bucket]> = (0..bucket_count(mb)).map(|_| Bucket::default()).collect();
        Tt { buckets }
    }
    fn clear(&self) {
        for b in self.buckets.iter() {
            b.clear();
        }
    }
}

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

/// Maximum number of search threads (`setoption name Threads`).
pub const MAX_THREADS: usize = 16;
/// Stack size of a helper search thread.
const HELPER_STACK: usize = 32 << 20;

/// Contempt: a draw is worth nothing in this competition (only wins count),
/// so the side the engine plays scores every draw as this much below equal.
const CONTEMPT: i32 = 50;

pub struct Searcher {
    /// The side this search plays for (set per search), for contempt.
    root_color: cozy_chess::Color,
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
    tt: Arc<Tt>,
    /// Search generation (6 bits), bumped at every search() call.
    gen: u8,
    /// Two quiet moves per ply that recently caused a beta cutoff.
    killers: [[Option<Move>; 2]; MAX_PLY],
    /// Butterfly history [side][from][to]: how often a quiet move cut off, weighted by depth.
    history: Box<[[[i32; 64]; 64]; 2]>,
    /// Static eval per ply of the current path (-INF when in check).
    eval_stack: [i32; MAX_PLY],
    /// Incremental material + piece-square sums (mg, eg; White's view) per ply.
    psq_stack: [(i32, i32); MAX_PLY + 1],
    /// Move played to reach ply+1: (piece index 0..12 = piece*2+color, to square); None after a null move.
    move_stack: [Option<(u8, u8)>; MAX_PLY],
    /// Countermove [piece index][to] of the previous move: the quiet reply that last cut off.
    countermoves: Box<[[Option<Move>; 64]; 12]>,
    /// LMR table [depth][move index] in 1/1024 ply.
    lmr: Box<[[i32; 64]; 64]>,
    /// Lazy SMP: 0 = main thread; helpers are 1.. and run the same
    /// iterative deepening on the shared table, stopping on `stop`.
    thread_id: usize,
    /// Set by the main thread when the search ends; every thread polls it.
    stop: Arc<AtomicBool>,
    /// This thread's node count, published every NODE_CHECK_MASK + 1 nodes.
    nodes_pub: Arc<AtomicU64>,
    /// Helper searchers (main thread only), each with its own heuristics.
    helpers: Vec<Searcher>,
}

impl Searcher {
    pub fn new() -> Self {
        Self::with_table(Arc::new(Tt::new(DEFAULT_HASH_MB)), Arc::new(AtomicBool::new(false)), 0)
    }

    fn with_table(tt: Arc<Tt>, stop: Arc<AtomicBool>, thread_id: usize) -> Self {
        Searcher {
            nodes: 0,
            start: Instant::now(),
            hard_limit: None,
            soft_limit: None,
            node_limit: None,
            stopped: false,
            stack: Vec::with_capacity(512),
            root_move: None,
            root_color: cozy_chess::Color::White,
            root_score: -INF,
            tt,
            gen: 0,
            killers: [[None; 2]; MAX_PLY],
            history: Box::new([[[0; 64]; 64]; 2]),
            eval_stack: [-INF; MAX_PLY],
            psq_stack: [(0, 0); MAX_PLY + 1],
            move_stack: [None; MAX_PLY],
            countermoves: Box::new([[None; 64]; 12]),
            lmr: Box::new(lmr_table()),
            thread_id,
            stop,
            nodes_pub: Arc::new(AtomicU64::new(0)),
            helpers: Vec::new(),
        }
    }

    pub fn clear(&mut self) {
        self.tt.clear();
        self.gen = 0;
        self.history = Box::new([[[0; 64]; 64]; 2]);
        self.countermoves = Box::new([[None; 64]; 12]);
        for h in &mut self.helpers {
            h.history = Box::new([[[0; 64]; 64]; 2]);
            h.countermoves = Box::new([[None; 64]; 12]);
        }
    }

    /// Resize the table to `mb` megabytes (rounded down to a power of two), cleared.
    pub fn set_hash_mb(&mut self, mb: usize) {
        let threads = self.threads();
        self.helpers.clear();
        self.tt = Arc::new(Tt::new(1)); // free the old table first
        self.tt = Arc::new(Tt::new(mb));
        self.gen = 0;
        self.set_threads(threads);
    }

    /// Number of search threads, main included.
    pub fn threads(&self) -> usize {
        1 + self.helpers.len()
    }

    /// Use `n` search threads (1..=MAX_THREADS), main included.
    pub fn set_threads(&mut self, n: usize) {
        let n = n.clamp(1, MAX_THREADS);
        self.helpers.truncate(n - 1);
        while self.helpers.len() < n - 1 {
            let id = self.helpers.len() + 1;
            self.helpers.push(Searcher::with_table(self.tt.clone(), self.stop.clone(), id));
        }
    }

    #[inline]
    fn tt_bucket(&self, hash: u64) -> &Bucket {
        let n = self.tt.buckets.len();
        // SAFETY: n is a power of two, so the index is in range.
        unsafe { self.tt.buckets.get_unchecked(hash as usize & (n - 1)) }
    }

    /// Start loading the bucket of `hash` into the cache.
    #[inline(always)]
    fn tt_prefetch(&self, hash: u64) {
        let ptr = self.tt_bucket(hash) as *const Bucket as *const u8;
        #[cfg(target_arch = "aarch64")]
        // SAFETY: a prefetch hint never faults and has no visible effect.
        unsafe {
            std::arch::asm!("prfm pldl1keep, [{0}]", in(reg) ptr, options(nostack, readonly, preserves_flags));
        }
        #[cfg(target_arch = "x86_64")]
        // SAFETY: as above.
        unsafe {
            std::arch::x86_64::_mm_prefetch(ptr as *const i8, std::arch::x86_64::_MM_HINT_T0);
        }
        #[cfg(not(any(target_arch = "aarch64", target_arch = "x86_64")))]
        let _ = ptr;
    }

    #[inline]
    fn tt_probe(&self, hash: u64) -> Option<TtEntry> {
        let b = self.tt_bucket(hash);
        (0..4).map(|i| b.load(i)).find(|e| e.key == hash && e.gen_bound & 3 != 0)
    }

    fn tt_store(&self, hash: u64, mv: Option<Move>, score: i32, depth: i32, bound: Bound) {
        let gen = self.gen;
        let b = self.tt_bucket(hash);
        let slots: [TtEntry; 4] = std::array::from_fn(|i| b.load(i));
        let new = TtEntry {
            key: hash,
            mv: encode_move(mv),
            score: score.clamp(i16::MIN as i32 + 1, i16::MAX as i32) as i16,
            eval: i16::MIN,
            depth: depth.clamp(-1, 127) as i8,
            gen_bound: gen << 2 | bound as u8,
        };
        if let Some(i) = slots.iter().position(|e| e.key == hash && e.gen_bound & 3 != 0) {
            let mut e = slots[i];
            // Keep a deeper result from this search unless the new one is exact.
            if (new.depth as i32) < e.depth as i32 - 2 && e.gen() == gen && bound != Bound::Exact {
                if new.mv != 0 {
                    e.mv = new.mv;
                    b.store(i, &e);
                }
                return;
            }
            let old_mv = e.mv;
            e = new;
            if e.mv == 0 {
                e.mv = old_mv;
            }
            b.store(i, &e);
            return;
        }
        if let Some(i) = slots.iter().position(|e| e.gen_bound & 3 == 0) {
            b.store(i, &new);
            return;
        }
        // Replace the shallowest slot, older generations counting as shallower.
        let victim = (0..4)
            .min_by_key(|&i| slots[i].depth as i32 - 8 * (gen.wrapping_sub(slots[i].gen()) & 63) as i32)
            .unwrap();
        b.store(victim, &new);
    }

    /// Quiescence store: only into an empty slot or over the same position.
    fn tt_store_qs(&self, hash: u64, mv: Option<Move>, score: i32, bound: Bound) {
        let gen = self.gen;
        let b = self.tt_bucket(hash);
        let slots: [TtEntry; 4] = std::array::from_fn(|i| b.load(i));
        let new = TtEntry {
            key: hash,
            mv: encode_move(mv),
            score: score.clamp(i16::MIN as i32 + 1, i16::MAX as i32) as i16,
            eval: i16::MIN,
            depth: 0,
            gen_bound: gen << 2 | bound as u8,
        };
        if let Some(i) = slots.iter().position(|e| e.key == hash && e.gen_bound & 3 != 0) {
            let e = slots[i];
            if e.depth <= 0 {
                let mut n = new;
                if n.mv == 0 {
                    n.mv = e.mv;
                }
                b.store(i, &n);
            }
            return;
        }
        if let Some(i) = slots.iter().position(|e| e.gen_bound & 3 == 0) {
            b.store(i, &new);
        }
    }

    /// Search `board` (reached through the positions `history`) within
    /// `limits`. With helpers (Lazy SMP), they search the same position on
    /// the shared table until this (main) thread finishes; all are joined
    /// before returning. The move played is the main thread's, unless a
    /// helper completed a deeper iteration.
    pub fn search(&mut self, board: &Board, history: &[u64], limits: &SearchLimits, report: bool) -> SearchResult {
        let start = Instant::now();
        self.gen = (self.gen + 1) & 63;
        self.stop.store(false, Relaxed);
        if self.helpers.is_empty() {
            return self.search_thread(board, history, limits, report, start, &[]);
        }
        let mut helpers = std::mem::take(&mut self.helpers);
        let helper_nodes: Vec<Arc<AtomicU64>> = helpers.iter().map(|h| h.nodes_pub.clone()).collect();
        let helper_limits = SearchLimits { nodes: None, ..limits.clone() };
        let log = std::env::var_os("ENGINE_TIMELOG").is_some();
        let mut stop_at = start;
        let (main_result, helper_results) = std::thread::scope(|scope| {
            let mut handles = Vec::with_capacity(helpers.len());
            for h in helpers.iter_mut() {
                h.gen = self.gen;
                h.nodes_pub.store(0, Relaxed);
                let hl = &helper_limits;
                let handle = std::thread::Builder::new()
                    .stack_size(HELPER_STACK)
                    .spawn_scoped(scope, move || h.search_thread(board, history, hl, false, start, &[]))
                    .expect("spawn search thread");
                handles.push(handle);
            }
            let r = self.search_thread(board, history, limits, report, start, &helper_nodes);
            self.stop.store(true, Relaxed);
            stop_at = Instant::now();
            let hs: Vec<SearchResult> = handles.into_iter().map(|h| h.join().expect("search thread")).collect();
            (r, hs)
        });
        self.helpers = helpers;
        if log {
            eprintln!("timelog smp join_ms {:.3}", stop_at.elapsed().as_secs_f64() * 1000.0);
        }
        let mut result = main_result;
        let mut total = result.nodes;
        let mut chosen_depth = result.depth;
        for h in &helper_results {
            total += h.nodes;
            if PREFER_DEEPER_HELPER && h.depth > chosen_depth && h.best_move.is_some() {
                chosen_depth = h.depth;
                result.best_move = h.best_move;
                result.score = h.score;
                result.depth = h.depth;
            }
        }
        result.nodes = total;
        result
    }

    /// Iterative deepening on this thread. Helpers skip depths by their id
    /// (diversification) and report nothing.
    fn search_thread(
        &mut self,
        board: &Board,
        history: &[u64],
        limits: &SearchLimits,
        report: bool,
        start: Instant,
        helper_nodes: &[Arc<AtomicU64>],
    ) -> SearchResult {
        self.root_color = board.side_to_move();
        self.start = start;
        self.nodes = 0;
        self.stopped = false;
        self.node_limit = limits.nodes;
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
        self.psq_stack[0] = eval::psq(board);
        // Killers are position-specific; history carries over, aged.
        self.killers = [[None; 2]; MAX_PLY];
        for h in self.history.iter_mut().flatten().flatten() {
            *h /= 2;
        }
        let max_depth = limits.depth.unwrap_or(MAX_PLY as u8 - 1).min(MAX_PLY as u8 - 1);

        let mut best_move: Option<Move> = first_legal_move(board);
        let mut best_score = 0;
        let mut completed_depth = 0;

        let log = self.thread_id == 0 && std::env::var_os("ENGINE_TIMELOG").is_some();
        let mut total_researches = 0u32;
        let mut iter_start = self.start.elapsed();
        for depth in 1..=max_depth {
            // Helper diversification: odd helpers skip every odd depth past
            // the first few, so they run one ply ahead of the main thread.
            if self.thread_id % 2 == 1 && depth > 1 && depth < max_depth && depth % 2 == 1 {
                continue;
            }
            if self.stop.load(Relaxed) {
                break;
            }
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
                let all = self.nodes + helper_nodes.iter().map(|n| n.load(Relaxed)).sum::<u64>();
                self.report(board, depth, score, all);
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
        self.nodes_pub.store(self.nodes, Relaxed);
        SearchResult { best_move, score: best_score, depth: completed_depth, nodes: self.nodes }
    }

    fn report(&self, board: &Board, depth: u8, score: i32, nodes: u64) {
        let ms = self.start.elapsed().as_millis().max(1);
        let nps = nodes as u128 * 1000 / ms;
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
            "info depth {depth} score {score_str} nodes {nodes} nps {nps} time {ms} pv {pv}"
        );
    }

    /// Static evaluation of `board` at `ply`, using the incremental
    /// material + piece-square sums of the current path.
    #[inline]
    fn evaluate(&self, board: &Board, ply: usize) -> i32 {
        let (mg, eg) = self.psq_stack[ply];
        eval::evaluate_with(board, mg, eg)
    }

    /// Material + piece-square sums of the child reached by `mv` from `board` at `ply`.
    #[inline]
    fn set_child_psq(&mut self, board: &Board, mv: Move, ply: usize) {
        let (mg, eg) = self.psq_stack[ply];
        let (dm, de) = eval::psq_delta(board, mv);
        self.psq_stack[ply + 1] = (mg + dm, eg + de);
    }

    #[inline]
    fn check_stop(&mut self) -> bool {
        if self.stopped {
            return true;
        }
        if self.stop.load(Relaxed) {
            self.stopped = true;
            return true;
        }
        if self.nodes & NODE_CHECK_MASK == 0 {
            self.nodes_pub.store(self.nodes, Relaxed);
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

    /// A draw from the side to move's view, with contempt for the engine's side.
    fn draw_score(&self, board: &Board) -> i32 {
        if board.side_to_move() == self.root_color { -CONTEMPT } else { CONTEMPT }
    }

    fn is_repetition(&self, hash: u64, halfmove_clock: u8) -> bool {
        // A single earlier occurrence already scores the line as a draw:
        // that is what the opponent can force, and it keeps the search cheap.
        // A null move pushes NULL_BARRIER: positions before it are not
        // reachable repetitions of positions after it. Nothing before the
        // last capture or pawn move (halfmove clock) can repeat either.
        self.stack
            .iter()
            .rev()
            .skip(1)
            .take(halfmove_clock as usize)
            .take_while(|&&h| h != NULL_BARRIER)
            .any(|&h| h == hash)
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
        if ply > 0 && (board.halfmove_clock() >= 100 || self.is_repetition(board.hash(), board.halfmove_clock())) {
            return self.draw_score(board);
        }
        if ply >= MAX_PLY - 1 {
            return self.evaluate(board, ply);
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
        let static_eval = if in_check { -INF } else { self.evaluate(board, ply) };
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
                    self.psq_stack[ply + 1] = self.psq_stack[ply];
                    self.move_stack[ply] = None;
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
        let counter = if ply > 0 {
            self.move_stack[ply - 1].and_then(|(p, to)| self.countermoves[p as usize][to as usize])
        } else {
            None
        };
        let mut picker = MovePicker::new(board, false, hash_move, killers, counter);
        let mut quiets_seen = 0i32;
        // Quiet moves searched so far (history malus on a later cutoff).
        let mut quiets_tried: [Option<Move>; 64] = [None; 64];
        let mut n_quiets_tried = 0usize;
        let alpha_orig = alpha;
        let mut best = -INF;
        let mut best_move = None;
        let mut i = 0usize;
        // Squares/pieces from which a quiet move could give check; built
        // on the first move that is otherwise prunable.
        let mut checks: Option<CheckInfo> = None;
        while let Some((mv, quiet)) = picker.next(board, &self.history[side]) {
            i += 1;
            let i = i - 1;
            // Frontier pruning of late quiet moves (LMP and futility) that
            // do not give check. Whether a move gives check is decided
            // without playing it when it clearly cannot.
            let prunable = i > 0
                && !pv_node
                && !in_check
                && quiet
                && best > -MATE + MAX_PLY as i32
                && !killers.contains(&Some(mv))
                && {
                    let lmp_limit = if improving { LMP_BASE + depth * depth } else { (LMP_BASE + depth * depth) / 2 };
                    let lmp = depth <= LMP_MAX_DEPTH && quiets_seen >= lmp_limit;
                    let futile = depth <= 3 && static_eval + FUT_MARGIN[depth as usize] <= alpha;
                    lmp || futile
                };
            if prunable && !checks.get_or_insert_with(|| CheckInfo::new(board)).may_check(board, mv) {
                continue;
            }
            let mut child = board.clone();
            child.play_unchecked(mv);
            let gives_check = !child.checkers().is_empty();
            if prunable && !gives_check {
                continue;
            }
            let child_hash = child.hash();
            self.tt_prefetch(child_hash);
            self.stack.push(child_hash);
            if quiet {
                quiets_seen += 1;
            }
            self.set_child_psq(board, mv, ply);
            let moved = board.piece_on(mv.from).unwrap_or(Piece::Pawn);
            self.move_stack[ply] = Some(((moved as u8) * 2 + side as u8, mv.to as u8));
            // PVS: full window for the first move, a null window for the
            // rest, re-searched only if one unexpectedly beats alpha. Late
            // quiet moves are first searched shallower (LMR).
            let mut score;
            if i == 0 {
                score = -self.negamax(&child, depth - 1, -beta, -alpha, ply + 1, true);
            } else {
                let mut r = 0;
                if depth >= LMR_MIN_DEPTH && quiet && !in_check {
                    let mut r1024 = self.lmr[(depth as usize).min(63)][i.min(63)];
                    if pv_node {
                        r1024 -= 1024;
                    }
                    if !improving {
                        r1024 += 1024;
                    }
                    if gives_check {
                        r1024 -= 1024;
                    }
                    if killers.contains(&Some(mv)) || counter == Some(mv) {
                        r1024 -= 1024;
                    }
                    r1024 -= self.history[side][mv.from as usize][mv.to as usize] * 1024 / LMR_HISTORY_PER_PLY;
                    // Never below zero, and never straight into quiescence.
                    r = (r1024 / 1024).clamp(0, depth - 2);
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
            if quiet && score < beta && n_quiets_tried < quiets_tried.len() {
                quiets_tried[n_quiets_tried] = Some(mv);
                n_quiets_tried += 1;
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
                            let bonus = (HIST_MUL * depth * depth).min(HIST_CAP);
                            history_update(&mut self.history[side][mv.from as usize][mv.to as usize], bonus);
                            for q in quiets_tried[..n_quiets_tried].iter().flatten() {
                                history_update(&mut self.history[side][q.from as usize][q.to as usize], -bonus);
                            }
                            if ply > 0 {
                                if let Some((p, to)) = self.move_stack[ply - 1] {
                                    self.countermoves[p as usize][to as usize] = Some(mv);
                                }
                            }
                        }
                        break;
                    }
                }
            }
        }
        if i == 0 {
            return if in_check { -MATE + ply as i32 } else { self.draw_score(board) };
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
        let stand_pat = if in_check { -MATE + ply as i32 } else { self.evaluate(board, ply) };
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
            return if in_check { self.evaluate(board, ply) } else { stand_pat };
        }
        let mut best = stand_pat;
        let mut best_move = None;
        let enemy = board.colors(!board.side_to_move());
        let mut picker = MovePicker::new(board, !in_check, hash_move, [None; 2], None);
        while let Some((mv, _)) = picker.next(board, &EMPTY_HISTORY) {
            if !in_check {
                // Delta pruning: even winning the victim (and promoting) with
                // a margin to spare cannot lift the score to alpha.
                let victim = if enemy.has(mv.to) { board.piece_on(mv.to).map_or(0, eval::piece_value) } else { eval::PAWN };
                let promo = mv.promotion.map_or(0, |p| eval::piece_value(p) - eval::PAWN);
                if stand_pat + victim + promo + DELTA_MARGIN <= alpha {
                    continue;
                }
                // Skip captures that lose material outright.
                if !see_ge(board, mv, 0) {
                    continue;
                }
            }
            let mut child = board.clone();
            child.play_unchecked(mv);
            self.set_child_psq(board, mv, ply);
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

/// LMR table [depth][move index] in 1/1024 ply: LMR_BASE + ln(d) * ln(i) / LMR_DIVISOR
/// (zero at index 0 and depth 0).
fn lmr_table() -> [[i32; 64]; 64] {
    let mut t = [[0; 64]; 64];
    for (d, row) in t.iter_mut().enumerate().skip(1) {
        for (i, r) in row.iter_mut().enumerate().skip(1) {
            let v = LMR_BASE + (d as f64).ln() * (i as f64).ln() / LMR_DIVISOR;
            *r = (v * 1024.0) as i32;
        }
    }
    t
}

fn first_legal_move(board: &Board) -> Option<Move> {
    let mut first = None;
    board.generate_moves(|moves| {
        first = moves.into_iter().next();
        true
    });
    first
}

/// What a quiet move needs in order to give check, from the side to move's
/// view: the enemy king's square and our pieces that alone block one of our
/// sliders from it (moving one may discover check).
struct CheckInfo {
    king: Square,
    discoverers: BitBoard,
}

impl CheckInfo {
    fn new(board: &Board) -> Self {
        let us = board.side_to_move();
        let ours = board.colors(us);
        let king = board.king(!us);
        let occ = board.occupied();
        let queens = board.pieces(Piece::Queen);
        let diag = (board.pieces(Piece::Bishop) | queens) & ours & get_bishop_rays(king);
        let orth = (board.pieces(Piece::Rook) | queens) & ours & get_rook_rays(king);
        let mut discoverers = BitBoard::EMPTY;
        for s in diag | orth {
            let between = get_between_rays(s, king) & occ;
            if between.len() == 1 {
                discoverers |= between & ours;
            }
        }
        CheckInfo { king, discoverers }
    }

    /// Conservative: false only if the quiet (non-capture, non-promotion)
    /// legal move `mv` certainly does not give check.
    #[inline]
    fn may_check(&self, board: &Board, mv: Move) -> bool {
        if self.discoverers.has(mv.from) {
            return true;
        }
        let us = board.side_to_move();
        let occ = board.occupied() ^ mv.from.bitboard();
        let k = self.king;
        match board.piece_on(mv.from) {
            Some(Piece::Pawn) => get_pawn_attacks(mv.to, us).has(k),
            Some(Piece::Knight) => get_knight_moves(mv.to).has(k),
            Some(Piece::Bishop) => get_bishop_moves(k, occ).has(mv.to),
            Some(Piece::Rook) => get_rook_moves(k, occ).has(mv.to),
            Some(Piece::Queen) => (get_bishop_moves(k, occ) | get_rook_moves(k, occ)).has(mv.to),
            // Castling (king takes own rook) can check with the rook.
            Some(Piece::King) => board.colors(us).has(mv.to),
            None => true,
        }
    }
}

/// Upper bound on the number of legal moves in a chess position (218) with slack.
const MAX_MOVES: usize = 256;

/// Staged, allocation-free move picker. Stages: the hash move (checked for
/// legality, searched before any generation), then "noisy" moves (captures,
/// en passant, every capture-promotion and non-capture queen promotions) by
/// MVV-LVA, then (unless `noisy_only`) quiet moves: killers, countermove,
/// history, and the non-capture underpromotions last, then the captures that
/// lose material by SEE (in MVV-LVA order). Losing captures are recognised
/// lazily, when the noisy stage picks them, and set aside at the front of
/// the buffer (over slots already consumed). With `noisy_only` (quiescence)
/// no SEE is done here; the caller prunes. Each stage is consumed by
/// selection (pick the best remaining), since most nodes cut off after a
/// move or two.
struct MovePicker {
    stage: u8,
    noisy_only: bool,
    hash_move: Option<Move>,
    killers: [Option<Move>; 2],
    counter: Option<Move>,
    /// Losing captures set aside in buf[0..n_bad]; `bad_cur` walks them.
    n_bad: usize,
    bad_cur: usize,
    /// Per-piece destination sets from one legal-move generation.
    pieces: [MaybeUninit<PieceMoves>; 18],
    n_pieces: usize,
    /// The king's moves were not generated with the other pieces.
    king_deferred: bool,
    buf: [MaybeUninit<(Move, i32)>; MAX_MOVES],
    len: usize,
    cur: usize,
    /// Index where the current stage's moves begin.
    stage_start: usize,
    /// The rest of the current stage is already in order.
    sorted: bool,
    enemy: BitBoard,
    ep_bb: BitBoard,
}

/// Picks per stage made by selection before the rest of the stage is sorted.
const SELECT_PICKS: usize = 3;

/// Stable descending insertion sort by key (lists are short).
fn insertion_sort_desc(v: &mut [(Move, i32)]) {
    for i in 1..v.len() {
        let x = v[i];
        let mut j = i;
        while j > 0 && v[j - 1].1 < x.1 {
            v[j] = v[j - 1];
            j -= 1;
        }
        v[j] = x;
    }
}

const STAGE_HASH: u8 = 0;
const STAGE_GEN_NOISY: u8 = 1;
const STAGE_NOISY: u8 = 2;
const STAGE_GEN_QUIET: u8 = 3;
const STAGE_QUIET: u8 = 4;
const STAGE_BAD: u8 = 5;
const STAGE_DONE: u8 = 6;

const PROMO_RANKS: BitBoard = BitBoard(Rank::First.bitboard().0 | Rank::Eighth.bitboard().0);

impl MovePicker {
    #[inline(always)]
    fn new(
        board: &Board,
        noisy_only: bool,
        hash_move: Option<Move>,
        killers: [Option<Move>; 2],
        counter: Option<Move>,
    ) -> Self {
        let us = board.side_to_move();
        let ep_bb = match board.en_passant() {
            Some(file) => Square::new(file, Rank::Sixth.relative_to(us)).bitboard(),
            None => BitBoard::EMPTY,
        };
        MovePicker {
            stage: STAGE_HASH,
            noisy_only,
            hash_move,
            killers,
            counter,
            n_bad: 0,
            bad_cur: 0,
            // SAFETY: an array of MaybeUninit needs no initialization.
            pieces: unsafe { MaybeUninit::uninit().assume_init() },
            n_pieces: 0,
            king_deferred: false,
            buf: unsafe { MaybeUninit::uninit().assume_init() },
            len: 0,
            cur: 0,
            stage_start: 0,
            sorted: false,
            enemy: board.colors(!us),
            ep_bb,
        }
    }

    #[inline(always)]
    fn push(&mut self, mv: Move, key: i32) {
        debug_assert!(self.len < MAX_MOVES);
        self.buf[self.len] = MaybeUninit::new((mv, key));
        self.len += 1;
    }

    /// Next move of the current stage in key order (ties in generation
    /// order). The first few come by selection, since most nodes cut off
    /// early; the rest of a stage that goes on is sorted once.
    #[inline(always)]
    fn pick(&mut self) -> Option<Move> {
        if self.cur >= self.len {
            return None;
        }
        // SAFETY: entries [0, len) were written by push().
        let buf = unsafe { std::slice::from_raw_parts_mut(self.buf.as_mut_ptr() as *mut (Move, i32), self.len) };
        if !self.sorted {
            if self.cur - self.stage_start < SELECT_PICKS {
                let mut best = self.cur;
                let mut best_key = buf[best].1;
                for j in self.cur + 1..self.len {
                    if buf[j].1 > best_key {
                        best_key = buf[j].1;
                        best = j;
                    }
                }
                // Keep the others in order (stable), as a sort would.
                let m = buf[best];
                let mut j = best;
                while j > self.cur {
                    buf[j] = buf[j - 1];
                    j -= 1;
                }
                buf[self.cur] = m;
            } else {
                insertion_sort_desc(&mut buf[self.cur..]);
                self.sorted = true;
            }
        }
        let mv = buf[self.cur].0;
        self.cur += 1;
        Some(mv)
    }

    /// Next move, and whether it is quiet (no capture, en passant or promotion).
    fn next(&mut self, board: &Board, history: &[[i32; 64]; 64]) -> Option<(Move, bool)> {
        loop {
            match self.stage {
                STAGE_HASH => {
                    self.stage = STAGE_GEN_NOISY;
                    if let Some(hm) = self.hash_move {
                        if board.is_legal(hm) {
                            let is_ep = self.ep_bb.has(hm.to) && board.pieces(Piece::Pawn).has(hm.from);
                            let noisy = self.enemy.has(hm.to) || is_ep || hm.promotion.is_some();
                            if self.noisy_only && !noisy_qs(self.enemy.has(hm.to) || is_ep, hm) {
                                // Not a move this search would generate.
                                self.hash_move = None;
                                continue;
                            }
                            return Some((hm, !noisy));
                        }
                        self.hash_move = None;
                    }
                }
                STAGE_GEN_NOISY => {
                    self.gen_noisy(board);
                    self.stage = STAGE_NOISY;
                }
                STAGE_NOISY => {
                    if let Some(mv) = self.pick() {
                        // In the main search a capture that loses material goes last.
                        if !self.noisy_only && self.is_capture(board, mv) && !see_ge(board, mv, 0) {
                            // SAFETY: n_bad < cur <= len; slot cur - 1 holds mv.
                            let e = unsafe { self.buf[self.cur - 1].assume_init() };
                            self.buf[self.n_bad] = MaybeUninit::new(e);
                            self.n_bad += 1;
                            continue;
                        }
                        return Some((mv, false));
                    }
                    self.stage = if self.noisy_only { STAGE_DONE } else { STAGE_GEN_QUIET };
                }
                STAGE_GEN_QUIET => {
                    self.stage_start = self.len;
                    self.sorted = false;
                    self.gen_quiet(board, history);
                    self.stage = STAGE_QUIET;
                }
                STAGE_QUIET => {
                    if let Some(mv) = self.pick() {
                        return Some((mv, mv.promotion.is_none()));
                    }
                    self.stage = STAGE_BAD;
                }
                STAGE_BAD => {
                    if self.bad_cur < self.n_bad {
                        // SAFETY: entries [0, n_bad) were written in STAGE_NOISY.
                        let (mv, _) = unsafe { self.buf[self.bad_cur].assume_init() };
                        self.bad_cur += 1;
                        return Some((mv, false));
                    }
                    self.stage = STAGE_DONE;
                }
                _ => return None,
            }
        }
    }

    /// Does `mv` (a noisy move of this position) take something?
    #[inline]
    fn is_capture(&self, board: &Board, mv: Move) -> bool {
        self.enemy.has(mv.to) || (self.ep_bb.has(mv.to) && board.pieces(Piece::Pawn).has(mv.from))
    }

    fn gen_noisy(&mut self, board: &Board) {
        let enemy = self.enemy;
        let ep_bb = self.ep_bb;
        // Out of check the king is left out of the legal generator: its
        // generation tests every destination for safety (and castling),
        // which quiescence never needs. King captures are tested here one
        // by one and its quiet moves are generated in the quiet stage.
        let in_check = !board.checkers().is_empty();
        let king = board.king(board.side_to_move());
        let mask = if in_check { BitBoard::FULL } else { !king.bitboard() };
        let pieces = &mut self.pieces;
        let mut n = 0;
        board.generate_moves_for(mask, |pm| {
            pieces[n] = MaybeUninit::new(pm);
            n += 1;
            false
        });
        self.n_pieces = n;
        self.king_deferred = !in_check;
        if !in_check {
            for to in get_king_moves(king) & enemy {
                let mv = Move { from: king, to, promotion: None };
                if Some(mv) != self.hash_move && board.is_legal(mv) {
                    if let Some(v) = board.piece_on(to) {
                        self.push(mv, KEY_CAPTURE + 10 * eval::piece_value(v));
                    }
                }
            }
        }
        for k in 0..n {
            // SAFETY: the first n entries were written above.
            let pm = unsafe { self.pieces[k].assume_init() };
            let attacker = pm.piece;
            let targets = if attacker == Piece::Pawn { pm.to & (enemy | ep_bb | PROMO_RANKS) } else { pm.to & enemy };
            if targets.is_empty() {
                continue;
            }
            let attacker_value = eval::piece_value(attacker);
            for mv in (PieceMoves { piece: attacker, from: pm.from, to: targets }) {
                let victim = if enemy.has(mv.to) {
                    board.piece_on(mv.to)
                } else if attacker == Piece::Pawn && ep_bb.has(mv.to) {
                    Some(Piece::Pawn)
                } else {
                    None
                };
                let mut key = 0;
                match victim {
                    Some(v) => key += KEY_CAPTURE + 10 * eval::piece_value(v) - attacker_value,
                    // Non-capture promotion: only the queen is noisy.
                    None if mv.promotion != Some(Piece::Queen) => continue,
                    None => {}
                }
                if let Some(p) = mv.promotion {
                    key += if p == Piece::Queen { KEY_QUEEN_PROMO } else { KEY_UNDERPROMO };
                }
                if Some(mv) == self.hash_move {
                    continue;
                }
                self.push(mv, key);
            }
        }
    }

    fn gen_quiet(&mut self, board: &Board, history: &[[i32; 64]; 64]) {
        let enemy = self.enemy;
        let ep_bb = self.ep_bb;
        if self.king_deferred {
            let pieces = &mut self.pieces;
            let mut n = self.n_pieces;
            board.generate_moves_for(board.king(board.side_to_move()).bitboard(), |pm| {
                pieces[n] = MaybeUninit::new(pm);
                n += 1;
                false
            });
            self.n_pieces = n;
        }
        for k in 0..self.n_pieces {
            // SAFETY: the first n_pieces entries were written by gen_noisy.
            let pm = unsafe { self.pieces[k].assume_init() };
            let targets = if pm.piece == Piece::Pawn { pm.to & !enemy & !ep_bb } else { pm.to & !enemy };
            if targets.is_empty() {
                continue;
            }
            for mv in (PieceMoves { piece: pm.piece, from: pm.from, to: targets }) {
                let key = match mv.promotion {
                    Some(Piece::Queen) => continue, // already noisy
                    Some(_) => KEY_UNDERPROMO,
                    None => {
                        if Some(mv) == self.killers[0] {
                            KEY_KILLER0
                        } else if Some(mv) == self.killers[1] {
                            KEY_KILLER1
                        } else if Some(mv) == self.counter {
                            KEY_COUNTER
                        } else {
                            history[mv.from as usize][mv.to as usize]
                        }
                    }
                };
                if Some(mv) == self.hash_move {
                    continue;
                }
                self.push(mv, key);
            }
        }
    }
}

/// Would the quiescence generator (captures + queen promotions) produce `mv`?
#[inline]
fn noisy_qs(is_capture: bool, mv: Move) -> bool {
    is_capture || mv.promotion == Some(Piece::Queen)
}

/// Piece values used by the exchange evaluator; the king is "infinite" so
/// a king can only be the last piece in an exchange.
#[inline]
fn see_value(piece: Piece) -> i32 {
    match piece {
        Piece::King => 20_000,
        p => eval::piece_value(p),
    }
}

/// Every piece of either colour that attacks `sq` given the occupancy `occ`.
#[inline]
fn attackers_to(board: &Board, sq: Square, occ: BitBoard) -> BitBoard {
    let bishops = board.pieces(Piece::Bishop) | board.pieces(Piece::Queen);
    let rooks = board.pieces(Piece::Rook) | board.pieces(Piece::Queen);
    let pawns = board.pieces(Piece::Pawn);
    (get_pawn_attacks(sq, Color::White) & pawns & board.colors(Color::Black))
        | (get_pawn_attacks(sq, Color::Black) & pawns & board.colors(Color::White))
        | (get_knight_moves(sq) & board.pieces(Piece::Knight))
        | (get_king_moves(sq) & board.pieces(Piece::King))
        | (get_bishop_moves(sq, occ) & bishops)
        | (get_rook_moves(sq, occ) & rooks)
}

/// Static exchange evaluation, threshold form: does playing `mv` and then
/// letting both sides recapture on the target square with their least
/// valuable attacker (either side may stop when continuing loses) gain at
/// least `threshold` centipawns for the mover? Pins are ignored; x-ray
/// attackers behind a capturing slider or pawn join in as it leaves.
fn see_ge(board: &Board, mv: Move, threshold: i32) -> bool {
    let us = board.side_to_move();
    let (from, to) = (mv.from, mv.to);
    let Some(mover) = board.piece_on(from) else { return true };
    // Castling is encoded as the king taking its own rook.
    if mover == Piece::King && board.colors(us).has(to) {
        return threshold <= 0;
    }
    let mut occ = board.occupied();
    let mut gain = match board.piece_on(to) {
        Some(p) => see_value(p),
        None if mover == Piece::Pawn && from.file() != to.file() => {
            // En passant: the captured pawn is not on the target square.
            occ ^= Square::new(to.file(), from.rank()).bitboard();
            eval::PAWN
        }
        None => 0,
    };
    let mut on_square = mover;
    if let Some(p) = mv.promotion {
        gain += see_value(p) - eval::PAWN;
        on_square = p;
    }
    // Balance from the mover's view, first assuming the piece now on the
    // square is lost for nothing.
    let mut balance = gain - threshold;
    if balance < 0 {
        return false;
    }
    balance -= see_value(on_square);
    if balance >= 0 {
        return true;
    }
    occ = (occ ^ from.bitboard()) | to.bitboard();
    let diag = board.pieces(Piece::Bishop) | board.pieces(Piece::Queen);
    let straight = board.pieces(Piece::Rook) | board.pieces(Piece::Queen);
    let mut attackers = attackers_to(board, to, occ) & occ;
    let mut side = !us;
    loop {
        let mine = attackers & board.colors(side);
        if mine.is_empty() {
            break;
        }
        let mut piece = Piece::King;
        let mut from_sq = None;
        for p in [Piece::Pawn, Piece::Knight, Piece::Bishop, Piece::Rook, Piece::Queen, Piece::King] {
            let set = mine & board.pieces(p);
            if let Some(sq) = set.next_square() {
                piece = p;
                from_sq = Some(sq);
                break;
            }
        }
        let sq = from_sq.unwrap();
        occ ^= sq.bitboard();
        if matches!(piece, Piece::Pawn | Piece::Bishop | Piece::Queen) {
            attackers |= get_bishop_moves(to, occ) & diag;
        }
        if matches!(piece, Piece::Rook | Piece::Queen) {
            attackers |= get_rook_moves(to, occ) & straight;
        }
        attackers &= occ;
        side = !side;
        // Now from `side`'s view: it lost the capturer's victim, and assume
        // the capturer is lost in turn.
        balance = -balance - 1 - see_value(piece);
        if balance >= 0 {
            // A king cannot capture into a still-defended square.
            if piece == Piece::King && !(attackers & board.colors(side)).is_empty() {
                side = !side;
            }
            break;
        }
    }
    // The side left to move is the one that lost the exchange.
    side != us
}

#[cfg(test)]
mod see_tests {
    use super::*;

    fn see(fen: &str, uci: &str, t: i32) -> bool {
        let b = Board::from_fen(fen, false).unwrap();
        let mv = cozy_chess::util::parse_uci_move(&b, uci).unwrap();
        see_ge(&b, mv, t)
    }

    #[test]
    fn exchanges() {
        // Rook takes an undefended pawn: +100.
        let f = "1k1r4/1pp4p/p7/4p3/8/P5P1/1PP4P/2K1R3 w - - 0 1";
        assert!(see(f, "e1e5", 100));
        assert!(!see(f, "e1e5", 101));
        // Knight takes a pawn defended by a pawn: 100 - 320.
        let f = "4k3/8/3p4/4p3/8/5N2/8/4K3 w - - 0 1";
        assert!(see(f, "f3e5", -220));
        assert!(!see(f, "f3e5", -219));
        // Pawn takes a knight defended by a pawn: +320 - 100.
        let f = "4k3/8/3p4/4n3/3P4/8/8/4K3 w - - 0 1";
        assert!(see(f, "d4e5", 220));
        assert!(!see(f, "d4e5", 221));
        // Rook takes a rook with a queen x-raying behind: RxR, RxR, QxR = +500 for the attacker.
        let f = "3r2k1/8/8/8/3r4/8/3R4/3Q2K1 w - - 0 1";
        assert!(see(f, "d2d4", 0));
        // Queen takes a pawn defended by a rook: loses.
        assert!(!see("3r2k1/3p4/8/8/8/8/8/3Q2K1 w - - 0 1", "d1d7", 0));
        // King cannot take a defended piece.
        assert!(!see("4k3/8/8/8/8/3n4/1p6/K7 w - - 0 1", "a1b2", 0));
        assert!(see("4k3/8/8/8/8/8/1p6/K7 w - - 0 1", "a1b2", 100));
        // En passant equal trade.
        assert!(see("4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1", "e5d6", 100));
        // Quiet move into a pawn attack loses the piece.
        assert!(!see("4k3/8/4p3/8/8/8/8/2B1K3 w - - 0 1", "c1f5", 0));
    }
}
