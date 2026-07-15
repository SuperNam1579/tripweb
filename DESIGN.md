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
