---
name: SQL migrations
description: Convención de migraciones SQL en dashboard/src/lib/migrations/
---

# Migraciones SQL en ESCALA

## Ubicación

Todas las migraciones viven en `dashboard/src/lib/migrations/`.
El esquema base inicial está en `dashboard/src/lib/schema.sql` (no es una migración numerada).

## Nombrado

- `NNN_descripcion_snake_case.sql` (3 dígitos, padding con ceros).
- Ejemplo: `003_tests_table.sql`.
- El número siguiente se calcula mirando el más alto en el directorio.
- Para crear una migración nueva: `/migration-new <nombre>` (genera el archivo con plantilla).

## Datos sensibles

- Si una migración tiene emails reales, IDs personales, tokens, etc., creá un archivo paralelo `NNN_descripcion.PERSONAL.sql`.
- Los `.PERSONAL.sql` están gitignored (regla `*.PERSONAL.sql` en `.gitignore`).
- La versión "pública" debe usar placeholders como `TU_EMAIL_AQUI`.

## Idempotencia (obligatoria)

Toda migración debe poder correrse 2+ veces sin romper:

- `create table if not exists`
- `create index if not exists`
- `drop trigger if exists ...` antes de `create trigger ...`
- `create or replace function ...`
- `drop policy if exists ...` antes de `create policy ...` (las policies no soportan `if not exists`)

## Cómo se aplican

No hay sistema automatizado. El flow es:

1. Abrir Supabase SQL Editor.
2. Pegar el contenido del archivo.
3. Run.

Cada migración debe arrancar con un comentario explicando esto.

## RLS (Row Level Security)

ESCALA usa RLS en TODAS las tablas con datos de usuarios o brands. Si creás una tabla nueva:

- `alter table <nombre> enable row level security;`
- Mínimo una `create policy` (típicamente para `select`).

## Helpers existentes (definidos en `002_user_roles.sql`)

- `current_user_role(brand_id uuid) returns text` — devuelve `'owner'` / `'editor'` / `'viewer'` / null.
- `is_brand_member(brand_id uuid) returns boolean` — true si el usuario tiene cualquier rol en la brand.
- Trigger `on_auth_user_created` — linkea invitaciones por email cuando un user firma por primera vez.
- Trigger `on_brand_created` — asigna automáticamente al creador como owner.

## Patrones de RLS frecuentes

```sql
-- Per-brand (más común):
alter table <tabla> enable row level security;

drop policy if exists "select for brand members" on <tabla>;
create policy "select for brand members" on <tabla>
  for select using (is_brand_member(brand_id));

drop policy if exists "insert for editors and owners" on <tabla>;
create policy "insert for editors and owners" on <tabla>
  for insert with check (current_user_role(brand_id) in ('owner','editor'));
```

```sql
-- Per-user (sin brand):
alter table <tabla> enable row level security;

drop policy if exists "user owns row" on <tabla>;
create policy "user owns row" on <tabla>
  for all using (auth.uid() = user_id);
```

## IDs

Convención del proyecto: `uuid primary key default gen_random_uuid()`. No usar `serial` ni `bigserial`.
