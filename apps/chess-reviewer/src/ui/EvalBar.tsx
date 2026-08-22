import { evalWinPct } from '../lib/classify.js';
import { fmtEval, type Eval } from '../lib/labels';

// Horizontal eval strip (mobile, chess.com style): white share fills from the left.
export function EvalBarH({ ev }: { ev: Eval | null }) {
  const whiteWin = ev ? evalWinPct(ev) : 50;
  return (
    <div className="evalbar-h" title={`Eval ${fmtEval(ev)}`}>
      <div className="white" style={{ width: `${whiteWin}%` }} />
      <span className="txt">{fmtEval(ev)}</span>
    </div>
  );
}

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
