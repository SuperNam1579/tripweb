"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveBudget } from "@/app/actions";
import { Toast } from "@/components/toast";

const PRESETS = [
  { label: "ประหยัด", min: 2000, max: 5000 },
  { label: "กลางๆ", min: 5000, max: 10000 },
  { label: "สบายๆ", min: 10000, max: 20000 },
  { label: "หรู", min: 20000, max: 50000 },
];

export function BudgetForm({
  tripId,
  initialAmount,
  initialAmountMax,
}: {
  tripId: string;
  initialAmount: number | null;
  initialAmountMax: number | null;
}) {
  const action = saveBudget.bind(null, tripId);
  const [state, formAction, pending] = useActionState(action, null);

  const [min, setMin] = useState(initialAmount?.toString() ?? "");
  const [max, setMax] = useState((initialAmountMax ?? initialAmount)?.toString() ?? "");

  const [showSaved, setShowSaved] = useState(false);
  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) setShowSaved(true);
    wasPending.current = pending;
  }, [pending, state]);

  function applyPreset(p: (typeof PRESETS)[number]) {
    setMin(String(p.min));
    setMax(String(p.max));
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="label mb-3">ฟิลเตอร์แนะนำ</label>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {PRESETS.map((p) => {
            const active = min === String(p.min) && max === String(p.max);
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p)}
                aria-pressed={active}
                className="rounded-xl px-2 py-2.5 text-center text-sm font-semibold"
                style={{
                  border: `3px solid ${active ? "#F6F657" : "#05070D"}`,
                  background: active
                    ? "linear-gradient(180deg,rgba(255,255,255,.28),rgba(255,255,255,0) 50%),#F6F657"
                    : "#151F33",
                  color: active ? "#4A3E08" : "#C6D2E6",
                  boxShadow: active ? "0 0 0 3px rgba(246,246,87,.35), 0 4px 0 #B0A020" : "0 4px 0 #0C1220",
                }}
              >
                <span className="block">{p.label}</span>
                <span className="mt-0.5 block text-[11px] font-normal opacity-80">
                  ฿{p.min.toLocaleString("en-US")}–{p.max.toLocaleString("en-US")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="label mb-3">ช่วงงบต่อคน (บาท)</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="amount" className="mb-1.5 block text-xs text-fog">
              ต่ำสุด
            </label>
            <div
              className="flex items-center gap-2 rounded-2xl px-4 py-1.5"
              style={{ background: "#0B1220", border: "3px solid #1C2740" }}
            >
              <span aria-hidden className="text-[24px] text-sun">
                ฿
              </span>
              <input
                id="amount"
                name="amount"
                type="number"
                inputMode="numeric"
                min={1}
                max={1_000_000}
                step={1}
                required
                value={min}
                onChange={(e) => setMin(e.target.value)}
                placeholder="5,000"
                className="w-full flex-1 border-none bg-transparent p-0 text-[24px] tabular-nums text-star outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="amountMax" className="mb-1.5 block text-xs text-fog">
              สูงสุด
            </label>
            <div
              className="flex items-center gap-2 rounded-2xl px-4 py-1.5"
              style={{ background: "#0B1220", border: "3px solid #1C2740" }}
            >
              <span aria-hidden className="text-[24px] text-sun">
                ฿
              </span>
              <input
                id="amountMax"
                name="amountMax"
                type="number"
                inputMode="numeric"
                min={1}
                max={1_000_000}
                step={1}
                required
                value={max}
                onChange={(e) => setMax(e.target.value)}
                placeholder="10,000"
                className="w-full flex-1 border-none bg-transparent p-0 text-[24px] tabular-nums text-star outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {state?.error ? (
        <p
          role="alert"
          className="rounded-xl px-3.5 py-2.5 text-sm text-[#FFB4B4]"
          style={{ background: "rgba(226,58,58,.12)", border: "2px solid rgba(226,58,58,.4)" }}
        >
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-green mt-1.5 h-14 text-[18px]">
        {pending ? "กำลังบันทึก…" : initialAmount ? "อัปเดตงบของฉัน" : "บันทึกงบของฉัน"}
      </button>

      <Toast open={showSaved} message="บันทึกงบของฉันแล้ว ✓" onClose={() => setShowSaved(false)} />
    </form>
  );
}
