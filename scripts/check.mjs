// Valida todo el contenido antes de construir. Falla con archivo y línea.
//   npm run check
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parseDocument, parse } from 'yaml';
import { z } from 'astro/zod';
import { termSchema } from '../src/schemas/term.js';
import { courseSchema } from '../src/schemas/course.js';
import { syllabusItemSchema } from '../src/schemas/syllabus.js';
import { briefSchema, REQUIRED_HEADINGS } from '../src/schemas/brief.js';
import { noteSchema } from '../src/schemas/note.js';
import { glossaryItemSchema } from '../src/schemas/glossary.js';
import { quizSetSchema } from '../src/schemas/quiz.js';
import { exerciseSchema, REQUIRED_SECTIONS } from '../src/schemas/exercise.js';

const ROOT = new URL('..', import.meta.url).pathname;
const errors = [];
const warnings = [];
const rel = (f) => relative(ROOT, f);
const err = (file, line, msg) => errors.push(`${rel(file)}${line ? ':' + line : ''}  ${msg}`);
const warn = (file, msg) => warnings.push(`${rel(file)}  ${msg}`);

function walk(dir, exts) {
  if (!existsSync(dir)) return [];
  let out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out = out.concat(walk(p, exts));
    else if (exts.some(e => name.endsWith(e))) out.push(p);
  }
  return out;
}

function loadYaml(file) {
  const text = readFileSync(file, 'utf8');
  const doc = parseDocument(text);
  if (doc.errors.length) {
    for (const e of doc.errors) err(file, e.linePos?.[0]?.line, `YAML: ${e.message.split('\n')[0]}`);
    return null;
  }
  return { data: doc.toJS(), doc, text };
}

function lineOfPath(doc, path) {
  try {
    const node = doc.getIn(path, true);
    if (node?.range) return doc.toString().slice(0, node.range[0]).split('\n').length;
  } catch { /* sin línea */ }
  return undefined;
}

function validate(file, data, schema, doc, basePath = []) {
  const r = schema.safeParse(data);
  if (r.success) return r.data;
  for (const issue of r.error.issues) {
    const line = doc ? lineOfPath(doc, [...basePath, ...issue.path]) : undefined;
    err(file, line, `${[...basePath, ...issue.path].join('.') || '(raíz)'}: ${issue.message}`);
  }
  return null;
}

function splitFrontmatter(file) {
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) { err(file, 1, 'falta el frontmatter (--- ... ---)'); return null; }
  const doc = parseDocument(m[1]);
  if (doc.errors.length) { for (const e of doc.errors) err(file, (e.linePos?.[0]?.line || 0) + 1, `YAML: ${e.message.split('\n')[0]}`); return null; }
  return { data: doc.toJS(), doc, body: m[2] };
}

// --- semestres y cursos ---
const terms = {};
for (const file of walk(join(ROOT, 'src/content/terms'), ['.yaml', '.yml'])) {
  const l = loadYaml(file); if (!l) continue;
  const data = validate(file, l.data, termSchema(z), l.doc); if (!data) continue;
  if (terms[data.id]) err(file, undefined, `id duplicado: ${data.id}`);
  terms[data.id] = data;
  if (!(data.start < data.classesEnd && data.classesEnd < data.exams.start && data.exams.start <= data.exams.end && data.exams.end <= data.end)) {
    err(file, undefined, 'las fechas deben ir en orden: start < classesEnd < exams.start <= exams.end <= end');
  }
  if (!data.verified) warn(file, 'semestre sin verificar contra el calendario oficial');
}

const courses = {};
for (const file of walk(join(ROOT, 'src/content/courses'), ['.yaml', '.yml'])) {
  const l = loadYaml(file); if (!l) continue;
  const data = validate(file, l.data, courseSchema(z), l.doc); if (!data) continue;
  if (courses[data.id]) err(file, undefined, `id duplicado: ${data.id}`);
  courses[data.id] = data;
  if (!terms[data.term]) err(file, lineOfPath(l.doc, ['term']), `term "${data.term}" no existe`);
  const seen = new Set();
  data.topics.forEach((tp, i) => { if (seen.has(tp.id)) err(file, lineOfPath(l.doc, ['topics', i]), `tema duplicado: ${tp.id}`); seen.add(tp.id); });
  const books = new Set();
  data.books.forEach((b, i) => { if (books.has(b.id)) err(file, lineOfPath(l.doc, ['books', i]), `libro duplicado: ${b.id}`); books.add(b.id); if (!b.verified) warn(file, `libro "${b.short}" por confirmar`); });
  data.meetings.forEach((m, i) => { if (m.start >= m.end) err(file, lineOfPath(l.doc, ['meetings', i]), `la sesión termina antes de empezar (${m.start}–${m.end})`); });
}
const colors = Object.values(courses).map(c => c.color);
if (new Set(colors).size !== colors.length) warn(join(ROOT, 'src/content/courses'), 'dos cursos comparten color');
const topicOf = (course, topic) => courses[course]?.topics.some(t => t.id === topic);
const bookOf = (course, book) => courses[course]?.books.some(b => b.id === book);

