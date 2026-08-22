import { Fragment, useEffect, useRef, type ReactNode } from 'react';
import type { TreeNode } from '../lib/gametree';
import { BADGE, LABEL_TEXT, type Label } from '../lib/labels';

interface Props {
  root: TreeNode;
  currentId: number;
  onNav: (node: TreeNode) => void;
  onDelete: (node: TreeNode) => void;
  onPromote: (node: TreeNode) => void;
}

function badgeFor(node: TreeNode): ReactNode {
  const label = node.review?.label as Label | null | undefined;
  if (!label || label === 'excellent' || label === 'good') return null;
  return <span className={'mbadge ' + label} title={LABEL_TEXT[label]}>{BADGE[label]}</span>;
}

// Mainline cell — chess.com style: [badge] SAN inside a numbered two-column row.
function MoveCell({ node, currentId, onNav }: { node: TreeNode; currentId: number; onNav: (n: TreeNode) => void }) {
  return (
    <span className={'mcell' + (node.id === currentId ? ' active' : '')} onClick={() => onNav(node)}>
      {badgeFor(node)}{node.san}
    </span>
  );
}

// Inline flow renderer for variation lines (nested variations render as nested parens).
const numberFor = (ply: number, lineStart: boolean) =>
  ply % 2 === 1 ? `${Math.ceil(ply / 2)}.` : (lineStart ? `${ply / 2}…` : '');

function VarToken({ node, currentId, onNav, lineStart }: { node: TreeNode; currentId: number; onNav: (n: TreeNode) => void; lineStart: boolean }) {
  const num = numberFor(node.ply, lineStart);
  return (
    <>
      {num && <span className="movenum">{num}</span>}
      <span className={'mv variation' + (node.id === currentId ? ' active' : '')} onClick={() => onNav(node)}>
        {node.san}{badgeFor(node)}
      </span>
    </>
  );
}

function renderVarLine(start: TreeNode, currentId: number, onNav: (n: TreeNode) => void): ReactNode[] {
  const out: ReactNode[] = [<VarToken key={start.id} node={start} currentId={currentId} onNav={onNav} lineStart />];
  let n = start;
  while (n.children.length) {
    const main = n.children[0];
    out.push(<VarToken key={main.id} node={main} currentId={currentId} onNav={onNav} lineStart={false} />);
    n.children.slice(1).forEach(alt => {
      out.push(<span key={'p' + alt.id} className="movenum">(</span>);
      out.push(...renderVarLine(alt, currentId, onNav));
      out.push(<span key={'q' + alt.id} className="movenum">)</span>);
    });
    n = main;
  }
  return out;
}

export function MoveTree({ root, currentId, onNav, onDelete, onPromote }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Track the active move by scrolling the PANEL only — never the page.
  useEffect(() => {
    const panel = panelRef.current;
    const active = panel?.querySelector('.mcell.active, .mv.active') as HTMLElement | null;
    if (!panel || !active) return;
    const top = active.offsetTop - panel.offsetTop;
    const bottom = top + active.offsetHeight;
    if (top < panel.scrollTop + 8) panel.scrollTop = top - 60;
    else if (bottom > panel.scrollTop + panel.clientHeight - 8) panel.scrollTop = bottom - panel.clientHeight + 60;
  }, [currentId]);

  // mainline nodes in order
  const mainline: TreeNode[] = [];
  { let n = root; while (n.children[0]) { mainline.push(n.children[0]); n = n.children[0]; } }

  const rows: ReactNode[] = [];
  for (let i = 0; i < mainline.length; i += 2) {
    const w = mainline[i], b = mainline[i + 1];
    rows.push(
      <div className="mrow" key={w.id}>
        <span className="mnum">{i / 2 + 1}.</span>
        <MoveCell node={w} currentId={currentId} onNav={onNav} />
        {b ? <MoveCell node={b} currentId={currentId} onNav={onNav} /> : <span />}
      </div>
    );
    for (const node of [w, b]) {
      if (!node?.parent) continue;
      for (const alt of node.parent.children.slice(1)) {
        rows.push(
          <div className="var-row" key={'v' + alt.id}>
            {renderVarLine(alt, currentId, onNav)}
            {' '}
            <button className="coach-btn sm" title="Promote variation" onClick={() => onPromote(alt)}>↑</button>
            <button className="coach-btn sm" title="Delete variation" onClick={() => onDelete(alt)}>✕</button>
          </div>
        );
      }
    }
  }

  return (
    <div className="moves-panel" ref={panelRef} style={{ maxHeight: 380, overflowY: 'auto' }}>
      {rows.length === 0
        ? <span className="lede" style={{ fontSize: 13 }}>No moves.</span>
        : <Fragment>{rows}</Fragment>}
    </div>
  );
}
