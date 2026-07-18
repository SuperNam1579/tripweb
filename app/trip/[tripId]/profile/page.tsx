import Link from "next/link";
import { EditProfileForm } from "@/components/edit-profile-form";
import { getMember } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ProfilePage({
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
            แก้ไขข้อมูลได้เฉพาะสมาชิกทริป เปิดลิงก์เข้าร่วมจากกลุ่มแชท ใส่ชื่อ แล้วกลับมาที่นี่
          </p>
        </div>
      </Shell>
    );
  }

  // Colours already claimed by everyone else — my own doesn't count as taken.
  const others = await prisma.member.findMany({
    where: { tripId, id: { not: member.id }, color: { not: null } },
    select: { color: true },
  });

  return (
    <Shell tripId={tripId}>
      <header className="mb-5">
        <span className="pill pill-cyan">โปรไฟล์ของฉัน</span>
        <h1
          className="mt-3.5 font-bold text-[#F4F8FF]"
          style={{ fontSize: "clamp(28px,5vw,42px)", lineHeight: 1.05, textShadow: "0 1px 8px rgba(0,0,0,.4)" }}
        >
          แก้ไขชื่อ &amp; สีของฉัน
        </h1>
        <p className="m-0 text-[#93A2BC]">พิมพ์ชื่อผิดหรืออยากเปลี่ยนสีตัวละคร แก้ตรงนี้ได้เลย</p>
      </header>

      <div className="panel" style={{ padding: 28 }}>
        <EditProfileForm
          tripId={tripId}
          currentName={member.displayName}
          currentColor={member.color ?? ""}
          takenColors={others.map((m) => m.color!)}
        />
      </div>
    </Shell>
  );
}

function Shell({ tripId, children }: { tripId: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[580px] flex-1 px-6 pb-24 pt-10">
      <Link href={`/trip/${tripId}`} className="mb-5 inline-block text-sm text-cyan hover:underline">
        ← กลับลอบบี้
      </Link>
      {children}
    </main>
  );
}
