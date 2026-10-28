import { addDays, dayOfWeek } from './dates.js';

export function isHoliday(term, iso) {
  return (term.holidays || []).some(h => (h.date ? h.date === iso : iso >= h.from && iso <= h.to));
}

export function isClassDay(term, iso) {
  return iso >= term.start && iso <= term.classesEnd && !isHoliday(term, iso);
}

// Sesiones de un curso en una fecha concreta.
export function meetingsOn(course, term, iso) {
  if (!isClassDay(term, iso)) return [];
  const dow = dayOfWeek(iso);
  return course.meetings.filter(m => m.day === dow).map(m => ({ ...m, date: iso }));
}

// La próxima sesión a partir de hoy (incluye la que está en curso).
export function nextMeeting(course, term, todayIso, hm) {
  for (let i = 0; i < 200; i++) {
    const iso = addDays(todayIso, i);
    if (iso > term.classesEnd) return null;
    for (const m of meetingsOn(course, term, iso)) {
      if (i === 0 && m.end <= hm) continue;
      return { ...m, daysAway: i, inProgress: i === 0 && m.start <= hm };
    }
  }
  return null;
}

// Todas las fechas de clase de un curso en el semestre (para el calendario).
export function meetingDates(course, term) {
  const out = [];
  for (let iso = term.start; iso <= term.classesEnd; iso = addDays(iso, 1)) {
    for (const m of meetingsOn(course, term, iso)) out.push(m);
  }
  return out;
}
