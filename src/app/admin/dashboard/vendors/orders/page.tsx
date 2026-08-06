"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { STATUS_META } from "@/app/bookings/status-meta";
import type { Database } from "@/lib/supabase/types";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
type VendorLite = { id: string; business_name: string };

function money(n: number | null): string {
  return `Rs. ${Number(n ?? 0).toLocaleString("en-IN")}`;
}

export default function VendorOrdersAssignedPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [vendors, setVendors] = useState<Record<string, VendorLite>>({});
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [billInput, setBillInput] = useState("");
  const [paidInput, setPaidInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data: bookingRows } = await supabase
      .from("bookings")
      .select("*")
      .not("assigned_vendor_id", "is", null)
      .order("created_at", { ascending: false });
    setBookings(bookingRows ?? []);

    const vendorIds = [...new Set((bookingRows ?? []).map((b) => b.assigned_vendor_id).filter((id): id is string => !!id))];
    if (vendorIds.length) {
      const { data: vendorRows } = await supabase.from("vendors").select("id, business_name").in("id", vendorIds);
      const map: Record<string, VendorLite> = {};
      for (const v of vendorRows ?? []) map[v.id] = v;
      setVendors(map);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openBooking(b: BookingRow) {
    setSelectedId(b.id);
    setBillInput(b.vendor_bill_amount ? String(b.vendor_bill_amount) : b.vendor_quote_amount ? String(b.vendor_quote_amount) : "");
    setPaidInput(b.vendor_bill_amount ? String(b.vendor_bill_amount) : "");
  }

  async function saveBill(booking: BookingRow) {
    const amount = Number(billInput);
    if (!amount || amount <= 0) return alert("Enter a bill amount greater than 0");
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("bookings").update({ vendor_bill_amount: amount }).eq("id", booking.id);
    setBusy(false);
    if (error) return alert(error.message);
    setBookings((rows) => rows.map((b) => (b.id === booking.id ? { ...b, vendor_bill_amount: amount } : b)));
  }

  // Inserts into the vendor_payments ledger (see billing/page.tsx) rather
  // than setting bookings.vendor_paid_amount directly — a DB trigger keeps
  // that summary column in sync, so this stays consistent with the payment
  // history shown on the Billing tab instead of silently overwriting it.
  async function recordPayment(booking: BookingRow) {
    const amount = Number(paidInput);
    if (!amount || amount <= 0) return alert("Enter a paid amount greater than 0");
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("vendor_payments")
      .insert({ booking_id: booking.id, amount, recorded_by: user?.id ?? null });
    if (error) {
      setBusy(false);
      return alert(error.message);
    }
    const { data: refreshed } = await supabase.from("bookings").select("*").eq("id", booking.id).single();
    setBusy(false);
    if (refreshed) setBookings((rows) => rows.map((b) => (b.id === booking.id ? refreshed : b)));
  }

  const selected = useMemo(() => bookings.find((b) => b.id === selectedId) ?? null, [bookings, selectedId]);

  return (
    <section>
      <p className="mb-4 text-sm text-muted-foreground">
        {bookings.length} order{bookings.length === 1 ? "" : "s"} assigned to a vendor
      </p>

      {loading ? (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No orders assigned to a vendor yet.
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => {
            const status = STATUS_META[b.status];
            const vendor = b.assigned_vendor_id ? vendors[b.assigned_vendor_id] : undefined;
            return (
              <button
                key={b.id}
                onClick={() => openBooking(b)}
                className="flex w-full flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left text-sm transition active:scale-[0.99]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    #{b.order_code} · {vendor?.business_name ?? "Unknown vendor"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    Quote {money(b.vendor_quote_amount)} · Bill {money(b.vendor_bill_amount)}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${status.badgeClass}`}>
                  {status.label}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    b.vendor_payment_status === "paid" ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"
                  }`}
                >
                  {b.vendor_payment_status === "paid" ? "Paid" : "Unpaid"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-4"
          onClick={() => setSelectedId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] w-full max-w-sm overflow-y-auto rounded-t-3xl bg-card shadow-elevated md:max-h-[85vh] md:rounded-3xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 p-4 backdrop-blur-lg">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">#{selected.order_code}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {selected.assigned_vendor_id ? vendors[selected.assigned_vendor_id]?.business_name : ""}
                </p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                aria-label="Close"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-4 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-dashed border-border p-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Vendor quote
                </span>
                <span className="font-bold">{money(selected.vendor_quote_amount)}</span>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Bill amount (Rs.)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={billInput}
                    onChange={(e) => setBillInput(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => saveBill(selected)}
                    disabled={busy}
                    className="shrink-0 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold disabled:opacity-60"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      selected.vendor_payment_status === "paid"
                        ? "bg-emerald-500/15 text-emerald-600"
                        : "bg-amber-500/15 text-amber-600"
                    }`}
                  >
                    {selected.vendor_payment_status === "paid"
                      ? `Paid ${money(selected.vendor_paid_amount)}`
                      : "Unpaid"}
                  </span>
                </div>
                {selected.vendor_payment_status !== "paid" && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={paidInput}
                      onChange={(e) => setPaidInput(e.target.value)}
                      placeholder="Amount (advance or final)"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={() => recordPayment(selected)}
                      disabled={busy}
                      className="shrink-0 rounded-xl bg-gradient-brand px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow disabled:opacity-60"
                    >
                      Record payment
                    </button>
                  </div>
                )}
              </div>

              {(selected.setup_image_url || selected.completion_image_url) && (
                <div className="space-y-3 border-t border-border pt-4">
                  {selected.setup_image_url && (
                    <div>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Setup photo
                      </p>
                      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
                        <Image src={selected.setup_image_url} alt="Setup" fill sizes="380px" className="object-cover" />
                      </div>
                    </div>
                  )}
                  {selected.completion_image_url && (
                    <div>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Completion photo
                      </p>
                      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
                        <Image
                          src={selected.completion_image_url}
                          alt="Completion"
                          fill
                          sizes="380px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
