"use client";

import { useEffect, useRef, useState } from "react";

export type MeasurementProfile = {
  unit: "cm" | "in";
  values: Record<string, number>;
  updatedAt: string;
};

export type MeasurementMode = "doorstep" | "self" | "saved" | "sample";

export type BookingItem = {
  garment: string;
  quantity: number;
  styleId?: string;
  references: string[]; // object URLs, per garment
  measurements?: MeasurementProfile; // per-garment measurements (multi-garment orders)
  /** Per-garment measurement method, used once an order has more than one
   * garment (different garments can be measured differently — e.g. a
   * sample garment for the Shirt, doorstep for the Sherwani). */
  measurementMode?: MeasurementMode;
  /** Which well-fitting version of THIS garment the customer is sending as
   * a fit sample, when measurementMode is "sample". */
  sampleNote?: string;
};

export type BookingDraft = {
  category?: string;
  items: BookingItem[];
  fabrics: string[];
  occasion?: string;
  notes: string;
  wantsStylistCall: boolean;
  /** Order-wide measurement method. Only meaningful while there's a single
   * garment — once there are several, each item's own `measurementMode`
   * takes over (see BookingItem). */
  measurementMode?: MeasurementMode;
  measurements?: MeasurementProfile;
  /** Which well-fitting garment the customer is sending as a fit sample,
   * for single-garment orders. */
  sampleNote?: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    pincode: string;
    phone: string;
  };
  pickupDate?: string;
  pickupWindow?: string;
  deliverySame: boolean;
};

const KEY = "baraabar_booking_draft_v2";
const STEP_KEY = "baraabar_booking_step_v1";
const PROFILE_KEY = "baraabar_measurement_profile_v1";

const empty: BookingDraft = {
  items: [],
  fabrics: [],
  notes: "",
  wantsStylistCall: false,
  // Defaults to the "send a garment that fits you" option, the easiest
  // path for most customers — they can still switch to another mode.
  measurementMode: "sample",
  address: { line1: "", line2: "", city: "", pincode: "", phone: "" },
  deliverySame: true,
};

// Defensively backfills fields added after a draft may have already been
// saved (locally or to the account), so an old cached shape can't crash
// the newer code that expects them (e.g. per-item `references`).
export function normalizeDraft(raw: any): BookingDraft {
  const items = Array.isArray(raw?.items)
    ? raw.items.map((it: Partial<BookingItem>) => ({
        garment: it.garment ?? "",
        quantity: it.quantity ?? 1,
        styleId: it.styleId,
        references: Array.isArray(it.references) ? it.references : [],
        measurements: it.measurements,
        measurementMode: it.measurementMode,
        sampleNote: it.sampleNote,
      }))
    : [];

  return { ...empty, ...raw, items, fabrics: Array.isArray(raw?.fabrics) ? raw.fabrics : [] };
}

export function useBookingDraft() {
  const [draft, setDraft] = useState<BookingDraft>(empty);
  const [step, setStepState] = useState(0);
  const [ready, setReady] = useState(false);
  // True once, only when the mount effect below actually restored a
  // pending handoff — lets callers (e.g. "resume most recent account
  // draft on arrival") know definitively not to also kick in, instead of
  // inferring it from draft/step being non-empty (which is fragile to
  // effect-ordering races).
  const [resumedFromHandoff, setResumedFromHandoff] = useState(false);
  // Set right before a popstate-driven step change, so the step-sync effect
  // below knows the browser already moved the history pointer and shouldn't
  // push a new entry on top of it.
  const fromPopRef = useRef(false);
  // The push-history effect below runs on its first render too (its `ready`
  // dependency flips true in the same batch as the mount effect's
  // setStepState), even when `step` itself hasn't changed. That first run
  // must not push — the mount effect already anchored that entry via
  // replaceState — or it leaves a redundant duplicate entry that back
  // navigation has to hop through twice.
  const didAnchorRef = useRef(false);

  // No continuous auto-save to localStorage — a booking in progress is not
  // persisted just by existing. It only survives a page reload or new tab
  // if the user explicitly clicked "Save for later" (saved to their
  // account) or is completing a one-shot handoff consumed here: either
  // resuming a draft from the Drafts page, or the round trip to /auth this
  // wizard sends signed-out users on before Pickup — see
  // persistDraftForHandoff below, called right before those navigations.
  // Anything left over is consumed once, then cleared, so it can't linger
  // and cause an unrelated later visit to resume mid-flow unexpectedly.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const rawStep = localStorage.getItem(STEP_KEY);
      localStorage.removeItem(KEY);
      localStorage.removeItem(STEP_KEY);
      if (raw) setDraft(normalizeDraft(JSON.parse(raw)));
      const initialStep = raw && rawStep ? Number(rawStep) || 0 : 0;
      setStepState(initialStep);
      if (raw && rawStep) setResumedFromHandoff(true);
      // Anchor the current history entry (the one created when the user
      // navigated to /book) to this step, without adding a new entry.
      if (typeof window !== "undefined") {
        window.history.replaceState(
          { ...(window.history.state ?? {}), bookingStep: initialStep },
          "",
        );
      }
    } catch {}
    setReady(true);
  }, []);

  // Every step change we cause ourselves (Continue, selecting a category,
  // jumping to a resumed draft's step) pushes a fresh history entry tagged
  // with that step. That way the browser/OS back gesture — which the app
  // can't otherwise distinguish from "leave the page" — pops exactly one
  // entry and lands back on the previous step instead of exiting to
  // whatever page preceded the booking flow.
  useEffect(() => {
    if (!ready) return;
    if (fromPopRef.current) {
      fromPopRef.current = false;
      return;
    }
    if (!didAnchorRef.current) {
      didAnchorRef.current = true;
      return;
    }
    if (typeof window !== "undefined") {
      window.history.pushState({ ...(window.history.state ?? {}), bookingStep: step }, "");
    }
  }, [step, ready]);

  // Browser/OS back (including a swipe-back gesture) fires popstate rather
  // than calling our own back handler. Sync the wizard step to whatever
  // entry the browser landed on instead of letting the page just navigate
  // away.
  useEffect(() => {
    if (!ready) return;
    const onPopState = (e: PopStateEvent) => {
      const s = (e.state as { bookingStep?: number } | null)?.bookingStep;
      if (typeof s === "number") {
        fromPopRef.current = true;
        setStepState(s);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [ready]);

  const update = (patch: Partial<BookingDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const reset = () => {
    setDraft(empty);
    setStepState(0);
  };

  return { draft, update, reset, ready, step, setStep: setStepState, resumedFromHandoff };
}

/** One-shot handoff: writes the current draft+step to localStorage right
 * before navigating away to /auth mid-flow, so useBookingDraft's mount
 * effect can pick it back up (once) after signing in. Not a general
 * autosave — nothing keeps this in sync while /book stays mounted. */
export function persistDraftForHandoff(draft: BookingDraft, step: number) {
  try {
    localStorage.setItem(KEY, JSON.stringify(draft));
    localStorage.setItem(STEP_KEY, String(step));
  } catch {}
}

export function getSavedProfile(): MeasurementProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as MeasurementProfile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: MeasurementProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {}
}
