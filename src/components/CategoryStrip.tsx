import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { DecorCategory } from "@/data/types";

export function CategoryStrip({ categories }: { categories: DecorCategory[] }) {
  return (
    <section className="mx-auto w-full max-w-md px-5 pb-14 md:max-w-7xl md:px-8 md:pb-20">
      <div className="relative mb-7 md:mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary md:text-[30px]">Categories</h2>
          <div className="mt-2 h-1 w-11 rounded-full bg-[#e61b68]" />
        </div>
        <Link href="/categories" className="absolute bottom-0 right-0 inline-flex items-center gap-1 text-sm font-semibold text-[#e61b68]">View all <ArrowUpRight className="h-4 w-4" /></Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-6 md:gap-x-4 md:gap-y-8">
        {categories.slice(0, 6).map((category) => (
          <Link key={category.slug} href={`/categories/${category.slug}`} className="group block text-center transition-transform active:scale-[0.98] md:hover:-translate-y-1">
            <div className="relative aspect-[1.06] overflow-hidden rounded-[1.4rem] border border-[#f2e0cf] bg-[#fff4e9] p-2 shadow-[0_12px_24px_-22px_rgba(8,42,92,.45)] md:rounded-[1.6rem]">
              <div className="relative h-full w-full overflow-hidden rounded-[1.05rem] md:rounded-[1.25rem]">
                <Image src={category.heroImage} alt={`${category.name} — ${category.tagline}`} fill loading="lazy" sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
            </div>
            <h3 className="mt-3 text-[15px] font-medium text-primary md:text-base">{category.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
