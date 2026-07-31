# Mountain Car Rental — Rental Manager

Wewnętrzny system rezerwacji floty (zamiennik RentHelp). Code-first, mobile-friendly.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres + Auth) · deploy Vercel.

## Ekrany
- **Kalendarz** — resource-timeline 13 aut × dni (klik komórki = nowa rezerwacja, klik paska = szczegóły)
- **Rezerwacje** — rezerwacje, blokady i serwis w jednej osi
- **Flota** — 13 aut z alertami OC / przeglądu (< 30 dni)
- **Klienci** — lista + profil klienta z podpiętymi umowami
- **Kontrakt** — szablony (umowa najmu, protokół wydania/zwrotu) → wyślij do klienta
- **Ustawienia** — dane firmy do umów

## Uruchomienie lokalne
```bash
npm install
npm run dev
```
Aplikacja działa od razu na danych demonstracyjnych (`src/lib/data.ts`) — bez bazy.

## Krok 2 — podłączenie Supabase (trwałość danych)
1. Utwórz projekt na [supabase.com](https://supabase.com).
2. Skopiuj klucze do `.env.local` (wzór: `.env.example`).
3. Uruchom migrację `supabase/migrations/0001_init.sql` (SQL editor lub `supabase db push`).
4. Zamień warstwę danych z seed na zapytania Supabase, zaimportuj dane z RentHelp.

## Deploy (Vercel)
Połącz repo w Vercel (auto-detekcja Next.js). Dodaj zmienne środowiskowe z `.env.example`.

Architektura i decyzje: Obsidian → `Projects/Mountain Car Rental App`.
