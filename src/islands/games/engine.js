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
