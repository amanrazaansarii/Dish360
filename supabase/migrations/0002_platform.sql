-- Dish360: the platform side.
--
-- Run after 0001_dish360.sql. Adds what the admin panel (/admin) runs on:
-- subscriptions and suspension on each place, payments received, a log of
-- every 3D build and what it cost, inquiries with a status and notes, single
-- use password-reset links, and the platform's own settings (plan prices and
-- limits, the 3D service's price per model).
--
-- Safe to run twice: every statement checks before it adds.

-- --------------------------------------------------------------- places ---

alter table public.restaurants
  add column if not exists suspended    boolean not null default false,
  add column if not exists subscription jsonb;

-- ---------------------------------------------------------------- leads ---

alter table public.leads
  add column if not exists source         text not null default 'demo',
  add column if not exists status         text not null default 'new',
  add column if not exists city           text not null default '',
  add column if not exists restaurant_id  uuid references public.restaurants(id) on delete set null,
  add column if not exists requested_plan text,
  add column if not exists notes          text not null default '',
  add column if not exists updated_at     timestamptz not null default now();

create index if not exists leads_created_idx on public.leads (created_at desc);

-- ------------------------------------------------------------- payments ---

create table if not exists public.payments (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  amount_minor  integer not null check (amount_minor >= 0),
  currency      text not null default 'INR',
  method        text not null default 'other',
  reference     text not null default '',
  note          text not null default '',
  period_start  timestamptz,
  period_end    timestamptz,
  paid_at       timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index if not exists payments_restaurant_idx on public.payments (restaurant_id, paid_at desc);

-- ------------------------------------------------------------ 3D builds ---

create table if not exists public.asset_jobs (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  dish_id       uuid,
  dish_name     text not null default '',
  provider      text not null default 'built-in',
  outcome       text not null default 'succeeded',
  cost_minor    integer not null default 0,
  cost_currency text not null default 'USD',
  milliseconds  integer not null default 0,
  error         text,
  created_at    timestamptz not null default now()
);

create index if not exists asset_jobs_created_idx on public.asset_jobs (created_at desc);
create index if not exists asset_jobs_restaurant_idx on public.asset_jobs (restaurant_id, created_at desc);

-- ------------------------------------------------------ password resets ---

create table if not exists public.password_resets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------- settings ---
-- One row, id 'platform'. The app fills in anything missing with defaults.

create table if not exists public.platform_settings (
  id         text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------------------- RLS ---

alter table public.payments          enable row level security;
alter table public.asset_jobs        enable row level security;
alter table public.password_resets   enable row level security;
alter table public.platform_settings enable row level security;
