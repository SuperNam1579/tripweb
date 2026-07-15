import { describe, expect, it } from "vitest";
import { bestWindow, rankWindows, type MemberAvailability } from "./availability";
import { eachDay } from "./dates";

function member(id: string, freeDates: string[]): MemberAvailability {
  return { memberId: id, displayName: id, freeDates };
}

const WINDOW = { windowStart: "2026-08-01", windowEnd: "2026-08-14" };

describe("rankWindows", () => {
  it("everyone free everywhere → full-coverage windows, non-overlapping", () => {
    const all = eachDay(WINDOW.windowStart, WINDOW.windowEnd);
    const members = [member("a", all), member("b", all), member("c", all)];
    const result = rankWindows({ members, durationDays: 3, ...WINDOW });

    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result.length).toBeLessThanOrEqual(5);
    for (const w of result) {
      expect(w.freeCount).toBe(3);
      expect(w.totalMembers).toBe(3);
      expect(w.freeMemberNames).toEqual(["a", "b", "c"]);
      expect(w.missingMemberNames).toEqual([]);
    }
    // ties broken by earliest start → first selected window starts at windowStart
    expect(result.map((w) => w.startDate)).toContain("2026-08-01");
  });

  it("nobody fully covers any window → still returns best-effort options, not empty", () => {
    // Each member is free on scattered single days; no one covers 3 in a row.
    const members = [
      member("a", ["2026-08-01", "2026-08-03", "2026-08-05"]),
      member("b", ["2026-08-02", "2026-08-04", "2026-08-06"]),
    ];
    const result = rankWindows({ members, durationDays: 3, ...WINDOW });
    expect(result.length).toBeGreaterThan(0);
    for (const w of result) {
      expect(w.freeCount).toBe(0);
      expect(w.missingMemberNames).toEqual(["a", "b"]);
    }
  });

  it("ties are broken by earliest start date", () => {
    // Two disjoint equally-good stretches: 2–4 and 8–10 for both members.
    const stretch1 = eachDay("2026-08-02", "2026-08-04");
    const stretch2 = eachDay("2026-08-08", "2026-08-10");
    const members = [
      member("a", [...stretch1, ...stretch2]),
      member("b", [...stretch1, ...stretch2]),
    ];
    const result = rankWindows({ members, durationDays: 3, ...WINDOW });
    const full = result.filter((w) => w.freeCount === 2);
    expect(full[0]?.startDate ?? result[0].startDate).toBe("2026-08-02");
    expect(bestWindow(result)?.startDate).toBe("2026-08-02");
  });

  it("non-overlapping selection actually excludes overlaps", () => {
    const all = eachDay(WINDOW.windowStart, WINDOW.windowEnd);
    const members = [member("a", all)];
    const result = rankWindows({ members, durationDays: 4, ...WINDOW });

    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const a = result[i];
        const b = result[j];
        const overlaps = a.startDate <= b.endDate && b.startDate <= a.endDate;
        expect(overlaps).toBe(false);
      }
    }
  });

  it("unmarked days count as NOT free", () => {
    // b marked nothing at all.
    const members = [
      member("a", eachDay("2026-08-01", "2026-08-03")),
      member("b", []),
    ];
    const result = rankWindows({ members, durationDays: 3, ...WINDOW });
    const top = result[0];
    expect(top.startDate).toBe("2026-08-01");
    expect(top.freeCount).toBe(1);
    expect(top.freeMemberNames).toEqual(["a"]);
    expect(top.missingMemberNames).toEqual(["b"]);
  });

  it("durationDays = 1 works", () => {
    const members = [
      member("a", ["2026-08-05"]),
      member("b", ["2026-08-05", "2026-08-06"]),
    ];
    const result = rankWindows({ members, durationDays: 1, ...WINDOW });
    const best = bestWindow(result)!;
    expect(best.startDate).toBe("2026-08-05");
    expect(best.endDate).toBe("2026-08-05");
    expect(best.freeCount).toBe(2);
  });

  it("durationDays equal to the entire window length → exactly one candidate", () => {
    const all = eachDay(WINDOW.windowStart, WINDOW.windowEnd);
    const members = [member("a", all), member("b", all.slice(1))];
    const result = rankWindows({ members, durationDays: all.length, ...WINDOW });
    expect(result).toHaveLength(1);
    expect(result[0].startDate).toBe(WINDOW.windowStart);
    expect(result[0].endDate).toBe(WINDOW.windowEnd);
    expect(result[0].freeCount).toBe(1); // b misses the first day
  });

  it("durationDays longer than the window → empty (no candidates exist)", () => {
    const members = [member("a", [])];
    expect(rankWindows({ members, durationDays: 15, ...WINDOW })).toEqual([]);
  });

  it("returns at most maxResults windows", () => {
    const all = eachDay(WINDOW.windowStart, WINDOW.windowEnd);
    const members = [member("a", all)];
    const result = rankWindows({ members, durationDays: 1, ...WINDOW });
    expect(result.length).toBeLessThanOrEqual(5);
  });
});
