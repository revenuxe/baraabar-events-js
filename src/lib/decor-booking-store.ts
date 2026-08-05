"use client";

import { useEffect, useState } from "react";

export type VenueAddress = {
  name: string;
  line1: string;
  line2: string;
  city: string;
  pincode: string;
  phone: string;
};

export type DecorBookingDraft = {
  eventDate?: string;
  eventTime?: string;
  venue: VenueAddress;
  notes: string;
};

const KEY = "baraabar_decor_booking_draft_v1";

const empty: DecorBookingDraft = {
  venue: { name: "", line1: "", line2: "", city: "", pincode: "", phone: "" },
  notes: "",
};

function normalizeDraft(raw: any): DecorBookingDraft {
  return {
    ...empty,
    ...raw,
    venue: { ...empty.venue, ...raw?.venue },
  };
}

// Local-only — no Supabase, no account handoff. A booking here is a UI-only
// mock (see book-wizard.tsx's submitBooking) until the backend phase wires
// this up to real bookings, so persistence is deliberately just enough to
// survive an accidental page refresh mid-flow.
export function useDecorBookingDraft() {
  const [draft, setDraft] = useState<DecorBookingDraft>(empty);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDraft(normalizeDraft(JSON.parse(raw)));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(draft));
    } catch {}
  }, [draft, ready]);

  const update = (patch: Partial<DecorBookingDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const reset = () => {
    setDraft(empty);
    setStep(0);
    try {
      localStorage.removeItem(KEY);
    } catch {}
  };

  return { draft, update, reset, ready, step, setStep };
}
