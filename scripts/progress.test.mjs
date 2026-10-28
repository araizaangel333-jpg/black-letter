import { test } from 'node:test';
import assert from 'node:assert/strict';
import { masteryBySubject, coverage, weekTotals, daysSinceExport } from '../src/lib/progress.js';

test('masteryBySubject splits items into known, learning and unseen', () => {
  const items = [{ id: 'a', subject: 'contracts' }, { id: 'b', subject: 'contracts' }, { id: 'c', subject: 'contracts' }, { id: 'd', subject: 'lrw' }];
  const srs = { a: { state: 'review' }, b: { state: 'learning' } };
  assert.deepEqual(masteryBySubject(items, srs), { contracts: { total: 3, known: 1, learning: 1, fresh: 1 }, lrw: { total: 1, known: 0, learning: 0, fresh: 1 } });
});

test('coverage counts drilled briefs and averages confidence', () => {
  const cc = { 'contracts/hamer-v-sidway': { last: '2026-10-27', confidence: 2 }, 'contracts/kirksey-v-kirksey': { last: '2026-10-28', confidence: 1 } };
  assert.deepEqual(coverage(['contracts/hamer-v-sidway', 'contracts/kirksey-v-kirksey', 'contracts/mills-v-wyman'], cc), { drilled: 2, total: 3, avg: 1.5 });
  assert.deepEqual(coverage(['x'], {}), { drilled: 0, total: 1, avg: null });
});

test('weekTotals sums the last seven days only', () => {
  const activity = { '2026-10-28': { reviews: 10, games: 2 }, '2026-10-22': { reviews: 5, quiz: 1 }, '2026-10-21': { reviews: 99 } };
  const cc = { a: { last: '2026-10-25', confidence: 2 }, b: { last: '2026-10-01', confidence: 2 } };
  assert.deepEqual(weekTotals(activity, '2026-10-28', cc), { reviews: 15, games: 2, quiz: 1, exercises: 0, rounds: 0, coldcalls: 1 });
});

test('daysSinceExport handles never and ISO timestamps', () => {
  assert.equal(daysSinceExport(null, '2026-10-28'), null);
  assert.equal(daysSinceExport('2026-10-14T10:00:00.000Z', '2026-10-28'), 14);
});
