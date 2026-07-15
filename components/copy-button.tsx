"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  label,
  className,
  variant = "cyan",
}: {
  value: string;
  label: string;
  className?: string;
  variant?: "cyan" | "dark";
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    // Relative paths become full URLs so they paste cleanly into a chat.
    const text = value.startsWith("/") ? window.location.origin + value : value;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (http / permissions) — select-and-copy fallback.
      window.prompt("Copy this:", text);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn("btn px-[22px] py-3 text-[15px]", variant === "cyan" ? "btn-cyan" : "btn-dark", className)}
    >
      {copied ? "คัดลอกแล้ว ✓" : label}
    </button>
  );
}
