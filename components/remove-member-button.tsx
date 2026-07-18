"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removeMember } from "@/app/actions";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function RemoveMemberButton({
  tripId,
  memberId,
  memberName,
}: {
  tripId: string;
  memberId: string;
  memberName: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function confirmRemove() {
    startTransition(async () => {
      const result = await removeMember(tripId, memberId);
      if (result?.error) {
        setError(result.error);
        setOpen(false);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`ลบ ${memberName} ออกจากทริป`}
        className="flex-none text-base leading-none text-fog hover:text-[#FFB4B4]"
        style={{ padding: 4 }}
      >
        ×
      </button>
      {error ? <p className="mt-1 text-xs text-[#FFB4B4]">{error}</p> : null}
      <ConfirmDialog
        open={open}
        title={`ลบ ${memberName} ออกจากทริป?`}
        description="วันว่าง งบ และโหวตของคนนี้จะหายไปด้วย — กู้คืนไม่ได้ ถ้าเข้าผิดทริปแค่ชั่วคราวให้เขากดเข้าร่วมใหม่ได้เสมอ"
        confirmLabel={pending ? "กำลังลบ…" : "ลบสมาชิก"}
        cancelLabel="ไม่ลบ"
        onConfirm={confirmRemove}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
