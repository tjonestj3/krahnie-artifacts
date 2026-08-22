import { useEffect, useState } from 'react';
import { lichessGames, chesscomGames, pgnGame } from '../lib/api.js';
import { pgnId, allGames, metaGet, metaSet } from '../lib/store.js';
import { WatchLive } from './WatchLive';
import type { ImportedGame, ReviewedGame } from '../lib/types';

interface Props {
  onOpen: (g: ImportedGame) => void;
  onOpenRecord: (r: ReviewedGame) => void;
}

type Tab = 'lichess' | 'chesscom' | 'pgn';

export function ImportScreen({ onOpen, onOpenRecord }: Props) {
  const [tab, setTab] = useState<Tab>('lichess');
  const [liUser, setLiUser] = useState('');
  const [ccUser, setCcUser] = useState('');
  const [liPerf, setLiPerf] = useState('rapid');
  const [liMax, setLiMax] = useState('20');
  const [ccMonths, setCcMonths] = useState('2');
  const [pgnText, setPgnText] = useState('');
  const [games, setGames] = useState<ImportedGame[]>([]);
  const [status, setStatus] = useState<{ text: string; err?: boolean }>({ text: '' });
  const [busy, setBusy] = useState(false);
  const [recent, setRecent] = useState<ReviewedGame[]>([]);
  const [savedLi, setSavedLi] = useState('');
  const [savedCc, setSavedCc] = useState('');

  useEffect(() => {
    (async () => {
      const li = (await metaGet('liUser').catch(() => null)) || 'tjonestj';
      const cc = (await metaGet('ccUser').catch(() => null)) || 'tjonestj';
      setLiUser(li); setCcUser(cc); setSavedLi(li); setSavedCc(cc);
      refreshRecent();
    })();
  }, []);

  async function refreshRecent() {
    try {
      const all = (await allGames()) as ReviewedGame[];
      setRecent(all.sort((a, b) => (b.importedAt || 0) - (a.importedAt || 0)).slice(0, 12));
    } catch { /* IndexedDB unavailable */ }
  }

  async function doLichess() {
    if (!liUser.trim()) return setStatus({ text: 'Enter a Lichess username.', err: true });
    setBusy(true); setStatus({ text: 'Fetching from Lichess…' });
    try {
      const gs = await lichessGames(liUser.trim(), { max: +liMax, perfType: liPerf }) as ImportedGame[];
      metaSet('liUser', liUser.trim()); setSavedLi(liUser.trim());
      setGames(gs);
      setStatus({ text: gs.length ? `${gs.length} games. ⚡ = Lichess analysis attached (near-instant review).` : 'No games found.' });
    } catch (e: any) { setStatus({ text: e.message, err: true }); }
    setBusy(false);
  }

  async function doChesscom() {
    if (!ccUser.trim()) return setStatus({ text: 'Enter a Chess.com username.', err: true });
    setBusy(true); setStatus({ text: 'Fetching from Chess.com…' });
    try {
      const gs = await chesscomGames(ccUser.trim(), { months: +ccMonths }) as ImportedGame[];
      metaSet('ccUser', ccUser.trim()); setSavedCc(ccUser.trim());
      setGames(gs.slice(0, 60));
      setStatus({ text: gs.length ? `${gs.length} games (newest first).` : 'No games found.' });
    } catch (e: any) { setStatus({ text: e.message, err: true }); }
    setBusy(false);
  }

  async function doPgn() {
    try {
      const g = pgnGame(pgnText) as ImportedGame;
      g.id = await pgnId(g.sanMoves, (g as any).headers || {});
      onOpen(g);
    } catch (e: any) { setStatus({ text: 'PGN error: ' + e.message, err: true }); }
  }

  return (
    <section>
      <h1>Game Review</h1>
      <p className="lede">Your own review tool: pull games from Lichess or Chess.com — or paste any PGN — and get a full engine review, a live analysis board, and drills built from your own mistakes.</p>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="tabs">
          {(['lichess', 'chesscom', 'pgn'] as Tab[]).map(t => (
            <button key={t} className={'tab' + (tab === t ? ' active' : '')} onClick={() => setTab(t)}>
              {t === 'lichess' ? 'Lichess' : t === 'chesscom' ? 'Chess.com' : 'Paste PGN'}
            </button>
          ))}
        </div>

        {tab === 'lichess' && (
          <div className="field-row">
            <input type="text" value={liUser} onChange={e => setLiUser(e.target.value)} placeholder="Lichess username" />
            <select value={liPerf} onChange={e => setLiPerf(e.target.value)}>
              <option value="">All speeds</option><option value="bullet">Bullet</option>
              <option value="blitz">Blitz</option><option value="rapid">Rapid</option><option value="classical">Classical</option>
            </select>
            <select value={liMax} onChange={e => setLiMax(e.target.value)}>
              <option value="10">Last 10</option><option value="20">Last 20</option><option value="50">Last 50</option>
            </select>
            <button className="coach-btn primary" onClick={doLichess} disabled={busy}>{busy ? <span className="spin" /> : 'Fetch games'}</button>
          </div>
        )}
        {tab === 'chesscom' && (
          <div className="field-row">
            <input type="text" value={ccUser} onChange={e => setCcUser(e.target.value)} placeholder="Chess.com username" />
            <select value={ccMonths} onChange={e => setCcMonths(e.target.value)}>
              <option value="1">This month</option><option value="2">Last 2 months</option><option value="4">Last 4 months</option>
            </select>
            <button className="coach-btn primary" onClick={doChesscom} disabled={busy}>{busy ? <span className="spin" /> : 'Fetch games'}</button>
          </div>
        )}
        {tab === 'pgn' && (
          <div style={{ display: 'grid', gap: 10 }}>
            <textarea value={pgnText} onChange={e => setPgnText(e.target.value)} placeholder="Paste a PGN here — headers optional, one game" />
            <div><button className="coach-btn primary" onClick={doPgn}>Review this game</button></div>
          </div>
        )}

        <div className={'status-line' + (status.err ? ' err' : '')}>{status.text}</div>
        {games.length > 0 && (
          <div className="games">
            {games.map((g, i) => <GameCard key={g.id || i} g={g} onClick={() => onOpen(g)} />)}
          </div>
        )}
      </div>

      {recent.length > 0 && (
        <section>
          <h2>Recent reviews</h2>
          <div className="games">
            {recent.map(r => <RecentCard key={r.id} r={r} onClick={() => onOpenRecord(r)} />)}
          </div>
        </section>
      )}

      <WatchLive liUser={savedLi} ccUser={savedCc} />
    </section>
  );
}

