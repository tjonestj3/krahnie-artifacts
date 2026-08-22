// stats.ts — cross-game aggregates over the locally saved reviews. Pure functions.
import type { ReviewedGame } from './types';

export interface GamePoint {
  id: string;
  playedAt: number;
  acc: number | null;          // user's accuracy
  result: 'win' | 'loss' | 'draw';
  tclass: string;
  blunders: number; mistakes: number; inaccuracies: number;
  brilliant: number; great: number;
  eco: string | null; openingName: string | null; family: string | null;
  opponent: string; opponentRating: number | null;
}

export interface OpeningStat { family: string; games: number; wins: number; draws: number; losses: number; accSum: number; accN: number; }

export function openingFamily(name: string | null | undefined): string | null {
  if (!name) return null;
  return name.split(':')[0].trim();
}

function resultFor(g: ReviewedGame): 'win' | 'loss' | 'draw' {
  if (g.result === '1/2-1/2' || !g.result) return 'draw';
  return (g.result === '1-0') === (g.perspective === 'white') ? 'win' : 'loss';
}

// Only completed reviews where we know which side the user played.
export function userGames(games: ReviewedGame[]): GamePoint[] {
  return games
    .filter(g => g.perspective && g.analysis?.status === 'complete' && g.tallies)
    .map(g => {
      const side = g.perspective!;
      const t = g.tallies![side];
      return {
        id: g.id,
        playedAt: g.playedAt || g.importedAt,
        acc: g.accuracy?.[side] ?? null,
        result: resultFor(g),
        tclass: g.timeControl?.class || 'unknown',
        blunders: (t.blunder || 0) + (t.miss || 0),
        mistakes: t.mistake || 0,
        inaccuracies: t.inaccuracy || 0,
        brilliant: t.brilliant || 0, great: t.great || 0,
        eco: g.eco, openingName: g.openingName, family: openingFamily(g.openingName),
        opponent: side === 'white' ? g.black.name : g.white.name,
        opponentRating: side === 'white' ? g.black.rating : g.white.rating,
      };
    })
    .sort((a, b) => a.playedAt - b.playedAt);
}

export function summarize(points: GamePoint[]) {
  const withAcc = points.filter(p => p.acc != null);
  const avgAcc = withAcc.length ? Math.round(withAcc.reduce((s, p) => s + p.acc!, 0) / withAcc.length * 10) / 10 : null;
  const rec = { win: 0, loss: 0, draw: 0 };
  points.forEach(p => rec[p.result]++);
  const blundersPerGame = points.length
    ? Math.round(points.reduce((s, p) => s + p.blunders, 0) / points.length * 10) / 10 : null;
  return { games: points.length, avgAcc, rec, blundersPerGame };
}

export function byOpening(points: GamePoint[]): OpeningStat[] {
  const map = new Map<string, OpeningStat>();
  for (const p of points) {
    if (!p.family) continue;
    let s = map.get(p.family);
    if (!s) { s = { family: p.family, games: 0, wins: 0, draws: 0, losses: 0, accSum: 0, accN: 0 }; map.set(p.family, s); }
    s.games++;
    if (p.result === 'win') s.wins++; else if (p.result === 'draw') s.draws++; else s.losses++;
    if (p.acc != null) { s.accSum += p.acc; s.accN++; }
  }
  return [...map.values()].sort((a, b) => b.games - a.games);
}

export function byClass(points: GamePoint[]) {
  const map = new Map<string, { tclass: string; games: number; wins: number; accSum: number; accN: number }>();
  for (const p of points) {
    let s = map.get(p.tclass);
    if (!s) { s = { tclass: p.tclass, games: 0, wins: 0, accSum: 0, accN: 0 }; map.set(p.tclass, s); }
    s.games++;
    if (p.result === 'win') s.wins++;
    if (p.acc != null) { s.accSum += p.acc; s.accN++; }
  }
  return [...map.values()].sort((a, b) => b.games - a.games);
}

// For the coach card: "You've played this opening N times, scoring X%."
export function openingLine(points: GamePoint[], openingName: string | null): string | null {
  const family = openingFamily(openingName);
  if (!family) return null;
  const mine = points.filter(p => p.family === family);
  if (mine.length < 2) return null;
  const wins = mine.filter(p => p.result === 'win').length;
  const draws = mine.filter(p => p.result === 'draw').length;
  const score = Math.round(((wins + draws / 2) / mine.length) * 100);
  return `You've played the ${family} ${mine.length} times in reviewed games, scoring ${score}%.`;
}
