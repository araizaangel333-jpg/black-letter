// Learn: cada ítem sube de nivel (elegir → escribir con pista → escribir de memoria) y baja al fallar.
// Resuelve con { mastered, missed, asked, correct } cuando todos los ítems llegan arriba.
import { esc, distractors, fuzzy, hint, answerOf, short } from './engine.js';
import { t, lang } from '../../lib/i18n.js';
import { shuffle } from '../../lib/srs.js';

export function runLearn(container, chosen, pool, { top = 2 } = {}) {
  return new Promise(resolve => {
    const queue = chosen.map(item => ({ item, level: 0, misses: 0 }));
    const mastered = [], missedIds = new Set();
    let asked = 0, correct = 0, cur = null, timer = null;

    const dots = (level) => `<span class="levels" aria-hidden="true">${Array.from({ length: top + 1 }, (_, i) => `<i class="${i < level ? 'on' : ''}"></i>`).join('')}</span>`;
    const stemOf = (it) => it.type === 'case'
      ? `<span class="hook-line">${esc(it.hook || '')}</span><span class="sub">${esc(it.back)}</span>`
      : esc(it.back);
    const explainOf = (it) => `${esc(answerOf(it))}: ${esc(it.back)}` + (it.type === 'term' && (it.esTerm || it.es) ? `<span class="muted small">${esc([it.esTerm, it.es].filter(Boolean).join(': '))}</span>` : '') + (it.type === 'case' && it.rule ? `<span class="muted small">${esc(it.rule)}</span>` : '');

    function show() {
      cur = queue.shift();
      const { item, level } = cur;
      const typed = level >= 1;
      container.innerHTML = `
        <div class="learn-top"><span class="num">${esc(t('learn.mastered', { m: mastered.length, n: chosen.length }))}</span><span>${dots(level)} <span class="small">${esc(t(level === 0 ? 'learn.level0' : level === 1 ? 'learn.level1' : 'learn.level2'))}</span></span></div>
        <p class="stem learn-stem">${stemOf(item)}</p>
        ${typed ? `
          <form class="typed" data-form autocomplete="off">
            <label class="small muted" for="learn-input">${esc(t(item.type === 'case' ? 'learn.typeCase' : 'learn.typeTerm'))}</label>
            ${level === 1 ? `<p class="hint-line num">${esc(hint(answerOf(item)))}</p>` : ''}
            <input id="learn-input" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" data-input>
            <button type="submit" class="btn primary">${esc(t('quiz.check'))}</button>
          </form>`
        : `<div class="choices" data-choices>${shuffle([item, ...distractors(pool, item, 3)]).map((x, k) => `<button type="button" class="choice" data-id="${esc(x.id)}"><span class="cid">${'ABCD'[k]}</span><span>${esc(item.type === 'case' ? answerOf(x) : x.front)}</span></button>`).join('')}</div>`}
        <div class="feedback" data-fb hidden><p class="verdict-line" data-verdict></p><p data-explain></p><a class="small" href="${esc(item.href)}">${esc(t('common.open'))}</a></div>
        <div class="q-nav"><button type="button" class="btn primary" data-next hidden>${esc(t('quiz.next'))}</button></div>`;
      if (typed) {
        const form = container.querySelector('[data-form]'), input = container.querySelector('[data-input]');
        input.focus();
        form.addEventListener('submit', e => { e.preventDefault(); if (!input.value.trim()) return; answer(fuzzy(input.value, item), input); });
      } else {
        container.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => {
          const ok = b.dataset.id === item.id;
          container.querySelectorAll('.choice').forEach(x => { x.disabled = true; if (x.dataset.id === item.id) x.classList.add('is-correct'); });
          if (!ok) b.classList.add('is-wrong');
          answer(ok);
        }));
      }
      container.querySelector('[data-next]').addEventListener('click', next);
    }

    function answer(ok, input) {
      asked++;
      const { item } = cur;
      const fb = container.querySelector('[data-fb]'), v = container.querySelector('[data-verdict]');
      if (input) { input.readOnly = true; input.classList.add(ok ? 'is-correct' : 'is-wrong'); }
      if (ok) {
        correct++; cur.level++;
        const done = cur.level > top;
        v.textContent = t(done ? 'learn.masteredOne' : 'quiz.correct'); v.className = 'verdict-line ok';
        container.querySelector('[data-explain]').innerHTML = done ? explainOf(item) : esc(short(answerOf(item), 80));
        fb.hidden = false;
        if (done) mastered.push(item.id); else queue.push(cur);
        timer = setTimeout(next, done ? 1100 : 700);
      } else {
        cur.misses++; cur.level = Math.max(0, cur.level - 1); missedIds.add(item.id); queue.push(cur);
        v.textContent = t('quiz.incorrect'); v.className = 'verdict-line ko';
        container.querySelector('[data-explain]').innerHTML = explainOf(item);
        fb.hidden = false;
        const nb = container.querySelector('[data-next]'); nb.hidden = false; nb.focus();
      }
    }

    function next() {
      clearTimeout(timer);
      if (!queue.length) { resolve({ mastered, missed: [...missedIds], asked, correct }); return; }
      show();
    }

    if (!queue.length) resolve({ mastered, missed: [], asked: 0, correct: 0 }); else show();
  });
}
