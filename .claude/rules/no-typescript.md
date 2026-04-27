---
name: No TypeScript
description: ESCALA es JavaScript puro, no migrar a TypeScript en cambios incidentales
---

# JS puro, no TypeScript

## Estado actual

ESCALA es JavaScript puro. Cero archivos `.ts` o `.tsx`. Sin `tsconfig.json`, sin dependencias `@types/*`, sin PropTypes.

## NO hacer

- No proponer migración a TypeScript en refactors grandes.
- No agregar archivos `.tsx` aunque sea "solo este componente".
- No agregar `tsconfig.json`, `@types/react`, `@types/node`, etc.
- No agregar PropTypes (no se usan tampoco).
- No introducir JSDoc con anotaciones tipo TS (`@param {string} ...`) salvo que el usuario lo pida explícitamente para una función crítica.

## SÍ hacer

- Mantener `.jsx` para componentes, `.js` para servicios y utilidades.
- Validaciones runtime cuando hagan falta (manual, sin libs).
- Si una función es muy compleja y un comentario tipo "Recibe `{ id: uuid, brand_id: uuid }`" ayuda, agregalo en lenguaje natural en un comment, no como tipo formal.

## Excepción

Si en el futuro se decide migrar a TypeScript, va a ser una decisión explícita del owner del repo, en una rama dedicada, no como side-effect de otro feature.

## Por qué

El proyecto todavía está en una fase donde la velocidad importa más que la rigidez. Migrar a TS implica:

- Tocar todos los archivos.
- Configurar build, linting, IDE.
- Aprender qué tipos usar para Supabase, React 19, etc.

Eso es un proyecto en sí mismo. No se hace de costado.
