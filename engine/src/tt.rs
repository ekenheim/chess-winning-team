//! Transposition table: a fixed-size, always-replace hash table keyed by the
//! Zobrist hash of the position. Stores the search result (score bound and
//! depth) and the best move, which is used first in move ordering.

use cozy_chess::{Move, Piece, Square};

pub const TT_MB: usize = 64;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u8)]
pub enum Bound {
    None = 0,
    Exact = 1,
    Lower = 2,
    Upper = 3,
}

#[derive(Clone, Copy, Debug)]
#[repr(C)]
pub struct Entry {
    pub key: u64,
    pub mv: u16,
    pub score: i16,
    pub depth: u8,
    pub bound: Bound,
}

impl Entry {
    const EMPTY: Entry = Entry { key: 0, mv: 0, score: 0, depth: 0, bound: Bound::None };
}

pub struct Table {
    entries: Vec<Entry>,
    mask: usize,
}

impl Table {
    pub fn new(megabytes: usize) -> Self {
        let bytes = megabytes * 1024 * 1024;
        let n = (bytes / std::mem::size_of::<Entry>()).next_power_of_two() / 2;
        Table { entries: vec![Entry::EMPTY; n.max(1024)], mask: n.max(1024) - 1 }
    }

    pub fn clear(&mut self) {
        self.entries.fill(Entry::EMPTY);
    }

    #[inline]
    pub fn probe(&self, key: u64) -> Option<&Entry> {
        let e = &self.entries[(key as usize) & self.mask];
        if e.key == key && e.bound != Bound::None {
            Some(e)
        } else {
            None
        }
    }

    #[inline]
    pub fn store(&mut self, key: u64, mv: Option<Move>, score: i32, depth: i32, bound: Bound) {
        let e = &mut self.entries[(key as usize) & self.mask];
        // Keep the old best move when the new search has none (fail-low).
        let mv = match mv {
            Some(m) => pack(m),
            None if e.key == key => e.mv,
            None => 0,
        };
        *e = Entry {
            key,
            mv,
            score: score.clamp(i16::MIN as i32, i16::MAX as i32) as i16,
            depth: depth.clamp(0, 255) as u8,
            bound,
        };
    }
}

/// from (6 bits) | to (6 bits) | promotion+1 (4 bits)
pub fn pack(mv: Move) -> u16 {
    let promo = mv.promotion.map_or(0, |p| p as u16 + 1);
    (mv.from as u16) | ((mv.to as u16) << 6) | (promo << 12)
}

pub fn unpack(v: u16) -> Option<Move> {
    if v == 0 {
        return None;
    }
    let promo = (v >> 12) & 0xF;
    Some(Move {
        from: Square::index((v & 63) as usize),
        to: Square::index(((v >> 6) & 63) as usize),
        promotion: if promo == 0 { None } else { Some(Piece::index(promo as usize - 1)) },
    })
}
