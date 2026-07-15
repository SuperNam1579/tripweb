import { addDays, daySpan, eachDay } from "./dates";

/**
 * The sliding-window availability engine. Pure — no DB access, no I/O.
 * See CLAUDE.md: "The sliding-window availability algorithm".
 */

export interface MemberAvailability {
  memberId: string;
  displayName: string;
  /** Date keys (YYYY-MM-DD) the member explicitly marked as free. */
  freeDates: string[];
}

export interface RankedWindow {
  startDate: string;
  endDate: string;
  freeCount: number;
  totalMembers: number;
  freeMemberNames: string[];
  missingMemberNames: string[];
}

export interface RankWindowsInput {
  members: MemberAvailability[];
  durationDays: number;
  /** Date key of the earliest date to consider. */
  windowStart: string;
  /** Date key of the latest date to consider (inclusive). */
  windowEnd: string;
  /** How many non-overlapping windows to return at most. Default 5. */
  maxResults?: number;
}

export function rankWindows({
  members,
  durationDays,
  windowStart,
  windowEnd,
  maxResults = 5,
}: RankWindowsInput): RankedWindow[] {
  if (durationDays < 1) return [];
  if (members.length === 0) return [];
  if (daySpan(windowStart, windowEnd) < durationDays) return [];

  const freeSets = members.map((m) => new Set(m.freeDates));

  // Score every possible run of durationDays consecutive dates in the window.
  const lastStart = addDays(windowEnd, -(durationDays - 1));
  const candidates: RankedWindow[] = [];

  for (const start of eachDay(windowStart, lastStart)) {
    const end = addDays(start, durationDays - 1);
    const days = eachDay(start, end);

    const freeMemberNames: string[] = [];
    const missingMemberNames: string[] = [];
    members.forEach((m, i) => {
      // A member covers the window only if free on EVERY day of it.
      // Unmarked days count as NOT free (explicit opt-in only).
      const covers = days.every((d) => freeSets[i].has(d));
      (covers ? freeMemberNames : missingMemberNames).push(m.displayName);
    });

    candidates.push({
      startDate: start,
      endDate: end,
      freeCount: freeMemberNames.length,
      totalMembers: members.length,
      freeMemberNames,
      missingMemberNames,
    });
  }

  // Sort by score desc, ties broken by earliest start date.
  candidates.sort(
    (a, b) => b.freeCount - a.freeCount || a.startDate.localeCompare(b.startDate),
  );

  // Greedily select the top non-overlapping windows.
  const selected: RankedWindow[] = [];
  for (const c of candidates) {
    if (selected.length >= maxResults) break;
    const overlaps = selected.some(
      (s) => c.startDate <= s.endDate && s.startDate <= c.endDate,
    );
    if (!overlaps) selected.push(c);
  }

  // Returned best-first: score desc, ties by earliest start.
  return selected;
}

/** The single best window is the highest-scoring, earliest-starting one. */
export function bestWindow(windows: RankedWindow[]): RankedWindow | null {
  if (windows.length === 0) return null;
  return windows.reduce((best, w) =>
    w.freeCount > best.freeCount ||
    (w.freeCount === best.freeCount && w.startDate < best.startDate)
      ? w
      : best,
  );
}
