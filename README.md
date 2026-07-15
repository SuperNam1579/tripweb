# TripSync

Group trip-planning for a friend group — one link in the group chat instead of
three hundred messages. Members mark the days they're free, set a **private**
budget, and vote on region + vibe; TripSync ranks the date windows that
actually work and suggests places to match.

No accounts: the owner gets a secret link, everyone else joins with a short code.

## Stack

Next.js (App Router, TypeScript) · Prisma · PostgreSQL · Tailwind CSS · Vercel.
Google Places is mocked behind `lib/places/` — swapping in the real
`googleProvider` later requires zero UI changes.

## Local development

```bash
npm install
cp .env.example .env          # then fill in DATABASE_URL

# Easiest local DB — Prisma's bundled Postgres:
npx prisma dev                # prints a prisma+postgres:// URL for .env, keep it running

npx prisma db push            # create tables (use db:migrate against a real Postgres)
npm run db:seed               # demo trip with 5 members (prints join + owner links)
npm run dev                   # http://localhost:3000
```

Run the unit tests (availability engine, budget privacy, token generation):

```bash
npm test
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. Local: the `prisma+postgres://` URL from `npx prisma dev`. Production: a Neon/Supabase `postgres://` URL (pooled). |
| `GOOGLE_PLACES_API_KEY` | Reserved for the real Places provider. Unused while the mock provider is active. |

## Deploying to Vercel

1. Create a Postgres database (Neon or Supabase) and copy the pooled connection string.
2. `vercel` → set `DATABASE_URL` in Project Settings → Environment Variables.
3. Run migrations against production: `DATABASE_URL=... npx prisma migrate deploy`.
4. Deploy. `npm run build` runs `prisma generate` automatically.

## The two links (never conflate them)

- **Join link** `/join/{code}` — safe to paste in the group chat.
- **Owner link** `/trip/{id}?owner={token}` — the only way into the owner view
  (individual budgets). Shown once at creation; treat it like a password.

## Privacy model

Individual budget amounts are returned **only** on the owner-verified path.
Every group-facing surface gets aggregate tiers/counts from `lib/budget.ts`,
and below 3 submitted budgets all signal is suppressed (`INSUFFICIENT_DATA`)
so nobody's number can be inferred. Enforced at the data layer and covered by
unit tests.
