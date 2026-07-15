import Link from "next/link";
import { BudgetForm } from "@/components/budget-form";
import { getMember } from "@/lib/auth";
import { MIN_BUDGETS_FOR_SIGNAL, groupBudgetView } from "@/lib/budget";
import { prisma } from "@/lib/db";

export default async function BudgetPage({
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
            ตั้งงบได้เฉพาะสมาชิกทริป เปิดลิงก์เข้าร่วมจากกลุ่มแชท ใส่ชื่อ แล้วกลับมาที่นี่
          </p>
        </div>
      </Shell>
    );
  }

  // My own amount may be shown back to me; everyone else's stays aggregate.
  const [myBudget, amounts, totalMembers] = await Promise.all([
    prisma.budget.findUnique({ where: { memberId: member.id } }),
    prisma.budget.findMany({ where: { tripId }, select: { amount: true } }),
    prisma.member.count({ where: { tripId } }),
  ]);
  const view = groupBudgetView(amounts.map((a) => a.amount), totalMembers);

  return (
    <Shell tripId={tripId}>
      <header className="mb-5">
        <span className="pill pill-sun">Task 03</span>
        <h1
          className="mt-3.5 font-bold text-[#F4F8FF]"
          style={{ fontSize: "clamp(28px,5vw,42px)", lineHeight: 1.05, textShadow: "0 1px 8px rgba(0,0,0,.4)" }}
        >
          ตั้งงบของคุณ
        </h1>
        <p className="m-0 text-[#93A2BC]">
          ช่วงงบต่อคนสำหรับทั้งทริป — <strong className="text-sun">เป็นความลับ</strong> ไม่มีใครในทีมเห็น
        </p>
      </header>

      <div className="panel" style={{ padding: 28 }}>
        <BudgetForm
          tripId={tripId}
          initialAmount={myBudget?.amount ?? null}
          initialAmountMax={myBudget?.amountMax ?? null}
        />
      </div>

      <section
        className="mt-5 flex items-start gap-3"
        style={{ background: "rgba(56,254,220,.06)", border: "2px solid rgba(56,254,220,.25)", borderRadius: 15, padding: "16px 18px" }}
      >
        <span
          aria-hidden
          className="mt-1.5 h-2.5 w-2.5 flex-none rounded-full bg-cyan"
          style={{ boxShadow: "0 0 8px rgba(56,254,220,.6)" }}
        />
        <p className="m-0 text-sm text-[#B7C4DA]">
          ทีมเห็นแค่ค่ากลาง (median) และเริ่มโชว์เมื่อมีคนกรอกครบ {MIN_BUDGETS_FOR_SIGNAL} คนขึ้นไป —
          ต่ำกว่านั้นซ่อนหมด เดาเลขใครไม่ได้.{" "}
          <span className="tabular-nums text-star">
            ตอนนี้ {view.submittedCount} จาก {view.totalMembers} คน
          </span>
          {view.hasSignal ? " — สัญญาณงบเปิดใช้แล้วในหน้าแนะนำที่เที่ยว" : ""}
        </p>
      </section>
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
