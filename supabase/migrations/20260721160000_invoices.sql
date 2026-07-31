-- Faktury (reikningar). Osobny dokument od umowy: numer SEKWENCYJNY i bezluki
-- w obrębie roku (wymóg islandzkiej ustawy o rachunkowości — numer nadaje serwer
-- atomowo, UNIQUE(number) + retry na 23505). `content` = niezmienny snapshot HTML
-- faktury w chwili wystawienia (dowód treści wysłanej klientowi).
create table if not exists rental.invoices (
  id           uuid primary key default gen_random_uuid(),
  number       text not null,
  customer_id  uuid references rental.customers(id) on delete set null,
  vehicle_id   uuid references rental.vehicles(id)  on delete set null,
  booking_id   uuid references rental.bookings(id)  on delete set null,
  company_key  text,                                  -- mountain | rebel (Sprzedawca)
  status       text not null default 'sent',          -- sent | paid | void
  total        numeric(12,2),                         -- brutto (ISK)
  net          numeric(12,2),
  vat_rate     numeric(5,2),
  currency     text not null default 'ISK',
  content      text,
  issued_at    date default (now() at time zone 'UTC')::date,
  created_at   timestamptz default now()
);

create unique index if not exists invoices_number_unique on rental.invoices (number);
create index if not exists invoices_customer_idx on rental.invoices (customer_id);
create index if not exists invoices_created_idx  on rental.invoices (created_at);

alter table rental.invoices enable row level security;
revoke all on rental.invoices from anon;
drop policy if exists "auth full" on rental.invoices;
create policy "auth full" on rental.invoices for all to authenticated using (true) with check (true);
