/**
 * Seeds a demo trip with 5 members so the full flow is visible end-to-end.
 * Run: npm run db:seed — prints the join link and the private owner link.
 */
import "dotenv/config";
import { rankWindows } from "../lib/availability";
import { addDays, eachDay, fromDateKey, toDateKey } from "../lib/dates";
import { prisma } from "../lib/db";
import {
  generateJoinCode,
  generateMemberToken,
  generateOwnerToken,
} from "../lib/tokens";

async function main() {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() + 21);
  const windowStart = toDateKey(start);
  const windowEnd = addDays(windowStart, 27); // 4-week window
  const durationDays = 3;

  const ownerToken = generateOwnerToken();
  const trip = await prisma.trip.create({
    data: {
      name: "ทริปเพื่อนซี้ — Chiang Mai?",
      destination: "เชียงใหม่",
      durationDays,
      windowStart: fromDateKey(windowStart),
      windowEnd: fromDateKey(windowEnd),
      ownerToken,
      joinCode: generateJoinCode(),
    },
  });

  const people: {
    name: string;
    freeOffsets: number[]; // offsets into the window marked free
    budget?: { min: number; max: number };
    activity?: string;
  }[] = [
    {
      name: "แบม",
      freeOffsets: [...range(4, 10), ...range(18, 24)],
      budget: { min: 6000, max: 8000 },
      activity: "Mountains",
    },
    {
      name: "Golf",
      freeOffsets: [...range(5, 9), ...range(17, 27)],
      budget: { min: 3000, max: 5000 },
      activity: "Food",
    },
    {
      name: "มิ้นท์",
      freeOffsets: [...range(0, 12)],
      budget: { min: 7000, max: 10000 },
      activity: "Mountains",
    },
    {
      name: "Nine",
      freeOffsets: [...range(5, 10), ...range(19, 23)],
      budget: { min: 4000, max: 6000 },
      activity: "Nature",
    },
    {
      name: "ฝ้าย",
      freeOffsets: [...range(6, 8), ...range(20, 26)],
      // no budget yet — shows the "4 of 5 submitted" state
      activity: "Mountains",
    },
  ];

  const windowDays = eachDay(windowStart, windowEnd);

  for (const person of people) {
    const member = await prisma.member.create({
      data: {
        tripId: trip.id,
        displayName: person.name,
        memberToken: generateMemberToken(),
      },
    });
    await prisma.availability.createMany({
      data: person.freeOffsets
        .filter((o) => o < windowDays.length)
        .map((o) => ({
          tripId: trip.id,
          memberId: member.id,
          date: fromDateKey(windowDays[o]),
          isFree: true,
        })),
    });
    if (person.budget) {
      await prisma.budget.create({
        data: {
          tripId: trip.id,
          memberId: member.id,
          amount: person.budget.min,
          amountMax: person.budget.max,
        },
      });
    }
    if (person.activity) {
      await prisma.vote.create({
        data: {
          tripId: trip.id,
          memberId: member.id,
          category: "ACTIVITY",
          value: person.activity,
        },
      });
    }
  }

  // Sanity-check the engine against the seeded data.
  const members = await prisma.member.findMany({
    where: { tripId: trip.id },
    include: { availability: { select: { date: true } } },
  });
  const windows = rankWindows({
    members: members.map((m) => ({
      memberId: m.id,
      displayName: m.displayName,
      freeDates: m.availability.map((a) => toDateKey(a.date)),
    })),
    durationDays,
    windowStart,
    windowEnd,
  });

  console.log("Seeded demo trip ✓");
  console.log(`  Trip:        ${trip.name}`);
  console.log(`  Join link:   /join/${trip.joinCode}`);
  console.log(`  Owner link:  /trip/${trip.id}?owner=${ownerToken}`);
  console.log(`  Top windows: ${windows
    .slice(0, 3)
    .map((w) => `${w.startDate}→${w.endDate} (${w.freeCount}/${w.totalMembers})`)
    .join(", ")}`);
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

main().finally(() => prisma.$disconnect());
