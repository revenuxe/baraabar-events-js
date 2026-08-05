import dynamic from "next/dynamic";
import { TopBar } from "@/components/TopBar";
import { Hero } from "@/components/Hero";
import { PickupCta } from "@/components/PickupCta";
import { CategoryStrip } from "@/components/CategoryStrip";
import { FeaturedCollections } from "@/components/FeaturedCollections";
import { SubcategoryGrid } from "@/components/SubcategoryGrid";
import { Journey } from "@/components/Journey";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { getCategories, getFeaturedServices, getServicesByCategory, getCategoryBySlug } from "@/data";

// Below-the-fold and non-critical for first paint — split into its own
// chunk instead of the initial homepage bundle.
const Reviews = dynamic(() => import("@/components/Reviews").then((m) => m.Reviews));

export default async function Home() {
  const [categories, featuredServices, weddingCategory] = await Promise.all([
    getCategories(),
    getFeaturedServices(8),
    getCategoryBySlug("wedding"),
  ]);
  const weddingServices = weddingCategory ? await getServicesByCategory("wedding") : [];

  return (
    <div className="min-h-dvh bg-background">
      <TopBar />
      <main>
        <Hero />
        <CategoryStrip categories={categories} />
        <FeaturedCollections services={featuredServices} />
        <PickupCta />
        {weddingCategory && (
          <SubcategoryGrid
            category={weddingCategory}
            services={weddingServices}
            eyebrow="From Haldi to Honeymoon"
          />
        )}
        <Journey />
        <Reviews />
        <Footer />
      </main>
      <BottomNav />
    </div>
  );
}
