---
name: migration-rls-check
description: Use AFTER creating or editing a SQL migration in dashboard/src/lib/migrations/. Verifies that every new table has Row Level Security enabled and at least one policy. ESCALA requires RLS on all tables with user/brand data — missing it would cause data leaks between brands.
---

# Check de RLS en migraciones

Acabás de crear o modificar una migración SQL. Verificá que cumpla las reglas de RLS de ESCALA.

## Pasos

1. **Identificá el archivo** que se editó: el último o último archivo modificado en `dashboard/src/lib/migrations/`.

2. **Listá las tablas creadas:**
   - Buscá patrones `create table <nombre>` y `create table if not exists <nombre>`.
   - Anotá cada nombre de tabla.

3. **Por cada tabla creada, verificá que el archivo también contenga:**
   - `alter table <nombre> enable row level security;`
   - Al menos una `create policy ... on <nombre>` (cualquier acción: select / insert / update / delete / all).

4. **Si la tabla tiene una columna `brand_id` o `user_id`, las políticas deberían usar:**
   - `is_brand_member(brand_id)` para chequear membership.
   - `current_user_role(brand_id) in ('owner', 'editor', ...)` para chequear rol específico.
   - `auth.uid() = user_id` para acceso por owner directo.

   Estas funciones están definidas en `002_user_roles.sql` (no las redefinas).

5. **Si encontrás una `create table` SIN su correspondiente RLS:**
   Alertá al usuario con:
   - Nombre de la tabla afectada.
   - Línea aproximada del `create table`.
   - Sugerencia concreta de patrón a agregar (basado en el modelo de la tabla):
     - ¿Tiene `brand_id`? → patrón per-brand.
     - ¿Tiene `user_id`? → patrón per-user.
     - ¿Es config global? → patrón con `using (true)` para SELECT y restricción para writes.

6. **Verificá idempotencia de policies:**
   - `create policy` rompe si la policy ya existe.
   - Buscá que cada `create policy` tenga su `drop policy if exists` previo.
   - Si falta, sugerí agregarlo.

## Patrones de policy para sugerir

```sql
-- Per-brand:
alter table <tabla> enable row level security;

drop policy if exists "select for brand members" on <tabla>;
create policy "select for brand members" on <tabla>
  for select using (is_brand_member(brand_id));

drop policy if exists "write for editors and owners" on <tabla>;
create policy "write for editors and owners" on <tabla>
  for insert with check (current_user_role(brand_id) in ('owner','editor'));

drop policy if exists "update for editors and owners" on <tabla>;
create policy "update for editors and owners" on <tabla>
  for update using (current_user_role(brand_id) in ('owner','editor'));

drop policy if exists "delete only owners" on <tabla>;
create policy "delete only owners" on <tabla>
  for delete using (current_user_role(brand_id) = 'owner');
```

```sql
-- Per-user (sin brand):
alter table <tabla> enable row level security;

drop policy if exists "user owns row" on <tabla>;
create policy "user owns row" on <tabla>
  for all using (auth.uid() = user_id);
```

## Excepciones

- **Tablas de configuración global** (sin `brand_id`/`user_id`) pueden tener policy `using (true)` solo para read y restricción para write — avisá al usuario explícitamente que es una excepción.
- **Tablas de logs/audit** puramente internas pueden no tener RLS si NO se exponen vía RPC ni se consultan desde el frontend — pero esto es raro; pedir confirmación.

## Output

Devolvé:

- ✅ Tablas con RLS correcto.
- ⚠️ Tablas sin RLS o con policies incompletas, con la sugerencia exacta de qué agregar.
- 📝 Recordatorio: la migración hay que correrla en Supabase SQL Editor manualmente; el check de acá es estático, no garantiza que la BD esté en sync.
