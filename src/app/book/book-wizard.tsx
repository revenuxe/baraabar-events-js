"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { CONTACT } from "@/lib/site";
import { useCart } from "@/lib/cart-store";
import { useDecorBookingDraft } from "@/lib/decor-booking-store";
import { createClient } from "@/lib/supabase/client";
import { StepEvent } from "./_components/step-event";
import { StepVenue } from "./_components/step-venue";
import { StepReview } from "./_components/step-review";
import { Success } from "./_components/success";

export function BookWizard() {
  const { draft, update, reset, ready: draftReady, step, setStep } = useDecorBookingDraft();
  const { items, ready: cartReady, subtotal, clear } = useCart();
  const [done, setDone] = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const ready = draftReady && cartReady;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step, done]);

  // This flow assumes a non-empty cart — items are chosen on category/service
  // detail pages, not inside the wizard itself (see ServiceDetailView).
  useEffect(() => {
    if (ready && !done && items.length === 0) router.replace("/categories");
  }, [ready, done, items.length, router]);

  if (!ready) return null;
  if (!done && items.length === 0) return null;

  const steps = ["Event", "Venue", "Review"] as const;
  const lastStep = steps.length - 1;
  const canContinue = () => {
    if (step === 0) return !!draft.eventDate && !!draft.eventTime;
    if (step === 1)
      return !!draft.venue.line1 && !!draft.venue.city && !!draft.venue.pincode && !!draft.venue.phone;
    return true;
  };

  async function submitBooking() {
    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      // Draft and cart already persist to localStorage, so the wizard picks
      // up where it left off once the user is back from signing in.
      router.push("/auth?redirect=%2Fbook");
      return;
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        event_date: draft.eventDate!,
        event_time: draft.eventTime!,
        venue_name: draft.venue.name || null,
        venue_line1: draft.venue.line1,
        venue_line2: draft.venue.line2 || null,
        venue_city: draft.venue.city,
        venue_pincode: draft.venue.pincode,
        venue_phone: draft.venue.phone,
        notes: draft.notes || null,
        total: subtotal,
      })
      .select("id, order_code")
      .single();

    if (error || !booking) {
      setSubmitting(false);
      toast.error(error?.message ?? "Could not create your booking. Please try again.");
      return;
    }

    const { error: itemsError } = await supabase.from("booking_items").insert(
      items.map((it) => ({
        booking_id: booking.id,
        product_id: it.productId,
        category_slug: it.categorySlug,
        service_slug: it.serviceSlug,
        service_name: it.serviceName,
        image: it.image,
        unit_price: it.unitPrice,
        original_price: it.originalPrice ?? null,
        quantity: it.quantity,
        addons: it.addOns,
      })),
    );
    if (itemsError) {
      setSubmitting(false);
      toast.error(itemsError.message);
      return;
    }

    clear();
    reset();
    setSubmitting(false);
    setOrderCode(booking.order_code);
    setDone(true);
  }

  const next = () => {
    if (step < lastStep) setStep(step + 1);
    else submitBooking();
  };
  const back = () => {
    if (step > 0) setStep(step - 1);
    else router.push("/cart");
  };

  if (done) return <Success orderId={orderCode} />;

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
        </div>
      </div>

      <main className="mx-auto max-w-md px-5 pt-6 md:max-w-3xl">
        {step === 0 && <StepEvent draft={draft} update={update} />}
        {step === 1 && <StepVenue draft={draft} update={update} />}
        {step === 2 && <StepReview draft={draft} items={items} subtotal={subtotal} />}

        <a
          href={CONTACT.whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-3 text-xs font-semibold text-muted-foreground"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Not sure? Chat with a Baraabar decorator
        </a>
      </main>

      {/* Sticky footer */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-lg">
        <div className="mx-auto max-w-md px-5 md:max-w-3xl">
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
              {submitting ? "Booking…" : step === lastStep ? "Confirm Booking" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
