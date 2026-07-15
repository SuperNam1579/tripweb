/**
 * Crewmate colours — the visual identity for every member in a trip.
 *
 * Members choose their colour at join/create time (see CrewColorPicker); it
 * is stored on Member.color and unique per trip at the DB level (so no two
 * crewmates in the same lobby ever clash). Older rows created before this
 * field existed have `color: null` — resolveCrewColor() falls back to a
 * deterministic id-derived colour for those so nothing breaks retroactively.
 */

export interface CrewColor {
  key: string;
  /** Human label, Among-Us style. */
  label: string;
  /** Fill colour. */
  body: string;
  /** Darker outline / shade colour. */
  shade: string;
}

export const CREW_PALETTE: CrewColor[] = [
  { key: "red", label: "Bloody", body: "#C51111", shade: "#6E0F0F" },
  { key: "blue", label: "Ocean", body: "#132ED1", shade: "#09158E" },
  { key: "green", label: "Leaf", body: "#117F2D", shade: "#0A4D1C" },
  { key: "pink", label: "Candy", body: "#ED54BA", shade: "#A62B7E" },
  { key: "orange", label: "Cheddar", body: "#EF7D0D", shade: "#9E5108" },
  { key: "yellow", label: "Sun", body: "#F6F657", shade: "#B0A020" },
  { key: "black", label: "Dark", body: "#3F474E", shade: "#1B1E24" },
  { key: "white", label: "Snow", body: "#D6E0F0", shade: "#8496B7" },
  { key: "purple", label: "Night", body: "#6B2FBB", shade: "#3B1D72" },
  { key: "brown", label: "Earth", body: "#71491E", shade: "#42290E" },
  { key: "cyan", label: "Lagoon", body: "#38FEDC", shade: "#1C9E9C" },
  { key: "lime", label: "Radish", body: "#50EF39", shade: "#2F9E22" },
];

export const CREW_COLOR_KEYS = CREW_PALETTE.map((c) => c.key);

/** Stable, order-independent colour for a member id — the pre-picker fallback. */
export function crewColor(id: string): CrewColor {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return CREW_PALETTE[hash % CREW_PALETTE.length];
}

/** The member's chosen colour, or a derived fallback for pre-picker rows. */
export function resolveCrewColor(member: { id: string; color?: string | null }): CrewColor {
  if (member.color) {
    const chosen = CREW_PALETTE.find((c) => c.key === member.color);
    if (chosen) return chosen;
  }
  return crewColor(member.id);
}

/**
 * Colours for an ordered roster. Members with an explicit `color` use it
 * directly (already guaranteed unique per trip by the DB). Legacy members
 * without one fall back to the id-derived colour, nudged to the next free
 * slot only among themselves so they don't collide with a chosen colour.
 */
export function crewRoster<T extends { id: string; color?: string | null }>(
  members: T[],
): (T & { crew: CrewColor })[] {
  const used = new Set<string>();
  for (const m of members) {
    if (m.color && CREW_PALETTE.some((c) => c.key === m.color)) used.add(m.color);
  }
  return members.map((m) => {
    if (m.color) {
      const chosen = CREW_PALETTE.find((c) => c.key === m.color);
      if (chosen) return { ...m, crew: chosen };
    }
    let c = crewColor(m.id);
    if (used.has(c.key)) {
      const start = CREW_PALETTE.findIndex((p) => p.key === c.key);
      for (let i = 1; i <= CREW_PALETTE.length; i++) {
        const cand = CREW_PALETTE[(start + i) % CREW_PALETTE.length];
        if (!used.has(cand.key)) {
          c = cand;
          break;
        }
      }
    }
    used.add(c.key);
    return { ...m, crew: c };
  });
}
