import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTrueFalse, buildElement, buildEsEn, nextFeedItem } from '../src/islands/games/feed.js';

const items = [
  { id: 'term:a', type: 'term', subject: 'contracts', topic: 'formation', front: 'offer', back: 'def a', esTerm: 'oferta', falseFriend: 'ff note' },
  { id: 'term:b', type: 'term', subject: 'contracts', topic: 'formation', front: 'acceptance', back: 'def b', esTerm: 'aceptación' },
  { id: 'term:c', type: 'term', subject: 'contracts', topic: 'formation', front: 'consideration', back: 'def c' },
  { id: 'term:d', type: 'term', subject: 'contracts', topic: 'formation', front: 'reliance', back: 'def d' },
  { id: 'term:e', type: 'term', subject: 'lrw', topic: 'memo', front: 'creac', back: 'def e' },
  { id: 'case:x', type: 'case', subject: 'contracts', topic: 'formation', front: 'A v. B (1900)', back: 'one liner', hook: 'a hook', rule: 'a rule' },
];
const doctrines = [
  { id: 'contracts/one', subject: 'contracts', title: 'One', elements: [{ id: 'e1', label: 'first', test: 't1' }, { id: 'e2', label: 'second', test: 't2' }] },
  { id: 'contracts/two', subject: 'contracts', title: 'Two', elements: [{ id: 'f1', label: 'other', test: 't3' }] },
];

test('a true pairing shows the item\'s own definition', () => {
  const q = buildTrueFalse(items, items[0], true);
  assert.equal(q.answer, true); assert.equal(q.text, 'def a');
});

test('a false pairing borrows a neighbour\'s definition and explains both', () => {
  const q = buildTrueFalse(items, items[0], false);
  assert.equal(q.answer, false); assert.notEqual(q.text, 'def a'); assert.ok(q.other); assert.ok(q.own.startsWith('offer:'));
});

test('a false element comes from another doctrine of the same subject', () => {
  const q = buildElement(doctrines, doctrines[0], false);
  assert.equal(q.answer, false); assert.equal(q.from.id, 'contracts/two'); assert.equal(q.element.id, 'f1');
  const t = buildElement(doctrines, doctrines[0], true);
  assert.equal(t.answer, true); assert.ok(['e1', 'e2'].includes(t.element.id));
});

test('Spanish-English pairs are true with the own term and false with a neighbour, and carry the false friend', () => {
  const yes = buildEsEn(items, items[0], true);
  assert.equal(yes.answer, true); assert.equal(yes.term, 'offer'); assert.ok(yes.explain.includes('ff note'));
  const no = buildEsEn(items, items[0], false);
  assert.equal(no.answer, false); assert.equal(no.es, 'oferta'); assert.equal(no.term, 'acceptance');
  assert.equal(buildEsEn(items, items[2]), null);
  assert.equal(nextFeedItem(items, doctrines, 'contracts', 0.35).kind, 'es');
});

test('nextFeedItem respects the scope and the kind bands', () => {
  assert.equal(nextFeedItem(items, doctrines, 'contracts', 0.1).kind, 'tf');
  assert.equal(nextFeedItem(items, doctrines, 'contracts', 0.5).kind, 'el');
  const m = nextFeedItem(items, doctrines, 'contracts', 0.9);
  assert.equal(m.kind, 'mcq'); assert.equal(m.options.length, 4);
  assert.equal(nextFeedItem(items, doctrines, 'lrw', 0.5).kind, 'mcq'); // lrw has no doctrines, falls through
});
