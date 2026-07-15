"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  cookieOptions,
  getMember,
  getOwnerTrip,
  memberCookieName,
  ownerCookieName,
} from "@/lib/auth";
import { CREW_COLOR_KEYS } from "@/lib/crew";
import { DATE_KEY_RE, daySpan, fromDateKey, toDateKey } from "@/lib/dates";
import { prisma } from "@/lib/db";
import {
  generateJoinCode,
  generateMemberToken,
  generateOwnerToken,
} from "@/lib/tokens";
import { ACTIVITY_OPTIONS, REGION_OPTIONS } from "@/lib/votes";

const crewColorField = z
  .string()
  .refine((v) => CREW_COLOR_KEYS.includes(v), "Pick a colour from the list.");

export type ActionState = { error?: string } | null;

/* ————————————————— Create trip ————————————————— */

const createTripSchema = z
  .object({
    name: z.string().trim().min(1, "Give the trip a name.").max(80, "Keep the name under 80 characters."),
    yourName: z.string().trim().min(1, "Tell the group your name.").max(40, "Keep the name under 40 characters."),
    color: crewColorField,
    durationDays: z.coerce.number().int().min(1, "The trip needs at least 1 day.").max(30, "Keep it under 30 days."),
    windowStart: z.string().regex(DATE_KEY_RE, "Pick a start date."),
    windowEnd: z.string().regex(DATE_KEY_RE, "Pick an end date."),
  })
  .refine((v) => v.windowEnd >= v.windowStart, {
    message: "The window has to end after it starts.",
    path: ["windowEnd"],
  })
  .refine((v) => daySpan(v.windowStart, v.windowEnd) >= v.durationDays, {
    message: "The date window is shorter than the trip itself.",
    path: ["windowEnd"],
  })
  .refine((v) => daySpan(v.windowStart, v.windowEnd) <= 180, {
    message: "Keep the window under 6 months so the calendar stays usable.",
    path: ["windowEnd"],
  });

export async function createTrip(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createTripSchema.safeParse({
    name: formData.get("name"),
    yourName: formData.get("yourName"),
    color: formData.get("color"),
    durationDays: formData.get("durationDays"),
    windowStart: formData.get("windowStart"),
    windowEnd: formData.get("windowEnd"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { name, yourName, color, durationDays, windowStart, windowEnd } = parsed.data;

  const ownerToken = generateOwnerToken();

  // Retry on the (unlikely) joinCode collision.
  let trip = null;
  for (let attempt = 0; attempt < 5 && !trip; attempt++) {
    try {
      trip = await prisma.trip.create({
        data: {
          name,
          durationDays,
          windowStart: fromDateKey(windowStart),
          windowEnd: fromDateKey(windowEnd),
          ownerToken,
          joinCode: generateJoinCode(),
        },
      });
    } catch (e) {
      if (!isUniqueViolation(e)) throw e;
    }
  }
  if (!trip) return { error: "Could not create the trip. Try again." };

  // The creator is also the first member — no separate "join your own trip"
  // step. Owner and member sessions are still tracked independently.
  const memberToken = generateMemberToken();
  await prisma.member.create({
    data: { tripId: trip.id, displayName: yourName, memberToken, color },
  });

  const store = await cookies();
  store.set(ownerCookieName(trip.id), ownerToken, cookieOptions);
  store.set(memberCookieName(trip.id), memberToken, cookieOptions);

  redirect(`/trip/${trip.id}?owner=${ownerToken}&created=1`);
}

function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code?: string }).code === "P2002"
  );
}

/* ————————————————— Join trip ————————————————— */

const joinSchema = z.object({
  joinCode: z.string().trim().toUpperCase().min(6).max(8),
  displayName: z.string().trim().min(1, "Tell the group your name.").max(40, "Keep the name under 40 characters."),
  color: crewColorField,
});

export async function joinTrip(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = joinSchema.safeParse({
    joinCode: formData.get("joinCode"),
    displayName: formData.get("displayName"),
    color: formData.get("color"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { joinCode, displayName, color } = parsed.data;

  const trip = await prisma.trip.findUnique({ where: { joinCode } });
  if (!trip) {
    return { error: "That join code doesn't match any trip. Check the link and try again." };
  }

  // Already a member on this device? Just go to the trip.
  const existing = await getMember(trip.id);
  if (!existing) {
    const memberToken = generateMemberToken();
    try {
      await prisma.member.create({
        data: { tripId: trip.id, displayName, memberToken, color },
      });
    } catch (e) {
      if (isUniqueViolation(e)) {
        return { error: "Someone just picked that colour. Choose another one." };
      }
      throw e;
    }
    const store = await cookies();
    store.set(memberCookieName(trip.id), memberToken, cookieOptions);
  }

  redirect(`/trip/${trip.id}`);
}

/* ————————————————— Owner cookie claim ————————————————— */

/**
 * Called once when an owner opens their private link on a new device, so the
 * token moves from the URL into an httpOnly cookie.
 */
export async function claimOwnerCookie(tripId: string, ownerToken: string) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, ownerToken },
  });
  if (!trip) return; // wrong token — set nothing
  const store = await cookies();
  store.set(ownerCookieName(tripId), ownerToken, cookieOptions);
}

