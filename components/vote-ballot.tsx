"use client";

import { useOptimistic, useState, useTransition } from "react";
import { saveVote } from "@/app/actions";
import { cn } from "@/lib/utils";

export interface BallotCategory {
  category: "REGION" | "ACTIVITY";
  title: string;
  options: readonly string[];
  /** My current vote, if any. */
  myVote: string | null;
  /** Option → vote count for the group leaning. */
  counts: Record<string, number>;
}

export function VoteBallot({
  tripId,
  categories,
}: {
  tripId: string;
  categories: BallotCategory[];
}) {
  return (
    <div className="flex flex-col gap-8">
      {categories.map((c) => (
        <CategoryBallot key={c.category} tripId={tripId} data={c} />
      ))}
    </div>
  );
}

function CategoryBallot({ tripId, data }: { tripId: string; data: BallotCategory }) {
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [optimisticVote, setOptimisticVote] = useOptimistic(data.myVote);

  const totalVotes = Object.values(data.counts).reduce((a, b) => a + b, 0);
  const leader = Object.entries(data.counts).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  )[0];

  function vote(value: string) {
    setError(null);
    startTransition(async () => {
      setOptimisticVote(value);
      const result = await saveVote(tripId, data.category, value);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <section aria-labelledby={`ballot-${data.category}`}>
      <h2
        id={`ballot-${data.category}`}
        className="font-display text-xl font-semibold tracking-tight"
      >
        {data.title}
      </h2>
      {totalVotes > 0 && leader && leader[1] > 0 ? (
        <p className="mt-1 text-sm text-slate">
          The group is leaning <span className="font-medium text-teal">{leader[0]}</span>{" "}
          <span className="font-mono tabular-nums">
            ({leader[1]} of {totalVotes})
          </span>
        </p>
      ) : (
        <p className="mt-1 text-sm text-slate">No votes yet — yours starts it.</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-labelledby={`ballot-${data.category}`}>
        {data.options.map((option) => {
          const mine = optimisticVote === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={mine}
              onClick={() => vote(option)}
              className={cn(
                "h-11 rounded-md border px-4 text-sm font-medium",
                mine
                  ? "border-signal bg-signal text-ink"
                  : "border-border bg-card text-ink/80 hover:border-slate",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}
