import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ServiceCard } from "@/components/ServiceCard";
import type { DecorService } from "@/data/types";

export function FeaturedCollections({ services }: { services: DecorService[] }) {
  if (services.length === 0) return null;
  return (
    <section className="mx-auto w-full max-w-md px-5 py-10 md:max-w-6xl md:px-8 md:py-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Trending now</p>
          <h2 className="mt-1 font-display text-3xl leading-tight md:text-5xl">
            Featured <span className="italic text-gradient-brand">setups</span>
          </h2>
        </div>
        <Link
          href="/categories"
          className="hidden shrink-0 text-sm font-semibold text-primary md:inline-flex md:items-center md:gap-1"
        >
          View all <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="no-scrollbar -mx-5 flex snap-x-mandatory gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
        {services.map((s) => (
          <div key={s.id} className="w-48 shrink-0 snap-start-safe md:w-auto">
            <ServiceCard service={s} />
          </div>
        ))}
      </div>
    </section>
  );
}
