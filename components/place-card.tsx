import type { Place } from "@/lib/places";
import type { BudgetSignal } from "@/lib/budget";

/** "฿" glyphs for a Google price level, e.g. 2 → ฿฿. */
function priceGlyphs(level: number) {
  return "฿".repeat(Math.max(1, level || 1));
}

function SignalBadge({ signal }: { signal: BudgetSignal }) {
  // Suppression rule: below 3 submitted budgets, render nothing.
  if (signal.tier === "INSUFFICIENT_DATA") return null;
  const { label, color } =
    signal.tier === "EVERYONE_AFFORDS"
      ? { label: "สบายงบ", color: "#50EF39" }
      : signal.tier === "MOST_AFFORD"
        ? { label: "พอดีงบ", color: "#50EF39" }
        : {
            label: `เกินงบ ${signal.overCount} คน`,
            color: "#F6F657",
          };
  return (
    <span
      className="inline-block rounded-full px-3 py-[5px] text-xs"
      style={{ background: `${color}26`, color }}
    >
      {label}
    </span>
  );
}

export function PlaceCard({ place, signal }: { place: Place; signal: BudgetSignal }) {
  return (
    <article className="panel-flat overflow-hidden" style={{ borderRadius: 18 }}>
      <div style={{ aspectRatio: "16 / 10", background: "#0B1220", borderBottom: "3px solid #05070D" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={place.photoUrl} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="px-4 py-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-[20px] font-semibold text-[#EEF3FB]">{place.name}</h3>
          <span className="flex-none text-sm text-sun">{priceGlyphs(place.priceLevel)}</span>
        </div>
        <p className="mb-3 mt-px truncate text-[13px] text-fog">
          {place.address} · ★ {place.rating.toFixed(1)}
        </p>
        <SignalBadge signal={signal} />
      </div>
    </article>
  );
}
