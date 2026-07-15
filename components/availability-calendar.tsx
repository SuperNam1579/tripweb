"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { saveAvailability } from "@/app/actions";
import { Toast } from "@/components/toast";
import { eachDay, fromDateKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_HEADER = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];

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
  return [...byMonth.entries()].map(([, monthDays]) => {
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
  const [showToast, setShowToast] = useState(false);
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
        setShowToast(true);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        className="flex touch-none select-none flex-col gap-6"
        onPointerMove={onPointerMove}
        onPointerUp={endPaint}
        onPointerLeave={endPaint}
        onPointerCancel={endPaint}
      >
        {months.map((month) => (
          <section key={month.label} aria-label={month.label} className="panel" style={{ padding: 20 }}>
            <h3 className="mb-3.5 text-lg font-semibold text-[#EEF3FB]">{month.label}</h3>
            <div className="mb-1.5 grid grid-cols-7 gap-1.5">
              {WEEKDAY_HEADER.map((w, i) => (
                <span key={`${w}-${i}`} aria-hidden className="pb-1 text-center text-xs text-[#5E6E88]">
                  {w}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {month.cells.map((date, i) =>
                date === null ? (
                  <span key={`blank-${i}`} className="h-[46px]" />
                ) : (
                  <button
                    key={date}
                    type="button"
                    data-date={date}
                    aria-pressed={free.has(date)}
                    aria-label={date}
                    onPointerDown={(e) => onPointerDown(e, date)}
                    className="flex h-[46px] items-center justify-center rounded-xl text-base font-semibold tabular-nums"
                    style={
                      free.has(date)
                        ? {
                            background:
                              "linear-gradient(180deg,rgba(255,255,255,.3),rgba(255,255,255,0) 50%),#38FEDC",
                            border: "3px solid #05070D",
                            color: "#062B27",
                            boxShadow: "0 4px 0 #1C9E9C",
                          }
                        : { background: "#151F33", border: "3px solid #0C1220", color: "#8EA0BC" }
                    }
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
        <p
          role="alert"
          className="rounded-xl px-3.5 py-2.5 text-sm text-[#FFB4B4]"
          style={{ background: "rgba(226,58,58,.12)", border: "2px solid rgba(226,58,58,.4)" }}
        >
          {error}
        </p>
      ) : null}

      <div className="sticky bottom-4 flex items-center gap-3.5">
        <button
          type="button"
          onClick={save}
          disabled={pending || (!dirty && !saved)}
          className={cn("btn h-14 flex-1 text-[18px]", saved && !dirty ? "btn-green" : "btn-cyan")}
        >
          {pending ? "กำลังบันทึก…" : saved && !dirty ? "บันทึกแล้ว ✓" : "บันทึกวันว่าง ✓"}
        </button>
        <span className="text-[17px] tabular-nums text-[#C6D2E6]">{free.size} วัน</span>
      </div>

      <Toast open={showToast} message="บันทึกวันว่างแล้ว ✓" onClose={() => setShowToast(false)} />
    </div>
  );
}
