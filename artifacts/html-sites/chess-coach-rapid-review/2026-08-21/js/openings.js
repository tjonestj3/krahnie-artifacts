// openings.js — EPD → {eco, name} lookup from the vendored lichess/chess-openings dataset.
let table = null;

// Direct injection (used by tests / non-browser contexts).
export function setOpenings(data) { table = data; }

export async function loadOpenings() {
  if (table) return table;
  const res = await fetch(new URL('../data/openings.json', import.meta.url));
  table = await res.json();
  return table;
}

const epd = fen => fen.split(' ').slice(0, 4).join(' ');

// positions[0..n] → { flags: bool per move, eco, name } — a move is Book iff its
// resulting position is in the table, ply <= maxPly, and every prior move was Book too.
export function bookWalk(positions, maxPly = 20) {
  const flags = [];
  let eco = null, name = null;
  if (!table) return { flags: positions.slice(1).map(() => false), eco, name };
  let inBook = true;
  for (let i = 1; i < positions.length; i++) {
    const hit = inBook && i <= maxPly ? table[epd(positions[i])] : null;
    if (hit) { eco = hit[0]; name = hit[1]; flags.push(true); }
    else { inBook = false; flags.push(false); }
  }
  return { flags, eco, name };
}
