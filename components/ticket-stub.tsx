import type { RankedWindow } from "@/lib/availability";
import { formatRange, formatShort } from "@/lib/dates";
import { cn } from "@/lib/utils";

/**
 * A ranked date window as a perforated ticket stub. The best window gets
 * --signal; the rest stay quiet. See DESIGN.md — this is the payoff screen.
 */
export function TicketStub({
  window: w,
  isBest,
  index,
}: {
  window: RankedWindow;
  isBest: boolean;
  index: number;
}) {
  const full = w.freeCount === w.totalMembers;
  return (
    <article
      className="ticket-stub stub-reveal"
      style={
        {
          "--stub-index": index,
          "--stub-bg": isBest ? "var(--color-signal)" : "var(--color-card)",
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          "rounded-t-lg border border-b-0 px-5 pt-5 pb-4",
          isBest ? "border-signal bg-signal text-ink" : "border-border bg-card",
        )}
      >
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-widest opacity-70">
            {isBest ? "Best dates" : `Option ${index + 1}`}
          </p>
          <p className="hidden font-mono text-[11px] tabular-nums opacity-70 sm:block">
            {formatShort(w.startDate)} → {formatShort(w.endDate)}
          </p>
        </div>
        <p className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {formatRange(w.startDate, w.endDate)}
        </p>
      </div>
      <div
        className={cn(
          "border border-y-0 px-5 pb-4",
          isBest ? "border-signal bg-signal text-ink" : "border-border bg-card",
        )}
      >
        <div
          className={cn(
            "border-t border-dashed pt-3",
            isBest ? "border-ink/25" : "border-border",
          )}
        >
          <p className="font-mono text-sm font-medium tabular-nums">
            {w.freeCount} of {w.totalMembers} free{full ? " — everyone" : ""}
          </p>
          {!full && w.missingMemberNames.length > 0 ? (
            <p className={cn("mt-1 text-sm", isBest ? "text-ink/70" : "text-slate")}>
              Missing: {w.missingMemberNames.join(", ")}
            </p>
          ) : null}
        </div>
      </div>
      <div className="ticket-perforation" aria-hidden />
    </article>
  );
}
