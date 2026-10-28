import { common, DAYS } from './common.js';

export const BOOK_ROLES = ['casebook', 'statutory-supplement', 'textbook', 'style-manual', 'exercises', 'reference'];
export const ASSESSMENT_KINDS = ['final-exam', 'midterm', 'memo', 'citation-exercises', 'participation', 'presentation', 'paper', 'other'];
export const COURSE_COLORS = ['c1', 'c2', 'c3', 'c4', 'c5'];

// Un curso: horario, libros (solo la cita), temas y forma de evaluación.
export function courseSchema(z) {
  const c = common(z);
  return z.object({
    id: c.slug,
    code: z.string().min(1).max(6),
    title: c.biBoth,
    term: c.slug,
    professor: z.object({ name: z.string().min(1), title: z.string().optional() }),
    meetings: z.array(z.object({ day: z.enum(DAYS), start: c.hhmm, end: c.hhmm, room: z.string().optional() })).min(1),
    extras: z.array(z.object({
      kind: z.enum(['review', 'office-hours', 'lab', 'other']),
      day: z.enum(DAYS), start: c.hhmm, end: c.hhmm, room: z.string().optional(), label: c.biBoth,
    })).default([]),
    books: z.array(z.object({
      id: c.slug,
      cite: z.string().min(1),
      short: z.string().min(1),
      role: z.enum(BOOK_ROLES),
      required: z.boolean().default(true),
      verified: z.boolean().default(true),
    })).default([]),
    topics: z.array(z.object({
      id: c.slug,
      order: z.number().int().positive(),
      title: c.biBoth,
      barTested: z.boolean().optional(),
    })).min(1),
    assessment: z.array(z.object({
      kind: z.enum(ASSESSMENT_KINDS),
      weight: z.string().optional(),
      format: c.bi.optional(),
      date: c.isoDate.optional(),
      verified: z.boolean().default(true),
    })).default([]),
    materials: z.object({ canvas: z.boolean(), note: c.bi.optional() }),
    color: z.enum(COURSE_COLORS),
    about: c.bi.optional(),
  });
}
