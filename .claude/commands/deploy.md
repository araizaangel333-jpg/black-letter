---
description: Valida, construye, hace commit y publica el sitio en GitHub Pages
allowed-tools: Bash(npm run check), Bash(npm run build), Bash(git status*), Bash(git diff*), Bash(git add *), Bash(git commit *), Bash(git push*), Bash(gh run *)
---

Publica el estado actual del repo.

1. Corre `npm run check` y luego `npm run build`. Si algo falla, detente y explica el error en lenguaje llano (qué archivo, qué línea, cómo arreglarlo). No publiques con errores.
2. Muestra `git status --short` y resume en dos o tres líneas qué cambió (contenido nuevo, páginas, datos).
3. Haz `git add -A` y un commit con un mensaje corto en inglés que describa el cambio (por ejemplo `Add Contracts glossary and three briefs`). Si no hay cambios, dilo y termina.
4. `git push` y luego `gh run watch --exit-status` para seguir el deploy hasta que termine.
5. Imprime la URL pública del sitio y, si el deploy falló, el enlace al run y el error resumido.