/* ————————————————— Availability ————————————————— */

const availabilitySchema = z.object({
  tripId: z.string().min(1),
  freeDates: z.array(z.string().regex(DATE_KEY_RE)).max(200),
});

export async function saveAvailability(
  tripId: string,
  freeDates: string[],
): Promise<ActionState> {
  const parsed = availabilitySchema.safeParse({ tripId, freeDates });
  if (!parsed.success) return { error: "Those dates don't look right. Reload and try again." };

  const member = await getMember(tripId);
  if (!member) return { error: "Your session expired. Open the join link again." };

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) return { error: "This trip no longer exists." };

  const startKey = toDateKey(trip.windowStart);
  const endKey = toDateKey(trip.windowEnd);
  const inWindow = [...new Set(parsed.data.freeDates)].filter(
    (d) => d >= startKey && d <= endKey,
  );

  // Unmarked days count as NOT free, so only free days need rows.
  await prisma.$transaction([
    prisma.availability.deleteMany({ where: { memberId: member.id } }),
    prisma.availability.createMany({
      data: inWindow.map((d) => ({
        tripId,
        memberId: member.id,
        date: fromDateKey(d),
        isFree: true,
      })),
    }),
  ]);

  revalidatePath(`/trip/${tripId}`, "layout");
  return null;
}

/* ————————————————— Budget ————————————————— */

const budgetAmount = z.coerce
  .number()
  .int("Whole baht only.")
  .min(1, "Enter a budget in THB.")
  .max(1_000_000, "That budget is over 1,000,000 THB — enter a realistic number.");

const budgetSchema = z
  .object({ amount: budgetAmount, amountMax: budgetAmount })
  .refine((v) => v.amountMax >= v.amount, {
    message: "The top of the range has to be at least the bottom.",
    path: ["amountMax"],
  });

export async function saveBudget(
  tripId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = budgetSchema.safeParse({
    amount: formData.get("amount"),
    amountMax: formData.get("amountMax"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { amount, amountMax } = parsed.data;

  const member = await getMember(tripId);
  if (!member) return { error: "Your session expired. Open the join link again." };

  await prisma.budget.upsert({
    where: { memberId: member.id },
    create: { tripId, memberId: member.id, amount, amountMax },
    update: { amount, amountMax },
  });

  revalidatePath(`/trip/${tripId}`, "layout");
  return null;
}

/* ————————————————— Votes ————————————————— */

const voteSchema = z.union([
  z.object({ category: z.literal("REGION"), value: z.enum(REGION_OPTIONS) }),
  z.object({ category: z.literal("ACTIVITY"), value: z.enum(ACTIVITY_OPTIONS) }),
]);

export async function saveVote(
  tripId: string,
  category: string,
  value: string,
): Promise<ActionState> {
  const parsed = voteSchema.safeParse({ category, value });
  if (!parsed.success) return { error: "That option isn't on the ballot." };

  const member = await getMember(tripId);
  if (!member) return { error: "Your session expired. Open the join link again." };

  await prisma.vote.upsert({
    where: {
      memberId_category: { memberId: member.id, category: parsed.data.category },
    },
    create: {
      tripId,
      memberId: member.id,
      category: parsed.data.category,
      value: parsed.data.value,
    },
    update: { value: parsed.data.value },
  });

  revalidatePath(`/trip/${tripId}`, "layout");
  return null;
}

/* ————————————————— Trip status (owner only) ————————————————— */

export async function setTripStatus(
  tripId: string,
  status: "PLANNING" | "DECIDED" | "ARCHIVED",
): Promise<ActionState> {
  const trip = await getOwnerTrip(tripId);
  if (!trip) return { error: "Only the trip owner can do that." };

  await prisma.trip.update({ where: { id: tripId }, data: { status } });
  revalidatePath(`/trip/${tripId}`, "layout");
  return null;
}
