"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { updateTripWindow } from "@/app/actions";
import { Toast } from "@/components/toast";

export function EditTripDatesForm({
  tripId,
  currentDurationDays,
  currentWindowStart,
  currentWindowEnd,
}: {
  tripId: string;
  currentDurationDays: number;
  currentWindowStart: string;
  currentWindowEnd: string;
}) {
  const action = updateTripWindow.bind(null, tripId);
  const [state, formAction, pending] = useActionState(action, null);

  const [showSaved, setShowSaved] = useState(false);
  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) setShowSaved(true);
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid items-end gap-5 sm:grid-cols-[150px_1fr]">
        <div>
          <label htmlFor="durationDays" className="label">
            กี่วัน
          </label>
          <input
            id="durationDays"
            name="durationDays"
            type="number"
            inputMode="numeric"
            min={1}
            max={30}
            defaultValue={currentDurationDays}
            required
            className="field text-[20px]"
          />
        </div>
        <p className="m-0 pb-3.5 text-sm text-fog">ความยาวทริป เช่น ทริปสุดสัปดาห์ = 3 วัน</p>
      </div>

      <fieldset className="m-0 border-0 p-0">
        <legend className="label p-0">หาวันในช่วง</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="windowStart" className="sr-only">
              Earliest date
            </label>
            <input
              id="windowStart"
              name="windowStart"
              type="date"
              required
              defaultValue={currentWindowStart}
              className="field text-[15px]"
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
              defaultValue={currentWindowEnd}
              className="field text-[15px]"
            />
          </div>
        </div>
      </fieldset>

      {state?.error ? (
        <p
          role="alert"
          className="rounded-xl px-3.5 py-2.5 text-sm text-[#FFB4B4]"
          style={{ background: "rgba(226,58,58,.12)", border: "2px solid rgba(226,58,58,.4)" }}
        >
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-green mt-1.5 h-14 text-[18px]">
        {pending ? "กำลังบันทึก…" : "บันทึกวันที่"}
      </button>

      <Toast open={showSaved} message="อัปเดตวันที่ของทริปแล้ว ✓" onClose={() => setShowSaved(false)} />
    </form>
  );
}
