"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import type { DecorSubcategory } from "@/data/types";

export function SubcategoriesGrid({ categorySlug, subcategories }: { categorySlug: string; subcategories: DecorSubcategory[] }) {
  const [query, setQuery] = useState("");
  const visible = query.trim() ? subcategories.filter((subcategory) => subcategory.name.toLowerCase().includes(query.trim().toLowerCase())) : subcategories;
  return <><SearchBar className="mb-8 max-w-xl" mode="filter" onQueryChange={setQuery} />{visible.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-4 md:gap-x-6 md:gap-y-10">{visible.map((subcategory) => <Link key={subcategory.slug} href={`/categories/${categorySlug}/sub/${subcategory.slug}`} className="group block text-center transition-transform active:scale-[.98] md:hover:-translate-y-1"><div className="relative aspect-[1.06] overflow-hidden rounded-[1.4rem] border border-[#f2e0cf] bg-[#fff4e9] p-2 shadow-card"><div className="relative h-full w-full overflow-hidden rounded-[1.05rem]">{subcategory.image ? <Image src={subcategory.image} alt={subcategory.name} fill loading="lazy" sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="h-full w-full bg-[#edf7f8]" />}</div></div><h3 className="mt-3 text-[15px] font-semibold text-primary md:text-lg">{subcategory.name}</h3></Link>)}</div> : <p className="text-center text-sm text-muted-foreground">No types match &ldquo;{query}&rdquo;.</p>}</>;
}
