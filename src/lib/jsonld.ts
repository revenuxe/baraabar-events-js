import { CONTACT, SITE_NAME, SITE_URL } from "@/lib/site";
import type { DecorService } from "@/data/types";

// Escaping `<` prevents a `</script>`-like sequence in interpolated content
// (e.g. an admin-entered product description) from breaking out of the
// script tag — JSON.stringify alone doesn't guard against this.
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// Real profile URLs only (Footer.tsx's YouTube/Twitter icons are still
// placeholder "#" links) — schema.org sameAs should only list working
// social profiles.
const SAME_AS = ["https://www.instagram.com/baraabarmade/", "https://www.linkedin.com/company/baraabar"];

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon-48x48.png`,
    image: `${SITE_URL}/favicon-48x48.png`,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${CONTACT.address.line1}, ${CONTACT.address.line2}`,
      addressLocality: CONTACT.address.city,
      addressRegion: CONTACT.address.state,
      postalCode: CONTACT.address.postalCode,
      addressCountry: CONTACT.address.country,
    },
    areaServed: "Bengaluru",
    sameAs: SAME_AS,
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
}

export function itemListJsonLd(services: DecorService[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/categories/${s.categorySlug}/${s.slug}`,
    })),
  };
}

export function productJsonLd(service: DecorService, categoryName: string) {
  return {
    "@context": "https://schema.org",
    // These catalogue entries are on-site event-decoration services, not retail
    // products that can be shipped or physically returned. Using Service keeps
    // the markup aligned with the booking experience and prevents Google from
    // applying Merchant listings shipping/return-policy requirements.
    "@type": "Service",
    name: service.name,
    description: service.metaDescription || service.tagline || service.description,
    image: service.images,
    serviceType: "Event decoration service",
    category: categoryName,
    provider: { "@id": `${SITE_URL}/#organization` },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/categories/${service.categorySlug}/${service.slug}`,
      priceCurrency: "INR",
      price: service.priceDiscounted,
      availability: "https://schema.org/InStock",
      areaServed: "Bengaluru",
    },
    ...(service.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: service.rating,
            reviewCount: service.reviewCount,
          },
        }
      : {}),
  };
}
