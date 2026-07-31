-- Self-service booking links: klient sam wypełnia rezerwację WSKAZANEGO auta
-- przez jednorazowy, wygasający (60 min) link. Jeden wiersz = jeden link = jedna
-- próba bookingu; przejścia: awaiting_client → submitted → confirmed |
-- changes_requested | rejected | expired.
--
-- Dostęp publiczny (niezalogowany klient) idzie WYŁĄCZNIE serwerowo, kluczem
-- service_role, scoped po tokenie (src/lib/book-public.ts). Rola anon nie ma tu
-- żadnego dostępu — RLS + revoke, jak reszta schematu (patrz 20260702170000).
-- UWAGA: seed.sql ustawia default privileges GRANT dla anon na nowych tabelach,
-- więc revoke poniżej jest konieczny (RLS to druga warstwa obrony).

create table if not exists rental.booking_links (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  vehicle_id uuid references rental.vehicles(id) on delete cascade,
  status text not null default 'awaiting_client',
  expires_at timestamptz not null,
  -- prefill od zespołu przy generowaniu linku
  suggested_start date,
  suggested_end date,
  suggested_daily_rate numeric(12,2),
  suggested_deposit numeric(12,2),
  note_to_client text,
  -- dane wpisane przez klienta (po submit)
  client_name text,
  client_email text,
  client_phone text,
  client_address text,
  client_id_number text,
  client_license text,
  req_start date,
  req_end date,
  client_note text,
  -- decyzja zespołu
  admin_note text,
  decided_at timestamptz,
  created_booking_id uuid,
  created_customer_id uuid,
  supersedes_id uuid references rental.booking_links(id) on delete set null,
  created_by text,
  submitted_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists booking_links_token_idx on rental.booking_links (token);
create index if not exists booking_links_status_idx on rental.booking_links (status);

alter table rental.booking_links enable row level security;
revoke all on rental.booking_links from anon;
drop policy if exists "auth full" on rental.booking_links;
create policy "auth full" on rental.booking_links for all to authenticated using (true) with check (true);
