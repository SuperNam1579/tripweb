import type { Place } from "@/lib/places";
import type { BudgetSignal } from "@/lib/budget";
import { cn } from "@/lib/utils";

/** "฿" glyphs for a Google price level, e.g. 2 → ฿฿. */
function priceGlyphs(level: number) {
  return "฿".repeat(Math.max(1, level || 1));
}

function TierBadge({ signal }: { signal: BudgetSignal }) {
  // Suppression rule: below 3 submitted budgets, render nothing.
  if (signal.tier === "INSUFFICIENT_DATA") return null;
  const styles: Record<string, string> = {
    EVERYONE_AFFORDS: "bg-teal/15 text-teal",
    MOST_AFFORD: "bg-teal/10 text-teal/90",
    OVER_SOME_BUDGETS: "bg-ink/5 text-slate",
  };
  const label =
    signal.tier === "EVERYONE_AFFORDS"
      ? "Fits everyone's budget"
      : signal.tier === "MOST_AFFORD"
        ? "Fits most budgets"
        : `Over ${signal.overCount} ${signal.overCount === 1 ? "budget" : "budgets"}`;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-[11px]",
        styles[signal.tier],
      )}
    >
      {label}
    </span>
  );
}

export function PlaceCard({
  place,
  signal,
}: {
  place: Place;
  signal: BudgetSignal;
}) {
  return (
    <article className="flex gap-3 rounded-lg border border-border bg-card p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={place.photoUrl}
        alt=""
        width={72}
        height={72}
        className="size-18 shrink-0 rounded-md border border-border object-cover"
      />
      <div className="min-w-0">
        <h3 className="truncate font-medium leading-snug">{place.name}</h3>
        <p className="mt-0.5 truncate text-xs text-slate">{place.address}</p>
        <p className="mt-1 font-mono text-xs tabular-nums text-ink/70">
          ★ {place.rating.toFixed(1)} · {priceGlyphs(place.priceLevel)}
        </p>
        <div className="mt-1.5">
          <TierBadge signal={signal} />
        </div>
      </div>
    </article>
  );
}
