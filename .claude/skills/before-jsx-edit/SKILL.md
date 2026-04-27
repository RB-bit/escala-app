---
name: before-jsx-edit
description: Use BEFORE editing any .jsx or .js file in the ESCALA dashboard. Loads JSX editing rules, recommends commit checkpoints for large files, and warns about known monster files (AdsTab.jsx ~1300 lines, App.jsx ~550 lines). Trigger when about to modify any file under dashboard/src/ that ends in .jsx or .js, especially when changes are non-trivial.
---

# Antes de editar JSX/JS en ESCALA

Estás por modificar un archivo `.jsx` o `.js` del dashboard. Antes de empezar, repasá:

## Reglas críticas

(De `.claude/rules/jsx-editing.md`)

- **Nunca** usar scripts Python ni tools de manipulación AST sobre archivos JSX. Históricamente generan syntax errors.
- Hacer cambios chicos e incrementales.
- Después de cada cambio, verificar que tags y braces cierren bien y que los imports apunten a archivos reales.
- Si rompiste el archivo: `git checkout -- <archivo>` y reintentar.

## Si el archivo es grande

Verificá el tamaño con `wc -l` o equivalente antes de tocar. Si supera 500 líneas:

1. Sugerí al usuario hacer un commit checkpoint **antes** de empezar:
   ```
   git add <archivo> && git commit -m "checkpoint: before <descripción del cambio>"
   ```
2. Si el cambio es **estructural** (no un fix puntual), sugerí lanzar el agente `react-component-extractor` antes de meter más código a un archivo ya monstruo.

## Archivos conocidos (al momento de escribir esto)

| Archivo | Líneas | Notas |
|---|---|---|
| `dashboard/src/AdsTab.jsx` | ~1300 | Tiene los 4 pasos del ad creation flow. Refactor pendiente. |
| `dashboard/src/App.jsx` | ~550 | Shell principal + Coach panel. Moderado. |
| Componentes en `dashboard/src/components/` | <300 | Ok, generalmente bien dimensionados. |

(Si los números cambiaron mucho, actualizá esta tabla.)

## Después de editar

- Si modificaste imports, verificá que apunten a archivos existentes (`import X from './path'`).
- Si tocaste un componente con estado, verificá que `useState` y `useEffect` no rompan el render.
- No corras `npm run build` salvo necesario — el dev server (`npm run dev`) muestra errors al toque.

## Enlaces útiles

- `.claude/rules/jsx-editing.md` — reglas completas
- `.claude/rules/no-typescript.md` — recordá que es JS puro
- `.claude/agents/react-component-extractor.md` — para refactors estructurales
