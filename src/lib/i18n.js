// Textos de interfaz para el código que corre en el navegador (islas).
import ui from '../i18n/ui.json';

export function lang() {
  return document.documentElement.dataset.lang === 'es' ? 'es' : 'en';
}

export function t(key, vars = {}) {
  const entry = ui[key];
  let s = entry ? entry[lang()] || entry.en : key;
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}

// Campo bilingüe de contenido: { en, es? }.
export function bi(obj) {
  if (!obj) return '';
  return obj[lang()] || obj.en || '';
}

export function onLangChange(fn) {
  window.addEventListener('langchange', fn);
}
