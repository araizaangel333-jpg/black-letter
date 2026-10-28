import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { termSchema } from './schemas/term.js';
import { courseSchema } from './schemas/course.js';

// El id de cada entrada es su ruta sin extensión (contracts, fall-2026, ...).
const generateId = ({ entry }: { entry: string }) => entry.replace(/\.(ya?ml|md|json)$/, '');

const terms = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/terms', generateId }),
  schema: termSchema(z),
});

const courses = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/courses', generateId }),
  schema: courseSchema(z),
});

export const collections = { terms, courses };
