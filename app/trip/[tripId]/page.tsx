import Link from "next/link";
import { ClaimOwner } from "@/components/claim-owner";
import { CopyButton } from "@/components/copy-button";
import { RouteLine, type RouteStop } from "@/components/route-line";
import { getMember, getOwnerTrip } from "@/lib/auth";
import { median } from "@/lib/budget";
import { formatShort, toDateKey } from "@/lib/dates";
import { prisma } from "@/lib/db";

export default async function TripPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ owner?: string; created?: string }>;
}) {
  const { tripId } = await params;
  const { owner: ownerParam, created } = await searchParams;

  const [ownerTrip, member] = await Promise.all([
    getOwnerTrip(tripId, ownerParam),
    getMember(tripId),
  ]);

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      members: {
        orderBy: { joinedAt: "asc" },
        include: {
          _count: { select: { availability: true, votes: true } },
          budget: ownerTrip ? true : { select: { id: true } },
        },
      },
    },
  });

  if (!trip) {
    return (
      <Shell>
        <h1 className="font-display text-3xl font-bold tracking-tight">Trip not found</h1>
        <p className="mt-3 text-ink/80">
          This trip may have been deleted, or the link is wrong.
        </p>
      </Shell>
    );
  }

  if (!ownerTrip && !member) {
    return (
      <Shell>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal">TripSync</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">{trip.name}</h1>
        <p className="mt-3 text-ink/80">
          You&apos;re not in this trip on this device yet. Ask the group for the{" "}
          <strong>join link</strong> and open it — that&apos;s all it takes.
        </p>
      </Shell>
    );
  }

  const windowText = `${formatShort(toDateKey(trip.windowStart))} – ${formatShort(toDateKey(trip.windowEnd))}`;

  return (
    <Shell wide>
      {ownerTrip && ownerParam ? (
        <ClaimOwner tripId={tripId} ownerToken={ownerParam} keepUrl={created === "1"} />
      ) : null}

      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal">
          {trip.status === "DECIDED" ? "Decided" : trip.status === "ARCHIVED" ? "Archived" : "Planning"}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {trip.name}
        </h1>
        <p className="mt-2 text-ink/80">
          <span className="font-mono tabular-nums">{trip.durationDays}</span> days between{" "}
          <span className="font-mono">{windowText}</span>
        </p>
      </header>

      {ownerTrip && created === "1" && ownerParam ? (
        <OwnerLinkOnce tripId={tripId} ownerToken={ownerParam} />
      ) : null}

      {ownerTrip ? (
        <OwnerDashboard trip={trip} isAlsoMember={Boolean(member)} />
      ) : (
        <MemberHub trip={trip} memberId={member!.id} />
      )}
    </Shell>
  );
}

function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <main className={`mx-auto w-full ${wide ? "max-w-2xl" : "max-w-lg"} flex-1 px-5 py-8 sm:py-12`}>
      {children}
    </main>
  );
}

function OwnerLinkOnce({ tripId, ownerToken }: { tripId: string; ownerToken: string }) {
  const path = `/trip/${tripId}?owner=${ownerToken}`;
  return (
    <section className="mb-8 rounded-lg border-2 border-signal bg-signal/10 p-5">
      <h2 className="font-display text-lg font-semibold tracking-tight">
        Save your owner link — it&apos;s shown only this once
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink/80">
        This link is the only way back into the owner view (budgets, member
        status). Bookmark it or paste it somewhere private.{" "}
        <strong>Don&apos;t put it in the group chat</strong> — share the join
        link below instead.
      </p>
      <p className="mt-3 break-all rounded-md bg-card px-3 py-2 font-mono text-xs">{path}</p>
      <div className="mt-3">
        <OwnerLinkCopy path={path} />
      </div>
    </section>
  );
}

function OwnerLinkCopy({ path }: { path: string }) {
  return <CopyButton value={path} label="Copy owner link" className="bg-ink hover:bg-ink/90" />;
}

/* —————————————————— Owner dashboard —————————————————— */

interface MemberRow {
  id: string;
  displayName: string;
  _count: { availability: number; votes: number };
  /** amount is present only when the viewer is the verified owner. */
  budget: { id: string; amount?: number } | null;
}

interface TripWithMembers {
  id: string;
  name: string;
  joinCode: string;
  durationDays: number;
  members: MemberRow[];
}

