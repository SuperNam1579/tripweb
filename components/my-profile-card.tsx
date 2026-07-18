import Link from "next/link";
import { Crewmate } from "@/components/crewmate";
import type { CrewColor } from "@/lib/crew";

/**
 * "Who you are in this trip" — shown prominently near the top of the hub
 * (not buried at the bottom) with a clear edit action right on it.
 */
export function MyProfileCard({
  tripId,
  name,
  crew,
}: {
  tripId: string;
  name: string;
  crew: CrewColor;
}) {
  return (
    <section
      className="flex items-center gap-3.5"
      style={{ background: "rgba(56,254,220,.06)", border: "2px solid rgba(56,254,220,.25)", borderRadius: 15, padding: "12px 16px" }}
    >
      <span className="inline-block h-11 w-9 flex-none">
        <Crewmate body={crew.body} shade={crew.shade} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] uppercase tracking-wider text-cyan">คุณคือ</span>
        <span className="block truncate text-[17px] font-semibold text-star">{name}</span>
      </span>
      <Link
        href={`/trip/${tripId}/profile`}
        className="flex-none rounded-full px-3.5 py-2 text-xs font-semibold"
        style={{ background: "rgba(56,254,220,.14)", color: "#38FEDC", border: "2px solid rgba(56,254,220,.3)" }}
      >
        แก้ไข
      </Link>
    </section>
  );
}
