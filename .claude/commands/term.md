---
description: Agrega un término al glosario con glosa en español y falso amigo
argument-hint: <término> [materia: contracts | business-associations | lrw | perspectives | externship | courts | classroom | general]
allowed-tools: Read, Edit, Bash(npm run check)
---

Vas a agregar una entrada a `src/content/glossary/<materia>.yaml` (lista `items`). Argumentos: $ARGUMENTS.

1. Lee `src/schemas/glossary.js` y dos entradas vecinas para copiar el formato. Si la materia no tiene archivo, créalo con `subject:` e `items:`.
2. Campos: `id` (kebab-case), `term`, `pos`, `register` (legal | academic | everyday | phrase), `topic` (id de tema del curso, si aplica), `en.definition` (una frase clara, en palabras propias), `en.usage` (cómo se dice y cómo no), `es.term`, `es.explanation` (en español jurídico mexicano, con el término inglés en cursiva la primera vez), `es.falseFriend` (si existe, con el artículo del código mexicano para que se pueda verificar), `examples` (una frase en inglés y su versión en español), `authority` (sección del Restatement, del UCC o caso), `related` (ids existentes), `difficulty` (1–3), `verified: false`.
3. Nunca copies definiciones de diccionarios jurídicos, del libro ni de Westlaw; escribe la tuya.
4. Corre `npm run check` y muestra la entrada final.
