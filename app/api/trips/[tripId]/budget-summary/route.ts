import { NextResponse } from "next/server";
import { getMember, getOwnerTrip } from "@/lib/auth";
import { groupBudgetView } from "@/lib/budget";
import { prisma } from "@/lib/db";

/**
 * Member-facing budget endpoint. By construction it can only return
 * aggregate counts (lib/budget.ts groupBudgetView) — never an amount.
 * Individual amounts exist ONLY on the owner-verified dashboard.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tripId: string }> },
) {
  const { tripId } = await params;
  const [member, owner] = await Promise.all([
    getMember(tripId),
    getOwnerTrip(tripId),
  ]);
  if (!member && !owner) {
    return NextResponse.json({ error: "Not a member of this trip" }, { status: 403 });
  }

  const [amounts, totalMembers] = await Promise.all([
    prisma.budget.findMany({ where: { tripId }, select: { amount: true } }),
    prisma.member.count({ where: { tripId } }),
  ]);

  return NextResponse.json(
    groupBudgetView(amounts.map((a) => a.amount), totalMembers),
  );
}
