"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { STATUS_META } from "@/app/bookings/status-meta";
import type { Database } from "@/lib/supabase/types";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

export default function VendorOrdersPage() {
  const [rows, setRows] = useState<BookingRow[] | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: vendor } = await supabase.from("vendors").select("id").eq("user_id", user.id).maybeSingle();
      if (!vendor) {
        setRows([]);
        return;
      }

      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("assigned_vendor_id", vendor.id)
        .order("event_date", { ascending: true });
      setRows(data ?? []);
    })();
  }, []);

  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display text-2xl">Assigned orders</h2>
        <p className="text-sm text-muted-foreground">{rows ? `${rows.length} order${rows.length === 1 ? "" : "s"}` : " "}</p>
      </div>

      {!rows ? (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No orders assigned to you yet.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((b) => {
            const status = STATUS_META[b.status];
            return (
              <Link
                key={b.id}
                href={`/vendor/dashboard/orders/${b.id}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-sm shadow-card transition active:scale-[0.99]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">#{b.order_code}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {new Date(b.event_date).toLocaleDateString(undefined, { day: "numeric", month: "short" })} ·{" "}
                    {b.event_time} · {b.venue_city}
                  </p>
                </div>
                {!b.vendor_accepted_at ? (
                  <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                    Needs your response
                  </span>
                ) : (
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${status.badgeClass}`}>
                    {status.label}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
