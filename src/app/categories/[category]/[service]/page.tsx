import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getServiceBySlug, getRelatedServices } from "@/data";
import { ServiceDetailView } from "./service-detail-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; service: string }>;
}): Promise<Metadata> {
  const { category: categorySlug, service: serviceSlug } = await params;
  const service = await getServiceBySlug(categorySlug, serviceSlug);
  if (!service) return {};
  const title = service.metaTitle || `${service.name} | Baraabar`;
  const description = service.metaDescription || service.tagline;
  const image = service.ogImage || service.images[0];
  return {
    title,
    description,
    openGraph: { title, description, images: [image] },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ category: string; service: string }>;
}) {
  const { category: categorySlug, service: serviceSlug } = await params;
  const [category, service] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getServiceBySlug(categorySlug, serviceSlug),
  ]);
  if (!category || !service) notFound();
  const related = await getRelatedServices(service, 4);

  return <ServiceDetailView service={service} category={category} related={related} />;
}
