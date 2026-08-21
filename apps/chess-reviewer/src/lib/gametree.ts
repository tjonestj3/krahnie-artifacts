// gametree.ts — a move tree: the reviewed game is the mainline, and any legal move the
// user plays from a node branches into a variation. Powers the analysis board.
import { Chess } from 'chess.js';
import type { Label, Eval } from './labels';

export interface ReviewMove {
  san: string; uci: string; mover: 'w' | 'b'; ply: number;
  evalBefore?: Eval | null; evalAfter?: Eval | null;
  winBefore?: number; winAfter?: number; winLoss?: number;
  label?: Label | null; bestUci?: string | null; bestSan?: string | null;
  pv?: string[] | null; secondUci?: string | null; secondEval?: Eval | null;
  clk?: number | null;
}

export interface TreeNode {
  id: number;
  parent: TreeNode | null;
  children: TreeNode[];        // children[0] = main continuation; rest = variations
  san: string | null;         // move that led here (null at root)
  uci: string | null;
  fen: string;
  ply: number;                 // half-move count from root
  review: ReviewMove | null;   // classification data, only on original mainline nodes
  isMainline: boolean;
}

let counter = 0;
const nextId = () => ++counter;

export function newRoot(startFen?: string): TreeNode {
  const fen = startFen || new Chess().fen();
  return { id: nextId(), parent: null, children: [], san: null, uci: null, fen, ply: 0, review: null, isMainline: true };
}

// Build the mainline from a reviewed game's move list.
export function treeFromMoves(moves: ReviewMove[], startFen?: string): TreeNode {
  const root = newRoot(startFen);
  const chess = new Chess(root.fen);
  let cur = root;
  for (const m of moves) {
    chess.move(m.san);
    const node: TreeNode = {
      id: nextId(), parent: cur, children: [], san: m.san, uci: m.uci,
      fen: chess.fen(), ply: cur.ply + 1, review: m, isMainline: true,
    };
    cur.children.push(node);
    cur = node;
  }
  return root;
}

// Play a move from `node`. Reuses an existing child if the move matches; otherwise
// creates a new node (a variation when the node already has a main continuation).
export function playMove(node: TreeNode, move: { from: string; to: string; promotion?: string }): TreeNode | null {
  const chess = new Chess(node.fen);
  let mv;
  try { mv = chess.move({ from: move.from, to: move.to, promotion: move.promotion || 'q' }); }
  catch { return null; }
  if (!mv) return null;
  const uci = mv.from + mv.to + (mv.promotion || '');
  const existing = node.children.find(c => c.uci === uci);
  if (existing) return existing;
  const child: TreeNode = {
    id: nextId(), parent: node, children: [], san: mv.san, uci,
    fen: chess.fen(), ply: node.ply + 1, review: null, isMainline: false,
  };
  node.children.push(child);
  return child;
}

// Play a sequence of UCI moves from a node (used when clicking an engine PV line).
export function playUciLine(node: TreeNode, uciMoves: string[]): TreeNode {
  let cur = node;
  for (const uci of uciMoves) {
    const next = playMove(cur, { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
    if (!next) break;
    cur = next;
  }
  return cur;
}

export function pathTo(node: TreeNode): TreeNode[] {
  const path: TreeNode[] = [];
  let n: TreeNode | null = node;
  while (n) { path.unshift(n); n = n.parent; }
  return path;
}

export function mainlineFrom(node: TreeNode): TreeNode[] {
  const line: TreeNode[] = [];
  let n: TreeNode | undefined = node.children[0];
  while (n) { line.push(n); n = n.children[0]; }
  return line;
}

// Remove a node (and its subtree) from its parent.
export function deleteNode(node: TreeNode): TreeNode | null {
  if (!node.parent) return null;
  const p = node.parent;
  p.children = p.children.filter(c => c !== node);
  return p;
}

// Promote a variation to be its parent's main continuation.
export function promoteNode(node: TreeNode): void {
  const p = node.parent;
  if (!p) return;
  const idx = p.children.indexOf(node);
  if (idx > 0) { p.children.splice(idx, 1); p.children.unshift(node); }
}

export function lastMainlineNode(root: TreeNode): TreeNode {
  let n = root;
  while (n.children[0]) n = n.children[0];
  return n;
}
