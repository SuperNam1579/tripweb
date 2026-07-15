"use client";

import { useActionState } from "react";
import { createTrip } from "@/app/actions";
import { toDateKey } from "@/lib/dates";

const inputCls =
  "h-11 w-full rounded-md border border-border bg-card px-3 text-base text-ink placeholder:text-slate";
const labelCls = "block text-sm font-medium mb-1.5";

export function CreateTripForm() {
  const [state, action, pending] = useActionState(createTrip, null);

  const today = new Date();
  const inMonth = new Date(today);
  inMonth.setDate(inMonth.getDate() + 30);
  const inTwoMonths = new Date(today);
  inTwoMonths.setDate(inTwoMonths.getDate() + 75);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className={labelCls}>
          Trip name
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={80}
          placeholder="เที่ยวเชียงใหม่ with the gang"
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="durationDays" className={labelCls}>
          How many days?
        </label>
        <input
          id="durationDays"
          name="durationDays"
          type="number"
          inputMode="numeric"
          min={1}
          max={30}
          defaultValue={3}
          required
          className={`${inputCls} font-mono w-28`}
        />
      </div>

      <fieldset>
        <legend className={labelCls}>Look for dates between</legend>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="windowStart" className="sr-only">
              Earliest date
            </label>
            <input
              id="windowStart"
              name="windowStart"
              type="date"
              required
              defaultValue={toDateKey(inMonth)}
              className={`${inputCls} font-mono`}
            />
          </div>
          <div>
            <label htmlFor="windowEnd" className="sr-only">
              Latest date
            </label>
            <input
              id="windowEnd"
              name="windowEnd"
              type="date"
              required
              defaultValue={toDateKey(inTwoMonths)}
              className={`${inputCls} font-mono`}
            />
          </div>
        </div>
      </fieldset>

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
        {pending ? "Creating…" : "Create the trip"}
      </button>
    </form>
  );
}
