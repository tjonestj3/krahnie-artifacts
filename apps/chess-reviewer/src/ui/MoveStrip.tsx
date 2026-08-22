import { useEffect, useRef } from 'react';
import type { TreeNode } from '../lib/gametree';
import { BADGE, type Label } from '../lib/labels';

// Mobile horizontal move strip (chess.com style): a scrollable ribbon of the mainline,
// centered on the current move. Hidden on desktop via CSS.
export function MoveStrip({ mainline, currentId, onNav }: {
  mainline: TreeNode[]; currentId: number; onNav: (n: TreeNode) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const strip = ref.current;
    const active = strip?.querySelector('.stoken.active') as HTMLElement | null;
    if (!strip || !active) return;
    strip.scrollTo({ left: active.offsetLeft - strip.clientWidth / 2 + active.offsetWidth / 2, behavior: 'smooth' });
  }, [currentId]);
  return (
    <div className="move-strip" ref={ref}>
      {mainline.map(n => {
        const label = n.review?.label as Label | null | undefined;
        const badge = label && label !== 'excellent' && label !== 'good'
          ? <span className={'mbadge ' + label}>{BADGE[label]}</span> : null;
        return (
          <span key={n.id} className={'stoken' + (n.id === currentId ? ' active' : '')} onClick={() => onNav(n)}>
            {n.ply % 2 === 1 && <em>{Math.ceil(n.ply / 2)}.</em>}{badge}{n.san}
          </span>
        );
      })}
    </div>
  );
}
