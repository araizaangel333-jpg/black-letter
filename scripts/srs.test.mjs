import { test } from 'node:test';
import assert from 'node:assert/strict';
import { schedule, newCard, buildQueue, maturity } from '../src/lib/srs.js';

const T = '2026-10-27';

test('a new card graded good is due in two days', () => {
  const c = schedule(newCard(), 'good', T);
  assert.equal(c.ivl, 2);
  assert.equal(c.due, '2026-10-29');
  assert.equal(c.state, 'review');
  assert.equal(c.reps, 1);
});

test('again on a new card keeps it due today', () => {
  const c = schedule(newCard(), 'again', T);
  assert.equal(c.ivl, 0);
  assert.equal(c.due, T);
  assert.equal(c.state, 'learning');
});

test('intervals grow with good and are capped at 60 days', () => {
  let c = newCard();
  for (let i = 0; i < 8; i++) c = schedule(c, 'good', T);
  assert.equal(c.ivl, 60);
  assert.equal(c.due, '2026-12-26');
});

test('a lapse resets the interval and lowers ease', () => {
  let c = schedule(schedule(newCard(), 'good', T), 'good', T);
  const before = c.ease;
  c = schedule(c, 'again', T);
  assert.equal(c.ivl, 1);
  assert.equal(c.lapses, 1);
  assert.ok(c.ease < before);
  assert.ok(c.ease >= 1.3);
});

test('easy raises ease and jumps further than good', () => {
  const good = schedule(newCard(), 'good', T);
  const easy = schedule(newCard(), 'easy', T);
  assert.ok(easy.ivl > good.ivl);
  assert.ok(easy.ease > good.ease);
});

test('queue puts due cards first and limits new cards', () => {
  const srs = { a: { due: '2026-10-20', state: 'review', ivl: 3 }, b: { due: '2026-11-05', state: 'review', ivl: 9 } };
  const q = buildQueue(srs, ['a', 'b', 'c', 'd', 'e'], T, { newPerDay: 2 });
  assert.equal(q[0], 'a');
  assert.ok(!q.includes('b'));
  assert.equal(q.length, 3);
});

test('maturity labels', () => {
  assert.equal(maturity(undefined), 'new');
  assert.equal(maturity({ state: 'review', ivl: 30 }), 'mature');
  assert.equal(maturity({ state: 'review', ivl: 5 }), 'young');
});
