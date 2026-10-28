---
description: Escribe un set de preguntas de examen para un tema, con explicaciones
argument-hint: <curso> <tema> [n] [tipos: mcq cloze short citation]
allowed-tools: Read, Edit, Write, Bash(npm run check)
---

Vas a agregar un set a `src/content/quizzes/<curso>.yaml` (lista `items`). Argumentos: $ARGUMENTS.

1. Lee `src/schemas/quiz.js`, un set existente del mismo archivo y, sobre todo, las notas y briefs del tema (`src/content/notes/<curso>/`, `src/content/briefs/<curso>/`): las preguntas salen de las reglas y casos que ya están en el sitio, no de memoria suelta.
2. Set: `id` (`<curso>-<tema>-NN`), `topic` (id del curso), `title` en y es, `difficulty` 1–3, `questions` (por defecto 8: 5 mcq, 2 cloze, 1 short; `citation` solo para LRW).
3. Preguntas **originales**, con hechos inventados (nombres y cifras nuevas); nunca copies preguntas liberadas del NCBE, del libro ni de los handouts del profesor. Cada mcq tiene exactamente una opción correcta, 3 o 4 distractores verosímiles (el error típico del alumno), `why` en cada distractor y `explanation` en inglés y español con la autoridad (R.2d, UCC, caso). Cloze: `{{respuesta|alternativa}}`. Short: `answer` modelo y `keyPoints`. Citation: `answer` exacta, `accept` con variantes válidas y `rule` del Bluebook.
4. Mezcla temas vecinos en al menos una pregunta (intercalado) y cubre lo que el profesor marcó como examinable; si marcó algo como "no entra al examen", no lo preguntes.
5. Corre `npm run check` y resume en dos líneas qué cubre el set y qué autoridad usa.
