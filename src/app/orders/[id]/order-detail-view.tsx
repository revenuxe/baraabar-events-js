"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Package,
  Loader2,
  MapPin,
  Calendar,
  Clock,
  Ruler,
  Phone,
  StickyNote,
  Image as ImageIcon,
  XCircle,
  Truck,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { RefImageThumb } from "@/components/RefImageThumb";
import { createClient } from "@/lib/supabase/client";
import {
  STAGE_PCT,
  STATUS_LABEL,
  CATEGORY_LABELS,
  MEASUREMENT_MODE_LABEL,
  isCancellable,
} from "@/lib/orders";
import type { Database } from "@/lib/supabase/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Order = Database["public"]["Tables"]["bookings"]["Row"];
type BookingItem = Database["public"]["Tables"]["booking_items"]["Row"];
export type Address = Database["public"]["Tables"]["addresses"]["Row"];
type StatusEvent = Database["public"]["Tables"]["booking_status_events"]["Row"];

export function OrderDetailView({
  order: initialOrder,
  items,
  pickupAddr,
  deliveryAddr,
  statusEvents,
}: {
  order: Order;
  items: BookingItem[];
  pickupAddr: Address | null;
  deliveryAddr: Address | null;
  statusEvents: StatusEvent[];
}) {
  const [order, setOrder] = useState(initialOrder);
  const [cancelling, setCancelling] = useState(false);
  const [events, setEvents] = useState(statusEvents);

  async function cancelOrder() {
    setCancelling(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", order.id);
    setCancelling(false);
    if (!error) {
      setOrder((o) => ({ ...o, status: "cancelled" }));
      // The booking_status_events row itself is written server-side by a
      // DB trigger, not this client — append a matching local entry so the
      // timeline reflects it immediately instead of waiting on a refetch.
      setEvents((evs) => [
        ...evs,
        { id: crypto.randomUUID(), booking_id: order.id, status: "cancelled", note: null, created_at: new Date().toISOString() },
      ]);
    }
  }

  const pct = STAGE_PCT[order.status] ?? 10;
  const statusLabel = STATUS_LABEL[order.status] ?? String(order.status).replace(/_/g, " ");
  const categoryLabel = order.category_slug
    ? (CATEGORY_LABELS[order.category_slug] ?? order.category_slug)
    : null;
  const sameAddress =
    !!order.pickup_address_id && order.pickup_address_id === order.delivery_address_id;
  const canCancel = isCancellable(order.status);

  return (
    <div className="min-h-dvh bg-background">
      <TopBar />
      <main className="mx-auto max-w-md px-5 pb-28 pt-2">
        <button
          onClick={() => window.history.back()}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Orders
        </button>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl">#{order.order_number}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Placed{" "}
              {new Date(order.created_at).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              order.status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-muted"
            }`}
          >
            {statusLabel}
          </span>
        </div>

        {/* progress */}
        <section className="mt-5 rounded-3xl bg-card p-4 shadow-card">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${
                order.status === "cancelled" ? "bg-destructive" : "bg-gradient-brand"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="font-semibold">{pct}% complete</span>
            {order.pickup_date && (
              <span className="text-muted-foreground">
                Pickup · {new Date(order.pickup_date).toLocaleDateString()}
                {order.pickup_window ? ` · ${order.pickup_window}` : ""}
              </span>
            )}
          </div>
        </section>

        {/* status timeline */}
        {events.length > 0 && (
          <section className="mt-4 rounded-3xl bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Order history
            </div>
            <ol className="mt-3 space-y-3">
              {events.map((ev, i) => {
                const isLatest = i === events.length - 1;
                return (
                  <li key={ev.id} className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                        isLatest ? "bg-primary" : "bg-muted-foreground/40"
                      }`}
                    />
                    <div className="flex-1">
                      <p className={`text-xs ${isLatest ? "font-bold" : "font-semibold text-muted-foreground"}`}>
                        {STATUS_LABEL[ev.status] ?? ev.status}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(ev.created_at).toLocaleString(undefined, {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                      {ev.note && <p className="mt-0.5 text-[11px] text-muted-foreground">{ev.note}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* garment details */}
        <section className="mt-4 rounded-3xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">
                {order.quantity} garment{order.quantity > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {[categoryLabel, items.length === 0 && order.garment_label, order.style_label]
                  .filter(Boolean)
                  .join(" · ") || "Details pending"}
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              {items.map((it) => (
                <div key={it.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">
                      {it.garment_label}
                      {it.style_label && (
                        <span className="ml-1.5 font-normal text-muted-foreground">
                          · {it.style_label}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-3">
                      {(it.estimated_price_min || it.estimated_price_max) && (
                        <span className="text-xs text-muted-foreground">
                          ₹{it.estimated_price_min ?? "—"}–₹{it.estimated_price_max ?? "—"}
                        </span>
                      )}
                      <span className="font-semibold">× {it.quantity}</span>
                    </span>
                  </div>
                  {Array.isArray(it.reference_images) && it.reference_images.length > 0 && (
                    <div className="mt-1.5 flex gap-2 overflow-x-auto">
                      {it.reference_images.map((src, i) => (
                        <div key={i} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                          <RefImageThumb
                            src={src}
                            alt={`${it.garment_label} reference ${i + 1}`}
                            sizes="56px"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {order.measurement_mode && (
            <div className="mt-4 flex items-start gap-2.5 border-t border-border pt-4 text-xs">
              <Ruler className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span>
                {MEASUREMENT_MODE_LABEL[order.measurement_mode] ?? order.measurement_mode}
              </span>
            </div>
          )}

          {order.notes && (
            <div className="mt-3 flex items-start gap-2.5 text-xs">
              <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">{order.notes}</span>
            </div>
          )}

          {order.wants_stylist_call && (
            <div className="mt-3 flex items-start gap-2.5 text-xs">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">Stylist call requested</span>
            </div>
          )}

          {items.length === 0 && Array.isArray(order.reference_images) && order.reference_images.length > 0 && (
            <div className="mt-4 border-t border-border pt-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                Reference images
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {order.reference_images.map((src: string, i: number) => (
                  <div key={i} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <RefImageThumb src={src} alt={`Reference ${i + 1}`} sizes="64px" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {(order.estimated_price_min || order.estimated_price_max) && (
            <div className="mt-4 border-t border-border pt-4 text-xs">
              <span className="font-semibold">Estimated price: </span>
              <span className="text-muted-foreground">
                ₹{order.estimated_price_min ?? "—"} – ₹{order.estimated_price_max ?? "—"}
              </span>
            </div>
          )}
        </section>

        {/* pickup / delivery */}
        <section className="mt-4 rounded-3xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <Truck className="h-3.5 w-3.5" />
            Pickup
          </div>
          {pickupAddr ? (
            <AddressBlock addr={pickupAddr} />
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">No address on file.</p>
          )}
          {order.pickup_date && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(order.pickup_date).toLocaleDateString(undefined, {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
              {order.pickup_window && (
                <>
                  <Clock className="ml-1 h-3.5 w-3.5" />
                  {order.pickup_window}
                </>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Delivery
          </div>
          {sameAddress ? (
            <p className="mt-2 text-xs text-muted-foreground">Same as pickup address.</p>
          ) : deliveryAddr ? (
            <AddressBlock addr={deliveryAddr} />
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">No address on file.</p>
          )}

          {order.contact_phone && (
            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              {order.contact_phone}
            </div>
          )}
        </section>

        {canCancel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={cancelling}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-destructive/30 py-3 text-sm font-bold text-destructive disabled:opacity-60"
              >
                {cancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Cancel order
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                <AlertDialogDescription>
                  Order #{order.order_number} will be cancelled and pickup will not go ahead. This
                  can&apos;t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep order</AlertDialogCancel>
                <AlertDialogAction
                  onClick={cancelOrder}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Cancel order
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function AddressBlock({ addr }: { addr: Address }) {
  return (
    <div className="mt-2 text-xs text-muted-foreground">
      {addr.label && <p className="font-semibold text-foreground">{addr.label}</p>}
      <p>
        {addr.line1}
        {addr.line2 ? `, ${addr.line2}` : ""}
      </p>
      <p>
        {addr.city}
        {addr.state ? `, ${addr.state}` : ""} — {addr.pincode}
      </p>
    </div>
  );
}
