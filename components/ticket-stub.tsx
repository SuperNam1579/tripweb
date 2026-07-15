import type { RankedWindow } from "@/lib/availability";
import type { CrewColor } from "@/lib/crew";
import { Crewmate } from "@/components/crewmate";
import { formatRange, formatShort } from "@/lib/dates";

/**
 * The payoff: the group's best date window as a glowing "victory" card with the
 * free crew lined up, and the runner-up windows as quiet panels. See DESIGN.md.
 */
export function BestWindowCard({
  window: w,
  crew,
}: {
  window: RankedWindow;
  crew: CrewColor[];
}) {
  const full = w.freeCount === w.totalMembers;
  return (
    <div
      className="glow relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg,#4AC959,#2C8C39)",
        border: "3px solid #05070D",
        borderRadius: 26,
        padding: "30px 28px",
      }}
    >
      <div className="pop">
        <div className="flex items-baseline justify-between font-semibold text-[#083012]">
          <span className="text-xs uppercase tracking-[.16em]">ช่วงที่ดีที่สุด</span>
          <span className="text-[13px] tabular-nums opacity-85">
            {formatShort(w.startDate)} → {formatShort(w.endDate)}
          </span>
        </div>
        <p
          className="my-2 font-bold text-white"
          style={{ fontSize: "clamp(44px,9vw,74px)", lineHeight: 1, textShadow: "0 2px 12px rgba(0,0,0,.35)" }}
        >
          {formatRange(w.startDate, w.endDate)}
        </p>
        <p className="mb-3.5 text-[17px] font-semibold text-[#0A3315]">
          {w.freeCount} of {w.totalMembers} free{full ? " — ครบทีม!" : ""}
        </p>
        {!full && w.missingMemberNames.length > 0 ? (
          <p className="mb-3.5 text-sm font-medium text-[#0A3315]/80">ยังไม่ว่าง: {w.missingMemberNames.join(", ")}</p>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          {crew.map((c, i) => (
            <div key={i} className="h-[54px] w-[46px]" style={{ filter: "drop-shadow(0 6px 5px rgba(0,0,0,.35))" }}>
              <Crewmate body={c.body} shade={c.shade} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RunnerUpCard({ window: w, index }: { window: RankedWindow; index: number }) {
  return (
    <div className="panel-flat" style={{ borderRadius: 18, padding: 20 }}>
      <p className="m-0 text-[11px] uppercase tracking-[.14em] text-[#5E6E88]">ตัวเลือก {index + 2}</p>
      <p className="mb-2.5 mt-2 text-[32px] font-bold leading-none text-star">{formatRange(w.startDate, w.endDate)}</p>
      <p className="m-0 text-sm text-[#93A2BC] tabular-nums">
        {w.freeCount} of {w.totalMembers} free
      </p>
      {w.missingMemberNames.length > 0 ? (
        <p className="mt-1 text-[13px] text-[#6B7B94]">ยังไม่ว่าง: {w.missingMemberNames.join(", ")}</p>
      ) : null}
    </div>
  );
}
