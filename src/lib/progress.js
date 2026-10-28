// Cifras de la página de progreso, como funciones puras sobre el estado guardado.
import { addDays } from './dates.js';

// Por materia: cuántos ítems hay, cuántos ya se saben (en repaso), cuántos están en aprendizaje y cuántos no se han visto.
export function masteryBySubject(items, srs) {
  const out = {};
  for (const i of items) {
    const m = out[i.subject] || (out[i.subject] = { total: 0, known: 0, learning: 0, fresh: 0 });
    m.total++;
    const c = srs[i.id];
    if (!c) m.fresh++;
    else if (c.state === 'learning') m.learning++;
    else m.known++;
  }
  return out;
}

// Cobertura de cold call de una lista de briefs: cuántos se han ensayado y con qué confianza media.
export function coverage(briefIds, coldcall) {
  let drilled = 0, sum = 0;
  for (const id of briefIds) { const c = coldcall[id]; if (c) { drilled++; sum += Number(c.confidence) || 0; } }
  return { drilled, total: briefIds.length, avg: drilled ? Math.round((sum / drilled) * 10) / 10 : null };
}

// Sumas de los últimos siete días (hoy incluido).
export function weekTotals(activity, today, coldcall = {}) {
  const start = addDays(today, -6);
  const t = { reviews: 0, games: 0, quiz: 0, exercises: 0, rounds: 0, coldcalls: 0 };
  for (const [day, d] of Object.entries(activity || {})) {
    if (day < start || day > today) continue;
    t.reviews += d.reviews || 0; t.games += d.games || 0; t.quiz += d.quiz || 0; t.exercises += d.exercises || 0; t.rounds += d.rounds || 0;
  }
  for (const c of Object.values(coldcall || {})) if (c && c.last >= start && c.last <= today) t.coldcalls++;
  return t;
}

// Días desde la última exportación; null si nunca se exportó.
export function daysSinceExport(lastExport, today) {
  if (!lastExport) return null;
  const d = String(lastExport).slice(0, 10);
  const ms = Date.parse(today) - Date.parse(d);
  return Number.isFinite(ms) ? Math.max(0, Math.round(ms / 86400000)) : null;
}
