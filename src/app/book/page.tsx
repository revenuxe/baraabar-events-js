import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const [{ data: categories }, { data: garmentTypes }, { data: fabricTypes }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("garment_types").select("*").order("sort_order"),
    supabase.from("fabric_types").select("*").order("sort_order"),
  ]);

  return (
    <BookWizard
      categories={categories ?? []}
      garmentTypes={garmentTypes ?? []}
      fabricTypes={fabricTypes ?? []}
      initialCategorySlug={initialCategorySlug}
    />
  );
}
