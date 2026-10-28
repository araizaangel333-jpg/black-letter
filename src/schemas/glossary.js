import { common } from './common.js';

export const REGISTERS = ['legal', 'academic', 'everyday', 'phrase'];
export const SUBJECTS = ['contracts', 'business-associations', 'lrw', 'perspectives', 'externship', 'courts', 'classroom', 'general'];

// Término del glosario: inglés primero, glosa y explicación en español, falso amigo si aplica.
export function glossaryItemSchema(z) {
  const c = common(z);
  return z.object({
    id: c.slug,
    term: z.string().min(1),
    pos: z.enum(['noun', 'verb', 'adjective', 'adverb', 'phrase', 'latin']).optional(),
    register: z.enum(REGISTERS).default('legal'),
    subject: z.enum(SUBJECTS),
    topic: c.slug.optional(),
    en: z.object({ definition: z.string().min(1), usage: z.string().optional() }),
    es: z.object({ term: z.string().optional(), explanation: z.string().min(1), falseFriend: z.string().optional() }),
    examples: z.array(z.object({ en: z.string().min(1), es: z.string().optional() })).default([]),
    authority: z.string().optional(),
    related: z.array(c.slug).default([]),
    difficulty: z.number().int().min(1).max(3).default(1),
    autoCard: z.boolean().default(true),
    verified: z.boolean().default(false),
  });
}
