---
description: Escribe o actualiza el brief de un caso en palabras propias
argument-hint: <caso> [curso] [--skim] [--update]
allowed-tools: Read, Edit, Write, Bash(npm run check), WebFetch, WebSearch
---

Vas a escribir o actualizar `src/content/briefs/<curso>/<slug>.md`. Argumentos: $ARGUMENTS.

Método (el que enseña la app):
1. Pregunta primero: ¿por qué está este caso en el syllabus (`whyHere`)? Pide al usuario sus notas de margen o lo que recuerda (hechos, holding, lo que dijo el profesor). Si no las tiene, busca la **opinión pública** (CourtListener, Justia, Google Scholar, BAILII) y guarda la `url`. Nunca pidas ni uses el extracto del casebook ni sus Notes.
2. Lee `src/schemas/brief.js` y un brief vecino del mismo curso para seguir el formato. Campos: title, citation, court, year, course, topic, tags, depth, hook (≤ 14 palabras, imagen memorable, sin conclusión jurídica), posture, whyHere, oneLiner (en inglés ≤ 30 palabras, orientado a la regla, sin nombres de partes; y en español), rule, book (id del libro y páginas), url, relation (extends | limits | contrasts | applies | overrules | companion), questions (2–3 "what if" probables), terms (ids del glosario existentes o nuevos), status, source, verified: false, updated.
3. Con `--skim`: solo frontmatter (`depth: skim`), sin cuerpo. Sin `--skim`: cuerpo con los H2 obligatorios en este orden: Facts, Procedural posture, Issue, Holding, Reasoning, Rule (own words); opcionales: Dissent or concurrence, What-ifs, Class notes. 150–250 palabras, en palabras propias; solo hechos que el tribunal usa; incluye el argumento perdedor en Reasoning.
4. Con `--update` (ajuste de tres minutos después de clase): reescribe Holding y Rule con el encuadre del profesor, agrega `## Class notes` con lo dicho en clase (síntesis, nunca transcripción) y pon `status: reviewed`.
5. Si el caso introduce términos nuevos, agrégalos al glosario con `/term` o directamente en `src/content/glossary/<materia>.yaml`.
6. Corre `npm run check` y resume en dos líneas: el one-liner y qué quedó por verificar (pincites, hechos).
