@AGENTS.md

# TripSync — Project Spec

Group trip-planning web app for a friend group. Removes the friction of coordinating
"who's free / what's the budget / where do we go" in an endless group chat.

## Stack (non-negotiable)
- Next.js (App Router, TypeScript)
- Prisma ORM
- PostgreSQL (Neon or Supabase — connection string in env)
- Tailwind CSS
- Deployed on Vercel
- Google Places API + Directions API (MOCKED for now, behind an adapter — see Places module)

## Core principles
1. **No accounts.** Nobody signs up. Owner gets a secret token; members get a join code.
2. **Budgets are private.** Only the owner ever sees an individual amount. Everyone else
   sees aggregate tiers only. This is a hard rule — treat any leak as a bug.
3. **Multiple date options, not one.** The availability engine returns a ranked list of
   date ranges, never a single "best day".
4. Mobile-first. Most members open this from a link in a group chat, on a phone.

## Roles & sessions
- **Owner**: long, cryptographically random `ownerToken` (32+ bytes, base64url). Stored in
  an httpOnly cookie AND shown once as a private owner link to bookmark. No email/password.
  Anyone holding this token sees private budget data — treat it like a password.
- **Member**: joins via a short `joinCode` (6–8 chars, human-readable, no ambiguous
  characters like 0/O/1/l). Enters a display name only. Gets a `memberToken` in a cookie.
- Two link types, never conflated:
  - Join link  → `/join/{joinCode}`        (safe to paste in the group chat)
  - Owner link → `/trip/{tripId}?owner={ownerToken}` (secret, never rendered in shared views)

## Data model (Prisma)
See `prisma/schema.prisma` — Trip, Member, Availability, Budget, Vote,
enums TripStatus { PLANNING, DECIDED, ARCHIVED } and VoteCategory { REGION, ACTIVITY }.

## The sliding-window availability algorithm (core logic — get this right)

Input: all Availability rows for a trip, trip.durationDays, trip.windowStart..windowEnd.

For EVERY possible run of `durationDays` consecutive dates inside the window:
  - a member "covers" that window only if they are marked free on EVERY day of it
  - score = number of members who fully cover the window
Then:
  - sort windows by score desc, then by earliest start date
  - greedily select the top 3–5 **non-overlapping** windows
  - for each returned window include: startDate, endDate, freeCount, totalMembers,
    freeMemberNames[], missingMemberNames[]

Rules:
- Availability is NOT private — it is fine to show who is free and who is not.
- If no window has full coverage, still return the best-scoring ones. Never return empty
  when data exists.
- Unmarked days count as NOT free (explicit opt-in only).
- Pure function, no DB calls inside. Put it in `lib/availability.ts` and unit-test it.

## The budget privacy rules (core logic — get this right)

- `median(budgets)` is the DEFAULT filter threshold for recommendations.
  Minimum was considered and rejected: too restrictive.
- Group-facing budget signal for a given price P is one of three tiers:
    EVERYONE_AFFORDS  → 0 members have budget < P
    MOST_AFFORD       → a minority of members have budget < P
    OVER_SOME_BUDGETS → otherwise; expose only a COUNT of members over, never names
- **Suppression rule:** if fewer than 3 members have submitted a budget, return
  `INSUFFICIENT_DATA` and render nothing — with 1–2 entries the tiers leak individual
  amounts by inference.
- Only the owner endpoint may return individual `amount` values. Every other endpoint
  returns tiers/counts only. Enforce this at the API layer, not just in the UI.
- Put this in `lib/budget.ts` as pure functions and unit-test it.

## Places module (mocked, swappable)
- `lib/places/` exposes ONE interface, e.g. `searchPlaces(region, activity, opts)`.
- Return shape matches Google Places exactly: { placeId, name, photoUrl, rating,
  priceLevel, address, types[] }.
- Current implementation: `mockProvider.ts` with realistic Thai place data.
- Real implementation goes in `googleProvider.ts` later — swapping providers must require
  ZERO changes in any UI component. No Places types leaking into components.

## Voting
- REGION options: Northern Thailand, Isaan, Andaman Coast, Gulf Islands, Central
- ACTIVITY options: Mountains, Beach, City, Food, Nature, Culture
- One vote per member per category (upsert on re-vote).

## Design direction
See DESIGN.md. Do not ship the default AI-app look.

## Conventions
- Server Components by default; Client Components only where interactivity requires it.
- All mutations via Server Actions or route handlers — never trust client-supplied
  tokens without re-verifying against the DB.
- Zod for all input validation at the boundary.
- Vitest for unit tests on lib/availability.ts and lib/budget.ts.
