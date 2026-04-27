---
name: Commit style
description: Convención de commits en ESCALA — conventional commits con scope opcional F-XX
---

# Estilo de commits

## Formato

```
<tipo>(<scope opcional>): <descripción en presente, sin punto final>
```

## Tipos

- `feat:` — nueva funcionalidad.
- `fix:` — corrección de bug.
- `docs:` — solo documentación (CLAUDE.md, README, comentarios).
- `chore:` — config, deps, gitignore, scripts, tooling.
- `refactor:` — cambio de código sin cambio funcional.

## Scope (opcional pero recomendado)

- ID de feature del roadmap: `feat(F-04): ...`.
- O área del código: `feat(AdsTab): ...`, `fix(auth): ...`, `feat(meta): ...`.

## Ejemplos del repo (referencia, no copiar)

```
feat: implement authentication system with magic links and user roles management
fix: align TN revenue with ART timezone and paid-only filter
docs: add Tests system spec to roadmap and update F-04 in CLAUDE.md
chore: expand .gitignore to cover node_modules, build output and local tooling
fix(AdsTab): LaunchStep crash on render — null guard
feat(AdsTab): add source selector for Meta, Facebook and Instagram organic media
```

## Reglas

- Mensaje en **inglés** (consistente con el repo).
- Descripción en presente: "add X" no "added X" ni "adds X".
- Sin punto final en la línea principal.
- Bajo 70 caracteres en la línea principal.
- Si toca varias áreas, usar el alcance más amplio o sin scope.
- Cuerpo del commit (después de línea en blanco) opcional, en español o inglés según convenga al detalle.

## Anti-patrones

- ❌ `update App.jsx` (no dice qué hace).
- ❌ `wip` / `temp` / `asdf` (en main, nunca).
- ❌ `feat: added new feature.` (pasado + punto final).
- ❌ Commits gigantes que mezclan feat + fix + docs sin estructura.

## Co-authored

Los commits hechos con Claude Code llevan trailer:

```
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

Esto se agrega automáticamente cuando el commit lo hace el agente.
