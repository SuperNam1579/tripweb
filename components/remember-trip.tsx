"use client";

import { useEffect, useRef } from "react";
import { rememberTrip, type TripRole } from "@/lib/my-trips";

/**
 * Registers this trip into the browser's local "My Trips" list whenever a
 * verified owner or member views it, so /my-trips can find it later. Pure
 * client-side bookkeeping — carries no secrets; the real token stays in its
 * httpOnly cookie and never touches localStorage.
 */
export function RememberTrip({ tripId, name, role }: { tripId: string; name: string; role: TripRole }) {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    rememberTrip(tripId, name, role);
  }, [tripId, name, role]);

  return null;
}
