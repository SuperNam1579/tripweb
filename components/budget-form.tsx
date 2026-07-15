"use client";

import { useActionState } from "react";
import { saveBudget } from "@/app/actions";

export function BudgetForm({
  tripId,
  initialAmount,
}: {
  tripId: string;
  initialAmount: number | null;
}) {
  const action = saveBudget.bind(null, tripId);
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium mb-1.5">
          My budget for the whole trip (THB)
        </label>
        <div className="relative">
          <span aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate">
            ฿
          </span>
          <input
            id="amount"
            name="amount"
            type="number"
            inputMode="numeric"
            min={1}
            max={1_000_000}
            step={1}
            required
            defaultValue={initialAmount ?? undefined}
            placeholder="5000"
            className="h-12 w-full rounded-md border border-border bg-card pl-8 pr-3 font-mono text-lg tabular-nums text-ink placeholder:text-slate"
          />
        </div>
      </div>

      {state?.error ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-md bg-signal px-6 font-display text-base font-semibold text-ink hover:brightness-95 disabled:opacity-60"
      >
        {pending ? "Saving…" : initialAmount ? "Update my budget" : "Save my budget"}
      </button>
    </form>
  );
}
