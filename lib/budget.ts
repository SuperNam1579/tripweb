/**
 * Budget privacy rules. Pure — no DB access, no I/O.
 * See CLAUDE.md: "The budget privacy rules".
 *
 * Each member submits a RANGE (min–max) they're comfortable spending, not a
 * single figure. Affordability is judged against the top of that range (the
 * max) — that's the ceiling a member is actually willing to pay.
 *
 * HARD RULE: nothing exported here for group-facing use may ever contain an
 * individual amount or a name tied to an amount. Only the owner view does.
 */

export const MIN_BUDGETS_FOR_SIGNAL = 3;

export interface BudgetRange {
  min: number;
  max: number;
}

export type BudgetTier =
  | "EVERYONE_AFFORDS"
  | "MOST_AFFORD"
  | "OVER_SOME_BUDGETS"
  | "INSUFFICIENT_DATA";

export interface BudgetSignal {
  tier: BudgetTier;
  /** Number of members whose max is under the price. Only meaningful for OVER_SOME_BUDGETS. */
  overCount: number;
  submittedCount: number;
}

/** Median of a list of numbers. */
export function median(amounts: number[]): number | null {
  if (amounts.length === 0) return null;
  const sorted = [...amounts].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Group-facing tier for a price P. Never exposes who is over — only how many.
 * A member "affords" P when P is at or under their range's max. Suppressed
 * entirely below MIN_BUDGETS_FOR_SIGNAL submissions, because with 1–2
 * entries the tiers leak individual ranges by inference.
 */
export function budgetSignal(price: number, ranges: BudgetRange[]): BudgetSignal {
  const submittedCount = ranges.length;
  if (submittedCount < MIN_BUDGETS_FOR_SIGNAL) {
    return { tier: "INSUFFICIENT_DATA", overCount: 0, submittedCount };
  }
  const overCount = ranges.filter((r) => r.max < price).length;
  if (overCount === 0) {
    return { tier: "EVERYONE_AFFORDS", overCount: 0, submittedCount };
  }
  // A minority over budget → MOST_AFFORD; otherwise OVER_SOME_BUDGETS.
  if (overCount * 2 < submittedCount) {
    return { tier: "MOST_AFFORD", overCount, submittedCount };
  }
  return { tier: "OVER_SOME_BUDGETS", overCount, submittedCount };
}

/**
 * The recommendation threshold: the median of everyone's range max. Returns
 * null when suppressed — callers must render nothing in that case.
 */
export function recommendationThreshold(ranges: BudgetRange[]): number | null {
  if (ranges.length < MIN_BUDGETS_FOR_SIGNAL) return null;
  return median(ranges.map((r) => r.max));
}

/**
 * The ONLY shape budget data may take when leaving the server for a
 * non-owner. Amounts and per-member linkage are stripped by construction.
 */
export interface GroupBudgetView {
  submittedCount: number;
  totalMembers: number;
  /** True once enough budgets exist for tiers to be shown. */
  hasSignal: boolean;
}

export function groupBudgetView(
  amounts: number[],
  totalMembers: number,
): GroupBudgetView {
  return {
    submittedCount: amounts.length,
    totalMembers,
    hasSignal: amounts.length >= MIN_BUDGETS_FOR_SIGNAL,
  };
}
