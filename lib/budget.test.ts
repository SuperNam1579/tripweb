import { describe, expect, it } from "vitest";
import {
  budgetSignal,
  groupBudgetView,
  median,
  recommendationThreshold,
} from "./budget";

describe("median", () => {
  it("odd count → middle value", () => {
    expect(median([3000, 1000, 2000])).toBe(2000);
  });
  it("even count → average of the middle two", () => {
    expect(median([1000, 2000, 3000, 10000])).toBe(2500);
  });
  it("empty → null", () => {
    expect(median([])).toBeNull();
  });
  it("does not mutate its input", () => {
    const input = [3, 1, 2];
    median(input);
    expect(input).toEqual([3, 1, 2]);
  });
});

describe("budgetSignal", () => {
  const budgets = [1000, 2000, 3000, 4000]; // 4 submitted

  it("EVERYONE_AFFORDS when 0 members are under the price", () => {
    expect(budgetSignal(1000, budgets).tier).toBe("EVERYONE_AFFORDS");
    expect(budgetSignal(500, budgets).tier).toBe("EVERYONE_AFFORDS");
  });

  it("MOST_AFFORD when a strict minority is under the price", () => {
    // price 1500 → only the 1000 budget is under (1 of 4)
    const s = budgetSignal(1500, budgets);
    expect(s.tier).toBe("MOST_AFFORD");
    expect(s.overCount).toBe(1);
  });

  it("OVER_SOME_BUDGETS at the boundary (exactly half under)", () => {
    // price 2500 → 1000 and 2000 are under (2 of 4 — not a minority)
    const s = budgetSignal(2500, budgets);
    expect(s.tier).toBe("OVER_SOME_BUDGETS");
    expect(s.overCount).toBe(2);
  });

  it("OVER_SOME_BUDGETS when a majority is under", () => {
    const s = budgetSignal(5000, budgets);
    expect(s.tier).toBe("OVER_SOME_BUDGETS");
    expect(s.overCount).toBe(4);
  });

  it("a budget exactly equal to the price counts as affording it", () => {
    expect(budgetSignal(1000, budgets).overCount).toBe(0);
  });

  it("INSUFFICIENT_DATA below 3 submitted budgets — 0, 1 and 2 entries", () => {
    expect(budgetSignal(100, []).tier).toBe("INSUFFICIENT_DATA");
    expect(budgetSignal(100, [5000]).tier).toBe("INSUFFICIENT_DATA");
    expect(budgetSignal(100, [5000, 6000]).tier).toBe("INSUFFICIENT_DATA");
    expect(budgetSignal(100, [5000, 6000, 7000]).tier).not.toBe("INSUFFICIENT_DATA");
  });
});

describe("recommendationThreshold", () => {
  it("suppressed below 3 budgets", () => {
    expect(recommendationThreshold([1000, 2000])).toBeNull();
  });
  it("median otherwise", () => {
    expect(recommendationThreshold([1000, 2000, 9000])).toBe(2000);
  });
});

describe("privacy: no code path returns an individual amount to a non-owner", () => {
  it("groupBudgetView exposes only counts", () => {
    const view = groupBudgetView([1234, 5678, 9012], 5);
    expect(view).toEqual({ submittedCount: 3, totalMembers: 5, hasSignal: true });
    const json = JSON.stringify(view);
    expect(json).not.toContain("1234");
    expect(json).not.toContain("5678");
    expect(json).not.toContain("9012");
    expect(json).not.toContain("amount");
  });

  it("budgetSignal output contains no raw amounts", () => {
    const s = budgetSignal(2500, [1234, 5678, 9012]);
    const json = JSON.stringify(s);
    expect(json).not.toContain("1234");
    expect(json).not.toContain("5678");
    expect(json).not.toContain("9012");
    expect(json).not.toContain("amount");
  });
});
