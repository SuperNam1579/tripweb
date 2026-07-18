import type { Hotel } from "@/lib/places";

/**
 * A place to stay. Shows no price on purpose — Google publishes none for
 * lodging, so the honest move is to send people to the booking sites (links
 * live on the section header, not per-card) rather than invent a number.
 */
export function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <article className="panel-flat flex items-center gap-3.5" style={{ borderRadius: 18, padding: 16 }}>
      <span
        aria-hidden
        className="grid h-11 w-11 flex-none place-items-center rounded-xl text-lg"
        style={{ background: "#151F33", border: "2px solid #05070D" }}
      >
        🛏
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[17px] font-semibold text-[#EEF3FB]">{hotel.name}</h3>
        <p className="mt-px truncate text-[13px] text-fog">{hotel.address}</p>
        {hotel.userRatingCount > 0 ? (
          <p className="mt-1 text-[13px] text-sun tabular-nums">
            ★ {hotel.rating.toFixed(1)}{" "}
            <span className="text-fog">({hotel.userRatingCount.toLocaleString("en-US")} รีวิว)</span>
          </p>
        ) : null}
      </div>
      {hotel.mapsUri ? (
        <a
          href={hotel.mapsUri}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-none rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ background: "rgba(56,254,220,.14)", color: "#38FEDC", border: "2px solid rgba(56,254,220,.3)" }}
        >
          แผนที่
        </a>
      ) : null}
    </article>
  );
}
