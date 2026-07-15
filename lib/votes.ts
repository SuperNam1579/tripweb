export const REGION_OPTIONS = [
  "Northern Thailand",
  "Isaan",
  "Andaman Coast",
  "Gulf Islands",
  "Central",
] as const;

export const ACTIVITY_OPTIONS = [
  "Mountains",
  "Beach",
  "City",
  "Food",
  "Nature",
  "Culture",
] as const;

export type RegionOption = (typeof REGION_OPTIONS)[number];
export type ActivityOption = (typeof ACTIVITY_OPTIONS)[number];

export interface VoteTally {
  value: string;
  count: number;
}

/** Tally votes for one category, highest first; ties broken alphabetically. */
export function tallyVotes(values: string[], options: readonly string[]): VoteTally[] {
  const counts = new Map<string, number>(options.map((o) => [o, 0]));
  for (const v of values) {
    if (counts.has(v)) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/** The group's current leaning, or null when nobody has voted. */
export function winner(values: string[], options: readonly string[]): string | null {
  const tally = tallyVotes(values, options);
  if (tally.length === 0 || tally[0].count === 0) return null;
  return tally[0].value;
}
