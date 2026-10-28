# Black Letter

Cuaderno de estudio bilingüe (EN/ES) para un LL.M. en SMU Dedman School of Law: cursos, lecturas, briefs de casos, glosario, juegos de práctica y laboratorio de escritura. Sitio estático hecho con Astro, publicado en GitHub Pages. Todo el contenido está en palabras propias; nada de los libros asignados ni de los materiales de clase se reproduce.

## Correr en local

```sh
npm install
npm run dev        # http://localhost:4321
npm run check      # valida el contenido (src/content, src/i18n)
npm run build      # check + build a dist/
npm run preview    # sirve dist/
```

Node 22.23 o superior.

## Estructura

```
src/content/terms/        semestres (fechas, festivos)
src/content/courses/      cursos: horario, libros (solo la cita), temas, evaluación
src/content/...           syllabus, briefs, notes, glossary, quizzes, exercises (se agregan por hitos)
src/schemas/              esquemas compartidos por Astro y por scripts/check.mjs
src/i18n/ui.json          textos de interfaz en inglés y español
src/lib/                  fechas, calendario, i18n, store (localStorage)
src/styles/               tokens.css (sistema visual) y base.css
src/layouts, components, pages
public/map/               mapa interactivo del sistema judicial (versión estática actual)
scripts/check.mjs         validador de contenido
.claude/commands/         comandos de Claude Code (/deploy, ...)
progress/                 exportaciones de progreso (JSON)
```

## Publicar

Cada `git push` a `main` construye y publica el sitio con GitHub Actions (`.github/workflows/deploy.yml`). En Claude Code: `/deploy`.

Dominio propio: comprar el dominio, verificarlo en GitHub (Settings → Pages → Add a domain), apuntar en el DNS de Hostinger `A @` a 185.199.108.153, 185.199.109.153, 185.199.110.153 y 185.199.111.153 y `CNAME www` a `<usuario>.github.io`, poner el dominio en Settings → Pages del repo y activar "Enforce HTTPS".

## Fuentes de datos del mapa

Administrative Office of the U.S. Courts; 28 U.S.C. §§ 41–49 y 81–131; National Center for State Courts; Ballotpedia. Geometría: U.S. Census Bureau (us-atlas 3.0.1; condados 2024 1:500k para los 94 distritos).
