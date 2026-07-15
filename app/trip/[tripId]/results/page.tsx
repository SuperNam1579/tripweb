import Link from "next/link";
import { PlaceCard } from "@/components/place-card";
import { TicketStub } from "@/components/ticket-stub";
import { getMember, getOwnerTrip } from "@/lib/auth";
import { bestWindow, rankWindows } from "@/lib/availability";
import { budgetSignal, recommendationThreshold } from "@/lib/budget";
import { toDateKey } from "@/lib/dates";
import { prisma } from "@/lib/db";
import { PRICE_LEVEL_THB, searchPlaces, type Place } from "@/lib/places";
import { ACTIVITY_OPTIONS, REGION_OPTIONS, winner } from "@/lib/votes";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [member, owner] = await Promise.all([
    getMember(tripId),
    getOwnerTrip(tripId),
  ]);

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      members: {
        orderBy: { joinedAt: "asc" },
        include: { availability: { where: { isFree: true }, select: { date: true } } },
      },
      votes: true,
      // Amounts stay on the server: only aggregate signals are rendered below.
      budgets: { select: { amount: true } },
    },
  });

  if (!trip) {
    return (
      <Shell tripId={tripId}>
        <h1 className="font-display text-3xl font-bold tracking-tight">Trip not found</h1>
      </Shell>
    );
  }
  if (!member && !owner) {
    return (
      <Shell tripId={tripId}>
        <h1 className="font-display text-3xl font-bold tracking-tight">Members only</h1>
        <p className="mt-3 text-ink/80">
          Open the join link from the group chat first, then come back for the results.
        </p>
      </Shell>
    );
  }

  const windows = rankWindows({
    members: trip.members.map((m) => ({
      memberId: m.id,
      displayName: m.displayName,
      freeDates: m.availability.map((a) => toDateKey(a.date)),
    })),
    durationDays: trip.durationDays,
    windowStart: toDateKey(trip.windowStart),
    windowEnd: toDateKey(trip.windowEnd),
  });
  const best = bestWindow(windows);
  const anyMarked = trip.members.some((m) => m.availability.length > 0);

  // Votes → the group's leaning
  const regionVotes = trip.votes.filter((v) => v.category === "REGION").map((v) => v.value);
  const activityVotes = trip.votes.filter((v) => v.category === "ACTIVITY").map((v) => v.value);
  const region = winner(regionVotes, REGION_OPTIONS);
  const activity = winner(activityVotes, ACTIVITY_OPTIONS);

  // Budget threshold (median) — suppressed below 3 submissions
  const amounts = trip.budgets.map((b) => b.amount);
  const threshold = recommendationThreshold(amounts);

  let places: Place[] = [];
  if (region && activity) {
    places = await searchPlaces(region, activity, { limit: 6 });
    if (threshold !== null) {
      const affordable = places.filter(
        (p) => estimatedCost(p, trip.durationDays) <= threshold,
      );
      // Never show an empty list because of the filter — keep the closest fits.
      places = affordable.length >= 3 ? affordable : places.slice(0, 4);
    }
  }

  return (
    <Shell tripId={tripId}>
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal">Results</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {trip.name}
        </h1>
        <p className="mt-2 text-ink/80">
          Top date windows for{" "}
          <span className="font-mono tabular-nums">{trip.durationDays}</span> days,
          ranked by who can actually come.
        </p>
      </header>

      {windows.length === 0 || !anyMarked ? (
        <section className="rounded-lg border border-dashed border-border bg-card/60 p-6 text-center">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            No dates to rank yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink/80">
            Once someone marks the days they&apos;re free, the best date windows
            appear here as tickets.
          </p>
          <Link
            href={`/trip/${tripId}/availability`}
            className="mt-4 inline-flex h-11 items-center rounded-md bg-signal px-5 font-display font-semibold text-ink hover:brightness-95"
          >
            Mark the days you&apos;re free
          </Link>
        </section>
      ) : (
        <section aria-label="Best date windows" className="flex flex-col gap-5">
          {windows.map((w, i) => (
            <TicketStub
              key={w.startDate}
              window={w}
              index={i}
              isBest={w.startDate === best?.startDate}
            />
          ))}
        </section>
      )}

      <section aria-labelledby="places-heading" className="mt-12">
        <h2 id="places-heading" className="font-display text-2xl font-bold tracking-tight">
          Where the group is leaning
        </h2>
        {region && activity ? (
          <>
            <p className="mt-2 text-sm text-ink/80">
              <span className="font-medium text-teal">{region}</span> ×{" "}
              <span className="font-medium text-teal">{activity}</span>
              {threshold !== null
                ? " — filtered to fit the group's budgets."
                : amounts.length > 0
                  ? " — budget fit appears once 3+ budgets are in."
                  : ""}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {places.map((p) => (
                <PlaceCard
                  key={p.placeId}
                  place={p}
                  signal={budgetSignal(estimatedCost(p, trip.durationDays), amounts)}
                />
              ))}
            </div>
          </>
        ) : (
          <p className="mt-2 rounded-lg border border-dashed border-border bg-card/60 p-5 text-sm text-ink/80">
            Place ideas appear once the group has voted on a region and a vibe.{" "}
            <Link href={`/trip/${tripId}/votes`} className="text-teal underline underline-offset-4">
              Cast your vote
            </Link>
            .
          </p>
        )}
      </section>
    </Shell>
  );
}

/** Rough per-person cost of the whole trip anchored around a place. */
function estimatedCost(place: Place, durationDays: number): number {
  return PRICE_LEVEL_THB[place.priceLevel] * durationDays;
}

function Shell({ tripId, children }: { tripId: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8 sm:py-12">
      <Link
        href={`/trip/${tripId}`}
        className="mb-6 inline-block font-mono text-xs uppercase tracking-widest text-teal hover:underline"
      >
        ← Back to the trip
      </Link>
      {children}
    </main>
  );
}
