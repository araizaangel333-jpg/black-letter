// Mini cold call: un caso, en voz alta, en 60 segundos. Resuelve con la confianza (0–2).
import { esc } from './engine.js';
import { t } from '../../lib/i18n.js';
import { update } from '../../lib/store.js';
import { todayISO } from '../../lib/dates.js';

export function runMiniColdCall(container, item) {
  return new Promise(resolve => {
    container.innerHTML = `
      <div class="drill-stage">
        <span class="tag">${esc(t('games.coldcall'))}</span>
        <h2 class="drill-label">${esc(item.front)}</h2>
        <p class="hook">${esc(item.hook || '')}</p>
        <p class="small muted">${esc(t('round.sayRule'))}</p>
        <div class="prose" data-answer hidden><p><strong>${esc(item.back)}</strong></p>${item.rule ? `<p>${esc(item.rule)}</p>` : ''}${item.es ? `<p class="muted">${esc(item.es)}</p>` : ''}</div>
      </div>
      <div class="drill-controls">
        <button type="button" class="btn primary" data-reveal>${esc(t('drill.reveal'))}</button>
        <div class="rate" data-rate hidden><span class="small">${esc(t('drill.rate'))}</span><div class="rate-buttons">
          <button type="button" class="btn" data-r="0">${esc(t('drill.missed'))}</button>
          <button type="button" class="btn" data-r="1">${esc(t('drill.partial'))}</button>
          <button type="button" class="btn" data-r="2">${esc(t('drill.solid'))}</button></div></div>
        <a class="small" href="${esc(item.href)}?drill=1">${esc(t('round.fullDrill'))}</a>
      </div>`;
    container.querySelector('[data-reveal]').addEventListener('click', () => { container.querySelector('[data-answer]').hidden = false; container.querySelector('[data-reveal]').hidden = true; container.querySelector('[data-rate]').hidden = false; });
    container.querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => {
      const n = Number(b.dataset.r); const briefId = item.id.replace(/^case:/, '');
      update('coldcall', c => ({ ...(c || {}), [briefId]: { last: todayISO(), confidence: n, mini: true } }), {});
      resolve({ confidence: n });
    }));
  });
}
