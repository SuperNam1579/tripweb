# TripSync — Build Prompt for Claude Code (VS Code)

**วิธีใช้:** เปิดโฟลเดอร์เปล่าใน VS Code → เปิด Claude Code → วาง Phase 0 ก่อน แล้วค่อยไล่ทีละ Phase (อย่าวางทั้งไฟล์รวดเดียว มันจะทำพลาดเยอะ)

**แนะนำ:** เอา "PROJECT SPEC" ทั้งก้อนไปเซฟเป็นไฟล์ `CLAUDE.md` ที่ root ของโปรเจกต์ก่อน — Claude Code จะอ่านไฟล์นี้อัตโนมัติทุกครั้ง ทำให้ไม่ต้อง re-explain สเปคซ้ำ ๆ ทุก session

---

# ═══════════════════════════════
# ส่วนที่ 1: CLAUDE.md (เซฟไว้ที่ root)
# ═══════════════════════════════

```markdown
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

model Trip {
  id           String   @id @default(cuid())
  name         String
  ownerToken   String   @unique
  joinCode     String   @unique
  durationDays Int                 // length of the trip, set at creation
  windowStart  DateTime            // earliest date to consider
  windowEnd    DateTime            // latest date to consider
  status       TripStatus @default(PLANNING)
  createdAt    DateTime @default(now())
  members      Member[]
  availability Availability[]
  budgets      Budget[]
  votes        Vote[]
}

model Member {
  id           String   @id @default(cuid())
  tripId       String
  displayName  String
  memberToken  String   @unique
  joinedAt     DateTime @default(now())
  trip         Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  availability Availability[]
  budget       Budget?
  votes        Vote[]
  @@index([tripId])
}

model Availability {
  id       String   @id @default(cuid())
  tripId   String
  memberId String
  date     DateTime @db.Date
  isFree   Boolean
  @@unique([memberId, date])
  @@index([tripId, date])
}

model Budget {
  id       String @id @default(cuid())
  tripId   String
  memberId String @unique   // one budget per member
  amount   Int              // THB, integer
}

model Vote {
  id       String       @id @default(cuid())
  tripId   String
  memberId String
  category VoteCategory // REGION | ACTIVITY
  value    String
  @@unique([memberId, category])
  @@index([tripId, category])
}

enum TripStatus { PLANNING, DECIDED, ARCHIVED }
enum VoteCategory { REGION, ACTIVITY }

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
```

---

# ═══════════════════════════════
# ส่วนที่ 2: DESIGN.md (เซฟไว้ที่ root ด้วย)
# ═══════════════════════════════

```markdown
# TripSync — Design Direction

## Do NOT ship the default AI look
Explicitly avoid: cream background + big serif + terracotta accent; the generic SaaS
dashboard with pastel cards and a purple-blue gradient; a centered hero with a big number
and three icon-topped feature cards; Inter or Poppins as the entire type system.
Those are defaults, not decisions.

## Ground the design in the subject
The app's world is the trip itself: routes, distances, dates, seat counts, ticket stubs,
road signage, topographic maps. Every distinctive choice should come from that vocabulary.

## Palette (use these, do not improvise gradients)
--ink     #0E1E1A   text, deep surfaces
--pine    #14312B   primary brand surface, nav
--paper   #F6F3ED   background
--signal  #E8A33D   the ONE loud accent: selected dates, primary action, the winning option
--teal    #3E7A6E   secondary, quiet affirmatives
--slate   #8C948F   muted labels, disabled states

## Typography (must render Thai correctly — no system-font fallback)
- Display: Archivo (wide/expanded weights, tight tracking, set genuinely big)
- Body:    IBM Plex Sans + IBM Plex Sans Thai
- Data:    IBM Plex Mono — dates, counts, join codes, THB figures. Numbers should read
           as data, not prose.
Set a real type scale. The display face should be confident and large on the date-range
results — that is the payoff screen of the entire app.

## Signature element — the route line
A dashed route line (a map path / transit line) threads vertically through the trip flow,
with each stage — join, availability, budget, votes, results — as a stop node on it.
Members see how far along the group is at a glance. This is the one memorable device;
everything around it stays quiet and disciplined.

## The results screen — ticket stubs
The top 3–5 date windows render as perforated ticket-stub cards:
- date range set large in the display face
- "N of M free" set in mono, like a seat count
- a torn/perforated edge
- the best window gets --signal; the rest stay quiet
This is where the app earns its keep. Make it the most beautiful screen in the product.

## Restraint
- One accent colour does the loud work. Everything else is muted.
- Motion: ONE orchestrated reveal when results compute (stubs settling into place).
  No scattered hover effects, no parallax. Respect prefers-reduced-motion.
- Consistent, modest border-radius. No glassmorphism, no drop-shadow soup.
- Responsive down to 360px.
- Visible keyboard focus. Real empty states that say what to do next, not "No data".

## Copy
Plain and active, in the user's vocabulary. "Mark the days you're free", not "Configure
availability". Buttons say exactly what happens: "Share join link", "Save my budget",
"Show the best dates". Errors say what broke and how to fix it.
Interface language: English. Thai text (names, trip names, places) must render perfectly.
```

