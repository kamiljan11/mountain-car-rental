# Quality backlog — known, deliberately deferred

<!-- PG v3 github-ready pass, 2026-09-05. Not fixed in chore/pg-v3-github-ready: either needs its
own PR with pg-review, needs a decision only Kamil can make, or the finding tool doesn't know
this app's shape. Nothing here is a secret or a live exploit — see each item for why. -->

## SQL — `sql-migration-lint.js --min-severity high` (6 findings)

Ran against `supabase/migrations/*.sql` (17 files). Findings and disposition below —
none fixed in this PR (migrations to a closed, no-longer-deployed product are not touched
here; see `README.md` status).

| # | File:line | Finding | Disposition |
|---|---|---|---|
| 1 | `0001_init.sql:8` | `GRANT ... TO anon` on all tables (default privileges) | **Superseded, not live.** `20260702170000_lock_down_rls.sql` revokes all `anon` access on every existing table, and every table added after it (`booking_links`, `customer_checklists`, `invoices`) carries its own `revoke ... from anon` at creation. The linter checks each statement independently and doesn't simulate migration order, so it flags the original (already-reverted) grant. See `docs/adr/0001-supabase-service-role-app-gated.md`. |
| 2 | `0001_init.sql:42` | `rental.bookings` has a customer FK, no `org_id`/same-org trigger | **Not applicable by design.** This check is the mas-warsztat multi-tenant IDOR pattern (one Postgres project shared by several orgs). This app is explicitly single-tenant — one operator, one Supabase project (`docs/ARCHITECTURE.md`) — there is no second org to leak data to. The real authorization boundary is `requireSession()` in `src/lib/db.ts` (ADR-0001), not a tenant column. |
| 3 | `0001_init.sql:68` | same check, `rental.contracts` | Same disposition as #2. |
| 4 | `20260702100554_customer_profile.sql:13` | same check, `rental.customer_documents` | Same disposition as #2. |
| 5 | `20260710190000_customer_checklist.sql:4` | same check, `rental.customer_checklists` | Same disposition as #2. |
| 6 | `20260721160000_invoices.sql:5` | same check, `rental.invoices` | Same disposition as #2. |

If this app is ever re-opened as multi-tenant (several rental businesses sharing one project),
findings #2–6 become real and must be fixed with an `org_id` column + `same_org` trigger before
onboarding a second tenant — do not reuse a single-tenant Supabase project across customers
without that.

## Large files (`fleet-metrics.js`: 3 files over 1000 lines)

Not split in this PR — splitting is a refactor, not a github-ready doc/CI pass, and each of
these is exercised by the app daily with no open correctness bug. Plan for a future, dedicated
PR:

| File | Lines | Split plan |
|---|---|---|
| `src/lib/db.ts` | 1558 | Split by entity along existing section comments: `db/vehicles.ts`, `db/customers.ts`, `db/bookings.ts`, `db/contracts.ts`, `db/invoices.ts`, `db/booking-links.ts`, keeping the `toX` row-mapper next to its entity. `hasOverlap` moves with `bookings`. Re-export from `db.ts` (or update the ~15 call sites) in the same PR. |
| `src/lib/data.ts` | 1137 | Synthetic seed data only (dev-mode fallback, never used in production — see `docs/ARCHITECTURE.md`). Split into `data/vehicles.ts`, `data/customers.ts`, `data/bookings.ts` purely for readability; zero behavioural risk since it's static fixtures. Lowest priority of the three. |
| `src/components/Timeline.tsx` | 1077 | The calendar resource-timeline view. Extract the drag/resize interaction logic (mouse/touch handlers) into a `useTimelineDrag` hook and the per-cell rendering into a `TimelineRow` component before touching the 883-line `NewReservationWizard.tsx` next to it (same pattern, second-largest component). |

## Scorer false positive (not a repo issue)

`repo-readiness.js` R8 flagged `.env.example` as "looks like a real value after =" (2/5).
Verified: every sensitive variable in `.env.example` is empty (`SUPABASE_SERVICE_ROLE_KEY=`,
etc.) — the check's regex (`/=\s*[A-Za-z0-9_-]{16,}/`) matches across the line break onto the
*next* variable's name when a value is empty and lines end in `\r\n`. Flagged separately as a
fleet-tooling fix (not this repo's content); see task spawned from this session.

## E2E smoke test is scaffolded but not wired up

`e2e/smoke.spec.ts` (dropped by the quality bootstrap template) imports `@playwright/test`,
which is not a dependency of this repo, and there is no `playwright.config.ts` — so
`.github/workflows/quality.yml`'s `e2e` job already skips itself (`if: hashFiles(...) != ''`).
It was, however, breaking `npm test` (vitest picked it up by filename and failed the whole run
on the missing package) — fixed with `vitest.config.ts` excluding `e2e/**`, so unit tests
(vitest) and e2e (Playwright, once someone adds it) stay on separate runners. Wiring up real
Playwright e2e is a separate, deliberate task (add `@playwright/test` + `playwright.config.ts`),
not done here.

## Product/security gap referenced from `docs/ARCHITECTURE.md`

No manual revoke endpoint for a leaked public link (`/book/[token]`, `/sign/[token]`) — verified
against `src/lib/db.ts`: booking links and signing tokens only expire on their own (60 minutes,
14 days respectively; `src/lib/db.ts:1282`, `:1508`, `:707`), there is no `revokeBookingLink`/
equivalent. Low severity in practice (short-lived tokens, single-tenant app, no live traffic on
a closed product) but worth a real fix — add a `status: "revoked"` transition plus a
`requireSession()`-gated action — before this app is ever pointed at a live database again.

## Commits (R12 — conventional commit ratio)

Historical commits on `main` predate the conventional-commits convention adopted under PG v3
(2026-09-05); rewriting published history is explicitly out of scope for `chore/pg-v3-github-ready`
(`pg/github-ready.md`, "Czego NIE robic"). All new commits in this PR follow `type(scope): ...`;
the ratio improves naturally as old commits age out of the trailing-20 window the scorer reads.
