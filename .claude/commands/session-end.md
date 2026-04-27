---
description: Cierra la sesión agregando entrada al "Log de sesiones" en CLAUDE.md
---

Vamos a cerrar la sesión y dejar registro en `CLAUDE.md`.

Pasos:
1. Identificá los commits HECHOS EN ESTA SESIÓN. Para esto, corré `git log --oneline -10` y preguntame cuál fue el primer commit de la sesión (o asumí que son los commits del día de hoy, según mi timezone — Argentina/ART).
2. Corré `git status --short` y `git diff --stat` por si hay trabajo sin commitear.
3. Resumí lo hecho en 3–6 bullets concisos. Cada bullet = una unidad de trabajo (no un commit). Combiná commits relacionados.
4. Abrí `CLAUDE.md` y buscá la sección `## 📝 Log de sesiones`.
5. Mirá la última entrada (`### Sesión N — DD/MM/AAAA`) y calculá el siguiente número.
6. Agregá al final del log una entrada nueva con este formato exacto:

```
### Sesión N — DD/MM/2026
- bullet 1
- bullet 2
- bullet 3
```

Donde la fecha es la de hoy (usá la del system reminder `# currentDate`).

7. Si hay trabajo SIN commitear, agregá un sub-bullet al final que diga: `- Pendiente al cierre: <descripción de lo que quedó sin commitear>`.
8. Mostrame el diff de `CLAUDE.md` antes de guardar y pedí confirmación.

Importante:
- NO commitees ni pushees. Yo lo hago a mano.
- Si la última sesión del log es del mismo día de hoy, NO crees una nueva — actualizá la existente sumando los nuevos bullets.
