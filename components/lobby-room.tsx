"use client";

import { useEffect, useRef, useState } from "react";
import { Crewmate } from "@/components/crewmate";
import type { CrewColor } from "@/lib/crew";

interface RosterMember {
  id: string;
  displayName: string;
  crew: CrewColor;
}

interface WalkerState {
  x: number; // percent, 0–100 — the character's feet
  y: number; // percent, 0–100 — the character's feet
  facingLeft: boolean;
}

const MOVE_MIN_MS = 2200;
const MOVE_MAX_MS = 4800;

// The floor (see the "Floor grid" layer below) occupies the bottom 62% of
// the room, i.e. starts at y=38%. Characters are drawn feet-first with
// height pulled up above that point, so MIN_Y needs real headroom above 38%
// or they visually poke into the wall — this is the bug that was reported.
const MIN_X = 14;
const MAX_X = 86;
const MIN_Y = 52;
const MAX_Y = 92;

function randomSpot(): { x: number; y: number } {
  return {
    x: MIN_X + Math.random() * (MAX_X - MIN_X),
    y: MIN_Y + Math.random() * (MAX_Y - MIN_Y),
  };
}

/**
 * A decorative "walk around the lobby" view: a still room background with
 * each member's crewmate ambling to a new random spot on its own timer.
 * Purely client-side and per-viewer — positions are NOT synced between
 * everyone looking at the lobby at once, this is cosmetic, not a game.
 */
export function LobbyRoom({ members }: { members: RosterMember[] }) {
  const [walkers, setWalkers] = useState<Record<string, WalkerState>>(() =>
    Object.fromEntries(members.map((m) => [m.id, { ...randomSpot(), facingLeft: false }])),
  );
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    members.forEach((m, i) => {
      function scheduleNext() {
        const delay = MOVE_MIN_MS + Math.random() * (MOVE_MAX_MS - MOVE_MIN_MS);
        timers.current[m.id] = setTimeout(() => {
          setWalkers((prev) => {
            const current = prev[m.id];
            const next = randomSpot();
            return {
              ...prev,
              [m.id]: { ...next, facingLeft: current ? next.x < current.x : false },
            };
          });
          scheduleNext();
        }, delay);
      }
      // Stagger the first move so the crew doesn't all set off in sync.
      timers.current[m.id] = setTimeout(scheduleNext, i * 350);
    });

    const timersAtMount = timers.current;
    return () => {
      Object.values(timersAtMount).forEach(clearTimeout);
    };
  }, [members]);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: "4 / 3",
        borderRadius: 22,
        border: "3px solid #05070D",
        boxShadow: "0 12px 0 rgba(0,0,0,.32), inset 0 0 0 2px #223154",
        background:
          // Placeholder room: swap this one background property for a real
          // room image later (e.g. background: `url(/lobby/room.png) center/cover`).
          "radial-gradient(120% 90% at 50% -10%,#26385C 0%,#16324E 42%,#0A182B 100%)",
      }}
    >
      {/* Doorway band up top, echoing the reference room shape */}
      <div
        aria-hidden
        className="absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: "34%",
          height: "18%",
          background: "linear-gradient(180deg,#0A182B,#152B47)",
          borderLeft: "3px solid #05070D",
          borderRight: "3px solid #05070D",
          borderBottom: "3px solid #05070D",
          borderRadius: "0 0 14px 14px",
        }}
      />
      {/* Floor grid — starts at y=38%; characters are kept well below this */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "62%",
          background: "#111A2D",
          borderTop: "3px solid #05070D",
          backgroundImage:
            "linear-gradient(rgba(56,254,220,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56,254,220,.08) 1px, transparent 1px)",
          backgroundSize: "12.5% 20%",
        }}
      />
      {/* Vignette to keep focus centered */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 55%,transparent 55%,rgba(5,7,13,.5) 100%)" }}
      />

      {members.map((m) => {
        const w = walkers[m.id];
        if (!w) return null;
        return (
          <div
            key={m.id}
            className="absolute flex flex-col items-center"
            style={{
              left: `${w.x}%`,
              top: `${w.y}%`,
              width: 56,
              // Percent-relative transform (not a fixed px margin) so the
              // character's feet stay pinned to (x, y) regardless of the
              // container's actual size — the earlier px offset could push
              // it past the frame on narrow screens.
              transform: "translate(-50%, -100%)",
              transition: "left 2.4s ease-in-out, top 2.4s ease-in-out",
            }}
          >
            <div
              style={{
                width: 40,
                height: 48,
                filter: "drop-shadow(0 6px 5px rgba(0,0,0,.45))",
                transform: w.facingLeft ? "scaleX(-1)" : "none",
                transition: "transform .2s ease",
              }}
            >
              <Crewmate body={m.crew.body} shade={m.crew.shade} />
            </div>
            <span
              className="mt-0.5 max-w-[64px] truncate rounded-full px-1.5 py-0.5 text-[10px] text-[#DCE6F5]"
              style={{ background: "rgba(5,7,13,.6)" }}
            >
              {m.displayName}
            </span>
          </div>
        );
      })}
    </div>
  );
}
