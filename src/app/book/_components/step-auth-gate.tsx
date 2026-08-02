"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { persistDraftForHandoff, type BookingDraft } from "@/lib/booking-store";

/** Sign-in gate shown in place of Pickup for signed-out users. Only
 * navigates on an explicit click — see book-wizard.tsx for why an
 * auto-redirect here caused a back-navigation ping-pong. */
export function StepAuthGate({ draft, step }: { draft: BookingDraft; step: number }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-glow">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <div>
        <p className="font-display text-2xl">Sign in to continue</p>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          We'll save everything you've picked so far to your account, then pick up right here at
          Pickup.
        </p>
      </div>
      <button
        onClick={() => {
          persistDraftForHandoff(draft, step);
          router.push(`/auth?redirect=${encodeURIComponent("/book")}`);
        }}
        className="mt-2 rounded-full bg-gradient-brand px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition-all active:scale-[0.98]"
      >
        Sign in
      </button>
    </div>
  );
}
