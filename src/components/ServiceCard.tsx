import Image from "next/image";
import Link from "next/link";
import { Flame, Sparkles, Star } from "lucide-react";
import type { DecorService } from "@/data/types";

export function ServiceCard({
  service,
  badge = "trending",
}: {
  service: DecorService;
  /** Which flag-driven badge to show, e.g. so a product marked both
   * trending and featured shows "Featured" (not "Trending") when it's
   * rendered inside the Featured section. Defaults to trending for every
   * other context (category pages, related products, search). */
  badge?: "trending" | "featured";
}) {
  const showBadge = badge === "featured" ? service.isFeatured : service.isTrending;
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
        {service.discountPct > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-gradient-brand px-2.5 py-1 text-[10px] font-bold text-primary-foreground shadow-glow">
            {service.discountPct}% off
          </span>
        )}
        {showBadge && (
          <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
            {badge === "featured" ? (
              <>
                <Sparkles className="h-3 w-3 fill-current text-accent" /> Featured
              </>
            ) : (
              <>
                <Flame className="h-3 w-3 fill-current text-orange-400" /> Trending
              </>
            )}
          </span>
        )}
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
