// Único punto de acceso a localStorage. Todas las claves llevan el prefijo "llm.".
const PREFIX = 'llm.';

export function get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function set(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function update(key, fn, fallback = null) {
  const next = fn(get(key, fallback));
  set(key, next);
  return next;
}

export function keys() {
  try {
    return Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).map(k => k.slice(PREFIX.length));
  } catch {
    return [];
  }
}

export function exportAll() {
  const data = {};
  for (const k of keys()) data[k] = get(k);
  return { app: 'black-letter', version: 1, exportedAt: new Date().toISOString(), data };
}

export function importAll(payload) {
  if (!payload || payload.app !== 'black-letter' || typeof payload.data !== 'object') {
    throw new Error('not a Black Letter export');
  }
  set('backup', exportAll());
  for (const [k, v] of Object.entries(payload.data)) if (k !== 'backup') set(k, v);
  return Object.keys(payload.data).length;
}

export function prefs() {
  return get('prefs', { lang: 'en', theme: 'system' }) || {};
}

export function setPref(name, value) {
  return update('prefs', p => ({ ...(p || {}), [name]: value }), {});
}
