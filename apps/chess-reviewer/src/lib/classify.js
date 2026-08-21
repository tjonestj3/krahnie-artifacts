// classify.js — pure move-classification + accuracy math. No DOM, no engine, no network.
// Evals are stored WHITE-CENTRIC everywhere ({cp} or {mate}); this module is the only
// place they get flipped to the mover's perspective.
import { Chess } from 'chess.js';

// ---- Tunables (all thresholds in win%-loss terms, mover perspective) ----
export const THRESHOLDS = {
  BEST_LOSS: 0.2,        // played != PV1 but basically equal → still Best
  EXCELLENT: 2,          // bands calibrated against lichess judgments (≈5/10/20)
  GOOD: 5,
  INACCURACY: 10,
  MISTAKE: 20,           // >= 20 → Blunder
  GREAT_GAP: 15,         // PV1 - PV2 win% gap for "only move"
  BRILLIANT_MAX_LOSS: 2, // played must be (near-)best
  BRILLIANT_WIN_CAP: 90, // not already crushing
  BRILLIANT_MIN_AFTER: 45, // move must keep the position good
  BRILLIANT_SEE: 2,      // opponent must net >= 2 pawns of material (excludes pawn sacs)
  MISS_WIN: 80,          // had a concrete win...
  MISS_GAP: 15,          // ...that was a specific tactic (gap to 2nd best)
  MISS_LOSS: 10,
  MISS_AFTER: 65,
  BOOK_MAX_PLY: 20,
};

export const LABELS = ['brilliant','great','best','excellent','good','book','inaccuracy','mistake','blunder','miss'];

const PIECE_VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

// ---- cp/mate → win% ----
export function winPct(cp) {
  const c = Math.max(-1000, Math.min(1000, cp));
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * c)) - 1);
}

// eval: {cp} or {mate}, White-centric. Returns White win% 0..100.
export function evalWinPct(ev) {
  if (ev == null) return 50;
  if (ev.mate != null) return ev.mate > 0 ? 100 : 0;
  return winPct(ev.cp);
}

// Effective cp for ordering/comparing mixed cp/mate evals (shorter mate ranks higher).
export function effCp(ev) {
  if (ev == null) return 0;
  if (ev.mate != null) {
    const m = Math.max(1, Math.abs(ev.mate));
    return Math.sign(ev.mate) * (10000 - m);
  }
  return ev.cp;
}

export function winFor(mover, whiteWinPct) {
  return mover === 'w' ? whiteWinPct : 100 - whiteWinPct;
}

// ---- SEE (static exchange) via legal-move recursion ----
// Net gain for the side to move if it initiates captures on `square` (0 if it should decline).
// Uses only legal moves, so pins are handled for free.
export function seeGain(chess, square, depth = 0) {
  if (depth > 12) return 0;
  const caps = chess.moves({ verbose: true }).filter(m => m.to === square && m.captured);
  if (!caps.length) return 0;
  caps.sort((a, b) => PIECE_VAL[a.piece] - PIECE_VAL[b.piece]);
  const m = caps[0];
  const captured = PIECE_VAL[m.captured] ?? 0;
  chess.move(m);
  const gain = captured - seeGain(chess, square, depth + 1);
  chess.undo();
  return Math.max(0, gain);
}

// Did the played move surrender NET material on its destination (a real sacrifice)?
// Net = what the opponent wins by capturing there − what the move itself captured.
// Equal trades (Bxf3 gxf3) net 0; Qxf7+?? nets 8; a Greek-gift Bxh7 Kxh7 nets 2.
// v1 simplification (documented): only the moved piece / destination square is checked.
export function isSacrifice(fenBefore, fenAfter, uci) {
  try {
    const dest = uci.slice(2, 4);
    const after = new Chess(fenAfter);
    const opponentGain = seeGain(after, dest);
    if (!opponentGain) return false;
    let capturedVal = 0;
    const before = new Chess(fenBefore);
    const mv = before.move({ from: uci.slice(0, 2), to: dest, promotion: uci[4] || undefined });
    if (mv.captured) capturedVal = PIECE_VAL[mv.captured] ?? 0;
    return opponentGain - capturedVal >= THRESHOLDS.BRILLIANT_SEE;
  } catch { return false; }
}

