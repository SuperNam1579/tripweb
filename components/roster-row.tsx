"use client";

import Link from "next/link";
import { useState } from "react";
import { Crewmate } from "@/components/crewmate";
import { rowBorder, rowCls } from "@/components/route-line";
import type { CrewColor } from "@/lib/crew";

interface RosterMember {
  id: string;
  displayName: string;
  crew: CrewColor;
}

/**
 * "Who's in the lobby" — two ways to see them:
 *  1. Tap the row to expand a static grid, everyone standing still (quick
 *     glance, no navigation).
 *  2. The "ห้องลูกเรือ" pill jumps to the full room view where each member
 *     wanders around on their own (see components/lobby-room.tsx).
 * Visible to owner and member alike.
 */
export function RosterRow({ tripId, members }: { tripId: string; members: RosterMember[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className={`${rowCls} gap-3`} style={rowBorder}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-3.5 text-left"
        >
          <span
            aria-hidden
            className="grid h-8 w-8 flex-none place-items-center rounded-[9px] text-[15px] font-bold"
            style={{ background: "#151F33", color: "#38FEDC", border: "2px solid #05070D" }}
          >
            ⚑
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[18px] font-semibold text-[#EEF3FB]">สมาชิกในลอบบี้</span>
            <span className="mt-px block text-[13px] text-fog">{members.length} คนขึ้นเรือแล้ว</span>
          </span>
        </button>
        <Link
          href={`/trip/${tripId}/lobby`}
          className="flex-none rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ background: "rgba(56,254,220,.14)", color: "#38FEDC", border: "2px solid rgba(56,254,220,.3)" }}
        >
          ห้องลูกเรือ →
        </Link>
      </div>
      {open ? (
        <div
          className="flex flex-wrap justify-center gap-2 px-4 py-4"
          style={{ ...rowBorder, background: "rgba(255,255,255,.02)" }}
        >
          {members.map((m) => (
            <div
              key={m.id}
              className="flex w-[84px] flex-col items-center gap-1.5 rounded-2xl px-1 py-2"
              style={{ background: "rgba(255,255,255,.03)", border: "2px solid #1C2740" }}
            >
              <div className="h-[62px] w-[52px]" style={{ filter: "drop-shadow(0 6px 6px rgba(0,0,0,.45))" }}>
                <Crewmate body={m.crew.body} shade={m.crew.shade} />
              </div>
              <span className="max-w-full truncate text-xs text-[#C6D2E6]">{m.displayName}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
