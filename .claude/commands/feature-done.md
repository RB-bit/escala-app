---
description: Marca un feature F-XX como completado en CLAUDE.md y ROADMAP.html
argument-hint: F-XX (ej F-04)
---

Marcar el feature `$ARGUMENTS` como completado.

Pasos:

1. **Validar argumento.** `$ARGUMENTS` debe matchear el patrón `F-\d{2}` (ej: `F-04`). Si no, error y mostrame los IDs disponibles tomados del roadmap en `CLAUDE.md`.

2. **Leer estado actual.** Buscá la línea de `$ARGUMENTS` en `CLAUDE.md` (sección `## 🗺️ Roadmap`).
   - Si ya está ✅: avisame "ya estaba completado" y no hagas nada.
   - Si está 🔜 o ⏸: continuá.

3. **Sanity check.** Antes de marcarlo done, verificá rápido que haya código real para ese feature (un archivo, componente, migración, lo que tenga sentido). Si no encontrás NADA del feature, avisame con: "no encuentro código asociado a `$ARGUMENTS` — ¿estás seguro que está hecho?" y pedí confirmación.

4. **Update CLAUDE.md.** Cambiá el emoji 🔜 (o ⏸) por ✅ en la línea del feature. Mostrame el diff.

5. **Update ROADMAP.html.** Abrí `ROADMAP.html`, buscá la `<div class="feature-card">` que matchee el nombre del feature (extraído del CLAUDE.md). Como las cards no tienen IDs, hacé match por el texto del `<div class="feature-name">`.
   - Si la card tiene una clase como `pending`, `wip`, `next`, cambialá por `done`.
   - Si no tiene clase de estado, agregá `class="feature-card done"` y comentá en el output que tendría que agregarse CSS para `.feature-card.done` (no lo agregues vos, solo avisá).

6. **Mostrar diffs y confirmar.** Mostrame ambos diffs (CLAUDE.md y ROADMAP.html) y esperá mi OK antes de guardar.

7. **No commitees.** El commit lo hago yo después.

Si encontrás múltiples cards en ROADMAP.html que podrían matchear, listalas y pedí cuál.
