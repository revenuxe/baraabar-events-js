import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { DecorCategory } from "@/data/types";

export function CategoryStrip({ categories }: { categories: DecorCategory[] }) {
  return (
    <section className="mx-auto w-full max-w-md px-5 py-10 md:max-w-6xl md:px-8 md:py-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            Our services
          </p>
          <h2 className="mt-1 font-display text-3xl leading-tight md:text-5xl">
            Browse by <span className="italic text-gradient-brand">category</span>
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground md:text-base">
            Every setup is designed and installed by trained decorators — start with your
            occasion.
          </p>
        </div>
        <Link
          href="/categories"
          className="hidden shrink-0 text-sm font-semibold text-primary md:inline-flex md:items-center md:gap-1"
        >
          View all <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        {categories.slice(0, 6).map((c) => (
          <Link
            key={c.slug}
            href={`/categories/${c.slug}`}
            className="group relative block aspect-[3/4] overflow-hidden rounded-3xl shadow-card transition-all active:scale-[0.98] md:aspect-[4/5] md:hover:-translate-y-1 md:hover:shadow-elevated"
          >
            <Image
              src={c.heroImage}
              alt={`${c.name} — ${c.tagline}`}
              loading="lazy"
              fill
              sizes="(min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              aria-hidden
              className={`absolute inset-0 bg-gradient-to-t ${c.accent} mix-blend-multiply opacity-70 transition-opacity group-hover:opacity-60`}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"
            />

            <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-primary shadow-glow transition-transform group-hover:rotate-45 md:right-4 md:top-4 md:h-10 md:w-10">
              <ArrowUpRight className="h-4 w-4" />
            </div>

            <div className="absolute inset-x-3 bottom-3 text-primary-foreground md:inset-x-5 md:bottom-5">
              <h3 className="font-display text-2xl leading-none md:text-3xl">{c.name}</h3>
              <p className="mt-1 text-[12px] opacity-90 md:text-sm">{c.tagline}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
