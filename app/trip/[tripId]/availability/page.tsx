import Link from "next/link";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { getMember } from "@/lib/auth";
import { toDateKey } from "@/lib/dates";
import { prisma } from "@/lib/db";

export default async function AvailabilityPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const member = await getMember(tripId);
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });

  if (!trip) {
    return (
      <Shell tripId={tripId}>
        <h1 className="font-display text-3xl font-bold tracking-tight">Trip not found</h1>
      </Shell>
    );
  }

  if (!member) {
    return (
      <Shell tripId={tripId}>
        <h1 className="font-display text-3xl font-bold tracking-tight">Join first</h1>
        <p className="mt-3 text-ink/80">
          Marking days is for trip members. Open the join link from the group
          chat, enter your name, and come back here.
        </p>
      </Shell>
    );
  }

  const rows = await prisma.availability.findMany({
    where: { memberId: member.id, isFree: true },
    select: { date: true },
  });

  return (
    <Shell tripId={tripId}>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Mark the days you&apos;re free
        </h1>
        <p className="mt-2 text-ink/80">
          Tap a day, or drag across a run of days. Anything you don&apos;t mark
          counts as busy.
        </p>
      </header>
      <AvailabilityCalendar
        tripId={tripId}
        windowStart={toDateKey(trip.windowStart)}
        windowEnd={toDateKey(trip.windowEnd)}
        initialFree={rows.map((r) => toDateKey(r.date))}
      />
    </Shell>
  );
}

function Shell({ tripId, children }: { tripId: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-5 py-8 sm:py-12">
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
