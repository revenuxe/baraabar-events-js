"use client";

import { categoryImg, FALLBACK_ACCENT, type CategoryRow } from "../_lib/helpers";

export function StepCategory({
  categories,
  onSelect,
}: {
  categories: CategoryRow[];
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Step 1 · Outfit</p>
        <h1 className="mt-1 font-display text-3xl leading-tight md:text-4xl">
          Who are we stitching for?
        </h1>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => onSelect(c.slug)}
            className="group relative block aspect-[3/4] overflow-hidden rounded-3xl text-left shadow-card transition-all active:scale-[0.98]"
          >
            <img
              src={categoryImg(c)}
              alt={c.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden
              className={`absolute inset-0 bg-gradient-to-t ${c.accent ?? FALLBACK_ACCENT} mix-blend-multiply opacity-70`}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"
            />
            <div className="absolute inset-x-3 bottom-3 text-primary-foreground">
              <h3 className="font-display text-xl leading-none md:text-2xl">{c.name}</h3>
              {c.tagline && <p className="mt-1 text-[11px] opacity-90 md:text-xs">{c.tagline}</p>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
