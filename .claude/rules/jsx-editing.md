---
name: JSX/JS editing rules
description: Cómo editar archivos .jsx/.js en el dashboard sin romperlos
---

# Editar archivos JSX/JS en ESCALA

## NO HACER

- **Nunca** usar scripts Python (regex, AST, manipulación de strings) para editar archivos `.jsx` o `.js`. Históricamente introducen syntax errors imposibles de detectar a simple vista.
- Nunca hacer cambios masivos de un solo paso en archivos grandes.
- Nunca correr tools de auto-format sin confirmar antes con el usuario.

## SÍ HACER

- Editar con la tool `Edit` (string replace) o `Write` cuando el archivo es nuevo.
- Hacer cambios chicos e incrementales.
- Después de cada cambio significativo, verificar mentalmente que:
  - Los tags JSX cierran bien.
  - Los braces `{}` están balanceados.
  - Los imports siguen apuntando a archivos existentes.
- Si rompiste algo: `git checkout -- <archivo>` para revertir y reintentar.

## Cuando un archivo es muy grande

Si vas a tocar uno de estos:

- `dashboard/src/AdsTab.jsx` (~1300 líneas)
- `dashboard/src/App.jsx` (~550 líneas)

Considerá:

- Hacer un commit checkpoint **antes** de empezar (`git add` + `git commit -m "checkpoint: ..."`).
- Si el cambio es estructural (no un fix puntual), lanzá el agente `react-component-extractor` antes de meter más código a un archivo ya gigante.

## Stack del proyecto

- React 19, Vite, **JavaScript puro** (sin TypeScript, ver `rules/no-typescript.md`).
- Componentes en `dashboard/src/components/` (default export, una pieza por archivo).
- Tabs en `dashboard/src/components/tabs/`.
- Sin styled-components ni CSS modules — `App.css` y estilos inline.