function OwnerDashboard({
  trip,
  isAlsoMember,
}: {
  trip: TripWithMembers;
  isAlsoMember: boolean;
}) {
  const joinPath = `/join/${trip.joinCode}`;
  const amounts = trip.members
    .map((m) => m.budget?.amount)
    .filter((a): a is number => typeof a === "number");
  const med = median(amounts);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Invite the group
        </h2>
        <p className="mt-1 text-sm text-slate">
          Safe to paste in the group chat. Join code:{" "}
          <span className="font-mono text-base font-medium tracking-widest text-ink">
            {trip.joinCode}
          </span>
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <CopyButton value={joinPath} label="Share join link" />
          <Link href={joinPath} className="text-sm text-teal underline underline-offset-4">
            Open join page
          </Link>
        </div>
        {!isAlsoMember ? (
          <p className="mt-3 text-sm text-slate">
            Going yourself? Open the join link too, so you can mark your own days.
          </p>
        ) : null}
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Who&apos;s done what
        </h2>
        {trip.members.length === 0 ? (
          <p className="mt-2 text-sm text-slate">
            Nobody has joined yet. Share the join link and this fills in by itself.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-104 text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-[11px] uppercase tracking-wider text-slate">
                  <th className="py-2 pr-3 font-medium">Member</th>
                  <th className="py-2 pr-3 font-medium">Days</th>
                  <th className="py-2 pr-3 font-medium">Budget</th>
                  <th className="py-2 font-medium">Votes</th>
                </tr>
              </thead>
              <tbody>
                {trip.members.map((m) => (
                  <tr key={m.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{m.displayName}</td>
                    <td className="py-2.5 pr-3">
                      <Check done={m._count.availability > 0} label={`${m._count.availability} marked`} />
                    </td>
                    <td className="py-2.5 pr-3">
                      {m.budget?.amount !== undefined ? (
                        <span className="font-mono tabular-nums">
                          ฿{m.budget.amount.toLocaleString("en-US")}
                        </span>
                      ) : (
                        <Check done={false} label="" />
                      )}
                    </td>
                    <td className="py-2.5">
                      <Check done={m._count.votes >= 2} label={m._count.votes === 1 ? "1 of 2" : ""} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {amounts.length > 0 ? (
          <p className="mt-3 border-t border-dashed border-border pt-3 text-sm text-slate">
            Median budget:{" "}
            <span className="font-mono font-medium tabular-nums text-ink">
              ฿{med?.toLocaleString("en-US")}
            </span>{" "}
            ({amounts.length} of {trip.members.length} submitted). Only you can see
            these figures.
          </p>
        ) : null}
      </section>

      <Link
        href={`/trip/${trip.id}/results`}
        className="flex h-12 items-center justify-center rounded-md bg-signal px-6 font-display text-base font-semibold text-ink hover:brightness-95"
      >
        Show the best dates
      </Link>
    </div>
  );
}

function Check({ done, label }: { done: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs ${done ? "text-teal" : "text-slate"}`}>
      <span aria-hidden>{done ? "✓" : "—"}</span>
      <span>{done ? label || "done" : label || "not yet"}</span>
    </span>
  );
}

/* —————————————————— Member hub —————————————————— */

function MemberHub({
  trip,
  memberId,
}: {
  trip: TripWithMembers;
  memberId: string;
}) {
  const me = trip.members.find((m) => m.id === memberId);
  const total = trip.members.length;
  const availDone = trip.members.filter((m) => m._count.availability > 0).length;
  const budgetDone = trip.members.filter((m) => m.budget).length;
  const votesDone = trip.members.filter((m) => m._count.votes >= 2).length;

  const base = `/trip/${trip.id}`;
  const myAvail = (me?._count.availability ?? 0) > 0;
  const myBudget = Boolean(me?.budget);
  const myVotes = (me?._count.votes ?? 0) >= 2;

  const firstTodo = !myAvail ? "availability" : !myBudget ? "budget" : !myVotes ? "votes" : "results";

  const stops: RouteStop[] = [
    {
      key: "join",
      label: "Join the trip",
      meta: `${total} aboard`,
      state: "done",
    },
    {
      key: "availability",
      label: "Mark the days you're free",
      meta: `${availDone} of ${total} have marked days`,
      href: `${base}/availability`,
      state: myAvail ? "done" : firstTodo === "availability" ? "current" : "todo",
    },
    {
      key: "budget",
      label: "Save my budget",
      meta: `${budgetDone} of ${total} submitted — amounts stay private`,
      href: `${base}/budget`,
      state: myBudget ? "done" : firstTodo === "budget" ? "current" : "todo",
    },
    {
      key: "votes",
      label: "Vote region & vibe",
      meta: `${votesDone} of ${total} have voted`,
      href: `${base}/votes`,
      state: myVotes ? "done" : firstTodo === "votes" ? "current" : "todo",
    },
    {
      key: "results",
      label: "Show the best dates",
      meta: availDone > 0 ? "Ready when you are" : "Needs at least one calendar",
      href: `${base}/results`,
      state: firstTodo === "results" ? "current" : "todo",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <RouteLine stops={stops} />
      <p className="text-sm text-slate">
        You&apos;re aboard as <strong className="text-ink">{me?.displayName}</strong>.
        Tap any stop to update your part.
      </p>
    </div>
  );
}