// ---- Per-move classification ----
// move: { san, uci, mover:'w'|'b', ply, fenBefore, fenAfter, isBook,
//         evalBefore {cp|mate},        // PV1 of position before (White-centric)
//         evalAfter {cp|mate},         // PV1 of position after the played move
//         bestUci, secondEval? {cp|mate} }  // secondEval = PV2 of position before, if known
export function classifyMove(move) {
  const T = THRESHOLDS;
  const wBefore = evalWinPct(move.evalBefore);
  const wAfter = evalWinPct(move.evalAfter);
  const winBefore = winFor(move.mover, wBefore);
  const winAfter = winFor(move.mover, wAfter);
  const winLoss = Math.max(0, winBefore - winAfter);
  const playedBest = !!move.bestUci && uciEq(move.uci, move.bestUci);

  const pv2Win = move.secondEval != null ? winFor(move.mover, evalWinPct(move.secondEval)) : null;
  const gap = pv2Win != null ? winBefore - pv2Win : null;
  const isMate = move.san.endsWith('#');

  let label;
  if (move.isBook) {
    label = 'book';
  } else if (
    // Brilliant: (near-)best + a real material sacrifice + not already crushing + stays good
    winLoss <= T.BRILLIANT_MAX_LOSS &&
    !isMate &&
    winBefore < T.BRILLIANT_WIN_CAP &&
    winAfter >= T.BRILLIANT_MIN_AFTER &&
    move.fenBefore && move.fenAfter && isSacrifice(move.fenBefore, move.fenAfter, move.uci)
  ) {
    label = 'brilliant';
  } else if (
    // Great: the only move (big gap to 2nd best, or no 2nd option existed) —
    // but never an obvious capture (recaptures/free material are "only moves" trivially)
    playedBest && winLoss < T.EXCELLENT &&
    !isMate && !isObviousCapture(move) &&
    (gap == null ? move.onlyLegal === true : gap >= T.GREAT_GAP)
  ) {
    label = 'great';
  } else if (playedBest || winLoss < T.BEST_LOSS) {
    label = 'best';
  } else if (
    // Miss: had a concrete win (mate or a specific tactic) and let most of it go
    winLoss >= T.MISS_LOSS && winAfter <= T.MISS_AFTER && !playedBest &&
    (hadMateFor(move.mover, move.evalBefore) ||
      (winBefore >= T.MISS_WIN && gap != null && gap >= T.MISS_GAP))
  ) {
    label = 'miss';
  } else if (winLoss >= T.MISTAKE) {
    label = 'blunder';
  } else if (winLoss >= T.INACCURACY) {
    label = 'mistake';
  } else if (winLoss >= T.GOOD) {
    label = 'inaccuracy';
  } else if (winLoss >= T.EXCELLENT) {
    label = 'good';
  } else {
    label = 'excellent';
  }

  return { winBefore, winAfter, winLoss, label };
}

// A capture that doesn't lose material on its square (recapture / winning a hanging piece)
// is too obvious to deserve "Great".
function isObviousCapture(move) {
  if (!move.fenBefore || !move.fenAfter) return false;
  try {
    const dest = move.uci.slice(2, 4);
    const before = new Chess(move.fenBefore);
    const mv = before.move({ from: move.uci.slice(0, 2), to: dest, promotion: move.uci[4] || undefined });
    if (!mv.captured) return false;
    const capturedVal = PIECE_VAL[mv.captured] ?? 0;
    const after = new Chess(move.fenAfter);
    return capturedVal - seeGain(after, dest) >= 0;
  } catch { return false; }
}

function hadMateFor(mover, ev) {
  if (ev == null || ev.mate == null) return false;
  return mover === 'w' ? ev.mate > 0 : ev.mate < 0;
}

function uciEq(a, b) {
  if (!a || !b) return false;
  return a === b || a.slice(0, 4) === b.slice(0, 4); // tolerate promotion-suffix differences
}

// ---- Accuracy ----
export function moveAccuracy(winLoss) {
  return Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * winLoss) - 3.1669 + 1));
}

// moves: classified move array (with winLoss, mover). whiteWins: White win% per position (0..n).
// Returns { white, black } (null when a side has < 4 moves).
export function gameAccuracy(moves, whiteWins) {
  const windowSize = Math.max(2, Math.min(8, Math.round(whiteWins.length / 10)));
  // volatility weight per ply = stdev of the surrounding win% window, clamped [0.5, 12]
  const weights = moves.map((_, i) => {
    const lo = Math.max(0, i - windowSize + 1);
    const win = whiteWins.slice(lo, i + 2);
    return Math.max(0.5, Math.min(12, stdev(win)));
  });
  const out = {};
  for (const side of ['w', 'b']) {
    const accs = [], ws = [];
    moves.forEach((m, i) => {
      if (m.mover !== side || m.label === 'book') return;
      accs.push(moveAccuracy(m.winLoss));
      ws.push(weights[i]);
    });
    if (accs.length < 4) { out[side] = null; continue; }
    const weighted = accs.reduce((s, a, i) => s + a * ws[i], 0) / ws.reduce((s, w) => s + w, 0);
    const harmonic = accs.length / accs.reduce((s, a) => s + 1 / Math.max(a, 0.1), 0);
    out[side] = Math.round(((weighted + harmonic) / 2) * 10) / 10;
  }
  return { white: out.w, black: out.b };
}

// Average centipawn loss per side (capped per move at 1000).
export function gameAcpl(moves) {
  const out = {};
  for (const side of ['w', 'b']) {
    const losses = moves.filter(m => m.mover === side).map(m => {
      const before = winsideCp(m.evalBefore, side);
      const after = winsideCp(m.evalAfter, side);
      return Math.max(0, Math.min(1000, before - after));
    });
    out[side === 'w' ? 'white' : 'black'] = losses.length
      ? Math.round(losses.reduce((a, b) => a + b, 0) / losses.length) : null;
  }
  return out;
}

function winsideCp(ev, side) {
  const cp = Math.max(-1000, Math.min(1000, effCp(ev)));
  return side === 'w' ? cp : -cp;
}

export function tally(moves) {
  const zero = () => Object.fromEntries(LABELS.map(l => [l, 0]));
  const t = { white: zero(), black: zero() };
  for (const m of moves) t[m.mover === 'w' ? 'white' : 'black'][m.label]++;
  return t;
}

function stdev(xs) {
  if (xs.length < 2) return 0;
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((s, x) => s + (x - mean) ** 2, 0) / xs.length);
}
