import { NextResponse } from "next/server";
import { getMember, getOwnerTrip } from "@/lib/auth";
import { toDateKey } from "@/lib/dates";
import { prisma } from "@/lib/db";

/**
 * "My Trips" lookup. The client only ever holds trip ids (see
 * lib/my-trips.ts) — never owner or member tokens. This route re-verifies
 * each id against the caller's own httpOnly cookies (owner OR member) before
 * returning anything, so a tampered or shared id list reveals nothing this
 * browser doesn't already belong to.
 */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("ids") ?? "";
  const ids = [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))].slice(0, 50);

  if (ids.length === 0) return NextResponse.json({ trips: [] });

  const verified = await Promise.all(
    ids.map(async (id) => {
      const [owner, member] = await Promise.all([getOwnerTrip(id), getMember(id)]);
      if (owner) return { id, role: "owner" as const };
      if (member) return { id, role: "member" as const };
      return null;
    }),
  );
  const roleById = new Map(
    verified.filter((v): v is NonNullable<typeof v> => v !== null).map((v) => [v.id, v.role]),
  );

  if (roleById.size === 0) return NextResponse.json({ trips: [] });

  const trips = await prisma.trip.findMany({
    where: { id: { in: [...roleById.keys()] } },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    trips: trips.map((t) => ({
      id: t.id,
      name: t.name,
      status: t.status,
      durationDays: t.durationDays,
      windowStart: toDateKey(t.windowStart),
      windowEnd: toDateKey(t.windowEnd),
      memberCount: t._count.members,
      role: roleById.get(t.id),
    })),
  });
}
