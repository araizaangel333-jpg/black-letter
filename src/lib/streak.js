// Racha: días consecutivos con al menos una ronda completada (o actividad equivalente).
import { addDays } from './dates.js';

export function isActive(day) {
  if (!day) return false;
  return (day.rounds || 0) >= 1 || (day.games || 0) >= 1 || (day.quiz || 0) >= 1 || (day.coldcall || 0) >= 1 || (day.reviews || 0) >= 10;
}

export function streak(activity, today) {
  const a = activity || {};
  let d = today, n = 0;
  if (!isActive(a[d])) d = addDays(d, -1); // hoy todavía cuenta si ayer fue activo
  while (isActive(a[d])) { n++; d = addDays(d, -1); }
  return n;
}

export function week(activity, today) {
  const a = activity || {};
  const out = [];
  for (let i = 6; i >= 0; i--) { const d = addDays(today, -i); out.push({ date: d, active: isActive(a[d]) }); }
  return out;
}
