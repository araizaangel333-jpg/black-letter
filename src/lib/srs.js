// Repetición espaciada: SM-2 estilo Anki, como función pura.
// Un "card" es { state, ease, ivl, reps, lapses, due, last }.
import { addDays } from './dates.js';

export const GRADES = ['again', 'hard', 'good', 'easy'];
export const DEFAULTS = { maxInterval: 60, startEase: 2.5 };

export function newCard() {
  return { state: 'new', ease: DEFAULTS.startEase, ivl: 0, reps: 0, lapses: 0, due: null, last: null };
}

export function schedule(card, grade, today, opts = {}) {
  const { maxInterval } = { ...DEFAULTS, ...opts };
  if (!GRADES.includes(grade)) throw new Error(`grade inválido: ${grade}`);
  const c = { ...(card || newCard()) };
  let ivl = c.ivl, ease = c.ease, state = c.state;

  if (state === 'new' || state === 'learning') {
    if (grade === 'again') { ivl = 0; state = 'learning'; }
    else if (grade === 'hard') { ivl = 1; state = 'review'; }
    else if (grade === 'good') { ivl = 2; state = 'review'; }
    else { ivl = 4; state = 'review'; ease = ease + 0.15; }
  } else {
    if (grade === 'again') { c.lapses += 1; ease = Math.max(1.3, ease - 0.2); ivl = 1; state = 'learning'; }
    else if (grade === 'hard') { ivl = Math.max(ivl + 1, Math.round(ivl * 1.2)); ease = Math.max(1.3, ease - 0.15); }
    else if (grade === 'good') { ivl = Math.max(ivl + 1, Math.round(ivl * ease)); }
    else { ivl = Math.max(ivl + 1, Math.round(ivl * ease * 1.3)); ease = ease + 0.15; }
  }
  ivl = Math.min(ivl, maxInterval);
  return { ...c, state, ease: +ease.toFixed(2), ivl, reps: c.reps + 1, due: addDays(today, ivl), last: today };
}

// Tarjetas vencidas hoy (o antes), más nuevas hasta el tope.
export function buildQueue(srs, itemIds, today, { newPerDay = 10, maxReviews = 30, seen = 0 } = {}) {
  const due = [], fresh = [];
  for (const id of itemIds) {
    const c = srs[id];
    if (!c) fresh.push(id);
    else if (c.due && c.due <= today) due.push(id);
  }
  due.sort((a, b) => (srs[a].due < srs[b].due ? -1 : srs[a].due > srs[b].due ? 1 : 0));
  const room = Math.max(0, newPerDay - seen);
  return [...due.slice(0, maxReviews), ...shuffle(fresh).slice(0, room)];
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function maturity(card) {
  if (!card) return 'new';
  if (card.state !== 'review') return 'learning';
  return card.ivl >= 21 ? 'mature' : 'young';
}
