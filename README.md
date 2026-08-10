# Mountain Car Rental — Fleet & Booking Manager

**Status:** production, internal · **Built & operated by** [Kamil Jan](https://kamiljan.com)

The internal booking system for [Mountain Car](https://mountaincar.is), a car rental near
Keflavík airport. It replaced RentHelp, a rented SaaS that priced per booking and could not be
changed when the business needed something different.

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

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres + Auth) · Resend for
transactional e-mail · deployed on Vercel. Schema history in `supabase/migrations/`.

## Running locally

```bash
npm install
cp .env.example .env.local     # Supabase + Resend keys
npm run dev
```

`supabase/seed.sql` gives a local database with a synthetic fleet, customers and bookings.
There is deliberately no real customer data in this repo.

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
- **Row Level Security** in Postgres is the authorisation boundary.
- **CI gates every push** — build, lint, typecheck, Semgrep static analysis and a Gitleaks
  secret scan; a pre-commit hook blocks credential-shaped strings.
- **This repository is private**, because it contains the operating logic of a live business.

## Licence

Proprietary. All rights reserved.
