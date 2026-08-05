import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getCategories } from "@/data";

const entries: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/categories", changeFrequency: "weekly", priority: 0.9 },
  { path: "/book", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getCategories();
  const staticEntries = entries.map((e) => ({
    url: `${SITE_URL}${e.path}`,
    lastModified: new Date(),
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }));
  const categoryEntries = categories.map((c) => ({
    url: `${SITE_URL}/categories/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  return [...staticEntries, ...categoryEntries];
}
