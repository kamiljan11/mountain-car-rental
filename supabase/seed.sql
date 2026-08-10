-- Mountain Car Rental — schema rental + seed z RentHelp (audyt pelny 2026-07-01).
-- Idempotentne (drop+recreate rental). 12 pojazdow (autorytatywna Flota), 75 klientow,
-- 33 rezerwacje + 15 blokad + 3 serwisy = 51 wpisow kalendarza, zero kolizji dat.
drop schema if exists rental cascade;
create schema rental;
grant usage on schema rental to anon, authenticated, service_role;
alter default privileges in schema rental grant all on tables to anon, authenticated, service_role;

create table rental.vehicles (id uuid primary key default gen_random_uuid(), name text not null, registration text, vin text, year int, mileage int, daily_rate numeric(12,2), color text default '#378ADD', status text default 'active', insurance_oc_expiry date, insurance_ac_expiry date, inspection_expiry date, notes text, created_at timestamptz default now());
create table rental.customers (id uuid primary key default gen_random_uuid(), full_name text not null, phone text, email text, id_number text, license_number text, address text, source text default 'renthelp', notes text, created_at timestamptz default now());
create table rental.bookings (id uuid primary key default gen_random_uuid(), vehicle_id uuid references rental.vehicles(id) on delete cascade, customer_id uuid references rental.customers(id) on delete set null, type text not null default 'reservation', status text not null default 'confirmed', start_at timestamptz not null, end_at timestamptz not null, pickup_time text, return_time text, daily_rate numeric(12,2), total_price numeric(12,2), vat_rate integer, deposit numeric(12,2), odometer_start integer, odometer_end integer, location text, platform text, external_ref text, notes text, created_at timestamptz default now());
create table rental.contracts (id uuid primary key default gen_random_uuid(), number text not null, template_id text, template_name text, customer_id uuid references rental.customers(id) on delete cascade, vehicle_id uuid, booking_id uuid, status text default 'sent', content text, created_at timestamptz default now());
-- Numer umowy niepowtarzalny (format NN/MM/RRRR = globalnie unikatowy) — lustro migracji 20260713162000.
create unique index if not exists contracts_number_unique on rental.contracts (number);
-- E-podpis (lustro migracji 20260720150000)
alter table rental.contracts add column if not exists sign_token text, add column if not exists sign_expires_at timestamptz, add column if not exists signed_at timestamptz, add column if not exists signer_name text, add column if not exists signer_meta text;
create unique index if not exists contracts_sign_token_unique on rental.contracts (sign_token) where sign_token is not null;
create table rental.settings (id int primary key default 1, brand text default 'Mountain Car Rental', legal_name text default 'Mountain All Service ehf.', kennitala text default '6907250450', vat text default '158052', address text default 'Njarðarbraut 3i, 260 Njarðvík', email text default 'mountainallservice@gmail.com', web text default 'https://mountaincar.is');

alter table rental.vehicles enable row level security;
create policy "public" on rental.vehicles for all to anon, authenticated using (true) with check (true);
alter table rental.customers enable row level security;
create policy "public" on rental.customers for all to anon, authenticated using (true) with check (true);
alter table rental.bookings enable row level security;
create policy "public" on rental.bookings for all to anon, authenticated using (true) with check (true);
alter table rental.contracts enable row level security;
create policy "public" on rental.contracts for all to anon, authenticated using (true) with check (true);
alter table rental.settings enable row level security;
create policy "public" on rental.settings for all to anon, authenticated using (true) with check (true);

-- Self-service booking links (klient sam wypełnia rezerwację wskazanego auta przez
-- wygasający link). Dostęp publiczny tylko serwerowo przez service_role scoped po
-- tokenie; anon bez dostępu (RLS + revoke), authenticated pełny.
create table rental.booking_links (id uuid primary key default gen_random_uuid(), token text not null unique, vehicle_id uuid references rental.vehicles(id) on delete cascade, status text not null default 'awaiting_client', expires_at timestamptz not null, suggested_start date, suggested_end date, suggested_daily_rate numeric(12,2), suggested_deposit numeric(12,2), note_to_client text, client_name text, client_email text, client_phone text, client_address text, client_id_number text, client_id_issued date, client_id_expires date, client_license text, client_license_issued date, client_license_expires date, req_start date, req_end date, client_note text, admin_note text, decided_at timestamptz, created_booking_id uuid, created_customer_id uuid, supersedes_id uuid references rental.booking_links(id) on delete set null, created_by text, submitted_at timestamptz, created_at timestamptz default now());
create index booking_links_token_idx on rental.booking_links (token);
create index booking_links_status_idx on rental.booking_links (status);
alter table rental.booking_links enable row level security;
revoke all on rental.booking_links from anon;
create policy "auth full" on rental.booking_links for all to authenticated using (true) with check (true);

