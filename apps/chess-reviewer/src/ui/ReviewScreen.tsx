import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { Board, type Shape } from './Board';
import { EvalBar, EvalBarH } from './EvalBar';
import { MoveStrip } from './MoveStrip';
import { EnginePanel } from './EnginePanel';
import { MoveTree } from './MoveTree';
import { EvalGraph } from './EvalGraph';
import { Trainer } from './Trainer';
import { useLiveEngine } from './useLiveEngine';
import {
  treeFromMoves, playMove, playUciLine, deleteNode, promoteNode, lastMainlineNode,
  type TreeNode,
} from '../lib/gametree';
import { LABEL_TEXT, FLAGGED, BADGE as BADGE_MAP, type Label, type Eval } from '../lib/labels';
import { Collapse } from './Collapse';
import { CoachCard } from './CoachCard';
import type { ReviewedGame } from '../lib/types';

export interface AnalysisState {
  status: 'analyzing' | 'complete' | 'partial';
  done: number; total: number; mode: string; label?: string;
}

interface Props {
  game: ReviewedGame;
  positions: string[];
  workerUrl: string;
  analysis: AnalysisState;
  onBack: () => void;
  onModeChange: (mode: string) => void;
  onCancel: () => void;
}

function legalDests(fen: string): Map<string, string[]> {
  const c = new Chess(fen);
  const d = new Map<string, string[]>();
  for (const m of c.moves({ verbose: true }) as any[]) {
    if (!d.has(m.from)) d.set(m.from, []);
    d.get(m.from)!.push(m.to);
  }
  return d;
}

