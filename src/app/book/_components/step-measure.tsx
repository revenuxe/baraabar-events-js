"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Home as HomeIcon,
  Ruler,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { GuidedMeasure } from "@/components/GuidedMeasure";
import { fieldsForGarment, type MField } from "@/lib/measurements";
import {
  getSavedProfile,
  saveProfile,
  type BookingDraft,
  type BookingItem,
  type MeasurementMode,
  type MeasurementProfile,
} from "@/lib/booking-store";

function isGarmentMeasured(it: BookingItem): boolean {
  if (it.measurementMode !== "self") return true;
  return fieldsForGarment(it.garment).every(
    (f) => typeof it.measurements?.values?.[f] === "number",
  );
}

const MODE_ICON: Record<MeasurementMode, typeof Truck> = {
  sample: Truck,
  doorstep: HomeIcon,
  self: BookOpen,
  saved: Ruler,
};

export function modeSummary(it: BookingItem): string {
  if (!it.measurementMode) return "Choose a method";
  if (it.measurementMode === "sample") return "Sending a fit sample";
  if (it.measurementMode === "doorstep") return "Free doorstep visit";
  if (it.measurementMode === "saved") return "Using saved profile";
  const need = fieldsForGarment(it.garment);
  const have = need.filter((f) => typeof it.measurements?.values?.[f] === "number").length;
  return have === need.length ? "Self-measured" : `Self-measure · ${have}/${need.length}`;
}

