// labels.ts — pure display constants/helpers for move classifications (no DOM).
export type Label =
  | 'brilliant' | 'great' | 'best' | 'excellent' | 'good'
  | 'book' | 'inaccuracy' | 'mistake' | 'blunder' | 'miss';

export const BADGE: Record<Label, string> = {
  brilliant: '!!', great: '!', best: '★', excellent: '✓', good: 'ok',
  book: '≡', inaccuracy: '?!', mistake: '?', blunder: '??', miss: '✗',
};

export const LABEL_TEXT: Record<Label, string> = {
  brilliant: 'Brilliant', great: 'Great move', best: 'Best move', excellent: 'Excellent',
  good: 'Good', book: 'Book', inaccuracy: 'Inaccuracy', mistake: 'Mistake',
  blunder: 'Blunder', miss: 'Missed win',
};

export const LABEL_ORDER: Label[] = [
  'brilliant', 'great', 'best', 'excellent', 'good', 'book',
  'inaccuracy', 'mistake', 'blunder', 'miss',
];

export const FLAGGED = new Set<Label>(['inaccuracy', 'mistake', 'blunder', 'miss']);
export const GOODISH = new Set<Label>(['brilliant', 'great', 'best']);

export type Eval = { cp?: number; mate?: number };

export function fmtEval(ev: Eval | null | undefined): string {
  if (!ev) return '—';
  if (ev.mate != null) return (ev.mate > 0 ? '#' : '#−') + Math.abs(ev.mate);
  const p = (ev.cp ?? 0) / 100;
  return (p > 0 ? '+' : '') + p.toFixed(1);
}

export function markerColor(label: Label): string {
  return ({
    brilliant: 'var(--teal)', great: 'var(--blue)', inaccuracy: 'var(--amber)',
    mistake: 'var(--orange)', blunder: 'var(--red)', miss: '#ff8fa3',
  } as Record<string, string>)[label] || 'var(--muted)';
}
