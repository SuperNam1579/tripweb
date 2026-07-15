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
        <div className="panel" style={{ padding: 28 }}>
          <h1 className="text-3xl font-bold">ไม่พบทริปนี้</h1>
        </div>
      </Shell>
    );
  }

  if (!member) {
    return (
      <Shell tripId={tripId}>
        <div className="panel" style={{ padding: 28 }}>
          <h1 className="text-3xl font-bold">เข้าร่วมก่อนนะ</h1>
          <p className="mt-3 text-[#B7C4DA]">
            มาร์กวันได้เฉพาะสมาชิกทริป เปิดลิงก์เข้าร่วมจากกลุ่มแชท ใส่ชื่อ แล้วกลับมาที่นี่
          </p>
        </div>
      </Shell>
    );
  }

  const rows = await prisma.availability.findMany({
    where: { memberId: member.id, isFree: true },
    select: { date: true },
  });

  return (
    <Shell tripId={tripId}>
      <header className="mb-5">
        <span className="pill pill-cyan">Task 02</span>
        <h1
          className="mt-3.5 font-bold text-[#F4F8FF]"
          style={{ fontSize: "clamp(28px,5vw,42px)", lineHeight: 1.05, textShadow: "0 1px 8px rgba(0,0,0,.4)" }}
        >
          มาร์กวันที่คุณว่าง
        </h1>
        <p className="m-0 text-[#93A2BC]">แตะวันที่ไปได้ (หรือลากทีเดียวหลายวัน) — ระบบหาช่วงที่ทุกคนตรงกันให้</p>
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
    <main className="mx-auto w-full max-w-[580px] flex-1 px-6 pb-28 pt-10">
      <Link href={`/trip/${tripId}`} className="mb-5 inline-block text-sm text-cyan hover:underline">
        ← กลับลอบบี้
      </Link>
      {children}
    </main>
  );
}
