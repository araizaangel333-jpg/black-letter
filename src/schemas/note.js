import { common } from './common.js';

export const NOTE_KINDS = ['outline', 'checklist', 'rule', 'class-notes', 'method'];

// Apuntes propios: outline de un tema, checklist de elementos, regla o notas de clase.
export function noteSchema(z) {
  const c = common(z);
  return z.object({
    title: c.bi,
    course: c.slug,
    topic: c.slug.optional(),
    kind: z.enum(NOTE_KINDS).default('outline'),
    summary: c.bi.optional(),
    sources: z.array(z.object({ book: c.slug.optional(), pages: z.string().optional(), cite: z.string().optional() })).default([]),
    elements: z.array(z.object({
      id: c.slug,
      label: c.bi,
      test: z.string().optional(),
      authority: z.string().optional(),
      pitfall: z.string().optional(),
    })).default([]),
    related: z.object({ briefs: z.array(z.string()).default([]), terms: z.array(c.slug).default([]), notes: z.array(z.string()).default([]) }).default({}),
    status: z.enum(['draft', 'reviewed']).default('draft'),
    verified: z.boolean().default(false),
    updated: c.isoDate.optional(),
  }).refine(n => n.kind !== 'checklist' || n.elements.length >= 2, { message: 'una checklist necesita al menos 2 elementos', path: ['elements'] });
}
