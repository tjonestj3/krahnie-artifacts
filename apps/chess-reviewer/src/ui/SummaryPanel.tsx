import { BADGE, LABEL_TEXT, LABEL_ORDER, type Label } from '../lib/labels';
import type { ReviewedGame } from '../lib/types';

// Chess.com-style game report: accuracy header + per-label counts for both sides.
// Counts are buttons — tapping one cycles through that side's moves of that type,
// so the summary doubles as a training index into the game.
export function SummaryPanel({ game, currentPly, onSeek }: {
  game: ReviewedGame; currentPly: number; onSeek: (ply: number) => void;
}) {
  if (!game.tallies || !game.moves.some(m => m.label)) return null;
  const t = game.tallies;
  const my = game.perspective; // highlight the user's column

  const jump = (side: 'w' | 'b', label: Label) => {
    const plies = game.moves.filter(m => m.mover === side && m.label === label).map(m => m.ply);
    if (!plies.length) return;
    const next = plies.find(p => p > currentPly) ?? plies[0]; // cycle, wrapping
    onSeek(next);
  };

  const rows = LABEL_ORDER.filter(l => t.white[l] + t.black[l] > 0);

  return (
    <div className="sum-grid">
      <div className="sum-acc">
        <div className={'sum-player' + (my === 'white' ? ' me' : '')}>
          <small>{game.white.name}</small>
          <b>{game.accuracy?.white != null ? game.accuracy.white : '—'}</b>
          <em>accuracy</em>
        </div>
        <div className={'sum-player' + (my === 'black' ? ' me' : '')}>
          <small>{game.black.name}</small>
          <b>{game.accuracy?.black != null ? game.accuracy.black : '—'}</b>
          <em>accuracy</em>
        </div>
      </div>
      {rows.map(l => (
        <div className="sum-row" key={l}>
          <button className={'sum-cnt' + (my === 'white' ? ' me' : '')}
            disabled={!t.white[l]} onClick={() => jump('w', l)}>{t.white[l]}</button>
          <span className="sum-label">
            <span className={'chip-lbl ' + l}>{BADGE[l]}</span>
            <span className={'sum-name lc-' + l}>{LABEL_TEXT[l]}</span>
          </span>
          <button className={'sum-cnt' + (my === 'black' ? ' me' : '')}
            disabled={!t.black[l]} onClick={() => jump('b', l)}>{t.black[l]}</button>
        </div>
      ))}
      <p className="sum-hint">Tap a count to jump through those moves.</p>
    </div>
  );
}
