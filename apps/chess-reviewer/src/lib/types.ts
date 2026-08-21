import type { Label, Eval } from './labels';

export type Source = 'lichess' | 'chesscom' | 'pgn';

export interface Player { name: string; rating: number | null; }
export interface TimeControl { initial: number | null; increment: number | null; class: string; }

// A game fetched/pasted, pre-analysis.
export interface ImportedGame {
  id: string | null;
  source: Source;
  url: string | null;
  white: Player; black: Player;
  playedAt: number;
  timeControl: TimeControl;
  rated: boolean | null;
  result: string | null;
  termination?: string | null;
  sanMoves: string[];
  clocks?: number[] | null;
  lichessEvals?: (Eval | null)[] | null;
  lichessJudgments?: any[] | null;
  lichessAccuracy?: { white: number | null; black: number | null } | null;
  ccAccuracy?: { white: number; black: number } | null;
  eco?: string | null;
  openingName?: string | null;
  perspective?: 'white' | 'black' | null;
  headers?: Record<string, string>;
}

export interface ReviewedMove {
  san: string; uci: string; mover: 'w' | 'b'; ply: number;
  clk?: number | null;
  evalBefore?: Eval | null; evalAfter?: Eval | null;
  winBefore?: number; winAfter?: number; winLoss?: number;
  label: Label | null; bestUci?: string | null; bestSan?: string | null;
  pv?: string[] | null; secondUci?: string | null; secondEval?: Eval | null;
}

export type Tally = Record<Label, number>;

export interface ReviewedGame {
  id: string; schemaVersion: number; source: Source; url: string | null;
  importedAt: number; playedAt: number;
  timeControl: TimeControl; rated: boolean | null; result: string | null; termination: string | null;
  white: Player; black: Player; perspective: 'white' | 'black' | null;
  eco: string | null; openingName: string | null;
  moves: ReviewedMove[];
  whiteWins: number[] | null;
  accuracy: { white: number | null; black: number | null } | null;
  acpl: { white: number | null; black: number | null } | null;
  tallies: { white: Tally; black: Tally } | null;
  analysis: {
    engine: string; mode: string | null; multipv: number;
    source: 'local' | 'lichess+local'; status: 'pending' | 'partial' | 'complete';
    analyzedThrough: number; partialEvals?: any[];
  };
}

export interface PvLine { depth?: number; cp?: number; mate?: number; pv: string[]; }
export interface EngineUpdate { depth: number; pvs: PvLine[]; }
