import Link from "next/link";
import { VoteBallot, type BallotCategory } from "@/components/vote-ballot";
import { getMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ACTIVITY_OPTIONS, tallyVotes } from "@/lib/votes";

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
        <div className="panel" style={{ padding: 28 }}>
          <h1 className="text-3xl font-bold">เข้าร่วมก่อนนะ</h1>
          <p className="mt-3 text-[#B7C4DA]">
            โหวตได้เฉพาะสมาชิกทริป เปิดลิงก์เข้าร่วมจากกลุ่มแชท ใส่ชื่อ แล้วกลับมาที่นี่
          </p>
        </div>
      </Shell>
    );
  }

  const [trip, votes] = await Promise.all([
    prisma.trip.findUnique({ where: { id: tripId }, select: { destination: true } }),
    prisma.vote.findMany({ where: { tripId, category: "ACTIVITY" } }),
  ]);

  const values = votes.map((v) => v.value);
  const activityBallot: BallotCategory = {
    category: "ACTIVITY",
    title: "แนวที่อยากไป",
    options: ACTIVITY_OPTIONS,
    myVote: votes.find((v) => v.memberId === member.id)?.value ?? null,
    counts: Object.fromEntries(tallyVotes(values, ACTIVITY_OPTIONS).map((t) => [t.value, t.count])),
  };

  return (
    <Shell tripId={tripId}>
      <header className="mb-6 text-center">
        <span className="pill pill-red">Emergency Meeting</span>
        <h1
          className="mt-4 font-bold text-[#F4F8FF]"
          style={{ fontSize: "clamp(28px,5vw,42px)", lineHeight: 1.05, textShadow: "0 1px 8px rgba(0,0,0,.4)" }}
        >
          โหวตแนวที่อยากไป
        </h1>
        <p className="m-0 text-[#93A2BC]">
          {trip?.destination ? (
            <>
              ทริปไป <span className="text-cyan">{trip.destination}</span> — เลือกว่าอยากเที่ยวแนวไหน
              เดี๋ยวระบบหาที่จริงให้
            </>
          ) : (
            "เลือกว่าอยากเที่ยวแนวไหน เดี๋ยวระบบหาที่จริงให้"
          )}
        </p>
      </header>

      <VoteBallot tripId={tripId} resultsHref={`/trip/${tripId}/results`} categories={[activityBallot]} />
    </Shell>
  );
}

function Shell({ tripId, children }: { tripId: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[620px] flex-1 px-6 pb-24 pt-10">
      <Link href={`/trip/${tripId}`} className="mb-5 inline-block text-sm text-cyan hover:underline">
        ← กลับลอบบี้
      </Link>
      {children}
    </main>
  );
}
