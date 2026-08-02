import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const entries: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/book", changeFrequency: "weekly", priority: 0.9 },
  { path: "/design", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return entries.map((e) => ({
    url: `${SITE_URL}${e.path}`,
    lastModified: new Date(),
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }));
}
