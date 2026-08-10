-- Backfill: 32 wpisy pominięte przy wizualnej migracji z RentHelp + 2 korekty + kasacja
-- wpisu testowego. Wynik deterministycznej rekoncyliacji CSV<->DB z 2026-07-04
-- (skrypt: multiset-diff po kluczach typ|rejestracja/klient|daty, normalizacja ł/diakrytyki/
-- cyrylickie sobowtóry OCR, parowanie rozmyte dopisków firmowych "ehf/NIP").
-- Idempotentne: inserty strzeżone external_ref, korekty/kasacja po konkretnych id.
-- Stan końcowy zweryfikowany: 82/82 wierszy CSV ma odpowiednik w bazie; jedyny nadmiar
-- to celowe rozszerzenie serwisu 2026-04-28→06-01 na oba Pajero.
-- UWAGA: baza produkcyjna dostała te zmiany 2026-07-04 przez REST (service_role);
-- ten plik jest zapisem 1:1 do odtworzenia środowiska od zera.

-- Korekta 1: blok [klient 361] [klient 243] na BPS82 miał błędny koniec 2026-08-25 (przeniesione
-- daty bliźniaczego bloku z FZZ82); wg RentHelp: 2026-08-30.
update rental.bookings set end_at = '2026-08-30' where id = '3a09d989-ba69-4afa-a8a9-e93de00a4ea1';

-- Korekta 2: serwis historyczny 2024-06-11→2025-03-31 siedział na Pajero Silver,
-- a RentHelp mówi "Serwis Pajero Blue" — przeniesiony na TG692.
update rental.bookings set vehicle_id = 'a8b551db-a504-41c5-b38d-ad04f35addba' where id = '3350d9cd-56f2-4847-881e-8139fce515fa';

