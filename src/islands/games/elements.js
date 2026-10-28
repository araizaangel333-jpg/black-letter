// Elements Builder: una doctrina, sus elementos y unas fichas intrusas de otras doctrinas del mismo curso.
import { esc, norm } from './engine.js';
import { t, lang } from '../../lib/i18n.js';
import { shuffle } from '../../lib/srs.js';

const label = (e) => (lang() === 'es' && e.es) ? e.es : e.label;
const title = (d) => (lang() === 'es' && d.es) ? d.es : d.title;

export function buildRound(doc, all, intruders = 3) {
  const own = new Set(doc.elements.map(e => norm(e.label)));
  const others = all.filter(d => d.id !== doc.id);
  const same = others.filter(d => d.subject === doc.subject);
  const pool = (same.length ? same : others).flatMap(d => d.elements.map(e => ({ ...e, from: d })));
  const foreign = shuffle(pool.filter(e => !own.has(norm(e.label)))).slice(0, intruders);
  return { doc, tiles: shuffle([...doc.elements.map(e => ({ ...e, belongs: true })), ...foreign.map(e => ({ ...e, belongs: false }))]) };
}

export function runElements(container, rounds) {
  return new Promise(resolve => {
    let i = 0, found = 0, total = 0, intruders = 0;
    function show() {
      const { doc, tiles } = rounds[i];
      const n = doc.elements.length;
      container.innerHTML = `
        <div class="learn-top"><span class="num">${esc(t('elements.progress', { i: i + 1, n: rounds.length }))}</span><span class="num">${esc(t('elements.total', { n: found, t: total }))}</span></div>
        <h2 class="el-title">${esc(title(doc))}</h2>
        <p class="small muted">${esc(t('elements.instruction', { n, m: tiles.length }))}</p>
        <div class="el-grid" data-grid>${tiles.map((x, k) => `<button type="button" class="el-tile" aria-pressed="false" data-k="${k}">${esc(label(x))}</button>`).join('')}</div>
        <div class="q-nav" data-actions><button type="button" class="btn primary" data-check>${esc(t('quiz.check'))}</button></div>
        <section class="sec" data-result hidden>
          <p class="verdict-line" data-verdict></p>
          <ol class="el-list">${doc.elements.map(e => `<li data-el="${esc(e.id)}"><span class="el-label">${esc(label(e))}</span>${e.authority ? ` <span class="el-auth">(${esc(e.authority)})</span>` : ''}${e.test ? `<span class="el-test">${esc(e.test)}</span>` : ''}${e.pitfall ? `<span class="el-pit"><b>${esc(t('elements.pitfall'))}:</b> ${esc(e.pitfall)}</span>` : ''}</li>`).join('')}</ol>
          <div class="q-nav"><a class="small" href="${esc(doc.href)}">${esc(t('elements.openNote'))}</a><button type="button" class="btn primary" data-next>${esc(t(i + 1 < rounds.length ? 'quiz.next' : 'games.finish'))}</button></div>
        </section>`;
      container.querySelectorAll('.el-tile').forEach(b => b.addEventListener('click', () => b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true')));
      container.querySelector('[data-check]').addEventListener('click', () => {
        let ok = 0, bad = 0;
        container.querySelectorAll('.el-tile').forEach(b => {
          const x = tiles[Number(b.dataset.k)], sel = b.getAttribute('aria-pressed') === 'true';
          b.disabled = true;
          if (x.belongs && sel) { ok++; b.classList.add('ok'); }
          else if (x.belongs) { b.classList.add('miss'); container.querySelector(`[data-el="${x.id}"]`)?.classList.add('miss'); }
          else if (sel) { bad++; b.classList.add('bad'); }
          else b.classList.add('off');
        });
        found += ok; total += n; intruders += bad;
        container.querySelector('[data-actions]').hidden = true;
        const r = container.querySelector('[data-result]'); r.hidden = false;
        const v = container.querySelector('[data-verdict]');
        v.textContent = `${t('elements.found', { n: ok, t: n })} · ${t('elements.intruders', { n: bad })}`;
        v.className = 'verdict-line ' + (ok === n && bad === 0 ? 'ok' : 'ko');
        r.scrollIntoView({ block: 'start', behavior: 'smooth' });
      });
      container.querySelector('[data-next]').addEventListener('click', () => { i++; if (i >= rounds.length) resolve({ found, total, intruders }); else { show(); container.scrollIntoView({ block: 'start' }); } });
    }
    if (!rounds.length) resolve({ found: 0, total: 0, intruders: 0 }); else show();
  });
}
