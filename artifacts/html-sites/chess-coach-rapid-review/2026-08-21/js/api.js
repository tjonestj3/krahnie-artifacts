// api.js — the three import paths, each normalized to one ImportedGame shape:
// { id, source, url, white:{name,rating}, black:{name,rating}, playedAt, timeControl:{initial,increment,class},
//   rated, result, termination, sanMoves[], clocks?, lichessEvals?, lichessJudgments?, lichessAccuracy?,
//   eco?, openingName?, perspective? }
// Both APIs are CORS-open; requests are strictly serial per the platforms' etiquette.
import { Chess } from 'chess.js';
import { archiveGet, archiveSet } from './store.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchWithBackoff(url, opts, retries = 1) {
  const res = await fetch(url, opts);
  if (res.status === 429 && retries > 0) {
    await sleep(60_000); // platform rule: full minute on 429
    return fetchWithBackoff(url, opts, retries - 1);
  }
  return res;
}

// ---- Lichess ----
export async function lichessGames(username, { max = 30, perfType = '' } = {}) {
  const params = new URLSearchParams({
    max: String(max), moves: 'true', tags: 'true', clocks: 'true',
    evals: 'true', accuracy: 'true', opening: 'true', sort: 'dateDesc', pgnInJson: 'false',
  });
  if (perfType) params.set('perfType', perfType);
  const res = await fetchWithBackoff(
    `https://lichess.org/api/games/user/${encodeURIComponent(username)}?${params}`,
    { headers: { Accept: 'application/x-ndjson' } });
  if (res.status === 404) throw new Error(`Lichess user "${username}" not found`);
  if (!res.ok) throw new Error(`Lichess: HTTP ${res.status}`);
  const text = await res.text();
  return text.split('\n').filter(Boolean).map(l => normalizeLichess(JSON.parse(l), username));
}

function normalizeLichess(g, username) {
  const w = g.players?.white || {}, b = g.players?.black || {};
  const name = u => u.user?.name || (u.aiLevel != null ? `Stockfish lvl ${u.aiLevel}` : 'Anonymous');
  const result = g.winner === 'white' ? '1-0' : g.winner === 'black' ? '0-1' : '1/2-1/2';
  const me = username.toLowerCase();
  return {
    id: 'li-' + g.id, source: 'lichess', url: `https://lichess.org/${g.id}`,
    white: { name: name(w), rating: w.rating ?? null },
    black: { name: name(b), rating: b.rating ?? null },
    playedAt: g.createdAt || g.lastMoveAt || Date.now(),
    timeControl: { initial: g.clock?.initial ?? null, increment: g.clock?.increment ?? null, class: g.speed || 'unknown' },
    rated: !!g.rated, result, termination: g.status,
    sanMoves: (g.moves || '').split(' ').filter(Boolean),
    clocks: g.clocks || null,
    lichessEvals: g.analysis ? g.analysis.map(a => a.eval != null ? { cp: a.eval } : a.mate != null ? { mate: a.mate } : null) : null,
    lichessJudgments: g.analysis ? g.analysis.map(a => a.judgment ? { name: a.judgment.name, comment: a.judgment.comment, best: a.best || null } : null) : null,
    lichessAccuracy: (w.analysis?.accuracy != null || b.analysis?.accuracy != null)
      ? { white: w.analysis?.accuracy ?? null, black: b.analysis?.accuracy ?? null } : null,
    eco: g.opening?.eco || null, openingName: g.opening?.name || null,
    perspective: w.user?.id === me || name(w).toLowerCase() === me ? 'white'
               : b.user?.id === me || name(b).toLowerCase() === me ? 'black' : null,
  };
}

// ---- Chess.com ----
export async function chesscomGames(username, { months = 2 } = {}) {
  const u = encodeURIComponent(username.toLowerCase());
  const res = await fetchWithBackoff(`https://api.chess.com/pub/player/${u}/games/archives`);
  if (res.status === 404) throw new Error(`Chess.com user "${username}" not found`);
  if (!res.ok) throw new Error(`Chess.com: HTTP ${res.status}`);
  const { archives } = await res.json();
  const recent = archives.slice(-months);
  const games = [];
  const nowKey = new Date().toISOString().slice(0, 7); // YYYY-MM
  for (const url of recent) { // serial — chess.com asks for no parallel requests
    const [yyyy, mm] = url.split('/').slice(-2);
    const key = `${username.toLowerCase()}/${yyyy}-${mm}`;
    const isCurrent = `${yyyy}-${mm}` === nowKey;
    let month = await archiveGet(key);
    if (!month || (isCurrent && Date.now() - month.fetchedAt > 3600_000)) {
      const r = await fetchWithBackoff(url);
      if (!r.ok) continue;
      month = { fetchedAt: Date.now(), data: await r.json() };
      await archiveSet(key, month); // past months immutable → cached forever
    }
    games.push(...month.data.games);
  }
  return games
    .filter(g => g.rules === 'chess')
    .sort((a, b) => b.end_time - a.end_time)
    .map(g => normalizeChesscom(g, username));
}

