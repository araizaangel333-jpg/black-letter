// Piezas compartidas por todos los esquemas. Reciben `z` para que Astro
// (astro/zod) y scripts/check.mjs usen la misma definición.
export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export function common(z) {
  const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'usa kebab-case: letras minúsculas, números y guiones');
  const bi = z.object({ en: z.string().min(1), es: z.string().min(1).optional() });
  const biBoth = z.object({ en: z.string().min(1), es: z.string().min(1) });
  const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha YYYY-MM-DD entre comillas');
  const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'hora HH:MM de 24 h entre comillas');
  return { slug, bi, biBoth, isoDate, hhmm };
}
