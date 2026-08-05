"use client";

import { Calendar } from "lucide-react";
import type { DecorBookingDraft } from "@/lib/decor-booking-store";

export function StepEvent({
  draft,
  update,
}: {
  draft: DecorBookingDraft;
  update: (p: Partial<DecorBookingDraft>) => void;
}) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });
  const windows = ["9–11 AM", "11 AM–1 PM", "2–4 PM", "4–6 PM", "6–8 PM"];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Event</p>
        <h1 className="mt-1 font-display text-4xl leading-tight md:text-5xl">
          When&apos;s the big day?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll have your setup ready before your guests arrive.
        </p>
      </header>

      <section>
        <p className="mb-3 flex items-center gap-2 text-sm font-bold">
          <Calendar className="h-4 w-4" /> Event date
        </p>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {days.map((d) => {
            const key = d.toISOString().slice(0, 10);
            const active = draft.eventDate === key;
            return (
              <button
                key={key}
                onClick={() => update({ eventDate: key })}
                className={`shrink-0 rounded-2xl border px-4 py-3 text-center transition ${
                  active
                    ? "border-transparent bg-gradient-brand text-primary-foreground shadow-glow"
                    : "border-border bg-card"
                }`}
              >
                <p className="text-[11px] font-bold uppercase opacity-80">
                  {d.toLocaleDateString(undefined, { weekday: "short" })}
                </p>
                <p className="text-lg font-black leading-tight">{d.getDate()}</p>
                <p className="text-[10px] opacity-80">
                  {d.toLocaleDateString(undefined, { month: "short" })}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="mb-3 text-sm font-bold">Setup time window</p>
        <div className="flex flex-wrap gap-2">
          {windows.map((w) => {
            const active = draft.eventTime === w;
            return (
              <button
                key={w}
                onClick={() => update({ eventTime: w })}
                className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "border-transparent bg-gradient-brand text-primary-foreground shadow-glow"
                    : "border-border bg-card"
                }`}
              >
                {w}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-bold">Anything else we should know?</p>
        <textarea
          value={draft.notes}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="Theme details, color preferences, special requests…"
          rows={3}
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </section>
    </div>
  );
}
