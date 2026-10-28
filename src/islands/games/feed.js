// Feed sin fin: una pregunta rápida tras otra. Generadores puros; la página pinta y lleva la cuenta.
import { distractors, pick } from './engine.js';
import { buildQuestion } from './test.js';

// Verdadero o falso: ¿esta definición es la del término? La mitad de las veces se cuela la de un vecino.
export function buildTrueFalse(items, item, truth = Math.random() < 0.5) {
  if (truth) return { kind: 'tf', item, term: item.front, text: item.back, answer: true, explain: `${item.front}: ${item.back}` };
  const [other] = distractors(items.filter(i => i.type === 'term'), item, 1);
  if (!other) return null;
  return { kind: 'tf', item, term: item.front, text: other.back, answer: false, other, explain: `${other.front}: ${other.back}`, own: `${item.front}: ${item.back}` };
}

// ¿Este elemento pertenece a esta doctrina? La mitad de las veces viene de otra checklist del mismo curso.
export function buildElement(doctrines, doc, truth = Math.random() < 0.5) {
  if (!doc || !doc.elements.length) return null;
  if (truth) { const e = pick(doc.elements, 1)[0]; return { kind: 'el', doc, element: e, answer: true, explain: e.test || '' }; }
  const same = doctrines.filter(d => d.id !== doc.id && d.subject === doc.subject);
  const pool = same.length ? same : doctrines.filter(d => d.id !== doc.id);
  if (!pool.length) return null;
  const from = pick(pool, 1)[0]; const e = pick(from.elements, 1)[0];
  return { kind: 'el', doc, element: e, answer: false, from, explain: e.test || '' };
}

// Siguiente ítem del feed: 40% verdadero/falso, 15% elementos, el resto a/b/c/d mixto.
export function nextFeedItem(items, doctrines, scope, r = Math.random()) {
  const pool = scope ? items.filter(i => i.subject === scope) : items;
  const terms = pool.filter(i => i.type === 'term'), cases = pool.filter(i => i.type === 'case' && i.hook);
  const docs = scope ? doctrines.filter(d => d.subject === scope) : doctrines;
  if (r < 0.4 && terms.length >= 2) return buildTrueFalse(items, pick(terms, 1)[0]);
  if (r < 0.55 && docs.length) return buildElement(doctrines, pick(docs, 1)[0]);
  const candidates = [...terms, ...cases];
  if (!candidates.length) return null;
  const q = buildQuestion(items, pick(candidates, 1)[0], 'mixed');
  return q ? { ...q, kind: 'mcq', sub: q.kind } : null;
}
