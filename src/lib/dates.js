// Fechas como cadenas ISO (YYYY-MM-DD) y horas HH:MM, siempre en la zona del campus.
export const TZ = 'America/Chicago';
const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function todayISO(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function nowHM(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now);
  const h = parts.find(p => p.type === 'hour').value.padStart(2, '0');
  const m = parts.find(p => p.type === 'minute').value.padStart(2, '0');
  return `${h === '24' ? '00' : h}:${m}`;
}

function utc(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function addDays(iso, n) {
  return new Date(utc(iso) + n * 86400000).toISOString().slice(0, 10);
}

export function dayOfWeek(iso) {
  return DOW[new Date(utc(iso)).getUTCDay()];
}

export function daysBetween(fromIso, toIso) {
  return Math.round((utc(toIso) - utc(fromIso)) / 86400000);
}

export function formatDate(iso, lang = 'en', opts = { weekday: 'short', month: 'short', day: 'numeric' }) {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-MX' : 'en-US', { timeZone: 'UTC', ...opts }).format(new Date(utc(iso)));
}

export function formatTime(hm, lang = 'en') {
  const [h, m] = hm.split(':').map(Number);
  if (lang === 'es') return `${h}:${String(m).padStart(2, '0')}`;
  const suffix = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}