-- Faktury (numer sekwencyjny/roczny, snapshot HTML).
create table rental.invoices (id uuid primary key default gen_random_uuid(), number text not null, customer_id uuid references rental.customers(id) on delete set null, vehicle_id uuid references rental.vehicles(id) on delete set null, booking_id uuid references rental.bookings(id) on delete set null, company_key text, status text not null default 'sent', total numeric(12,2), net numeric(12,2), vat_rate numeric(5,2), currency text not null default 'ISK', content text, issued_at date default (now() at time zone 'UTC')::date, created_at timestamptz default now());
alter table rental.invoices add column if not exists payment_method text, add column if not exists payment_term text, add column if not exists display_currency text, add column if not exists fx_rate numeric(18,8);
create unique index if not exists invoices_number_unique on rental.invoices (number);
create index if not exists invoices_customer_idx on rental.invoices (customer_id);
alter table rental.invoices enable row level security;
revoke all on rental.invoices from anon;
create policy "auth full" on rental.invoices for all to authenticated using (true) with check (true);

-- Checklista wydania auta przypięta do klienta (stan współdzielony przez zespół).
create table rental.customer_checklists (customer_id uuid not null references rental.customers(id) on delete cascade, item_key text not null, done boolean not null default false, updated_at timestamptz not null default now(), primary key (customer_id, item_key));
alter table rental.customer_checklists enable row level security;
revoke all on rental.customer_checklists from anon;
create policy "auth full" on rental.customer_checklists for all to authenticated using (true) with check (true);

insert into rental.vehicles (id,name,registration,color,status) values ('a8b551db-a504-41c5-b38d-ad04f35addba','Pajero Blue','TG692','#2563eb','active');
insert into rental.vehicles (id,name,registration,color,status) values ('5659fc8c-0384-4afc-ac47-47c320e1526b','Pajero Silver','SV183','#0ea5e9','active');
insert into rental.vehicles (id,name,registration,color,status) values ('26d78c9f-1064-46d4-8c57-26c4feacd582','Vito','PKP90','#14b8a6','active');
insert into rental.vehicles (id,name,registration,color,status) values ('60058650-64f5-4e7f-a141-6dd03f058280','Renault Master','UNZ27','#10b981','active');
insert into rental.vehicles (id,name,registration,color,status) values ('9862b8f9-2e25-40be-8395-6a88ccc85663','Renault Master II','RHR89','#eab308','active');
insert into rental.vehicles (id,name,registration,color,status) values ('cd61cfa1-a55a-4bd6-9e70-56ed8924ace7','Trafic','ROB64','#6366f1','active');
insert into rental.vehicles (id,name,registration,color,status) values ('304e9c73-3690-4e8f-81c6-24a95459fdd4','VW Caddy Beach Biały','ZLH03','#f59e0b','active');
insert into rental.vehicles (id,name,registration,color,status) values ('a9976a19-272f-43cb-8c80-6885a11b274e','Volkswagen Caddy Beach','JKF73','#84cc16','active');
insert into rental.vehicles (id,name,registration,color,status) values ('73033ff2-e194-487b-9875-e709e340179c','Volkswagen Caddy California','PYL41','#0891b2','active');
insert into rental.vehicles (id,name,registration,color,status) values ('3376f68b-0075-4d29-8e00-52439c10b1a4','Dacia Duster - górki','FZZ82','#06b6d4','active');
insert into rental.vehicles (id,name,registration,color,status) values ('90fe9a41-c670-4f28-9061-329d691180b4','Dacia Duster Namiot II','BPS82','#22c55e','active');
insert into rental.vehicles (id,name,registration,color,status) values ('90dcd10c-7cf9-409f-b373-7c1babcaa44f','Daci Duster Namiot','PFS75','#f43f5e','active');

