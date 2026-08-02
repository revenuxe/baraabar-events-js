"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { createClient } from "@/lib/supabase/client";
import {
  useBookingDraft,
  normalizeDraft,
  persistDraftForHandoff,
  saveProfile,
  type MeasurementProfile,
} from "@/lib/booking-store";
import {
  deleteDraft,
  getActiveDraftId,
  getUser,
  listDrafts,
  saveDraftToAccount,
  setActiveDraftId,
  syncProfileContact,
  upsertDefaultAddress,
  upsertMeasurementProfile,
} from "@/lib/account";
import {
  estimatePrice,
  itemMeasurementSnapshot,
  orderMeasurementMode,
  orderMeasurementSnapshot,
  uploadReferenceImages,
  type CategoryRow,
  type FabricTypeRow,
  type GarmentTypeRow,
} from "./_lib/helpers";
import { StepCategory } from "./_components/step-category";
import { StepDetails } from "./_components/step-details";
import { StepDesign } from "./_components/step-design";
import { StepFabric } from "./_components/step-fabric";
import { StepMeasure } from "./_components/step-measure";
import { StepAuthGate } from "./_components/step-auth-gate";
import { StepPickup } from "./_components/step-pickup";
import { StepReview } from "./_components/step-review";
import { Success } from "./_components/success";