-- Kasacja: testowa rezerwacja "Random" (Vito, 2026-10-12→18) utworzona podczas testów UI.
delete from rental.bookings where id = '40133296-c1ad-4831-8421-00e8df04ae56';

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select 'b0a46045-534e-4891-af55-19fb0342bf35','5659fc8c-0384-4afc-ac47-47c320e1526b','fd160c59-869f-480a-94a9-cdd281c34a61','reservation','confirmed','2024-07-13','2024-07-27',null,'RH-BACKFILL-L3'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L3');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '1de68391-a96f-4aa1-92f6-d79080cfea71','5659fc8c-0384-4afc-ac47-47c320e1526b','0be48b30-f502-4c3f-a563-e3d31a42c998','reservation','confirmed','2024-07-24','2024-07-26',null,'RH-BACKFILL-L4'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L4');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select 'dd04d8ff-f407-4713-827e-b92156ce251e','a9976a19-272f-43cb-8c80-6885a11b274e','fe8c59d2-31a8-46e1-ae29-78dbeada4d60','reservation','confirmed','2025-06-01','2025-06-07',null,'RH-BACKFILL-L5'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L5');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '983c4532-a7cf-4ac5-bd50-1bd726906571','a8b551db-a504-41c5-b38d-ad04f35addba','95984d7e-52f1-4b03-8fa3-33dae3be3818','reservation','confirmed','2025-06-11','2025-06-22',null,'RH-BACKFILL-L6'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L6');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '2f2d1571-91c7-49ed-80d7-240b4b41c9f7','5659fc8c-0384-4afc-ac47-47c320e1526b','beac6f54-362f-4777-8e3f-107dbd06058b','reservation','confirmed','2025-06-15','2025-06-24',null,'RH-BACKFILL-L7'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L7');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '0e21c305-7b23-44a0-8477-9022b42c5ca9','a9976a19-272f-43cb-8c80-6885a11b274e','13b3018d-71e0-4ce1-a982-387aa3dc2692','reservation','confirmed','2025-06-26','2025-07-05',null,'RH-BACKFILL-L8'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L8');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '1ec01ee5-590e-4148-b29a-36c837307043','a8b551db-a504-41c5-b38d-ad04f35addba','f522fbe1-2955-41ff-b795-9ac3561dd1ec','reservation','confirmed','2025-06-29','2025-07-13',null,'RH-BACKFILL-L9'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L9');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '8ff372bb-ce49-4983-8893-0371d65c0b1f','304e9c73-3690-4e8f-81c6-24a95459fdd4','e9b20e31-fec4-43db-9fe4-1a3368fca754','reservation','confirmed','2025-07-02','2025-07-09',null,'RH-BACKFILL-L10'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L10');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '8395610d-3d95-4da2-b18c-2e0fe31f1d41','5659fc8c-0384-4afc-ac47-47c320e1526b','491031d9-fa3b-4955-91d9-a0b2987d63b6','reservation','confirmed','2025-07-04','2025-07-12',null,'RH-BACKFILL-L11'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L11');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '5f73d8ce-a990-4ab3-afbf-557d0648142a','a8b551db-a504-41c5-b38d-ad04f35addba','419cd9d6-0266-4e06-a426-051492acee68','reservation','confirmed','2025-07-22','2025-07-31',null,'RH-BACKFILL-L12'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L12');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '195e7814-2c69-45dd-9b47-561281a0afcc','a8b551db-a504-41c5-b38d-ad04f35addba','1e02d3c2-78c3-4fb4-97dc-07bf83471a1b','reservation','confirmed','2025-08-15','2025-08-24',null,'RH-BACKFILL-L13'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L13');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '636639d4-a8cc-4ffe-bf07-109482638837','5659fc8c-0384-4afc-ac47-47c320e1526b','b68420d0-95fb-431c-9442-f36b453c08c7','reservation','confirmed','2025-08-23','2025-08-31',null,'RH-BACKFILL-L14'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L14');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select 'a0bca9dd-090f-477c-9cb3-bc7b346f08d6','a8b551db-a504-41c5-b38d-ad04f35addba','a4ea2c77-7443-40c8-a54b-9a2f393bc222','reservation','confirmed','2025-12-04','2025-12-07',null,'RH-BACKFILL-L15'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L15');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select 'c72752ca-555e-46e6-9410-472ea279480c','26d78c9f-1064-46d4-8c57-26c4feacd582','83a03b6d-8ae2-4388-a80f-dad2ee89743c','reservation','confirmed','2025-12-24','2025-12-28',null,'RH-BACKFILL-L16'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L16');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select 'd04bb488-769b-4b6d-9b99-76957965570c','a9976a19-272f-43cb-8c80-6885a11b274e','426ee43d-f67f-4d39-8f64-08f41c587319','reservation','confirmed','2026-01-21','2026-01-27',null,'RH-BACKFILL-L17'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L17');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '48a2fee4-b8d4-42f0-b9c8-7a2b30d91bf0','a9976a19-272f-43cb-8c80-6885a11b274e','126806e6-23df-4ddc-8c53-0e830c659975','reservation','confirmed','2026-02-14','2026-02-17',null,'RH-BACKFILL-L18'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L18');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '44769017-2b8f-456a-84b4-5a66163149b8','a9976a19-272f-43cb-8c80-6885a11b274e','3e2062f4-2c08-4790-a204-e07a7c37e79d','reservation','confirmed','2026-03-05','2026-03-08',null,'RH-BACKFILL-L19'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L19');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '55be4a2a-2e05-499c-bf05-11c7b64437cf','304e9c73-3690-4e8f-81c6-24a95459fdd4','15f38c08-a4da-4a52-9950-7373c31fdc4c','reservation','confirmed','2026-03-05','2026-03-08',null,'RH-BACKFILL-L20'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L20');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '7daa09e1-72e1-4868-adae-9d74b026f95c','a9976a19-272f-43cb-8c80-6885a11b274e','5b84280f-5702-4610-95ee-374cf52f5298','reservation','confirmed','2026-03-14','2026-03-21',null,'RH-BACKFILL-L21'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L21');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '83031702-0e1a-41aa-bbbc-962f475fc7eb','304e9c73-3690-4e8f-81c6-24a95459fdd4','b9616851-4ced-496f-b213-21d73fc7ddd3','reservation','confirmed','2026-03-15','2026-03-22',null,'RH-BACKFILL-L22'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L22');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select 'babe8ddd-649c-4ec1-ad10-12a4822c005b','73033ff2-e194-487b-9875-e709e340179c','b9616851-4ced-496f-b213-21d73fc7ddd3','reservation','confirmed','2026-03-15','2026-03-22',null,'RH-BACKFILL-L23'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L23');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '131a686a-7c69-4c22-8488-55242abefb59','60058650-64f5-4e7f-a141-6dd03f058280',null,'block','confirmed','2026-03-31','2026-04-07','zapytanie messenger, 20000 ISK/doba','RH-BACKFILL-L25'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L25');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '9c88b421-2373-4389-afad-e4dea5293726','304e9c73-3690-4e8f-81c6-24a95459fdd4',null,'block','confirmed','2026-04-23','2026-04-27','rezerwacja telefoniczna, 14000 ISK/doba','RH-BACKFILL-L30'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L30');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '086c3042-1647-4d17-9225-17765c1d9670','a9976a19-272f-43cb-8c80-6885a11b274e',null,'block','confirmed','2026-04-30','2026-05-04',null,'RH-BACKFILL-L33'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L33');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '58c3633e-848f-4ece-90ca-fae86e521ccf','304e9c73-3690-4e8f-81c6-24a95459fdd4',null,'block','confirmed','2026-05-25','2026-05-28',null,'RH-BACKFILL-L34'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L34');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '8c328c70-8c12-414e-80ec-58e46b0973cf','26d78c9f-1064-46d4-8c57-26c4feacd582',null,'block','confirmed','2026-05-25','2026-05-30','biuro podrozy, 35000 ISK/doba','RH-BACKFILL-L35'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L35');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '84e07f7e-1bcd-44bb-9f62-96b0d99f9243','a8b551db-a504-41c5-b38d-ad04f35addba','36a7e92d-af8e-4bae-b337-02b3814a5ee3','reservation','confirmed','2026-06-18','2026-06-30',null,'RH-BACKFILL-L42'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L42');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '1c20077c-975f-4309-b895-914f02294626','60058650-64f5-4e7f-a141-6dd03f058280',null,'block','confirmed','2026-07-16','2026-07-26','zapytanie e-mail, 28000 ISK/doba','RH-BACKFILL-L58'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L58');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '14f62df9-07e5-4c8c-95d9-fc0c3d1e8416','3376f68b-0075-4d29-8e00-52439c10b1a4',null,'block','confirmed','2026-08-16','2026-08-25','zapytanie messenger, 12000 ISK/doba','RH-BACKFILL-L78'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L78');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '97b61df9-2b93-4550-89e5-5a3649814e3e','60058650-64f5-4e7f-a141-6dd03f058280',null,'block','confirmed','2026-08-22','2026-08-30','klient staly, 25000 ISK/doba','RH-BACKFILL-L80'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L80');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select 'e7aea0ea-a823-4c88-b8d7-8dc0d3c56f8c','73033ff2-e194-487b-9875-e709e340179c',null,'block','confirmed','2026-09-18','2026-09-28','zapytanie e-mail, 18000 ISK/doba','RH-BACKFILL-L82'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L82');

insert into rental.bookings (id,vehicle_id,customer_id,type,status,start_at,end_at,notes,external_ref)
select '1c9ecf69-1a9b-4748-b19b-e229a1cdb19e','cd61cfa1-a55a-4bd6-9e70-56ed8924ace7',null,'block','confirmed','2026-09-19','2026-09-27','polecenie, 20000 ISK/doba','RH-BACKFILL-L83'
where not exists (select 1 from rental.bookings where external_ref = 'RH-BACKFILL-L83');
