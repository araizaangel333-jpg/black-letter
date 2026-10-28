// Match: 6 pares en una cuadrícula; toca uno y luego su pareja. Resuelve con el resultado.
import { esc, fmtSecs, short } from './engine.js';
import { t } from '../../lib/i18n.js';
import { shuffle } from '../../lib/srs.js';

export function pairsFrom(items) {
  return items.map(i => ({ id: i.id, left: i.front, right: i.type === 'case' ? short(i.hook || i.back, 90) : short(i.back, 110), href: i.href }));
}

export function runMatch(container, pairs, { penalty = 2 } = {}) {
  return new Promise(resolve => {
    const tiles = shuffle([
      ...pairs.map(p => ({ pair: p.id, side: 'l', text: p.left })),
      ...pairs.map(p => ({ pair: p.id, side: 'r', text: p.right })),
    ]);
    container.innerHTML = `
      <div class="match-top"><span class="num" data-left>${pairs.length}</span> <span class="small muted">${esc(t('match.left'))}</span><span class="num match-timer" data-timer>0:00</span></div>
      <div class="match-grid">${tiles.map((x, i) => `<button type="button" class="tile ${x.side}" data-i="${i}" data-pair="${esc(x.pair)}">${esc(x.text)}</button>`).join('')}</div>`;
    const t0 = Date.now(); let extra = 0, wrong = 0, left = pairs.length, first = null, lock = false;
    const timer = container.querySelector('[data-timer]');
    const tick = setInterval(() => { timer.textContent = fmtSecs(Math.round((Date.now() - t0) / 1000) + extra); }, 500);
    container.querySelectorAll('.tile').forEach(b => b.addEventListener('click', () => {
      if (lock || b.classList.contains('done') || b === first) return;
      if (!first) { first = b; b.classList.add('sel'); return; }
      const ok = first.dataset.pair === b.dataset.pair && first.classList.contains('l') !== b.classList.contains('l');
      if (ok) {
        first.classList.add('done'); b.classList.add('done'); first.classList.remove('sel'); first = null; left--;
        container.querySelector('[data-left]').textContent = String(left);
        if (left === 0) { clearInterval(tick); const seconds = Math.round((Date.now() - t0) / 1000) + extra; resolve({ seconds, wrong, pairs: pairs.length }); }
      } else {
        lock = true; wrong++; extra += penalty; const a = first; a.classList.add('bad'); b.classList.add('bad');
        setTimeout(() => { a.classList.remove('bad', 'sel'); b.classList.remove('bad'); first = null; lock = false; }, 450);
      }
    }));
  });
}
