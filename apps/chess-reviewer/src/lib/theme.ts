// theme.ts — user-selectable board theme, piece set, and app background.
// Board themes are generated SVG checkerboards (no assets); piece sets use the
// vendored cburnett by default with lichess-CDN sets as options; backgrounds are
// CSS variants keyed off a data attribute. Prefs persist in localStorage.

export interface BoardTheme { id: string; name: string; light: string; dark: string; }
export const BOARD_THEMES: BoardTheme[] = [
  { id: 'walnut', name: 'Walnut', light: '#f0d9b5', dark: '#b58863' },
  { id: 'forest', name: 'Forest', light: '#ebecd0', dark: '#779556' },
  { id: 'ocean', name: 'Ocean', light: '#dee3e6', dark: '#8ca2ad' },
  { id: 'ice', name: 'Ice', light: '#e8ebef', dark: '#7d8796' },
  { id: 'amethyst', name: 'Amethyst', light: '#e6ddf2', dark: '#8a6bbf' },
  { id: 'ember', name: 'Ember', light: '#efd8c2', dark: '#a35638' },
];

export const PIECE_SETS = [
  { id: 'cburnett', name: 'Classic' },     // vendored, offline
  { id: 'merida', name: 'Merida' },        // lichess CDN
  { id: 'alpha', name: 'Alpha' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'gioco', name: 'Gioco' },
];

export const BACKGROUNDS = [
  { id: 'midnight', name: 'Midnight', swatch: '#253b75' },
  { id: 'plum', name: 'Plum', swatch: '#5f244b' },
  { id: 'forestbg', name: 'Forest', swatch: '#1d4030' },
  { id: 'slate', name: 'Slate', swatch: '#2a3140' },
  { id: 'carbon', name: 'Carbon', swatch: '#17181c' },
];

export interface Prefs { board: string; pieces: string; bg: string; }
const DEFAULTS: Prefs = { board: 'walnut', pieces: 'cburnett', bg: 'midnight' };
const KEY = 'kcr-prefs';

export function loadPrefs(): Prefs {
  try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) || '{}')) }; }
  catch { return { ...DEFAULTS }; }
}
export function savePrefs(p: Prefs) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode */ } }

export function boardSvgUrl(light: string, dark: string): string {
  let squares = '';
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    if ((r + c) % 2) squares += `<rect x="${c}" y="${r}" width="1" height="1"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges"><rect width="8" height="8" fill="${light}"/><g fill="${dark}">${squares}</g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function styleEl(id: string): HTMLStyleElement {
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
  return el;
}

export function applyBoardTheme(id: string) {
  const t = BOARD_THEMES.find(b => b.id === id) || BOARD_THEMES[0];
  styleEl('kcr-board-theme').textContent =
    `.cg-wrap cg-board{background-image:url("${boardSvgUrl(t.light, t.dark)}") !important}` +
    `.cg-wrap coords{color:${t.dark} !important}`;
}

const ROLES: Record<string, string> = { pawn: 'P', knight: 'N', bishop: 'B', rook: 'R', queen: 'Q', king: 'K' };

export function applyPieceSet(id: string) {
  const el = styleEl('kcr-piece-set');
  if (id === 'cburnett') { el.textContent = ''; return; } // vendored css already covers it
  let css = '';
  for (const [role, letter] of Object.entries(ROLES)) {
    for (const color of ['white', 'black'] as const) {
      css += `.cg-wrap piece.${role}.${color}{background-image:url('https://lichess1.org/assets/piece/${id}/${color[0]}${letter}.svg') !important}`;
    }
  }
  el.textContent = css;
}

export function applyBackground(id: string) {
  document.documentElement.setAttribute('data-bg', id);
}

export function applyPrefs(p: Prefs = loadPrefs()) {
  applyBoardTheme(p.board);
  applyPieceSet(p.pieces);
  applyBackground(p.bg);
}
