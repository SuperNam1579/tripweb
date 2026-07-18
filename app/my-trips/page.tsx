"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { deleteTrip, leaveTrip } from "@/app/actions";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Crewmate } from "@/components/crewmate";
import { formatShort } from "@/lib/dates";
import { forgetTrip, listSavedTrips } from "@/lib/my-trips";

interface TripSummary {
  id: string;
  name: string;
  status: "PLANNING" | "DECIDED" | "ARCHIVED";
  durationDays: number;
  windowStart: string;
  windowEnd: string;
  memberCount: number;
  role: "owner" | "member";
}

type LoadState = "loading" | "empty" | "ready";

export default function MyTripsPage() {
  const [saved] = useState(() => listSavedTrips());
  const [state, setState] = useState<LoadState>(saved.length === 0 ? "empty" : "loading");
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [pendingRemove, setPendingRemove] = useState<TripSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (saved.length === 0) return;
    const ids = saved.map((t) => t.id).join(",");
    fetch(`/api/trips/mine?ids=${encodeURIComponent(ids)}`)
      .then((res) => res.json())
      .then((data: { trips: TripSummary[] }) => {
        // The server only confirms ids this browser still owns — drop the
        // rest from local storage so a cleared cookie doesn't leave a ghost.
        const verifiedIds = new Set(data.trips.map((t) => t.id));
        for (const s of saved) {
          if (!verifiedIds.has(s.id)) forgetTrip(s.id);
        }
        setTrips(data.trips);
        setState(data.trips.length > 0 ? "ready" : "empty");
      })
      .catch(() => setState("empty"));
  }, [saved]);

  function confirmRemove() {
    const target = pendingRemove;
    if (!target) return;
    setError(null);
    startTransition(async () => {
      // Owner deletes the whole trip; a member can only remove themselves.
      const result = target.role === "owner" ? await deleteTrip(target.id) : await leaveTrip(target.id);
      if (result?.error) {
        setError(result.error);
        setPendingRemove(null);
        return;
      }
      forgetTrip(target.id);
      setTrips((prev) => prev.filter((t) => t.id !== target.id));
      setPendingRemove(null);
    });
  }

  return (
    <main className="mx-auto w-full max-w-[760px] flex-1 px-6 pb-20 pt-10">
      <Link href="/" className="mb-5 inline-block text-sm text-cyan hover:underline">
        ← กลับหน้าแรก
      </Link>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="pill pill-cyan">Command Deck</span>
          <h1
            className="mt-3.5 font-bold text-[#F4F8FF]"
            style={{ fontSize: "clamp(28px,5vw,42px)", lineHeight: 1.05, textShadow: "0 1px 8px rgba(0,0,0,.4)" }}
          >
            ทริปของฉัน
          </h1>
          <p className="m-0 text-[#93A2BC]">ทริปที่คุณเป็นเจ้าของหรือเข้าร่วมไว้ — จำไว้เฉพาะในเบราว์เซอร์นี้เท่านั้น</p>
        </div>
        <Link
          href="/create"
          className="btn btn-green flex-none px-5 py-3 text-sm"
          style={{ borderRadius: 12 }}
        >
          + สร้างทริป
        </Link>
      </header>

      {state === "loading" ? (
        <div className="panel text-center text-sm text-fog" style={{ padding: 28 }}>
          กำลังโหลด…
        </div>
      ) : state === "empty" ? (
        <div className="panel text-center" style={{ padding: 28 }}>
          <div className="mx-auto mb-3 h-[92px] w-20" style={{ filter: "drop-shadow(0 10px 10px rgba(0,0,0,.4))" }}>
            <Crewmate body="#38FEDC" shade="#1C9E9C" />
          </div>
          <p className="text-[#B7C4DA]">ยังไม่มีทริปที่สร้างหรือเข้าร่วมไว้บนเครื่องนี้</p>
          <Link href="/create" className="btn btn-green mt-4 inline-flex px-6 py-3">
            สร้างทริปแรก →
          </Link>
        </div>
      ) : (
        <div className="panel overflow-hidden">
          <div className="panel-bar">
            <span className="panel-dot bg-[#E23A3A]" />
            <span className="panel-dot bg-[#F6F657]" />
            <span className="panel-dot bg-[#4AC959]" />
            <span className="ml-2 text-xs uppercase tracking-[.16em] text-[#8FA0BE]">My Trips</span>
          </div>
          {error ? (
            <p role="alert" className="px-4 py-3 text-sm text-[#FFB4B4]" style={{ background: "rgba(226,58,58,.12)" }}>
              {error}
            </p>
          ) : null}
          {trips.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3.5 px-4 py-[15px]"
              style={{ borderBottom: "2px solid #131C2E" }}
            >
              <Link href={`/trip/${t.id}`} className="flex min-w-0 flex-1 items-center gap-3.5">
                <span className="inline-block h-8 w-7 flex-none">
                  <Crewmate body="#C51111" shade="#6E0F0F" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[17px] font-semibold text-[#EEF3FB]">{t.name}</span>
                  <span className="mt-0.5 block text-[13px] text-fog">
                    {t.durationDays} วัน · {formatShort(t.windowStart)} – {formatShort(t.windowEnd)} · {t.memberCount} คน
                  </span>
                </span>
              </Link>
              <RoleTag role={t.role} />
              <StatusTag status={t.status} />
              <button
                type="button"
                onClick={() => setPendingRemove(t)}
                aria-label={t.role === "owner" ? `ลบทริป ${t.name} ถาวร` : `ออกจากทริป ${t.name}`}
                className="flex-none text-lg leading-none text-fog hover:text-[#FFB4B4]"
                style={{ padding: 4 }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pendingRemove !== null}
        title={pendingRemove?.role === "owner" ? "ลบทริปนี้ถาวร?" : "ออกจากทริปนี้?"}
        description={
          pendingRemove
            ? pendingRemove.role === "owner"
              ? `"${pendingRemove.name}" จะถูกลบถาวร — สมาชิกทั้ง ${pendingRemove.memberCount} คน วันว่าง งบ และโหวตทั้งหมดหายไปด้วย กู้คืนไม่ได้ และคนอื่นจะเข้าทริปนี้ไม่ได้อีก`
              : `คุณจะออกจาก "${pendingRemove.name}" — วันว่าง งบ และโหวตของคุณจะถูกลบ กู้คืนไม่ได้ ทริปยังอยู่สำหรับคนอื่น (เข้าใหม่ได้ด้วยลิงก์เข้าร่วม)`
            : undefined
        }
        confirmLabel={
          pending ? "กำลังลบ…" : pendingRemove?.role === "owner" ? "ลบทริปถาวร" : "ออกจากทริป"
        }
        cancelLabel="ยกเลิก"
        onConfirm={confirmRemove}
        onCancel={() => setPendingRemove(null)}
      />
    </main>
  );
}

function RoleTag({ role }: { role: TripSummary["role"] }) {
  return role === "owner" ? (
    <span
      className="flex-none rounded-full px-[11px] py-1 text-xs"
      style={{ background: "rgba(56,254,220,.14)", color: "#38FEDC" }}
    >
      เจ้าของ
    </span>
  ) : (
    <span
      className="flex-none rounded-full px-[11px] py-1 text-xs"
      style={{ background: "rgba(255,255,255,.06)", color: "#93A2BC" }}
    >
      สมาชิก
    </span>
  );
}

function StatusTag({ status }: { status: TripSummary["status"] }) {
  const map = {
    PLANNING: { text: "วางแผน", color: "#F6F657", bg: "rgba(246,246,87,.16)" },
    DECIDED: { text: "ตัดสินใจแล้ว", color: "#7BE089", bg: "rgba(74,201,89,.16)" },
    ARCHIVED: { text: "เก็บถาวร", color: "#8FA0BE", bg: "rgba(255,255,255,.05)" },
  }[status];
  return (
    <span className="flex-none rounded-full px-[11px] py-1 text-xs" style={{ background: map.bg, color: map.color }}>
      {map.text}
    </span>
  );
}
