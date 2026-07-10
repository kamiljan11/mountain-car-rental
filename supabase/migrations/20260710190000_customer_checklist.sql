-- Checklista wydania auta, przypięta do klienta. Jeden wiersz = jeden odhaczony
-- (lub nie) punkt dla danego klienta. Stan współdzielony przez zespół (baza, nie
-- localStorage), żeby było widać na każdym telefonie.
create table if not exists rental.customer_checklists (
  customer_id uuid not null references rental.customers(id) on delete cascade,
  item_key text not null,
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (customer_id, item_key)
);
alter table rental.customer_checklists enable row level security;
revoke all on rental.customer_checklists from anon;
create policy "auth full" on rental.customer_checklists for all to authenticated using (true) with check (true);
