"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { saveVote } from "@/app/actions";

export interface BallotCategory {
  category: "ACTIVITY";
  title: string;
  options: readonly string[];
  /** My current vote, if any. */
  myVote: string | null;
  /** Option → vote count for the group leaning. */
  counts: Record<string, number>;
}

/** Fixed dot colours so each option keeps a stable identity in the list. */
const DOTS = ["#50EF39", "#38FEDC", "#ED54BA", "#EF7D0D", "#F6F657", "#C51111"];

export function VoteBallot({
  tripId,
  resultsHref,
  categories,
}: {
  tripId: string;
  resultsHref: string;
  categories: BallotCategory[];
}) {
  return (
    <div className="flex flex-col gap-5">
      {categories.map((c) => (
        <CategoryBallot key={c.category} tripId={tripId} data={c} />
      ))}
      <Link href={resultsHref} className="btn btn-red mt-1 h-[62px] text-[19px]">
        สรุปผล — ดูวันที่ดีที่สุด →
      </Link>
    </div>
  );
}

function CategoryBallot({ tripId, data }: { tripId: string; data: BallotCategory }) {
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [optimisticVote, setOptimisticVote] = useOptimistic(data.myVote);

  const totalVotes = Object.values(data.counts).reduce((a, b) => a + b, 0);
  const leader = Object.entries(data.counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];

  function vote(value: string) {
    setError(null);
    startTransition(async () => {
      setOptimisticVote(value);
      const result = await saveVote(tripId, data.category, value);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <section aria-labelledby={`ballot-${data.category}`} className="panel" style={{ padding: 22 }}>
      <div className="mb-3.5 flex items-baseline justify-between">
        <h2 id={`ballot-${data.category}`} className="text-[20px] font-semibold text-[#EEF3FB]">
          {data.title}
        </h2>
        <span className="text-[13px] text-cyan">
          {totalVotes > 0 && leader && leader[1] > 0 ? `นำ: ${leader[0]}` : "ยังไม่มีโหวต"}
        </span>
      </div>

      <div className="grid gap-2.5" role="radiogroup" aria-labelledby={`ballot-${data.category}`}>
        {data.options.map((option, i) => {
          const mine = optimisticVote === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={mine}
              onClick={() => vote(option)}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-base"
              style={
                mine
                  ? {
                      background: "linear-gradient(180deg,rgba(255,255,255,.28),rgba(255,255,255,0) 50%),#38FEDC",
                      color: "#062B27",
                      border: "3px solid #05070D",
                      boxShadow: "0 4px 0 #1C9E9C",
                    }
                  : { background: "#0E1524", color: "#C6D2E6", border: "3px solid #1C2740" }
              }
            >
              <span
                className="h-4 w-4 flex-none rounded-full"
                style={{ background: DOTS[i % DOTS.length], boxShadow: "0 0 0 2px rgba(0,0,0,.4)" }}
              />
              <span className="flex-1 text-left font-semibold">{option}</span>
              <span className="text-sm opacity-85 tabular-nums">{data.counts[option] ?? 0} โหวต</span>
            </button>
          );
        })}
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-xl px-3.5 py-2.5 text-sm text-[#FFB4B4]"
          style={{ background: "rgba(226,58,58,.12)", border: "2px solid rgba(226,58,58,.4)" }}
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
