import { CreateTripForm } from "@/components/create-trip-form";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-5 py-10 sm:py-16">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal">
          TripSync
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
          Pick the dates.
          <br />
          Keep the friends.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink/80">
          One link for the group chat. Everyone marks the days they&apos;re free,
          sets a private budget, and votes on where to go. TripSync finds the
          date ranges that actually work.
        </p>
      </header>

      <section aria-labelledby="create-heading" className="rounded-lg border border-border bg-card p-5 sm:p-6">
        <h2 id="create-heading" className="mb-4 font-display text-xl font-semibold tracking-tight">
          Start a trip
        </h2>
        <CreateTripForm />
        <p className="mt-4 text-sm text-slate">
          No account needed. You&apos;ll get a private owner link and a join code
          to paste in the group chat.
        </p>
      </section>

      <p className="mt-8 text-center text-sm text-slate">
        Got a join link from a friend? Just open it — that&apos;s the whole flow.
      </p>
    </main>
  );
}
