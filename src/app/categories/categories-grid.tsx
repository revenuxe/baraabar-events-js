"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import type { DecorCategory } from "@/data/types";

export function CategoriesGrid({ categories }: { categories: DecorCategory[] }) {
  const [query, setQuery] = useState("");
  const visible = query.trim() ? categories.filter((category) => category.name.toLowerCase().includes(query.trim().toLowerCase())) : categories;
  return <><SearchBar className="mb-8 max-w-xl" mode="filter" onQueryChange={setQuery} />{visible.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-4 md:gap-x-6 md:gap-y-10">{visible.map((category) => <Link key={category.slug} href={`/categories/${category.slug}`} className="group block text-center transition-transform active:scale-[.98] md:hover:-translate-y-1"><div className="relative aspect-[1.06] overflow-hidden rounded-[1.4rem] border border-[#f2e0cf] bg-[#fff4e9] p-2 shadow-card"><div className="relative h-full w-full overflow-hidden rounded-[1.05rem]"><Image src={category.heroImage} alt={category.name} fill loading="lazy" sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /></div></div><h3 className="mt-3 text-[15px] font-semibold text-primary md:text-lg">{category.name}</h3></Link>)}</div> : <p className="text-center text-sm text-muted-foreground">No categories match &ldquo;{query}&rdquo;.</p>}</>;
}
