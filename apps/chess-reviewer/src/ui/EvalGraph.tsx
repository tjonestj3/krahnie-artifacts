import { markerColor, FLAGGED, type Label } from '../lib/labels';
import type { ReviewedMove } from '../lib/types';

interface Props {
  whiteWins: number[] | null;   // white win% per position (0..n)
  moves: ReviewedMove[];
  ply: number;
  onSeek: (ply: number) => void;
}

// SVG win%-over-time graph. Markers on notable moves; click to jump.
export function EvalGraph({ whiteWins, moves, ply, onSeek }: Props) {
  const W = 1000, H = 200;
  if (!whiteWins || whiteWins.length < 2) {
    return <svg className="eval-graph" viewBox={`0 0 ${W} ${H}`} />;
  }
  const n = moves.length + 1;
  const x = (i: number) => (i / Math.max(1, n - 1)) * W;
  const y = (w: number) => H - (w / 100) * H;
  let d = `M0,${y(whiteWins[0])}`;
  for (let i = 1; i < whiteWins.length; i++) d += ` L${x(i)},${y(whiteWins[i])}`;
  const area = `${d} L${x(whiteWins.length - 1)},${H} L0,${H} Z`;
  const notable = ['brilliant', 'great', 'inaccuracy', 'mistake', 'blunder', 'miss'];
  const markers = moves
    .map((m, i) => ({ m, i }))
    .filter(({ m, i }) => i + 1 < whiteWins.length && m.label && notable.includes(m.label));

  return (
    <svg className="eval-graph" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
      onClick={e => {
        const r = (e.currentTarget as SVGElement).getBoundingClientRect();
        onSeek(Math.round(((e.clientX - r.left) / r.width) * (n - 1)));
      }}>
      <rect x="0" y="0" width={W} height={H / 2} fill="rgba(255,255,255,.05)" />
      <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="rgba(255,255,255,.25)" strokeDasharray="4 4" />
      <path d={area} fill="rgba(110,231,255,.14)" />
      <path d={d} fill="none" stroke="var(--blue)" strokeWidth={2.5} />
      <line x1={x(ply)} x2={x(ply)} y1="0" y2={H} stroke="var(--gold)" strokeWidth={2} opacity={0.85} />
      {markers.map(({ m, i }) => (
        <circle key={i} cx={x(i + 1)} cy={y(whiteWins[i + 1])} r={6}
          fill={markerColor(m.label as Label)} style={{ cursor: 'pointer' }}
          onClick={ev => { ev.stopPropagation(); onSeek(i + 1); }}>
          <title>{`${Math.ceil(m.ply / 2)}${m.mover === 'w' ? '.' : '…'} ${m.san}`}</title>
        </circle>
      ))}
    </svg>
  );
}
