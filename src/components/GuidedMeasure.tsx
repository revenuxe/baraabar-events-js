"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Ruler, Sparkles } from "lucide-react";
import type { MeasurementProfile } from "@/lib/booking-store";
import { M_META, type MField } from "@/lib/measurements";

export function GuidedMeasure({
  fields,
  initial,
  garmentLabel,
  garmentStep,
  onCancel,
  onFinish,
}: {
  fields: MField[];
  initial?: MeasurementProfile;
  /** Name of the garment being measured (multi-garment orders). */
  garmentLabel?: string;
  /** e.g. [2, 3] renders "Garment 2 of 3". */
  garmentStep?: [number, number];
  onCancel: () => void;
  onFinish: (p: MeasurementProfile) => void;
}) {
  const [unit, setUnit] = useState<"cm" | "in">(initial?.unit ?? "cm");
  const [values, setValues] = useState<Record<string, number>>(initial?.values ?? {});
  const [i, setI] = useState(0);
  const field = fields[i];
  const meta = M_META[field];
  const val = values[field];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [i]);

  const min = unit === "cm" ? meta.rangeCm[0] : Math.round(meta.rangeCm[0] / 2.54);
  const max = unit === "cm" ? meta.rangeCm[1] : Math.round(meta.rangeCm[1] / 2.54);
  const ok = typeof val === "number" && val >= min && val <= max;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <button onClick={onCancel} className="text-xs font-bold text-muted-foreground underline">
            Cancel
          </button>
          {garmentLabel && (
            <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-gradient-brand px-3 py-1 text-[11px] font-bold text-primary-foreground shadow-glow">
              <Ruler className="h-3 w-3 shrink-0" />
              <span className="truncate">{garmentLabel}</span>
              {garmentStep && (
                <span className="opacity-80">
                  · {garmentStep[0]}/{garmentStep[1]}
                </span>
              )}
            </span>
          )}
        </div>
        <div className="inline-flex shrink-0 rounded-full border border-border bg-card p-1 text-xs font-bold">
          {(["cm", "in"] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`rounded-full px-3 py-1 ${
                unit === u ? "bg-gradient-brand text-primary-foreground" : ""
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5">
        {fields.map((_, idx) => (
          <span
            key={idx}
            className={`h-1.5 flex-1 rounded-full ${idx <= i ? "bg-gradient-brand" : "bg-muted"}`}
          />
        ))}
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
        <div className="mb-4 grid h-40 place-items-center rounded-2xl bg-gradient-brand/10">
          <div className="text-center">
            <Ruler className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-2 text-xs font-bold text-primary">{meta.label}</p>
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-accent">
          Measurement {i + 1} of {fields.length}
        </p>
        <h2 className="mt-1 font-display text-3xl">{meta.label}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{meta.how}</p>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-muted p-3">
          <Sparkles className="h-4 w-4 text-accent" />
          <p className="text-xs">
            <span className="font-bold">Tip:</span> {meta.tip}
          </p>
        </div>

        <div className="mt-5">
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={val ?? ""}
              onChange={(e) => setValues({ ...values, [field]: parseFloat(e.target.value) })}
              placeholder={`${min}-${max}`}
              className="w-full rounded-2xl border border-border bg-background px-4 py-4 text-2xl font-bold outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-sm font-bold text-muted-foreground">{unit}</span>
          </div>
          {typeof val === "number" && !ok && (
            <p className="mt-2 text-xs text-destructive">
              Typical range is {min}–{max} {unit}. Double-check?
            </p>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          {i > 0 && (
            <button
              onClick={() => setI(i - 1)}
              className="rounded-full border border-border px-5 py-3 text-sm font-bold"
            >
              Back
            </button>
          )}
          <button
            disabled={!ok}
            onClick={() => {
              if (i < fields.length - 1) setI(i + 1);
              else
                onFinish({
                  unit,
                  values,
                  updatedAt: new Date().toISOString(),
                });
            }}
            className="flex-1 rounded-full bg-gradient-brand px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-40 disabled:shadow-none"
          >
            {i === fields.length - 1 ? "Save measurements" : "Next"}
            <ChevronRight className="ml-1 inline h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Have someone help you — it's more accurate than measuring alone.
      </p>
    </div>
  );
}