function normalizeChesscom(g, username) {
  const parsed = parsePgnMoves(g.pgn);
  const result = g.white.result === 'win' ? '1-0' : g.black.result === 'win' ? '0-1' : '1/2-1/2';
  const [ini, inc] = String(g.time_control || '').split('+');
  const me = username.toLowerCase();
  return {
    id: 'cc-' + (g.uuid || g.url.split('/').pop()), source: 'chesscom', url: g.url,
    white: { name: g.white.username, rating: g.white.rating ?? null },
    black: { name: g.black.username, rating: g.black.rating ?? null },
    playedAt: (g.end_time || 0) * 1000,
    timeControl: { initial: parseInt(ini, 10) || null, increment: parseInt(inc, 10) || 0, class: g.time_class },
    rated: !!g.rated, result,
    termination: g.white.result === 'win' ? g.black.result : g.white.result,
    sanMoves: parsed.sanMoves, clocks: parsed.clocks,
    ccAccuracy: g.accuracies ? { white: g.accuracies.white, black: g.accuracies.black } : null,
    eco: parsed.headers.ECO || null, openingName: null,
    perspective: g.white.username.toLowerCase() === me ? 'white'
               : g.black.username.toLowerCase() === me ? 'black' : null,
  };
}

// ---- Pasted PGN ----
export function pgnGame(text) {
  const parsed = parsePgnMoves(text);
  if (!parsed.sanMoves.length) throw new Error('No moves found in that PGN.');
  const h = parsed.headers;
  const [ini, inc] = String(h.TimeControl || '').split('+');
  const dateStr = (h.UTCDate || h.Date || '').replaceAll('.', '-');
  const initial = parseInt(ini, 10) || null;
  return {
    id: null, // assigned async via pgnId() by the caller
    source: 'pgn', url: h.Link || (h.Site?.startsWith('http') ? h.Site : null),
    white: { name: h.White || 'White', rating: parseInt(h.WhiteElo, 10) || null },
    black: { name: h.Black || 'Black', rating: parseInt(h.BlackElo, 10) || null },
    playedAt: dateStr ? Date.parse(dateStr + 'T' + (h.UTCTime || '12:00:00') + 'Z') || Date.now() : Date.now(),
    timeControl: { initial, increment: parseInt(inc, 10) || 0, class: guessClass(initial) },
    rated: null, result: h.Result || null, termination: h.Termination || null,
    sanMoves: parsed.sanMoves, clocks: parsed.clocks,
    eco: h.ECO || null, openingName: h.Opening || null, perspective: null,
    headers: h,
  };
}

function guessClass(initial) {
  if (!initial) return 'unknown';
  if (initial < 180) return 'bullet';
  if (initial < 600) return 'blitz';
  if (initial < 1800) return 'rapid';
  return 'classical';
}

// Shared PGN → SAN list + clocks + headers (chess.js validates legality as it replays).
function parsePgnMoves(pgn) {
  const chess = new Chess();
  chess.loadPgn(pgn); // throws with a useful message on malformed input
  const headers = chess.getHeaders();
  const verbose = chess.history({ verbose: true });
  const sanMoves = verbose.map(m => m.san);
  const clkRe = /\[%clk\s+([\d:.]+)\]/g;
  const clocks = [];
  let match, found = false;
  while ((match = clkRe.exec(pgn))) {
    found = true;
    const parts = match[1].split(':').map(Number);
    const secs = parts.reduce((a, p) => a * 60 + p, 0);
    clocks.push(Math.round(secs * 100)); // centiseconds, matching lichess
  }
  return { sanMoves, clocks: found && clocks.length === sanMoves.length ? clocks : null, headers };
}
