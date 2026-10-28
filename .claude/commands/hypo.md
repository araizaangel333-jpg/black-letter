---
description: Escribe una hipótesis, memo, correo o escenario ético con checklist y respuesta modelo
argument-hint: <curso> <temas> [hypo | memo | email | ethics-scenario]
allowed-tools: Read, Edit, Write, Bash(npm run check)
---

Vas a crear `src/content/exercises/<curso>/<slug>.md`. Argumentos: $ARGUMENTS.

1. Lee `src/schemas/exercise.js`, un ejercicio existente del mismo curso y los briefs y notas del tema: la respuesta modelo cita esos casos y reglas, no otros.
2. Frontmatter: `title` en y es, `course`, `kind` (hypo | memo | email | ethics-scenario | definition), `topics` (ids del curso), `framework` (CREAC | IRAC | BLUF | none), `timeLimit` en minutos, `targetWords`, `difficulty`, `checklist` (6 a 9 puntos: issue, rule, explanation, application, counter, conclusion, citation, format o judgment; cada uno con `label` en y es, `points` y `authority`), `related` (briefs, terms), `status`, `source`, `verified: false`, `updated`.
3. Cuerpo: `## Facts` (hechos inventados, con nombres y cifras nuevas, 150–250 palabras; para memo o email: `## Assignment`), `## Call of the question`, `## Model answer` (300–450 palabras en el framework elegido, palabras propias, con citas a casos de dominio público y secciones del Restatement o UCC; sin texto de libros ni handouts), `## Common mistakes` (3–4 viñetas).
4. Nunca reproduzcas una tarea calificada del curso ni sus hechos; si el usuario quiere practicar la habilidad de una tarea real, inventa un problema paralelo con hechos distintos.
5. Corre `npm run check` y resume en dos líneas qué habilidad entrena y qué casos usa.
