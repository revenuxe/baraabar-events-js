"use client";

import { useState } from "react";
import { ServiceCard } from "@/components/ServiceCard";
import { SubcategoryCard } from "@/components/SubcategoryCard";
import { ShowAllCard } from "@/components/ShowAllCard";
import { SearchBar } from "@/components/SearchBar";
import type { DecorService, DecorSubcategory } from "@/data/types";

export function CategoryProductsSection({
  categorySlug,
  services,
  subcategories,
}: {
  categorySlug: string;
  services: DecorService[];
  subcategories: DecorSubcategory[];
}) {
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visibleServices = services.filter((s) => {
    if (activeSub && s.subcategorySlug !== activeSub) return false;
    if (q && !s.name.toLowerCase().includes(q) && !s.tags.some((t) => t.includes(q))) return false;
    return true;
  });

  return (
    <>
      {subcategories.length > 0 && (
        <section className="mx-auto w-full max-w-md px-5 pt-8 md:max-w-6xl md:px-8 md:pt-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">Shop by type</p>
          <div className="no-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0">
            <ShowAllCard active={activeSub === null} onClick={() => setActiveSub(null)} />
            {subcategories.map((s) => (
              <SubcategoryCard
                key={s.id}
                subcategory={s}
                active={activeSub === s.slug}
                onClick={() => setActiveSub(s.slug)}
              />
            ))}
            <ShowAllCard href={`/categories/${categorySlug}/sub`} />
          </div>
        </section>
      )}

      <div className="mx-auto w-full max-w-md px-5 pt-6 md:max-w-6xl md:px-8">
        <SearchBar className="max-w-xl" mode="filter" onQueryChange={setQuery} />
      </div>

      <section className="mx-auto w-full max-w-md px-5 py-8 md:max-w-6xl md:px-8 md:py-12">
        {visibleServices.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {visibleServices.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            {q ? `No results for "${query}" here.` : "No services listed here yet — check back soon."}
          </p>
        )}
      </section>
    </>
  );
}
