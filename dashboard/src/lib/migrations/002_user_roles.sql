-- ===============================================================
-- ESCALA · 002_user_roles.sql
-- Sistema de roles por proyecto (brand) + invitaciones por email + RLS.
-- Idempotente: se puede correr múltiples veces sin romper nada.
-- ===============================================================
-- Cómo correr esto:
--   1. Supabase Dashboard → SQL Editor → New query → pegar todo este archivo.
--   2. ANTES de ejecutar, reemplazar 'TU_EMAIL_AQUI' al final por el tuyo.
--   3. Run.
-- ===============================================================

-- 1) Tabla user_roles -------------------------------------------------
create table if not exists public.user_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  email       text not null,                                 -- guardamos email para invitaciones a usuarios que aún no se loguearon
  brand_id    uuid not null references public.brands(id) on delete cascade,
  role        text not null check (role in ('owner','editor','viewer')),
  invited_by  uuid references auth.users(id) on delete set null,
  created_at  timestamp with time zone default now(),
  constraint user_roles_email_brand_unique unique (email, brand_id)
);

create index if not exists user_roles_user_id_idx  on public.user_roles(user_id);
create index if not exists user_roles_brand_id_idx on public.user_roles(brand_id);
create index if not exists user_roles_email_idx    on public.user_roles(lower(email));

-- 2) Trigger: cuando un usuario se loguea por primera vez,
--    matchear su user_id con cualquier user_roles que tenga su email pendiente.
create or replace function public.link_invitations_to_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_roles
     set user_id = new.id
   where user_id is null
     and lower(email) = lower(new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.link_invitations_to_new_user();

-- 3) Helper: ¿qué rol tiene el usuario logueado en un brand? -----------
create or replace function public.current_user_role(p_brand_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
    from public.user_roles
   where brand_id = p_brand_id
     and user_id = auth.uid()
   limit 1;
$$;

-- 4) Helper: ¿el usuario logueado es miembro del brand? ----------------
create or replace function public.is_brand_member(p_brand_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.user_roles
     where brand_id = p_brand_id
       and user_id = auth.uid()
  );
$$;

-- 5) RLS: user_roles ---------------------------------------------------
alter table public.user_roles enable row level security;

drop policy if exists "user_roles select own membership rows" on public.user_roles;
create policy "user_roles select own membership rows"
  on public.user_roles for select
  using (
    user_id = auth.uid()
    or public.current_user_role(brand_id) in ('owner','editor','viewer')
  );

drop policy if exists "user_roles owner manages" on public.user_roles;
create policy "user_roles owner manages"
  on public.user_roles for all
  using ( public.current_user_role(brand_id) = 'owner' )
  with check ( public.current_user_role(brand_id) = 'owner' );

-- 6) RLS: brands -------------------------------------------------------
alter table public.brands enable row level security;

drop policy if exists "brands members can read" on public.brands;
create policy "brands members can read"
  on public.brands for select
  using ( public.is_brand_member(id) );

drop policy if exists "brands owners can update" on public.brands;
create policy "brands owners can update"
  on public.brands for update
  using ( public.current_user_role(id) = 'owner' );

drop policy if exists "brands owners can delete" on public.brands;
create policy "brands owners can delete"
  on public.brands for delete
  using ( public.current_user_role(id) = 'owner' );

-- Cualquier usuario logueado puede crear brand → automáticamente queda como owner (ver trigger más abajo).
drop policy if exists "brands authenticated can insert" on public.brands;
create policy "brands authenticated can insert"
  on public.brands for insert
  to authenticated
  with check ( true );

-- 7) Trigger: cuando se crea un brand, el creador se vuelve owner --------
create or replace function public.assign_brand_owner_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  creator_email text;
begin
  if auth.uid() is null then
    return new;
  end if;
  select email into creator_email from auth.users where id = auth.uid();
  insert into public.user_roles (user_id, email, brand_id, role, invited_by)
  values (auth.uid(), creator_email, new.id, 'owner', auth.uid())
  on conflict (email, brand_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_brand_created on public.brands;
create trigger on_brand_created
  after insert on public.brands
  for each row execute function public.assign_brand_owner_on_insert();

-- 8) RLS: meta_connections --------------------------------------------
alter table public.meta_connections enable row level security;

drop policy if exists "meta_connections members read" on public.meta_connections;
create policy "meta_connections members read"
  on public.meta_connections for select
  using ( public.is_brand_member(brand_id) );

drop policy if exists "meta_connections editors+ write" on public.meta_connections;
create policy "meta_connections editors+ write"
  on public.meta_connections for all
  using ( public.current_user_role(brand_id) in ('owner','editor') )
  with check ( public.current_user_role(brand_id) in ('owner','editor') );

-- 9) RLS: tiendanube_connections --------------------------------------
alter table public.tiendanube_connections enable row level security;

drop policy if exists "tn_connections members read" on public.tiendanube_connections;
create policy "tn_connections members read"
  on public.tiendanube_connections for select
  using ( public.is_brand_member(brand_id) );

drop policy if exists "tn_connections editors+ write" on public.tiendanube_connections;
create policy "tn_connections editors+ write"
  on public.tiendanube_connections for all
  using ( public.current_user_role(brand_id) in ('owner','editor') )
  with check ( public.current_user_role(brand_id) in ('owner','editor') );

-- 10) SEED: asignarte como owner de TODAS las brands existentes --------
--     ⚠️ REEMPLAZAR 'TU_EMAIL_AQUI' por tu email antes de correr ⚠️
do $$
declare
  my_user auth.users%rowtype;
begin
  select * into my_user from auth.users where lower(email) = lower('TU_EMAIL_AQUI') limit 1;
  if my_user.id is null then
    raise notice 'Usuario con email TU_EMAIL_AQUI no encontrado en auth.users — primero logueate al menos una vez con magic link, después corré el SEED de nuevo.';
  else
    insert into public.user_roles (user_id, email, brand_id, role, invited_by)
    select my_user.id, my_user.email, b.id, 'owner', my_user.id
      from public.brands b
    on conflict (email, brand_id) do nothing;
    raise notice 'OK: % brands asignadas a %', (select count(*) from public.brands), my_user.email;
  end if;
end $$;
