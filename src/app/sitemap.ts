import type { MetadataRoute } from "next";

// TODO(migration): set NEXT_PUBLIC_SITE_URL to the real production domain
// before cutover — see docs/nextjs-migration-plan.md §8. The legacy
// sitemap shipped with an empty base (relative URLs), which isn't fully
// spec-compliant; this one needs a real absolute origin.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://baraabar.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1.0 },
    { path: "/design", changeFrequency: "weekly", priority: 0.9 },
    { path: "/orders", changeFrequency: "monthly", priority: 0.6 },
    { path: "/drafts", changeFrequency: "monthly", priority: 0.5 },
    { path: "/profile", changeFrequency: "monthly", priority: 0.4 },
  ];

  return entries.map((e) => ({
    url: `${SITE_URL}${e.path}`,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }));
}
