import { redirect } from "next/navigation";
import { JoinForm } from "@/components/join-form";
import { getMember } from "@/lib/auth";
import { formatShort, toDateKey } from "@/lib/dates";
import { prisma } from "@/lib/db";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ joinCode: string }>;
}) {
  const { joinCode } = await params;
  const trip = await prisma.trip.findUnique({
    where: { joinCode: joinCode.toUpperCase() },
    include: { _count: { select: { members: true } } },
  });

  if (!trip) {
    return (
      <main className="mx-auto w-full max-w-lg flex-1 px-5 py-16">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          That link doesn&apos;t go anywhere
        </h1>
        <p className="mt-3 text-ink/80">
          The join code <span className="font-mono">{joinCode}</span> doesn&apos;t
          match any trip. Ask whoever shared it to paste the join link again.
        </p>
      </main>
    );
  }

  // Already joined on this device → straight into the trip.
  const member = await getMember(trip.id);
  if (member) redirect(`/trip/${trip.id}`);

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-5 py-10 sm:py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal">
        You&apos;re invited
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight">
        {trip.name}
      </h1>
      <p className="mt-3 text-ink/80">
        <span className="font-mono tabular-nums">{trip.durationDays}</span> days,
        sometime between{" "}
        <span className="font-mono">{formatShort(toDateKey(trip.windowStart))}</span> and{" "}
        <span className="font-mono">{formatShort(toDateKey(trip.windowEnd))}</span>.{" "}
        <span className="font-mono tabular-nums">{trip._count.members}</span>{" "}
        {trip._count.members === 1 ? "person is" : "people are"} in so far.
      </p>

      <div className="mt-8 rounded-lg border border-border bg-card p-5 sm:p-6">
        <JoinForm joinCode={trip.joinCode} />
        <p className="mt-4 text-sm text-slate">
          No password, no sign-up. Your budget stays private — the group only
          ever sees totals.
        </p>
      </div>
    </main>
  );
}
