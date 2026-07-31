-- Autorytatywny backstop bazy przeciw podwójnej rezerwacji (uzupełnia miękki hasOverlap w db.ts,
-- który przy współbieżności/dwóch adminach może przepuścić wyścig).
--
-- Semantyka [) (half-open): end to dzień ZWROTU i jest granicą WYKLUCZAJĄCĄ, więc zmiana tego
-- samego dnia (auto wraca dnia X, kolejny klient odbiera dnia X) NIE jest konfliktem — dokładnie
-- tak jak działa teraz hasOverlap w aplikacji. Dzięki temu DB i app zgadzają się na styku dat.
--
-- ⚠️ UWAGA OPERATORA: ten constraint zakłada, że w rental.bookings NIE ma już nakładających się
-- niean­ulowanych wierszy (per pojazd) OD 2026 ROKU. Jeśli takie istnieją, ALTER ... ADD CONSTRAINT padnie.
--
-- Podłoga 2026-01-01: importowana HISTORIA (2024/2025) zawiera artefakt backfillu
-- (Pajero Silver, lipiec 2024: L3 × L4) — zamiast modyfikować historyczne dane,
-- egzekwujemy constraint tylko dla ery „żywej" (2026+). Wszystkie przyszłe rezerwacje
-- i tak są >= 2026, więc ochrona na przód jest pełna.
--
-- start_at/end_at są typu timestamptz (daty zapisywane jako północ UTC; Islandia = UTC),
-- więc rzutujemy je na kalendarzową datę przez (… AT TIME ZONE 'UTC')::date — wyrażenie immutable,
-- wymagane w indeksie/constraincie.

-- btree_gist daje operator '=' na uuid (vehicle_id) wewnątrz indeksu GiST. Bez tego EXCLUDE padnie.
create extension if not exists btree_gist;

-- Idempotentnie: ADD CONSTRAINT nie wspiera IF NOT EXISTS, więc sprawdzamy pg_constraint.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'bookings_no_overlap'
      and conrelid = 'rental.bookings'::regclass
  ) then
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
      where (status <> 'cancelled' and start_at >= '2026-01-01');
  end if;
end $$;
