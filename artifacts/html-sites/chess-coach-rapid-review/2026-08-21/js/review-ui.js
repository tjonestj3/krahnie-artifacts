// review-ui.js — everything visual on the review screen: board sync, eval graph,
// move list with badges, accuracy cards, tallies, coach summary.
import { Chess } from 'chess.js';
import { Chessground } from 'chessground';
import { evalWinPct } from './classify.js';

export const BADGE = {
  brilliant: '!!', great: '!', best: '★', excellent: '✓', good: 'ok',
  book: '≡', inaccuracy: '?!', mistake: '?', blunder: '??', miss: '✗',
};
export const LABEL_TEXT = {
  brilliant: 'Brilliant', great: 'Great move', best: 'Best move', excellent: 'Excellent',
  good: 'Good', book: 'Book', inaccuracy: 'Inaccuracy', mistake: 'Mistake',
  blunder: 'Blunder', miss: 'Missed win',
};
const FLAGGED = new Set(['inaccuracy', 'mistake', 'blunder', 'miss']);

export class ReviewView {
  constructor(els) {
    this.els = els; // {board, topPlayer, bottomPlayer, moveComment, accCards, evalGraph, tallyGrid, moveList, coachSummary, gameMeta}
    this.cg = Chessground(els.board, {
      viewOnly: false,
      movable: { free: false, color: undefined },
      draggable: { enabled: false },
      selectable: { enabled: false },
      coordinates: true,
      animation: { duration: 180 },
    });
    this.record = null;
    this.positions = [];
    this.ply = 0;
    this.orientation = 'white';
  }

  load(record) {
    this.record = record;
    // replay moves once → position FENs (records don't store FENs)
    const chess = new Chess();
    this.positions = [chess.fen()];
    this.sans = [];
    for (const m of record.moves) { chess.move(m.san); this.positions.push(chess.fen()); this.sans.push(m.san); }
    this.orientation = record.perspective === 'black' ? 'black' : 'white';
    this.renderPlayers();
    this.renderMeta();
    this.renderMoveList();
    this.renderAccuracy();
    this.renderTallies();
    this.renderGraph();
    this.renderSummary();
    this.seek(0);
  }

  renderMeta() {
    const r = this.record;
    const tc = r.timeControl?.initial != null
      ? `${Math.round(r.timeControl.initial / 60)}+${r.timeControl.increment ?? 0}` : '';
    const date = r.playedAt ? new Date(r.playedAt).toISOString().slice(0, 10) : '';
    this.els.gameMeta.textContent =
      `${sourceName(r.source)} · ${r.timeControl?.class || ''} ${tc} · ${date} · ${r.result || ''}`;
  }

  renderPlayers() {
    const r = this.record;
    const bar = (side) => {
      const p = r[side];
      const acc = r.accuracy?.[side];
      return `<span class="nm">${side === 'white' ? '○' : '●'} <b>${esc(p.name)}</b> <small>${p.rating ?? ''}</small></span>` +
             (acc != null ? `<span class="pill">${acc}% accuracy</span>` : '');
    };
    const topSide = this.orientation === 'white' ? 'black' : 'white';
    const botSide = this.orientation === 'white' ? 'white' : 'black';
    this.els.topPlayer.innerHTML = bar(topSide);
    this.els.bottomPlayer.innerHTML = bar(botSide);
  }

  flip() {
    this.orientation = this.orientation === 'white' ? 'black' : 'white';
    this.cg.set({ orientation: this.orientation });
    this.renderPlayers();
  }

  seek(ply) {
    this.ply = Math.max(0, Math.min(this.positions.length - 1, ply));
    const move = this.ply > 0 ? this.record.moves[this.ply - 1] : null;
    const shapes = [];
    if (move && FLAGGED.has(move.label) && move.bestUci) {
      shapes.push({ orig: move.bestUci.slice(0, 2), dest: move.bestUci.slice(2, 4), brush: 'green' });
    }
    this.cg.set({
      fen: this.positions[this.ply],
      orientation: this.orientation,
      lastMove: move ? [move.uci.slice(0, 2), move.uci.slice(2, 4)] : undefined,
      drawable: { autoShapes: shapes },
    });
    this.renderComment(move);
    this.highlightMove();
    this.drawGraphCursor();
  }

  renderComment(move) {
    const el = this.els.moveComment;
    if (!move) { el.className = 'move-feedback'; el.textContent = 'Start of game. Step through with ◀ ▶ or the arrow keys — click any move or graph point to jump.'; return; }
    if (!move.label) { el.className = 'move-feedback'; el.textContent = `${moveNo(move)} ${move.san}`; return; }
    const bad = FLAGGED.has(move.label);
    el.className = 'move-feedback ' + (bad ? 'bad' : ['brilliant', 'great', 'best'].includes(move.label) ? 'good' : '');
    let txt = `${moveNo(move)} ${move.san} — ${LABEL_TEXT[move.label]}`;
    const ev = move.evalAfter;
    if (ev) txt += ` · eval ${fmtEval(ev)}`;
    if (bad && move.bestSan) txt += `. Better was ${move.bestSan} (arrow).`;
    else if (move.label === 'brilliant') txt += `. A real sacrifice that works — the engine agrees.`;
    else if (move.label === 'great') txt += `. The only move that holds everything together.`;
    el.textContent = txt;
  }

