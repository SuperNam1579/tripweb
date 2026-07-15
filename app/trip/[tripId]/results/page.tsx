import Link from "next/link";
import { PlaceCard } from "@/components/place-card";
import { BestWindowCard, RunnerUpCard } from "@/components/ticket-stub";
import { getMember, getOwnerTrip } from "@/lib/auth";
import { bestWindow, rankWindows } from "@/lib/availability";
import { budgetSignal, recommendationThreshold } from "@/lib/budget";
import { crewRoster, type CrewColor } from "@/lib/crew";
import { toDateKey } from "@/lib/dates";
import { prisma } from "@/lib/db";
import { PRICE_LEVEL_THB, searchPlaces, type Place } from "@/lib/places";
import { ACTIVITY_OPTIONS, REGION_OPTIONS, winner } from "@/lib/votes";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [member, owner] = await Promise.all([getMember(tripId), getOwnerTrip(tripId)]);

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      members: {
        orderBy: { joinedAt: "asc" },
        include: { availability: { where: { isFree: true }, select: { date: true } } },
      },
      votes: true,
      // Amounts stay on the server: only aggregate signals are rendered below.
      budgets: { select: { amount: true, amountMax: true } },
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

  // Votes → the group's leaning
  const regionVotes = trip.votes.filter((v) => v.category === "REGION").map((v) => v.value);
  const activityVotes = trip.votes.filter((v) => v.category === "ACTIVITY").map((v) => v.value);
  const region = winner(regionVotes, REGION_OPTIONS);
  const activity = winner(activityVotes, ACTIVITY_OPTIONS);

  // Budget threshold (median of everyone's range max) — suppressed below 3 submissions
  const ranges = trip.budgets.map((b) => ({ min: b.amount, max: b.amountMax ?? b.amount }));
  const threshold = recommendationThreshold(ranges);

  let places: Place[] = [];
  if (region && activity) {
    places = await searchPlaces(region, activity, { limit: 6 });
    if (threshold !== null) {
      const affordable = places.filter((p) => estimatedCost(p, trip.durationDays) <= threshold);
      // Never show an empty list because of the filter — keep the closest fits.
      places = affordable.length >= 3 ? affordable : places.slice(0, 4);
    }
  }

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

      <section aria-labelledby="places-heading" className="mt-10">
        <h2
          id="places-heading"
          className="font-bold text-[#F4F8FF]"
          style={{ fontSize: "clamp(24px,4vw,34px)", textShadow: "0 1px 8px rgba(0,0,0,.4)" }}
        >
          ทีมกำลังเอนไปทาง
        </h2>
        {region && activity ? (
          <>
            <p className="mb-4 mt-1 text-sm text-[#93A2BC]">
              <span className="text-cyan">{region}</span> × <span className="text-cyan">{activity}</span>
              {threshold !== null
                ? " — กรองให้พอดีงบทีมแล้ว"
                : ranges.length > 0
                  ? " — สัญญาณงบจะโชว์เมื่อครบ 3 คน"
                  : ""}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {places.map((p) => (
                <PlaceCard
                  key={p.placeId}
                  place={p}
                  signal={budgetSignal(estimatedCost(p, trip.durationDays), ranges)}
                />
              ))}
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-[#B7C4DA]">
            ที่เที่ยวจะโผล่มาเมื่อทีมโหวตภูมิภาคกับสไตล์แล้ว{" "}
            <Link href={`/trip/${tripId}/votes`} className="text-cyan underline underline-offset-4">
              ไปโหวตเลย
            </Link>
          </p>
        )}
      </section>
    </Shell>
  );
}

/** Rough per-person cost of the whole trip anchored around a place. */
function estimatedCost(place: Place, durationDays: number): number {
  return PRICE_LEVEL_THB[place.priceLevel] * durationDays;
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