export function BookWizard({
  categories,
  garmentTypes,
  fabricTypes,
  initialCategorySlug,
}: {
  categories: CategoryRow[];
  garmentTypes: GarmentTypeRow[];
  fabricTypes: FabricTypeRow[];
  initialCategorySlug?: string;
}) {
  const { draft, update, reset, ready, step, setStep, resumedFromHandoff } = useBookingDraft();
  const [supabase] = useState<SupabaseClient>(() => createClient());
  const [done, setDone] = useState(false);
  const orderId = useMemo(() => "BR" + Math.random().toString(36).slice(2, 7).toUpperCase(), []);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedOrderNumber, setSavedOrderNumber] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const draftIdRef = useRef<string | null>(null);
  const pendingFilesRef = useRef<Map<string, File>>(new Map());
  const router = useRouter();
  const appliedInitialCategory = useRef(false);
  // undefined = session not checked yet, null = signed out, Session = signed in.
  // Outfit through Measure (steps 0-4) work anonymously; Pickup onward needs
  // an account, since it's saving an address and completing a real order.
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  function goToAuth() {
    router.push(`/auth?redirect=${encodeURIComponent("/book")}`);
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step, done]);

  // Categories/garmentTypes/fabricTypes arrive as SSR props (see
  // app/book/page.tsx) — no client fetch, no loading skeleton flash.
  useEffect(() => {
    if (!ready || appliedInitialCategory.current) return;
    appliedInitialCategory.current = true;
    const slug = initialCategorySlug;
    if (slug && categories.some((c) => c.slug === slug)) {
      update({ category: slug });
      setStep(1);
      return;
    }
    // A pending handoff (e.g. just signed in from the Pickup gate) already
    // restored the in-progress draft this session — don't also overwrite
    // it with whatever's saved in the account, which could be older.
    if (resumedFromHandoff) return;
    // No deep link and nothing filled in locally — resume the most recent
    // saved draft from the account, if any, so progress isn't lost across
    // devices or after clearing local storage.
    if (draft.category || draft.items.length > 0) return;
    (async () => {
      try {
        const drafts = await listDrafts();
        const latest = drafts[0];
        if (!latest) return;
        update(normalizeDraft(latest.data));
        setStep(latest.step ?? 0);
        draftIdRef.current = latest.id;
        setActiveDraftId(latest.id);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, initialCategorySlug]);

  useEffect(() => {
    draftIdRef.current = getActiveDraftId();
  }, []);

  // Live auth state — drives the Pickup-step sign-in gate below. Kept as
  // React state (not a one-off getSession() call) so it updates the
  // instant the user signs in, including when they return from /auth to
  // this same mounted page.
  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(data.session);
      const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
      if (cancelled) unsubscribe();
    })();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Outfit → Measure (steps 0-4) don't need an account. Pickup (5) and
  // Review (6) do — they save a real address and complete an order. Rather
  // than auto-redirecting to /auth (a useEffect watching step+session),
  // the Pickup slot renders a static "sign in to continue" gate (see
  // StepAuthGate) with an explicit button. An auto-redirect here created a
  // ping-pong: landing back on step 5 from /auth (e.g. clicking that
  // page's own back action) would immediately re-fire the redirect, which
  // — combined with /auth's back icon previously being a hardcoded link to
  // home rather than a real "back" — is what caused back navigation to
  // dump users on the homepage instead of returning to their step. A gate
  // that only navigates on an explicit click can't loop like that.

  // useBookingDraft resumes whatever step was last persisted to
  // localStorage — right, in general, so refreshing mid-flow doesn't lose
  // place. But that persisted step can be stale relative to what the
  // persisted draft actually supports: e.g. Hero's "Book Now" CTA links to
  // plain /book (no ?category=, unlike category-card deep links), so it
  // inherits whatever step a *previous, abandoned* session left behind —
  // landing on Garment/Design/etc. with no category or garments actually
  // chosen, or landing straight on the Pickup sign-in gate with none of
  // the earlier steps visited this session. Clamp the resumed step down to
  // the furthest one the draft's own data actually justifies, once on
  // mount — not on every draft/step change, which would fight legitimate
  // forward navigation.
  useEffect(() => {
    if (!ready || session === undefined) return;
    let maxStep = 6;
    if (!session) maxStep = Math.min(maxStep, 4); // Pickup/Review need an account
    if (draft.items.length === 0) maxStep = Math.min(maxStep, draft.category ? 1 : 0);
    if (step > maxStep) setStep(maxStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session]);

  // No continuous background autosave — saving to the account only happens
  // on an explicit "Save for later" click, on final submission, or — right
  // here — once, the moment a session becomes available while there's an
  // in-progress draft (covers both "signed in via the Pickup gate" and
  // "signed in after clicking Save for later while signed out", so either
  // path actually results in the draft landing in their account, not just
  // surviving the /auth round trip locally).
  const savedOnAuthRef = useRef(false);
  useEffect(() => {
    if (!session) {
      savedOnAuthRef.current = false;
      return;
    }
    if (!ready || savedOnAuthRef.current) return;
    if (!draft.category && draft.items.length === 0) return;
    savedOnAuthRef.current = true;
    saveDraftToAccount(draft, step, draftIdRef.current)
      .then((id) => {
        if (id) {
          draftIdRef.current = id;
          setActiveDraftId(id);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session]);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;
      const { data: row } = await supabase
        .from("measurement_profiles")
        .select("unit, values, updated_at")
        .eq("user_id", uid)
        .eq("is_default", true)
        .maybeSingle();
      if (!row) return;
      const profile: MeasurementProfile = {
        unit: row.unit as "cm" | "in",
        values: row.values as Record<string, number>,
        updatedAt: row.updated_at,
      };
      saveProfile(profile);
      if (!draft.measurementMode && !draft.measurements) {
        update({ measurementMode: "saved", measurements: profile });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const a = draft.address;
    if (a.line1 || a.city || a.pincode || a.phone) return;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;
      const { data: row } = await supabase
        .from("addresses")
        .select("line1, line2, city, pincode, phone")
        .eq("user_id", uid)
        .eq("is_default", true)
        .maybeSingle();
      if (!row) return;
      update({
        address: {
          line1: row.line1,
          line2: row.line2 ?? "",
          city: row.city,
          pincode: row.pincode,
          phone: row.phone,
        },
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (!ready) return null;

  const steps = ["Outfit", "Garment", "Design", "Fabric", "Measure", "Pickup", "Review"] as const;
  const lastStep = steps.length - 1;
  const canContinue = () => {
    if (step === 0) return !!draft.category;
    if (step === 1) return draft.items.length > 0;
    if (step === 2) return true; // design details are optional
    if (step === 3) return true; // fabric type is optional
    if (step === 4) {
      if (draft.items.length > 1) {
        return draft.items.every((it) => {
          if (!it.measurementMode) return false;
          if (it.measurementMode === "self") return !!it.measurements;
          return true;
        });
      }
      if (!draft.measurementMode) return false;
      if (draft.measurementMode === "self") return !!draft.measurements;
      return true;
    }

    if (step === 5)
      return (
        !!draft.address.line1 &&
        !!draft.address.city &&
        !!draft.address.pincode &&
        !!draft.address.phone &&
        !!draft.pickupDate &&
        !!draft.pickupWindow
      );
    return true;
  };

  async function saveForLater() {
    setSaveState("saving");
    setSubmitError(null);
    try {
      const user = await getUser();
      if (!user) {
        persistDraftForHandoff(draft, step);
        goToAuth();
        return;
      }
      const id = await saveDraftToAccount(draft, step, draftIdRef.current);
      draftIdRef.current = id;
      setActiveDraftId(id);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2200);
    } catch (e: any) {
      setSaveState("idle");
      setSubmitError(e?.message ?? "Could not save your design");
    }
  }

  async function submitBooking() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        // Shouldn't normally happen — Pickup already requires a session —
        // but as a defensive fallback (e.g. session expired mid-Review),
        // keep everything they entered and send them to sign in.
        persistDraftForHandoff(draft, step);
        goToAuth();
        return;
      }
      const userId = sess.session.user.id;

      const addressId = await upsertDefaultAddress(userId, draft.address);
      const measurementProfileId = draft.measurements
        ? await upsertMeasurementProfile(userId, draft.measurements)
        : null;
      await syncProfileContact(userId, draft.address.phone);

      const allReferenceUrls = draft.items.flatMap((it) => it.references);
      const referenceUrlMap = await uploadReferenceImages(
        supabase,
        userId,
        allReferenceUrls,
        pendingFilesRef.current,
      );
      const referenceImages = Array.from(referenceUrlMap.values());

      const { itemPricing, orderPriceMin, orderPriceMax } = estimatePrice(
        draft.items,
        garmentTypes,
      );
      const totalQuantity = draft.items.reduce((n, it) => n + it.quantity, 0);
      const fabricType =
        draft.fabrics.length === 1
          ? fabricTypes.find((f) => f.name.toLowerCase() === draft.fabrics[0].toLowerCase())
          : undefined;

      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          user_id: userId,
          quantity: totalQuantity,
          notes: draft.notes || null,
          contact_phone: draft.address.phone || null,
          pickup_date: draft.pickupDate || null,
          pickup_window: draft.pickupWindow || null,
          wants_stylist_call: draft.wantsStylistCall,
          measurement_mode: orderMeasurementMode(draft),
          measurement_snapshot: orderMeasurementSnapshot(draft) as any,

          category_slug: draft.category ?? null,
          garment_label: draft.items.map((it) => it.garment).join(", ") || null,
          style_label: draft.items.length === 1 ? (draft.items[0].styleId ?? null) : null,
          fabric_type_id: fabricType?.id ?? null,
          fabric_label: draft.fabrics.length ? draft.fabrics.join(", ") : null,
          reference_images: referenceImages,
          estimated_price_min: orderPriceMin,
          estimated_price_max: orderPriceMax,
          pickup_address_id: addressId,
          delivery_address_id: draft.deliverySame ? addressId : addressId,
          measurement_profile_id: measurementProfileId,
        } as any)
        .select("id, order_number")
        .single();
      if (error) throw error;

      if (itemPricing.length) {
        const { error: itemsError } = await supabase.from("booking_items").insert(
          itemPricing.map((it, idx) => ({
            booking_id: (booking as any).id,
            category_slug: draft.category ?? null,
            garment_label: it.garment,
            style_label: it.styleId ?? null,
            quantity: it.quantity,
            measurement_snapshot: itemMeasurementSnapshot(it, draft) as any,

            estimated_price_min: it.priceMin,
            estimated_price_max: it.priceMax,
            reference_images: it.references
              .map((u) => referenceUrlMap.get(u))
              .filter((u): u is string => !!u),
            sort_order: idx,
          })) as any,
        );
        if (itemsError) throw itemsError;
      }

      setSavedOrderNumber((booking as any)?.order_number ?? null);

      if (draftIdRef.current) {
        try {
          await deleteDraft(draftIdRef.current);
        } catch {}
        draftIdRef.current = null;
        setActiveDraftId(null);
      }
      pendingFilesRef.current.clear();
      reset();
      setDone(true);
    } catch (e: any) {
      setSubmitError(e?.message ?? "Could not submit booking");
    } finally {
      setSubmitting(false);
    }
  }

  const next = () => {
    if (step < lastStep) setStep(step + 1);
    else submitBooking();
  };

  // Always pop browser history (rather than setStep directly) so this stays
  // in lockstep with the hardware/swipe back gesture, which can only ever
  // pop history — see the popstate handling in useBookingDraft.
  const back = () => window.history.back();

  const selectCategory = (slug: string) => {
    const categoryId = categories.find((c) => c.slug === slug)?.id;
    const allowed = new Set(
      garmentTypes.filter((g) => g.category_id === categoryId).map((g) => g.name),
    );
    update({
      category: slug,
      items: draft.items.filter((it) => allowed.has(it.garment)),
    });
    setStep(1);
  };

  if (done) return <Success orderId={savedOrderNumber ?? orderId} />;

  return (
    <div className="min-h-dvh bg-background pb-32">
      <TopBar />

      {/* Progress */}
      <div className="sticky top-[57px] z-30 border-b border-border/60 bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-md items-center gap-3 px-5 py-3 md:max-w-3xl">
          <button
            onClick={back}
            aria-label="Back"
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
              <span>
                Step {step + 1} of {steps.length}
              </span>
              <span className="text-foreground">{steps[step]}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-brand transition-all duration-500"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
          <button
            onClick={saveForLater}
            disabled={saveState === "saving"}
            className="shrink-0 rounded-full border border-border bg-card px-3 py-2 text-[11px] font-bold text-foreground disabled:opacity-50"
          >
            {saveState === "saving"
              ? "Saving…"
              : saveState === "saved"
                ? "Saved ✓"
                : "Save for later"}
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-md px-5 pt-6 md:max-w-3xl">
        {step === 0 && <StepCategory categories={categories} onSelect={selectCategory} />}
        {step === 1 && (
          <StepDetails
            draft={draft}
            update={update}
            categories={categories}
            garmentTypes={garmentTypes}
          />
        )}
        {step === 2 && (
          <StepDesign draft={draft} update={update} pendingFilesRef={pendingFilesRef} />
        )}
        {step === 3 && <StepFabric draft={draft} update={update} fabricTypes={fabricTypes} />}
        {step === 4 && <StepMeasure draft={draft} update={update} />}
        {step === 5 &&
          // While session is still undefined (not checked yet), render
          // nothing rather than flashing the sign-in gate for stale-resume
          // cases the clamp effect above is about to correct.
          (session === undefined ? null : session ? (
            <StepPickup draft={draft} update={update} />
          ) : (
            <StepAuthGate draft={draft} step={step} />
          ))}
        {step === 6 && session && <StepReview draft={draft} garmentTypes={garmentTypes} />}

        <a
          href="https://wa.me/919999999999"
          target="_blank"
          rel="noreferrer"
          className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-3 text-xs font-semibold text-muted-foreground"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Not sure? Chat with a Baraabar stylist
        </a>
      </main>

      {/* Sticky footer */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-lg">
        <div className="mx-auto max-w-md px-5 md:max-w-3xl">
          {submitError && (
            <p className="mb-2 rounded-xl bg-destructive/10 px-3 py-2 text-center text-xs font-semibold text-destructive">
              {submitError}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={back}
              disabled={submitting}
              className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={next}
              disabled={!canContinue() || submitting}
              className="flex-1 rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
            >
              {submitting ? "Booking…" : step === lastStep ? "Confirm Pickup" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
