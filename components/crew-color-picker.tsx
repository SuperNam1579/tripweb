"use client";

import { useState } from "react";
import { Crewmate } from "@/components/crewmate";
import { CREW_PALETTE } from "@/lib/crew";

/**
 * Pick-your-crewmate colour grid. Colours already used by someone else in
 * the trip are disabled — the server re-checks on submit (colours are
 * unique per trip at the DB level), this is just the fast local hint.
 */
export function CrewColorPicker({
  name = "color",
  takenColors = [],
}: {
  name?: string;
  takenColors?: string[];
}) {
  const taken = new Set(takenColors);
  const firstAvailable = CREW_PALETTE.find((c) => !taken.has(c.key))?.key ?? CREW_PALETTE[0].key;
  const [selected, setSelected] = useState(firstAvailable);
  const current = CREW_PALETTE.find((c) => c.key === selected) ?? CREW_PALETTE[0];

  return (
    <div>
      <input type="hidden" name={name} value={selected} />
      <div className="mb-2 flex justify-center">
        <div className="h-[74px] w-[62px]" style={{ filter: "drop-shadow(0 10px 8px rgba(0,0,0,.45))" }}>
          <Crewmate body={current.body} shade={current.shade} />
        </div>
      </div>
      <p className="mb-3 text-center text-sm font-semibold text-cyan">เลือกสีของคุณ — {current.label}</p>
      <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6">
        {CREW_PALETTE.map((c) => {
          const isTaken = taken.has(c.key);
          const isSelected = selected === c.key;
          return (
            <button
              key={c.key}
              type="button"
              disabled={isTaken}
              aria-pressed={isSelected}
              aria-label={isTaken ? `${c.label} — มีคนเลือกแล้ว` : c.label}
              onClick={() => setSelected(c.key)}
              className="h-11 text-lg font-bold text-white"
              style={{
                borderRadius: 12,
                border: `3px solid ${isSelected ? "#F6F657" : "#05070D"}`,
                background: isTaken
                  ? "#151F33"
                  : `linear-gradient(180deg,rgba(255,255,255,.28),rgba(255,255,255,0) 50%),${c.body}`,
                boxShadow: isTaken
                  ? "none"
                  : isSelected
                    ? `0 0 0 3px rgba(246,246,87,.4), 0 4px 0 ${c.shade}`
                    : `0 4px 0 ${c.shade}`,
                opacity: isTaken ? 0.4 : 1,
                cursor: isTaken ? "not-allowed" : "pointer",
                textShadow: "0 1px 2px rgba(0,0,0,.5)",
              }}
            >
              {isSelected ? "✓" : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}
