"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Check, CheckCircle2, Loader2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadVendorOrderImage } from "@/lib/vendor-upload-client";
import type { Database } from "@/lib/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];
type PaymentStatus = Database["public"]["Enums"]["vendor_payment_status"];

function money(n: number | null): string {
  return `Rs. ${Number(n ?? 0).toLocaleString("en-IN")}`;
}

export function VendorOrderActions({
  bookingId,
  status,
  acceptedAt,
  setupImageUrl,
  completionImageUrl,
  quoteAmount,
  billAmount,
  paymentStatus,
  paidAmount,
}: {
  bookingId: string;
  status: BookingStatus;
  acceptedAt: string | null;
  setupImageUrl: string | null;
  completionImageUrl: string | null;
  quoteAmount: number | null;
  billAmount: number | null;
  paymentStatus: PaymentStatus;
  paidAmount: number;
}) {
  const router = useRouter();
  const [quote, setQuote] = useState(quoteAmount ? String(quoteAmount) : "");
  const [savingQuote, setSavingQuote] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [responding, setResponding] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);

  async function respond(accept: boolean) {
    setResponding(true);
    const supabase = createClient();
    const { error } = await supabase.rpc(accept ? "vendor_accept_assignment" : "vendor_decline_assignment", {
      _booking_id: bookingId,
    });
    setResponding(false);
    if (error) return toast.error(error.message);
    toast.success(accept ? "Order accepted" : "Order declined");
    router.refresh();
    if (!accept) router.push("/vendor/dashboard/orders");
  }

  async function submitQuote() {
    const amount = Number(quote);
    if (!amount || amount <= 0) return toast.error("Enter a quote amount greater than 0");
    setSavingQuote(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("vendor_submit_quote", { _booking_id: bookingId, _amount: amount });
    setSavingQuote(false);
    if (error) return toast.error(error.message);
    toast.success("Quote submitted");
    router.refresh();
  }

  async function recordPayment() {
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) return toast.error("Enter an amount greater than 0");
    setSavingPayment(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("vendor_payments")
      .insert({ booking_id: bookingId, amount, note: paymentNote.trim() || null, recorded_by: user?.id ?? null });
    setSavingPayment(false);
    if (error) return toast.error(error.message);
    toast.success("Payment recorded");
    setPaymentAmount("");
    setPaymentNote("");
    router.refresh();
  }

  async function handlePhoto(kind: "setup" | "completion", file: File) {
    setUploading(true);
    try {
      const url = await uploadVendorOrderImage(file, bookingId, kind);
      const supabase = createClient();
      const { error } = await supabase.rpc("vendor_update_booking_status", {
        _booking_id: bookingId,
        _new_status: kind === "setup" ? "preparing" : "completed",
        _image_url: url,
      });
      if (error) throw error;
      toast.success(kind === "setup" ? "Setup photo uploaded — order is now Preparing" : "Order marked as Completed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (!acceptedAt) {
    return (
      <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-card">
        <h2 className="mb-1 text-sm font-bold">Accept this order?</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Confirm you can take this job to unlock quoting, billing, and progress updates. Declining removes you
          from this order so admin can reassign it.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => respond(false)}
            disabled={responding}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-destructive/40 px-4 py-2.5 text-xs font-semibold text-destructive disabled:opacity-60"
          >
            <X className="h-3.5 w-3.5" /> Decline
          </button>
          <button
            onClick={() => respond(true)}
            disabled={responding}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {responding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Accept
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-card">
        <h2 className="mb-3 text-sm font-bold">Quote & billing</h2>
        <div className="space-y-3 text-sm">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your quote (Rs.)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                disabled={paymentStatus === "paid"}
                placeholder="e.g. 3000"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
              />
              <button
                onClick={submitQuote}
                disabled={savingQuote || paymentStatus === "paid"}
                className="shrink-0 rounded-xl bg-gradient-brand px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow disabled:opacity-50"
              >
                {savingQuote ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Billed amount</span>
            <span className="font-bold">{billAmount ? money(billAmount) : "Not set by admin yet"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                paymentStatus === "paid" ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"
              }`}
            >
              {paymentStatus === "paid" ? `Paid — ${money(paidAmount)}` : `${money(paidAmount)} paid so far`}
            </span>
          </div>

          {billAmount != null && paymentStatus !== "paid" && (
            <div className="space-y-2 border-t border-border/60 pt-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Record a payment you collected
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Amount"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Note (e.g. Advance, Final settlement)"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={recordPayment}
                disabled={savingPayment}
                className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-xs font-bold disabled:opacity-60"
              >
                {savingPayment ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Record payment"}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-card">
        <h2 className="mb-3 text-sm font-bold">Progress photos</h2>

        {status === "pending" && (
          <p className="text-sm text-muted-foreground">
            Waiting for the booking to be confirmed before you can start.
          </p>
        )}

        {status === "confirmed" && (
          <PhotoUpload
            label="Upload a setup photo to mark this order as Preparing"
            uploading={uploading}
            onFile={(f) => handlePhoto("setup", f)}
          />
        )}

        {status === "preparing" && (
          <div className="space-y-4">
            {setupImageUrl && <PhotoPreview label="Setup photo" url={setupImageUrl} />}
            <PhotoUpload
              label="Upload a completion (group) photo to mark this order as Completed"
              uploading={uploading}
              onFile={(f) => handlePhoto("completion", f)}
            />
          </div>
        )}

        {status === "completed" && (
          <div className="space-y-4">
            {setupImageUrl && <PhotoPreview label="Setup photo" url={setupImageUrl} />}
            {completionImageUrl && <PhotoPreview label="Completion photo" url={completionImageUrl} />}
            <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> Order completed
            </p>
          </div>
        )}

        {status === "cancelled" && <p className="text-sm text-muted-foreground">This order was cancelled.</p>}
      </section>
    </>
  );
}

function PhotoUpload({
  label,
  uploading,
  onFile,
}: {
  label: string;
  uploading: boolean;
  onFile: (file: File) => void;
}) {
  return (
    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-border p-6 text-center text-xs font-semibold text-muted-foreground">
      {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
      {uploading ? "Uploading…" : label}
      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </label>
  );
}

function PhotoPreview({ label, url }: { label: string; url: string }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
        <Image src={url} alt={label} fill sizes="480px" className="object-cover" />
      </div>
    </div>
  );
}
