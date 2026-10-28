// Paso de flashcards reutilizable (lo usa la Ronda del día). Resuelve con el resumen.
import { esc } from './engine.js';
import { t, lang } from '../../lib/i18n.js';
import { get, set, update } from '../../lib/store.js';
import { schedule, newCard } from '../../lib/srs.js';
import { todayISO } from '../../lib/dates.js';

export function runCards(container, queueIds, byId) {
  return new Promise(resolve => {
    const queue = queueIds.slice(); let i = 0, reviewed = 0, missed = 0;
    container.innerHTML = `
      <div class="flash-top"><span class="num" data-progress></span><span class="tag" data-type></span></div>
      <button type="button" class="flash-card" data-card><span class="flash-front" data-front></span><span class="flash-back" data-back hidden></span><span class="flash-hint small muted" data-hint>${esc(t('games.flip'))}</span></button>
      <div class="grade" data-grade hidden>
        <button type="button" class="btn" data-g="again">${esc(t('games.again'))}</button>
        <button type="button" class="btn" data-g="hard">${esc(t('games.hard'))}</button>
        <button type="button" class="btn primary" data-g="good">${esc(t('games.good'))}</button>
        <button type="button" class="btn" data-g="easy">${esc(t('games.easy'))}</button>
      </div>`;
    const card = container.querySelector('[data-card]'), front = container.querySelector('[data-front]'), back = container.querySelector('[data-back]');
    const hint = container.querySelector('[data-hint]'), grade = container.querySelector('[data-grade]');
    function show() {
      const it = byId[queue[i]];
      container.querySelector('[data-progress]').textContent = `${i + 1} / ${queue.length}`;
      container.querySelector('[data-type]').textContent = it.type === 'term' ? (it.register || 'term') : it.type;
      front.innerHTML = it.type === 'case' && it.hook ? `<span>${esc(it.front)}</span><span class="f-hook">${esc(it.hook)}</span>` : esc(it.front);
      const esLine = it.type === 'term' ? [it.esTerm, it.es].filter(Boolean).join(': ') : it.es;
      back.innerHTML = `<span class="b-main">${esc(it.back)}</span>` + (it.rule && it.type === 'case' ? `<span class="b-rule">${esc(it.rule)}</span>` : '') + (esLine ? `<span class="b-es ${lang() === 'es' ? '' : 'muted'}">${esc(esLine)}</span>` : '') + (it.falseFriend ? `<span class="b-ff">${esc(it.falseFriend)}</span>` : '');
      back.hidden = true; hint.hidden = false; grade.hidden = true; card.classList.remove('flipped');
    }
    card.addEventListener('click', () => { if (back.hidden) { back.hidden = false; hint.hidden = true; grade.hidden = false; card.classList.add('flipped'); } });
    grade.querySelectorAll('[data-g]').forEach(b => b.addEventListener('click', () => {
      const id = queue[i]; const g = b.dataset.g; const today = todayISO();
      const srs = get('srs', {}) || {}; const wasNew = !srs[id];
      srs[id] = schedule(srs[id] || newCard(), g, today); set('srs', srs);
      update('activity', a => { const n = { ...(a || {}) }; const d = { ...(n[today] || {}) }; d.reviews = (d.reviews || 0) + 1; if (wasNew) d.newSeen = (d.newSeen || 0) + 1; n[today] = d; return n; }, {});
      reviewed++; if (g === 'again') { missed++; queue.push(id); }
      i++; if (i >= queue.length) resolve({ reviewed, missed }); else show();
    }));
    if (!queue.length) resolve({ reviewed: 0, missed: 0 }); else show();
  });
}
