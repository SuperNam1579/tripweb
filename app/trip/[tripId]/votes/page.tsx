import Link from "next/link";
import { VoteBallot, type BallotCategory } from "@/components/vote-ballot";
import { getMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ACTIVITY_OPTIONS, REGION_OPTIONS, tallyVotes } from "@/lib/votes";

export default async function VotesPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const member = await getMember(tripId);

  if (!member) {
    return (
      <Shell tripId={tripId}>
        <h1 className="font-display text-3xl font-bold tracking-tight">Join first</h1>
        <p className="mt-3 text-ink/80">
          Voting is for trip members. Open the join link from the group chat,
          enter your name, and come back here.
        </p>
      </Shell>
    );
  }

  const votes = await prisma.vote.findMany({ where: { tripId } });

  function build(
    category: "REGION" | "ACTIVITY",
    title: string,
    options: readonly string[],
  ): BallotCategory {
    const values = votes.filter((v) => v.category === category).map((v) => v.value);
    return {
      category,
      title,
      options,
      myVote:
        votes.find((v) => v.category === category && v.memberId === member!.id)
          ?.value ?? null,
      counts: Object.fromEntries(
        tallyVotes(values, options).map((t) => [t.value, t.count]),
      ),
    };
  }

  return (
    <Shell tripId={tripId}>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Where should this trip go?
        </h1>
        <p className="mt-2 text-ink/80">
          One vote per question. Change your mind any time — your new pick
          replaces the old one.
        </p>
      </header>

      <VoteBallot
        tripId={tripId}
        categories={[
          build("REGION", "Which part of Thailand?", REGION_OPTIONS),
          build("ACTIVITY", "What's the vibe?", ACTIVITY_OPTIONS),
        ]}
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
