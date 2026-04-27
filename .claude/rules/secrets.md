---
name: Secrets management
description: Qué archivos no commitear, qué patrones evitar, dónde van los tokens
---

# Manejo de secretos en ESCALA

## Archivos NUNCA commiteados (en `.gitignore`)

- `shared/auth/.env` — credenciales globales (Meta, Tienda Nube, etc.)
- `dashboard/.env.local` — variables Vite (`VITE_TN_TOKEN`, `VITE_SUPABASE_*`)
- `*.PERSONAL.sql` — migraciones con datos personales
- `.claude/settings.local.json` — permisos personales de cada dev
- `CLAUDE.local.md` — notas personales

## Patrones a buscar antes de cualquier `git add`

Si encontrás cualquiera de estos en un archivo que vas a commitear, **rojo**:

- `META_ACCESS_TOKEN=` con un valor real (no la línea de `.env.example`).
- `META_APP_SECRET=`
- `META_AD_ACCOUNT_ID=act_` con número.
- `TIENDANUBE_ACCESS_TOKEN=`
- `TIENDANUBE_CLIENT_SECRET=`
- `SUPABASE_SERVICE_ROLE_KEY=`
- `SUPABASE_ANON_KEY=` con valor (la anon key es pública técnicamente, pero igual mejor en `.env`).
- Strings largos (>40 chars) que parezcan JWT (`eyJ...`).
- `Bearer ` + string largo.
- Strings que matcheen `[a-zA-Z0-9_-]{32,}` en archivos `.env`, `.json` o config.
- Emails personales reales (`genaro.bossi1@gmail.com`, etc.) — usar placeholder.
- IDs de usuarios reales de Supabase (UUID en formato `xxx-xxx-xxx`).

## Dónde van los tokens

- En código React: `import.meta.env.VITE_*` (Vite los inyecta en build).
- En MCPs/scripts Node: `process.env.*`.
- Nunca hardcodear en el código fuente, nunca poner en defaults.

## Archivos `.example`

Si un archivo nuevo necesita variables de entorno, creá un `.env.example` paralelo (commiteado) con los nombres y valores placeholder. Eso documenta sin filtrar.

## Rotación

Tokens de Meta caducan a los **60 días**. Cuando algo deja de funcionar, primero verificar si el token está vencido.

## Si filtraste algo accidentalmente

1. **NO** confíes en `git rm` solo — el commit con el secret va a quedar en el historial.
2. Rotar el token/credencial AHORA (antes de cualquier otra cosa).
3. Después: `git filter-repo` o equivalente para purgar el historial, y force push (con autorización).
