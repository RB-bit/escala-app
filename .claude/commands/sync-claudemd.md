---
description: Detecta drift entre CLAUDE.md y el código real, propone update
---

Auditá `CLAUDE.md` contra el estado REAL del repo y propuestá updates concretos. NO modifiques nada todavía.

Pasos:

1. Leé `CLAUDE.md` completo.

2. Verificá cada bloque contra la realidad observable:

   **Roadmap (sección "🗺️ Roadmap"):**
   Para cada `F-XX`:
   - Si dice ✅: ¿realmente está implementado en código? Buscá archivos, componentes, tablas, servicios mencionados.
   - Si dice 🔜: ¿hay rastros de que ya se empezó (commits, archivos parciales)?
   - Si dice ⏸: probablemente ok, no auditar.

   **Estado actual (sección "📍 Estado actual"):**
   - "✅ Completado" — verificá cada bullet contra el código.
   - "Próxima sesión" — comparalo con commits posteriores al último log de sesión.

   **Tablas Supabase (sección "Arquitectura" y otros):**
   Listá las tablas mencionadas y verificá cuáles existen en:
   - `dashboard/src/lib/schema.sql`
   - `dashboard/src/lib/migrations/*.sql`

   **Componentes y servicios mencionados:**
   - Verificá que los paths/archivos referenciados existan
   - Si hay refs a `App.jsx` con cifras de líneas, recontá

   **Setup técnico:**
   - Rutas (Mac vs Windows): probablemente desactualizadas, OK
   - Versión Node: verificá contra `package.json` engines o asumí que sigue lo que dice
   - Variables de entorno: verificá que los nombres en `.env.example` (si existe) o `.env`/`.env.local` matcheen

3. Devolvé el reporte así:

```
## Drift detectado

### Críticos (afectan decisiones de trabajo)
- [línea X de CLAUDE.md] dice "<cita>" → realidad: <observación>
- ...

### Menores (cosméticos / rutas / versiones)
- ...

## Updates propuestos

Para cada drift crítico, mostrá un diff propuesto en formato:

\`\`\`diff
- línea vieja
+ línea nueva
\`\`\`
```

4. Al final, preguntame: "¿Aplico estos cambios? (todos / solo críticos / ninguno / dame opciones)".

Bajo 700 palabras. Tono directo.
