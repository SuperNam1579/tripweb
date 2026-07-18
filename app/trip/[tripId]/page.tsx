import Link from "next/link";
import { ClaimOwner } from "@/components/claim-owner";
import { CopyButton } from "@/components/copy-button";
import { Crewmate } from "@/components/crewmate";
import { JoinCodeBadge } from "@/components/join-code-badge";
import { MyProfileCard } from "@/components/my-profile-card";
import { RememberTrip } from "@/components/remember-trip";
import { RemoveMemberButton } from "@/components/remove-member-button";
import { RosterRow } from "@/components/roster-row";
import { TaskList, type RouteStop } from "@/components/route-line";
import { TaskReminderBanner } from "@/components/task-reminder-banner";
import { getMember, getOwnerTrip } from "@/lib/auth";
import { median } from "@/lib/budget";
import { crewRoster, resolveCrewColor } from "@/lib/crew";
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
        <div className="panel" style={{ padding: 28 }}>
          <h1 className="text-3xl font-bold">ไม่พบทริปนี้</h1>
          <p className="mt-3 text-[#B7C4DA]">ทริปนี้อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>
        </div>
      </Shell>
    );
  }

  if (!ownerTrip && !member) {
    return (
      <Shell>
        <div className="panel" style={{ padding: 28 }}>
          <span className="pill pill-cyan">TripSync</span>
          <h1 className="mt-4 text-3xl font-bold">{trip.name}</h1>
          <p className="mt-3 text-[#B7C4DA]">
            อุปกรณ์นี้ยังไม่ได้อยู่ในทริป — ขอ<strong className="text-star"> ลิงก์เข้าร่วม </strong>
            จากกลุ่มแล้วเปิดได้เลย เท่านั้นเอง
          </p>
        </div>
      </Shell>
    );
  }

  const windowText = `${formatShort(toDateKey(trip.windowStart))} – ${formatShort(toDateKey(trip.windowEnd))}`;
  const statusText =
    trip.status === "DECIDED" ? "Decided" : trip.status === "ARCHIVED" ? "Archived" : "Lobby · Planning";

  return (
    <Shell>
      {ownerTrip && ownerParam ? (
        <ClaimOwner tripId={tripId} ownerToken={ownerParam} keepUrl={created === "1"} />
      ) : null}
      {ownerTrip || member ? (
        <RememberTrip tripId={tripId} name={trip.name} role={ownerTrip ? "owner" : "member"} />
      ) : null}

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="pill pill-cyan">{statusText}</span>
          <h1
            className="mt-3.5 font-bold text-[#F4F8FF]"
            style={{ fontSize: "clamp(30px,5vw,44px)", lineHeight: 1.05, textShadow: "0 1px 8px rgba(0,0,0,.4)" }}
          >
            {trip.name}
          </h1>
          {trip.destination ? (
            <p className="mt-1 mb-0 text-[15px] font-semibold text-cyan">จุดหมาย: {trip.destination}</p>
          ) : null}
          <p className="m-0 text-[#93A2BC]">
            {trip.durationDays} วัน ระหว่าง {windowText}
            {ownerTrip ? (
              <>
                {" "}
                ·{" "}
                <Link href={`/trip/${tripId}/dates`} className="text-cyan hover:underline">
                  แก้ไขวันที่
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <JoinCodeBadge joinCode={trip.joinCode} joinPath={`/join/${trip.joinCode}`} />
      </header>

      <TaskReminderBanner
        total={trip.members.length}
        availDone={trip.members.filter((m) => m._count.availability > 0).length}
        budgetDone={trip.members.filter((m) => m.budget).length}
        votesDone={trip.members.filter((m) => m._count.votes >= 1).length}
        windowStart={toDateKey(trip.windowStart)}
      />

      {ownerTrip && created === "1" && ownerParam ? (
        <OwnerLinkOnce tripId={tripId} ownerToken={ownerParam} />
      ) : null}

      {ownerTrip ? (
        <OwnerDashboard trip={trip} viewerMemberId={member?.id} />
      ) : (
        <MemberHub trip={trip} memberId={member!.id} />
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[760px] flex-1 px-6 pb-20 pt-10">
      <Link href="/" className="mb-5 inline-block text-sm text-cyan hover:underline">
        ← หน้าแรก
      </Link>
      {children}
    </main>
  );
}

function OwnerLinkOnce({ tripId, ownerToken }: { tripId: string; ownerToken: string }) {
  const path = `/trip/${tripId}?owner=${ownerToken}`;
  return (
    <section
      className="mb-6"
      style={{ background: "rgba(237,84,186,.08)", border: "3px solid #ED54BA", borderRadius: 20, padding: 22 }}
    >
      <h2 className="text-lg font-semibold text-star">ลิงก์เจ้าของ — โชว์ครั้งเดียวเท่านั้น</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#B7C4DA]">
        นี่คือทางเดียวที่จะกลับเข้าหน้าเจ้าของ (เห็นงบ + สถานะสมาชิก) บุ๊กมาร์กหรือเก็บไว้ที่ลับ{" "}
        <strong>อย่าแปะในกลุ่มแชท</strong> — ใช้ลิงก์เข้าร่วมด้านล่างแทน
      </p>
      <p
        className="mt-3 break-all rounded-lg px-3 py-2 font-mono text-xs text-[#DCE6F5]"
        style={{ background: "#0B1220", border: "2px solid #1C2740" }}
      >
        {path}
      </p>
      <div className="mt-3">
        <CopyButton value={path} label="คัดลอกลิงก์เจ้าของ" variant="dark" />
      </div>
    </section>
  );
}

/* —————————————————— Shared task-board stops —————————————————— */

interface MemberRow {
  id: string;
  displayName: string;
  color: string | null;
  _count: { availability: number; votes: number };
  /** amount/amountMax are present only when the viewer is the verified owner. */
  budget: { id: string; amount?: number; amountMax?: number | null } | null;
}

interface TripWithMembers {
  id: string;
  name: string;
  joinCode: string;
  durationDays: number;
  members: MemberRow[];
}

/**
 * The task stops, shared by owner and member views. When the viewer is also
 * a member, each stop reflects THEIR progress (done/current/todo). When the
 * viewer is an owner who never joined, there's no "my next step" — stops
 * fall back to whether the whole crew has finished that step.
 */
function buildTaskStops(trip: TripWithMembers, viewerMemberId?: string): RouteStop[] {
  const base = `/trip/${trip.id}`;
  const total = trip.members.length;
  const availDone = trip.members.filter((m) => m._count.availability > 0).length;
  const budgetDone = trip.members.filter((m) => m.budget).length;
  const votesDone = trip.members.filter((m) => m._count.votes >= 1).length;

  if (viewerMemberId) {
    const me = trip.members.find((m) => m.id === viewerMemberId);
    const myAvail = (me?._count.availability ?? 0) > 0;
    const myBudget = Boolean(me?.budget);
    const myVotes = (me?._count.votes ?? 0) >= 1;
    const firstTodo = !myAvail ? "availability" : !myBudget ? "budget" : !myVotes ? "votes" : "results";

    return [
      {
        key: "availability",
        label: "มาร์กวันที่ว่าง",
        meta: `${availDone} จาก ${total} มาร์กแล้ว`,
        href: `${base}/availability`,
        state: myAvail ? "done" : firstTodo === "availability" ? "current" : "todo",
      },
      {
        key: "budget",
        label: "ตั้งงบของฉัน",
        meta: `${budgetDone} จาก ${total} กรอกแล้ว · ลับ`,
        href: `${base}/budget`,
        state: myBudget ? "done" : firstTodo === "budget" ? "current" : "todo",
      },
      {
        key: "votes",
        label: "โหวตแนวที่อยากไป",
        meta: `${votesDone} จาก ${total} โหวตแล้ว`,
        href: `${base}/votes`,
        state: myVotes ? "done" : firstTodo === "votes" ? "current" : "todo",
      },
      {
        key: "results",
        label: "ดูวันที่ดีที่สุด",
        meta: availDone > 0 ? "พร้อมแล้วเมื่อคุณพร้อม" : "ต้องมีอย่างน้อยหนึ่งคนมาร์กวัน",
        href: `${base}/results`,
        state: firstTodo === "results" ? "current" : "todo",
      },
    ];
  }

  // Owner-only, not a participant: show the crew's aggregate progress.
  return [
    {
      key: "availability",
      label: "มาร์กวันที่ว่าง",
      meta: `${availDone} จาก ${total} มาร์กแล้ว`,
      href: `${base}/availability`,
      state: total > 0 && availDone === total ? "done" : "todo",
    },
    {
      key: "budget",
      label: "งบของทีม",
      meta: `${budgetDone} จาก ${total} กรอกแล้ว · ลับ`,
      href: `${base}/budget`,
      state: total > 0 && budgetDone === total ? "done" : "todo",
    },
    {
      key: "votes",
      label: "โหวตแนวที่อยากไป",
      meta: `${votesDone} จาก ${total} โหวตแล้ว`,
      href: `${base}/votes`,
      state: total > 0 && votesDone === total ? "done" : "todo",
    },
    {
      key: "results",
      label: "ดูวันที่ดีที่สุด",
      meta: availDone > 0 ? "พร้อมดูผลได้เลย" : "ต้องมีอย่างน้อยหนึ่งคนมาร์กวัน",
      href: `${base}/results`,
      state: availDone > 0 ? "current" : "todo",
    },
  ];
}

/* —————————————————— Owner dashboard —————————————————— */

function OwnerDashboard({ trip, viewerMemberId }: { trip: TripWithMembers; viewerMemberId?: string }) {
  const roster = crewRoster(trip.members);
  const me = trip.members.find((m) => m.id === viewerMemberId);
  const ranges = trip.members
    .filter((m): m is MemberRow & { budget: { amount: number; amountMax?: number | null } } =>
      typeof m.budget?.amount === "number",
    )
    .map((m) => ({ min: m.budget.amount, max: m.budget.amountMax ?? m.budget.amount }));
  const medMin = median(ranges.map((r) => r.min));
  const medMax = median(ranges.map((r) => r.max));

  return (
    <div className="flex flex-col gap-6">
      {me ? <MyProfileCard tripId={trip.id} name={me.displayName} crew={resolveCrewColor(me)} /> : null}

      <TaskList stops={buildTaskStops(trip, viewerMemberId)}>
        <RosterRow tripId={trip.id} members={roster} />
      </TaskList>

      <section className="panel" style={{ padding: 22 }}>
        <h2 className="text-[19px] font-semibold text-[#EEF3FB]">ใครทำอะไรไปแล้ว</h2>
        {trip.members.length === 0 ? (
          <p className="mt-2 text-sm text-fog">ยังไม่มีใครเข้าร่วม — แชร์ลิงก์เข้าร่วมแล้วตารางนี้จะเติมเอง</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[26rem] text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-fog" style={{ borderBottom: "2px solid #1C2740" }}>
                  <th className="py-2 pr-3 font-medium">สมาชิก</th>
                  <th className="py-2 pr-3 font-medium">วันว่าง</th>
                  <th className="py-2 pr-3 font-medium">งบ</th>
                  <th className="py-2 pr-3 font-medium">โหวต</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {trip.members.map((m) => {
                  const c = resolveCrewColor(m);
                  return (
                    <tr key={m.id} style={{ borderBottom: "1px solid rgba(28,39,64,.6)" }}>
                      <td className="py-2.5 pr-3">
                        <span className="flex items-center gap-2 font-medium text-star">
                          <span className="inline-block h-5 w-[18px]">
                            <Crewmate body={c.body} shade={c.shade} />
                          </span>
                          {m.displayName}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <Check done={m._count.availability > 0} label={`${m._count.availability} วัน`} />
                      </td>
                      <td className="py-2.5 pr-3">
                        {m.budget?.amount !== undefined ? (
                          <span className="tabular-nums text-sun">
                            ฿{m.budget.amount.toLocaleString("en-US")}
                            {m.budget.amountMax && m.budget.amountMax !== m.budget.amount
                              ? `–${m.budget.amountMax.toLocaleString("en-US")}`
                              : ""}
                          </span>
                        ) : (
                          <Check done={false} label="" />
                        )}
                      </td>
                      <td className="py-2.5 pr-3">
                        <Check done={m._count.votes >= 1} label="" />
                      </td>
                      <td className="py-2.5 text-right">
                        {m.id !== viewerMemberId ? (
                          <RemoveMemberButton tripId={trip.id} memberId={m.id} memberName={m.displayName} />
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {ranges.length > 0 ? (
          <p className="mt-3 pt-3 text-sm text-fog" style={{ borderTop: "2px dashed #1C2740" }}>
            ช่วงงบค่ากลาง (median):{" "}
            <span className="font-medium tabular-nums text-sun">
              ฿{medMin?.toLocaleString("en-US")}–{medMax?.toLocaleString("en-US")}
            </span>{" "}
            ({ranges.length} จาก {trip.members.length} คน) — เห็นได้แค่คุณคนเดียว
          </p>
        ) : null}
        {!viewerMemberId ? (
          <p className="mt-3 text-sm text-fog">จะไปเองด้วยไหม? เปิดลิงก์เข้าร่วมด้วย จะได้มาร์กวันของตัวเองได้</p>
        ) : null}
      </section>
    </div>
  );
}

function Check({ done, label }: { done: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${done ? "text-[#7BE089]" : "text-fog"}`}>
      <span aria-hidden>{done ? "✓" : "—"}</span>
      <span>{done ? label || "เสร็จ" : label || "ยัง"}</span>
    </span>
  );
}

/* —————————————————— Member hub —————————————————— */

function MemberHub({ trip, memberId }: { trip: TripWithMembers; memberId: string }) {
  const roster = crewRoster(trip.members);
  const me = trip.members.find((m) => m.id === memberId);

  return (
    <div className="flex flex-col gap-[22px]">
      {me ? <MyProfileCard tripId={trip.id} name={me.displayName} crew={resolveCrewColor(me)} /> : null}

      <TaskList stops={buildTaskStops(trip, memberId)}>
        <RosterRow tripId={trip.id} members={roster} />
      </TaskList>

      <p className="px-0.5 text-sm text-fog">แตะภารกิจด้านบนเพื่ออัปเดตส่วนของคุณ</p>
    </div>
  );
}
