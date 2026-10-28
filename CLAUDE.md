# Black Letter — reglas del proyecto

Sitio estático bilingüe (EN/ES) de estudio para un LL.M. en SMU Dedman School of Law. Lo mantiene un abogado, no un desarrollador, a través de Claude Code. Explica los cambios en lenguaje llano, prefiere editar contenido a editar código y pregunta antes de agregar una dependencia.

## Forma de trabajar (principios del dueño del repo)

- **Pensar antes de codificar.** Declara supuestos; si hay varias interpretaciones, preséntalas; si existe algo más simple, dilo.
- **Simplicidad primero.** El mínimo código que resuelve el problema. Nada especulativo, sin abstracciones para un solo uso.
- **Cambios quirúrgicos.** Toca solo lo necesario; no "mejores" código vecino; respeta el estilo existente.
- **Metas verificables.** Cada tarea termina con una comprobación concreta (comando, captura, prueba).

## Comandos

- `npm run dev` → http://localhost:4321 (vista previa en vivo)
- `npm run check` → valida todo el contenido (corre **siempre** después de tocar `src/content/**` o `src/i18n/ui.json`)
- `npm run build` → check + build a `dist/`
- `npm run preview` → sirve `dist/`
- `/deploy` → check, build, commit, push y seguimiento del deploy en GitHub Pages

Node ≥ 22.23 (Astro 7). Nunca edites `dist/`, `.astro/` ni `public/map/data/states-10m.json`.

## Mapa del repo

| Qué | Dónde | Comando |
|---|---|---|
| Semestres (fechas, festivos) | `src/content/terms/*.yaml` | a mano |
| Cursos (horario, libros como cita, temas) | `src/content/courses/*.yaml` | a mano |
| Lecturas y entregas por semana | `src/content/syllabus/<curso>.yaml` | `/week` |
| Briefs de casos | `src/content/briefs/<curso>/<slug>.md` | `/brief` |
| Outlines y checklists | `src/content/notes/<curso>/<slug>.md` | `/note` |
| Glosario | `src/content/glossary/<slug>.md` | `/term` |
| Quizzes | `src/content/quizzes/<curso>/<slug>.yaml` | `/quiz` |
| Hipótesis, memos, escenarios | `src/content/exercises/<curso>/<slug>.md` | `/hypo` |
| Textos de interfaz | `src/i18n/ui.json` | a mano (siempre `en` y `es`) |
| Esquemas (compartidos con el validador) | `src/schemas/*.js` | a mano |
| Mapa judicial (versión actual, estática) | `public/map/` | no tocar salvo datos |
| Quizzes (mcq, cloze, short, citation) | `src/content/quizzes/<curso>.yaml` | `/quiz` |
| Juegos (motor, match, ronda, cold call) | `src/islands/games/*`, `src/pages/games/*` | — |
| Estado en el navegador | solo `src/lib/store.js` | — |
| PWA (manifest, service worker) | `public/manifest.webmanifest`, `public/sw.js` | sube `VERSION` en `sw.js` al cambiar la estrategia de caché |

## Copyright y contenido (obligatorio)

