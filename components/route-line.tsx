import Link from "next/link";

export type StopState = "done" | "current" | "todo";

export interface RouteStop {
  key: string;
  label: string;
  /** Small line under the label — progress copy like "4 of 6 marked". */
  meta?: string;
  href?: string;
  state: StopState;
}

/**
 * The trip flow as an Among-Us "Task List": each stage is a row with a status
 * node, a done/next/waiting tag, and (when actionable) a link. This is the
 * signature device — see DESIGN.md.
 */
export function TaskList({ stops, children }: { stops: RouteStop[]; children?: React.ReactNode }) {
  return (
    <section className="panel overflow-hidden">
      <div className="panel-bar">
        <span className="panel-dot bg-[#E23A3A]" />
        <span className="panel-dot bg-[#F6F657]" />
        <span className="panel-dot bg-[#4AC959]" />
        <span className="ml-2 text-xs uppercase tracking-[.16em] text-[#8FA0BE]">ภารกิจของคุณ · Tasks</span>
      </div>
      {children}
      {stops.map((stop) => {
        const inner = <Row stop={stop} />;
        return stop.href ? (
          <Link key={stop.key} href={stop.href} className="block hover:brightness-110">
            {inner}
          </Link>
        ) : (
          <div key={stop.key}>{inner}</div>
        );
      })}
    </section>
  );
}

/** Shared row chrome — also used by RosterRow to keep the task list visually seamless. */
export const rowCls = "flex w-full items-center gap-3.5 px-4 py-[15px]";
export const rowBorder = { borderBottom: "2px solid #131C2E" } as const;

function Row({ stop }: { stop: RouteStop }) {
  const { state } = stop;
  return (
    <div className="flex w-full items-center gap-3.5 px-4 py-[15px]" style={{ borderBottom: "2px solid #131C2E" }}>
      <StopNode state={state} />
      <span className="min-w-0 flex-1 text-left">
        <span
          className={`block text-[18px] font-semibold ${state === "todo" ? "text-[#8090A8]" : "text-[#EEF3FB]"}`}
        >
          {stop.label}
        </span>
        {stop.meta ? <span className="mt-px block text-[13px] text-fog">{stop.meta}</span> : null}
      </span>
      <Tag state={state} />
    </div>
  );
}

function StopNode({ state }: { state: StopState }) {
  const base = "grid h-8 w-8 flex-none place-items-center rounded-[9px] text-[15px] font-bold";
  if (state === "done") {
    return (
      <span
        aria-hidden
        className={base}
        style={{
          background: "linear-gradient(180deg,rgba(255,255,255,.35),rgba(255,255,255,0) 50%),#4AC959",
          color: "#08210C",
          border: "2px solid #05070D",
          boxShadow: "0 3px 0 #2C8C39",
        }}
      >
        ✓
      </span>
    );
  }
  if (state === "current") {
    return (
      <span
        aria-hidden
        className={base}
        style={{
          background: "linear-gradient(180deg,rgba(255,255,255,.35),rgba(255,255,255,0) 50%),#F6F657",
          color: "#4A3E08",
          border: "2px solid #05070D",
          boxShadow: "0 3px 0 #B0A020",
        }}
      >
        ›
      </span>
    );
  }
  return (
    <span aria-hidden className={base} style={{ background: "#151F33", color: "#3B4762", border: "2px solid #05070D" }} />
  );
}

function Tag({ state }: { state: StopState }) {
  const map = {
    done: { text: "เสร็จ", cls: "text-[#7BE089]", bg: "rgba(74,201,89,.16)" },
    current: { text: "ต่อไป", cls: "text-sun", bg: "rgba(246,246,87,.16)" },
    todo: { text: "รอ", cls: "text-[#5E6E88]", bg: "rgba(255,255,255,.05)" },
  }[state];
  return (
    <span
      className={`flex-none rounded-full px-[11px] py-1 text-xs ${map.cls}`}
      style={{ background: map.bg, border: "2px solid rgba(0,0,0,.3)" }}
    >
      {map.text}
    </span>
  );
}
