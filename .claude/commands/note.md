---
description: Crea o amplía un outline o una checklist de elementos de un tema
argument-hint: <curso> <tema> [outline | checklist | rule | class-notes]
allowed-tools: Read, Edit, Write, Bash(npm run check)
---

Vas a crear o ampliar `src/content/notes/<curso>/<slug>.md`. Argumentos: $ARGUMENTS.

1. Lee `src/schemas/note.js`, el archivo del curso (ids de `topics` y de `books`) y los briefs del tema (`src/content/briefs/<curso>/`), que son la fuente de las reglas.
2. Frontmatter: `title` (en y es), `course`, `topic`, `kind`, `summary`, `sources` (libro y páginas, o cita), `elements` (obligatorio en `checklist`: id, label en y es, test, authority, pitfall), `related` (briefs, terms, notes), `status`, `verified: false`, `updated`.
3. Cuerpo en palabras propias, pensado para el examen: regla general, elementos o factores, el caso que ilustra cada uno, la trampa típica y cómo escribirlo en un ensayo (CREAC). Sin texto del libro, sin handouts.
4. Si es `class-notes`, parte de las capturas del usuario (pídelas) y conviértelas en síntesis; nunca transcripción.
5. Corre `npm run check` y resume qué elementos quedaron y qué autoridad falta.
