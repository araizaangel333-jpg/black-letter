// Valida todo el contenido antes de construir. Falla con archivo y línea.
//   npm run check
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parseDocument } from 'yaml';
import { z } from 'astro/zod';
import { termSchema } from '../src/schemas/term.js';
import { courseSchema } from '../src/schemas/course.js';

const ROOT = new URL('..', import.meta.url).pathname;
const errors = [];
const warnings = [];
const err = (file, line, msg) => errors.push(`${relative(ROOT, file)}${line ? ':' + line : ''}  ${msg}`);
const warn = (file, msg) => warnings.push(`${relative(ROOT, file)}  ${msg}`);

function walk(dir, exts) {
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
    if (node?.range) {
      const before = doc.toString().slice(0, node.range[0]);
      return before.split('\n').length;
    }
  } catch { /* sin línea */ }
  return undefined;
}

function validate(file, loaded, schema) {
  const r = schema.safeParse(loaded.data);
  if (r.success) return r.data;
  for (const issue of r.error.issues) {
    const line = lineOfPath(loaded.doc, issue.path);
    err(file, line, `${issue.path.join('.') || '(raíz)'}: ${issue.message}`);
  }
  return null;
}

// --- colecciones ---
const terms = {};
for (const file of walk(join(ROOT, 'src/content/terms'), ['.yaml', '.yml'])) {
  const loaded = loadYaml(file); if (!loaded) continue;
  const data = validate(file, loaded, termSchema(z)); if (!data) continue;
  if (terms[data.id]) err(file, undefined, `id duplicado: ${data.id}`);
  terms[data.id] = data;
  if (!(data.start < data.classesEnd && data.classesEnd < data.exams.start && data.exams.start <= data.exams.end && data.exams.end <= data.end)) {
    err(file, undefined, 'las fechas deben ir en orden: start < classesEnd < exams.start <= exams.end <= end');
  }
  if (!data.verified) warn(file, 'semestre sin verificar contra el calendario oficial');
}

const courses = {};
for (const file of walk(join(ROOT, 'src/content/courses'), ['.yaml', '.yml'])) {
  const loaded = loadYaml(file); if (!loaded) continue;
  const data = validate(file, loaded, courseSchema(z)); if (!data) continue;
  if (courses[data.id]) err(file, undefined, `id duplicado: ${data.id}`);
  courses[data.id] = data;
  if (!terms[data.term]) err(file, lineOfPath(loaded.doc, ['term']), `term "${data.term}" no existe en src/content/terms`);
  const topicIds = new Set();
  data.topics.forEach((tp, i) => {
    if (topicIds.has(tp.id)) err(file, lineOfPath(loaded.doc, ['topics', i]), `tema duplicado: ${tp.id}`);
    topicIds.add(tp.id);
  });
  const bookIds = new Set();
  data.books.forEach((b, i) => {
    if (bookIds.has(b.id)) err(file, lineOfPath(loaded.doc, ['books', i]), `libro duplicado: ${b.id}`);
    bookIds.add(b.id);
    if (!b.verified) warn(file, `libro "${b.short}" marcado como por confirmar`);
  });
  data.meetings.forEach((m, i) => {
    if (m.start >= m.end) err(file, lineOfPath(loaded.doc, ['meetings', i]), `la sesión termina antes de empezar (${m.start}–${m.end})`);
  });
}
const colors = Object.values(courses).map(c => c.color);
if (new Set(colors).size !== colors.length) warn(join(ROOT, 'src/content/courses'), 'dos cursos comparten color');

// --- textos de interfaz ---
const uiFile = join(ROOT, 'src/i18n/ui.json');
const ui = JSON.parse(readFileSync(uiFile, 'utf8'));
for (const [k, v] of Object.entries(ui)) {
  if (!v || typeof v.en !== 'string' || !v.en.trim()) err(uiFile, undefined, `"${k}" sin texto en inglés`);
  if (!v || typeof v.es !== 'string' || !v.es.trim()) err(uiFile, undefined, `"${k}" sin texto en español`);
}
// claves usadas en el código que no existen
const used = new Set();
for (const file of walk(join(ROOT, 'src'), ['.astro', '.js', '.ts'])) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/\bk="([a-zA-Z0-9_.-]+)"/g)) used.add([m[1], file]);
  for (const m of text.matchAll(/\bt\('([a-zA-Z0-9_.-]+)'/g)) used.add([m[1], file]);
}
for (const [k, file] of used) if (!ui[k]) err(file, undefined, `clave de ui.json inexistente: ${k}`);

// --- resultado ---
console.log(`terms: ${Object.keys(terms).length}  courses: ${Object.keys(courses).length}  ui keys: ${Object.keys(ui).length}`);
for (const w of warnings) console.log(`⚠ ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✖ ${e}`);
  console.error(`\n${errors.length} error(es)`);
  process.exit(1);
}
console.log('✓ contenido válido');
