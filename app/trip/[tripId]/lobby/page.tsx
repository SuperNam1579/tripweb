import Link from "next/link";
import { LobbyRoom } from "@/components/lobby-room";
import { getMember, getOwnerTrip } from "@/lib/auth";
import { crewRoster } from "@/lib/crew";
import { prisma } from "@/lib/db";

export default async function LobbyPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [member, owner] = await Promise.all([getMember(tripId), getOwnerTrip(tripId)]);

  if (!member && !owner) {
    return (
      <Shell tripId={tripId}>
        <div className="panel" style={{ padding: 28 }}>
          <h1 className="text-3xl font-bold">เฉพาะสมาชิก</h1>
          <p className="mt-3 text-[#B7C4DA]">เปิดลิงก์เข้าร่วมจากกลุ่มแชทก่อน แล้วค่อยกลับมาดูห้อง</p>
        </div>
      </Shell>
    );
  }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { members: { orderBy: { joinedAt: "asc" } } },
  });

  if (!trip) {
    return (
      <Shell tripId={tripId}>
        <div className="panel" style={{ padding: 28 }}>
          <h1 className="text-3xl font-bold">ไม่พบทริปนี้</h1>
        </div>
      </Shell>
    );
  }

  const roster = crewRoster(trip.members);

  return (
    <Shell tripId={tripId}>
      <header className="mb-5">
        <span className="pill pill-cyan">Crew Quarters</span>
        <h1
          className="mt-3.5 font-bold text-[#F4F8FF]"
          style={{ fontSize: "clamp(28px,5vw,42px)", lineHeight: 1.05, textShadow: "0 1px 8px rgba(0,0,0,.4)" }}
        >
          ห้องลูกเรือ
        </h1>
        <p className="m-0 text-[#93A2BC]">
          {trip.members.length === 0 ? "ยังไม่มีใครเข้าร่วม" : `${trip.members.length} คนกำลังรอ`}
        </p>
      </header>

      {roster.length === 0 ? (
        <div className="panel text-center" style={{ padding: 28 }}>
          <p className="text-[#B7C4DA]">ยังไม่มีใครในห้อง — แชร์ลิงก์เข้าร่วมแล้วกลับมาดูใหม่</p>
        </div>
      ) : (
        <LobbyRoom members={roster} />
      )}
    </Shell>
  );
}

function Shell({ tripId, children }: { tripId: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[720px] flex-1 px-6 pb-24 pt-10">
      <Link href={`/trip/${tripId}`} className="mb-5 inline-block text-sm text-cyan hover:underline">
        ← กลับลอบบี้
      </Link>
      {children}
    </main>
  );
}
