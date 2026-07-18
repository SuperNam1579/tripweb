import { daysUntil } from "@/lib/dates";

/**
 * A nudge banner shown on the trip page whenever the crew hasn't finished
 * all 3 tasks yet — gets louder as the trip's date window gets close.
 * Pure presentational; all the counting happens where trip.members is
 * already loaded (see app/trip/[tripId]/page.tsx).
 */
export function TaskReminderBanner({
  total,
  availDone,
  budgetDone,
  votesDone,
  windowStart,
}: {
  total: number;
  availDone: number;
  budgetDone: number;
  votesDone: number;
  windowStart: string;
}) {
  if (total === 0) return null;
  const allDone = availDone === total && budgetDone === total && votesDone === total;
  if (allDone) return null;

  const missing: string[] = [];
  if (availDone < total) missing.push(`วันว่าง (${availDone}/${total})`);
  if (budgetDone < total) missing.push(`งบ (${budgetDone}/${total})`);
  if (votesDone < total) missing.push(`โหวต (${votesDone}/${total})`);

  const days = daysUntil(windowStart);
  const urgent = days <= 7;

  const headline =
    days < 0
      ? "ช่วงวันที่ตั้งไว้ผ่านไปแล้ว"
      : days === 0
        ? "วันแรกของช่วงที่ตั้งไว้คือวันนี้"
        : days === 1
          ? "พรุ่งนี้เข้าสู่ช่วงวันที่ตั้งไว้แล้ว"
          : `เหลืออีก ${days} วัน ก่อนถึงช่วงวันที่ตั้งไว้`;

  return (
    <section
      className="mb-6 flex items-start gap-3"
      style={{
        background: urgent ? "rgba(226,58,58,.1)" : "rgba(246,246,87,.08)",
        border: `2px solid ${urgent ? "rgba(226,58,58,.4)" : "rgba(246,246,87,.3)"}`,
        borderRadius: 15,
        padding: "14px 18px",
      }}
    >
      <span
        aria-hidden
        className="mt-1.5 h-2.5 w-2.5 flex-none rounded-full"
        style={{
          background: urgent ? "#E23A3A" : "#F6F657",
          boxShadow: urgent ? "0 0 8px rgba(226,58,58,.6)" : "0 0 8px rgba(246,246,87,.6)",
        }}
      />
      <div>
        <p className="m-0 text-sm font-semibold" style={{ color: urgent ? "#FFB4B4" : "#F6F657" }}>
          {headline}
        </p>
        <p className="mt-1 text-sm text-[#B7C4DA]">
          ยังไม่ครบ: {missing.join(" · ")} — ส่งลิงก์เข้าร่วมไปเตือนเพื่อนอีกทีได้เลย
        </p>
      </div>
    </section>
  );
}
