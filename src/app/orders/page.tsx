import type { Metadata } from "next";
import Link from "next/link";
import { Package, LogIn, ChevronRight } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { createClient } from "@/lib/supabase/server";
import { STAGE_PCT, STATUS_LABEL } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Your orders — Baraabar",
  description: "Track every stage of your Baraabar order in real time.",
  openGraph: {
    title: "Your orders — Baraabar",
    description: "Track your custom orders in real time.",
  },
};

type BookingRow = {
  id: string;
  order_number: string;
  quantity: number;
  garment_label: string | null;
  status: string;
  pickup_date: string | null;
  pickup_window: string | null;
  created_at: string;
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let rows: BookingRow[] = [];
  if (user) {
    const { data } = await supabase
      .from("bookings")
      .select(
        "id, order_number, quantity, garment_label, status, pickup_date, pickup_window, created_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    rows = data ?? [];
  }

  return (
    <div className="min-h-dvh bg-background">
      <TopBar />
      <main className="mx-auto max-w-md px-5 pb-28 pt-2">
        <h1 className="font-display text-4xl">Your orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Live progress from stitch to doorstep.</p>

        {!user ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
              <LogIn className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold">Sign in to see your orders</p>
            <Link
              href="/auth?redirect=%2Forders"
              className="mt-4 inline-flex rounded-full bg-gradient-brand px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-glow"
            >
              Sign in
            </Link>
            <div className="mx-auto mt-4 max-w-[220px]">
              <GoogleSignInButton
                redirectTo="/orders"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground shadow-card disabled:opacity-60"
              />
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No orders yet.</p>
            <Link
              href="/book"
              className="mt-4 inline-flex rounded-full bg-gradient-brand px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-glow"
            >
              Book your first pickup
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {rows.map((o) => {
              const pct = STAGE_PCT[o.status] ?? 10;
              return (
                <Link
                  key={o.id}
                  href={`/orders/${o.id}`}
                  className="block rounded-3xl bg-card p-4 shadow-card transition-transform active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">
                          {o.garment_label || `${o.quantity} garment${o.quantity > 1 ? "s" : ""}`}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          #{o.order_number} · {o.quantity} pc{o.quantity > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold">
                        {STATUS_LABEL[o.status] ?? String(o.status).replace(/_/g, " ")}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-brand"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px]">
                      <span className="font-semibold">{pct}% complete</span>
                      <span className="text-muted-foreground">
                        {o.pickup_date
                          ? `Pickup · ${new Date(o.pickup_date).toLocaleDateString()}`
                          : `Placed · ${new Date(o.created_at).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
