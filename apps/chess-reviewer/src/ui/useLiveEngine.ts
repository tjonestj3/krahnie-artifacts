import { useEffect, useRef, useState } from 'react';
import { Engine } from '../lib/engine.js';
import type { EngineUpdate } from '../lib/types';

// A persistent engine dedicated to interactive analysis of the current board position,
// separate from the batch review pool so the two never contend.
export function useLiveEngine(workerUrl: string, fen: string, enabled: boolean, multiPv = 3) {
  const [update, setUpdate] = useState<EngineUpdate | null>(null);
  const engineRef = useRef<any>(null);
  const chain = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    engineRef.current = new Engine(workerUrl, { hashMB: 64, multiPv });
    return () => { engineRef.current?.dispose?.(); engineRef.current = null; };
  }, [workerUrl]);

  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    let cancelled = false;
    setUpdate(null);
    chain.current = chain.current.then(async () => {
      await e.stopLive();
      if (cancelled || !enabled) return;
      await e.analyzeLive(fen, { multiPv, onUpdate: (u: EngineUpdate) => { if (!cancelled) setUpdate(u); } });
    }).catch(() => {});
    return () => { cancelled = true; chain.current = chain.current.then(() => e.stopLive()).catch(() => {}); };
  }, [fen, enabled, multiPv]);

  return update;
}
