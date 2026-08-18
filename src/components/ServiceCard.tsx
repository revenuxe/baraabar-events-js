import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import type { DecorService } from "@/data/types";

export function ServiceCard({ service, size = "sm" }: { service: DecorService; badge?: "trending" | "featured"; size?: "sm" | "md" }) {
  return (
    <Link href={`/categories/${service.categorySlug}/${service.slug}`} className="group block overflow-hidden rounded-2xl border border-[#dce4ed] bg-card shadow-card transition-all active:scale-[0.98] md:hover:-translate-y-1 md:hover:shadow-elevated">
      <div className={`relative overflow-hidden ${size === "md" ? "aspect-[4/3]" : "aspect-square"}`}>
        <Image src={service.images[0]} alt={service.name} fill loading="lazy" sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-black/20 text-white backdrop-blur"><Heart className="h-4 w-4" /></span>
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 min-h-9 text-[15px] font-bold leading-tight text-primary">{service.name}</h3>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><span>At your location</span><span className="mx-1 text-border">•</span><Star className="h-3.5 w-3.5 fill-[#d49a13] text-[#d49a13]" /><span className="font-semibold text-primary">{service.rating}</span></div>
        <div className="mt-3 flex items-baseline gap-1.5 border-t border-border pt-3"><span className="text-base font-bold text-primary">₹{service.priceDiscounted.toLocaleString("en-IN")}</span>{service.priceOriginal > service.priceDiscounted && <span className="text-[11px] text-muted-foreground line-through">₹{service.priceOriginal.toLocaleString("en-IN")}</span>}</div>
        <span className="mt-3 flex w-full items-center justify-center rounded-md bg-primary px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">Book now</span>
      </div>
    </Link>
  );
}
