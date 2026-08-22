import { useEffect, useRef, useState } from 'react';
import { ImportScreen } from './ImportScreen';
import { ReviewScreen, type AnalysisState } from './ReviewScreen';
import { Dashboard } from './Dashboard';
import { userGames, openingLine } from '../lib/stats';
import { buildTimeline, analyzeFullPool, analyzeHybrid, classifyGame } from '../lib/analyze.js';
import { EnginePool, poolSize } from '../lib/enginepool.js';
import { Engine } from '../lib/engine.js';
import { loadOpenings } from '../lib/openings.js';
import { putGame, getGame, allGames, metaGet, metaSet } from '../lib/store.js';
import type { ImportedGame, ReviewedGame } from '../lib/types';

const WORKER_URL = new URL('engine/stockfish-18-lite-single.js', document.baseURI).href;

export function App() {
  const [screen, setScreen] = useState<'import' | 'review' | 'dash'>('import');
  const [records, setRecords] = useState<ReviewedGame[]>([]);
  const [record, setRecord] = useState<ReviewedGame | null>(null);
  const [positions, setPositions] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisState>({ status: 'analyzing', done: 0, total: 1, mode: 'balanced' });
  const [enginePill, setEnginePill] = useState('idle');

  const poolRef = useRef<any>(null);
  const tokenRef = useRef<{ cancelled: boolean } | null>(null);
  const currentGameRef = useRef<{ g: ImportedGame; timeline: any } | null>(null);

  useEffect(() => { loadOpenings().catch(() => {}); refreshRecords(); }, []);

  function refreshRecords() {
    allGames().then((gs: ReviewedGame[]) => setRecords(gs || [])).catch(() => {});
  }

  function getPool() {
    if (!poolRef.current) poolRef.current = new EnginePool(WORKER_URL, { size: poolSize(), hashMB: 16, multiPv: 2 });
    return poolRef.current;
  }

  async function openGame(g: ImportedGame) {
    let timeline;
    try { timeline = buildTimeline(g.sanMoves); }
    catch (e: any) { alert(`Couldn't replay that game: ${e.message}`); return; }
    if (!timeline.moves.length) { alert('That game has no moves.'); return; }

    const existing = g.id ? await getGame(g.id).catch(() => null) as ReviewedGame | null : null;
    if (existing?.analysis?.status === 'complete') return openRecord(existing);

    await loadOpenings().catch(() => {});
    const rec = baseRecord(g, timeline);
    setPositions(timeline.positions);
    setRecord(rec);
    setScreen('review');
    currentGameRef.current = { g, timeline };
    runAnalysis(g, timeline, rec, (await metaGet('mode').catch(() => null)) || 'balanced');
  }

  async function openRecord(rec: ReviewedGame) {
    const timeline = buildTimeline(rec.moves.map((m: any) => m.san));
    setPositions(timeline.positions);
    setRecord(rec);
    setAnalysis({ status: 'complete', done: 1, total: 1, mode: rec.analysis?.mode || 'balanced' });
    setScreen('review');
    setEnginePill('idle');
  }

  async function runAnalysis(g: ImportedGame, timeline: any, rec: ReviewedGame, mode: string) {
    tokenRef.current?.cancelled === false && (tokenRef.current.cancelled = true);
    const token = { cancelled: false };
    tokenRef.current = token;
    const total = timeline.positions.length;
    setAnalysis({ status: 'analyzing', done: 0, total, mode, label: 'starting engines…' });
    setEnginePill('loading');

    try {
      let evals: any[], judgments: any = null, completed = true;
      if (g.lichessEvals?.length) {
        rec.analysis.source = 'lichess+local';
        const eng = new Engine(WORKER_URL, { hashMB: 32, multiPv: 2 });
        const res = await analyzeHybrid(timeline, g.lichessEvals, g.lichessJudgments, eng, {
          token,
          onProgress: ({ index, total: t }: any) => setAnalysis(a => ({ ...a, done: index + 1, total: t, label: `checking key moments ${index + 1}/${t}` })),
        });
        eng.dispose();
        evals = res.evals; judgments = res.judgments;
      } else {
        rec.analysis.source = 'local';
        const pool = getPool();
        const res = await analyzeFullPool(timeline, pool, mode, {
          token,
          onProgress: ({ index, total: t }: any) => setAnalysis(a => ({ ...a, done: index + 1, total: t, label: `analyzing ${index + 1}/${t}` })),
          onCheckpoint: (partial: any[], doneCount: number) => {
            rec.analysis.status = 'partial'; rec.analysis.analyzedThrough = doneCount; rec.analysis.mode = mode;
            if (rec.id) putGame(rec).catch(() => {});
          },
        });
        evals = res.evals; completed = res.completed;
      }

      if (token.cancelled) { setAnalysis(a => ({ ...a, label: 'cancelled' })); setEnginePill('idle'); return; }

      finalizeRecord(rec, g, timeline, evals, judgments);
      rec.analysis.mode = mode; rec.analysis.status = 'complete'; rec.analysis.analyzedThrough = total - 1;
      delete (rec.analysis as any).partialEvals;
      if (rec.id) putGame(rec).then(refreshRecords).catch(() => {});
      setRecord({ ...rec });
      setAnalysis({ status: 'complete', done: total, total, mode });
      setEnginePill('ready');
    } catch (e: any) {
      console.error(e);
      setAnalysis(a => ({ ...a, label: 'analysis failed: ' + e.message }));
      setEnginePill('error');
    }
  }

  function onModeChange(mode: string) {
    metaSet('mode', mode).catch(() => {});
    const cur = currentGameRef.current;
    if (cur && record && analysis.status !== 'complete') runAnalysis(cur.g, cur.timeline, record, mode);
    else setAnalysis(a => ({ ...a, mode }));
  }

  function onCancel() { if (tokenRef.current) tokenRef.current.cancelled = true; }

  const statsPoints = userGames(records);

  return (
    <main className="wrap">
      <header className="topbar">
        <span className="badge">♟ Krahnie Chess Reviewer</span>
        <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {screen === 'import' && <button className="coach-btn sm" onClick={() => setScreen('dash')}>📊 Progress</button>}
          <span className={'pill ' + pillClass(enginePill)}>engine: {enginePill}</span>
        </span>
      </header>

      {screen === 'import' && <ImportScreen onOpen={openGame} onOpenRecord={openRecord} />}
      {screen === 'dash' && (
        <Dashboard games={records} onBack={() => setScreen('import')}
          onOpenRecord={async id => { const rec = await getGame(id).catch(() => null); if (rec) openRecord(rec); }} />
      )}
      {screen === 'review' && record && (
        <ReviewScreen game={record} positions={positions} workerUrl={WORKER_URL} analysis={analysis}
          personalLine={openingLine(statsPoints.filter(p => p.id !== record.id), record.openingName)}
          onBack={() => { onCancel(); setScreen('import'); }} onModeChange={onModeChange} onCancel={onCancel} />
      )}

      <p className="footer">Your own review tool · Stockfish 18 lite (WASM, {poolSize()}-core pool) · games stay on this device</p>
    </main>
  );
}

