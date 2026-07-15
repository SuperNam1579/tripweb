"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { claimOwnerCookie } from "@/app/actions";

/**
 * When an owner opens their private link (?owner=…) on a new device, move the
 * token into an httpOnly cookie, then scrub it from the address bar unless
 * this is the one-time "save this link" screen.
 */
export function ClaimOwner({
  tripId,
  ownerToken,
  keepUrl,
}: {
  tripId: string;
  ownerToken: string;
  keepUrl: boolean;
}) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    claimOwnerCookie(tripId, ownerToken).then(() => {
      if (!keepUrl) router.replace(`/trip/${tripId}`);
    });
  }, [tripId, ownerToken, keepUrl, router]);

  return null;
}
