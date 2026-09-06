# Mountain Car Rental — Fleet & Booking Manager

**Status:** closed 2026 — reference / demo only · **Built & operated by**
[Kamil Jan](https://kamiljan.com)

The internal booking system for Mountain Car, a car rental near Keflavík airport that has since
stopped operating. It replaced RentHelp, a rented SaaS that priced per booking and could not be
changed when the business needed something different. The rental business is closed; this repo
is kept public as a working reference/demo of the codebase (no live database, no production
deploy is being operated from it — see `docs/adr/` for the decisions that shaped it).

Code-first and mobile-friendly, because most of the actual use happens standing next to a car
with a phone in one hand.

## Screens

- **Calendar** — a resource timeline of vehicles × days. Click an empty cell to create a
  booking, click a bar to open it. Reservations, blocks and servicing share one axis, so a car
  in the workshop cannot be double-booked by someone looking at a different tab
- **Bookings** — list and detail, with pricing and deposit
- **Fleet** — vehicles with insurance and inspection expiry alerts inside 30 days
- **Customers** — profiles with their contracts attached
- **Contracts** — rental agreement and handover/return protocol generated from templates, sent
  to the customer, signed by link
- **Booking links** — a public self-service form behind a one-time token, so an enquiry becomes
  a structured request instead of a WhatsApp thread
- **Requests** queue, **invoices**, **checklist** and company settings

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres only — no Supabase Auth,
see below) · Resend for transactional e-mail · deployed on Vercel. Schema history in
`supabase/migrations/`.

## Running locally

```bash
npm install
cp .env.example .env.local     # Supabase + Resend keys
npm run dev
```

`supabase/seed.sql` gives a local database with a synthetic fleet, customers and bookings.
There is deliberately no real customer data in this repo.

## Running it yourself

There is no hosted demo to click. The way to see this working is to run it, and a fresh install
starts empty — your own database, your own account, your own company on the paperwork.

1. **Database.** Create a Supabase project and apply `supabase/migrations/` in order. That gives
   you the schema and the constraints, and nothing else — no vehicles, no customers, no bookings.
   `supabase/seed.sql` is optional and only for a throwaway local database: it drops and recreates
   the `rental` schema and fills it with obviously fake data, so never point it at anything you
   care about.
2. **Account.** There is no sign-up form and no user table. You are the only account, and you
   define it in `.env.local`: `APP_USER`, `APP_PASSWORD` and a random `APP_AUTH_SECRET`. Set
   `NEXT_PUBLIC_GOOGLE_CLIENT_ID` as well and you can sign in with Google, restricted to that same
   address. Changing the password means changing the environment variable and redeploying —
   deliberate, because a rental office has one operator, not a directory of users.
3. **Your company.** Everything the customer sees — the rental agreement, the invoice, e-mails,
   the public booking page, the panel header — reads from `src/lib/company.ts`. Replace the
   profiles there with your own; it is the only file with a company name, kennitala or address in
   it, and a test fails the build if those details start spreading back into components.
4. **E-mail.** Optional. Without `RESEND_API_KEY` the app skips sending and keeps working; with it,
   `EMAIL_FROM` has to be a domain you verified in Resend.

```bash
npm run lint
npm run build
npx tsc --noEmit
```

## Data integrity

Two rules the database enforces rather than trusting the UI:

- **No overlapping bookings** — a Postgres exclusion constraint (`bookings_no_overlap`) makes a
  double booking impossible, not merely unlikely
- **Contract numbers are globally unique**, and signing tokens are single-use

Rental days are counted by date difference without an off-by-one bump, and VAT defaults to 0%
— both were real billing bugs found against live data, not hypotheticals.

## How security is handled

- **No customer data in the repo.** Seed and fixture data is synthetic; production data lives
  only in the database and in backups.
- **No secrets in the repo.** Production values live in Vercel's environment settings; the
  Resend key is used server-side only.
- **The app's own session gates every request**, not Postgres RLS — the server holds a
  `service_role` key that bypasses RLS by design, so authorisation happens in
  `requireSession()` before any database call (see `docs/adr/0001-supabase-service-role-app-gated.md`).
  The `anon` role has no table access at all.
- **CI gates every push** — build, lint, typecheck, Semgrep static analysis and a Gitleaks
  secret scan; a pre-commit hook blocks credential-shaped strings.
- **This repository is public.** The business it ran is closed, real customer data was removed
  from the history before making it public, and nothing in it points at a live database or a
  running deployment.

## Licence

Proprietary. All rights reserved.
