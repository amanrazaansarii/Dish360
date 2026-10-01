-- Dish360 schema.
--
-- Run it once against the project in .env.local:
--   Supabase dashboard → SQL editor → paste → Run
--   or: supabase db push
--
-- The app does its own sign-in (scrypt hashes, signed session cookies), so it
-- reaches Postgres only through the service role from the server. Row level
-- security is therefore on everywhere with no policies: the service role
-- bypasses RLS, and the anon key — which ships to browsers — can read nothing.
-- If you later want guests to query the menu directly from the browser, add
-- read policies for the published rows and nothing else.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- places ---

create table if not exists public.restaurants (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  tagline      text not null default '',
  about        text not null default '',
  cuisine      text[] not null default '{}',
  city         text not null default '',
  address      text not null default '',
  phone        text not null default '',
  website      text not null default '',
  logo_url     text,
  brand_color  text not null default '#aad0af',
  currency     text not null default 'INR',
  plan         text not null default 'free',
  hours        jsonb not null default '[]'::jsonb,
  published    boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------- people ---

create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  name          text not null,
  password_hash text not null,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  role          text not null default 'owner',
  created_at    timestamptz not null default now()
);

create index if not exists users_restaurant_idx on public.users (restaurant_id);

create table if not exists public.sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists sessions_user_idx on public.sessions (user_id);
create index if not exists sessions_expiry_idx on public.sessions (expires_at);

-- ------------------------------------------------------------------- menu ---

create table if not exists public.categories (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name          text not null,
  description   text not null default '',
  sort_index    integer not null default 0
);

create index if not exists categories_restaurant_idx
  on public.categories (restaurant_id, sort_index);

create table if not exists public.dishes (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  -- a dish outlives its section; losing one moves it to "Everything else"
  category_id   uuid references public.categories(id) on delete set null,
  name          text not null,
  description   text not null default '',
  -- paise, so a price never drifts the way a float would
  price_minor   integer not null default 0,
  currency      text not null default 'INR',
  image_url     text,
  calories      integer,
  ingredients   text[] not null default '{}',
  allergens     text[] not null default '{}',
  diet_tags     text[] not null default '{}',
  spice_level   smallint not null default 0,
  prep_minutes  integer,
  flavour       jsonb not null default '{"savoury":60,"sweet":40,"tang":40,"heat":10}'::jsonb,
  rating        real not null default 0,
  rating_count  integer not null default 0,
  sold_out      boolean not null default false,
  featured      boolean not null default false,
  published     boolean not null default false,
  sort_index    integer not null default 0,
  -- status, the two model urls, approved/approved_at, and the presentation
  -- settings. One column because it is always read and written together.
  model         jsonb not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists dishes_restaurant_idx
  on public.dishes (restaurant_id, sort_index);
create index if not exists dishes_published_idx
  on public.dishes (restaurant_id) where published;

-- ------------------------------------------------------------ table codes ---

create table if not exists public.table_codes (
  id             uuid primary key default gen_random_uuid(),
  restaurant_id  uuid not null references public.restaurants(id) on delete cascade,
  -- printed on a stand that is already on a table: written once, never rewritten
  code           text not null unique,
  label          text not null,
  target         text not null default 'menu',
  target_dish_id uuid references public.dishes(id) on delete set null,
  table_number   text,
  scans          integer not null default 0,
  last_scan_at   timestamptz,
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);

create index if not exists table_codes_restaurant_idx
  on public.table_codes (restaurant_id);

-- ----------------------------------------------------------------- events ---

create table if not exists public.events (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  dish_id       uuid references public.dishes(id) on delete set null,
  table_code_id uuid references public.table_codes(id) on delete set null,
  kind          text not null,
  seconds       integer,
  device        text not null default 'unknown',
  table_number  text,
  created_at    timestamptz not null default now()
);

-- Every analytics read is "this restaurant, since this date".
create index if not exists events_restaurant_time_idx
  on public.events (restaurant_id, created_at desc);

-- ----------------------------------------------------------------- orders ---

create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  table_number  text,
  -- names and prices are copied in at the time of ordering, so an order still
  -- reads correctly after the menu changes
  items         jsonb not null default '[]'::jsonb,
  total_minor   integer not null default 0,
  currency      text not null default 'INR',
  note          text not null default '',
  status        text not null default 'new',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists orders_restaurant_time_idx
  on public.orders (restaurant_id, created_at desc);

-- ---------------------------------------------------------------- reviews ---

create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  dish_id       uuid not null references public.dishes(id) on delete cascade,
  rating        smallint not null,
  comment       text not null default '',
  author        text not null default '',
  created_at    timestamptz not null default now()
);

create index if not exists reviews_dish_idx on public.reviews (dish_id, created_at desc);

-- ------------------------------------------------------- leads and outbox ---

create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  name            text not null default '',
  email           text not null default '',
  phone           text not null default '',
  restaurant_name text not null default '',
  message         text not null default '',
  created_at      timestamptz not null default now()
);

-- Messages the app would have emailed. Delete this table once a real email
-- provider is connected and queueMail sends instead of recording.
create table if not exists public.outbox (
  id         uuid primary key default gen_random_uuid(),
  "to"       text not null,
  subject    text not null,
  body       text not null,
  created_at timestamptz not null default now()
);

create index if not exists outbox_to_idx on public.outbox ("to", created_at desc);

-- -------------------------------------------------------------------- RLS ---
-- On, with no policies. The service role bypasses this; the anon key, which is
-- public by design, is left with no way in.

alter table public.restaurants  enable row level security;
alter table public.users        enable row level security;
alter table public.sessions     enable row level security;
alter table public.categories   enable row level security;
alter table public.dishes       enable row level security;
alter table public.table_codes  enable row level security;
alter table public.events       enable row level security;
alter table public.orders       enable row level security;
alter table public.reviews      enable row level security;
alter table public.leads        enable row level security;
alter table public.outbox       enable row level security;

-- ---------------------------------------------------------------- storage ---
-- Dish photographs. Public to read (they are on a public menu), writable only
-- through the service role.

insert into storage.buckets (id, name, public)
values ('dish-photos', 'dish-photos', true)
on conflict (id) do nothing;

-- ------------------------------------------------------------- increments ---
-- A scan is a read-modify-write from the app otherwise, and two guests scanning
-- the same stand at once would lose a count. One statement, no race.

create or replace function public.bump_scan(code_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.table_codes
     set scans = scans + 1,
         last_scan_at = now()
   where id = code_id;
$$;