1. **Palabras propias por defecto.** Notas, outlines, definiciones, briefs, preguntas y explicadores se escriben en palabras propias. No es *fair use*; es paráfrasis.
2. **Las opiniones judiciales son dominio público.** Usa solo el texto público (CourtListener, Caselaw Access Project, Justia, Google Scholar, BAILII) y guarda la `url`. Nunca el extracto editado del casebook, sus "Notes and Questions", ni headnotes o sumarios de West/Lexis. Citas de opiniones: la frase clave, con pincite comprobado contra el texto público. **Jamás inventes un pincite.**
3. **Restatement (ALI) y UCC (ALI/ULC) tienen copyright.** Parafrasea y cita la sección ("R2d § 90", "UCC § 2-205"). Si es inevitable, ≤ 1–2 frases de texto *black-letter* con atribución; nunca comentarios ni ilustraciones.
4. **Casebooks y libros de texto:** cítalos por edición y capítulo/páginas. Sin escaneos, fotos, problemas, hipótesis, gráficos ni resúmenes que sigan la estructura del libro frase por frase. Las hipótesis se inventan.
5. **Materiales de profesores** (handouts, slides, correos, frases de clase, tips, respuestas modelo) **nunca se publican**; se referencian por título y fecha. Las capturas de clase son síntesis, no transcripción. Libros escritos por profesores del curso (p. ej. *Inside Counsel*): **cero citas**.
6. **Bluebook:** los formatos de cita son hechos; el texto de las reglas no. Los drills nombran la regla (10.2.1, B10.1, T6) y muestran ejemplos de citas.
7. **NCBE:** sus preguntas tienen copyright; todas las preguntas son originales "en el estilo".
8. **Traducir texto con copyright sigue siendo copiar.** Las glosas en español son definiciones propias, con el artículo del código mexicano cuando aplique.
9. **Ninguna cita > 25 palabras** de una fuente con copyright.
10. **Privacidad:** sin nombres de compañeros, calificaciones, correos ni detalles del empleador del externship. Profesores solo como metadatos (nombre y título).
11. **Si una petición exige copiar** (p. ej. "pon el cuadro del libro"), rehúsa y ofrece una alternativa en palabras propias.
12. Todo ítem generado lleva `source` y `verified: false` hasta que el dueño lo revise y lo cambie a `true`.

**Nunca pegues páginas de libros ni handouts en una sesión.** La entrada son las notas y capturas del dueño, opiniones públicas y outlines públicos.

## Bilingüe

- `ui.json`: toda clave con `en` y `es`. Contenido: `en` obligatorio, `es` opcional (glosas, aclaraciones, falsos amigos).
- Español jurídico mexicano, con el término inglés en cursiva la primera vez: "contraprestación (*consideration*)". Nunca traduzcas nombres de casos ni títulos de leyes.
- Fechas ISO entre comillas (`"2026-11-05"`), horas de 24 h entre comillas (`"08:15"`).

## Ids y archivos

- kebab-case. Prefijo de curso en syllabus, quizzes y tarjetas (`contracts-w10-02`). Brief: `<parte>-v-<parte>`. Una entrada por archivo salvo syllabus, quizzes y decks.
- YAML: entrecomilla cadenas con `: ` o `#`; usa `|` para párrafos.
- H2 obligatorios en briefs completos: Facts, Procedural posture, Issue, Holding, Reasoning, Rule (own words).

## Case law (método que la app enseña)

Un caso no es la regla: es la evidencia de la regla y el vehículo de la discusión. Primero: ¿por qué está aquí este caso? (`whyHere`). Tres pasadas: orientar (3 min), leer por estructura (10–15), escribir en palabras propias (5–10, 150–250 palabras). `oneLiner` ≤ 25 palabras sin nombres de partes; `hook` ≤ 12 palabras, imagen memorable sin conclusión jurídica. Triaje por tarea de ~3 casos: 1 completo, 1 skim, 1 solo-notas. Nunca entrar a clase en cero.

## Diseño y mobile-first (obligatorio)

- El celular es el dispositivo principal: 360–390 px, un pulgar, barra inferior, objetivos táctiles ≥ 44 px, acciones principales en el tercio inferior. Escritorio = la misma columna a 720 px.
- Revisa cada cambio de UI primero a 390×844 (Playwright MCP) y luego en escritorio. Sin scroll horizontal. Ambos temas (claro/oscuro).
- Sistema visual en `src/styles/tokens.css` y `base.css`: un solo acento (oxblood), papel frío, tinta, Bricolage Grotesque (UI) + Source Serif 4 (lectura). La "B" blackletter es el único elemento vistoso; todo lo demás, quieto.
- Prohibido el look genérico: crema + serif + terracota, negro con verde ácido, gradientes decorativos, todo centrado, `rounded-lg` en todo, barras de acento en cada tarjeta, etiquetas en mayúsculas sobre cada título, emojis como iconos, numeración decorativa, flechas "→" en enlaces.
- Presupuesto: ≤ 60 KB gz de JS por página (mapa ≤ 120 KB). Sin claves de API, analítica ni scripts de terceros. `localStorage` solo vía `src/lib/store.js`.

## Rutina por cambio

Leer entradas vecinas → escribir → `npm run check` → `npm run dev` y decir qué URL mirar → commit en inglés → push solo con `/deploy` o cuando se pida.
