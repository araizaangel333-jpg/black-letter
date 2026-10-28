// Sincroniza el texto de las <option data-en data-es> con el idioma activo.
import { lang, onLangChange } from './i18n.js';
function sync() {
  const l = lang();
  document.querySelectorAll('option[data-en]').forEach(o => { o.textContent = o.dataset[l] || o.dataset.en; });
}
sync();
onLangChange(sync);
