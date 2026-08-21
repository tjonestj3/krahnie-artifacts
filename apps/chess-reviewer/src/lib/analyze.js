// analyze.js — turns an imported game into a fully classified review record.
// Full local pass, or the Lichess hybrid (server evals + targeted local pass).
import { Chess } from 'chess.js';
import { classifyMove, evalWinPct, winFor, gameAccuracy, gameAcpl, tally, THRESHOLDS, isSacrifice } from './classify.js';
import { bookWalk } from './openings.js';

export const MODES = {
  fast:     { movetime: 300,  depth: 14 },
  balanced: { movetime: 750,  depth: 18 },
  deep:     { movetime: 2000, depth: 22 },
};

// Replay SAN moves → positions[0..n] (FENs) + per-move metadata.
export function buildTimeline(sanMoves) {
  const chess = new Chess();
  const positions = [chess.fen()];
  const moves = [];
  for (const san of sanMoves) {
    const mover = chess.turn();
    const m = chess.move(san); // throws on illegal — caller catches & reports
    moves.push({
      san: m.san,
      uci: m.from + m.to + (m.promotion || ''),
      mover,
      ply: moves.length + 1,
      fenBefore: positions[positions.length - 1],
      fenAfter: chess.fen(),
      onlyLegal: undefined, // filled lazily for Great checks
    });
    positions.push(chess.fen());
  }
  let terminal = null;
  if (chess.isCheckmate()) terminal = { type: 'checkmate', winner: chess.turn() === 'w' ? 'b' : 'w' };
  else if (chess.isStalemate()) terminal = { type: 'stalemate' };
  else if (chess.isDraw()) terminal = { type: 'draw' };
  return { positions, moves, terminal };
}

function terminalEval(terminal) {
  if (terminal.type === 'checkmate') return { mate: terminal.winner === 'w' ? 1 : -1, terminal: true };
  return { cp: 0, terminal: true };
}

// Full local pass: evals[i] = analysis of positions[i], in game order (TT carryover).
// Returns evals array; calls onProgress({index,total}) and onCheckpoint(evals, i).
export async function analyzeFull(timeline, engine, mode, { onProgress, onCheckpoint, token, startAt = 0, prior = [] } = {}) {
  const { positions, terminal } = timeline;
  const opts = MODES[mode] || MODES.balanced;
  const evals = prior.slice();
  const total = positions.length;
  await engine.newGame();
  for (let i = startAt; i < total; i++) {
    if (token?.cancelled) { engine.stop(); return { evals, completed: false, analyzedThrough: i - 1 }; }
    const isLast = i === total - 1;
    if (isLast && terminal) {
      evals[i] = { pvs: [terminalEval(terminal)], depth: 0 };
    } else {
      evals[i] = await engine.analyze(positions[i], opts);
    }
    onProgress?.({ index: i, total, eval: evals[i] });
    if (onCheckpoint && i > 0 && i % 10 === 0) onCheckpoint(evals, i);
  }
  return { evals, completed: true, analyzedThrough: total - 1 };
}

// Pool version of the full pass: positions analyzed concurrently across N workers.
// Loses per-position TT carryover but gains ~Nx wall-clock. Progress is by count
// (positions finish out of order).
export async function analyzeFullPool(timeline, pool, mode, { onProgress, onCheckpoint, token } = {}) {
  const { positions, terminal } = timeline;
  const opts = MODES[mode] || MODES.balanced;
  const total = positions.length;
  const fens = positions.slice();
  const evals = new Array(total);
  if (terminal) { fens[total - 1] = null; evals[total - 1] = { pvs: [terminalEval(terminal)], depth: 0 }; }
  await pool.init();
  let done = terminal ? 1 : 0;
  const results = await pool.analyzeMany(fens, opts, {
    token,
    onResult: ({ index, eval: ev }) => {
      evals[index] = ev;
      done++;
      onProgress?.({ index: done - 1, total, eval: ev });
      if (onCheckpoint && done % 12 === 0) onCheckpoint(evals.slice(), done);
    },
  });
  for (let i = 0; i < total; i++) if (results[i]) evals[i] = results[i];
  return { evals, completed: !token?.cancelled, analyzedThrough: total - 1 };
}

