-- Brands/projects
create table brands (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  emoji text,
  color text,
  created_at timestamp with time zone default now()
);

-- Meta connections per brand
create table meta_connections (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references brands(id) on delete cascade,
  access_token text,
  token_expires_at timestamp with time zone,
  ad_account_id text,
  ad_account_name text,
  facebook_page_id text,
  facebook_page_name text,
  facebook_page_token text,
  instagram_account_id text,
  instagram_username text,
  business_id text,
  connected_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tienda Nube connections per brand
create table tiendanube_connections (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references brands(id) on delete cascade,
  store_id text not null,
  access_token text not null,
  store_name text,
  connected_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- App settings (global)
create table app_settings (
  key text primary key,
  value text,
  updated_at timestamp with time zone default now()
);
