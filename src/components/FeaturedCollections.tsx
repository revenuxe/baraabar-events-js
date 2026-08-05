import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ServiceCard } from "@/components/ServiceCard";
import type { DecorService } from "@/data/types";

export function FeaturedCollections({
  services,
  eyebrow,
  title,
  titleAccent,
  viewAllHref,
  cardBadge = "trending",
}: {
  services: DecorService[];
  eyebrow: string;
  title: string;
  titleAccent: string;
  viewAllHref: string;
  cardBadge?: "trending" | "featured";
}) {
  if (services.length === 0) return null;
  return (
    <section className="mx-auto w-full max-w-md px-5 pb-10 md:max-w-6xl md:px-8 md:pb-16">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-accent">{eyebrow}</p>
          <h2 className="mt-1 font-display text-3xl leading-tight md:text-5xl">
            {title} <span className="italic text-gradient-brand">{titleAccent}</span>
          </h2>
        </div>
        <Link
          href={viewAllHref}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary md:text-sm"
        >
          View all <ArrowUpRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </Link>
      </div>

      <div className="no-scrollbar -mx-5 flex snap-x-mandatory gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
        {services.map((s) => (
          <div key={s.id} className="w-48 shrink-0 snap-start-safe md:w-auto">
            <ServiceCard service={s} badge={cardBadge} />
          </div>
        ))}
      </div>
    </section>
  );
}
