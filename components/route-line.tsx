import Link from "next/link";
import { cn } from "@/lib/utils";

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
 * The signature element: a dashed route line threading vertically through the
 * trip flow, each stage a stop node. See DESIGN.md.
 */
export function RouteLine({ stops }: { stops: RouteStop[] }) {
  return (
    <ol className="route-line flex flex-col gap-1">
      {stops.map((stop) => {
        const inner = (
          <span className="flex items-start gap-4">
            <StopNode state={stop.state} />
            <span className="flex flex-col pb-5">
              <span
                className={cn(
                  "font-display text-lg font-semibold leading-6 tracking-tight",
                  stop.state === "todo" && "text-slate",
                )}
              >
                {stop.label}
              </span>
              {stop.meta ? (
                <span className="font-mono text-xs text-slate mt-0.5">{stop.meta}</span>
              ) : null}
            </span>
          </span>
        );
        return (
          <li key={stop.key}>
            {stop.href ? (
              <Link
                href={stop.href}
                className="block rounded-md -m-1 p-1 hover:bg-ink/5"
              >
                {inner}
              </Link>
            ) : (
              <div className="-m-1 p-1">{inner}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function StopNode({ state }: { state: StopState }) {
  return (
    <span
      aria-hidden
      className={cn(
        "route-stop-node mt-0.5 grid size-[22px] shrink-0 place-items-center rounded-full border-2",
        state === "done" && "border-teal bg-teal text-paper",
        state === "current" && "border-signal bg-paper",
        state === "todo" && "border-slate/60 bg-paper",
      )}
    >
      {state === "done" ? (
        <svg viewBox="0 0 10 8" className="size-2.5 fill-none stroke-current stroke-2">
          <path d="M1 4l2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : state === "current" ? (
        <span className="size-2 rounded-full bg-signal" />
      ) : null}
    </span>
  );
}
