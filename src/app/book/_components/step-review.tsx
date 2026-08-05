"use client";

import { PartyPopper } from "lucide-react";
import type { DecorBookingDraft } from "@/lib/decor-booking-store";
import type { CartItem } from "@/lib/cart-store";

export function StepReview({
  draft,
  items,
  subtotal,
}: {
  draft: DecorBookingDraft;
  items: CartItem[];
  subtotal: number;
}) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Almost there</p>
        <h1 className="mt-1 font-display text-4xl leading-tight md:text-5xl">
          Review your booking
        </h1>
      </header>

      <div className="space-y-3 rounded-3xl border border-border bg-card p-5 shadow-card">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Decorations
          </p>
          <div className="mt-1.5 space-y-1">
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between text-sm">
                <span className="font-semibold">
                  {it.serviceName}
                  {it.addOns.length > 0 && (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      · {it.addOns.map((a) => a.name).join(", ")}
                    </span>
                  )}
                </span>
                <span className="font-semibold">× {it.quantity}</span>
              </div>
            ))}
          </div>
        </div>
        <Row
          label="Event"
          value={
            draft.eventDate
              ? `${new Date(draft.eventDate).toLocaleDateString(undefined, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })} · ${draft.eventTime ?? "—"}`
              : "—"
          }
        />
        <Row
          label="Venue"
          value={
            draft.venue.line1
              ? `${draft.venue.line1}, ${draft.venue.city} — ${draft.venue.pincode}`
              : "—"
          }
        />
        {draft.notes.trim() && <Row label="Notes" value={draft.notes} />}
      </div>

      <div className="rounded-3xl border border-dashed border-border p-5">
        <p className="text-sm font-bold">Total</p>
        <p className="mt-1 text-2xl font-black text-gradient-brand">
          ₹{subtotal.toLocaleString("en-IN")}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <PartyPopper className="h-3.5 w-3.5" />
          No payment needed now — we&apos;ll confirm final pricing after a quick venue check.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-right text-sm font-semibold">{value}</p>
    </div>
  );
}
