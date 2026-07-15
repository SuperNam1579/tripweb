"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
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
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md bg-pine px-4 text-sm font-medium text-paper hover:bg-pine/90",
        className,
      )}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
