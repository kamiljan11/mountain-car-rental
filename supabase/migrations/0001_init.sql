-- Mountain Car Rental — Rental Manager · schema init
-- Uruchom w Supabase SQL editor lub `supabase db push`.
-- Zasada: 1-3 zaufanych userów, każdy zalogowany = pełny dostęp (brak per-row ownership).

create extension if not exists btree_gist;

create table vehicles (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  registration  text not null unique,
  vin           text,
  year          int,
  mileage       int,
  daily_rate    numeric(10,2),
  color         text not null default '#378ADD',
  status        text not null default 'active',
  insurance_oc_expiry  date,
  insurance_ac_expiry  date,
  inspection_expiry    date,
  notes         text,
  created_at    timestamptz default now()
);

create table customers (
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

create table bookings (
  id            uuid primary key default gen_random_uuid(),
  vehicle_id    uuid not null references vehicles(id) on delete restrict,
  customer_id   uuid references customers(id) on delete set null,
  type          text not null default 'reservation',  -- reservation | block | service
  status        text not null default 'confirmed',    -- tentative | confirmed | active | completed | cancelled
  start_at      timestamptz not null,
  end_at        timestamptz not null,
  pickup_location text,
  return_location text,
  daily_rate    numeric(10,2),
  total_price   numeric(10,2),
  deposit       numeric(10,2),
  platform      text,
  external_ref  text,
  notes         text,
  created_at    timestamptz default now(),
  constraint valid_range check (end_at > start_at)
);

create index bookings_vehicle_time_idx on bookings (vehicle_id, start_at, end_at);

alter table bookings add constraint no_overlap
  exclude using gist (vehicle_id with =, tstzrange(start_at, end_at) with &&)
  where (status <> 'cancelled');

create table contracts (
  id            uuid primary key default gen_random_uuid(),
  number        text not null,
  template_id   text not null,
  template_name text not null,
  customer_id   uuid references customers(id) on delete cascade,
  vehicle_id    uuid references vehicles(id) on delete set null,
  booking_id    uuid references bookings(id) on delete set null,
  status        text not null default 'sent',         -- draft | sent | signed
  content       text,
  created_at    timestamptz default now()
);

create table settings (
  id            int primary key default 1,
  company_name  text default 'Mountain Car Rental',
  company_address text,
  tax_id        text,
  phone         text,
  email         text,
  bank_account  text,
  contract_terms text,
  constraint single_row check (id = 1)
);

alter table vehicles  enable row level security;
alter table customers enable row level security;
alter table bookings  enable row level security;
alter table contracts enable row level security;
alter table settings  enable row level security;

create policy "auth full" on vehicles  for all to authenticated using (true) with check (true);
create policy "auth full" on customers for all to authenticated using (true) with check (true);
create policy "auth full" on bookings  for all to authenticated using (true) with check (true);
create policy "auth full" on contracts for all to authenticated using (true) with check (true);
create policy "auth full" on settings  for all to authenticated using (true) with check (true);
