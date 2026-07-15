"use client";

import { useActionState } from "react";
import { joinTrip } from "@/app/actions";

export function JoinForm({ joinCode }: { joinCode: string }) {
  const [state, action, pending] = useActionState(joinTrip, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="joinCode" value={joinCode} />
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium mb-1.5">
          Your name, as the group knows you
        </label>
        <input
          id="displayName"
          name="displayName"
          required
          maxLength={40}
          autoComplete="nickname"
          placeholder="แบม / Bam"
          className="h-12 w-full rounded-md border border-border bg-card px-3 text-base text-ink placeholder:text-slate"
        />
      </div>

      {state?.error ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-md bg-signal px-6 font-display text-base font-semibold text-ink hover:brightness-95 disabled:opacity-60"
      >
        {pending ? "Joining…" : "Join the trip"}
      </button>
    </form>
  );
}
