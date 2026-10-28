// Test a/b/c/d generado al vuelo desde el glosario y los casos.
import { distractors, pick, short } from './engine.js';
import { shuffle } from '../../lib/srs.js';

export const KINDS = ['def-term', 'term-def', 'es-en', 'hook-case', 'rule-case', 'case-hook', 'mixed'];
const CASE_KINDS = ['hook-case', 'rule-case', 'case-hook'];

function applicable(kind, items) {
  if (kind === 'def-term' || kind === 'term-def') return items.filter(i => i.type === 'term');
  if (kind === 'es-en') return items.filter(i => i.type === 'term' && i.esTerm);
  if (kind === 'hook-case' || kind === 'case-hook') return items.filter(i => i.type === 'case' && i.hook);
  if (kind === 'rule-case') return items.filter(i => i.type === 'case' && i.rule);
  return items.filter(i => i.type === 'term' || (i.type === 'case' && i.hook));
}

function kindFor(item, kind) {
  if (kind !== 'mixed') return kind;
  const opts = item.type === 'case' ? CASE_KINDS.filter(k => k !== 'rule-case' || item.rule) : ['def-term', 'term-def', ...(item.esTerm ? ['es-en'] : [])];
  return opts[Math.floor(Math.random() * opts.length)];
}

export function buildQuestion(items, item, kind) {
  const k = kindFor(item, kind);
  const pool = items.filter(i => i.type === item.type && (k !== 'es-en' || i.esTerm) && (k !== 'case-hook' || i.hook));
  const wrong = distractors(pool, item, 3);
  if (wrong.length < 3) return null;
  const label = (x) => k === 'term-def' ? short(x.back, 120) : k === 'case-hook' ? short(x.hook, 120) : x.front;
  const stem = { 'def-term': item.back, 'term-def': item.front, 'es-en': item.esTerm, 'hook-case': item.hook, 'rule-case': item.rule, 'case-hook': item.front }[k];
  const options = shuffle([item, ...wrong]).map(x => ({ id: x.id, text: label(x), correct: x.id === item.id }));
  const explain = `${item.front}: ${item.back}` + (item.type === 'case' && k !== 'rule-case' && item.rule ? ` ${item.rule}` : '');
  return { kind: k, item, stem, options, explain, es: item.type === 'term' ? [item.esTerm, item.es].filter(Boolean).join(': ') : item.es };
}

export function buildTest(items, { kind = 'mixed', n = 10 } = {}) {
  const pool = applicable(kind, items);
  const chosen = pick(pool, n * 2);
  const out = [];
  for (const it of chosen) { const q = buildQuestion(items, it, kind); if (q) out.push(q); if (out.length >= n) break; }
  return out;
}
