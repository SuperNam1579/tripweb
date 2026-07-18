"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { updateMemberProfile } from "@/app/actions";
import { CrewColorPicker } from "@/components/crew-color-picker";
import { Toast } from "@/components/toast";

export function EditProfileForm({
  tripId,
  currentName,
  currentColor,
  takenColors,
}: {
  tripId: string;
  currentName: string;
  currentColor: string;
  takenColors: string[];
}) {
  const action = updateMemberProfile.bind(null, tripId);
  const [state, formAction, pending] = useActionState(action, null);

  const [showSaved, setShowSaved] = useState(false);
  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) setShowSaved(true);
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <CrewColorPicker takenColors={takenColors} defaultColor={currentColor} />

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
          defaultValue={currentName}
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

      <button type="submit" disabled={pending} className="btn btn-green h-14 text-[18px]">
        {pending ? "กำลังบันทึก…" : "บันทึกการเปลี่ยนแปลง"}
      </button>

      <Toast open={showSaved} message="บันทึกข้อมูลแล้ว ✓" onClose={() => setShowSaved(false)} />
    </form>
  );
}
