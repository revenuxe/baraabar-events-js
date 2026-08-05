import type { Metadata } from "next";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { ServiceGridSearch } from "@/components/ServiceGridSearch";
import { getTrendingServices } from "@/data";

export const metadata: Metadata = {
  title: "Trending Now | Baraabar",
  description: "Our most-loved event decoration setups, all in one place.",
};

export default async function TrendingPage() {
  // No hard cap here, unlike the homepage teaser strip — this is the "view
  // all" destination for it.
  const services = await getTrendingServices(200);

  return (
    <div className="min-h-dvh bg-background pb-24">
      <TopBar />
      <main>
        <section className="mx-auto w-full max-w-md px-5 pt-8 md:max-w-6xl md:px-8 md:pt-12">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Trending now</p>
          <h1 className="mt-1 font-display text-3xl leading-tight md:text-5xl">
            Trending <span className="italic text-gradient-brand">setups</span>
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground md:text-base">
            The setups our customers are booking the most, right now.
          </p>
        </section>

        <ServiceGridSearch services={services} searchPlaceholder="Search trending setups…" />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
