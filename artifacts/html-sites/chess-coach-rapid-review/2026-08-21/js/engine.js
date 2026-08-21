// engine.js — Stockfish WASM worker client. Single-thread build (no COOP/COEP needed).
// All scores are normalized to WHITE-CENTRIC here, at the parse boundary — nothing
// downstream ever sees a side-to-move score.

export class Engine {
  constructor(workerUrl) {
    this.workerUrl = workerUrl;
    this.worker = null;
    this.ready = null;
    this.job = null;          // current `go` in flight
    this.queue = Promise.resolve(); // serializes go's
    this.listeners = [];
  }

  init() {
    if (this.ready) return this.ready;
    this.worker = new Worker(this.workerUrl);
    this.worker.onmessage = e => this._onLine(String(e.data));
    this.ready = (async () => {
      await this._send('uci', l => l === 'uciok');
      this._post('setoption name Hash value 32');
      this._post('setoption name MultiPV value 2');
      await this._send('isready', l => l === 'readyok');
    })();
    return this.ready;
  }

  _post(cmd) { this.worker.postMessage(cmd); }

  _send(cmd, until) {
    return new Promise(resolve => {
      this.listeners.push({ until, resolve });
      this._post(cmd);
    });
  }

  _onLine(line) {
    for (let i = 0; i < this.listeners.length; i++) {
      if (this.listeners[i].until(line)) {
        this.listeners.splice(i, 1)[0].resolve(line);
        return;
      }
    }
    if (this.job) this.job.onLine(line);
  }

  async newGame() {
    await this.init();
    this._post('ucinewgame');
    await this._send('isready', l => l === 'readyok');
  }

  // Analyze one FEN. Returns { depth, pvs: [{cp?|mate?, pv:[uci..]}, ...] } — White-centric,
  // pvs[0] = best line, pvs[1] = second best (when MultiPV 2 and legal moves allow).
  analyze(fen, { movetime = 750, depth = 18 } = {}) {
    const run = async () => {
      await this.init();
      const blackToMove = fen.split(' ')[1] === 'b';
      const best = {}; // multipv index → {depth, score, pv}
      let done;
      const finished = new Promise(r => { done = r; });
      this.job = {
        onLine: line => {
          if (line.startsWith('bestmove')) { done(); return; }
          if (!line.startsWith('info ') || !line.includes(' pv ') || !line.includes('score')) return;
          if (line.includes('lowerbound') || line.includes('upperbound')) return;
          const m = line.match(/\bdepth (\d+)(?:.*?\bmultipv (\d+))?.*?\bscore (cp|mate) (-?\d+).*?\bpv (.+)$/);
          if (!m) return;
          const [, d, mpv, kind, val, pv] = m;
          const idx = (mpv ? +mpv : 1) - 1;
          if (best[idx] && best[idx].depth > +d) return;
          best[idx] = { depth: +d, kind, val: +val, pv: pv.trim().split(/\s+/).slice(0, 8) };
        },
      };
      this._post(`position fen ${fen}`);
      this._post(`go movetime ${movetime} depth ${depth}`);
      await finished;
      this.job = null;
      const pvs = [0, 1].filter(i => best[i]).map(i => {
        const b = best[i];
        const sign = blackToMove ? -1 : 1; // normalize side-to-move → White-centric
        return b.kind === 'mate'
          ? { mate: sign * b.val, pv: b.pv }
          : { cp: sign * b.val, pv: b.pv };
      });
      return { depth: best[0]?.depth ?? 0, pvs };
    };
    const result = this.queue.then(run, run);
    this.queue = result.then(() => {}, () => {});
    return result;
  }

  // Abort the current search (worker stays alive; the flushed bestmove resolves the job).
  stop() { if (this.job) this._post('stop'); }

  dispose() {
    try { this.worker?.terminate(); } catch {}
    this.worker = null;
    this.ready = null;
  }
}