export function ReviewScreen({ game, positions, workerUrl, analysis, onBack, onModeChange, onCancel }: Props) {
  const rootRef = useRef<TreeNode>(treeFromMoves(game.moves as any));
  const plyRef = useRef(0);
  // Rebuild the tree when the game loads or its analysis lands — but stay on the
  // same ply, so a completing analysis doesn't yank the user back to move 0.
  useEffect(() => {
    rootRef.current = treeFromMoves(game.moves as any);
    const keepPly = analysis.status === 'complete' ? plyRef.current : 0;
    setCurrent(nodeAtMainlinePly(rootRef.current, keepPly));
    setVer(v => v + 1);
  }, [game.id, analysis.status]);

  const [current, setCurrent] = useState<TreeNode>(rootRef.current);
  useEffect(() => { plyRef.current = current.isMainline ? current.ply : mainlinePly(current); }, [current]);
  const [, setVer] = useState(0);
  const [engineOn, setEngineOn] = useState(false);
  const [hoverUci, setHoverUci] = useState<string[] | null>(null);
  const [orientation, setOrientation] = useState<'white' | 'black'>(game.perspective === 'black' ? 'black' : 'white');
  useEffect(() => { setOrientation(game.perspective === 'black' ? 'black' : 'white'); }, [game.id]);

  const { update: liveUpdate, thinking } = useLiveEngine(workerUrl, current.fen, engineOn, 3);
  const dests = useMemo(() => legalDests(current.fen), [current.fen]);

  const nav = (n: TreeNode | null | undefined) => { if (n) setCurrent(n); };
  const onMove = (from: string, to: string) => {
    const node = playMove(current, { from, to });
    if (node) { setCurrent(node); setVer(v => v + 1); }
  };
  const onPlayLine = (uci: string[]) => { const n = playUciLine(current, uci); setCurrent(n); setVer(v => v + 1); };
  const onDelete = (n: TreeNode) => { const p = deleteNode(n); setVer(v => v + 1); if (isAncestorOrSelf(n, current)) setCurrent(p || rootRef.current); };
  const onPromote = (n: TreeNode) => { promoteNode(n); setVer(v => v + 1); };

  // keyboard nav
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.matches?.('input,textarea,select')) return;
      if (e.key === 'ArrowLeft') { nav(current.parent); e.preventDefault(); }
      else if (e.key === 'ArrowRight' || e.key === ' ') { nav(current.children[0]); e.preventDefault(); }
      else if (e.key === 'Home') { nav(rootRef.current); e.preventDefault(); }
      else if (e.key === 'End') { nav(lastMainlineNode(rootRef.current)); e.preventDefault(); }
      else if (e.key === 'f') setOrientation(o => o === 'white' ? 'black' : 'white');
      else if (e.key === 'e') setEngineOn(v => !v);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [current]);

  // board eval (white-centric): fresh live engine if on, else the review eval after this move
  const liveFresh = engineOn && liveUpdate && liveUpdate.fen === current.fen ? liveUpdate.pvs?.[0] : null;
  const boardEval: Eval | null = liveFresh
    ? (liveFresh.mate != null ? { mate: liveFresh.mate } : { cp: liveFresh.cp })
    : (current.review?.evalAfter ?? (current.ply === 0 ? { cp: 15 } : null));

  // arrows: best-move suggestion for a flagged mainline move, plus hovered PV line
  const shapes: Shape[] = [];
  if (current.review && current.review.label && FLAGGED.has(current.review.label as Label) && current.review.bestUci) {
    shapes.push({ orig: current.review.bestUci.slice(0, 2), dest: current.review.bestUci.slice(2, 4), brush: 'green' });
  }
  if (hoverUci?.[0]) shapes.push({ orig: hoverUci[0].slice(0, 2), dest: hoverUci[0].slice(2, 4), brush: 'blue' });

  const topSide = orientation === 'white' ? 'black' : 'white';
  const botSide = orientation === 'white' ? 'white' : 'black';

  const mainline = useMemo(() => {
    const line: TreeNode[] = [];
    let n = rootRef.current;
    while (n.children[0]) { line.push(n.children[0]); n = n.children[0]; }
    return line;
  }, [rootRef.current, game.moves.length, analysis.status]);

  return (
    <section className="review-screen-pad">
      <div className="topbar" style={{ marginBottom: 12 }}>
        <button className="coach-btn" onClick={onBack}>← All games</button>
        <GameMeta game={game} />
      </div>

      {/* Always mounted at constant height — the bar switching to "done" must not shift the board */}
      <div className="analysis-bar">
        <select className="pill" value={analysis.mode} onChange={e => onModeChange(e.target.value)} disabled={analysis.status === 'complete'}>
          <option value="fast">Fast (~10s)</option>
          <option value="balanced">Balanced (~20s)</option>
          <option value="deep">Deep (~1min)</option>
        </select>
        <div className="progress-track"><span className="progress-fill" style={{ width: `${analysis.status === 'complete' ? 100 : Math.round((analysis.done / Math.max(1, analysis.total)) * 100)}%` }} /></div>
        {analysis.status === 'complete'
          ? <span className="pill ok">✓ review complete</span>
          : <>
            <span className="pill busy">{analysis.label || `analyzing ${analysis.done}/${analysis.total}`}</span>
            <button className="coach-btn" onClick={onCancel}>Cancel</button>
          </>}
      </div>

      <div className="review-grid">
        <div className="board-col">
          <div className="player-bar"><PlayerName game={game} side={topSide} /><Clock game={game} side={topSide} node={current} /></div>
          <EvalBarH ev={boardEval} />
          <div className="board-row">
            <EvalBar ev={boardEval} orientation={orientation} />
            <div className="board-wrap board-anchor">
              <Board fen={current.fen} orientation={orientation}
                lastMove={current.uci ? [current.uci.slice(0, 2), current.uci.slice(2, 4)] : null}
                dests={dests} movableColor={current.fen.split(' ')[1] === 'b' ? 'black' : 'white'}
                onMove={onMove} shapes={shapes} />
              <LabelPop node={current} orientation={orientation} />
            </div>
          </div>
          <div className="player-bar"><PlayerName game={game} side={botSide} /><Clock game={game} side={botSide} node={current} /></div>
          <MoveStrip mainline={mainline} currentId={current.id} onNav={nav} />
          <div className="nav-row">
            <button className="coach-btn" onClick={() => nav(rootRef.current)} title="Start">⏮</button>
            <button className="coach-btn" onClick={() => nav(current.parent)} title="Previous (←)">◀</button>
            <button className="coach-btn" onClick={() => nav(current.children[0])} title="Next (→)">▶</button>
            <button className="coach-btn" onClick={() => nav(lastMainlineNode(rootRef.current))} title="End">⏭</button>
            <button className="coach-btn" onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')} title="Flip (f)">⇅</button>
          </div>
        </div>

        <div className="side-col">
          <div>
            <CoachCard node={current} game={game} />
            <button className="btn-next" disabled={!current.children[0]}
              onClick={() => nav(current.children[0])}>Next</button>
          </div>
          <AccuracyCards game={game} />
          <Collapse id="engine" title="Engine" defaultOpen>
            <EnginePanel fen={current.fen} enabled={engineOn} onToggle={setEngineOn}
              update={liveUpdate} thinking={thinking} onPlayLine={onPlayLine} onHoverLine={setHoverUci} />
          </Collapse>
          <Collapse id="moves" title="Moves" defaultOpen>
            <MoveTree root={rootRef.current} currentId={current.id} onNav={nav} onDelete={onDelete} onPromote={onPromote} />
          </Collapse>
          <Collapse id="graph" title="Eval graph" defaultOpen>
            <EvalGraph whiteWins={game.whiteWins} moves={game.moves} ply={current.isMainline ? current.ply : mainlinePly(current)}
              onSeek={ply => nav(nodeAtMainlinePly(rootRef.current, ply))} />
          </Collapse>
          <Collapse id="labels" title="Move labels" defaultOpen={false}>
            <TallyPanel game={game} />
          </Collapse>
        </div>
      </div>

      {analysis.status === 'complete' && (
        <Collapse id="summary" title="Coach summary" defaultOpen>
          <CoachSummary game={game} onSeek={ply => nav(nodeAtMainlinePly(rootRef.current, ply))} />
        </Collapse>
      )}
      {analysis.status === 'complete' && (
        <Collapse id="trainer" title="Train your misses" defaultOpen>
          <Trainer game={game} positions={positions} />
        </Collapse>
      )}

      {/* mobile thumb bar (CSS hides it on desktop) */}
      <div className="mobile-bar">
        <button className="coach-btn" onClick={() => nav(rootRef.current)} title="Start">⏮</button>
        <button className="coach-btn" onClick={() => nav(current.parent)} title="Previous">◀</button>
        <button className="btn-next" disabled={!current.children[0]} onClick={() => nav(current.children[0])}>Next ▶</button>
        <button className="coach-btn" onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')} title="Flip">⇅</button>
      </div>
    </section>
  );
}

