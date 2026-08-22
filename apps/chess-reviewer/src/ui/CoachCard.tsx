import type { TreeNode } from '../lib/gametree';
import { BADGE, LABEL_TEXT, fmtEval, type Label } from '../lib/labels';
import type { ReviewedGame } from '../lib/types';

// The chess.com-style coach comment: "dxe4 is the last book move  [+0.22]" with a
// context line underneath. Fixed height so stepping never shifts the layout.
export function CoachCard({ node, game }: { node: TreeNode; game: ReviewedGame }) {
  if (node.ply === 0) {
    return (
      <div className="coach-card">
        <div className="head"><b>Let's review your game.</b></div>
        <div className="sub">Step with the green button or arrow keys. Play any move on the board to explore your own line — press <b>e</b> for the engine's top 3 lines.</div>
      </div>
    );
  }
  const m = node.review;
  if (!node.isMainline || !m) {
    return (
      <div className="coach-card">
        <div className="head"><b>{node.san} — your line</b></div>
        <div className="sub">You're exploring a variation. Turn the engine on (<b>e</b>) to evaluate it live, or use the move list to jump back to the game.</div>
      </div>
    );
  }
  const label = m.label as Label | null;
  const moveNo = `${Math.ceil(m.ply / 2)}${m.mover === 'w' ? '.' : '…'}`;
  const isLastBook = label === 'book' && nextMainline(node)?.review?.label !== 'book';
  const headline = label ? headlineFor(m.san, label, isLastBook) : `${m.san}`;
  return (
    <div className="coach-card">
      <div className="head">
        {label && <span className={'chip-lbl ' + label}>{BADGE[label]}</span>}
        <b>{moveNo} {headline}</b>
        {m.evalAfter && <span className="eval-chip">{fmtEval(m.evalAfter)}</span>}
      </div>
      <div className="sub">{subFor(m, label, game)}</div>
    </div>
  );
}

function nextMainline(node: TreeNode): TreeNode | undefined { return node.children[0]; }

function headlineFor(san: string, label: Label, lastBook: boolean): string {
  switch (label) {
    case 'book': return lastBook ? `${san} is the last book move` : `${san} is a book move`;
    case 'brilliant': return `${san} is brilliant!`;
    case 'great': return `${san} is a great move`;
    case 'best': return `${san} is best`;
    case 'excellent': return `${san} is excellent`;
    case 'good': return `${san} is good`;
    case 'inaccuracy': return `${san} is an inaccuracy`;
    case 'mistake': return `${san} is a mistake`;
    case 'blunder': return `${san} is a blunder`;
    case 'miss': return `${san} missed a win`;
  }
}

function subFor(m: any, label: Label | null, game: ReviewedGame): string {
  if (label === 'book') return game.openingName ? `This is the ${game.openingName}${game.eco ? ` (${game.eco})` : ''}.` : 'Still in known opening theory.';
  const better = m.bestSan ? `${m.bestSan} was best.` : '';
  const loss = m.winLoss != null && m.winLoss >= 5 ? ` This cost about ${Math.round(m.winLoss)}% win chance.` : '';
  switch (label) {
    case 'brilliant': return 'A real sacrifice — and the engine agrees it works. Take a bow.';
    case 'great': return 'The only move that holds everything together. Well spotted.';
    case 'best': return 'Exactly what the engine would play.';
    case 'excellent': case 'good': return 'A solid choice that keeps your position healthy.';
    case 'inaccuracy': return `Slightly loose. ${better}${loss}`;
    case 'mistake': return `${better} ${loss || 'This let the advantage slip.'}`;
    case 'blunder': return `${better}${loss || ' This swings the game.'} Look for the green arrow.`;
    case 'miss': return `There was a win here — ${better}${loss}`;
    default: return '';
  }
}
