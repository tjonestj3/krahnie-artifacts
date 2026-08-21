// main.js — screen state and wiring for the Krahnie Chess Reviewer.
import { Engine } from './engine.js';
import { buildTimeline, analyzeFull, analyzeHybrid, classifyGame, MODES } from './analyze.js';
import { loadOpenings } from './openings.js';
import { lichessGames, chesscomGames, pgnGame } from './api.js';
import { putGame, getGame, allGames, metaGet, metaSet, pgnId } from './store.js';
import { ReviewView, esc } from './review-ui.js';
import { Trainer } from './trainer.js';

const $ = id => document.getElementById(id);
const els = {
  importScreen: $('importScreen'), reviewScreen: $('reviewScreen'),
  importStatus: $('importStatus'), gameList: $('gameList'),
  recentSection: $('recentSection'), recentList: $('recentList'),
  enginePill: $('enginePill'), gameMeta: $('gameMeta'),
  modeSelect: $('modeSelect'), progressFill: $('progressFill'), progressText: $('progressText'),
  cancelBtn: $('cancelBtn'), coachSummary: $('coachSummary'), trainerSection: $('trainerSection'),
};

const view = new ReviewView({
  board: $('board'), topPlayer: $('topPlayer'), bottomPlayer: $('bottomPlayer'),
  moveComment: $('moveComment'), accCards: $('accCards'), evalGraph: $('evalGraph'),
  tallyGrid: $('tallyGrid'), moveList: $('moveList'), coachSummary: els.coachSummary,
  gameMeta: els.gameMeta,
});
const trainer = new Trainer({
  board: $('trainerBoard'), feedback: $('trainerFeedback'),
  momentList: $('momentList'), reset: $('trainerReset'), show: $('trainerShow'),
});

const engine = new Engine(new URL('../vendor/stockfish/stockfish-18-lite-single.js', import.meta.url));
let token = null; // cancellation token for the running analysis

// ---------- engine status pill ----------
function pill(text, cls = '') { els.enginePill.textContent = 'engine: ' + text; els.enginePill.className = 'pill ' + cls; }

// ---------- screens ----------
function showImport() {
  token && (token.cancelled = true);
  els.reviewScreen.hidden = true;
  els.importScreen.hidden = false;
  renderRecent();
}
function showReview() {
  els.importScreen.hidden = true;
  els.reviewScreen.hidden = false;
  els.coachSummary.hidden = true;
  els.trainerSection.hidden = true;
}
$('backBtn').addEventListener('click', showImport);

// ---------- tabs ----------
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
  document.querySelectorAll('.tab-body').forEach(b => b.classList.toggle('active', b.dataset.body === tab.dataset.tab));
}));

// ---------- imports ----------
function status(text, err = false) { els.importStatus.textContent = text; els.importStatus.className = 'status-line' + (err ? ' err' : ''); }

$('liFetch').addEventListener('click', async () => {
  const user = $('liUser').value.trim();
  if (!user) return status('Enter a Lichess username.', true);
  status('Fetching from Lichess…');
  try {
    const games = await lichessGames(user, { max: +$('liMax').value, perfType: $('liPerf').value });
    metaSet('liUser', user);
    renderGameList(games, user);
    status(games.length ? `${games.length} games. ⚡ = Lichess analysis attached (near-instant review).` : 'No games found.');
  } catch (e) { status(e.message, true); }
});

$('ccFetch').addEventListener('click', async () => {
  const user = $('ccUser').value.trim();
  if (!user) return status('Enter a Chess.com username.', true);
  status('Fetching from Chess.com…');
  try {
    const games = await chesscomGames(user, { months: +$('ccMonths').value });
    metaSet('ccUser', user);
    renderGameList(games.slice(0, 60), user);
    status(games.length ? `${games.length} games (newest first).` : 'No games found.');
  } catch (e) { status(e.message, true); }
});

$('pgnReview').addEventListener('click', async () => {
  try {
    const g = pgnGame($('pgnText').value);
    g.id = await pgnId(g.sanMoves, g.headers || {});
    openGame(g);
  } catch (e) { status('PGN error: ' + e.message, true); }
});