// --- glosario (paquetes) ---
const glossary = {};
for (const file of walk(join(ROOT, 'src/content/glossary'), ['.yaml', '.yml'])) {
  const l = loadYaml(file); if (!l) continue;
  const items = l.data?.items || [];
  if (!Array.isArray(items) || !items.length) { err(file, undefined, 'el archivo necesita una lista "items"'); continue; }
  items.forEach((raw, i) => {
    const data = validate(file, { subject: l.data.subject, ...raw }, glossaryItemSchema(z), l.doc, ['items', i]);
    if (!data) return;
    if (glossary[data.id]) err(file, lineOfPath(l.doc, ['items', i]), `término duplicado: ${data.id}`);
    glossary[data.id] = data;
  });
}
for (const [id, g] of Object.entries(glossary)) {
  for (const r of g.related) if (!glossary[r]) warn(join(ROOT, 'src/content/glossary'), `"${id}" relaciona con un término inexistente: ${r}`);
}

// --- briefs ---
const briefs = {};
for (const file of walk(join(ROOT, 'src/content/briefs'), ['.md'])) {
  const fm = splitFrontmatter(file); if (!fm) continue;
  const id = rel(file).replace(/^src\/content\/briefs\//, '').replace(/\.md$/, '');
  const data = validate(file, fm.data, briefSchema(z), fm.doc); if (!data) continue;
  briefs[id] = data;
  if (!courses[data.course]) err(file, lineOfPath(fm.doc, ['course']), `curso "${data.course}" no existe`);
  else if (data.topic && !topicOf(data.course, data.topic)) err(file, lineOfPath(fm.doc, ['topic']), `tema "${data.topic}" no existe en ${data.course}`);
  if (data.book && !bookOf(data.course, data.book.book)) err(file, lineOfPath(fm.doc, ['book']), `libro "${data.book.book}" no existe en ${data.course}`);
  if (data.depth === 'full') {
    const heads = [...fm.body.matchAll(/^## (.+)$/gm)].map(m => m[1].trim());
    for (const h of REQUIRED_HEADINGS) if (!heads.includes(h)) err(file, undefined, `brief completo sin la sección "## ${h}"`);
  }
  if (/[A-Z][a-z]+ v\. [A-Z]/.test(data.oneLiner.en)) warn(file, 'oneLiner.en menciona un nombre de caso; debe describir la regla sin partes');
  for (const t of data.terms) if (!glossary[t]) warn(file, `término del glosario inexistente: ${t}`);
  if (!data.verified) warn(file, 'brief sin verificar');
}
for (const [id, b] of Object.entries(briefs)) for (const r of b.relation) if (!briefs[r.brief]) err(join(ROOT, 'src/content/briefs', id + '.md'), undefined, `relation apunta a un brief inexistente: ${r.brief}`);

// --- notas ---
const notes = {};
for (const file of walk(join(ROOT, 'src/content/notes'), ['.md'])) {
  const fm = splitFrontmatter(file); if (!fm) continue;
  const id = rel(file).replace(/^src\/content\/notes\//, '').replace(/\.md$/, '');
  const data = validate(file, fm.data, noteSchema(z), fm.doc); if (!data) continue;
  notes[id] = data;
  if (!courses[data.course]) err(file, lineOfPath(fm.doc, ['course']), `curso "${data.course}" no existe`);
  else if (data.topic && !topicOf(data.course, data.topic)) err(file, lineOfPath(fm.doc, ['topic']), `tema "${data.topic}" no existe en ${data.course}`);
  for (const b of data.related.briefs) if (!briefs[b]) err(file, undefined, `brief relacionado inexistente: ${b}`);
  for (const t of data.related.terms) if (!glossary[t]) warn(file, `término relacionado inexistente: ${t}`);
}

// --- syllabus (paquetes) ---
const syllabusIds = new Set();
for (const file of walk(join(ROOT, 'src/content/syllabus'), ['.yaml', '.yml'])) {
  const l = loadYaml(file); if (!l) continue;
  const course = l.data?.course;
  if (!courses[course]) { err(file, lineOfPath(l.doc, ['course']), `curso "${course}" no existe`); continue; }
  const term = terms[courses[course].term];
  (l.data.items || []).forEach((raw, i) => {
    const data = validate(file, { course, ...raw }, syllabusItemSchema(z), l.doc, ['items', i]);
    if (!data) return;
    const where = lineOfPath(l.doc, ['items', i]);
    if (syllabusIds.has(data.id)) err(file, where, `id duplicado: ${data.id}`);
    syllabusIds.add(data.id);
    if (data.topic && !topicOf(course, data.topic)) err(file, where, `tema "${data.topic}" no existe en ${course}`);
    for (const p of data.pages) if (!bookOf(course, p.book)) err(file, where, `libro "${p.book}" no existe en ${course}`);
    for (const b of data.briefs) if (!briefs[b]) err(file, where, `brief inexistente: ${b}`);
    for (const n of data.notes) if (!notes[n]) err(file, where, `nota inexistente: ${n}`);
    if (term && (data.date < term.start || data.date > term.end)) warn(file, `${data.id}: la fecha ${data.date} cae fuera del semestre`);
    if (data.due && data.due < data.date) err(file, where, `${data.id}: due antes de date`);
    if (!data.verified) warn(file, `${data.id}: por confirmar`);
  });
}


// --- quizzes (paquetes) ---
const quizIds = new Set();
for (const file of walk(join(ROOT, 'src/content/quizzes'), ['.yaml', '.yml'])) {
  const l = loadYaml(file); if (!l) continue;
  const course = l.data?.course;
  if (!courses[course]) { err(file, lineOfPath(l.doc, ['course']), `curso "${course}" no existe`); continue; }
  (l.data.items || []).forEach((raw, i) => {
    const data = validate(file, { course, ...raw }, quizSetSchema(z), l.doc, ['items', i]);
    if (!data) return;
    const where = lineOfPath(l.doc, ['items', i]);
    if (quizIds.has(data.id)) err(file, where, `set duplicado: ${data.id}`);
    quizIds.add(data.id);
    if (data.topic && !topicOf(course, data.topic)) err(file, where, `tema "${data.topic}" no existe en ${course}`);
    const qids = new Set();
    data.questions.forEach((q, j) => { if (qids.has(q.id)) err(file, lineOfPath(l.doc, ['items', i, 'questions', j]), `pregunta duplicada: ${q.id}`); qids.add(q.id); });
  });
}


// --- ejercicios ---
const exercises = {};
for (const file of walk(join(ROOT, 'src/content/exercises'), ['.md'])) {
  const fm = splitFrontmatter(file); if (!fm) continue;
  const id = rel(file).replace(/^src\/content\/exercises\//, '').replace(/\.md$/, '');
  const data = validate(file, fm.data, exerciseSchema(z), fm.doc); if (!data) continue;
  exercises[id] = data;
  if (!courses[data.course]) err(file, lineOfPath(fm.doc, ['course']), `curso "${data.course}" no existe`);
  else for (const tp of data.topics) if (!topicOf(data.course, tp)) err(file, lineOfPath(fm.doc, ['topics']), `tema "${tp}" no existe en ${data.course}`);
  const heads = [...fm.body.matchAll(/^## (.+)$/gm)].map(m => m[1].trim());
  for (const h of REQUIRED_SECTIONS[data.kind] || []) if (!heads.some(x => x.toLowerCase().startsWith(h.toLowerCase()))) err(file, undefined, `ejercicio ${data.kind} sin la sección "## ${h}"`);
  for (const b of data.related.briefs) if (!briefs[b]) err(file, undefined, `brief relacionado inexistente: ${b}`);
  for (const t of data.related.terms) if (!glossary[t]) warn(file, `término relacionado inexistente: ${t}`);
  const ids = new Set();
  data.checklist.forEach(c => { if (ids.has(c.id)) err(file, undefined, `checklist con id duplicado: ${c.id}`); ids.add(c.id); });
  if (!data.verified) warn(file, 'ejercicio sin verificar');
}

// --- textos de interfaz ---
const uiFile = join(ROOT, 'src/i18n/ui.json');
const ui = JSON.parse(readFileSync(uiFile, 'utf8'));
for (const [k, v] of Object.entries(ui)) {
  if (!v || typeof v.en !== 'string' || !v.en.trim()) err(uiFile, undefined, `"${k}" sin texto en inglés`);
  if (!v || typeof v.es !== 'string' || !v.es.trim()) err(uiFile, undefined, `"${k}" sin texto en español`);
}
const used = new Set();
for (const file of walk(join(ROOT, 'src'), ['.astro', '.js', '.ts'])) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/\bk="([a-zA-Z0-9_.-]+)"/g)) used.add([m[1], file]);
  for (const m of text.matchAll(/\bt\('([a-zA-Z0-9_.-]+)'/g)) used.add([m[1], file]);
}
for (const [k, file] of used) if (!ui[k]) err(file, undefined, `clave de ui.json inexistente: ${k}`);

// --- resultado ---
console.log(`terms ${Object.keys(terms).length} · courses ${Object.keys(courses).length} · syllabus ${syllabusIds.size} · briefs ${Object.keys(briefs).length} · notes ${Object.keys(notes).length} · glossary ${Object.keys(glossary).length} · quizzes ${quizIds.size} · exercises ${Object.keys(exercises).length} · ui ${Object.keys(ui).length}`);
for (const w of warnings) console.log(`⚠ ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✖ ${e}`);
  console.error(`\n${errors.length} error(es)`);
  process.exit(1);
}
console.log('✓ contenido válido');