// ---- helpers & subcomponents ----
function isAncestorOrSelf(anc: TreeNode, node: TreeNode): boolean {
  let n: TreeNode | null = node;
  while (n) { if (n === anc) return true; n = n.parent; }
  return false;
}
function mainlinePly(node: TreeNode): number {
  let n: TreeNode | null = node;
  while (n && !n.isMainline) n = n.parent;
  return n ? n.ply : 0;
}
function nodeAtMainlinePly(root: TreeNode, ply: number): TreeNode {
  let n = root;
  for (let i = 0; i < ply && n.children[0]; i++) n = n.children[0];
  return n;
}

// Chess.com-style pop: a colored label badge anchored to the destination square of the
// move just played. Keyed by node id so it re-pops on every step.
function LabelPop({ node, orientation }: { node: TreeNode; orientation: 'white' | 'black' }) {
  const label = node.isMainline ? (node.review?.label as Label | null) : null;
  if (!label || !node.uci) return null;
  const dest = node.uci.slice(2, 4);
  const file = dest.charCodeAt(0) - 97, rank = +dest[1];
  const col = orientation === 'white' ? file : 7 - file;
  const row = orientation === 'white' ? 8 - rank : rank - 1;
  // anchor at the square's top-right corner
  const left = (col + 1) * 12.5, top = row * 12.5;
  return (
    <div key={node.id} className={'label-pop ' + label}
      style={{ left: `${Math.min(98, left)}%`, top: `${Math.max(2, top)}%` }}
      title={LABEL_TEXT[label]}>
      {BADGE_MAP[label]}
    </div>
  );
}

// Remaining clock for one side at the current position (from imported [%clk] data).
function Clock({ game, side, node }: { game: ReviewedGame; side: 'white' | 'black'; node: TreeNode }) {
  const mover = side === 'white' ? 'w' : 'b';
  const ply = node.isMainline ? node.ply : mainlinePly(node);
  let clk: number | null = null;
  for (let i = Math.min(ply, game.moves.length) - 1; i >= 0; i--) {
    if (game.moves[i].mover === mover && game.moves[i].clk != null) { clk = game.moves[i].clk!; break; }
  }
  if (clk == null) {
    if (!game.moves.some(m => m.clk != null)) return null;
    clk = (game.timeControl?.initial ?? 0) * 100;
    if (!clk) return null;
  }
  const totalSec = Math.floor(clk / 100);
  const mm = Math.floor(totalSec / 60), ss = totalSec % 60;
  const toMove = node.fen.split(' ')[1] === mover;
  return <span className={'clk' + (toMove ? ' active' : '')}>{mm}:{String(ss).padStart(2, '0')}</span>;
}

