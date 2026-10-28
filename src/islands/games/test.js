// Test a/b/c/d generado al vuelo desde el glosario y los casos.
import { distractors, pick, short } from './engine.js';
import { shuffle } from '../../lib/srs.js';

export const KINDS = ['def-term', 'term-def', 'es-en', 'hook-case', 'mixed'];

function applicable(kind, items) {
  if (kind === 'def-term' || kind === 'term-def') return items.filter(i => i.type === 'term');
  if (kind === 'es-en') return items.filter(i => i.type === 'term' && i.esTerm);
  if (kind === 'hook-case') return items.filter(i => i.type === 'case' && i.hook);
  return items.filter(i => i.type === 'term' || (i.type === 'case' && i.hook));
}

function kindFor(item, kind) {
  if (kind !== 'mixed') return kind;
  if (item.type === 'case') return 'hook-case';
  const opts = ['def-term', 'term-def']; if (item.esTerm) opts.push('es-en');
  return opts[Math.floor(Math.random() * opts.length)];
}

export function buildQuestion(items, item, kind) {
  const k = kindFor(item, kind);
  const pool = items.filter(i => i.type === item.type && (k !== 'es-en' || i.esTerm));
  const wrong = distractors(pool, item, 3);
  if (wrong.length < 3) return null;
  const label = (x) => {
    if (k === 'term-def') return short(x.back, 120);
    if (k === 'hook-case' || k === 'def-term' || k === 'es-en') return x.front;
    return x.front;
  };
  const stem = k === 'def-term' ? item.back : k === 'term-def' ? item.front : k === 'es-en' ? item.esTerm : item.hook;
  const options = shuffle([item, ...wrong]).map(x => ({ id: x.id, text: label(x), correct: x.id === item.id }));
  const explain = k === 'term-def' ? `${item.front}: ${item.back}` : `${item.front}: ${item.back}`;
  return { kind: k, item, stem, options, explain, es: item.type === 'term' ? [item.esTerm, item.es].filter(Boolean).join(': ') : item.es };
}

export function buildTest(items, { kind = 'mixed', n = 10 } = {}) {
  const pool = applicable(kind, items);
  const chosen = pick(pool, n * 2);
  const out = [];
  for (const it of chosen) { const q = buildQuestion(items, it, kind); if (q) out.push(q); if (out.length >= n) break; }
  return out;
}
