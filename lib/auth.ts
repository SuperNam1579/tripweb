import "server-only";
import { cookies } from "next/headers";
import { prisma } from "./db";

/**
 * Cookie-based sessions, one cookie per trip so a person can be in several
 * trips at once. Tokens are ALWAYS re-verified against the DB — a cookie or
 * query param is never trusted on its own.
 */

const YEAR = 60 * 60 * 24 * 365;

export function ownerCookieName(tripId: string) {
  return `ts_owner_${tripId}`;
}

export function memberCookieName(tripId: string) {
  return `ts_member_${tripId}`;
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: YEAR,
} as const;

/**
 * Resolve the owner of a trip. Accepts the token from the httpOnly cookie or
 * from the owner link's ?owner= param; either way it is verified against the
 * DB before anything private is returned.
 */
export async function getOwnerTrip(tripId: string, ownerTokenParam?: string) {
  const store = await cookies();
  const candidates = [
    store.get(ownerCookieName(tripId))?.value,
    ownerTokenParam,
  ].filter((t): t is string => typeof t === "string" && t.length > 0);

  for (const token of candidates) {
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, ownerToken: token },
    });
    if (trip) return trip;
  }
  return null;
}

/** Resolve the current member of a trip from the member cookie, or null. */
export async function getMember(tripId: string) {
  const store = await cookies();
  const token = store.get(memberCookieName(tripId))?.value;
  if (!token) return null;
  return prisma.member.findFirst({
    where: { memberToken: token, tripId },
  });
}