let importedGames = [];
function renderGameList(games, user) {
  importedGames = games;
  els.gameList.innerHTML = games.map((g, i) => {
    const my = g.perspective;
    const res = !my ? (g.result || '') :
      (g.result === '1/2-1/2') ? 'draw' :
      ((g.result === '1-0') === (my === 'white')) ? 'win' : 'loss';
    const opp = my === 'black' ? g.white : g.black;
    const vs = my ? `vs ${esc(opp.name)} ${opp.rating ? '(' + opp.rating + ')' : ''}` : `${esc(g.white.name)} vs ${esc(g.black.name)}`;
    return `<button class="game-card" type="button" data-i="${i}">
      <div class="game-top"><span class="platform">${g.source === 'lichess' ? 'Lichess' : 'Chess.com'}${g.lichessEvals ? ' ⚡' : ''}</span>
      <span class="result-tag ${res === 'win' || res === 'loss' || res === 'draw' ? res : ''}">${res || '·'}</span></div>
      <h3>${vs}</h3>
      <p>${new Date(g.playedAt).toISOString().slice(0, 10)} · ${g.timeControl.class}${my ? ' · as ' + my : ''} · ${g.sanMoves.length} plies</p>
    </button>`;
  }).join('');
  els.gameList.querySelectorAll('.game-card').forEach(card =>
    card.addEventListener('click', () => openGame(importedGames[+card.dataset.i])));
}

// ---------- recent reviews ----------
async function renderRecent() {
  try {
    const games = (await allGames()).sort((a, b) => (b.importedAt || 0) - (a.importedAt || 0)).slice(0, 12);
    els.recentSection.hidden = !games.length;
    els.recentList.innerHTML = games.map(r => {
      const my = r.perspective;
      const acc = my && r.accuracy?.[my] != null ? `${r.accuracy[my]}% you` :
        r.accuracy?.white != null ? `${r.accuracy.white}% / ${r.accuracy.black}%` : '';
      const partial = r.analysis?.status === 'partial' ? ' · ⏸ partial' : '';
      return `<button class="game-card" type="button" data-id="${r.id}">
        <div class="game-top"><span class="platform">${esc(r.source)}</span><span class="result-tag">${esc(r.result || '')}</span></div>
        <h3>${esc(r.white.name)} vs ${esc(r.black.name)}</h3>
        <p>${r.playedAt ? new Date(r.playedAt).toISOString().slice(0, 10) : ''} · ${r.timeControl?.class || ''}${partial}</p>
        ${acc ? `<span class="done">${acc}</span>` : ''}
      </button>`;
    }).join('');
    els.recentList.querySelectorAll('.game-card').forEach(card =>
      card.addEventListener('click', async () => {
        const rec = await getGame(card.dataset.id);
        if (rec) openRecord(rec);
      }));
  } catch { /* IndexedDB unavailable (private mode) — recent list just stays hidden */ }
}

// ---------- record assembly ----------
function baseRecord(g, timeline) {
  return {
    id: g.id, schemaVersion: 1, source: g.source, url: g.url || null,
    importedAt: Date.now(), playedAt: g.playedAt,
    timeControl: g.timeControl, rated: g.rated, result: g.result, termination: g.termination || null,
    white: g.white, black: g.black, perspective: g.perspective || null,
    eco: g.eco || null, openingName: g.openingName || null,
    moves: timeline.moves.map((m, i) => ({
      san: m.san, uci: m.uci, mover: m.mover, ply: m.ply,
      clk: g.clocks?.[i] ?? null, label: null,
    })),
    whiteWins: null, accuracy: null, acpl: null, tallies: null,
    analysis: { engine: 'sf18-lite-single', mode: null, multipv: 2, source: 'local', status: 'pending', analyzedThrough: -1 },
  };
}

function finalizeRecord(record, g, timeline, evals, judgments) {
  const c = classifyGame(timeline, evals, { judgments });
  record.moves = record.moves.map((m, i) => ({ ...c.moves[i], clk: m.clk }));
  record.whiteWins = c.whiteWins.map(w => Math.round(w * 10) / 10);
  record.accuracy = g.lichessAccuracy?.white != null
    ? { white: g.lichessAccuracy.white, black: g.lichessAccuracy.black } // lichess's own numbers when it analyzed
    : c.accuracy;
  record.acpl = c.acpl;
  record.tallies = c.tallies;
  record.eco = record.eco || c.eco;
  record.openingName = record.openingName || c.openingName;
  return record;
}

// ---------- open + analyze ----------
async function openGame(g) {
  let timeline;
  try { timeline = buildTimeline(g.sanMoves); }
  catch (e) { return status(`Couldn't replay that game (${e.message})`, true); }
  if (!timeline.moves.length) return status('That game has no moves.', true);

  // already reviewed → straight to the finished review
  const existing = g.id ? await getGame(g.id).catch(() => null) : null;
  if (existing?.analysis?.status === 'complete') return openRecord(existing);

  showReview();
  await loadOpenings().catch(() => {});
  const record = existing?.analysis?.status === 'partial' ? existing : baseRecord(g, timeline);
  view.load(record);
  await runAnalysis(g, timeline, record);
}

async function openRecord(record) {
  showReview();
  await loadOpenings().catch(() => {});
  view.load(record);
  els.progressFill.style.width = '100%';
  els.progressText.textContent = record.analysis?.status === 'partial' ? 'partial — reopen from import to resume' : 'done';
  pill('idle');
  showTrainer(record);
}

