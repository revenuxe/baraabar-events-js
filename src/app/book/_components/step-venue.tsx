"use client";

import type { DecorBookingDraft } from "@/lib/decor-booking-store";

export function StepVenue({
  draft,
  update,
}: {
  draft: DecorBookingDraft;
  update: (p: Partial<DecorBookingDraft>) => void;
}) {
  const V = draft.venue;
  const setV = (k: keyof DecorBookingDraft["venue"], v: string) => update({ venue: { ...V, [k]: v } });

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Venue</p>
        <h1 className="mt-1 font-display text-4xl leading-tight md:text-5xl">
          Where should we set up?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Our decorators will arrive ahead of your setup window with everything ready.
        </p>
      </header>

      <section className="space-y-3">
        <input
          value={V.name}
          onChange={(e) => setV("name", e.target.value)}
          placeholder="Full name"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          value={V.line1}
          onChange={(e) => setV("line1", e.target.value)}
          placeholder="Venue / house number, street"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          value={V.line2}
          onChange={(e) => setV("line2", e.target.value)}
          placeholder="Area, landmark (optional)"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            value={V.city}
            onChange={(e) => setV("city", e.target.value)}
            placeholder="City"
            className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            value={V.pincode}
            onChange={(e) => setV("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Pincode"
            inputMode="numeric"
            className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <input
          value={V.phone}
          onChange={(e) => setV("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="Contact number"
          inputMode="numeric"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </section>
    </div>
  );
}
