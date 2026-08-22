import { Fragment, useEffect, useRef } from 'react';
import type { TreeNode } from '../lib/gametree';
import { BADGE, LABEL_TEXT, type Label } from '../lib/labels';

interface Props {
  root: TreeNode;
  currentId: number;
  onNav: (node: TreeNode) => void;
  onDelete: (node: TreeNode) => void;
  onPromote: (node: TreeNode) => void;
}

const numberFor = (ply: number, lineStart: boolean) =>
  ply % 2 === 1 ? `${Math.ceil(ply / 2)}.` : (lineStart ? `${ply / 2}…` : '');

function MoveToken({ node, currentId, onNav, lineStart, variation }: {
  node: TreeNode; currentId: number; onNav: (n: TreeNode) => void; lineStart: boolean; variation: boolean;
}) {
  const num = numberFor(node.ply, lineStart);
  const label = node.review?.label as Label | null | undefined;
  const showBadge = label && label !== 'excellent' && label !== 'good';
  return (
    <>
      {num && <span className="movenum">{num}</span>}
      <span className={'mv' + (node.id === currentId ? ' active' : '') + (variation ? ' variation' : '')}
        onClick={() => onNav(node)} title={label ? LABEL_TEXT[label] : undefined}>
        {node.san}
        {showBadge && <span className={'mbadge ' + label}>{BADGE[label!]}</span>}
      </span>
    </>
  );
}

// Render every move from position `pos`: mainline inline, alternatives as nested blocks.
function renderFrom(pos: TreeNode, currentId: number, onNav: (n: TreeNode) => void,
  onDelete: (n: TreeNode) => void, onPromote: (n: TreeNode) => void, lineStart: boolean): JSX.Element[] {
  const main = pos.children[0];
  if (!main) return [];
  const out: JSX.Element[] = [];
  out.push(<MoveToken key={main.id} node={main} currentId={currentId} onNav={onNav} lineStart={lineStart} variation={!main.isMainline} />);
  pos.children.slice(1).forEach(alt => {
    out.push(
      <span key={'v' + alt.id} className="variation-block">
        <MoveToken node={alt} currentId={currentId} onNav={onNav} lineStart={true} variation />
        {renderFrom(alt, currentId, onNav, onDelete, onPromote, false)}
        {' '}
        <button className="coach-btn sm" title="Promote variation" onClick={() => onPromote(alt)}>↑</button>
        <button className="coach-btn sm" title="Delete variation" onClick={() => onDelete(alt)}>✕</button>
      </span>
    );
  });
  out.push(...renderFrom(main, currentId, onNav, onDelete, onPromote, false));
  return out;
}

export function MoveTree({ root, currentId, onNav, onDelete, onPromote }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Keep the active move visible by scrolling the PANEL only — never the page
  // (scrollIntoView would bounce the whole viewport while stepping).
  useEffect(() => {
    const panel = panelRef.current;
    const active = panel?.querySelector('.mv.active') as HTMLElement | null;
    if (!panel || !active) return;
    const top = active.offsetTop - panel.offsetTop;
    const bottom = top + active.offsetHeight;
    if (top < panel.scrollTop + 8) panel.scrollTop = top - 40;
    else if (bottom > panel.scrollTop + panel.clientHeight - 8) panel.scrollTop = bottom - panel.clientHeight + 40;
  }, [currentId]);
  return (
    <div className="panel moves-panel" ref={panelRef}>
      {root.children.length === 0
        ? <span className="lede" style={{ fontSize: 13 }}>No moves.</span>
        : <Fragment>{renderFrom(root, currentId, onNav, onDelete, onPromote, true)}</Fragment>}
    </div>
  );
}