  renderMoveList() {
    const r = this.record;
    const rows = [];
    for (let i = 0; i < r.moves.length; i += 2) {
      const num = i / 2 + 1;
      rows.push(`<div class="mv-row"><span class="mv-num">${num}.</span>${mvCell(r.moves[i], i + 1)}${r.moves[i + 1] ? mvCell(r.moves[i + 1], i + 2) : '<span></span>'}</div>`);
    }
    this.els.moveList.innerHTML = rows.join('');
    this.els.moveList.querySelectorAll('.mv').forEach(el =>
      el.addEventListener('click', () => this.seek(+el.dataset.ply)));
  }

  highlightMove() {
    this.els.moveList.querySelectorAll('.mv').forEach(el =>
      el.classList.toggle('active', +el.dataset.ply === this.ply));
    const active = this.els.moveList.querySelector('.mv.active');
    active?.scrollIntoView({ block: 'nearest' });
  }

  renderAccuracy() {
    const r = this.record;
    const card = (side) => {
      const acc = r.accuracy?.[side];
      const acpl = r.acpl?.[side];
      return `<div class="metric"><span>${esc(r[side].name)} · ${side}</span>` +
        `<b>${acc != null ? acc + '%' : '—'}</b>` +
        `<small>${acpl != null ? acpl + ' avg centipawn loss' : 'accuracy'}</small></div>`;
    };
    this.els.accCards.innerHTML = card('white') + card('black');
  }

  renderTallies() {
    const t = this.record.tallies;
    if (!t) { this.els.tallyGrid.innerHTML = ''; return; }
    const order = ['brilliant', 'great', 'best', 'excellent', 'good', 'book', 'inaccuracy', 'mistake', 'blunder', 'miss'];
    const rows = order
      .filter(l => t.white[l] + t.black[l] > 0 || FLAGGED.has(l))
      .map(l =>
        `<span class="mbadge ${l}">${BADGE[l]}</span><span>${LABEL_TEXT[l]}</span>` +
        `<span class="cnt">${t.white[l]}</span><span class="cnt" style="color:var(--muted)">${t.black[l]}</span>`);
    this.els.tallyGrid.innerHTML =
      `<span></span><span style="color:var(--muted);font-size:12px;font-weight:800">LABEL</span><span class="cnt" style="color:var(--muted);font-size:12px">W</span><span class="cnt" style="color:var(--muted);font-size:12px">B</span>` +
      rows.join('');
  }

  // ---- eval graph (SVG) ----
  renderGraph(partialWins) {
    const wins = partialWins || this.record?.whiteWins;
    const svg = this.els.evalGraph;
    const W = 1000, H = 200;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    if (!wins || wins.length < 2) { svg.innerHTML = ''; return; }
    const n = (this.record?.moves.length ?? wins.length - 1) + 1;
    const x = i => (i / Math.max(1, n - 1)) * W;
    const y = w => H - (w / 100) * H;
    let d = `M0,${y(wins[0])}`;
    for (let i = 1; i < wins.length; i++) d += ` L${x(i)},${y(wins[i])}`;
    const area = d + ` L${x(wins.length - 1)},${H} L0,${H} Z`;
    const markers = (this.record?.moves || [])
      .map((m, i) => ({ m, i }))
      .filter(({ m, i }) => i + 1 < wins.length && (FLAGGED.has(m.label) || m.label === 'brilliant' || m.label === 'great'))
      .map(({ m, i }) =>
        `<circle cx="${x(i + 1)}" cy="${y(wins[i + 1])}" r="6" fill="${markerColor(m.label)}" data-ply="${i + 1}" style="cursor:pointer"><title>${moveNo(m)} ${esc(m.san)} — ${LABEL_TEXT[m.label]}</title></circle>`)
      .join('');
    svg.innerHTML =
      `<rect x="0" y="0" width="${W}" height="${H / 2}" fill="rgba(255,255,255,.05)"/>` +
      `<line x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}" stroke="rgba(255,255,255,.25)" stroke-dasharray="4 4"/>` +
      `<path d="${area}" fill="rgba(110,231,255,.14)"/>` +
      `<path d="${d}" fill="none" stroke="var(--blue)" stroke-width="2.5"/>` +
      `<line id="graphCursor" x1="0" y1="0" x2="0" y2="${H}" stroke="var(--gold)" stroke-width="2" opacity="0"/>` +
      markers;
    svg.onclick = e => {
      const pt = svg.getBoundingClientRect();
      const ply = Math.round(((e.clientX - pt.left) / pt.width) * (n - 1));
      this.seek(ply);
    };
    this.drawGraphCursor();
  }

