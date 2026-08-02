"use client";

import { Calendar } from "lucide-react";
import type { BookingDraft } from "@/lib/booking-store";

export function StepPickup({
  draft,
  update,
}: {
  draft: BookingDraft;
  update: (p: Partial<BookingDraft>) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });
  const windows = ["9–11 AM", "11 AM–1 PM", "2–4 PM", "4–6 PM", "6–8 PM"];

  const A = draft.address;
  const setA = (k: keyof BookingDraft["address"], v: string) =>
    update({ address: { ...A, [k]: v } });

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Pickup</p>
        <h1 className="mt-1 font-display text-4xl leading-tight md:text-5xl">
          When can we come by?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We'll collect your fabric and, if you chose it, measure you at home.
        </p>
      </header>

      <section className="space-y-3">
        <p className="text-sm font-bold">Address</p>
        <input
          value={A.line1}
          onChange={(e) => setA("line1", e.target.value)}
          placeholder="House / flat number, street"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          value={A.line2}
          onChange={(e) => setA("line2", e.target.value)}
          placeholder="Area, landmark (optional)"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            value={A.city}
            onChange={(e) => setA("city", e.target.value)}
            placeholder="City"
            className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            value={A.pincode}
            onChange={(e) => setA("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Pincode"
            inputMode="numeric"
            className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <input
          value={A.phone}
          onChange={(e) => setA("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="Contact number"
          inputMode="numeric"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </section>

      <section>
        <p className="mb-3 flex items-center gap-2 text-sm font-bold">
          <Calendar className="h-4 w-4" /> Pickup date
        </p>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {days.map((d) => {
            const key = d.toISOString().slice(0, 10);
            const active = draft.pickupDate === key;
            return (
              <button
                key={key}
                onClick={() => update({ pickupDate: key })}
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
        <p className="mb-3 text-sm font-bold">Time window</p>
        <div className="flex flex-wrap gap-2">
          {windows.map((w) => {
            const active = draft.pickupWindow === w;
            return (
              <button
                key={w}
                onClick={() => update({ pickupWindow: w })}
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

      <label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
        <input
          type="checkbox"
          checked={draft.deliverySame}
          onChange={(e) => update({ deliverySame: e.target.checked })}
          className="mt-1 h-5 w-5 accent-[color:var(--brand-purple)]"
        />
        <div>
          <p className="text-sm font-bold">Deliver back to the same address</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Uncheck if you'd like your finished order sent elsewhere — we'll ask when it's ready.
          </p>
        </div>
      </label>
    </div>
  );
}
