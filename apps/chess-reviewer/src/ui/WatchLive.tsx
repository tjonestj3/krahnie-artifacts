import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { Board } from './Board';
import { lichessStatus, streamLichessGame, chesscomOnline } from '../lib/api.js';

// "Watch me live": Lichess renders a real in-app board driven by the public game stream;
// Chess.com (no live API, no embedding) shows an online badge + a deep-link to their
// native spectator on the profile page.
export function WatchLive({ liUser, ccUser }: { liUser: string; ccUser: string }) {
  return (
    <section className="panel">
      <h2>Watch me live</h2>
      <p className="lede" style={{ fontSize: 15 }}>When you're mid-game, follow it here. Lichess streams the board live; Chess.com opens its native spectator (their API has no live feed).</p>
      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {liUser && <LichessWatch user={liUser} />}
        {ccUser && <ChesscomWatch user={ccUser} />}
        {!liUser && !ccUser && <p className="lede" style={{ fontSize: 14 }}>Fetch games from a Lichess or Chess.com account first — your usernames get remembered and appear here.</p>}
      </div>
    </section>
  );
}

function LichessWatch({ user }: { user: string }) {
  const [status, setStatus] = useState<{ online: boolean; playing: boolean; gameId: string | null } | null>(null);
  const [board, setBoard] = useState<{ fen: string; lastMove: [string, string] | null }>({ fen: new Chess().fen(), lastMove: null });
  const abortRef = useRef<AbortController | null>(null);
  const streamingGame = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const s = await lichessStatus(user);
        if (!alive) return;
        setStatus(s);
        if (s.playing && s.gameId && streamingGame.current !== s.gameId) {
          abortRef.current?.abort();
          const ac = new AbortController();
          abortRef.current = ac;
          streamingGame.current = s.gameId;
          streamLichessGame(s.gameId, (obj: any) => {
            // gameFull first (has .initialFen/.state), then gameState updates
            const moves: string = obj.state?.moves ?? obj.moves ?? '';
            const c = new Chess();
            let last: [string, string] | null = null;
            if (moves) for (const uci of moves.split(' ').filter(Boolean)) {
              try { const mv = c.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] || 'q' }); last = [mv.from, mv.to]; } catch { /* skip */ }
            }
            setBoard({ fen: c.fen(), lastMove: last });
          }, ac.signal).catch(() => { streamingGame.current = null; });
        }
        if (!s.playing) { abortRef.current?.abort(); streamingGame.current = null; }
      } catch { /* transient */ }
    };
    poll();
    const t = setInterval(poll, 5000);
    return () => { alive = false; clearInterval(t); abortRef.current?.abort(); };
  }, [user]);

  const orientation = 'white';
  return (
    <div>
      <div className="watch-card">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="platform">Lichess</span><b>{user}</b>
          {status?.playing ? <span className="pill live">● playing live</span>
            : status?.online ? <span className="pill ok">online</span>
              : <span className="pill">offline</span>}
        </div>
        <a className="coach-btn" href={`https://lichess.org/@/${user}`} target="_blank" rel="noopener">Open on Lichess →</a>
      </div>
      {status?.playing && status.gameId && (
        <div className="board-wrap" style={{ margin: '12px auto 0' }}>
          <Board fen={board.fen} orientation={orientation} lastMove={board.lastMove} viewOnly />
        </div>
      )}
    </div>
  );
}

function ChesscomWatch({ user }: { user: string }) {
  const [info, setInfo] = useState<{ online: boolean; profileUrl: string } | null>(null);
  useEffect(() => {
    let alive = true;
    const poll = async () => { try { const r = await chesscomOnline(user); if (alive) setInfo(r); } catch { /* */ } };
    poll();
    const t = setInterval(poll, 30000);
    return () => { alive = false; clearInterval(t); };
  }, [user]);
  return (
    <div className="watch-card">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <span className="platform">Chess.com</span><b>{user}</b>
        {info?.online ? <span className="pill ok">recently online</span> : <span className="pill">offline</span>}
      </div>
      <a className="coach-btn primary" href={info?.profileUrl || `https://www.chess.com/member/${user}`} target="_blank" rel="noopener">
        Watch on Chess.com →
      </a>
    </div>
  );
}
