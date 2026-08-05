"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, StickyNote, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { STATUS_META, STATUS_ORDER, type BookingStatus } from "@/app/bookings/status-meta";
import type { Database } from "@/lib/supabase/types";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
type BookingItemRow = Database["public"]["Tables"]["booking_items"]["Row"];
type StatusEventRow = Database["public"]["Tables"]["booking_status_events"]["Row"];
type ProfileLite = { full_name: string | null; phone: string | null };

const FILTERS: { key: "all" | BookingStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [itemsByBooking, setItemsByBooking] = useState<Record<string, BookingItemRow[]>>({});
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [events, setEvents] = useState<Record<string, StatusEventRow[]>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const [{ data: bookingRows }, { data: itemRows }] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("booking_items").select("*"),
    ]);
    setBookings(bookingRows ?? []);

    const grouped: Record<string, BookingItemRow[]> = {};
    for (const it of itemRows ?? []) (grouped[it.booking_id] ??= []).push(it);
    setItemsByBooking(grouped);

    const userIds = [...new Set((bookingRows ?? []).map((b) => b.user_id))];
    if (userIds.length) {
      const { data: profileRows } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);
      const map: Record<string, ProfileLite> = {};
      for (const p of profileRows ?? []) map[p.id] = { full_name: p.full_name, phone: p.phone };
      setProfiles(map);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function openBooking(id: string) {
    setSelectedId(id);
    if (!events[id]) {
      const supabase = createClient();
      const { data } = await supabase
        .from("booking_status_events")
        .select("*")
        .eq("booking_id", id)
        .order("created_at");
      setEvents((prev) => ({ ...prev, [id]: data ?? [] }));
    }
  }

  async function updateStatus(id: string, status: BookingStatus) {
    setBusyId(id);
    const supabase = createClient();
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) alert(error.message);
    else {
      setBookings((rows) => rows.map((b) => (b.id === id ? { ...b, status } : b)));
      setEvents((prev) => {
        const rest = { ...prev };
        delete rest[id];
        return rest;
      });
    }
    setBusyId(null);
  }

  async function remove(booking: BookingRow) {
    if (!confirm(`Delete booking #${booking.order_code}? This can't be undone.`)) return;
    setBusyId(booking.id);
    const supabase = createClient();
    const { error } = await supabase.from("bookings").delete().eq("id", booking.id);
    setBusyId(null);
    if (error) return alert(error.message);
    setBookings((rows) => rows.filter((b) => b.id !== booking.id));
    setSelectedId((id) => (id === booking.id ? null : id));
  }

  const filtered = useMemo(
    () => (filter === "all" ? bookings : bookings.filter((b) => b.status === filter)),
    [bookings, filter],
  );
  const selected = selectedId ? (bookings.find((b) => b.id === selectedId) ?? null) : null;

  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display text-2xl">Bookings</h2>
        <p className="text-sm text-muted-foreground">
          {filtered.length} of {bookings.length} booking{bookings.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filter === f.key
                ? "bg-gradient-brand text-primary-foreground shadow-glow"
                : "border border-border bg-card"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No bookings here yet.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((b) => {
            const profile = profiles[b.user_id];
            const items = itemsByBooking[b.id] ?? [];
            const status = STATUS_META[b.status];
            return (
              <button
                key={b.id}
                onClick={() => openBooking(b.id)}
                className="flex w-full flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left text-sm transition active:scale-[0.99]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    #{b.order_code} · {profile?.full_name ?? "Guest"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {items.length} item{items.length === 1 ? "" : "s"} ·{" "}
                    {new Date(b.event_date).toLocaleDateString(undefined, { day: "numeric", month: "short" })} ·{" "}
                    {b.event_time}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold">₹{Number(b.total).toLocaleString("en-IN")}</p>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${status.badgeClass}`}>
                  {status.label}
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
                  {profiles[selected.user_id]?.full_name ?? "Guest"}
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
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</span>
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected.id, e.target.value as BookingStatus)}
                  disabled={busyId === selected.id}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                >
                  {[...STATUS_ORDER, "cancelled" as const].map((s) => (
                    <option key={s} value={s}>
                      {STATUS_META[s].label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => remove(selected)}
                  disabled={busyId === selected.id}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive disabled:opacity-60"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-dashed border-border p-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Event
                </span>
                <span className="text-right text-sm font-semibold">
                  {new Date(selected.event_date).toLocaleDateString(undefined, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  · {selected.event_time}
                </span>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Items</p>
                <div className="space-y-1.5">
                  {(itemsByBooking[selected.id] ?? []).map((it) => (
                    <div key={it.id} className="flex items-center justify-between">
                      <span>
                        {it.service_name} {it.quantity > 1 && `× ${it.quantity}`}
                      </span>
                      <span className="font-semibold">₹{Number(it.unit_price).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-border pt-2 font-bold">
                  <span>Total</span>
                  <span className="text-gradient-brand">₹{Number(selected.total).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p>
                  {selected.venue_name && <span className="font-semibold">{selected.venue_name}, </span>}
                  {selected.venue_line1}
                  {selected.venue_line2 ? `, ${selected.venue_line2}` : ""}, {selected.venue_city} —{" "}
                  {selected.venue_pincode}
                  <br />
                  <span className="text-muted-foreground">
                    {selected.venue_phone}
                    {profiles[selected.user_id]?.phone &&
                      profiles[selected.user_id]!.phone !== selected.venue_phone &&
                      ` · ${profiles[selected.user_id]!.phone}`}
                  </span>
                </p>
              </div>

              {selected.notes && (
                <div className="flex items-start gap-2.5">
                  <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="text-muted-foreground">{selected.notes}</p>
                </div>
              )}

              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">History</p>
                {!events[selected.id] ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <div className="space-y-1">
                    {events[selected.id].map((e) => (
                      <p key={e.id} className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{STATUS_META[e.status].label}</span> —{" "}
                        {new Date(e.created_at).toLocaleString(undefined, {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