---

# ═══════════════════════════════
# ส่วนที่ 3: Prompt ไล่ทีละ Phase
# ═══════════════════════════════

## Phase 0 — Scaffold

```
Read CLAUDE.md and DESIGN.md first.

Scaffold the project:
- Next.js App Router + TypeScript + Tailwind
- Prisma with the PostgreSQL schema exactly as specified in CLAUDE.md
- .env.example with DATABASE_URL, and a placeholder GOOGLE_PLACES_API_KEY (unused for now)
- Vitest configured for unit tests
- Tailwind theme wired to the DESIGN.md palette as CSS variables, and the three fonts
  loaded via next/font (Archivo, IBM Plex Sans + Sans Thai, IBM Plex Mono)
- A base layout with the route-line signature element as a reusable component
- Fold DESIGN.md's rules into the Tailwind config where they belong (colors, fontFamily,
  radius scale) so the constraints are enforced by the system, not by memory

Do NOT build any features yet. Show me the folder structure and the schema when done.
```

## Phase 1 — Trip creation, join, sessions

```
Implement Feature A per CLAUDE.md:
- Create-trip page: name, durationDays, candidate date window (start/end)
- On create: generate a cryptographically random ownerToken and a human-readable joinCode
  (no ambiguous chars), set an httpOnly owner cookie, and show the owner link ONCE with a
  clear warning to save it — it is the only way back in
- Join page at /join/{joinCode}: enter a display name → create Member, set memberToken
  cookie → land straight in the trip
- Owner dashboard: list members and a per-member completion status
  (availability ✓ / budget ✓ / votes ✓)
- Auth helpers: getOwner(request), getMember(request) that re-verify tokens against the DB
  on every call. Never trust a client-supplied token.
- Zod validation on every input.

Write tests for token generation and the joinCode alphabet.
```

## Phase 2 — Availability + the sliding window (the important one)

```
Implement Feature B per CLAUDE.md.

Start with lib/availability.ts as a PURE function with no DB access, then unit-test it
BEFORE touching any UI. Test cases must include:
- everyone free everywhere
- nobody fully covers any window (must still return best-effort options, not empty)
- ties broken by earliest start date
- non-overlapping selection actually excludes overlaps
- unmarked days count as NOT free
- durationDays = 1, and durationDays equal to the entire window length

Then build:
- The member calendar UI (mark days free/busy, mobile-first, tap-and-drag to select a run)
- The results screen: top 3–5 ranked ranges as the ticket-stub cards described in
  DESIGN.md, best window in --signal, "N of M free" in mono, and the missing names listed.

Make the results screen the best-looking thing in the app.
```

## Phase 3 — Budget privacy

```
Implement Feature C per CLAUDE.md.

lib/budget.ts as pure functions first, with unit tests covering:
- median with even and odd member counts
- each of the three tiers at boundary conditions
- the INSUFFICIENT_DATA suppression rule below 3 submitted budgets
- that no code path can return an individual amount to a non-owner

Then:
- Private budget entry form for members (THB)
- Group-facing tier display: label + count only. Never names, never figures.
- Owner-only view showing exact individual amounts, gated on the owner token verified
  server-side.

Enforce the privacy rule at the API layer — write a test that hits the member-facing
endpoint and asserts the response body contains no raw amounts.
```

## Phase 4 — Voting

```
Implement Feature D per CLAUDE.md. Region and activity votes, one per member per category,
upsert on re-vote. Show the group's leaning, not a raw poll dump.
```

## Phase 5 — Recommendations

```
Implement Feature E per CLAUDE.md.

Build lib/places/ with a provider interface and a mockProvider returning realistic Thai
place data in the exact Google Places response shape. No Places types may leak into any
UI component — the swap to a real googleProvider later must require zero component changes.

Recommendations = winning region + winning activity + median budget threshold.
Each place card carries its budget tier badge from lib/budget.ts. Never a raw price
comparison against any individual's number.
```

## Phase 6 — Deploy

```
Prepare for deployment:
- Neon (or Supabase) Postgres connection, migrations run
- Vercel config, env vars documented in README
- A seed script that creates a demo trip with 5 members so I can see the full flow
```
