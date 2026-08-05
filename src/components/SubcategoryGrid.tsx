import { ServiceCard } from "@/components/ServiceCard";
import type { DecorCategory, DecorService } from "@/data/types";

export function SubcategoryGrid({
  category,
  services,
  eyebrow = "The collection",
}: {
  category: DecorCategory;
  services: DecorService[];
  eyebrow?: string;
}) {
  if (services.length === 0) return null;
  return (
    <section className="mx-auto w-full max-w-md px-5 py-10 md:max-w-6xl md:px-8 md:py-16">
      <p className="text-xs font-bold uppercase tracking-widest text-accent">{eyebrow}</p>
      <h2 className="mt-1 font-display text-3xl leading-tight md:text-5xl">
        The <span className="italic text-gradient-brand">{category.name}</span> Collection
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground md:text-base">{category.tagline}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {services.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>
    </section>
  );
}
