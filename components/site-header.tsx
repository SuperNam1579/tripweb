"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crewmate } from "@/components/crewmate";

/**
 * Sticky nav shown on every screen. The full nav (join-your-trips link +
 * primary CTA) only makes sense on the landing page — everywhere else the
 * page already has its own back link and primary action, so the header
 * quiets down to just the logo to avoid competing controls.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(10,14,26,.82)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "2px solid #05070D",
        boxShadow: "0 2px 0 rgba(56,254,220,.14)",
      }}
    >
      <div className="mx-auto flex h-[68px] max-w-[1160px] items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="inline-block h-8 w-7">
            <Crewmate body="#C51111" shade="#6E0F0F" />
          </span>
          <span
            className="text-2xl font-semibold text-[#F4F8FF]"
            style={{ letterSpacing: ".02em", textShadow: "0 1px 8px rgba(0,0,0,.4)" }}
          >
            TripSync
          </span>
        </Link>
        {isLanding ? (
          <nav className="flex items-center gap-2.5">
            <Link href="/my-trips" className="px-2 py-2 text-sm font-medium text-[#C6D2E6] hover:text-star">
              ทริปของฉัน
            </Link>
            <Link
              href="/create"
              className="btn btn-green px-[18px] py-[9px] text-sm"
              style={{ borderRadius: 13, boxShadow: "0 4px 0 #2C8C39, inset 0 2px 0 rgba(255,255,255,.4)" }}
            >
              สร้างทริป
            </Link>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
