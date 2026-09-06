# ADR-0001 — Supabase service-role client, gated by the app, not by RLS

Date: 2026-07-02 (security fix) / documented 2026-09-05 | Status: accepted

**Context:** Single admin (one trusted user, optional Google login) needs full read/write on
one Supabase project — there is no second tenant to isolate from. The first cut relied on
Supabase RLS policies open to the `anon`/`authenticated` roles reachable from the browser
anon key. An architecture audit on 2026-07-02 found `customers`, `bookings`, `vehicles`,
`contracts` and `settings` readable and writable by anyone holding the public anon key, with
no login required (see `CHANGELOG.md`, 2026-07-02 "Security fix").

**Decision:** One `service_role` Supabase client (`src/lib/supabase-admin.ts`), imported
`server-only`, used exclusively from `src/lib/db.ts`. Every exported function in `db.ts` calls
`requireSession()` first — the authorization boundary is the app's own session cookie
(`src/lib/auth.ts`, HMAC-signed, verified in `proxy.ts`), not a Postgres RLS policy. `anon` was
revoked table-by-table (`supabase/migrations/20260702170000_lock_down_rls.sql` onward). The two
routes that must work without a login — `/api/book/[token]`, `/api/sign/[token]` — go through
separate modules (`book-public.ts`, `sign-public.ts`) that never call `requireSession()` but are
scoped to exactly one row by an unguessable, expiring token from the URL.

**Rejected alternative:** Supabase Auth sessions + per-row RLS policies (the "normal" Supabase
pattern). Rejected because there is only one legitimate user — RLS keyed on `auth.uid()` would
add a second, parallel authorization system to keep in sync with the app's own session for no
isolation benefit, and would not by itself protect the two intentionally-public token routes.

**Consequences:** `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS entirely — a bug in `requireSession()`
or a new `db.ts` export that forgets to call it is a full data exposure, not a partial one. There
is no defense in depth from Postgres once a request reaches `db.ts`; the defense in depth that
does exist is at the network edge (`anon` revoked) and the two public modules being physically
separate files from the authenticated ones.

**Traps for a future maintainer:** Never give `SUPABASE_SERVICE_ROLE_KEY` a `NEXT_PUBLIC_`
prefix — it would ship to every browser. Any new function added to `db.ts` must start with
`await requireSession()` (there is no lint rule enforcing this, only convention and review).
