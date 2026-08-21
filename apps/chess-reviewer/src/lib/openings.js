// openings.js — EPD → {eco, name} lookup from the vendored lichess/chess-openings
// dataset. In the Vite build the data lives in public/data and is served at BASE_URL.
let table = null;

export function setOpenings(data) { table = data; }

export async function loadOpenings() {
  if (table) return table;
  const base = (import.meta.env && import.meta.env.BASE_URL) || './';
  const res = await fetch(base + 'data/openings.json');
  table = await res.json();
  return table;
}

const epd = fen => fen.split(' ').slice(0, 4).join(' ');

// positions[0..n] → { flags: bool per move, eco, name }.
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
