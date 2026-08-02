import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";
import { OrderDetailView, type Address } from "./order-detail-view";

export const metadata: Metadata = { title: "Order details — Baraabar" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/auth?redirect=${encodeURIComponent(`/orders/${id}`)}`);

  const { data: order } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) {
    return (
      <div className="min-h-dvh bg-background">
        <TopBar />
        <main className="mx-auto max-w-md px-5 pb-28 pt-6 text-center">
          <p className="text-sm text-muted-foreground">Order not found.</p>
          <Link
            href="/orders"
            className="mt-4 inline-flex rounded-full bg-gradient-brand px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-glow"
          >
            Back to orders
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  const addrIds = [
    ...new Set([order.pickup_address_id, order.delivery_address_id].filter(Boolean)),
  ] as string[];

  const [{ data: items }, { data: addrs }] = await Promise.all([
    supabase
      .from("booking_items")
      .select("*")
      .eq("booking_id", order.id)
      .order("sort_order", { ascending: true }),
    addrIds.length
      ? supabase.from("addresses").select("*").in("id", addrIds)
      : Promise.resolve({ data: [] as Address[] }),
  ]);

  const byId = new Map((addrs ?? []).map((a: Address) => [a.id, a]));

  return (
    <OrderDetailView
      order={order}
      items={items ?? []}
      pickupAddr={byId.get(order.pickup_address_id ?? "") ?? null}
      deliveryAddr={byId.get(order.delivery_address_id ?? "") ?? null}
    />
  );
}
