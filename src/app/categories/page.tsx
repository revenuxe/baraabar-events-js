import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { getCategories } from "@/data";

export const metadata: Metadata = {
  title: "All Decoration Categories | Baraabar",
  description:
    "Browse every occasion we decorate for — birthdays, weddings, baby showers, corporate events and more.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-dvh bg-background pb-24">
      <TopBar />
      <main className="mx-auto w-full max-w-md px-5 py-8 md:max-w-6xl md:px-8 md:py-12">
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Explore</p>
          <h1 className="mt-1 font-display text-4xl leading-tight md:text-5xl">
            Every <span className="italic text-gradient-brand">occasion</span>, covered
          </h1>
        </header>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {categories.map((c) => (
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
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
