import { useEffect, useRef, useState } from 'react';
import { Engine } from '../lib/engine.js';
import type { EngineUpdate } from '../lib/types';

export interface LiveEval extends EngineUpdate { fen: string; }

// A persistent engine dedicated to interactive analysis of the current board position,
// separate from the batch review pool so the two never contend.
// Snappiness: restarts are debounced (fast stepping doesn't thrash the engine), and the
// previous position's lines are kept (marked stale) so the panel never collapses.
export function useLiveEngine(workerUrl: string, fen: string, enabled: boolean, multiPv = 3) {
  const [update, setUpdate] = useState<LiveEval | null>(null);
  const [thinking, setThinking] = useState(false);
  const engineRef = useRef<any>(null);
  const chain = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    engineRef.current = new Engine(workerUrl, { hashMB: 64, multiPv });
    return () => { engineRef.current?.dispose?.(); engineRef.current = null; };
  }, [workerUrl]);

  useEffect(() => {
    const e = engineRef.current;
    if (!e || !enabled) { setThinking(false); return; }
    let cancelled = false;
    setThinking(true);
    const t = setTimeout(() => {
      chain.current = chain.current.then(async () => {
        await e.stopLive();
        if (cancelled) return;
        await e.analyzeLive(fen, {
          multiPv,
          onUpdate: (u: EngineUpdate) => { if (!cancelled) { setUpdate({ ...u, fen }); setThinking(false); } },
        });
      }).catch(() => {});
    }, 160); // debounce: holding an arrow key steps through without engine churn
    return () => { cancelled = true; clearTimeout(t); chain.current = chain.current.then(() => e.stopLive()).catch(() => {}); };
  }, [fen, enabled, multiPv]);

  return { update, thinking: enabled && thinking };
}
