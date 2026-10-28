import { common } from './common.js';

export const SYLLABUS_TYPES = ['reading', 'assignment', 'exam', 'class', 'review', 'event'];

// Una lectura, entrega, examen o sesión especial de un curso, con fecha.
export function syllabusItemSchema(z) {
  const c = common(z);
  return z.object({
    id: c.slug,
    course: c.slug,
    type: z.enum(SYLLABUS_TYPES),
    date: c.isoDate,
    time: z.object({ start: c.hhmm, end: c.hhmm }).optional(),
    due: c.isoDate.optional(),
    dueTime: c.hhmm.optional(),
    week: z.number().int().positive().optional(),
    title: c.bi,
    topic: c.slug.optional(),
    pages: z.array(z.object({ book: c.slug, pages: z.string().optional(), sections: z.string().optional(), note: z.string().optional() })).default([]),
    briefs: z.array(z.string()).default([]),
    notes: z.array(z.string()).default([]),
    tasks: z.array(c.bi).default([]),
    source: z.string().optional(),
    note: c.bi.optional(),
    optional: z.boolean().default(false),
    verified: z.boolean().default(true),
  });
}
