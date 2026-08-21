// enginepool.js — a pool of independent single-thread Stockfish workers that analyze
// different positions concurrently. Uses many CPU cores WITHOUT SharedArrayBuffer /
// cross-origin isolation, so it works on GitHub Pages and iOS Safari as-is.
// Trade-off vs one engine: no shared transposition table between positions (each
// worker starts each position cold) in exchange for ~Nx wall-clock on N cores.
import { Engine } from './engine.js';

// Pick a safe worker count: leave a core for the UI, go easy on phones (memory).
export function poolSize() {
  const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4;
  const mobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
  return mobile ? Math.max(1, Math.min(3, cores - 1)) : Math.max(1, Math.min(6, cores - 1));
}

export class EnginePool {
  constructor(workerUrl, { size = poolSize(), hashMB = 16, multiPv = 2 } = {}) {
    this.workerUrl = workerUrl;
    this.size = size;
    this.engines = Array.from({ length: size }, () => new Engine(workerUrl, { hashMB, multiPv }));
  }

  async init() { await Promise.all(this.engines.map(e => e.init())); }

  // Analyze many FENs concurrently. results[i] aligns with fens[i].
  // onResult({index, eval}) fires as each position completes (out of order).
  async analyzeMany(fens, opts, { onResult, token } = {}) {
    const results = new Array(fens.length);
    let next = 0;
    const worker = async (engine) => {
      await engine.newGame();
      while (true) {
        if (token?.cancelled) return;
        const i = next++;
        if (i >= fens.length) return;
        if (fens[i] == null) continue; // caller pre-filled (e.g. terminal position)
        results[i] = await engine.analyze(fens[i], opts);
        onResult?.({ index: i, eval: results[i] });
      }
    };
    await Promise.all(this.engines.map(worker));
    return results;
  }

  dispose() { this.engines.forEach(e => e.dispose()); this.engines = []; }
}