insert into rental.customers (id,full_name,phone,email,source) values ('a0cc3bf2-da98-4715-ad46-d61690c8f3c1','Lukasz Wisniewski','+48571831521','lukasz.wisniewski1@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('491031d9-fa3b-4955-91d9-a0b2987d63b6','[klient 080] Nowak','+48584305867','pawel.nowak2@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('35789d77-b4ec-4467-b9ac-dfb53bc628be','[klient 249] Dabrowski','+48525076581','piotr.dabrowski3@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('c39eb8cf-a0a4-40b0-a709-2875d67d6b92','[klient 016] Kaminski','+48508507765','anna.kaminski4@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('aa1c0dac-f085-41dd-9702-466765187b99','Bartosz Mazur','+48571658485','bartosz.mazur5@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('0667c8e4-bbd0-4dbd-a030-31bfec697cf4','[klient 809] Kowalski','+48598553591','karolina.kowalski6@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('d9cfd3c0-8018-4fea-90ef-ce63412f2fb3','Alicja Krawczyk','+48561034618','alicja.krawczyk7@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('a87c1c85-e57a-44c1-8d9a-57f746f68efe','[klient 955] Wozniak','+48503540344','magdalena.wozniak8@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('b68420d0-95fb-431c-9442-f36b453c08c7','Lukasz Zielinski','+48531175875','lukasz.zielinski9@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('bd55f2f9-75ff-4537-af8f-264051cb8ad5','[klient 539] Kowalski','+48530656310','tomasz.kowalski10@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('f81c120f-d9d7-4def-a270-2fcf1b2ee442','Krzysztof Wisniewski','+48526053415','krzysztof.wisniewski11@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('4bf431a8-acc9-4245-84e3-659ad344ae89','Alicja Lewandowski','+48535358173','alicja.lewandowski12@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('0be48b30-f502-4c3f-a563-e3d31a42c998','[klient 918] Jankowski','+48573224078','agnieszka.jankowski13@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('419cd9d6-0266-4e06-a426-051492acee68','Katarzyna Kozlowski','+48531075576','katarzyna.kozlowski14@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('f522fbe1-2955-41ff-b795-9ac3561dd1ec','[klient 955] Lewandowski','+48556840104','magdalena.lewandowski15@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('95984d7e-52f1-4b03-8fa3-33dae3be3818','[klient 375] Dabrowski','+48589179580','grzegorz.dabrowski16@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('e93b05f0-6f83-41b1-8da3-ccbee9577401','Bartosz Jankowski','+48591642746','bartosz.jankowski17@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('894c8a94-d59c-4274-98de-d9af8aef26d8','[klient 016] Jankowski','+48599271342','anna.jankowski18@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('d6a6e395-5394-4bfd-b70e-c41d120e8619','Katarzyna Lewandowski','+48504336149','katarzyna.lewandowski19@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('390c7d62-e01a-40a7-9815-87966e56249c','[klient 037] Jankowski','+48595899716','natalia.jankowski20@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('a17a129f-b659-43f0-8552-a1562f164304','Julia Wisniewski','+48583354409','julia.wisniewski21@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('19d30726-8737-4455-987f-1825775488d6','[klient 375] Zielinski','+48572760146','grzegorz.zielinski22@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('6ca345fb-073a-465d-a564-ecf822880f00','[klient 458] Kozlowski','+48523783168','jakub.kozlowski23@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('15f38c08-a4da-4a52-9950-7373c31fdc4c','Julia Kaminski','+48595987023','julia.kaminski24@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('d1a76329-1443-4564-9357-44e7d9d955cf','Katarzyna Krawczyk','+48556203833','katarzyna.krawczyk25@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('b28f726e-92e2-495b-926d-bb844486d6c2','Maria Krawczyk','+48551895036','maria.krawczyk26@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('645514ec-c828-4a65-8883-e83d09774013','Ewa Mazur','+48590996471','ewa.mazur27@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('b9d6c634-f21c-4e75-a439-121059be4278','[klient 016] Wojcik','+48551683834','anna.wojcik28@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('3b3376db-0b36-4cd7-9b08-2c03d184f10e','[klient 016] Lewandowski','+48503505987','anna.lewandowski29@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('171d271b-6ccc-4a42-9cee-28be4843d5f6','[klient 955] Wozniak','+48564016067','magdalena.wozniak30@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('f413d025-36c2-49c5-ab53-826fa31ed3a3','Alicja Jankowski','+48586522502','alicja.jankowski31@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('9a2ab3cf-0451-4436-8ee1-a75693e5b535','Alicja Kowalski','+48571535977','alicja.kowalski32@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('593d6017-ff39-4579-8ccf-aaaad79c5ccd','Weronika Krawczyk','+48520096755','weronika.krawczyk33@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('3bcc9e90-7fd2-4832-8046-048c20748281','Zofia Mazur','+48550110162','zofia.mazur34@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('13b3018d-71e0-4ce1-a982-387aa3dc2692','Alicja Nowak','+48593519072','alicja.nowak35@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('a3a09e6c-82f3-4f9e-bdf0-5f36b294c046','Lukasz Wozniak','+48526911112','lukasz.wozniak36@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('126806e6-23df-4ddc-8c53-0e830c659975','Katarzyna Mazur','+48570097876','katarzyna.mazur37@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('09e7dda9-6d86-4161-b93c-4af6bad183b8','Maria Kowalski','+48502568355','maria.kowalski38@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('4249d497-55eb-4c65-b329-54f24baba842','[klient 375] Wozniak','+48589576608','grzegorz.wozniak39@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('4a5d7818-c7e1-49f3-9506-3d7c22cf8cd7','[klient 080] Dabrowski','+48594967006','pawel.dabrowski40@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('f635163e-35a0-44b5-9bc0-30f0c2e10118','[klient 037] Kaminski','+48529614234','natalia.kaminski41@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('83a03b6d-8ae2-4388-a80f-dad2ee89743c','Katarzyna Wisniewski','+48592992044','katarzyna.wisniewski42@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('beac6f54-362f-4777-8e3f-107dbd06058b','[klient 016] Jankowski','+48547479238','anna.jankowski43@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('a4ea2c77-7443-40c8-a54b-9a2f393bc222','[klient 080] Wozniak','+48565324212','pawel.wozniak44@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('fd160c59-869f-480a-94a9-cdd281c34a61','[klient 375] Dabrowski','+48540563468','grzegorz.dabrowski45@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('d5ec4ade-463b-460d-b739-a6e9309e1738','[klient 016] Kaminski','+48577913262','anna.kaminski46@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('1e02d3c2-78c3-4fb4-97dc-07bf83471a1b','Weronika Jankowski','+48546192746','weronika.jankowski47@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('cad61512-86b2-4ba6-8a33-2de557b2d293','Alicja Mazur','+48580692092','alicja.mazur48@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('34048533-2fa7-44e8-b12e-3119284616cb','Lukasz Mazur','+48524657563','lukasz.mazur49@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('fe8c59d2-31a8-46e1-ae29-78dbeada4d60','Julia Kowalski','+48518957462','julia.kowalski50@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('9c3f79a9-84a5-47f5-b6d8-3e5894b37ab9','Ewa Jankowski','+48533890133','ewa.jankowski51@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('426ee43d-f67f-4d39-8f64-08f41c587319','[klient 037] Kowalczyk','+48515643967','natalia.kowalczyk52@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('c373048d-1663-484f-ae6e-df047caaddd8','[klient 016] Dabrowski','+48561786491','anna.dabrowski53@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('613f99d7-040f-47b6-b4d5-46bf007a4c22','Alicja Lewandowski','+48564828392','alicja.lewandowski54@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('36a7e92d-af8e-4bae-b337-02b3814a5ee3','Zofia Wozniak','+48512672285','zofia.wozniak55@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('ec1d68ac-5aed-42b9-bd37-4dfde6aa4920','Weronika Wisniewski','+48520222512','weronika.wisniewski56@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('e1e93b5a-e9b5-49b8-aa2e-ca55769e7938','[klient 918] Nowak','+48599039964','agnieszka.nowak57@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('8a1fc037-c2ce-46d1-bc01-8d6a5682ac57','Alicja Lewandowski','+48513578596','alicja.lewandowski58@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('0843f752-3304-4549-b457-448b494fc068','Weronika Nowak','+48552894695','weronika.nowak59@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('8e77a8b4-e1a5-42ed-8868-ec865256ea73','[klient 737] Lewandowski','+48527428775','monika.lewandowski60@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('fb2f0da6-0c04-473c-a188-46925808b155','Lukasz Szymanski','+48570057992','lukasz.szymanski61@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('edb109cc-06dc-43b9-957d-5d99c8b7b0a6','Alicja Kaminski','+48566067607','alicja.kaminski62@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('18d38125-7202-48a4-bff4-bf6d36dcfd42','[klient 037] Mazur','+48536180845','natalia.mazur63@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('3e2062f4-2c08-4790-a204-e07a7c37e79d','Maria Nowak','+48504943129','maria.nowak64@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('b9616851-4ced-496f-b213-21d73fc7ddd3','Julia Szymanski','+48501593900','julia.szymanski65@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('e9b20e31-fec4-43db-9fe4-1a3368fca754','Adam Jankowski','+48510413988','adam.jankowski66@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('6f850853-2a65-411f-933d-c67939159c7e','Katarzyna Zielinski','+48583701045','katarzyna.zielinski67@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('5b84280f-5702-4610-95ee-374cf52f5298','Maria Kowalski','+48552891045','maria.kowalski68@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('f0959fca-59ee-4176-be1d-c234703317ea','[klient 918] Zielinski','+48512132331','agnieszka.zielinski69@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('b61c2aca-1a44-423f-bcb2-8fada36c4013','Weronika Kowalski','+48580971206','weronika.kowalski70@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('862d9570-f92d-4083-bf64-cb0a6f48f758','Adam Wozniak','+48590144375','adam.wozniak71@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('fdf10199-c0f1-4b56-a603-1c81dd1d595e','Marek Nowak','+48504026657','marek.nowak72@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('07671c09-2b1f-47e0-8ce7-9256bf732c8d','[klient 016] Jankowski','+48562877373','anna.jankowski73@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('550a6367-c5ba-40ef-ae3a-173965f2208d','Zofia Zielinski','+48514038945','zofia.zielinski74@example.com','seed');
insert into rental.customers (id,full_name,phone,email,source) values ('c2aa7b58-4e1a-4e97-bc68-e93f23912774','[klient 539] Kowalski','+48522058331','tomasz.kowalski75@example.com','seed');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('f94acbff-eb30-4761-b82d-1ed515e7f346','a8b551db-a504-41c5-b38d-ad04f35addba','07671c09-2b1f-47e0-8ce7-9256bf732c8d','reservation','confirmed','2026-07-13','2026-07-20','RH-1103',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('3c6c9238-38ea-42c3-ab88-c0399e6026b7','60058650-64f5-4e7f-a141-6dd03f058280','d6a6e395-5394-4bfd-b70e-c41d120e8619','reservation','confirmed','2026-06-20','2026-06-28','RH-1102',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('ebc912d4-aa9d-4ce4-9692-c5221c775a06','90fe9a41-c670-4f28-9061-329d691180b4','0667c8e4-bbd0-4dbd-a030-31bfec697cf4','reservation','confirmed','2026-06-21','2026-06-28','RH-1101',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('5235ac72-8471-40a6-8dc1-8d75c184c481','90fe9a41-c670-4f28-9061-329d691180b4','fdf10199-c0f1-4b56-a603-1c81dd1d595e','reservation','confirmed','2026-07-29','2026-08-04','RH-1100',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('aba5d0d8-f855-474e-bd19-5543c94c3f12','5659fc8c-0384-4afc-ac47-47c320e1526b','8a1fc037-c2ce-46d1-bc01-8d6a5682ac57','reservation','confirmed','2026-07-11','2026-07-21','RH-1099',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('46a62ff0-b880-456b-836f-07391cd9bcdd','a9976a19-272f-43cb-8c80-6885a11b274e','d9cfd3c0-8018-4fea-90ef-ce63412f2fb3','reservation','confirmed','2026-08-08','2026-08-12','RH-1098',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('775041ef-a6cb-410d-a44c-7a0eb58db7b9','cd61cfa1-a55a-4bd6-9e70-56ed8924ace7','fb2f0da6-0c04-473c-a188-46925808b155','reservation','active','2026-06-14','2026-06-20','RH-1097',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('2420ac0e-b6ca-430b-9e03-897376258eb9','90fe9a41-c670-4f28-9061-329d691180b4','613f99d7-040f-47b6-b4d5-46bf007a4c22','reservation','confirmed','2026-06-06','2026-06-18','RH-1096',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('e8db36f9-371f-48c4-a305-1cdd9347611f','304e9c73-3690-4e8f-81c6-24a95459fdd4','f0959fca-59ee-4176-be1d-c234703317ea','reservation','confirmed','2026-06-04','2026-06-07','RH-1095',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('85a02332-be96-42c8-968b-0105efeac9ee','a9976a19-272f-43cb-8c80-6885a11b274e','09e7dda9-6d86-4161-b93c-4af6bad183b8','reservation','confirmed','2026-05-30','2026-06-06','RH-1094',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('e13decbe-319c-4cc5-b3fb-7285472f9c75','a9976a19-272f-43cb-8c80-6885a11b274e','d5ec4ade-463b-460d-b739-a6e9309e1738','reservation','confirmed','2026-07-12','2026-07-23','RH-1093',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('7b730958-58f2-4fd2-a40b-96288dc4a72a','cd61cfa1-a55a-4bd6-9e70-56ed8924ace7','6ca345fb-073a-465d-a564-ecf822880f00','reservation','confirmed','2026-04-30','2026-05-03','RH-1092',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('bfbeb8cd-d4a6-4add-8ce4-c3068bf59492','a8b551db-a504-41c5-b38d-ad04f35addba','4bf431a8-acc9-4245-84e3-659ad344ae89','reservation','confirmed','2026-07-21','2026-08-04','RH-1091',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('6e7de43b-1f14-40da-ad08-0efc6442fe82','5659fc8c-0384-4afc-ac47-47c320e1526b','a17a129f-b659-43f0-8552-a1562f164304','reservation','confirmed','2026-08-15','2026-08-29','RH-1090',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('ee3fae55-8d69-46f6-8d5e-d8b276eada5a','73033ff2-e194-487b-9875-e709e340179c','9a2ab3cf-0451-4436-8ee1-a75693e5b535','reservation','active','2026-05-30','2026-06-05','RH-1089',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('42a6949f-7949-4ca9-a34a-cc3a65f2dd0d','a9976a19-272f-43cb-8c80-6885a11b274e','35789d77-b4ec-4467-b9ac-dfb53bc628be','reservation','confirmed','2026-04-19','2026-04-26','RH-1088',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('aecae4ed-b855-43c0-9a44-a114841ced97','304e9c73-3690-4e8f-81c6-24a95459fdd4','645514ec-c828-4a65-8883-e83d09774013','reservation','active','2026-04-15','2026-04-22','RH-1087',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('ba8576ef-64c7-41f5-ba11-3c64655f20a4','304e9c73-3690-4e8f-81c6-24a95459fdd4','e1e93b5a-e9b5-49b8-aa2e-ca55769e7938','reservation','confirmed','2026-06-30','2026-07-07','RH-1084',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('938f95f2-5a33-4270-a1f8-26e4c021e38c','cd61cfa1-a55a-4bd6-9e70-56ed8924ace7','edb109cc-06dc-43b9-957d-5d99c8b7b0a6','reservation','confirmed','2026-06-03','2026-06-07','RH-1082',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('f2747c99-8478-48e2-9b7a-ac7c4ab7f5ae','cd61cfa1-a55a-4bd6-9e70-56ed8924ace7','35789d77-b4ec-4467-b9ac-dfb53bc628be','reservation','confirmed','2026-04-19','2026-04-26','RH-1081',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('dde497ac-6b35-4e1d-8995-d33f28f48887','73033ff2-e194-487b-9875-e709e340179c','bd55f2f9-75ff-4537-af8f-264051cb8ad5','reservation','confirmed','2026-08-27','2026-09-01','RH-1080',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('53432b50-c809-4fb1-8612-ada4863de900','73033ff2-e194-487b-9875-e709e340179c','b28f726e-92e2-495b-926d-bb844486d6c2','reservation','confirmed','2026-07-11','2026-07-23','RH-1079',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('83e0a192-31d5-4ac0-9920-1447ed184330','304e9c73-3690-4e8f-81c6-24a95459fdd4','645514ec-c828-4a65-8883-e83d09774013','reservation','confirmed','2026-07-12','2026-07-22','RH-1076',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('6e1f5f3f-fb00-454c-a83a-72a92a900aff','5659fc8c-0384-4afc-ac47-47c320e1526b','cad61512-86b2-4ba6-8a33-2de557b2d293','reservation','confirmed','2026-08-08','2026-08-15','RH-1074',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('24bb9199-7a33-44d9-b352-42106759f85a','26d78c9f-1064-46d4-8c57-26c4feacd582','645514ec-c828-4a65-8883-e83d09774013','reservation','active','2026-04-15','2026-04-22','RH-1073',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('58e0cf01-c86c-423c-a532-07afcd232d10','73033ff2-e194-487b-9875-e709e340179c','3bcc9e90-7fd2-4832-8046-048c20748281','reservation','confirmed','2026-08-11','2026-08-16','RH-1072',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('198f799f-9b8c-45ed-8ec5-9997d0edf2c6','5659fc8c-0384-4afc-ac47-47c320e1526b','cad61512-86b2-4ba6-8a33-2de557b2d293','reservation','confirmed','2026-06-21','2026-06-27','RH-1071',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('e11eb250-1000-47a5-8bd7-95c4115f395d','5659fc8c-0384-4afc-ac47-47c320e1526b','d9cfd3c0-8018-4fea-90ef-ce63412f2fb3','reservation','confirmed','2026-07-31','2026-08-07','RH-1069',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('b13b1914-9e29-4b02-ba5b-df7a18622591','5659fc8c-0384-4afc-ac47-47c320e1526b','9c3f79a9-84a5-47f5-b6d8-3e5894b37ab9','reservation','confirmed','2026-03-16','2026-03-20','RH-1067',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('bbf6fadb-5a84-40f6-a94d-0474d4008036','26d78c9f-1064-46d4-8c57-26c4feacd582','b9d6c634-f21c-4e75-a439-121059be4278','reservation','confirmed','2026-08-02','2026-08-16','RH-1066',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('13bd68bb-e748-4122-b6f8-b3b76f65003c','304e9c73-3690-4e8f-81c6-24a95459fdd4','550a6367-c5ba-40ef-ae3a-173965f2208d','reservation','confirmed','2026-08-06','2026-08-15','RH-1065',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('9229cbe6-8d63-42b2-9b33-02a6ebb8d040','a8b551db-a504-41c5-b38d-ad04f35addba','4a5d7818-c7e1-49f3-9506-3d7c22cf8cd7','reservation','confirmed','2026-08-06','2026-08-18','RH-1060',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,external_ref,notes) values ('dfe508aa-d01c-49f3-ba6a-f71939d44640','73033ff2-e194-487b-9875-e709e340179c','862d9570-f92d-4083-bf64-cb0a6f48f758','reservation','confirmed','2026-06-21','2026-07-05','RH-1054',null);
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes) values ('365e2dc8-8eed-4ae8-a81f-10a0523b4d00','3376f68b-0075-4d29-8e00-52439c10b1a4',null,'block','confirmed','2026-07-05','2026-07-12','Rezerwacja z formularza, 9500 ISK/doba');
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes) values ('074dbd86-6ab6-4a3a-bdc3-b7c2128daf04','60058650-64f5-4e7f-a141-6dd03f058280',null,'block','confirmed','2026-06-28','2026-07-05','Zapytanie whatsapp, 25000 ISK/doba');
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes) values ('b2518f3b-751f-40f4-acea-50cb20f95ffa','60058650-64f5-4e7f-a141-6dd03f058280',null,'block','confirmed','2026-07-09','2026-07-15','Klient staly, 13000 ISK/doba');
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes) values ('ee6d17ee-b425-4573-ba90-5dfb5635575f','90fe9a41-c670-4f28-9061-329d691180b4',null,'block','confirmed','2026-07-12','2026-07-19','Rezerwacja telefoniczna, 10000 ISK/doba');
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes) values ('d64a4f8d-84cc-4466-b959-0399bd32d598','cd61cfa1-a55a-4bd6-9e70-56ed8924ace7',null,'block','confirmed','2026-07-14','2026-07-21','Zapytanie przez messenger, 12000 ISK/doba');
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes) values ('dc78fa3e-9c81-44f8-b796-e7cf28105131','9862b8f9-2e25-40be-8395-6a88ccc85663',null,'block','confirmed','2026-07-18','2026-07-25','Klient staly, 13000 ISK/doba');
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes) values ('f17dd43d-c0c3-4fb0-8481-80ea2b9e4949','3376f68b-0075-4d29-8e00-52439c10b1a4',null,'block','confirmed','2026-07-18','2026-07-25','Klient staly, 13000 ISK/doba');
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes) values ('e5734f3c-b006-4164-a983-df23cca12c2c','90fe9a41-c670-4f28-9061-329d691180b4',null,'block','confirmed','2026-07-21','2026-07-28','Zapytanie przez messenger, 12000 ISK/doba');
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes) values ('1531cfda-98a1-4c87-8f59-7a0e8636804e','90dcd10c-7cf9-409f-b373-7c1babcaa44f',null,'block','confirmed','2026-07-21','2026-07-28','Zapytanie przez messenger, 12000 ISK/doba');
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes) values ('dbc8b679-32d8-4774-a30d-6240f427710e','3376f68b-0075-4d29-8e00-52439c10b1a4',null,'block','confirmed','2026-07-25','2026-08-06','Rezerwacja telefoniczna, 10000 ISK/doba');
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes) values ('162921a3-15cf-4bc2-8d70-dea2c7e41a6f','3376f68b-0075-4d29-8e00-52439c10b1a4',null,'block','confirmed','2026-08-13','2026-08-17','Klient staly, 13000 ISK/doba');
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes) values ('7803391e-7e02-4cbe-ae82-beed2eb1b41f','90dcd10c-7cf9-409f-b373-7c1babcaa44f',null,'block','confirmed','2026-08-13','2026-08-25','Zapytanie whatsapp, 25000 ISK/doba');
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes) values ('3a09d989-ba69-4afa-a8a9-e93de00a4ea1','90fe9a41-c670-4f28-9061-329d691180b4',null,'block','confirmed','2026-08-16','2026-08-25','Zapytanie przez messenger, 12000 ISK/doba');
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes) values ('105e2730-45e2-46e4-ae88-27c703ccadd0','90fe9a41-c670-4f28-9061-329d691180b4',null,'block','confirmed','2026-08-09','2026-08-15','Zapytanie przez messenger, 12000 ISK/doba');
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes) values ('e7fce685-93b7-4b9d-abda-15dbf39a7775','a9976a19-272f-43cb-8c80-6885a11b274e',null,'block','confirmed','2026-08-13','2026-08-17','Klient staly, 13000 ISK/doba');
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes) values ('c86f83f8-44a7-4b38-bc7f-79842774bd44','a8b551db-a504-41c5-b38d-ad04f35addba',null,'service','confirmed','2026-04-28','2026-06-01','Serwis (RentHelp import)');
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes) values ('02262aa6-98c7-4ee7-9592-bfbb9ab1f210','5659fc8c-0384-4afc-ac47-47c320e1526b',null,'service','confirmed','2026-04-28','2026-06-01','Serwis (RentHelp import)');
insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes) values ('3350d9cd-56f2-4847-881e-8139fce515fa','5659fc8c-0384-4afc-ac47-47c320e1526b',null,'service','confirmed','2024-06-11','2025-03-31','Serwis (RentHelp import, historyczny)');

insert into rental.settings (id) values (1);

-- Backstop bazy przeciw podwójnej rezerwacji — lustro migracji 20260713160000.
-- Semantyka [) (dzień zwrotu = granica wykluczająca), zgodna z hasOverlap w db.ts.
-- Dodane PO insertach, bo constraint waliduje istniejące wiersze (seed nie ma nakładek).
create extension if not exists btree_gist;
alter table rental.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    vehicle_id with =,
    daterange(
      (start_at at time zone 'UTC')::date,
      (end_at   at time zone 'UTC')::date,
      '[)'
    ) with &&
  )
  -- Podłoga 2026: jak w migracji 20260713160000 — historia importu (2024/25) wyłączona spod
  -- constraintu, era żywa (2026+) egzekwowana w pełni.
  where (status <> 'cancelled' and start_at >= '2026-01-01');

