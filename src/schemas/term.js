import { common } from './common.js';

// Un semestre: fechas de inicio y fin, último día de clases, exámenes y festivos.
export function termSchema(z) {
  const c = common(z);
  const holiday = z.union([
    z.object({ date: c.isoDate, label: c.biBoth }),
    z.object({ from: c.isoDate, to: c.isoDate, label: c.biBoth }),
  ]);
  return z.object({
    id: c.slug,
    label: c.biBoth,
    start: c.isoDate,
    end: c.isoDate,
    classesEnd: c.isoDate,
    exams: z.object({ start: c.isoDate, end: c.isoDate }),
    holidays: z.array(holiday).default([]),
    timezone: z.string().default('America/Chicago'),
    verified: z.boolean().default(false),
    source: z.string().optional(),
  });
}
