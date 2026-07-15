"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { saveAvailability } from "@/app/actions";
import { eachDay, fromDateKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_HEADER = ["M", "T", "W", "T", "F", "S", "S"];

interface MonthBlock {
  label: string;
  /** Leading blanks for a Monday-first grid, then the month's in-window days. */
  cells: (string | null)[];
}

function buildMonths(windowStart: string, windowEnd: string): MonthBlock[] {
  const days = eachDay(windowStart, windowEnd);
  const byMonth = new Map<string, string[]>();
  for (const d of days) {
    const m = d.slice(0, 7);
    if (!byMonth.has(m)) byMonth.set(m, []);
    byMonth.get(m)!.push(d);
  }
  return [...byMonth.entries()].map(([month, monthDays]) => {
    const first = fromDateKey(monthDays[0]);
    const mondayFirst = (first.getUTCDay() + 6) % 7;
    return {
      label: `${MONTH_NAMES[first.getUTCMonth()]} ${first.getUTCFullYear()}`,
      cells: [...Array<null>(mondayFirst).fill(null), ...monthDays],
    };
  });
}

export function AvailabilityCalendar({
  tripId,
  windowStart,
  windowEnd,
  initialFree,
}: {
  tripId: string;
  windowStart: string;
  windowEnd: string;
  initialFree: string[];
}) {
  const months = useMemo(() => buildMonths(windowStart, windowEnd), [windowStart, windowEnd]);
  const [free, setFree] = useState<Set<string>>(() => new Set(initialFree));
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Tap-and-drag painting: the first day pressed decides whether the drag
  // marks days free or busy.
  const paintMode = useRef<boolean | null>(null);

  function applyPaint(date: string) {
    const mode = paintMode.current;
    if (mode === null) return;
    setFree((prev) => {
      if (prev.has(date) === mode) return prev;
      const next = new Set(prev);
      if (mode) next.add(date);
      else next.delete(date);
      return next;
    });
    setDirty(true);
    setSaved(false);
  }

  function onPointerDown(e: React.PointerEvent, date: string) {
    e.preventDefault();
    paintMode.current = !free.has(date);
    applyPaint(date);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (paintMode.current === null) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const date = el instanceof HTMLElement ? el.dataset.date : undefined;
    if (date) applyPaint(date);
  }

  function endPaint() {
    paintMode.current = null;
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveAvailability(tripId, [...free]);
      if (result?.error) {
        setError(result.error);
      } else {
        setDirty(false);
        setSaved(true);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className="flex flex-col gap-6 touch-none select-none"
        onPointerMove={onPointerMove}
        onPointerUp={endPaint}
        onPointerLeave={endPaint}
        onPointerCancel={endPaint}
      >
        {months.map((month) => (
          <section key={month.label} aria-label={month.label}>
            <h3 className="mb-2 font-display text-base font-semibold tracking-tight">
              {month.label}
            </h3>
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAY_HEADER.map((w, i) => (
                <span
                  key={`${w}-${i}`}
                  aria-hidden
                  className="pb-1 text-center font-mono text-[10px] uppercase text-slate"
                >
                  {w}
                </span>
              ))}
              {month.cells.map((date, i) =>
                date === null ? (
                  <span key={`blank-${i}`} />
                ) : (
                  <button
                    key={date}
                    type="button"
                    data-date={date}
                    aria-pressed={free.has(date)}
                    aria-label={date}
                    onPointerDown={(e) => onPointerDown(e, date)}
                    className={cn(
                      "flex h-10 items-center justify-center rounded-md border font-mono text-sm tabular-nums",
                      free.has(date)
                        ? "border-signal bg-signal font-semibold text-ink"
                        : "border-border bg-card text-ink/70 hover:border-slate",
                    )}
                  >
                    {Number(date.slice(8, 10))}
                  </button>
                ),
              )}
            </div>
          </section>
        ))}
      </div>

      {error ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="sticky bottom-4 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={pending || (!dirty && !saved)}
          className="h-12 flex-1 rounded-md bg-signal px-6 font-display text-base font-semibold text-ink shadow-sm hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "Saving…" : saved && !dirty ? "Saved ✓" : "Save my free days"}
        </button>
        <span className="font-mono text-sm tabular-nums text-slate">
          {free.size} {free.size === 1 ? "day" : "days"}
        </span>
      </div>
    </div>
  );
}
