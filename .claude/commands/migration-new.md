---
description: Crea una nueva migración SQL con el siguiente número correlativo
argument-hint: nombre_descriptivo_snake_case (ej tests_table)
---

Crear una nueva migración SQL para Supabase, siguiendo la convención del proyecto.

Pasos:

1. **Validar argumento.** `$ARGUMENTS` debe ser `snake_case` (solo `[a-z0-9_]`, empezando con letra). Si no, error con ejemplo correcto.

2. **Calcular siguiente número.**
   - Listá `dashboard/src/lib/migrations/*.sql` excluyendo `*.PERSONAL.sql`.
   - Tomá el prefijo NNN más alto y sumá 1.
   - Padding a 3 dígitos (`003`, `010`).
   - Si el directorio está vacío, empezá en `001`.

3. **Verificar duplicados.** Si ya existe un archivo con `$ARGUMENTS` en su nombre (con cualquier prefijo), avisame y pedí confirmación.

4. **Crear archivo** `dashboard/src/lib/migrations/<NNN>_$ARGUMENTS.sql` con esta plantilla:

```sql
-- Migration: <NNN>_$ARGUMENTS
-- Created: <FECHA_HOY_YYYY-MM-DD>
-- Purpose: [DESCRIBIR EL OBJETIVO]
--
-- Cómo aplicar:
--   1. Abrir Supabase SQL Editor
--   2. Pegar este archivo completo
--   3. Run
--   4. Si falla: revertir manualmente con DROP statements abajo
--
-- Esta migración es idempotente — segura de correr múltiples veces.

-- ============================================================
-- 1. TABLAS
-- ============================================================

-- create table if not exists <nombre> (
--   id uuid primary key default gen_random_uuid(),
--   created_at timestamptz default now()
-- );

-- ============================================================
-- 2. ÍNDICES
-- ============================================================

-- create index if not exists idx_<tabla>_<col> on <tabla>(<col>);

-- ============================================================
-- 3. RLS (Row Level Security)
-- ============================================================
-- IMPORTANTE: ESCALA usa RLS en TODAS las tablas con datos de usuarios o brands.
-- Patrón típico: policy que usa is_brand_member(brand_id) o current_user_role(brand_id).

-- alter table <tabla> enable row level security;

-- create policy "<descripción>" on <tabla>
--   for select using (is_brand_member(brand_id));

-- ============================================================
-- 4. TRIGGERS / FUNCIONES
-- ============================================================

-- create or replace function <nombre>() ...
-- create trigger ... ;

-- ============================================================
-- 5. SEED (opcional)
-- ============================================================
-- Si necesitás datos sensibles (emails reales, IDs personales), creá un archivo
-- paralelo <NNN>_$ARGUMENTS.PERSONAL.sql (gitignored por *.PERSONAL.sql).

-- insert into <tabla> (...) values (...) on conflict do nothing;
```

5. **Reemplazar placeholders.**
   - `<NNN>` con el número calculado
   - `<FECHA_HOY_YYYY-MM-DD>` con la fecha de hoy (usá la del system reminder `# currentDate`)
   - `$ARGUMENTS` con el nombre que pasé

6. **Recordatorios contextuales según el nombre:**
   - Si `$ARGUMENTS` contiene `user`, `auth`, `role`, `member`: recordame que probablemente necesite políticas RLS específicas y trigger de assign-on-insert.
   - Si contiene `email`, `secret`, `token`: recordame crear también el `.PERSONAL.sql`.
   - Si contiene `test`, `winning`, `experiment`: avisame que F-04 requiere las tablas `tests` y `winning_ads` — sugerime el esquema base si encaja.

7. **Output final:**
   - Path completo del archivo creado
   - "Listo. Editá la sección Purpose y descomentá los bloques que necesites."
   - Si aplicaron recordatorios, listalos.
