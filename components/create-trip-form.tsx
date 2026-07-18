"use client";

import { useActionState } from "react";
import { createTrip } from "@/app/actions";
import { CrewColorPicker } from "@/components/crew-color-picker";
import { toDateKey } from "@/lib/dates";

export function CreateTripForm() {
  const [state, action, pending] = useActionState(createTrip, null);

  const today = new Date();
  const inMonth = new Date(today);
  inMonth.setDate(inMonth.getDate() + 30);
  const inTwoMonths = new Date(today);
  inTwoMonths.setDate(inTwoMonths.getDate() + 75);

  return (
    <form action={action} className="flex flex-col gap-[22px]">
      <div>
        <label htmlFor="name" className="label">
          ชื่อทริป
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={80}
          placeholder="เที่ยวเชียงใหม่ with the gang"
          className="field"
        />
      </div>

      <div>
        <label htmlFor="destination" className="label">
          จะไปไหน (เมือง / จังหวัด / เกาะ)
        </label>
        <input
          id="destination"
          name="destination"
          required
          maxLength={80}
          placeholder="เช่น เชียงใหม่ / ปาย / เกาะสมุย"
          className="field"
        />
        <p className="mt-1.5 text-xs text-fog">ทีมจะโหวตแค่ &ldquo;แนวที่อยากไป&rdquo; แล้วระบบหาที่เที่ยวจริงในจุดหมายนี้ให้</p>
      </div>

      <div>
        <label htmlFor="yourName" className="label">
          ชื่อของคุณ
        </label>
        <input
          id="yourName"
          name="yourName"
          required
          maxLength={40}
          autoComplete="nickname"
          placeholder="เช่น ต้น / Bam"
          className="field"
        />
        <p className="mt-1.5 text-xs text-fog">คุณจะเข้าลอบบี้เป็นสมาชิกคนแรกทันที มาร์กวันว่างของตัวเองได้เลย</p>
      </div>

      <div>
        <label className="label">เลือกสีตัวละคร</label>
        <div className="panel-flat" style={{ padding: 18 }}>
          <CrewColorPicker />
        </div>
      </div>

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
            defaultValue={3}
            required
            className="field text-[20px]"
          />
        </div>
        <p className="m-0 pb-3.5 text-sm text-fog">เช่น ทริปสุดสัปดาห์ = 3 วัน</p>
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
              defaultValue={toDateKey(inMonth)}
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
              defaultValue={toDateKey(inTwoMonths)}
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

      <button type="submit" disabled={pending} className="btn btn-green mt-1.5 self-start px-8 py-4 text-[18px]">
        {pending ? "กำลังสร้าง…" : "สร้างห้อง →"}
      </button>
    </form>
  );
}
