"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, ArrowRight, MapPin } from "lucide-react";

// Bangalore PIN codes are 560xxx. Only city currently live — everywhere
// else is "coming soon" until service actually expands there.
function isBangalorePincode(pincode: string) {
  return /^560\d{3}$/.test(pincode);
}

type Result = "available" | "unavailable" | null;

export function PincodeCheck() {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [invalid, setInvalid] = useState(false);

  function onCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setInvalid(true);
      setResult(null);
      return;
    }
    setInvalid(false);
    setResult(isBangalorePincode(pincode) ? "available" : "unavailable");
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-card md:p-6">
      <p className="text-sm font-bold">Check service in your area</p>

      <form onSubmit={onCheck} className="mt-3 flex gap-2">
        <div className="relative w-full">
          <span className="pointer-events-none absolute left-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-gradient-brand text-primary-foreground">
            <MapPin className="h-3.5 w-3.5" />
          </span>
          <input
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setInvalid(false);
              setResult(null);
            }}
            inputMode="numeric"
            placeholder="Enter pincode"
            maxLength={6}
            className="w-full rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-full bg-gradient-brand px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-all active:scale-[0.98]"
        >
          Check
        </button>
      </form>

      {invalid && (
        <p className="mt-3 text-xs font-semibold text-destructive">
          Enter a valid 6-digit pincode.
        </p>
      )}

      {result === "available" && (
        <div className="mt-4 rounded-2xl bg-primary/10 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs font-semibold text-primary">
              We're live in your area — free doorstep pickup available.
            </p>
          </div>
          <Link
            href="/book"
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-full bg-gradient-brand px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow"
          >
            Book Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {result === "unavailable" && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-muted p-3">
          <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs font-semibold text-muted-foreground">
            We're currently expanding — service will be available in your area soon!
          </p>
        </div>
      )}
    </div>
  );
}
