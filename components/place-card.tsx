import type { BudgetSignal } from "@/lib/budget";
import type { Place, PriceRange } from "@/lib/places";

/** "฿" glyphs for a Google price level, e.g. 2 → ฿฿. */
function priceGlyphs(level: 0 | 1 | 2 | 3 | 4) {
  return level === 0 ? "ฟรี" : "฿".repeat(level);
}

function formatPriceRange({ min, max, currency }: PriceRange) {
  const symbol = currency === "THB" ? "฿" : `${currency} `;
  return `${symbol}${min.toLocaleString("en-US")}–${max.toLocaleString("en-US")}`;
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

/**
 * Price shown only when Google actually published one — a real THB range if
 * available, else the ฿ level, else nothing. Never inferred: most attractions
 * have no price data, and defaulting made every card claim a bogus "฿".
 *
 * `signal` is optional: budget-fit badges stay off until real accommodation
 * costs exist (Google publishes no lodging prices — see lib/booking-links.ts).
 */
export function PlaceCard({ place, signal }: { place: Place; signal?: BudgetSignal }) {
  const price = place.priceRange
    ? formatPriceRange(place.priceRange)
    : place.priceLevel !== null
      ? priceGlyphs(place.priceLevel)
      : null;

  return (
    <article className="panel-flat overflow-hidden" style={{ borderRadius: 18 }}>
      <div style={{ aspectRatio: "16 / 10", background: "#0B1220", borderBottom: "3px solid #05070D" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={place.photoUrl} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="px-4 py-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-[20px] font-semibold text-[#EEF3FB]">{place.name}</h3>
          {price ? <span className="flex-none text-sm tabular-nums text-sun">{price}</span> : null}
        </div>
        <p className="mt-px truncate text-[13px] text-fog">
          {place.address}
          {place.rating > 0 ? ` · ★ ${place.rating.toFixed(1)}` : ""}
        </p>
        {signal ? (
          <div className="mt-3">
            <SignalBadge signal={signal} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
