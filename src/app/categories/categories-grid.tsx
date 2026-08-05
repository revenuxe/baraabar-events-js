"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import type { DecorCategory } from "@/data/types";

export function CategoriesGrid({ categories }: { categories: DecorCategory[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visible = q ? categories.filter((c) => c.name.toLowerCase().includes(q)) : categories;

  return (
    <>
      <SearchBar className="mb-8 max-w-xl" mode="filter" onQueryChange={setQuery} />

      {visible.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {visible.map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="group relative block aspect-[3/4] overflow-hidden rounded-3xl shadow-card transition-all active:scale-[0.98] md:hover:-translate-y-1 md:hover:shadow-elevated"
            >
              <Image
                src={c.heroImage}
                alt={`${c.name} — ${c.tagline}`}
                loading="lazy"
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                aria-hidden
                className={`absolute inset-0 bg-gradient-to-t ${c.accent} mix-blend-multiply opacity-70`}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"
              />
              <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-primary shadow-glow transition-transform group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <div className="absolute inset-x-3 bottom-3 text-primary-foreground">
                <h3 className="font-display text-xl leading-none md:text-2xl">{c.name}</h3>
                <p className="mt-1 text-[11px] opacity-90 md:text-sm">{c.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">No categories match &ldquo;{query}&rdquo;.</p>
      )}
    </>
  );
}
