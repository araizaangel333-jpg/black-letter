import { common } from './common.js';

export const EXERCISE_KINDS = ['hypo', 'ethics-scenario', 'memo', 'email', 'definition'];
export const FRAMEWORKS = ['IRAC', 'CREAC', 'BLUF', 'none'];
export const CHECK_KINDS = ['issue', 'rule', 'explanation', 'application', 'counter', 'conclusion', 'format', 'citation', 'judgment'];
// Secciones obligatorias del cuerpo según el tipo (la respuesta modelo se oculta hasta entregar).
export const REQUIRED_SECTIONS = {
  hypo: ['Facts', 'Call of the question', 'Model answer'],
  'ethics-scenario': ['Facts', 'Call of the question', 'Model answer'],
  memo: ['Assignment', 'Model answer'],
  email: ['Assignment', 'Model answer'],
  definition: ['Assignment', 'Model answer'],
};

// Ejercicio de escritura: hipótesis, escenario ético, memo, correo o definición.
export function exerciseSchema(z) {
  const c = common(z);
  return z.object({
    title: c.biBoth,
    course: c.slug,
    kind: z.enum(EXERCISE_KINDS),
    topics: z.array(c.slug).default([]),
    framework: z.enum(FRAMEWORKS).default('CREAC'),
    timeLimit: z.number().int().positive().default(25),
    targetWords: z.number().int().positive().optional(),
    difficulty: z.number().int().min(1).max(3).default(2),
    checklist: z.array(z.object({
      id: c.slug,
      label: c.biBoth,
      points: z.number().int().positive().default(1),
      kind: z.enum(CHECK_KINDS).optional(),
      authority: z.string().optional(),
    })).min(1),
    related: z.object({ briefs: z.array(z.string()).default([]), terms: z.array(c.slug).default([]), notes: z.array(z.string()).default([]) }).default({}),
    status: z.enum(['draft', 'reviewed']).default('draft'),
    source: z.string().optional(),
    verified: z.boolean().default(false),
    updated: c.isoDate.optional(),
  });
}