function outcome(g: ImportedGame) {
  const my = g.perspective;
  if (!my) return { cls: '', text: g.result || '·' };
  if (g.result === '1/2-1/2') return { cls: 'draw', text: 'draw' };
  const win = (g.result === '1-0') === (my === 'white');
  return { cls: win ? 'win' : 'loss', text: win ? 'win' : 'loss' };
}

function GameCard({ g, onClick }: { g: ImportedGame; onClick: () => void }) {
  const o = outcome(g);
  const my = g.perspective;
  const opp = my === 'black' ? g.white : g.black;
  const vs = my ? `vs ${opp.name}${opp.rating ? ` (${opp.rating})` : ''}` : `${g.white.name} vs ${g.black.name}`;
  return (
    <button className="game-card" onClick={onClick}>
      <div className="game-top">
        <span className="platform">{g.source === 'lichess' ? 'Lichess' : g.source === 'chesscom' ? 'Chess.com' : 'PGN'}{g.lichessEvals ? ' ⚡' : ''}</span>
        <span className={'result-tag ' + o.cls}>{o.text}</span>
      </div>
      <h3>{vs}</h3>
      <p>{new Date(g.playedAt).toISOString().slice(0, 10)} · {g.timeControl.class}{my ? ` · as ${my}` : ''} · {g.sanMoves.length} plies</p>
    </button>
  );
}

function RecentCard({ r, onClick }: { r: ReviewedGame; onClick: () => void }) {
  const my = r.perspective;
  const myAcc = my ? r.accuracy?.[my] : null;
  const acc = myAcc != null ? `${myAcc}% you`
    : r.accuracy?.white != null ? `${r.accuracy.white}% / ${r.accuracy.black}%` : '';
  const accCls = myAcc == null ? '' : myAcc >= 85 ? ' hi' : myAcc >= 70 ? ' mid' : ' lo';
  const partial = r.analysis?.status === 'partial' ? ' · ⏸ partial' : '';
  const res = !my ? '' : r.result === '1/2-1/2' ? 'draw' : (r.result === '1-0') === (my === 'white') ? 'win' : 'loss';
  return (
    <button className="game-card" onClick={onClick}>
      <div className="game-top"><span className="platform">{r.source}</span>
        <span className={'result-tag ' + res}>{res || r.result || ''}</span></div>
      <h3>{r.white.name} vs {r.black.name}</h3>
      <p>{r.playedAt ? new Date(r.playedAt).toISOString().slice(0, 10) : ''} · {r.timeControl?.class || ''}{partial}</p>
      {acc && <span className={'done acc-chip' + accCls}>{acc}</span>}
    </button>
  );
}
