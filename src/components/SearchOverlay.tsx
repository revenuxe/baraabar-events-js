"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ArrowUpRight, Layers, Loader2, Search, Shirt, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_LABELS } from "@/lib/orders";

type ServiceHit = { slug: string; name: string; tagline: string | null };
type GarmentHit = {
  slug: string;
  name: string;
  description: string | null;
  categorySlug: string | null;
  basePriceMin: number | null;
};
type PageHit = { href: string; name: string; description: string };

const STATIC_PAGES: PageHit[] = [
  { href: "/book", name: "Book a fabric pickup", description: "Pickup, home measurement and stitching" },
  { href: "/design", name: "AI Design Studio", description: "Coming soon" },
  { href: "/orders", name: "My Orders", description: "Track an order in progress" },
  { href: "/drafts", name: "Saved Drafts", description: "Resume a saved booking" },
  { href: "/profile", name: "Profile", description: "Your account and addresses" },
  { href: "/contact", name: "Contact Us", description: "Phone, email and studio address" },
  { href: "/terms", name: "Terms & Conditions", description: "" },
  { href: "/privacy", name: "Privacy Policy", description: "" },
];

export function SearchOverlay({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [services, setServices] = useState<ServiceHit[]>([]);
  const [garments, setGarments] = useState<GarmentHit[]>([]);
  const [loaded, setLoaded] = useState(false);
  const loading = open && !loaded;

  useEffect(() => {
    if (!open || loaded) return;
    (async () => {
      const supabase = createClient();
      const [{ data: categories }, { data: garmentTypes }] = await Promise.all([
        supabase.from("categories").select("id,slug,name,tagline").order("sort_order"),
        supabase
          .from("garment_types")
          .select("slug,name,description,category_id,base_price_min")
          .order("sort_order"),
      ]);
      const catById = new Map((categories ?? []).map((c) => [c.id, c]));
      setServices((categories ?? []).map((c) => ({ slug: c.slug, name: c.name, tagline: c.tagline })));

      // The same garment (e.g. "Suit") is seeded under several categories
      // (Men, Wedding, Office) so it has one selectable card per category
      // in the booking flow — but for search, one result per garment name
      // reads far better than three identical-looking duplicates.
      const seenNames = new Set<string>();
      const dedupedGarments = (garmentTypes ?? []).reduce<GarmentHit[]>((acc, g) => {
        const key = g.name.toLowerCase();
        if (seenNames.has(key)) return acc;
        seenNames.add(key);
        acc.push({
          slug: g.slug,
          name: g.name,
          description: g.description,
          categorySlug: catById.get(g.category_id ?? "")?.slug ?? null,
          basePriceMin: g.base_price_min,
        });
        return acc;
      }, []);
      setGarments(dedupedGarments);
      setLoaded(true);
    })();
  }, [open, loaded]);

  const q = query.trim().toLowerCase();
  const matchedServices = q
    ? services.filter(
        (s) => s.name.toLowerCase().includes(q) || (s.tagline ?? "").toLowerCase().includes(q),
      )
    : services;
  const matchedGarments = q
    ? garments.filter(
        (g) => g.name.toLowerCase().includes(q) || (g.description ?? "").toLowerCase().includes(q),
      )
    : [];
  const matchedPages = q
    ? STATIC_PAGES.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
      )
    : STATIC_PAGES.slice(0, 4);

  const noResults =
    !loading && q && matchedServices.length + matchedGarments.length + matchedPages.length === 0;

  const handleOpenChange = (next: boolean) => {
    if (!next) setQuery("");
    onOpenChange(next);
  };
  const close = () => handleOpenChange(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-x-0 top-0 z-50 mx-auto w-full max-w-2xl p-4 pt-[max(1rem,env(safe-area-inset-top))] outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-4 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-4"
        >
          <DialogPrimitive.Title className="sr-only">Search Baraabar</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search our services, garments and pages
          </DialogPrimitive.Description>
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services, garments and more…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <DialogPrimitive.Close
                aria-label="Close search"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </DialogPrimitive.Close>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-2">
              {loading && (
                <div className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              )}

              {!loading && noResults && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No results for &ldquo;{query}&rdquo;
                </p>
              )}

              {!loading && matchedServices.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Services
                  </p>
                  {matchedServices.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/book?category=${s.slug}`}
                      onClick={close}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-brand text-primary-foreground">
                        <Layers className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{s.name}</span>
                        {s.tagline && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {s.tagline}
                          </span>
                        )}
                      </span>
                      <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}

              {!loading && matchedGarments.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Garments
                  </p>
                  {matchedGarments.map((g) => (
                    <Link
                      key={g.slug}
                      href={g.categorySlug ? `/book?category=${g.categorySlug}` : "/book"}
                      onClick={close}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-foreground">
                        <Shirt className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{g.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {[
                            g.categorySlug ? (CATEGORY_LABELS[g.categorySlug] ?? g.categorySlug) : null,
                            g.basePriceMin ? `From ₹${g.basePriceMin}` : g.description,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                      <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}

              {!loading && matchedPages.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Pages
                  </p>
                  {matchedPages.map((p) => (
                    <Link
                      key={p.href}
                      href={p.href}
                      onClick={close}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{p.name}</span>
                        {p.description && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {p.description}
                          </span>
                        )}
                      </span>
                      <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
