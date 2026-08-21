// trainer.js — "find the better move" drills, auto-fed from the review's flagged moments.
// Chessground handles drag/tap + legal-move targeting; chess.js supplies the legal dests.
import { Chess } from 'chess.js';
import { Chessground } from 'chessground';
import { esc, LABEL_TEXT } from './review-ui.js';

const DRILL_LABELS = new Set(['miss', 'mistake', 'blunder']);

export class Trainer {
  constructor(els) {
    this.els = els; // {board, feedback, momentList, reset, show}
    this.cg = null;
    this.moments = [];
    this.current = null;
    this.attempts = 0;
    els.reset.addEventListener('click', () => this.current && this.select(this.current));
    els.show.addEventListener('click', () => this.showAnswer());
  }

  // record + replayed position FENs (aligned with review view)
  load(record, positions) {
    const mySide = record.perspective === 'black' ? 'b' : record.perspective === 'white' ? 'w' : null;
    this.moments = record.moves
      .map((m, i) => ({ ...m, fenBefore: positions[i] }))
      .filter(m => DRILL_LABELS.has(m.label) && m.bestUci && (!mySide || m.mover === mySide))
      .sort((a, b) => b.winLoss - a.winLoss)
      .slice(0, 8);
    this.renderList(record);
    if (this.moments.length) this.select(this.moments[0]);
    return this.moments.length;
  }

  renderList(record) {
    this.els.momentList.innerHTML = this.moments.map((m, i) =>
      `<button class="moment" type="button" data-i="${i}">
        <span class="rank">#${i + 1}</span>
        <span><b>${Math.ceil(m.ply / 2)}${m.mover === 'w' ? '.' : '…'} ${esc(m.san)}</b>
        <em>${LABEL_TEXT[m.label]} · −${Math.round(m.winLoss)}% win chance</em></span>
        <strong style="color:var(--red);white-space:nowrap">find the fix</strong>
      </button>`).join('');
    this.els.momentList.querySelectorAll('.moment').forEach(btn =>
      btn.addEventListener('click', () => this.select(this.moments[+btn.dataset.i])));
  }

  select(moment) {
    this.current = moment;
    this.attempts = 0;
    this.els.momentList.querySelectorAll('.moment').forEach((b, i) =>
      b.classList.toggle('active', this.moments[i] === moment));
    const chess = new Chess(moment.fenBefore);
    const color = chess.turn() === 'w' ? 'white' : 'black';
    const dests = legalDests(chess);
    const config = {
      fen: moment.fenBefore,
      orientation: color,
      turnColor: color,
      lastMove: undefined,
      movable: { free: false, color, dests, events: { after: (o, d) => this.tryMove(o, d) } },
      draggable: { enabled: true },
      selectable: { enabled: true },
      drawable: { autoShapes: [] },
      animation: { duration: 160 },
    };
    if (!this.cg) this.cg = Chessground(this.els.board, config);
    else this.cg.set(config);
    this.feedback(`You played ${moment.san} here (${LABEL_TEXT[moment.label].toLowerCase()}). ${color === 'white' ? 'White' : 'Black'} to move — find the better idea.`);
  }

  tryMove(orig, dest) {
    const m = this.current;
    if (!m) return;
    this.attempts++;
    const guess = orig + dest;
    const best = m.bestUci.slice(0, 4);
    const alsoGood = m.secondUci && m.secondEval && closeEnough(m) ? m.secondUci.slice(0, 4) : null;
    if (guess === best) {
      this.feedback(`Correct — ${m.bestSan || m.bestUci}! That's the engine's move. Attempts: ${this.attempts}.`, 'good');
      this.cg.set({ movable: { color: undefined } });
    } else if (alsoGood && guess === alsoGood) {
      this.feedback(`Good — that also holds! The engine's top pick was ${m.bestSan || m.bestUci}. Attempts: ${this.attempts}.`, 'good');
      this.cg.set({ movable: { color: undefined } });
    } else {
      this.feedback(`Not quite (${guess}). Run the scan again: checks, captures, threats — then their reply. Reset to retry.`, 'bad');
      this.cg.set({ movable: { color: undefined } });
    }
  }

  showAnswer() {
    const m = this.current;
    if (!m) return;
    this.cg.set({
      drawable: { autoShapes: [{ orig: m.bestUci.slice(0, 2), dest: m.bestUci.slice(2, 4), brush: 'green' }] },
    });
    this.feedback(`Answer: ${m.bestSan || m.bestUci}. Replay why it works before moving on.`, 'good');
  }

  feedback(text, kind = '') {
    this.els.feedback.className = 'move-feedback ' + kind;
    this.els.feedback.textContent = text;
  }
}

function legalDests(chess) {
  const dests = new Map();
  for (const m of chess.moves({ verbose: true })) {
    if (!dests.has(m.from)) dests.set(m.from, []);
    dests.get(m.from).push(m.to);
  }
  return dests;
}

function closeEnough(m) {
  // second-best counts as "also good" when within 2 win% of the best line
  const w = ev => ev.mate != null ? (ev.mate > 0 ? 100 : 0) : 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * Math.max(-1000, Math.min(1000, ev.cp)))) - 1);
  if (!m.evalBefore || !m.secondEval) return false;
  const flip = m.mover === 'b';
  const a = flip ? 100 - w(m.evalBefore) : w(m.evalBefore);
  const b = flip ? 100 - w(m.secondEval) : w(m.secondEval);
  return a - b <= 2;
}
