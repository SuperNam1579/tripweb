"use client";

import { useEffect } from "react";

/**
 * A small "done" popup that appears bottom-center and dismisses itself.
 * Use for actions whose success wouldn't otherwise be obvious (e.g. a form
 * that stays on the same screen after saving).
 */
export function Toast({
  open,
  message,
  onClose,
  durationMs = 2400,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
  durationMs?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, durationMs);
    return () => clearTimeout(t);
  }, [open, onClose, durationMs]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-6 z-100 flex justify-center px-6"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="pop flex items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-semibold"
        style={{
          background: "linear-gradient(180deg,rgba(255,255,255,.3),rgba(255,255,255,0) 50%),#4AC959",
          color: "#08210C",
          border: "3px solid #05070D",
          boxShadow: "0 6px 0 #2C8C39, inset 0 2px 0 rgba(255,255,255,.4)",
        }}
      >
        <span aria-hidden>✓</span>
        {message}
      </div>
    </div>
  );
}
