"use client";

import { useEffect } from "react";

/**
 * A small themed confirm modal — used wherever an action needs a "you sure?"
 * step (e.g. removing a trip from the local list) instead of native confirm().
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={onCancel}
      className="fixed inset-0 z-100 flex items-center justify-center px-6"
      style={{ background: "rgba(5,7,13,.72)", backdropFilter: "blur(3px)" }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
        className="panel w-full max-w-[380px]"
        style={{ padding: 24 }}
      >
        <h2 id="confirm-title" className="text-lg font-semibold text-star">
          {title}
        </h2>
        {description ? <p className="mt-2 text-sm text-[#B7C4DA]">{description}</p> : null}
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onCancel} className="btn btn-dark h-11 flex-1 text-sm">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-red h-11 flex-1 text-sm">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
