import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { ServiceCard } from "@/components/ServiceCard";
import { getCategoryBySlug, getServicesByCategory } from "@/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return {};
  return {
    title: `${category.name} Decoration | Baraabar`,
    description: category.tagline,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();
  const services = await getServicesByCategory(categorySlug);

  return (
    <div className="min-h-dvh bg-background pb-24">
      <TopBar />
      <main>
        <section className="relative overflow-hidden">
          <div className="relative h-56 w-full md:h-72">
            <Image
              src={category.heroImage}
              alt={category.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className={`absolute inset-0 bg-gradient-to-t ${category.accent} mix-blend-multiply opacity-70`}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
            />
          </div>
          <div className="relative -mt-14 px-5 md:mx-auto md:max-w-6xl md:px-8">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-elevated md:p-8">
              <h1 className="font-display text-3xl leading-tight md:text-5xl">{category.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">{category.tagline}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md px-5 py-8 md:max-w-6xl md:px-8 md:py-12">
          {services.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {services.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No services listed for this category yet — check back soon.
            </p>
          )}
        </section>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
