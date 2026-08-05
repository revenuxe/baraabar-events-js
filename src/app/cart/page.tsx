"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { useCart } from "@/lib/cart-store";

export default function CartPage() {
  const router = useRouter();
  const { items, ready, updateQuantity, removeItem, subtotal } = useCart();

  if (!ready) return null;

  return (
    <div className="min-h-dvh bg-background pb-32">
      <TopBar />
      <main className="mx-auto w-full max-w-md px-5 py-8 md:max-w-2xl md:px-8">
        <h1 className="font-display text-3xl leading-tight md:text-5xl">Your Cart</h1>

        {items.length === 0 ? (
          <div className="mt-10 flex flex-col items-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-muted">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Your cart is empty.</p>
            <Link
              href="/categories"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
            >
              Browse decorations <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-3">
              {items.map((it) => {
                const addOnsTotal = it.addOns.reduce((s, a) => s + a.price, 0);
                const lineTotal = (it.unitPrice + addOnsTotal) * it.quantity;
                return (
                  <div
                    key={it.id}
                    className="flex gap-3 rounded-3xl border border-border bg-card p-3 shadow-card"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                      <Image src={it.image} alt={it.serviceName} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {it.categoryName}
                      </p>
                      <h3 className="truncate text-sm font-bold">{it.serviceName}</h3>
                      {it.addOns.length > 0 && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          + {it.addOns.map((a) => a.name).join(", ")}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center gap-3 rounded-full bg-muted px-1.5 py-1">
                          <button
                            onClick={() => updateQuantity(it.id, it.quantity - 1)}
                            className="grid h-6 w-6 place-items-center rounded-full bg-card text-foreground"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-4 text-center text-xs font-bold">{it.quantity}</span>
                          <button
                            onClick={() => updateQuantity(it.id, it.quantity + 1)}
                            className="grid h-6 w-6 place-items-center rounded-full bg-card text-foreground"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-black text-gradient-brand">
                          ₹{lineTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(it.id)}
                      aria-label={`Remove ${it.serviceName}`}
                      className="grid h-8 w-8 shrink-0 place-items-center self-start rounded-full text-muted-foreground hover:bg-muted"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-lg md:static md:mt-8 md:border-0 md:bg-transparent md:p-0">
              <div className="mx-auto max-w-md px-5 md:max-w-2xl md:px-0">
                <div className="flex items-center justify-between rounded-2xl border border-dashed border-border p-4 md:mb-4">
                  <span className="text-sm font-bold">Subtotal</span>
                  <span className="text-xl font-black text-gradient-brand">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <button
                  onClick={() => router.push("/book")}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition-all active:scale-[0.98]"
                >
                  Proceed to Book <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
