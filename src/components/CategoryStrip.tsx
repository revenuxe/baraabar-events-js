import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CategoryCard } from "@/components/CategoryCard";
import type { DecorCategory } from "@/data/types";

export function CategoryStrip({ categories }: { categories: DecorCategory[] }) {
  return (
    <section className="mx-auto w-full max-w-md px-6 pb-14 md:max-w-7xl md:px-8 md:pb-20">
      <div className="relative mb-7 md:mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary md:text-[30px]">Categories</h2>
          <div className="mt-2 h-1 w-11 rounded-full bg-brand-pink" />
        </div>
        <Link href="/categories" className="absolute bottom-0 right-0 inline-flex items-center gap-1 text-sm font-semibold text-brand-pink">
          View all <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-6 md:gap-5">
        {categories.slice(0, 6).map((category) => (
          <CategoryCard key={category.slug} href={`/categories/${category.slug}`} image={category.heroImage} name={category.name} tagline={category.tagline} />
        ))}
      </div>
    </section>
  );
}
