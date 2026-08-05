import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { getCategoryBySlug, getSubcategoriesByCategory } from "@/data";
import { SubcategoriesGrid } from "./subcategories-grid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return {};
  return {
    title: `All ${category.name} Types | Baraabar`,
    description: `Every type of ${category.name.toLowerCase()} decor we offer.`,
  };
}

export default async function AllSubcategoriesPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();
  const subcategories = await getSubcategoriesByCategory(categorySlug);

  return (
    <div className="min-h-dvh bg-background pb-24">
      <TopBar />
      <main className="mx-auto w-full max-w-md px-5 py-8 md:max-w-6xl md:px-8 md:py-12">
        <Link
          href={`/categories/${categorySlug}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> {category.name}
        </Link>

        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Shop by type</p>
          <h1 className="mt-1 font-display text-4xl leading-tight md:text-5xl">
            All <span className="italic text-gradient-brand">{category.name}</span> types
          </h1>
        </header>

        <SubcategoriesGrid categorySlug={categorySlug} subcategories={subcategories} />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
