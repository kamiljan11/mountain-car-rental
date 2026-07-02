# Changelog

## 2026-07-02
- Login: 365-day sessions, Sign in with Google (restricted to the one admin account).
- PWA: installable on Android/desktop (manifest, icons, service worker, install button).
- Bookings: working "Nowa rezerwacja" button on the list page.
- New Dashboard page: today's pickups/returns, bookings needing confirmation, next 7 days, month stats.
- Fleet: per-vehicle monthly utilization rings.
- Customers: company/individual profile split, notes, ID documents, suspect flag, edit/delete, reservation filter link.
- Contracts: company-vs-individual template block, identity-document lookup from real records, missing-data warning before sending, deep-linkable from a booking's "Podgląd umowy".
- Mobile optimization pass: touch targets, input types/autocomplete across forms.
- Code health pass: fixed a price-input bug (decimal entry was silently stripped), an open-redirect in the post-login redirect, two silent-failure UI bugs (contract send / document upload showing success when the save failed), and a stale-data race when switching customers on the contracts page.
- Mobile: fixed landscape phones incorrectly getting the desktop layout, condensed the mobile calendar further to fit more on one screen.
- Editing: bookings and vehicles can now be edited from the calendar, the bookings list, and the fleet list (not just created once).
- Sorting: bookings, fleet, and customers tables all support click-to-sort columns.
- Visual polish: toast notifications (replacing inline error banners), a top loading bar during initial data fetch, native View Transitions between pages — all respecting `prefers-reduced-motion`.
- Applied `20260702100554_customer_profile.sql` to production (company fields, `is_suspect`, `customer_documents` table + RLS) via the Supabase Management API.
- Bookings: added a month filter (prev/next nav, defaults to all months), combinable with the existing customer filter. Fixed a stale-closure bug in the shared `useSort` hook found while testing it (rapid clicks could drop a sort-direction toggle).
- **Security fix:** an architecture audit found that `customers`, `bookings`, `vehicles`, `contracts`, and `settings` had RLS policies open to the public `anon` role — anyone with the (publicly-shipped) anon key could read and write all of it with no login. Fixed by moving all Supabase access server-side (new `src/lib/actions.ts` + `src/lib/supabase-admin.ts`, `db.ts` now `server-only` and gated by a real session check on every call), then locking RLS back to `authenticated`-only. `proxy.ts` also now redirects unauthenticated visits to any page to `/login` (previously nothing enforced this). Verified end-to-end against the live database before and after. Vercel prod env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) added and deployed; dead `NEXT_PUBLIC_SUPABASE_*` vars removed; confirmed `APP_AUTH_SECRET` was already set in prod. Full writeup: `docs/architecture-audit-2026-07-02.md`.
- **Reliability fix:** a quality-gate pass on the security refactor found that failed writes (a booking/customer/vehicle save or delete hitting a real DB error, e.g. a row deleted by someone else moments earlier) were either silently reported as fake successes or left the optimistic UI update in place with no rollback — meaning the screen could show a save that never actually happened. All mutation paths in `DataProvider.tsx` now roll back the optimistic change and show an error toast on failure, and the wizard/modals only proceed to their "done" state when the save genuinely succeeded. Verified against a real deleted-out-from-under-you row: correctly rolled back with no ghost data after reload.
