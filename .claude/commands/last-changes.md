---
description: Resumen ejecutivo de cambios desde el último commit
---

Resumí los cambios actuales del repo en formato ejecutivo.

Pasos:
1. Corré `git status --short` para ver archivos modificados/agregados/borrados.
2. Corré `git diff --stat` para ver magnitud.
3. Si hay archivos modificados, corré `git diff` (limitado por archivo si es muy largo) para entender el contenido.
4. Si NO hay cambios sin commitear, mostrá los últimos 3 commits con `git log --oneline -3` y un resumen de qué se hizo.

Devolvé:
- **Resumen:** 1–2 oraciones de qué pasó en general.
- **Por archivo:** lista compacta — `path:` + qué cambió en una línea.
- **Riesgos detectados:** secrets expuestos, `console.log` olvidados, archivos `.PERSONAL.sql` modificados, dependencias agregadas, breaking changes en RLS, etc. Si no hay riesgos, decilo en una línea.

Tono directo, sin emojis, español argentino. Bajo 250 palabras.
