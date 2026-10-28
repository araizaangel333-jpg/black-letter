// Motor compartido de los juegos: ítems, alcance, distractores, registro de actividad.
import { get, update } from '../../lib/store.js';
import { todayISO } from '../../lib/dates.js';
import { shuffle } from '../../lib/srs.js';

let cache = null;
export async function loadItems() {
  if (cache) return cache;
  const r = await fetch('/data/items.json');
  const j = await r.json();
  cache = j.items;
  return cache;
}

export function inScope(items, scope) {
  return scope ? items.filter(i => i.subject === scope) : items;
}

export function pick(arr, n) {
  return shuffle(arr).slice(0, n);
}

// Distractores del mismo tipo: primero del mismo tema, luego de la misma materia, luego de todo.
export function distractors(items, item, n) {
  const same = i => i.id !== item.id && i.type === item.type;
  const pools = [
    items.filter(i => same(i) && i.topic && i.topic === item.topic),
    items.filter(i => same(i) && i.subject === item.subject),
    items.filter(same),
  ];
  const out = [];
  for (const pool of pools) {
    for (const i of shuffle(pool)) { if (out.length >= n) break; if (!out.includes(i)) out.push(i); }
    if (out.length >= n) break;
  }
  return out.slice(0, n);
}

export function short(text, max = 110) {
  if (!text || text.length <= max) return text || '';
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ') > 40 ? cut.lastIndexOf(' ') : max) + '…';
}

export function logActivity(fields) {
  const today = todayISO();
  update('activity', a => {
    const n = { ...(a || {}) }; const d = { ...(n[today] || {}) };
    for (const [k, v] of Object.entries(fields)) d[k] = (d[k] || 0) + v;
    n[today] = d; return n;
  }, {});
}

export function best(key) { return (get('games', {}) || {}).best?.[key] ?? null; }
export function setBest(key, value, lowerIsBetter = true) {
  return update('games', g => {
    const n = { ...(g || {}) }; n.best = { ...(n.best || {}) };
    const cur = n.best[key];
    if (cur == null || (lowerIsBetter ? value < cur : value > cur)) n.best[key] = value;
    n.last = { ...(n.last || {}), [key]: value };
    return n;
  }, {});
}

export function esc(s) { return String(s ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch])); }
export const fmtSecs = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// ---- recuerdo escrito (Learn): normalizar, comparar con tolerancia, pistas ----
export function norm(s) {
  return String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

// La respuesta que se escribe: el caso sin el año; el término tal cual.
export function answerOf(item) {
  return item.type === 'case' ? item.front.replace(/\s*\(\d{4}\)\s*$/, '') : item.front;
}
// La respuesta sin el paréntesis final ("actual authority (express and implied)" → "actual authority").
export function coreOf(item) {
  return answerOf(item).replace(/\s*\([^)]*\)\s*$/, '').trim();
}
// Solo se escribe lo que cabe en un pulgar: casos siempre; términos cortos y sin puntuación de frase.
export function typeable(item) {
  if (item.type === 'case') return true;
  if (item.type !== 'term') return false;
  const c = coreOf(item);
  return c.length <= 32 && !/[.,;:?!…\[\]"]/.test(c) && c.split(/\s+/).length <= 4;
}

const PARTY_STOP = new Set(['united', 'states', 'state', 'people', 'commonwealth', 'sec', 'in', 're', 'ex', 'parte', 'matter', 'of', 'the', 'city', 'county', 'co', 'inc', 'corp', 'ltd', 'llc', 'bank', 'company', 'estate', 'board']);
const close = (x, y) => x === y || levenshtein(x, y) <= Math.max(1, Math.floor(y.length / 8));

// ¿Vale la respuesta escrita? Igual o casi igual al término; en casos, basta una parte o su apellido.
export function fuzzy(input, item) {
  const a = norm(input);
  if (!a) return false;
  const full = norm(answerOf(item)), core = norm(coreOf(item));
  if (close(a, full) || close(a, core)) return true;
  if (item.type !== 'case') return false;
  const parties = full.split(/\s+v\s+/);
  for (const p of parties) {
    const words = p.split(' ').filter(w => !PARTY_STOP.has(w));
    if (!words.length) continue; // "United States" solo no identifica el caso
    const stripped = words.join(' ');
    if (close(a, p) || close(a, stripped)) return true;
    if (a.length >= 6 && stripped.startsWith(a)) return true;
    if (words[0].length >= 4 && close(a, words[0])) return true;
  }
  return false;
}

// Pista de nivel 1: primera letra de cada palabra y guiones por el resto.
export function hint(answer) {
  return answer.split(' ').map(w => (/^[a-z]/i.test(w) && w.length > 1 && !/^(v\.?|vs\.?|of|the|and|de|la|del|in|re)$/i.test(w)) ? w[0] + '_'.repeat(Math.min(w.length - 1, 8)) : w).join(' ');
}

// Un término tiene glosa útil en español si la glosa no es el mismo término en inglés ("consideration (sin equivalente)").
export function hasSpanish(item) {
  return item.type === 'term' && Boolean(item.esTerm) && !norm(item.esTerm).includes(norm(item.front));
}

// Materia con más tarjetas flojas (en aprendizaje o con lapsos); null si no hay señal.
export function weakestSubject(items, srs) {
  const score = {};
  for (const i of items) {
    const c = srs[i.id]; if (!c) continue;
    const w = (c.state === 'learning' ? 2 : 0) + Math.min(c.lapses || 0, 3);
    if (w) score[i.subject] = (score[i.subject] || 0) + w;
  }
  let best = null;
  for (const [s, v] of Object.entries(score)) if (best == null || v > score[best]) best = s;
  return best;
}

// Ítems para Learn: primero los flojos, luego los vencidos, luego los nuevos, al final el resto.
export function pickLearn(pool, srs, n, today) {
  const weak = [], due = [], fresh = [], rest = [];
  for (const i of pool) {
    const c = srs[i.id];
    if (!c) fresh.push(i);
    else if (c.state === 'learning' || (c.lapses || 0) > 0) weak.push(i);
    else if (today && c.due && c.due <= today) due.push(i);
    else rest.push(i);
  }
  return [...shuffle(weak), ...shuffle(due), ...shuffle(fresh), ...shuffle(rest)].slice(0, n);
}
