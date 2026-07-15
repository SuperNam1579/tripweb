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
        <h1 className="font-display text-3xl font-bold tracking-tight">Join first</h1>
        <p className="mt-3 text-ink/80">
          Budgets are for trip members. Open the join link from the group chat,
          enter your name, and come back here.
        </p>
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
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Save my budget
        </h1>
        <p className="mt-2 text-ink/80">
          Only the trip owner ever sees your number. The group sees totals like
          &ldquo;4 of 6 submitted&rdquo; — never amounts, never names.
        </p>
      </header>

      <div className="rounded-lg border border-border bg-card p-5">
        <BudgetForm tripId={tripId} initialAmount={myBudget?.amount ?? null} />
      </div>

      <section className="mt-6 rounded-lg border border-dashed border-border bg-card/60 p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-slate">
          Group status
        </h2>
        <p className="mt-2 font-mono text-lg tabular-nums">
          {view.submittedCount} of {view.totalMembers} budgets in
        </p>
        <p className="mt-1 text-sm text-slate">
          {view.hasSignal
            ? "Budget fit now shows on place recommendations."
            : `Budget signals unlock at ${MIN_BUDGETS_FOR_SIGNAL} submissions, so no one's number can be guessed.`}
        </p>
      </section>
    </Shell>
  );
}

function Shell({ tripId, children }: { tripId: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-5 py-8 sm:py-12">
      <Link
        href={`/trip/${tripId}`}
        className="mb-6 inline-block font-mono text-xs uppercase tracking-widest text-teal hover:underline"
      >
        ← Back to the trip
      </Link>
      {children}
    </main>
  );
}
