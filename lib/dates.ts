/**
 * All trip dates are date-only values. To keep them timezone-proof they are
 * handled as "date keys" (YYYY-MM-DD strings) everywhere outside the DB, and
 * stored as UTC-midnight DateTimes in Postgres (@db.Date column).
 */

export const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function fromDateKey(key: string): Date {
  if (!DATE_KEY_RE.test(key)) throw new Error(`Invalid date key: ${key}`);
  return new Date(`${key}T00:00:00.000Z`);
}

export function addDays(key: string, days: number): string {
  const d = fromDateKey(key);
  d.setUTCDate(d.getUTCDate() + days);
  return toDateKey(d);
}

/** Inclusive list of date keys from start to end. */
export function eachDay(startKey: string, endKey: string): string[] {
  const out: string[] = [];
  for (let k = startKey; k <= endKey; k = addDays(k, 1)) out.push(k);
  return out;
}

/** Number of days from a to b, inclusive of both. */
export function daySpan(startKey: string, endKey: string): number {
  const ms = fromDateKey(endKey).getTime() - fromDateKey(startKey).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "Fri 14 Aug" */
export function formatShort(key: string): string {
  const d = fromDateKey(key);
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** "14–17 Aug" or "30 Aug – 2 Sep" */
export function formatRange(startKey: string, endKey: string): string {
  const s = fromDateKey(startKey);
  const e = fromDateKey(endKey);
  if (startKey === endKey) {
    return `${s.getUTCDate()} ${MONTHS[s.getUTCMonth()]}`;
  }
  if (s.getUTCMonth() === e.getUTCMonth() && s.getUTCFullYear() === e.getUTCFullYear()) {
    return `${s.getUTCDate()}–${e.getUTCDate()} ${MONTHS[e.getUTCMonth()]}`;
  }
  return `${s.getUTCDate()} ${MONTHS[s.getUTCMonth()]} – ${e.getUTCDate()} ${MONTHS[e.getUTCMonth()]}`;
}