function pillClass(s: string) { return s === 'ready' ? 'ok' : s === 'error' ? 'err' : s === 'loading' ? 'busy' : ''; }

function baseRecord(g: ImportedGame, timeline: any): ReviewedGame {
  return {
    id: g.id || 'tmp-' + Date.now(), schemaVersion: 1, source: g.source, url: g.url || null,
    importedAt: Date.now(), playedAt: g.playedAt,
    timeControl: g.timeControl, rated: g.rated, result: g.result, termination: g.termination || null,
    white: g.white, black: g.black, perspective: g.perspective || null,
    eco: g.eco || null, openingName: g.openingName || null,
    moves: timeline.moves.map((m: any, i: number) => ({ san: m.san, uci: m.uci, mover: m.mover, ply: m.ply, clk: g.clocks?.[i] ?? null, label: null })),
    whiteWins: null, accuracy: null, acpl: null, tallies: null,
    analysis: { engine: 'sf18-lite-single', mode: null, multipv: 2, source: 'local', status: 'pending', analyzedThrough: -1 },
  };
}

function finalizeRecord(rec: ReviewedGame, g: ImportedGame, timeline: any, evals: any[], judgments: any) {
  const c: any = classifyGame(timeline, evals, { judgments });
  rec.moves = c.moves.map((m: any, i: number) => ({ ...m, clk: rec.moves[i]?.clk ?? null }));
  rec.whiteWins = c.whiteWins.map((w: number) => Math.round(w * 10) / 10);
  rec.accuracy = g.lichessAccuracy?.white != null ? { white: g.lichessAccuracy.white, black: g.lichessAccuracy.black } : c.accuracy;
  rec.acpl = c.acpl;
  rec.tallies = c.tallies;
  rec.eco = rec.eco || c.eco;
  rec.openingName = rec.openingName || c.openingName;
}
