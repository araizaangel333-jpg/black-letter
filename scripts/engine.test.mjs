import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fuzzy, hint, typeable, levenshtein, pickLearn, weakestSubject } from '../src/islands/games/engine.js';

const hamer = { type: 'case', front: 'Hamer v. Sidway (1891)' };
const disney = { type: 'case', front: 'In re The Walt Disney Co. Derivative Litigation (2006)' };
const heppner = { type: 'case', front: 'United States v. Heppner (2026)' };
const auth = { type: 'term', front: 'actual authority (express and implied)' };

test('levenshtein counts edits', () => {
  assert.equal(levenshtein('kitten', 'sitting'), 3);
  assert.equal(levenshtein('', 'abc'), 3);
});

test('a case is accepted by full name, one party or a close misspelling', () => {
  assert.ok(fuzzy('Hamer v. Sidway', hamer));
  assert.ok(fuzzy('hamer', hamer));
  assert.ok(fuzzy('Sidway', hamer));
  assert.ok(fuzzy('Hammer v Sidway', hamer));
  assert.ok(!fuzzy('Lucy', hamer));
  assert.ok(!fuzzy('', hamer));
});

test('generic parties never identify a case; prefixes of the real name do', () => {
  assert.ok(!fuzzy('United States', heppner));
  assert.ok(fuzzy('Heppner', heppner));
  assert.ok(fuzzy('Walt Disney', disney));
  assert.ok(!fuzzy('Caremark', disney));
});

test('a term matches with or without its parenthetical, with one typo', () => {
  assert.ok(fuzzy('actual authority', auth));
  assert.ok(fuzzy('actual authorty', auth));
  assert.ok(!fuzzy('apparent authority', auth));
});

test('hint keeps first letters and connectors', () => {
  assert.equal(hint('Hamer v. Sidway'), 'H____ v. S_____');
  assert.equal(hint('promissory estoppel'), 'p________ e_______');
});

test('typeable keeps short terms and all cases, drops classroom phrases', () => {
  assert.ok(typeable(auth));
  assert.ok(typeable(disney));
  assert.ok(!typeable({ type: 'term', front: "I'd like to build on what [name] said." }));
  assert.ok(!typeable({ type: 'term', front: 'clickwrap, shrinkwrap and browsewrap' }));
  assert.ok(!typeable({ type: 'checklist', front: 'Remedies' }));
});

test('pickLearn puts weak cards first, then due, then new', () => {
  const pool = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  const srs = { a: { state: 'review', lapses: 0, due: '2026-12-01' }, b: { state: 'learning', lapses: 1, due: '2026-10-28' }, c: { state: 'review', lapses: 0, due: '2026-10-01' } };
  const out = pickLearn(pool, srs, 3, '2026-10-28').map(i => i.id);
  assert.deepEqual(out, ['b', 'c', 'd']);
});

test('weakestSubject picks the subject with the most lapses', () => {
  const items = [{ id: 'x', subject: 'contracts' }, { id: 'y', subject: 'lrw' }, { id: 'z', subject: 'lrw' }];
  const srs = { x: { state: 'review', lapses: 1 }, y: { state: 'learning', lapses: 0 }, z: { state: 'review', lapses: 2 } };
  assert.equal(weakestSubject(items, srs), 'lrw');
  assert.equal(weakestSubject(items, {}), null);
});
