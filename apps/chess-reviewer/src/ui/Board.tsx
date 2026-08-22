import { useEffect, useRef } from 'react';
import { Chessground } from 'chessground';

export interface Shape { orig: string; dest?: string; brush: string; }
export interface BoardProps {
  fen: string;
  orientation?: 'white' | 'black';
  lastMove?: [string, string] | null;
  shapes?: Shape[];
  dests?: Map<string, string[]>;      // legal destinations → interactive
  movableColor?: 'white' | 'black';
  onMove?: (from: string, to: string) => void;
  viewOnly?: boolean;
}

export function Board(props: BoardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const cg = useRef<any>(null);

  useEffect(() => {
    if (!ref.current) return;
    cg.current = Chessground(ref.current, { animation: { duration: 120 }, coordinates: true });
    return () => { cg.current?.destroy?.(); cg.current = null; };
  }, []);

  useEffect(() => {
    if (!cg.current) return;
    const interactive = !!props.dests && !!props.movableColor && !props.viewOnly;
    cg.current.set({
      fen: props.fen,
      orientation: props.orientation || 'white',
      lastMove: props.lastMove || undefined,
      viewOnly: !!props.viewOnly,
      turnColor: props.movableColor || (props.fen.split(' ')[1] === 'b' ? 'black' : 'white'),
      movable: {
        free: false,
        color: interactive ? props.movableColor : undefined,
        dests: props.dests,
        showDests: true,
        events: { after: (from: string, to: string) => props.onMove?.(from, to) },
      },
      draggable: { enabled: interactive },
      selectable: { enabled: interactive },
      drawable: { enabled: true, autoShapes: (props.shapes || []) as any },
    });
  });

  return <div className="board-box"><div ref={ref} className="cg-wrap" /></div>;
}
