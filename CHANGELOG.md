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
