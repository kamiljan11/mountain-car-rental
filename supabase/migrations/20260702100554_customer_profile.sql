-- Rozszerzenie profilu klienta wg wzorca RentHelp: dane firmowe (klient
-- firmowy vs prywatny), status "podejrzany", oraz osobna tabela dokumentów
-- tożsamości (bez zdjęć — sama ewidencja typu/numeru/ważności).

alter table rental.customers
  add column if not exists company_name text,
  add column if not exists nip text,
  add column if not exists company_address text,
  add column if not exists company_email text,
  add column if not exists company_phone text,
  add column if not exists is_suspect boolean not null default false;

create table rental.customer_documents (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid not null references rental.customers(id) on delete cascade,
  doc_type      text not null,
  doc_number    text,
  issued_at     date,
  expires_at    date,
  created_at    timestamptz default now()
);

alter table rental.customer_documents enable row level security;
create policy "auth full" on rental.customer_documents for all to authenticated using (true) with check (true);
