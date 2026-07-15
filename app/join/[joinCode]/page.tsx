import Link from "next/link";
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
      <main className="mx-auto w-full max-w-[620px] flex-1 px-6 py-16">
        <Link href="/join" className="mb-6 inline-block text-sm text-cyan hover:underline">
          ← ลองใส่โค้ดอีกครั้ง
        </Link>
        <div className="panel" style={{ padding: 28 }}>
          <h1 className="font-bold" style={{ fontSize: "clamp(26px,5vw,36px)" }}>
            ลิงก์นี้ไม่เจอทริป
          </h1>
          <p className="mt-3 text-[#B7C4DA]">
            โค้ด <span className="text-sun" style={{ letterSpacing: ".18em" }}>{joinCode}</span>{" "}
            ไม่ตรงกับทริปไหนเลย ลองขอลิงก์เข้าร่วมจากเพื่อนอีกที
          </p>
        </div>
      </main>
    );
  }

  // Already joined on this device → straight into the trip.
  const member = await getMember(trip.id);
  if (member) redirect(`/trip/${trip.id}`);

  const takenColors = (
    await prisma.member.findMany({
      where: { tripId: trip.id, color: { not: null } },
      select: { color: true },
    })
  ).map((m) => m.color!);

  return (
    <main className="mx-auto w-full max-w-[620px] flex-1 px-6 pb-20 pt-11">
      <Link href="/" className="mb-6 inline-block text-sm text-cyan hover:underline">
        ← กลับหน้าแรก
      </Link>
      <div className="reveal text-center">
        <span className="pill pill-cyan">You&apos;re invited</span>
        <h1
          className="mt-4 font-bold text-[#F4F8FF]"
          style={{ fontSize: "clamp(30px,5vw,44px)", lineHeight: 1.08, textShadow: "0 1px 8px rgba(0,0,0,.4)" }}
        >
          {trip.name}
        </h1>
        <p className="m-0 text-[#93A2BC]">
          {trip.durationDays} วัน · {formatShort(toDateKey(trip.windowStart))} – {formatShort(toDateKey(trip.windowEnd))} ·{" "}
          {trip._count.members} คนในลอบบี้
        </p>
      </div>

      <div className="panel mt-6" style={{ padding: 28 }}>
        <JoinForm joinCode={trip.joinCode} takenColors={takenColors} />
        <p className="mt-4 text-center text-[13px] text-fog">
          ไม่ต้องรหัสผ่าน · งบของคุณเป็นความลับ กลุ่มเห็นแค่ยอดรวม
        </p>
      </div>
    </main>
  );
}
