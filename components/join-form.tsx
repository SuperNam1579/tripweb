"use client";

import { useActionState } from "react";
import { joinTrip } from "@/app/actions";
import { CrewColorPicker } from "@/components/crew-color-picker";

export function JoinForm({ joinCode, takenColors }: { joinCode: string; takenColors: string[] }) {
  const [state, action, pending] = useActionState(joinTrip, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="joinCode" value={joinCode} />

      <CrewColorPicker takenColors={takenColors} />

      <div>
        <label htmlFor="displayName" className="label">
          ชื่อที่ให้เพื่อนเห็น
        </label>
        <input
          id="displayName"
          name="displayName"
          required
          maxLength={40}
          autoComplete="nickname"
          placeholder="เช่น ต้น / Bam"
          className="field"
        />
      </div>

      {state?.error ? (
        <p
          role="alert"
          className="rounded-xl px-3.5 py-2.5 text-sm text-[#FFB4B4]"
          style={{ background: "rgba(226,58,58,.12)", border: "2px solid rgba(226,58,58,.4)" }}
        >
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-green h-[54px] text-[18px]">
        {pending ? "กำลังเข้า…" : "เข้าลอบบี้ →"}
      </button>
    </form>
  );
}
