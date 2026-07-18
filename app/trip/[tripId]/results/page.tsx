import Link from "next/link";
import { HotelCard } from "@/components/hotel-card";
import { PlaceCard } from "@/components/place-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { BestWindowCard, RunnerUpCard } from "@/components/ticket-stub";
import { getMember, getOwnerTrip } from "@/lib/auth";
import { bestWindow, rankWindows } from "@/lib/availability";
import { agodaSearchUrl, bookingSearchUrl } from "@/lib/booking-links";
import { crewRoster, type CrewColor } from "@/lib/crew";
import { formatRange, toDateKey } from "@/lib/dates";
import { prisma } from "@/lib/db";
import { searchHotels, searchPlaces, type Hotel, type Place, type StayStyle } from "@/lib/places";
import { ACTIVITY_OPTIONS, winner } from "@/lib/votes";

const STAY_STYLES: { value: StayStyle; label: string }[] = [
  { value: "hotel", label: "โรงแรม" },
  { value: "villa", label: "พูลวิลล่า" },
  { value: "homestay", label: "บ้านพัก" },
];

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ stay?: string }>;
}) {
  const { tripId } = await params;
  const { stay } = await searchParams;
  const stayStyle: StayStyle = STAY_STYLES.some((s) => s.value === stay) ? (stay as StayStyle) : "hotel";
  const [member, owner] = await Promise.all([getMember(tripId), getOwnerTrip(tripId)]);

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      members: {
        orderBy: { joinedAt: "asc" },
        include: { availability: { where: { isFree: true }, select: { date: true } } },
      },
      votes: { where: { category: "ACTIVITY" } },
    },
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
  if (!member && !owner) {
    return (
      <Shell tripId={tripId}>
        <div className="panel" style={{ padding: 28 }}>
          <h1 className="text-3xl font-bold">เฉพาะสมาชิก</h1>
          <p className="mt-3 text-[#B7C4DA]">เปิดลิงก์เข้าร่วมจากกลุ่มแชทก่อน แล้วค่อยกลับมาดูผล</p>
        </div>
      </Shell>
    );
  }

  const windows = rankWindows({
    members: trip.members.map((m) => ({
      memberId: m.id,
      displayName: m.displayName,
      freeDates: m.availability.map((a) => toDateKey(a.date)),
    })),
    durationDays: trip.durationDays,
    windowStart: toDateKey(trip.windowStart),
    windowEnd: toDateKey(trip.windowEnd),
  });
  const best = bestWindow(windows);
  const anyMarked = trip.members.some((m) => m.availability.length > 0);

  // Crew colours by member name, for the best-window line-up.
  const roster = crewRoster(trip.members);
  const crewByName = new Map<string, CrewColor>(roster.map((m) => [m.displayName, m.crew]));
  const bestCrew: CrewColor[] = best
    ? best.freeMemberNames.map((n) => crewByName.get(n)).filter((c): c is CrewColor => Boolean(c))
    : [];

  // The owner sets the destination; the group votes on the vibe. Together they
  // drive the real Google Places search. (Budget-fit filtering is paused until
  // hotel costs exist — see PlaceCard.)
  const activity = winner(
    trip.votes.map((v) => v.value),
    ACTIVITY_OPTIONS,
  );
  const destination = trip.destination?.trim() || null;

  // A Places outage (missing key, quota, network) must never take down the date
  // rankings above — those are the whole point of the page.
  let places: Place[] = [];
  let placesUnavailable = false;
  if (destination && activity) {
    try {
      places = await searchPlaces(destination, activity, { limit: 6 });
    } catch (e) {
      console.error("Places search failed:", e);
      placesUnavailable = true;
    }
  }

  // Stays only need the destination — they don't wait on the vibe vote.
  let hotels: Hotel[] = [];
  if (destination) {
    try {
      hotels = await searchHotels(destination, stayStyle, { limit: 5 });
    } catch (e) {
      console.error("Hotel search failed:", e);
    }
  }

  // Check in on day 1 and out on the last day: a 3-day trip is 2 nights.
  const stayLinks =
    destination && best
      ? {
          agoda: agodaSearchUrl({
            destination,
            checkIn: best.startDate,
            checkOut: best.endDate,
            adults: trip.members.length,
          }),
          booking: bookingSearchUrl({
            destination,
            checkIn: best.startDate,
            checkOut: best.endDate,
            adults: trip.members.length,
          }),
        }
      : null;

  const runnerUps = best ? windows.filter((w) => w.startDate !== best.startDate).slice(0, 2) : [];

  return (
    <Shell tripId={tripId}>
      <header className="mb-7 text-center">
        <span className="pill pill-cyan">Meeting Results</span>
        <h1
          className="mt-4 font-bold text-[#F4F8FF]"
          style={{ fontSize: "clamp(28px,5vw,44px)", lineHeight: 1.05, textShadow: "0 1px 8px rgba(0,0,0,.4)" }}
        >
          วันที่ทีมไปได้จริง
        </h1>
        <p className="m-0 text-[#93A2BC]">
          จัดอันดับช่วง {trip.durationDays} วัน จากคนที่มาได้
        </p>
      </header>

      {windows.length === 0 || !anyMarked || !best ? (
        <section className="panel text-center" style={{ padding: 28 }}>
          <h2 className="text-xl font-semibold text-[#EEF3FB]">ยังจัดอันดับวันไม่ได้</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[#B7C4DA]">
            พอมีคนมาร์กวันว่าง ช่วงวันที่ดีที่สุดจะโผล่มาตรงนี้เลย
          </p>
          <Link
            href={`/trip/${tripId}/availability`}
            className="btn btn-green mt-4 inline-flex px-5 py-3"
          >
            มาร์กวันที่ว่าง
          </Link>
        </section>
      ) : (
        <section aria-label="Best date windows">
          <BestWindowCard window={best} crew={bestCrew} />
          {runnerUps.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {runnerUps.map((w, i) => (
                <RunnerUpCard key={w.startDate} window={w} index={i} />
              ))}
            </div>
          ) : null}
        </section>
      )}

      <ScrollReveal>
        <section aria-labelledby="places-heading" className="mt-10">
          <h2
            id="places-heading"
            className="font-bold text-[#F4F8FF]"
            style={{ fontSize: "clamp(24px,4vw,34px)", textShadow: "0 1px 8px rgba(0,0,0,.4)" }}
          >
            ที่เที่ยวแนะนำ
          </h2>
          {destination && activity ? (
            placesUnavailable ? (
              <p className="mt-3 text-sm text-[#B7C4DA]">
                ตอนนี้ดึงที่เที่ยวไม่ได้ — ลองรีเฟรชอีกที (วันที่ด้านบนยังใช้ได้ปกติ)
              </p>
            ) : places.length > 0 ? (
              <>
                <p className="mb-4 mt-1 text-sm text-[#93A2BC]">
                  แนว <span className="text-cyan">{activity}</span> ใน <span className="text-cyan">{destination}</span>
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {places.map((p) => (
                    <PlaceCard key={p.placeId} place={p} />
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-[#B7C4DA]">
                ไม่เจอที่เที่ยวแนว <span className="text-cyan">{activity}</span> ใน{" "}
                <span className="text-cyan">{destination}</span> — ลองเปลี่ยนแนวโหวตดู
              </p>
            )
          ) : !destination ? (
            <p className="mt-3 text-sm text-[#B7C4DA]">
              ทริปนี้ยังไม่ได้ตั้งจุดหมาย — เจ้าของทริปสร้างทริปใหม่พร้อมระบุจุดหมายได้เลย
            </p>
          ) : (
            <p className="mt-3 text-sm text-[#B7C4DA]">
              ที่เที่ยวจะโผล่มาเมื่อทีมโหวตแนวที่อยากไปแล้ว{" "}
              <Link href={`/trip/${tripId}/votes`} className="text-cyan underline underline-offset-4">
                ไปโหวตเลย
              </Link>
            </p>
          )}
        </section>
      </ScrollReveal>

      {destination ? (
        <ScrollReveal>
        <section aria-labelledby="stays-heading" className="mt-10">
          <h2
            id="stays-heading"
            className="font-bold text-[#F4F8FF]"
            style={{ fontSize: "clamp(24px,4vw,34px)", textShadow: "0 1px 8px rgba(0,0,0,.4)" }}
          >
            ที่พักใน{destination}
          </h2>
          <p className="mb-4 mt-1 text-sm text-[#93A2BC]">
            เรียงตามเรตติ้ง + จำนวนรีวิว —{" "}
            <span className="text-fog">Google ไม่เปิดเผยราคาที่พัก กดดูราคาจริงได้ที่ปุ่มด้านล่าง</span>
          </p>

          <div className="mb-4 flex flex-wrap gap-2">
            {STAY_STYLES.map((s) => {
              const active = s.value === stayStyle;
              return (
                <Link
                  key={s.value}
                  href={`/trip/${tripId}/results?stay=${s.value}`}
                  scroll={false}
                  className="rounded-xl px-3.5 py-2 text-sm font-semibold"
                  style={{
                    background: active ? "#38FEDC" : "#151F33",
                    border: "3px solid #05070D",
                    color: active ? "#062B27" : "#C6D2E6",
                    boxShadow: active ? "0 4px 0 #1C9E9C" : "0 4px 0 #0C1220",
                  }}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>

          {hotels.length > 0 ? (
            <div className="flex flex-col gap-3">
              {hotels.map((h) => (
                <HotelCard key={h.placeId} hotel={h} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#B7C4DA]">
              ไม่เจอ{STAY_STYLES.find((s) => s.value === stayStyle)?.label}ใน {destination} — ลองสไตล์อื่นดู
            </p>
          )}

          {stayLinks ? (
            <div className="mt-5">
              <p className="mb-2.5 text-sm text-[#B7C4DA]">
                ดูราคาจริงของช่วง <span className="text-cyan">{formatRange(best!.startDate, best!.endDate)}</span> สำหรับ{" "}
                {trip.members.length} คน:
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={stayLinks.agoda}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-cyan px-5 py-3 text-sm"
                >
                  เช็คราคาบน Agoda →
                </a>
                <a
                  href={stayLinks.booking}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-dark px-5 py-3 text-sm"
                >
                  เช็คราคาบน Booking →
                </a>
              </div>
            </div>
          ) : null}
        </section>
        </ScrollReveal>
      ) : null}
    </Shell>
  );
}

function Shell({ tripId, children }: { tripId: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[820px] flex-1 px-6 pb-24 pt-10">
      <Link href={`/trip/${tripId}`} className="mb-5 inline-block text-sm text-cyan hover:underline">
        ← กลับลอบบี้
      </Link>
      {children}
    </main>
  );
}
