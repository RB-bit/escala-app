---
description: Imprime el estado de cada feature F-XX del roadmap
---

Mostrame el estado real de cada feature del roadmap.

Pasos:

1. Leé la sección `## 🗺️ Roadmap` de `CLAUDE.md` y extraé todos los `F-XX` con su nombre, fase y estado declarado.

2. Para cada uno, verificá rápido contra el código:
   - **F-XX con ✅:** ¿el código existe? Una verificación liviana — buscá el componente/servicio/tabla principal mencionado. Si no encontrás nada, marcá drift.
   - **F-XX con 🔜:** ¿hay rastros de que se empezó? (commits con el ID, archivos parciales, TODOs).
   - **F-XX con ⏸:** ok, asumí declarado = real.

3. Imprimí una tabla compacta:

```
| Fase | ID   | Nombre                | Declarado | Real     | Notas                      |
|------|------|-----------------------|-----------|----------|----------------------------|
| 01   | F-00 | Dashboard multi-marca | ✅        | ✅       | -                          |
| 01   | F-04 | Tests                 | 🔜        | ⏸ (no)  | doc en roadmap, sin código |
```

Estados posibles en columna "Real":
- ✅ verificado
- 🟡 parcial (algo hay pero incompleto)
- 🔜 empezado (commits o archivos)
- ⏸ no iniciado
- ⚠️ drift (declarado ≠ real)

4. Al final, resumen en 4 líneas:
   - Completados: X
   - En progreso: Y
   - Pendientes: Z
   - Con drift: W

Tono compacto, sin narrativa. Bajo 350 palabras.
