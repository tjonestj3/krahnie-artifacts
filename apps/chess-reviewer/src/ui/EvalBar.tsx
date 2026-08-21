import { evalWinPct } from '../lib/classify.js';
import { fmtEval, type Eval } from '../lib/labels';

// Vertical eval bar. `ev` is White-centric. `orientation` flips it to match the board.
export function EvalBar({ ev, orientation }: { ev: Eval | null; orientation: 'white' | 'black' }) {
  const whiteWin = ev ? evalWinPct(ev) : 50;
  const whiteHeight = orientation === 'white' ? whiteWin : 100 - whiteWin;
  const label = fmtEval(ev);
  const whiteWinning = whiteWin >= 50;
  return (
    <div className="evalbar" title={`Eval ${label}`}>
      <div className="white" style={{ height: `${whiteHeight}%` }} />
      <span className={'txt' + ((orientation === 'white') === whiteWinning ? '' : ' top')}>{label}</span>
    </div>
  );
}
