"use client";

import { useState } from "react";

/**
 * The join code as a sharp-cornered HUD badge, pinned to the header's top
 * corner. Tapping it copies the full join link — the code itself is never
 * sensitive (it's meant to be pasted in the group chat).
 */
export function JoinCodeBadge({ joinCode, joinPath }: { joinCode: string; joinPath: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = window.location.origin + joinPath;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this:", text);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="flex-none text-left"
      style={{
        background: "linear-gradient(180deg,#1A2640,#111A2D)",
        border: "3px solid #05070D",
        borderRadius: 8,
        padding: "8px 16px",
        boxShadow: "0 5px 0 rgba(0,0,0,.32), inset 0 0 0 2px #223154",
        cursor: "pointer",
      }}
    >
      <span className="block text-[10px] font-semibold uppercase tracking-[.18em] text-fog">โค้ดเข้าร่วม</span>
      <span
        className="mt-0.5 block text-[22px] font-bold leading-none text-cyan"
        style={{ letterSpacing: ".16em" }}
      >
        {joinCode}
      </span>
      <span className="mt-1.5 block text-[11px] font-medium text-mist">
        {copied ? "คัดลอกแล้ว ✓" : "แตะเพื่อคัดลอกลิงก์"}
      </span>
    </button>
  );
}
