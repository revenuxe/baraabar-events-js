import type { Metadata } from "next";
import { getCatalog } from "./_lib/catalog";
import { BookWizard } from "./book-wizard";

export const metadata: Metadata = {
  title: "Book fabric pickup — Baraabar",
  description:
    "Book a free fabric pickup, share your design ideas, and get home measurements. Master-tailored delivery in 10–14 days.",
  openGraph: {
    title: "Book fabric pickup — Baraabar",
    description: "Free doorstep pickup and measurement. Stitched by master tailors.",
  },
};

// Reading `searchParams` below still opts this route into dynamic
// rendering per-request, but the catalog fetch itself (see _lib/catalog.ts)
// is wrapped in unstable_cache with a 300s TTL, so it no longer costs a
// live Supabase round-trip on every request the way a plain SSR fetch would.
export const revalidate = 300;

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const initialCategorySlug = typeof params.category === "string" ? params.category : undefined;

  // Real SSR win over the old app: catalog data (categories, garment
  // types, fabric types) arrives with the initial HTML instead of being
  // fetched client-side after mount — no more blank grid -> pop-in flash
  // on the Outfit step.
  const { categories, garmentTypes, fabricTypes } = await getCatalog();

  return (
    <BookWizard
      categories={categories}
      garmentTypes={garmentTypes}
      fabricTypes={fabricTypes}
      initialCategorySlug={initialCategorySlug}
    />
  );
}
