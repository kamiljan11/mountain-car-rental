-- Mountain Car Rental — Rental Manager · schema init
-- Projekt Supabase: mountaincar-is (współdzielony z garage) → izolujemy w schemacie `rental`.
-- Po uruchomieniu: w Supabase → Settings → API → "Exposed schemas" dodaj `rental`,
-- a klient używa createBrowserClient(..., { db: { schema: 'rental' } }).

create schema if not exists rental;
grant usage on schema rental to anon, authenticated, service_role;
alter default privileges in schema rental grant all on tables to anon, authenticated, service_role;

create extension if not exists btree_gist;

create table rental.vehicles (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  registration  text not null unique,
  vin           text,
  year          int,
  mileage       int,
  daily_rate    numeric(12,2),
  color         text not null default '#378ADD',
  status        text not null default 'active',
  insurance_oc_expiry  date,
  insurance_ac_expiry  date,
  inspection_expiry    date,
  notes         text,
  created_at    timestamptz default now()
);

create table rental.customers (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  phone         text,
  email         text,
  id_number     text,
  license_number text,
  address       text,
  source        text default 'manual',
  notes         text,
  created_at    timestamptz default now()
);

create table rental.bookings (
  id            uuid primary key default gen_random_uuid(),
  vehicle_id    uuid not null references rental.vehicles(id) on delete restrict,
  customer_id   uuid references rental.customers(id) on delete set null,
  type          text not null default 'reservation',  -- reservation | block | service
  status        text not null default 'confirmed',    -- tentative | confirmed | active | completed | cancelled
  start_at      timestamptz not null,
  end_at        timestamptz not null,
  pickup_location text,
  return_location text,
  daily_rate    numeric(12,2),
  total_price   numeric(12,2),
  deposit       numeric(12,2),
  platform      text,
  external_ref  text,
  notes         text,
  created_at    timestamptz default now(),
  constraint valid_range check (end_at > start_at)
);

create index bookings_vehicle_time_idx on rental.bookings (vehicle_id, start_at, end_at);

alter table rental.bookings add constraint no_overlap
  exclude using gist (vehicle_id with =, tstzrange(start_at, end_at) with &&)
  where (status <> 'cancelled');

create table rental.contracts (
  id            uuid primary key default gen_random_uuid(),
  number        text not null,
  template_id   text not null,
  template_name text not null,
  customer_id   uuid references rental.customers(id) on delete cascade,
  vehicle_id    uuid references rental.vehicles(id) on delete set null,
  booking_id    uuid references rental.bookings(id) on delete set null,
  status        text not null default 'sent',         -- draft | sent | signed
  content       text,
  created_at    timestamptz default now()
);

create table rental.settings (
  id            int primary key default 1,
  brand         text default 'Mountain Car Rental',
  legal_name    text default 'Mountain All Service ehf.',
  kennitala     text default '6907250450',
  vat           text default '158052',
  address       text default 'Njarðarbraut 3i, 260 Njarðvík',
  email         text default 'mountainallservice@gmail.com',
  web           text default 'https://mountaincar.is',
  contract_terms text,
  constraint single_row check (id = 1)
);

alter table rental.vehicles  enable row level security;
alter table rental.customers enable row level security;
alter table rental.bookings  enable row level security;
alter table rental.contracts enable row level security;
alter table rental.settings  enable row level security;

create policy "auth full" on rental.vehicles  for all to authenticated using (true) with check (true);
create policy "auth full" on rental.customers for all to authenticated using (true) with check (true);
create policy "auth full" on rental.bookings  for all to authenticated using (true) with check (true);
create policy "auth full" on rental.contracts for all to authenticated using (true) with check (true);
create policy "auth full" on rental.settings  for all to authenticated using (true) with check (true);