function GameMeta({ game }: { game: ReviewedGame }) {
  const tc = game.timeControl?.initial != null ? `${Math.round(game.timeControl.initial / 60)}+${game.timeControl.increment ?? 0}` : '';
  const date = game.playedAt ? new Date(game.playedAt).toISOString().slice(0, 10) : '';
  const src = { lichess: 'Lichess', chesscom: 'Chess.com', pgn: 'PGN' }[game.source] || game.source;
  return <span className="pill">{src} · {game.timeControl?.class || ''} {tc} · {date} · {game.result || ''}</span>;
}

function PlayerName({ game, side }: { game: ReviewedGame; side: 'white' | 'black' }) {
  const p = game[side];
  const acc = game.accuracy?.[side];
  return (
    <>
      <span className="nm">{side === 'white' ? '○' : '●'} <b>{p.name}</b> <small>{p.rating ?? ''}</small></span>
      {acc != null && <span className="pill">{acc}% accuracy</span>}
    </>
  );
}

function AccuracyCards({ game }: { game: ReviewedGame }) {
  const card = (side: 'white' | 'black') => {
    const acc = game.accuracy?.[side]; const acpl = game.acpl?.[side];
    return (
      <div className="metric" key={side}>
        <span>{game[side].name} · {side}</span>
        <b>{acc != null ? acc + '%' : '—'}</b>
        <small>{acpl != null ? acpl + ' avg centipawn loss' : 'accuracy'}</small>
      </div>
    );
  };
  return <div className="acc-cards">{card('white')}{card('black')}</div>;
}

const TALLY_ORDER: Label[] = ['brilliant', 'great', 'best', 'excellent', 'good', 'book', 'inaccuracy', 'mistake', 'blunder', 'miss'];
function TallyPanel({ game }: { game: ReviewedGame }) {
  if (!game.tallies) return null;
  const t = game.tallies;
  return (
    <div className="tally-grid">
      <span></span><span className="hd">LABEL</span><span className="cnt hd">W</span><span className="cnt hd">B</span>
      {TALLY_ORDER.filter(l => t.white[l] + t.black[l] > 0 || FLAGGED.has(l)).map(l => (
        <Row key={l} l={l} w={t.white[l]} b={t.black[l]} />
      ))}
    </div>
  );
}
function Row({ l, w, b }: { l: Label; w: number; b: number }) {
  return <>
    <span className={'mbadge ' + l}>{BADGE_MAP[l]}</span>
    <span>{LABEL_TEXT[l]}</span>
    <span className="cnt">{w}</span>
    <span className="cnt" style={{ color: 'var(--muted)' }}>{b}</span>
  </>;
}

function CoachSummary({ game, onSeek }: { game: ReviewedGame; onSeek: (ply: number) => void }) {
  if (!game.moves.some(m => m.label)) return null;
  const side = game.perspective;
  const mySide = side === 'black' ? 'b' : 'w';
  const mine = side ? game.moves.filter(m => m.mover === mySide) : game.moves;
  const worst = [...mine].filter(m => m.label && FLAGGED.has(m.label as Label))
    .sort((a, b) => (b.winLoss || 0) - (a.winLoss || 0)).slice(0, 3);
  const who = side ? game[side].name : 'both sides';
  return (
    <div>
      <p className="lede" style={{ fontSize: 16, marginTop: 4 }}>
        {game.openingName && <><b>{game.openingName}</b>{game.eco ? ` (${game.eco})` : ''}. </>}
        Reviewing for {who}. {worst.length ? 'Your biggest swings this game:' : 'A clean game — nothing major to fix.'}
      </p>
      {worst.length > 0 && (
        <ol className="summary-moments">
          {worst.map((m, i) => (
            <li key={i} onClick={() => { onSeek(m.ply); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <b>{Math.ceil(m.ply / 2)}{m.mover === 'w' ? '.' : '…'} {m.san}</b> — {LABEL_TEXT[m.label as Label]}, −{Math.round(m.winLoss || 0)}% win chance
              {m.bestSan && <> ; better was <b>{m.bestSan}</b></>}
            </li>
          ))}
        </ol>
      )}
      <div className="pillrow">
        <span className="pill">Checks</span><span className="pill">Captures</span><span className="pill">Threats</span>
        <span className="pill">Their reply</span><span className="pill">Only then: move</span>
      </div>
    </div>
  );
}