async function runAnalysis(g, timeline, record) {
  token = { cancelled: false };
  const myToken = token;
  const mode = (await metaGet('mode').catch(() => null)) || 'balanced';
  els.modeSelect.value = mode;
  els.cancelBtn.hidden = false;
  els.progressText.textContent = 'engine warming up…';
  pill('loading…', 'busy');

  const onProgress = ({ index, total, targeted }) => {
    const pct = Math.round(((index + 1) / total) * 100);
    els.progressFill.style.width = pct + '%';
    els.progressText.textContent = targeted
      ? `checking key moments ${index + 1}/${total}`
      : `analyzing move ${index + 1}/${total}`;
    pill('analyzing', 'busy');
  };

  try {
    await engine.init();
    let evals, judgments = null, completed = true, analyzedThrough;

    if (g.lichessEvals?.length) {
      record.analysis.source = 'lichess+local';
      const res = await analyzeHybrid(timeline, g.lichessEvals, g.lichessJudgments, engine, { onProgress, token: myToken });
      evals = res.evals; judgments = res.judgments;
      analyzedThrough = timeline.positions.length - 1;
    } else {
      record.analysis.source = 'local';
      const prior = record.analysis.partialEvals || [];
      const startAt = record.analysis.status === 'partial' ? record.analysis.analyzedThrough + 1 : 0;
      const res = await analyzeFull(timeline, engine, mode, {
        onProgress,
        onCheckpoint: (partial, i) => {
          record.analysis.status = 'partial';
          record.analysis.analyzedThrough = i;
          record.analysis.partialEvals = partial;
          record.analysis.mode = mode;
          if (record.id) putGame(record).catch(() => {});
          // live graph while analyzing
          view.renderGraph(partial.map(e => e ? evalWhiteWin(e) : 50));
        },
        token: myToken, startAt, prior,
      });
      evals = res.evals; completed = res.completed; analyzedThrough = res.analyzedThrough;
    }

    if (myToken.cancelled || !completed) {
      els.progressText.textContent = 'paused — reopen this game to resume';
      els.cancelBtn.hidden = true;
      pill('idle');
      return;
    }

    finalizeRecord(record, g, timeline, evals, judgments);
    record.analysis.mode = mode;
    record.analysis.status = 'complete';
    record.analysis.analyzedThrough = analyzedThrough;
    delete record.analysis.partialEvals;
    if (record.id) putGame(record).catch(() => {});

    view.load(record);
    els.progressFill.style.width = '100%';
    els.progressText.textContent = 'done';
    els.cancelBtn.hidden = true;
    pill('ready', 'ok');
    showTrainer(record);
  } catch (e) {
    console.error(e);
    els.progressText.textContent = 'analysis failed: ' + e.message;
    pill('error', 'err');
    els.cancelBtn.hidden = true;
  }
}

function evalWhiteWin(e) {
  const pv = e.pvs?.[0];
  if (!pv) return 50;
  if (pv.mate != null) return pv.mate > 0 ? 100 : 0;
  const c = Math.max(-1000, Math.min(1000, pv.cp));
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * c)) - 1);
}

function showTrainer(record) {
  if (!record.moves.some(m => m.label)) return;
  const count = trainer.load(record, view.positions);
  els.trainerSection.hidden = !count;
}

// ---------- controls ----------
els.cancelBtn.addEventListener('click', () => { token && (token.cancelled = true); engine.stop(); });
els.modeSelect.addEventListener('change', () => metaSet('mode', els.modeSelect.value).catch(() => {}));
$('btnStart').addEventListener('click', () => view.seek(0));
$('btnPrev').addEventListener('click', () => view.seek(view.ply - 1));
$('btnNext').addEventListener('click', () => view.seek(view.ply + 1));
$('btnEnd').addEventListener('click', () => view.seek(view.positions.length - 1));
$('btnFlip').addEventListener('click', () => view.flip());
document.addEventListener('keydown', e => {
  if (els.reviewScreen.hidden || e.target.matches('input,textarea,select')) return;
  if (e.key === 'ArrowLeft') { view.seek(view.ply - 1); e.preventDefault(); }
  if (e.key === 'ArrowRight') { view.seek(view.ply + 1); e.preventDefault(); }
  if (e.key === 'Home') { view.seek(0); e.preventDefault(); }
  if (e.key === 'End') { view.seek(view.positions.length - 1); e.preventDefault(); }
  if (e.key === 'f') view.flip();
});

// ---------- boot ----------
(async () => {
  const [li, cc] = await Promise.all([metaGet('liUser').catch(() => null), metaGet('ccUser').catch(() => null)]);
  $('liUser').value = li || 'tjonestj';
  $('ccUser').value = cc || 'tjonestj';
  renderRecent();
  loadOpenings().catch(() => {}); // warm the book table
})();
