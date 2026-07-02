-- Domyka lukę z audytu (docs/architecture-audit-2026-07-02.md, Finding 1):
-- polityki "public" na vehicles/customers/bookings/contracts/settings dawały
-- pełny odczyt+zapis roli `anon` — czyli każdemu, kto ma publiczny anon key
-- (a jest on jawny w każdym załadowaniu strony), bez żadnego logowania.
--
-- Apka od teraz łączy się z bazą wyłącznie po stronie serwera kluczem
-- service_role (który i tak omija RLS), za bramką requireSession() w db.ts.
-- Poniżej: cofamy dostęp anon całkowicie i domykamy RLS do `authenticated`,
-- jako obronę w głąb — nawet gdyby anon key kiedyś znów wyciekł do klienta.

revoke all on all tables in schema rental from anon;

drop policy if exists "public" on rental.vehicles;
drop policy if exists "public" on rental.customers;
drop policy if exists "public" on rental.bookings;
drop policy if exists "public" on rental.contracts;
drop policy if exists "public" on rental.settings;

create policy "auth full" on rental.vehicles  for all to authenticated using (true) with check (true);
create policy "auth full" on rental.customers for all to authenticated using (true) with check (true);
create policy "auth full" on rental.bookings  for all to authenticated using (true) with check (true);
create policy "auth full" on rental.contracts for all to authenticated using (true) with check (true);
create policy "auth full" on rental.settings  for all to authenticated using (true) with check (true);
