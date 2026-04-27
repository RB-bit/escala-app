---
name: secrets-guard
description: Use BEFORE running git add or git commit in ESCALA. Scans staged content for accidentally exposed Meta/Tienda Nube/Supabase tokens, JWTs, personal emails, and forbidden files. Trigger when about to commit, push, or share staged files publicly.
---

# Guardia de secretos

Estás por commitear o pushear. Antes, scaneá los archivos staged en busca de secretos.

## Pasos

1. Corré `git diff --cached --stat` para ver qué archivos están staged.

2. Corré `git diff --cached` para ver el contenido.

3. Buscá los siguientes patrones (ver `.claude/rules/secrets.md` para detalle):

### Tokens y credenciales (rojo si tienen valor real)

- `META_ACCESS_TOKEN=`
- `META_APP_SECRET=`
- `META_AD_ACCOUNT_ID=act_<número>`
- `TIENDANUBE_ACCESS_TOKEN=`
- `TIENDANUBE_CLIENT_SECRET=`
- `SUPABASE_SERVICE_ROLE_KEY=`
- Strings tipo JWT: `eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+`
- `Bearer ` + string largo
- Strings random largos (>40 chars) en archivos `.env`, `.json`, config

### Datos personales

- Emails reales (excepto en `*.example`, comentarios docs, o si el usuario los aprobó explícitamente).
- Teléfonos argentinos (`+54...`, `9 11 ...`).
- UUIDs reales de `auth.users.id` en archivos no-PERSONAL.

### Archivos prohibidos (BLOQUEAR commit si están staged)

- `shared/auth/.env`
- `dashboard/.env.local`
- Cualquier `*.PERSONAL.sql`
- `.claude/settings.local.json`
- `CLAUDE.local.md`

## Si encontrás algo sospechoso

1. Listá: archivo + línea + qué patrón matchea + nivel (rojo / amarillo).
2. NO commitees automáticamente.
3. Ofrecé al usuario:
   - Mover el valor a `.env` y commitear `.env.example` con placeholder.
   - Agregar el archivo al `.gitignore` si falta.
   - `git restore --staged <archivo>` para sacarlo del stage.
4. Si es **rojo** (token real), insistí — no es un commit válido tal como está.

## Si está limpio

Avisá: "scan limpio, podés commitear". Listá brevemente qué archivos se chequearon (paths).

## Excepciones permitidas

- Strings largos en `package-lock.json` (hashes de paquetes, ok).
- Strings largos en `*.example` (placeholders, ok).
- Comentarios que mencionan dónde van los tokens (ok mientras no contengan el valor).
- Strings random en `dashboard/dist/` o `node_modules/` (no deberían estar staged, pero si lo están, prioridad es sacarlos del stage).

## Si ya filtraste algo

Ver sección "Si filtraste algo accidentalmente" en `.claude/rules/secrets.md`. La regla básica: **rotar el token AHORA**, después purgar historial.
