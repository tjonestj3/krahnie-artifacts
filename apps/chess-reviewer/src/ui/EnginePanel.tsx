import { Chess } from 'chess.js';
import { fmtEval } from '../lib/labels';
import type { PvLine } from '../lib/types';
import type { LiveEval } from './useLiveEngine';

interface Props {
  fen: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  update: LiveEval | null;
  thinking: boolean;
  onPlayLine: (uciMoves: string[]) => void;
  onHoverLine: (uciMoves: string[] | null) => void;
}

const SLOTS = 3;

// Convert a UCI pv to SAN for display (uses the fen the line was computed FROM,
// so stale lines still render correctly while the engine catches up).
function pvToSan(fen: string, uciMoves: string[], max = 12): string[] {
  const c = new Chess(fen);
  const out: string[] = [];
  for (const uci of uciMoves.slice(0, max)) {
    try {
      const m = c.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] || 'q' });
      out.push(m.san);
    } catch { break; }
  }
  return out;
}

function evalClass(l: PvLine) {
  const v = l.mate != null ? (l.mate > 0 ? 100 : -100) : (l.cp ?? 0);
  return v > 20 ? 'pos' : v < -20 ? 'neg' : 'zero';
}

export function EnginePanel({ fen, enabled, onToggle, update, thinking, onPlayLine, onHoverLine }: Props) {
  const turn = fen.split(' ')[1] === 'b' ? 'Black' : 'White';
  const stale = !!update && update.fen !== fen;
  const lines = update?.pvs || [];
  return (
    <div className="panel engine-panel">
      <div className="engine-head">
        <label className="switch">
          <input type="checkbox" checked={enabled} onChange={e => onToggle(e.target.checked)} />
          Stockfish {enabled ? 'on' : 'off'}
        </label>
        <span className="depth">
          {enabled ? (stale || thinking ? `${turn} to move · thinking…` : update ? `depth ${update.depth} · ${turn} to move` : '') : ''}
        </span>
      </div>
      {!enabled && <p className="lede" style={{ fontSize: 13, margin: 0 }}>Turn the engine on (or press <b>e</b>) to see the top {SLOTS} lines here. Click a line to play it out as a variation.</p>}
      {enabled && Array.from({ length: SLOTS }, (_, i) => {
        const l = lines[i];
        if (!l) return <div key={i} className="pv-slot"><div className="pv-skeleton" /></div>;
        const uci = l.pv || [];
        const sans = pvToSan(update!.fen, uci);
        return (
          <div key={i} className="pv-slot">
            <div className={'pv-line' + (stale ? ' stale' : '')}
              onMouseEnter={() => !stale && onHoverLine(uci)} onMouseLeave={() => onHoverLine(null)}
              onClick={() => !stale && onPlayLine(uci)}>
              <span className={'pv-eval ' + evalClass(l)}>{fmtEval(l)}</span>
              <span className="pv-moves">{sans.join(' ')}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
