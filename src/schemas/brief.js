import { common } from './common.js';

export const BRIEF_RELATIONS = ['extends', 'limits', 'contrasts', 'applies', 'overrules', 'companion'];
export const REQUIRED_HEADINGS = ['Facts', 'Procedural posture', 'Issue', 'Holding', 'Reasoning', 'Rule (own words)'];

const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

// Brief de un caso: lo que se pregunta en clase y en el examen, en palabras propias.
export function briefSchema(z) {
  const c = common(z);
  return z.object({
    title: z.string().min(1),
    citation: z.string().min(1),
    court: z.string().min(1),
    year: z.number().int().min(1600).max(2100),
    course: c.slug,
    topic: c.slug.optional(),
    tags: z.array(c.slug).default([]),
    depth: z.enum(['full', 'skim']).default('full'),
    hook: z.string().refine(s => words(s) <= 14, 'hook: máximo 14 palabras, una imagen memorable'),
    posture: z.string().min(1),
    whyHere: z.string().min(1),
    oneLiner: c.bi.refine(o => words(o.en) <= 30, 'oneLiner.en: máximo 30 palabras'),
    rule: z.string().min(1),
    book: z.object({ book: c.slug, pages: z.string().optional() }).optional(),
    url: z.string().url().optional(),
    outline: z.object({ note: z.string(), element: c.slug.optional() }).optional(),
    relation: z.array(z.object({ brief: z.string(), how: z.enum(BRIEF_RELATIONS) })).default([]),
    questions: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    terms: z.array(c.slug).default([]),
    classNotes: z.string().optional(),
    status: z.enum(['stub', 'draft', 'reviewed']).default('draft'),
    source: z.string().optional(),
    verified: z.boolean().default(false),
    updated: c.isoDate.optional(),
  });
}
