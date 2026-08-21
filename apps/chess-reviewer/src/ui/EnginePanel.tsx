import { Chess } from 'chess.js';
import { fmtEval } from '../lib/labels';
import type { EngineUpdate, PvLine } from '../lib/types';

interface Props {
  fen: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  update: EngineUpdate | null;
  onPlayLine: (uciMoves: string[]) => void;
  onHoverLine: (uciMoves: string[] | null) => void;
}

// Convert a UCI pv to SAN for display (best-effort; stops at first illegal).
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
  const v = l.mate != null ? (l.mate > 0 ? 1 : -1) : (l.cp ?? 0);
  return v > 20 ? 'pos' : v < -20 ? 'neg' : 'zero';
}

export function EnginePanel({ fen, enabled, onToggle, update, onPlayLine, onHoverLine }: Props) {
  const turn = fen.split(' ')[1] === 'b' ? 'Black' : 'White';
  const lines = update?.pvs || [];
  return (
    <div className="panel engine-panel">
      <div className="engine-head">
        <label className="switch">
          <input type="checkbox" checked={enabled} onChange={e => onToggle(e.target.checked)} />
          Stockfish {enabled ? 'on' : 'off'}
        </label>
        <span className="depth">{enabled ? (update ? `depth ${update.depth} · ${turn} to move` : 'thinking…') : ''}</span>
      </div>
      {!enabled && <p className="lede" style={{ fontSize: 13, margin: 0 }}>Turn the engine on to see the top {3} lines for the current position. Click a line to play it out as a variation.</p>}
      {enabled && !lines.length && <p className="lede" style={{ fontSize: 13, margin: 0 }}><span className="spin" /> starting engine…</p>}
      {enabled && lines.map((l, i) => {
        const uci = l.pv || [];
        const sans = pvToSan(fen, uci);
        return (
          <div key={i} className="pv-line"
            onMouseEnter={() => onHoverLine(uci)} onMouseLeave={() => onHoverLine(null)}
            onClick={() => onPlayLine(uci)}>
            <span className={'pv-eval ' + evalClass(l)}>{fmtEval(l)}</span>
            <span className="pv-moves">{sans.join(' ')}</span>
          </div>
        );
      })}
    </div>
  );
}
