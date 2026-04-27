---
description: Arranca sesión leyendo CLAUDE.md, mirando git log y proponiendo siguiente paso
---

Vamos a arrancar una sesión nueva en ESCALA. Tu trabajo es darme un briefing y proponer el siguiente paso, sin tocar código.

Pasos:
1. Leé `CLAUDE.md` completo, especialmente:
   - "📍 Estado actual" — qué dice que está hecho
   - "Próxima sesión" — qué quedaba pendiente
   - "📝 Log de sesiones" — la última entrada (para saber dónde quedamos)
2. Leé `CLAUDE.local.md` (mi setup personal Windows).
3. Corré `git log --oneline -15` y `git status --short`.
4. Verificá si hay drift entre lo que dice "Estado actual" y los commits recientes (puede haber commits posteriores al último log de sesión que ya cambiaron el estado).

Devolvé en este formato:

**Donde estamos:** 1–2 oraciones del estado REAL (no el declarado).

**Trabajo en progreso:** si `git status` muestra archivos sin commitear, listalos. Si no, "limpio".

**Drift vs CLAUDE.md:** una línea — "sin drift" o "el log de sesión #N quedó desactualizado, hay X commits posteriores".

**Siguiente paso recomendado:** UN paso concreto y accionable basado en lo pendiente real.

**Alternativas:** 1–2 opciones por si tengo otra prioridad.

NO empieces a tocar código. Esperá mi confirmación de cuál seguimos.