// Lichess hybrid: server evals cover PV1 for every position; run a targeted local
// MultiPV-2 pass only where the classifier needs bestUci/PV2.
// lichessEvals[i] = eval AFTER move i+1 (lila convention), White-centric.
export async function analyzeHybrid(timeline, lichessEvals, lichessJudgments, engine, { onProgress, token } = {}) {
  const { positions, moves, terminal } = timeline;
  const evals = new Array(positions.length);
  evals[0] = { pvs: [{ cp: 18 }], depth: 0 }; // start position: nominal edge
  for (let i = 0; i < moves.length; i++) {
    const le = lichessEvals[i];
    if (le) evals[i + 1] = { pvs: [le.mate != null ? { mate: le.mate } : { cp: le.cp }], depth: 0, lichess: true };
    else if (i === moves.length - 1 && terminal) evals[i + 1] = { pvs: [terminalEval(terminal)], depth: 0 };
    else evals[i + 1] = null; // rare gap — filled below if it's a candidate
  }

  // Candidate before-positions that need a real local search
  const candidates = [];
  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];
    const before = evals[i]?.pvs?.[0], after = evals[i + 1]?.pvs?.[0];
    if (!before || !after) { candidates.push(i); continue; }
    const wb = winFor(m.mover, evalWinPct(before));
    const wa = winFor(m.mover, evalWinPct(after));
    const loss = Math.max(0, wb - wa);
    const judged = lichessJudgments?.[i]?.best; // lila supplies best uci on judged moves
    if (loss >= THRESHOLDS.GOOD && !judged) { candidates.push(i); continue; }             // Miss/trainer need bestUci+gap
    if (loss >= THRESHOLDS.GOOD && wb >= THRESHOLDS.MISS_WIN) { candidates.push(i); continue; } // Miss needs PV2 gap
    if (loss <= THRESHOLDS.BRILLIANT_MAX_LOSS && wb < THRESHOLDS.BRILLIANT_WIN_CAP &&
        wa >= THRESHOLDS.BRILLIANT_MIN_AFTER && isSacrifice(m.fenBefore, m.fenAfter, m.uci)) {
      candidates.push(i); continue; // Brilliant confirmation (is it actually best?)
    }
    if (loss <= THRESHOLDS.BRILLIANT_MAX_LOSS && wb < 85) candidates.push(i); // Great candidates need PV2
  }

  await engine.newGame();
  const local = {};
  for (let k = 0; k < candidates.length; k++) {
    if (token?.cancelled) { engine.stop(); break; }
    const i = candidates[k];
    local[i] = await engine.analyze(positions[i], { movetime: 1000, depth: 20 });
    if (!evals[i]) evals[i] = local[i];
    onProgress?.({ index: k, total: candidates.length, targeted: true });
  }

  // Merge: local search upgrades the before-position with pv/bestmove/PV2
  for (const [i, res] of Object.entries(local)) {
    const idx = +i;
    const existing = evals[idx];
    evals[idx] = existing?.lichess
      ? { ...res, pvs: [{ ...res.pvs[0], cp: existing.pvs[0].cp, mate: existing.pvs[0].mate }, ...res.pvs.slice(1)] }
      : res;
    // keep lichess PV1 eval (deeper) but take local pv moves + PV2 wholesale
  }
  return { evals, judgments: lichessJudgments };
}

// evals[] + timeline → classified moves + summary stats.
export function classifyGame(timeline, evals, { judgments } = {}) {
  const { positions, moves } = timeline;
  const bookFlags = bookWalk(positions, THRESHOLDS.BOOK_MAX_PLY);
  const whiteWins = positions.map((_, i) => evalWinPct(evals[i]?.pvs?.[0]));

  const out = moves.map((m, i) => {
    const before = evals[i], after = evals[i + 1];
    const pv1 = before?.pvs?.[0], pv2 = before?.pvs?.[1];
    const bestUci = pv1?.pv?.[0] || judgments?.[i]?.best || null;
    if (pv2 == null && bestUci == null) m.onlyLegal = undefined;
    else if (pv2 == null && before?.depth > 0) m.onlyLegal = true; // real search found one line only
    const move = {
      ...m,
      evalBefore: pv1 ? strip(pv1) : null,
      evalAfter: after?.pvs?.[0] ? strip(after.pvs[0]) : null,
      bestUci,
      secondEval: pv2 ? strip(pv2) : null,
      isBook: bookFlags.flags[i],
    };
    const cls = classifyMove(move);
    return {
      san: m.san, uci: m.uci, mover: m.mover, ply: m.ply,
      evalBefore: move.evalBefore, evalAfter: move.evalAfter,
      winBefore: r1(cls.winBefore), winAfter: r1(cls.winAfter), winLoss: r1(cls.winLoss),
      label: cls.label,
      bestUci, bestSan: bestUci ? uciToSan(m.fenBefore, bestUci) : null, pv: pv1?.pv || null,
      secondUci: pv2?.pv?.[0] || null, secondEval: move.secondEval,
    };
  });

  return {
    moves: out,
    whiteWins,
    accuracy: gameAccuracy(out, whiteWins),
    acpl: gameAcpl(out),
    tallies: tally(out),
    eco: bookFlags.eco, openingName: bookFlags.name,
  };
}

const strip = pv => pv.mate != null ? { mate: pv.mate } : { cp: pv.cp };
const r1 = x => Math.round(x * 10) / 10;

function uciToSan(fen, uci) {
  try {
    const c = new Chess(fen);
    const m = c.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] || undefined });
    return m.san;
  } catch { return null; }
}
