# Trip Planner — Design Doc (v1)

## 1. High-Level Architecture

```
┌─────────────────────┐
│   Next.js Frontend   │  (App Router, Tailwind, shadcn/ui)
│  - Trip dashboard    │
│  - Calendar grid     │
│  - Budget form       │
│  - Vote (region/type)│
│  - Recommendation UI │
└──────────┬───────────┘
           │ Server Actions / API Routes
┌──────────▼───────────┐
│   Next.js Backend     │
│  - Auth (trip-code)   │
│  - Aggregation logic  │  ← median/percentile calc happens HERE, never on client
│  - Recommendation svc │
└──────────┬───────────┘
           │ Prisma ORM
┌──────────▼───────────┐        ┌────────────────────┐
│   PostgreSQL (Neon/   │        │  External APIs      │
│   Supabase)           │        │  - Google Places     │
│  - Trips, Members,    │◄──────►│  - Google Directions │
│    Availability,      │ cache  │  - Booking/Agoda     │
│    Budget, Votes,      │        │    deep-links        │
│    CachedPlaces        │        └────────────────────┘
└───────────────────────┘
```

Key principle: **raw budget numbers never leave the server.** Only aggregated values (min/median/percentile/max + counts) are sent to the frontend.

---

## 2. Prisma Schema

```prisma
model Trip {
  id           String   @id @default(cuid())
  name         String
  ownerId      String
  tripCode     String   @unique   // shareable join code
  durationDays Int                // set at creation, e.g. 3 — used to search for N-day consecutive windows
  createdAt    DateTime @default(now())

  members         Member[]
  availabilities  Availability[]
  budgets         Budget[]
  votes           Vote[]
  recommendations Recommendation[]
}

model Member {
  id        String   @id @default(cuid())
  tripId    String
  trip      Trip     @relation(fields: [tripId], references: [id])
  name      String
  role      Role     @default(MEMBER)   // OWNER sees all budgets, MEMBER doesn't
  sessionId String   @unique            // cookie-based identity, no full auth needed
  createdAt DateTime @default(now())

  availabilities Availability[]
  budget         Budget?
  votes          Vote[]
}

enum Role {
  OWNER
  MEMBER
}

model Availability {
  id       String   @id @default(cuid())
  tripId   String
  trip     Trip     @relation(fields: [tripId], references: [id])
  memberId String
  member   Member   @relation(fields: [memberId], references: [id])
  date     DateTime @db.Date
  isFree   Boolean

  @@unique([memberId, date])
}

model Budget {
  id       String   @id @default(cuid())
  tripId   String
  trip     Trip     @relation(fields: [tripId], references: [id])
  memberId String   @unique
  member   Member   @relation(fields: [memberId], references: [id])
  amount   Int      // THB, private — only queried server-side for OWNER role

  @@unique([tripId, memberId])
}

model Vote {
  id       String   @id @default(cuid())
  tripId   String
  trip     Trip     @relation(fields: [tripId], references: [id])
  memberId String
  member   Member   @relation(fields: [memberId], references: [id])
  category VoteCategory   // REGION or TYPE
  value    String         // e.g. "north", "mountain"

  @@unique([memberId, category])  // one vote per category per member
}

enum VoteCategory {
  REGION
  TYPE
}

model Recommendation {
  id           String   @id @default(cuid())
  tripId       String
  trip         Trip     @relation(fields: [tripId], references: [id])
  kind         RecKind  // ATTRACTION or LODGING
  name         String
  placeId      String?  // Google Place ID, for caching
  pricePerHead Int?
  lat          Float?
  lng          Float?
  externalUrl  String?  // Google Maps / Booking / Agoda link
  raw          Json?    // cached API response
  fetchedAt    DateTime @default(now())
}

enum RecKind {
  ATTRACTION
  LODGING
}
```

---

## 3. Core Flows

### Flow A — Create & Join Trip
1. Owner creates trip → gets `tripCode` (short, shareable e.g. `PHU-8X2`)
2. Owner is auto-added as `Member` with `role = OWNER`
3. Friends open link → enter name → server creates `Member` (`role = MEMBER`) + sets a `sessionId` cookie (no password needed, low friction)

### Flow B — Availability
1. **At trip creation**, owner sets `durationDays` (how many days the trip is meant to be — e.g. 3) — required up front so the system knows what size window to look for. Can be edited later if plans shift.
2. Member sees calendar grid → taps free/busy per date
3. Each tap = upsert into `Availability`
4. Backend aggregates: for each date, count how many members are free → heatmap (single-day view)
5. **Best consecutive-dates search** (the "ระบบอาจหา" logic):
   - Slide a window of size `durationDays` across the calendar
   - For each possible window, count members free on *all* days in that window
   - Rank windows by that count, descending
   - Return the **top 3–5 non-overlapping windows**, not just one — e.g.:
     - `12–14 Dec` → มีคนว่าง 6 คน
     - `19–21 Dec` → มีคนว่าง 5 คน
     - `2–4 Jan` → มีคนว่าง 5 คน
   - If no window has 100% overlap, still show the best partial-overlap options with counts, rather than nothing
6. Group picks one window manually from the suggested list — system suggests, doesn't auto-decide

**Schema impact**: no new table needed — just `durationDays` on `Trip`. The windowing is pure aggregation logic over existing `Availability` rows, computed server-side (e.g. a server action `getBestConsecutiveWindows(tripId)`).

### Flow C — Budget (private)
1. Member submits one `Budget.amount`
2. **Only the OWNER role** can query raw `Budget` rows
3. For everyone else (including the recommendation engine's client-facing output), the backend computes and exposes only:
   - `min`, `median`, `p75`, `max`, `count`
4. This aggregation happens in a server action — the raw array of numbers is never serialized to the client for non-owner sessions.

### Flow D — Voting (Region + Type)
1. Member picks one region (north/south/etc.) and one type (mountain/sea/etc.)
2. Backend tallies votes per category → determines winning combo (e.g. "North + Mountain")
3. Ties → show both combos, let owner (or a re-vote) break the tie

### Flow E — Recommendation Engine
1. Trigger: winning region+type combo is finalized
2. Backend calls Google Places (`textsearch` or `nearbysearch`) for that region/type → top ~10 attractions
3. For each attraction, search nearby lodging (hotel/homestay/pool villa)
4. Compute `pricePerHead = lodging price / member count`
5. Filter using the **3-tier budget filter**:
   - ✅ Everyone can afford → `pricePerHead ≤ min`
   - 🟡 Most can afford → `pricePerHead ≤ median` (or configurable percentile)
   - 🔴 Exceeds some budgets → show anyway, with "exceeds N people's budget" — **no names, just a count**
6. Results cached in `Recommendation` table (avoid repeat API calls/cost)
7. Frontend renders cards with real photos/ratings + deep link to Google Maps/Booking/Agoda

---

## 4. API Cost & Caching Notes

- Cache every Google Places result in `Recommendation.raw` (JSON) with `fetchedAt`
- Re-fetch only if `fetchedAt` is older than, say, 7 days, or if the winning vote combo changes
- This keeps you well inside free-tier limits for a friend-group-sized app

---

## 5. Suggested Build Order

1. Trip + Member + join flow
2. Availability grid + overlap heatmap
3. Budget input + private aggregation logic (get the privacy boundary right early — it's the trickiest part)
4. Voting (region/type) + tally
5. Recommendation engine + 3-tier filter
6. Polish: caching, deep links, maybe PDF export of final plan
