import { unstable_cache } from "next/cache";
import { publicSupabaseClient } from "@/lib/supabase/public";
import { testimonials } from "./testimonials";
import { cities } from "./cities";
import type { BalloonOption, DecorCategory, DecorService, DecorSubcategory, ProductFaq, ServiceAddOn } from "./types";

type Catalog = {
  categories: DecorCategory[];
  subcategories: DecorSubcategory[];
  services: DecorService[];
};

// Cached, server-only fetch of the whole active catalog — mirrors the old
// getCatalog() pattern (see git history's book/_lib/catalog.ts): a plain
// anon client (not cookie-bound) so it can live inside unstable_cache,
// short revalidate window so admin edits show up on the storefront without
// a full redeploy.
const getCatalog = unstable_cache(
  async (): Promise<Catalog> => {
    const supabase = publicSupabaseClient();
    const [{ data: categoryRows }, { data: subcategoryRows }, { data: productRows }] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("subcategories").select("*, categories(slug)").order("sort_order"),
      supabase
        .from("products")
        .select("*, categories(slug), subcategories(slug), product_addon_links(addons(*))")
        .order("sort_order"),
    ]);

    const categories: DecorCategory[] = (categoryRows ?? []).map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      tagline: c.tagline ?? "",
      accent: c.accent ?? "from-slate-800/70 to-indigo-700/70",
      heroImage: c.image_url ?? "",
      sortOrder: c.sort_order,
      updatedAt: c.updated_at,
    }));

    const subcategories: DecorSubcategory[] = (subcategoryRows ?? []).map((s) => ({
      id: s.id,
      slug: s.slug,
      categorySlug: s.categories?.slug ?? "",
      name: s.name,
      tagline: s.tagline ?? "",
      image: s.image_url ?? "",
      sortOrder: s.sort_order,
      updatedAt: s.updated_at,
    }));

    const services: DecorService[] = (productRows ?? []).map((p) => {
      const priceOriginal = p.price;
      const priceDiscounted = p.sale_price ?? p.price;
      const discountPct =
        p.sale_price != null && p.price > 0
          ? Math.round(((p.price - p.sale_price) / p.price) * 100)
          : 0;
      const addOns: ServiceAddOn[] = (p.product_addon_links ?? [])
        .map((l) => l.addons)
        .filter((a): a is NonNullable<typeof a> => a !== null && a.is_active)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((a) => ({ id: a.id, name: a.name, price: a.price }));

      return {
        id: p.id,
        slug: p.slug,
        categorySlug: p.categories?.slug ?? "",
        subcategorySlug: p.subcategories?.slug ?? undefined,
        name: p.name,
        tagline: p.tagline ?? "",
        description: p.description ?? "",
        images: p.images,
        priceOriginal,
        priceDiscounted,
        discountPct,
        rating: p.rating,
        reviewCount: p.review_count,
        included: p.included,
        notIncluded: p.not_included,
        balloonOptions: (p.balloon_options as unknown as BalloonOption[]).filter(
          (option) => option?.name && Array.isArray(option.colors),
        ),
        faqs: (p.faqs as unknown as ProductFaq[]).filter((faq) => faq?.question && faq?.answer),
        deliveryInfo: p.delivery_info ?? undefined,
        careInfo: p.care_info ?? undefined,
        tags: p.tags,
        addOns,
        sortOrder: p.sort_order,
        isFeatured: p.is_featured,
        isTrending: p.is_trending,
        metaTitle: p.meta_title ?? undefined,
        metaDescription: p.meta_description ?? undefined,
        ogImage: p.og_image_url ?? undefined,
        updatedAt: p.updated_at,
      };
    });

    return { categories, subcategories, services };
  },
  ["decor-catalog"],
  { revalidate: 60, tags: ["catalog"] },
);

export async function getCategories(): Promise<DecorCategory[]> {
  const { categories } = await getCatalog();
  return categories;
}

export async function getCategoryBySlug(slug: string): Promise<DecorCategory | undefined> {
  const { categories } = await getCatalog();
  return categories.find((c) => c.slug === slug);
}

export async function getSubcategoriesByCategory(categorySlug: string): Promise<DecorSubcategory[]> {
  const { subcategories } = await getCatalog();
  return subcategories.filter((s) => s.categorySlug === categorySlug);
}

/** Every subcategory across every category — for enumerating sitemap.xml. */
export async function getAllSubcategories(): Promise<DecorSubcategory[]> {
  const { subcategories } = await getCatalog();
  return subcategories;
}

/** Every active product across every category — for enumerating sitemap.xml. */
export async function getAllServices(): Promise<DecorService[]> {
  const { services } = await getCatalog();
  return services;
}

export async function getSubcategoryBySlug(
  categorySlug: string,
  subcategorySlug: string,
): Promise<DecorSubcategory | undefined> {
  const { subcategories } = await getCatalog();
  return subcategories.find((s) => s.categorySlug === categorySlug && s.slug === subcategorySlug);
}

export async function getServicesByCategory(categorySlug: string): Promise<DecorService[]> {
  const { services } = await getCatalog();
  return services.filter((s) => s.categorySlug === categorySlug);
}

export async function getServiceBySlug(
  categorySlug: string,
  serviceSlug: string,
): Promise<DecorService | undefined> {
  const { services } = await getCatalog();
  return services.find((s) => s.categorySlug === categorySlug && s.slug === serviceSlug);
}

export async function getTrendingServices(limit = 8): Promise<DecorService[]> {
  const { services } = await getCatalog();
  return services.filter((s) => s.isTrending).slice(0, limit);
}

export async function getFeaturedServices(limit = 8): Promise<DecorService[]> {
  const { services } = await getCatalog();
  return services.filter((s) => s.isFeatured).slice(0, limit);
}

export async function getRelatedServices(service: DecorService, limit = 4): Promise<DecorService[]> {
  const { services } = await getCatalog();
  const sameCategory = services.filter(
    (s) => s.categorySlug === service.categorySlug && s.slug !== service.slug,
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
  const others = services.filter(
    (s) => s.categorySlug !== service.categorySlug && s.slug !== service.slug,
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export { testimonials, cities };
export type { DecorCategory, DecorService, DecorSubcategory } from "./types";
