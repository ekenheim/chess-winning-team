//! UCI front end. The arena only knows this contract: it starts the binary,
//! sends `position ...` / `go movetime N`, and reads `info ...` / `bestmove`.

mod eval;
mod search;

use cozy_chess::{util, Board};
use std::io::{self, BufRead, Write};
use std::time::{Duration, Instant};

use search::{SearchLimits, Searcher};

const NAME: &str = "chess-winning-team";
const AUTHOR: &str = "Erik Adolfsson + Claude";

struct Game {
    board: Board,
    /// Zobrist hashes of every position reached in the game, for repetition detection.
    history: Vec<u64>,
}

impl Game {
    fn new() -> Self {
        let board = Board::default();
        let history = vec![board.hash()];
        Game { board, history }
    }

    fn set_position(&mut self, tokens: &[&str]) {
        let mut i = 0;
        if tokens.get(i) == Some(&"startpos") {
            self.board = Board::default();
            i += 1;
        } else if tokens.get(i) == Some(&"fen") {
            let fen: Vec<&str> = tokens[i + 1..]
                .iter()
                .take_while(|t| **t != "moves")
                .copied()
                .collect();
            i += 1 + fen.len();
            match Board::from_fen(&fen.join(" "), false) {
                Ok(b) => self.board = b,
                Err(_) => {
                    eprintln!("bad fen: {}", fen.join(" "));
                    self.board = Board::default();
                }
            }
        }
        self.history.clear();
        self.history.push(self.board.hash());
        if tokens.get(i) == Some(&"moves") {
            for mv in &tokens[i + 1..] {
                match util::parse_uci_move(&self.board, mv) {
                    Ok(m) => {
                        self.board.play(m);
                        self.history.push(self.board.hash());
                    }
                    Err(_) => eprintln!("illegal move in position: {mv}"),
                }
            }
        }
    }
}

fn parse_go(tokens: &[&str], side_white: bool) -> SearchLimits {
    let mut limits = SearchLimits::default();
    let mut wtime = None;
    let mut btime = None;
    let mut winc = 0u64;
    let mut binc = 0u64;
    let mut movestogo = None;
    let mut i = 0;
    while i < tokens.len() {
        let val = tokens.get(i + 1).and_then(|v| v.parse::<u64>().ok());
        match tokens[i] {
            "movetime" => limits.move_time = val.map(Duration::from_millis),
            "depth" => limits.depth = val.map(|d| d as u8),
            "nodes" => limits.nodes = val,
            "wtime" => wtime = val,
            "btime" => btime = val,
            "winc" => winc = val.unwrap_or(0),
            "binc" => binc = val.unwrap_or(0),
            "movestogo" => movestogo = val,
            "infinite" => limits.infinite = true,
            _ => {}
        }
        i += 1;
    }
    if limits.move_time.is_none() {
        let (time, inc) = if side_white { (wtime, winc) } else { (btime, binc) };
        if let Some(t) = time {
            // Simple clock-based budget; the competition uses movetime so this
            // path only matters for casual play.
            let mtg = movestogo.unwrap_or(30).max(1);
            let budget = (t / mtg + inc / 2).min(t.saturating_sub(50).max(1));
            limits.move_time = Some(Duration::from_millis(budget));
        }
    }
    limits
}

/// Fixed positions for `bench`: a quick, deterministic speed check
/// (`make profile`). Reports total nodes and nodes per second.
const BENCH_FENS: &[&str] = &[
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1",
    "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1",
    "r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1",
    "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8",
    "r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10",
    "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
];

fn bench(depth: u8) {
    let start = Instant::now();
    let mut total_nodes = 0u64;
    for fen in BENCH_FENS {
        let board = Board::from_fen(fen, false).expect("bench fen");
        let mut searcher = Searcher::new();
        let limits = SearchLimits { depth: Some(depth), ..Default::default() };
        let result = searcher.search(&board, &[board.hash()], &limits, false);
        total_nodes += result.nodes;
    }
    let secs = start.elapsed().as_secs_f64();
    println!(
        "bench depth {depth}: {total_nodes} nodes in {secs:.3}s = {:.0} nps",
        total_nodes as f64 / secs.max(1e-9)
    );
}

fn main() {
    let stdin = io::stdin();
    let mut out = io::stdout();
    let mut game = Game::new();

    // Allow `engine bench [depth]` from the command line for `make profile`.
    let args: Vec<String> = std::env::args().collect();
    if args.get(1).map(String::as_str) == Some("bench") {
        let depth = args.get(2).and_then(|d| d.parse().ok()).unwrap_or(7);
        bench(depth);
        return;
    }

    for line in stdin.lock().lines() {
        let line = match line {
            Ok(l) => l,
            Err(_) => break,
        };
        let tokens: Vec<&str> = line.split_whitespace().collect();
        let Some(&cmd) = tokens.first() else { continue };
        match cmd {
            "uci" => {
                println!("id name {NAME}");
                println!("id author {AUTHOR}");
                println!("uciok");
            }
            "isready" => println!("readyok"),
            "ucinewgame" => game = Game::new(),
            "position" => game.set_position(&tokens[1..]),
            "go" => {
                let white = game.board.side_to_move() == cozy_chess::Color::White;
                let limits = parse_go(&tokens[1..], white);
                let mut searcher = Searcher::new();
                let result = searcher.search(&game.board, &game.history, &limits, true);
                match result.best_move {
                    Some(mv) => println!("bestmove {}", util::display_uci_move(&game.board, mv)),
                    None => println!("bestmove 0000"),
                }
            }
            "bench" => {
                let depth = tokens.get(1).and_then(|d| d.parse().ok()).unwrap_or(7);
                bench(depth);
            }
            "d" => {
                println!("{}", game.board);
                println!("hash {:016x}", game.board.hash());
            }
            "eval" => println!("eval {}", eval::evaluate(&game.board)),
            "stop" => {}
            "quit" => break,
            _ => eprintln!("unknown command: {line}"),
        }
        let _ = out.flush();
    }
}