export function StepMeasure({
  draft,
  update,
}: {
  draft: BookingDraft;
  update: (p: Partial<BookingDraft>) => void;
}) {
  // null = not measuring; -1 = single combined flow; >=0 = index of item
  const [guiding, setGuiding] = useState<number | null>(null);
  // Which garment's own "how should we measure this?" picker is open.
  // Only used once there's more than one garment.
  const [activeGarment, setActiveGarment] = useState<number | null>(null);
  const saved = getSavedProfile();
  const items = draft.items;
  const multi = items.length > 1;

  const allFields = useMemo(() => {
    const garments = items.length ? items.map((it) => it.garment) : ["Other"];
    const set = new Set<MField>();
    garments.forEach((g) => fieldsForGarment(g).forEach((f) => set.add(f)));
    return Array.from(set);
  }, [items]);

  function updateItem(idx: number, patch: Partial<BookingItem>) {
    update({ items: items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) });
  }

  function setItemMeasurements(idx: number, profile: MeasurementProfile) {
    const next = items.map((it, i) =>
      i === idx ? { ...it, measurements: profile, measurementMode: "self" as const } : it,
    );
    // merge everything captured so far into the order-level profile, for
    // "use my saved measurements" reuse next time
    const merged: Record<string, number> = {};
    next.forEach((it) => Object.assign(merged, it.measurements?.values ?? {}));
    const combined: MeasurementProfile = {
      unit: profile.unit,
      values: merged,
      updatedAt: new Date().toISOString(),
    };
    saveProfile(combined);
    update({ items: next, measurements: combined });
  }

  // If the order was single-garment (with a mode already chosen) and a
  // second garment gets added back on the outfit step, carry that choice
  // onto the first garment instead of silently dropping it.
  useEffect(() => {
    if (!multi) return;
    if (items.some((it) => it.measurementMode)) return;
    if (!draft.measurementMode) return;
    update({
      items: items.map((it, i) =>
        i === 0
          ? {
              ...it,
              measurementMode: draft.measurementMode,
              measurements: draft.measurements,
              sampleNote: draft.sampleNote,
            }
          : it,
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multi]);

  if (guiding !== null) {
    const idx = guiding;
    const isItem = idx >= 0;
    // Carry already-known values forward so shared fields are pre-filled.
    const carried: MeasurementProfile | undefined = isItem
      ? {
          unit: items[idx].measurements?.unit ?? draft.measurements?.unit ?? "cm",
          values: {
            ...(draft.measurements?.values ?? {}),
            ...(items[idx].measurements?.values ?? {}),
          },
          updatedAt: new Date().toISOString(),
        }
      : draft.measurements;
    return (
      <GuidedMeasure
        key={idx}
        fields={isItem ? fieldsForGarment(items[idx].garment) : allFields}
        initial={carried}
        garmentLabel={isItem ? items[idx].garment : undefined}
        garmentStep={isItem ? [idx + 1, items.length] : undefined}
        onCancel={() => {
          setGuiding(null);
          if (isItem) setActiveGarment(idx);
        }}
        onFinish={(profile) => {
          if (isItem) {
            setItemMeasurements(idx, profile);
            setGuiding(null);
            // auto-advance to the next garment that still needs a method chosen
            const nextIdx = items.findIndex((it, i) => i !== idx && !it.measurementMode);
            setActiveGarment(nextIdx >= 0 ? nextIdx : null);
          } else {
            saveProfile(profile);
            update({ measurements: profile, measurementMode: "self" });
            setGuiding(null);
          }
        }}
      />
    );
  }

  // ---- Per-garment "how should we measure this?" picker ----
  if (multi && activeGarment !== null) {
    const idx = activeGarment;
    const it = items[idx];
    const options = [
      {
        id: "sample" as const,
        icon: Truck,
        title: "Send a garment that fits you",
        sub: `Hand us a ${it.garment.toLowerCase()} you love the fit of, along with your fabric. We measure it and return it untouched.`,
        tag: "Recommended",
        meta: "₹0 · nothing to measure",
        primary: true,
      },
      {
        id: "doorstep" as const,
        icon: HomeIcon,
        title: "Free doorstep measurement",
        sub: "A master tailor visits your home within 24 hours and takes this measurement for you.",
        tag: "Free",
        meta: "₹0 · at home",
      },
      {
        id: "self" as const,
        icon: BookOpen,
        title: "Guided self-measure",
        sub: "Step-by-step in-app with illustrations, tips and soft validation.",
        tag: `${fieldsForGarment(it.garment).length} fields`,
        meta: it.measurements ? "Already captured — tap to redo" : "Do it yourself",
      },
      ...(saved
        ? [
            {
              id: "saved" as const,
              icon: Ruler,
              title: "Use my saved measurements",
              sub: `${Object.keys(saved.values).length} measurements on file from your profile.`,
              tag: "Reuse",
              meta: `Updated ${new Date(saved.updatedAt).toLocaleDateString()}`,
            },
          ]
        : []),
    ];
    const hasNext = items.some((x, i) => i !== idx && !x.measurementMode);

    return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveGarment(null)}
          className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All garments
        </button>

        <header>
          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            {it.garment} · Garment {idx + 1} of {items.length}
          </p>
          <h1 className="mt-1 font-display text-3xl leading-tight md:text-4xl">
            How should we measure the {it.garment}?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Each garment can use a different method.
          </p>
        </header>

        <div className="grid gap-3 md:grid-cols-2">
          {options.map((o) => {
            const active = it.measurementMode === o.id;
            const Icon = o.icon;
            return (
              <button
                key={o.id}
                onClick={() => {
                  if (o.id === "self") {
                    updateItem(idx, { measurementMode: "self" });
                    setGuiding(idx);
                  } else if (o.id === "saved" && saved) {
                    updateItem(idx, { measurementMode: "saved", measurements: saved });
                  } else {
                    updateItem(idx, { measurementMode: o.id });
                  }
                }}
                className={`group relative overflow-hidden rounded-[28px] p-[1.5px] text-left transition active:scale-[0.99] ${
                  active ? "bg-gradient-brand shadow-glow" : "bg-border hover:bg-gradient-brand/40"
                }`}
              >
                <div className="relative h-full rounded-[26px] bg-card p-4">
                  {o.primary && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-brand opacity-15 blur-2xl"
                    />
                  )}
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                        active || o.primary
                          ? "bg-gradient-brand text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold leading-tight">{o.title}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            o.primary
                              ? "bg-gradient-brand text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {o.tag}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        {o.sub}
                      </p>
                      <p className="mt-2 text-[11px] font-bold text-primary">{o.meta}</p>
                    </div>
                    <span
                      className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition ${
                        active
                          ? "border-transparent bg-gradient-brand text-primary-foreground"
                          : "border-border text-transparent"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {it.measurementMode === "sample" && (
          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p className="text-sm font-bold">Which {it.garment.toLowerCase()} are you sending?</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Keep it ready with your fabric at pickup. We copy the fit exactly and return it safely
              with your finished order.
            </p>
            <textarea
              value={it.sampleNote ?? ""}
              onChange={(e) => updateItem(idx, { sampleNote: e.target.value })}
              rows={3}
              placeholder={`e.g. The navy ${it.garment.toLowerCase()} that fits me best`}
              className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {it.measurementMode && it.measurementMode !== "self" && (
          <button
            onClick={() => {
              const nextIdx = items.findIndex((x, i) => i !== idx && !x.measurementMode);
              setActiveGarment(nextIdx >= 0 ? nextIdx : null);
            }}
            className="w-full rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow"
          >
            {hasNext ? "Next garment" : "Done"}
          </button>
        )}
      </div>
    );
  }

  // ---- Multi-garment overview: one row per garment ----
  if (multi) {
    const sampleCount = items.filter((it) => it.measurementMode === "sample").length;
    return (
      <div className="space-y-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Perfect fit</p>
          <h1 className="mt-1 font-display text-4xl leading-tight md:text-5xl">
            How should we measure each garment?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Each garment can use a different method — tap one to choose.
          </p>
        </header>

        <div className="space-y-3">
          {items.map((it, idx) => {
            const Icon = it.measurementMode ? MODE_ICON[it.measurementMode] : Ruler;
            const done = !!it.measurementMode && isGarmentMeasured(it);
            return (
              <button
                key={`${it.garment}-${idx}`}
                onClick={() => setActiveGarment(idx)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-card transition active:scale-[0.98]"
              >
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                    it.measurementMode
                      ? "bg-gradient-brand text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {it.garment}
                    {it.quantity > 1 && (
                      <span className="text-muted-foreground"> × {it.quantity}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{modeSummary(it)}</p>
                </div>
                {done && <Check className="h-4 w-4 shrink-0 text-primary" />}
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {sampleCount > 0 && (
          <p className="rounded-2xl bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
            <Truck className="mr-1.5 inline h-3.5 w-3.5 align-[-2px] text-accent" />
            We'll pick up {sampleCount} sample garment{sampleCount > 1 ? "s" : ""} alongside your
            fabric.
          </p>
        )}
      </div>
    );
  }

  // ---- Single-garment order: one shared choice for the whole order ----
  const options = [
    {
      id: "sample" as const,
      icon: Truck,
      title: "Send a garment that fits you",
      sub: "Hand us any outfit you love the fit of, along with your fabric. Our tailors measure it to the millimetre and return it untouched with your stitched clothes.",
      tag: "Recommended",
      meta: "₹0 · nothing to measure",
      primary: true,
    },
    {
      id: "doorstep" as const,
      icon: HomeIcon,
      title: "Free doorstep measurement",
      sub: "A master tailor visits your home within 24 hours and takes every measurement for you.",
      tag: "Free",
      meta: "₹0 · 15 min at home",
    },
    {
      id: "self" as const,
      icon: BookOpen,
      title: "Guided self-measure",
      sub: "Step-by-step in-app with illustrations, tips and soft validation.",
      tag: "6 min",
      meta: "Do it yourself",
    },
    ...(saved
      ? [
          {
            id: "saved" as const,
            icon: Ruler,
            title: "Use my saved measurements",
            sub: `${Object.keys(saved.values).length} measurements on file from your profile.`,
            tag: "Reuse",
            meta: `Updated ${new Date(saved.updatedAt).toLocaleDateString()}`,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Perfect fit</p>
        <h1 className="mt-1 font-display text-4xl leading-tight md:text-5xl">
          How should we measure you?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick one — you can change your mind later.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {options.map((o) => {
          const active = draft.measurementMode === o.id;
          const Icon = o.icon;
          return (
            <button
              key={o.id}
              onClick={() => {
                if (o.id === "self") {
                  update({ measurementMode: "self" });
                  setGuiding(-1);
                } else if (o.id === "saved" && saved) {
                  update({ measurementMode: "saved", measurements: saved });
                } else {
                  update({ measurementMode: o.id });
                }
              }}
              className={`group relative overflow-hidden rounded-[28px] p-[1.5px] text-left transition active:scale-[0.99] ${
                active ? "bg-gradient-brand shadow-glow" : "bg-border hover:bg-gradient-brand/40"
              }`}
            >
              <div className="relative h-full rounded-[26px] bg-card p-4">
                {o.primary && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-brand opacity-15 blur-2xl"
                  />
                )}
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                  <div
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                      active || o.primary
                        ? "bg-gradient-brand text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold leading-tight">{o.title}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          o.primary
                            ? "bg-gradient-brand text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {o.tag}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{o.sub}</p>
                    <p className="mt-2 text-[11px] font-bold text-primary">{o.meta}</p>
                  </div>
                  <span
                    className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition ${
                      active
                        ? "border-transparent bg-gradient-brand text-primary-foreground"
                        : "border-border text-transparent"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {draft.measurementMode === "sample" && (
        <div className="rounded-3xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <p className="text-sm font-bold">Which garment are you sending?</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Keep it ready with your fabric at pickup. We copy the fit exactly and return your sample
            garment safely with the finished order.
          </p>
          <textarea
            value={draft.sampleNote ?? ""}
            onChange={(e) => update({ sampleNote: e.target.value })}
            rows={3}
            placeholder="e.g. A navy formal shirt that fits me best"
            className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {draft.measurementMode === "self" && draft.measurements && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <p className="text-sm font-bold">Measurements saved</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {Object.keys(draft.measurements.values).length} measurements captured.
          </p>
          <button
            onClick={() => setGuiding(-1)}
            className="mt-3 text-xs font-bold text-primary underline"
          >
            Edit measurements
          </button>
        </div>
      )}
    </div>
  );
}
