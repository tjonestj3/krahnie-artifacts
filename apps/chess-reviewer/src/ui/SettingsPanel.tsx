import { useEffect, useRef, useState } from 'react';
import {
  BOARD_THEMES, PIECE_SETS, BACKGROUNDS, boardSvgUrl,
  loadPrefs, savePrefs, applyPrefs, type Prefs,
} from '../lib/theme';

// ⚙ popover: pick board theme, piece set, and app background. Applies instantly, persists.
export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const set = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next); savePrefs(next); applyPrefs(next);
  };

  return (
    <div className="settings-wrap" ref={ref}>
      <button className="coach-btn sm" onClick={() => setOpen(o => !o)} title="Appearance">⚙</button>
      {open && (
        <div className="settings-pop panel">
          <div className="set-title">Board</div>
          <div className="set-row">
            {BOARD_THEMES.map(t => (
              <button key={t.id} className={'swatch board' + (prefs.board === t.id ? ' on' : '')}
                title={t.name} onClick={() => set({ board: t.id })}
                style={{ backgroundImage: `url("${boardSvgUrl(t.light, t.dark)}")` }} />
            ))}
          </div>
          <div className="set-title">Pieces</div>
          <div className="set-row">
            {PIECE_SETS.map(p => (
              <button key={p.id} className={'swatch piece' + (prefs.pieces === p.id ? ' on' : '')}
                title={p.name + (p.id !== 'cburnett' ? ' (loads from lichess)' : '')}
                onClick={() => set({ pieces: p.id })}
                style={{ backgroundImage: p.id === 'cburnett' ? undefined : `url('https://lichess1.org/assets/piece/${p.id}/wN.svg')` }}>
                {p.id === 'cburnett' ? '♘' : ''}
              </button>
            ))}
          </div>
          <div className="set-title">Background</div>
          <div className="set-row">
            {BACKGROUNDS.map(b => (
              <button key={b.id} className={'swatch bg' + (prefs.bg === b.id ? ' on' : '')}
                title={b.name} onClick={() => set({ bg: b.id })}
                style={{ background: b.swatch }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
