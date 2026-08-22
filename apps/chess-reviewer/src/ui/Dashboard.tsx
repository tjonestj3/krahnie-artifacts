import { useMemo, useState } from 'react';
import { userGames, summarize, byOpening, byClass, type GamePoint } from '../lib/stats';
import { Collapse } from './Collapse';
import type { ReviewedGame } from '../lib/types';

const RESULT_COLOR = { win: 'var(--green)', loss: 'var(--red)', draw: '#9aa6c4' } as const;

export function Dashboard({ games, onOpenRecord, onBack }: {
  games: ReviewedGame[];
  onOpenRecord: (id: string) => void;
  onBack: () => void;
}) {
  const all = useMemo(() => userGames(games), [games]);
  const classes = useMemo(() => byClass(all), [all]);
  const [filter, setFilter] = useState<string>('all');
  const points = useMemo(() => filter === 'all' ? all : all.filter(p => p.tclass === filter), [all, filter]);
  const sum = useMemo(() => summarize(points), [points]);
  const openings = useMemo(() => byOpening(points), [points]);

  return (
    <section>
      <div className="topbar" style={{ marginBottom: 14 }}>
        <button className="coach-btn" onClick={onBack}>← Back</button>
        <span className="pill">reviewed games only · stays on this device</span>
      </div>
      <h1>Progress</h1>

      {all.length === 0 ? (
        <div className="panel" style={{ marginTop: 16 }}>
          <p className="lede" style={{ fontSize: 16 }}>No reviewed games with a known side yet. Import and review a few games from your Lichess or Chess.com account — every review lands here automatically.</p>
        </div>
      ) : (
        <>
          <div className="tabsub" style={{ marginTop: 14 }}>
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All ({all.length})</button>
            {classes.map(c => (
              <button key={c.tclass} className={filter === c.tclass ? 'active' : ''} onClick={() => setFilter(c.tclass)}>
                {c.tclass} ({c.games})
              </button>
            ))}
          </div>

          <div className="dash-cards">
            <div className="metric"><span>Games reviewed</span><b>{sum.games}</b><small>{filter === 'all' ? 'all speeds' : filter}</small></div>
            <div className="metric"><span>Avg accuracy</span><b>{sum.avgAcc ?? '—'}{sum.avgAcc != null ? '%' : ''}</b><small>your side</small></div>
            <div className="metric"><span>Record</span><b>{sum.rec.win}-{sum.rec.loss}-{sum.rec.draw}</b><small>W-L-D</small></div>
            <div className="metric"><span>Blunders / game</span><b>{sum.blundersPerGame ?? '—'}</b><small>incl. missed wins</small></div>
          </div>

          <Collapse id="dash-acc" title="Accuracy over time" defaultOpen>
            <AccChart points={points} onOpen={onOpenRecord} />
            <p className="sum-hint">Each dot is a game — green won, red lost. Tap a dot to reopen that review.</p>
          </Collapse>

          <Collapse id="dash-err" title="Mistakes per game" defaultOpen>
            <ErrChart points={points} onOpen={onOpenRecord} />
            <p className="sum-hint"><span style={{ color: 'var(--red)' }}>■</span> blunders&nbsp;&nbsp;<span style={{ color: 'var(--orange)' }}>■</span> mistakes&nbsp;&nbsp;<span style={{ color: 'var(--amber)' }}>■</span> inaccuracies</p>
          </Collapse>

          <Collapse id="dash-open" title="Openings" defaultOpen>
            <div className="dash-table">
              <div className="dt-row dt-head"><span>Opening</span><span>Games</span><span>Score</span><span>Acc</span></div>
              {openings.slice(0, 10).map(o => (
                <div className="dt-row" key={o.family}>
                  <span className="dt-name">{o.family}</span>
                  <span>{o.games}</span>
                  <span style={{ color: scoreColor(o) }}>{Math.round(((o.wins + o.draws / 2) / o.games) * 100)}%</span>
                  <span>{o.accN ? Math.round(o.accSum / o.accN) + '%' : '—'}</span>
                </div>
              ))}
              {!openings.length && <p className="sum-hint">No opening data yet.</p>}
            </div>
          </Collapse>
        </>
      )}
    </section>
  );
}

function scoreColor(o: { wins: number; draws: number; games: number }) {
  const s = (o.wins + o.draws / 2) / o.games;
  return s >= 0.55 ? 'var(--green)' : s >= 0.45 ? 'var(--amber)' : 'var(--red)';
}

function AccChart({ points, onOpen }: { points: GamePoint[]; onOpen: (id: string) => void }) {
  const W = 1000, H = 220, PAD = 26;
  const withAcc = points.filter(p => p.acc != null);
  if (withAcc.length < 2) return <p className="sum-hint">Review at least two games to see the trend.</p>;
  const x = (i: number) => PAD + (i / (withAcc.length - 1)) * (W - PAD * 2);
  const y = (a: number) => H - PAD - ((a - 40) / 60) * (H - PAD * 2); // 40–100% window
  const clampY = (a: number) => Math.max(PAD, Math.min(H - PAD, y(a)));
  let d = '';
  withAcc.forEach((p, i) => { d += (i ? ' L' : 'M') + x(i) + ',' + clampY(p.acc!); });
  return (
    <svg className="dash-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {[50, 70, 90].map(g => (
        <g key={g}>
          <line x1={PAD} x2={W - PAD} y1={clampY(g)} y2={clampY(g)} stroke="rgba(255,255,255,.1)" strokeDasharray="4 5" />
          <text x={2} y={clampY(g) + 4} fill="var(--muted)" fontSize={13}>{g}</text>
        </g>
      ))}
      <path d={d} fill="none" stroke="var(--blue)" strokeWidth={2.5} />
      {withAcc.map((p, i) => (
        <circle key={p.id + i} cx={x(i)} cy={clampY(p.acc!)} r={7} fill={RESULT_COLOR[p.result]}
          style={{ cursor: 'pointer' }} onClick={() => onOpen(p.id)}>
          <title>{`vs ${p.opponent} · ${p.acc}% · ${p.result}`}</title>
        </circle>
      ))}
    </svg>
  );
}

function ErrChart({ points, onOpen }: { points: GamePoint[]; onOpen: (id: string) => void }) {
  const W = 1000, H = 170, PAD = 8;
  if (!points.length) return null;
  const bw = Math.min(46, (W - PAD * 2) / points.length - 4);
  const maxErr = Math.max(3, ...points.map(p => p.blunders + p.mistakes + p.inaccuracies));
  const hOf = (n: number) => (n / maxErr) * (H - 24);
  return (
    <svg className="dash-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: 110 }}>
      {points.map((p, i) => {
        const xx = PAD + (i / Math.max(1, points.length - 1)) * (W - PAD * 2 - bw);
        let yy = H - 6;
        const seg = (n: number, color: string, key: string) => {
          const h = hOf(n); yy -= h;
          return n ? <rect key={key} x={xx} y={yy} width={bw} height={h} fill={color} rx={3} /> : null;
        };
        return (
          <g key={p.id + i} style={{ cursor: 'pointer' }} onClick={() => onOpen(p.id)}>
            <title>{`vs ${p.opponent}: ${p.blunders}?? ${p.mistakes}? ${p.inaccuracies}?!`}</title>
            {seg(p.inaccuracies, 'var(--amber)', 'i')}
            {seg(p.mistakes, 'var(--orange)', 'm')}
            {seg(p.blunders, 'var(--red)', 'b')}
          </g>
        );
      })}
    </svg>
  );
}
