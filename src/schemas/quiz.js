import { common } from './common.js';

// Un set de preguntas de un curso y tema. Tipos: mcq, cloze, short, citation.
export function quizSetSchema(z) {
  const c = common(z);
  const base = { id: c.slug, source: z.string().optional(), tags: z.array(c.slug).default([]) };
  const mcq = z.object({
    ...base, type: z.literal('mcq'),
    stem: z.string().min(1),
    choices: z.array(z.object({ id: z.string().min(1), text: z.string().min(1), correct: z.boolean().default(false), why: z.string().optional() })).min(2).max(5),
    explanation: c.bi,
  }).refine(q => q.choices.filter(x => x.correct).length === 1, { message: 'exactamente una opción correcta', path: ['choices'] });
  const cloze = z.object({
    ...base, type: z.literal('cloze'),
    text: z.string().regex(/\{\{[^}]+\}\}/, 'el texto necesita al menos un hueco {{respuesta}}'),
    explanation: c.bi,
  });
  const short = z.object({
    ...base, type: z.literal('short'),
    stem: z.string().min(1), answer: z.string().min(1), keyPoints: z.array(z.string()).default([]),
  });
  const citation = z.object({
    ...base, type: z.literal('citation'),
    prompt: z.string().min(1), answer: z.string().min(1), accept: z.array(z.string()).default([]), rule: z.string().min(1), explanation: c.bi,
  });
  return z.object({
    id: c.slug,
    course: c.slug,
    topic: c.slug.optional(),
    title: c.biBoth,
    difficulty: z.number().int().min(1).max(3).default(1),
    shuffle: z.boolean().default(true),
    questions: z.array(z.discriminatedUnion('type', [mcq, cloze, short, citation])).min(1),
    verified: z.boolean().default(false),
  });
}
