import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Providers } from "./providers";
import { CONTACT, SITE_NAME, SITE_URL } from "@/lib/site";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_TITLE = "Online Tailoring Services for Men, Women & Kids | Home Pickup & Delivery";
const SITE_DESCRIPTION =
  "Custom-tailored outfits for men, women and kids — bring your own fabric and we handle free home pickup, expert stitching and doorstep delivery in 10–14 days. Book online in 3 minutes.";
// TODO(migration): this og:image still points at the Lovable-hosted preview
// screenshot from the old app. Replace with a real, self-hosted OG image
// before cutover — see docs/nextjs-migration-plan.md §8.
const OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2fc3eab6-c27f-4cec-82f1-f5fef3729da6/id-preview-f00fef45--6508bba4-1382-469c-a8c4-f6b832c7c367.lovable.app-1784038901448.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    "online tailor",
    "tailored suits",
    "custom tailoring",
    "made to measure",
    "bespoke tailoring India",
    "Bengaluru tailor",
  ],
  authors: [{ name: SITE_NAME }],
  icons: { icon: "/favicon-48x48.png" },
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    locale: "en_IN",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: SITE_NAME,
  url: SITE_URL,
  telephone: CONTACT.phone,
  email: CONTACT.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${CONTACT.address.line1}, ${CONTACT.address.line2}`,
    addressLocality: CONTACT.address.city,
    addressRegion: CONTACT.address.state,
    postalCode: CONTACT.address.postalCode,
    addressCountry: CONTACT.address.country,
  },
  description: SITE_DESCRIPTION,
  areaServed: "Bengaluru",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#3d1a78",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