  drawGraphCursor() {
    const svg = this.els.evalGraph;
    const cur = svg.querySelector('#graphCursor');
    if (!cur || !this.record) return;
    const n = this.record.moves.length + 1;
    const x = (this.ply / Math.max(1, n - 1)) * 1000;
    cur.setAttribute('x1', x); cur.setAttribute('x2', x);
    cur.setAttribute('opacity', '0.8');
  }

  // ---- coach summary ----
  renderSummary() {
    const r = this.record;
    const el = this.els.coachSummary;
    if (!r.moves.some(m => m.label)) { el.hidden = true; return; }
    const side = r.perspective; // may be null → summarize both
    const mySide = side === 'black' ? 'b' : 'w';
    const mine = side ? r.moves.filter(m => m.mover === mySide) : r.moves;
    const worst = [...mine].filter(m => FLAGGED.has(m.label))
      .sort((a, b) => b.winLoss - a.winLoss).slice(0, 3);
    const phases = phaseLoss(r.moves, side ? mySide : null);
    const dominant = Object.entries(phases).sort((a, b) => b[1] - a[1])[0];
    const who = side ? esc(r[side].name) : 'both sides';
    el.innerHTML =
      `<h2>Coach summary</h2>` +
      `<p class="lede" style="font-size:16px">${r.openingName ? `<b>${esc(r.openingName)}</b> (${r.eco}). ` : ''}` +
      `Reviewing for ${who}. ` +
      (dominant && dominant[1] > 0
        ? `Most win-probability was lost in the <b>${dominant[0]}</b> (${Math.round(dominant[1])}% total across ${phaseCount(r.moves, side ? mySide : null, dominant[0])} flagged moves).`
        : 'A clean game — nothing major to fix.') +
      `</p>` +
      (worst.length ? `<h3 style="margin:14px 0 6px">Worst moments</h3><ol class="summary-moments">` +
        worst.map(m => `<li data-ply="${m.ply}"><b>${moveNo(m)} ${esc(m.san)}</b> — ${LABEL_TEXT[m.label]}, −${Math.round(m.winLoss)}% win chance${m.bestSan ? `; better was <b>${esc(m.bestSan)}</b>` : ''}</li>`).join('') +
        `</ol>` : '') +
      `<div class="pillrow"><span class="pill">Checks</span><span class="pill">Captures</span><span class="pill">Threats</span><span class="pill">Their reply</span><span class="pill">Only then: move</span></div>`;
    el.hidden = false;
    el.querySelectorAll('.summary-moments li').forEach(li =>
      li.addEventListener('click', () => { this.seek(+li.dataset.ply); window.scrollTo({ top: 0, behavior: 'smooth' }); }));
  }
}

// ---- helpers ----
function mvCell(m, ply) {
  const badge = m.label && m.label !== 'excellent' && m.label !== 'good'
    ? `<span class="mbadge ${m.label}" title="${LABEL_TEXT[m.label]}">${BADGE[m.label]}</span>` : '';
  return `<span class="mv" data-ply="${ply}">${esc(m.san)}${badge}</span>`;
}

function moveNo(m) {
  return `${Math.ceil(m.ply / 2)}${m.mover === 'w' ? '.' : '…'}`;
}

export function fmtEval(ev) {
  if (ev.mate != null) return (ev.mate > 0 ? '#' : '#−') + Math.abs(ev.mate);
  const p = ev.cp / 100;
  return (p > 0 ? '+' : '') + p.toFixed(1);
}

function markerColor(label) {
  return { brilliant: 'var(--teal)', great: 'var(--blue)', inaccuracy: 'var(--amber)', mistake: 'var(--orange)', blunder: 'var(--red)', miss: '#ff8fa3' }[label] || 'var(--muted)';
}

function phaseLoss(moves, mover) {
  const out = { opening: 0, middlegame: 0, endgame: 0 };
  for (const m of moves) {
    if (mover && m.mover !== mover) continue;
    if (!m.winLoss) continue;
    out[phaseOf(m)] += m.winLoss;
  }
  return out;
}
function phaseCount(moves, mover, phase) {
  return moves.filter(m => (!mover || m.mover === mover) && m.winLoss >= 10 && phaseOf(m) === phase).length;
}
function phaseOf(m) {
  if (m.ply <= 14 || m.label === 'book') return 'opening';
  return m.pieces != null && m.pieces <= 12 ? 'endgame' : m.ply > 60 ? 'endgame' : 'middlegame';
}

function sourceName(s) { return { lichess: 'Lichess', chesscom: 'Chess.com', pgn: 'PGN' }[s] || s; }
export function esc(s) { return String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
