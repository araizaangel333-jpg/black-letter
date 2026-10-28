---
description: Carga las lecturas y entregas de una semana de un curso en el syllabus
argument-hint: <curso> [semana] (pega después el reading assignment o el "Week N" de Canvas, resumido)
allowed-tools: Read, Edit, Write, Bash(npm run check), Bash(npm run dev*)
---

Vas a agregar lecturas, entregas, sesiones de repaso o exámenes al archivo `src/content/syllabus/<curso>.yaml` (cursos: contracts, business-associations, lrw, perspectives, externship). Argumentos: $ARGUMENTS.

Reglas:
1. Si el usuario no pegó el material, pídele que pegue el reading assignment, el "Week N Readings and Assignments" de Canvas o sus notas, **en resumen: títulos, páginas, secciones (R.2d, UCC), nombres de casos y fechas**. Nunca pidas ni conserves el texto íntegro de handouts; en `source` anota solo el título y la fecha del documento ("ASS#11, correo del 4 nov").
2. Lee primero `src/content/courses/<curso>.yaml` (horario, ids de libros y de temas) y las últimas entradas del syllabus para seguir el mismo estilo. Las fechas de clase salen de `meetings`; si una fecha no cae en día de clase, pregunta.
3. Crea un ítem por sesión o entrega con: `id` (prefijo del curso, fecha y tipo, por ejemplo `contracts-nov03-reading`), `type` (reading | assignment | exam | class | review | event), `date` entre comillas, `due` y `dueTime` si aplica, `title` en inglés y español, `topic` (uno de los ids de `topics` del curso), `pages` con `book` (id del libro) y `pages` o `sections`, `briefs` con los ids de los casos (`<curso>/<parte>-v-<parte>`), `tasks` si hay trabajo adicional, `source`.
4. Para cada caso nombrado que no tenga brief, crea un **stub** en `src/content/briefs/<curso>/<slug>.md` con `depth: skim`, `status: stub`, `verified: false`, los campos obligatorios (hook, posture, whyHere, oneLiner, rule, citation, court, year) en palabras propias desde lo que sepas de la opinión pública, y `url` a CourtListener o Justia. Marca como caso ancla (en `whyHere`) el primero de cada sección o el que fije una regla nueva.
5. Corre `npm run check`. Si falla, corrige y vuelve a correr.
6. Termina con un resumen de tres líneas: qué sesiones se agregaron, qué briefs quedaron en stub y qué falta confirmar (fechas, páginas).
