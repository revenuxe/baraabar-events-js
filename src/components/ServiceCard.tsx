import Image from "next/image";
import Link from "next/link";
import { Flame, Sparkles, Star } from "lucide-react";
import type { DecorService } from "@/data/types";

export function ServiceCard({
  service,
  badge = "trending",
  size = "sm",
}: {
  service: DecorService;
  /** Which flag-driven badge to show, e.g. so a product marked both
   * trending and featured shows "Featured" (not "Trending") when it's
   * rendered inside the Featured section. Defaults to trending for every
   * other context (category pages, related products, search). */
  badge?: "trending" | "featured";
  /** Card/badge scale — "md" for the homepage carousels where cards have
   * more breathing room, "sm" (default) for denser grids (category pages,
   * search, related products) where cards run narrower. */
  size?: "sm" | "md";
}) {
  const showBadge = badge === "featured" ? service.isFeatured : service.isTrending;
  const pillClass =
    size === "md"
      ? "rounded-full px-2.5 py-1 text-[10px] font-bold leading-tight"
      : "rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-tight";
  const iconClass = size === "md" ? "h-3 w-3" : "h-2.5 w-2.5";
  return (
    <Link
      href={`/categories/${service.categorySlug}/${service.slug}`}
      className="group block overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all active:scale-[0.98] md:hover:-translate-y-1 md:hover:shadow-elevated"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={service.images[0]}
          alt={service.name}
          fill
          loading="lazy"
          sizes="(min-width: 768px) 33vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-1">
          {service.discountPct > 0 ? (
            <span className={`shrink-0 bg-gradient-brand text-primary-foreground shadow-glow ${pillClass}`}>
              {service.discountPct}% off
            </span>
          ) : (
            <span />
          )}
          {showBadge && (
            <span className={`flex shrink-0 items-center gap-0.5 bg-black/70 text-white backdrop-blur ${pillClass}`}>
              {badge === "featured" ? (
                <>
                  <Sparkles className={`${iconClass} fill-current text-accent`} /> Featured
                </>
              ) : (
                <>
                  <Flame className={`${iconClass} fill-current text-orange-400`} /> Trending
                </>
              )}
            </span>
          )}
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="truncate text-sm font-bold">{service.name}</h3>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{service.tagline}</p>
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Star className="h-3 w-3 fill-current text-accent" />
          <span className="font-semibold text-foreground">{service.rating}</span>
          <span>({service.reviewCount})</span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-base font-black text-gradient-brand">
            ₹{service.priceDiscounted.toLocaleString("en-IN")}
          </span>
          {service.priceOriginal > service.priceDiscounted && (
            <span className="text-xs text-muted-foreground line-through">
              ₹{service.priceOriginal.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
