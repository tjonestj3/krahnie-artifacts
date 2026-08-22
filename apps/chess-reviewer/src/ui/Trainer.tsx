import { useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import { Board } from './Board';
import { LABEL_TEXT, type Label } from '../lib/labels';
import type { ReviewedGame, ReviewedMove } from '../lib/types';

const DRILL = new Set<Label>(['miss', 'mistake', 'blunder']);

function legalDests(fen: string): Map<string, string[]> {
  const c = new Chess(fen);
  const d = new Map<string, string[]>();
  for (const m of c.moves({ verbose: true }) as any[]) {
    if (!d.has(m.from)) d.set(m.from, []);
    d.get(m.from)!.push(m.to);
  }
  return d;
}

// second-best counts as "also good" when within 2 win% of the best line
function alsoGood(m: ReviewedMove): string | null {
  if (!m.secondUci || !m.evalBefore || !m.secondEval) return null;
  const w = (ev: any) => ev.mate != null ? (ev.mate > 0 ? 100 : 0)
    : 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * Math.max(-1000, Math.min(1000, ev.cp)))) - 1);
  const flip = m.mover === 'b';
  const a = flip ? 100 - w(m.evalBefore) : w(m.evalBefore);
  const b = flip ? 100 - w(m.secondEval) : w(m.secondEval);
  return a - b <= 2 ? m.secondUci.slice(0, 4) : null;
}

export function Trainer({ game, positions }: { game: ReviewedGame; positions: string[] }) {
  const moments = useMemo(() => {
    const mySide = game.perspective === 'black' ? 'b' : game.perspective === 'white' ? 'w' : null;
    return game.moves
      .map((m, i) => ({ ...m, fenBefore: positions[i] }))
      .filter(m => m.label && DRILL.has(m.label) && m.bestUci && (!mySide || m.mover === mySide))
      .sort((a, b) => (b.winLoss || 0) - (a.winLoss || 0))
      .slice(0, 8);
  }, [game, positions]);

  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; kind: string }>({ text: '', kind: '' });
  const [solved, setSolved] = useState(false);
  const [showBest, setShowBest] = useState(false);
  const [tryFen, setTryFen] = useState<string | null>(null);

  if (!moments.length) return null;
  const m = moments[idx];
  const fen = tryFen || m.fenBefore;
  const color = m.mover === 'w' ? 'white' : 'black';

  const pick = (i: number) => { setIdx(i); setSolved(false); setShowBest(false); setTryFen(null); setFeedback({ text: `You played ${m.san} here. Find the better move — ${moments[i].mover === 'w' ? 'White' : 'Black'} to move.`, kind: '' }); };

  const onMove = (from: string, to: string) => {
    const guess = from + to;
    const best = m.bestUci!.slice(0, 4);
    const ag = alsoGood(m);
    const c = new Chess(m.fenBefore); try { c.move({ from, to, promotion: 'q' }); } catch { return; }
    setTryFen(c.fen());
    if (guess === best) { setFeedback({ text: `Correct — ${m.bestSan || m.bestUci}! That's the engine's move.`, kind: 'good' }); setSolved(true); }
    else if (ag && guess === ag) { setFeedback({ text: `Also good! The engine's top pick was ${m.bestSan || m.bestUci}.`, kind: 'good' }); setSolved(true); }
    else setFeedback({ text: `Not quite (${guess}). Scan again: checks, captures, threats — then reset.`, kind: 'bad' });
  };

  const shapes = showBest && m.bestUci ? [{ orig: m.bestUci.slice(0, 2), dest: m.bestUci.slice(2, 4), brush: 'green' }] : [];

  return (
    <div>
      <p className="lede" style={{ fontSize: 15, marginTop: 4 }}>Every flagged moment from this game, as a drill. Drag a piece or tap source → target.</p>
      <div className="trainer-grid" style={{ marginTop: 14 }}>
        <div>
          <div className="trainer-board">
            <Board fen={fen} orientation={color} dests={solved ? undefined : legalDests(m.fenBefore)}
              movableColor={solved ? undefined : color} onMove={onMove} shapes={shapes} viewOnly={solved && !showBest} />
          </div>
          <div className={'move-feedback ' + feedback.kind}>{feedback.text || 'Pick a moment on the right.'}</div>
          <div className="board-controls">
            <button className="coach-btn" onClick={() => pick(idx)}>Reset try</button>
            <button className="coach-btn" onClick={() => { setShowBest(true); setFeedback({ text: `Answer: ${m.bestSan || m.bestUci}.`, kind: 'good' }); }}>Show answer</button>
          </div>
        </div>
        <div className="moments">
          {moments.map((mm, i) => (
            <button key={i} className={'moment' + (i === idx ? ' active' : '')} onClick={() => pick(i)}>
              <span className="rank">#{i + 1}</span>
              <span><b>{Math.ceil(mm.ply / 2)}{mm.mover === 'w' ? '.' : '…'} {mm.san}</b>
                <em>{LABEL_TEXT[mm.label as Label]} · −{Math.round(mm.winLoss || 0)}% win chance</em></span>
              <strong style={{ color: 'var(--red)', whiteSpace: 'nowrap' }}>find the fix</strong>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
