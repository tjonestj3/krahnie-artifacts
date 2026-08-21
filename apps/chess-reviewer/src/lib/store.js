// store.js — IndexedDB persistence (no library). DB `chess-review` v1:
//   games      keyPath 'id', indexes playedAt/source — ReviewedGame records
//   meta       key-value (usernames, mode preference)
//   ccArchives key '<user>/<YYYY-MM>' — immutable chess.com month cache
let dbp = null;

export function openDB() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open('chess-review', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      const games = db.createObjectStore('games', { keyPath: 'id' });
      games.createIndex('playedAt', 'playedAt');
      games.createIndex('source', 'source');
      db.createObjectStore('meta');
      db.createObjectStore('ccArchives');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

async function tx(store, mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const req = fn(t.objectStore(store));
    t.oncomplete = () => resolve(req?.result);
    t.onerror = () => reject(t.error);
  });
}

export const putGame = g => tx('games', 'readwrite', s => s.put(g));
export const getGame = id => tx('games', 'readonly', s => s.get(id));
export const deleteGame = id => tx('games', 'readwrite', s => s.delete(id));
export const allGames = () => tx('games', 'readonly', s => s.getAll());

export const metaGet = key => tx('meta', 'readonly', s => s.get(key));
export const metaSet = (key, val) => tx('meta', 'readwrite', s => s.put(val, key));

export const archiveGet = key => tx('ccArchives', 'readonly', s => s.get(key));
export const archiveSet = (key, val) => tx('ccArchives', 'readwrite', s => s.put(val, key));

// Stable id for pasted PGNs: hash of movetext + players + date.
export async function pgnId(sanMoves, headers) {
  const basis = sanMoves.join(' ') + '|' + (headers.White || '') + '|' + (headers.Black || '') + '|' + (headers.Date || headers.UTCDate || '');
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(basis));
  return 'pgn-' + [...new Uint8Array(buf)].slice(0, 6).map(b => b.toString(16).padStart(2, '0')).join('');
}
