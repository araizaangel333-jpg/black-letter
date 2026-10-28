import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { bundle } from './loaders/bundle.js';
import { termSchema } from './schemas/term.js';
import { courseSchema } from './schemas/course.js';
import { syllabusItemSchema } from './schemas/syllabus.js';
import { briefSchema } from './schemas/brief.js';
import { noteSchema } from './schemas/note.js';
import { glossaryItemSchema } from './schemas/glossary.js';
import { quizSetSchema } from './schemas/quiz.js';
import { exerciseSchema } from './schemas/exercise.js';

// El id de cada entrada es su ruta sin extensión (contracts, contracts/hurst-v-lake, ...).
const generateId = ({ entry }: { entry: string }) => entry.replace(/\.(ya?ml|md|json)$/, '');

const terms = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/terms', generateId }),
  schema: termSchema(z),
});

const courses = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/courses', generateId }),
  schema: courseSchema(z),
});

// Un archivo por curso con `items`; cada ítem hereda `course`.
const syllabus = defineCollection({
  loader: bundle({ base: './src/content/syllabus', inherit: ['course'] }),
  schema: syllabusItemSchema(z),
});

const briefs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/briefs', generateId }),
  schema: briefSchema(z),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes', generateId }),
  schema: noteSchema(z),
});

// Un archivo por materia con `items`; cada término hereda `subject`.
const glossary = defineCollection({
  loader: bundle({ base: './src/content/glossary', inherit: ['subject'] }),
  schema: glossaryItemSchema(z),
});

// Un archivo por curso con `items` (sets de preguntas); cada set hereda `course`.
const quizzes = defineCollection({
  loader: bundle({ base: './src/content/quizzes', inherit: ['course'] }),
  schema: quizSetSchema(z),
});

const exercises = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/exercises', generateId }),
  schema: exerciseSchema(z),
});

export const collections = { terms, courses, syllabus, briefs, notes, glossary, quizzes, exercises };
