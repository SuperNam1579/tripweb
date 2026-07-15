"use client";

/**
 * "My Trips" is browser-local bookkeeping, not an account system — see
 * AGENTS.md: "No accounts." Only trip ids (and a display name for instant
 * paint) live here. The owner/member tokens never leave their httpOnly
 * cookies, so a copy of this list is useless without the browser that owns
 * the matching cookies. /api/trips/mine re-verifies the role per id.
 */

const KEY = "tripsync:my-trips";

export type TripRole = "owner" | "member";

export interface SavedTripRef {
  id: string;
  name: string;
  role: TripRole;
  savedAt: string;
}

function read(): SavedTripRef[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: SavedTripRef[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Storage blocked (private mode / quota) — this feature is best-effort.
  }
}

export function rememberTrip(id: string, name: string, role: TripRole) {
  const list = read().filter((t) => t.id !== id);
  list.unshift({ id, name, role, savedAt: new Date().toISOString() });
  write(list.slice(0, 50));
}

export function forgetTrip(id: string) {
  write(read().filter((t) => t.id !== id));
}

export function listSavedTrips(): SavedTripRef[] {
  return read();
}
