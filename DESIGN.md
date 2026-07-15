# TripSync — Design Direction

## The world: an Among-Us space crew planning a mission
The whole app is framed as a **crew in a lobby, working through a task list** before
launch. Trip planning becomes a co-op game: join the lobby, complete your tasks (mark
days, set budget, vote), then the crew reads out the results. Every distinctive choice
comes from that vocabulary — crewmates, task lists, "Emergency Meeting", ready-up.

## Palette (use these; do not improvise gradients)
```
--space        #0A0E1A   the void behind everything (fixed starfield background)
--line         #05070D   the hard black outline on every game surface
--panel top    #1A2640   /  --panel bottom #111A2D   panel body gradient
--inset        #223154   inner 2px ring on panels
--field        #0B1220   input background   /  --field-border #1C2740
--cyan         #38FEDC   the electric accent: links, selected days, headers, "current"
--grass        #4AC959   the primary "go" action (deep #2C8C39)
--sun          #F6F657   budget, highlights, join codes (deep #B0A020)
--danger       #E23A3A   Emergency-Meeting red, votes CTA (deep #9A1E1E)
--star  #EAF0FA · --mist #93A2BC · --fog #7D8CA6 · --dim #5E6E88   text ramp
```
Crewmate colours live in `lib/crew.ts` (12 classic Among-Us colours). A member's colour
is **derived deterministically from their id** — same crewmate everywhere, no DB column,
no privacy cost.

## Typography (must render Thai correctly)
- **Anuphan** (Google) for everything — 300–700. Interface copy is Thai; it must render
  perfectly. Numbers (dates, counts, budgets) use `tabular-nums`.
- Display sizes are big and confident, especially the results date range — that is the
  payoff screen of the whole app.

## Signature elements
1. **The chunky game button** (`.btn` + `.btn-green/cyan/dark/red`): 3px black outline,
   hard bottom shadow, presses down on `:active`. This is the tactile heart of the look.
2. **The panel** (`.panel`): dark gradient card, black outline, inset ring, hard drop
   shadow — often topped with a macOS/Among-Us "traffic-light" title bar (`.panel-bar`).
3. **The Task List** (`components/route-line.tsx` → `TaskList`): the trip flow as crew
   tasks with done / next / waiting status nodes. The one memorable progress device.
4. **The Crewmate** (`components/crewmate.tsx`): the mascot and every member's avatar.

## The results screen — the victory card
The best date window is a **glowing green "win" card** that pops in on load, with the free
crew lined up as crewmates beneath the date range set genuinely large. Runner-up windows
sit quietly below as plain panels. This screen earns the app its keep — make it the most
satisfying moment in the product.

## Space backdrop
A fixed starfield with drifting planets, twinkling stars, a shooting star, a vignette and
faint scanlines (`components/space-decor.tsx`), plus cyan HUD corner brackets. It is
purely decorative and non-interactive.

## Restraint (yes, even here)
- Green does the primary "go" work; cyan is the accent; sun/red are used sparingly for
  budget and votes. Don't add more hues than the palette above.
- **Motion is opt-in and reversible.** Bobbing crewmates, drifting planets, the results
  pop and glow — all gated behind their animation classes and **every one is disabled
  under `prefers-reduced-motion`** (see globals.css). No parallax, no scroll-jacking.
- Consistent chunky radii and the one 3-px black outline. Don't invent new border styles.
- Responsive down to 360px. The hero and two-column layouts collapse to one column.
- Visible keyboard focus (3px cyan outline). Real empty states that say what to do next.

## Copy
Plain, active, playful, in the user's vocabulary (Thai). Buttons say exactly what happens:
"สร้างห้อง", "บันทึกวันว่าง", "เข้าลอบบี้". Errors say what broke and how to fix it.

## Hard product rules (unchanged — never trade these for style)
- **Budgets are private.** Only the owner sees an individual amount; the group sees tiers
  and counts, suppressed below 3 submissions. Enforced in `lib/budget.ts` + the API layer.
- **Multiple date options, not one.** `lib/availability.ts` returns a ranked list.
- **No accounts.** Owner token (secret) vs. join code (shareable) are never conflated.
