import Link from "next/link";
import { EditTripDatesForm } from "@/components/edit-trip-dates-form";
import { getOwnerTrip } from "@/lib/auth";
import { toDateKey } from "@/lib/dates";

export default async function EditDatesPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await getOwnerTrip(tripId);

  if (!trip) {
    return (
      <Shell tripId={tripId}>
        <div className="panel" style={{ padding: 28 }}>
          <h1 className="text-3xl font-bold">เฉพาะเจ้าของทริป</h1>
          <p className="mt-3 text-[#B7C4DA]">แก้ไขวันที่ได้เฉพาะคนที่สร้างทริปนี้เท่านั้น</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell tripId={tripId}>
      <header className="mb-5">
        <span className="pill pill-cyan">Owner Only</span>
        <h1
          className="mt-3.5 font-bold text-[#F4F8FF]"
          style={{ fontSize: "clamp(28px,5vw,42px)", lineHeight: 1.05, textShadow: "0 1px 8px rgba(0,0,0,.4)" }}
        >
          ปรับวันที่ของทริป
        </h1>
        <p className="m-0 text-[#93A2BC]">
          ปรับความยาวทริปหรือช่วงวันที่หาได้ตลอด — ถ้ามีคนมาร์กวันว่างไว้แล้ว วันที่หลุดช่วงใหม่จะหายไปตอนเขาบันทึกรอบถัดไป
        </p>
      </header>

      <div className="panel" style={{ padding: 28 }}>
        <EditTripDatesForm
          tripId={tripId}
          currentDurationDays={trip.durationDays}
          currentWindowStart={toDateKey(trip.windowStart)}
          currentWindowEnd={toDateKey(trip.windowEnd)}
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
