"use client";

import { Truck } from "lucide-react";
import type { BookingDraft } from "@/lib/booking-store";
import { estimatePrice, type GarmentTypeRow } from "../_lib/helpers";
import { modeSummary } from "./step-measure";

// Same-day pickup for anything booked in the 8 AM – 2 PM window; anything
// booked later rolls to next-day pickup instead.
function isSameDayPickupWindow(date: Date): boolean {
  const hour = date.getHours();
  return hour >= 8 && hour < 14;
}

export function StepReview({
  draft,
  garmentTypes,
}: {
  draft: BookingDraft;
  garmentTypes: GarmentTypeRow[];
}) {
  const timeline = ["Pickup", "Measure", "Stitch", "Fit trial", "Delivery"];
  const { orderPriceMin, orderPriceMax } = estimatePrice(draft.items, garmentTypes);
  const totalReferences = draft.items.reduce((n, it) => n + it.references.length, 0);
  const pickupToday = isSameDayPickupWindow(new Date());
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
            Garments
          </p>
          <div className="mt-1.5 space-y-1">
            {draft.items.map((it) => (
              <div key={it.garment} className="flex items-center justify-between text-sm">
                <span className="font-semibold">
                  {it.garment}
                  {it.styleId && (
                    <span className="ml-1.5 font-normal text-muted-foreground">· {it.styleId}</span>
                  )}
                </span>
                <span className="font-semibold">× {it.quantity}</span>
              </div>
            ))}
          </div>
        </div>
        <Row label="Fabric" value={draft.fabrics.length ? draft.fabrics.join(", ") : "—"} />
        <Row label="Occasion" value={draft.occasion ?? "—"} />
        <Row
          label="Design"
          value={
            [
              totalReferences > 0 &&
                `${totalReferences} reference${totalReferences > 1 ? "s" : ""}`,
              draft.notes.trim() && "notes",
              draft.wantsStylistCall && "stylist call",
            ]
              .filter(Boolean)
              .join(" · ") || "—"
          }
        />
        {draft.items.map(
          (it) =>
            it.references.length > 0 && (
              <div key={it.garment} className="space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground">{it.garment}</p>
                <div className="flex gap-2">
                  {it.references.map((u) => (
                    <img key={u} src={u} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  ))}
                </div>
              </div>
            ),
        )}
        {draft.items.length > 1 ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Measurement
            </p>
            <div className="mt-1.5 space-y-1">
              {draft.items.map((it) => (
                <div key={it.garment} className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{it.garment}</span>
                  <span className="font-semibold text-muted-foreground">
                    {modeSummary(it)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Row
            label="Measurement"
            value={
              draft.measurementMode === "doorstep"
                ? "Free doorstep visit"
                : draft.measurementMode === "sample"
                  ? `Sample garment pickup${draft.sampleNote ? ` · ${draft.sampleNote}` : ""}`
                  : draft.measurementMode === "self"
                    ? `Self-measured (${Object.keys(draft.measurements?.values ?? {}).length} fields)`
                    : draft.measurementMode === "saved"
                      ? "Using saved profile"
                      : "—"
            }
          />
        )}

        <Row
          label="Pickup"
          value={
            draft.pickupDate
              ? `${new Date(draft.pickupDate).toLocaleDateString(undefined, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })} · ${draft.pickupWindow}`
              : "—"
          }
        />
        <Row
          label="Address"
          value={`${draft.address.line1}, ${draft.address.city} — ${draft.address.pincode}`}
        />
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
        <p className="text-sm font-bold">Estimated timeline</p>
        <div className="mt-4 flex items-center justify-between">
          {timeline.map((t, i) => (
            <div key={t} className="flex flex-1 flex-col items-center text-center">
              <div
                className={`grid h-9 w-9 place-items-center rounded-full text-[11px] font-bold ${
                  i === 0
                    ? "bg-gradient-brand text-primary-foreground"
                    : "border border-border bg-card text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              <p className="mt-2 text-[10px] font-bold text-muted-foreground">{t}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-muted/60 px-4 py-3">
          <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs text-muted-foreground">
            <span className="font-bold text-foreground">
              Pickup {pickupToday ? "today" : "tomorrow"}
            </span>
            {pickupToday
              ? " — booked between 8 AM and 2 PM"
              : " — booking after 2 PM moves to next-day pickup"}
            , then stitched and delivered in{" "}
            <span className="font-bold text-foreground">4–5 days</span>.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-dashed border-border p-5">
        <p className="text-sm font-bold">Stitching estimate</p>
        <p className="mt-1 text-2xl font-black text-gradient-brand">
          {orderPriceMin != null && orderPriceMax != null
            ? `₹${orderPriceMin.toLocaleString("en-IN")} – ₹${orderPriceMax.toLocaleString("en-IN")}`
            : "Shared after fabric review"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Final quote shared after our tailor assesses your fabric. No payment needed now.
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
