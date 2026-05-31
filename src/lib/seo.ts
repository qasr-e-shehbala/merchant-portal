import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

interface SeoOverrides {
  title?: string;
  description?: string;
  slug?: string;
  ogImage?: string;
  noindex?: boolean;
  type?: "website" | "article";
}

export function buildMetadata(overrides: SeoOverrides = {}): Metadata {
  const title = overrides.title
    ? `${overrides.title} | ${SITE.name}`
    : `${SITE.name} — ${SITE.tagline}`;
  const description = overrides.description ?? SITE.description;
  const canonical = overrides.slug
    ? `${SITE.url}/${overrides.slug.replace(/^\//, "")}`
    : SITE.url;
  const ogImage = overrides.ogImage ?? `${SITE.url}${SITE.ogImage}`;

  return {
    title,
    description,
    metadataBase: new URL(SITE.url),
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE.name,
      images: [{ url: ogImage, width: 1280, height: 1225, alt: title }],
      locale: "en_PK",
      type: overrides.type ?? "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: overrides.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    foundingDate: String(SITE.established),
    address: {
      "@type": "PostalAddress",
      streetAddress: `${SITE.address.line1}, ${SITE.address.area}`,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.province,
      postalCode: SITE.address.postalCode,
      addressCountry: "PK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 33.6007,
      longitude: 73.0679,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        opens: "10:00",
        closes: "23:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: SITE.rating.value,
      reviewCount: SITE.rating.count,
      bestRating: 5,
    },
    image: [`${SITE.url}${SITE.logo}`],
    logo: `${SITE.url}${SITE.logo}`,
    sameAs: Object.values(SITE.social),
    hasMap: SITE.address.googleMapsUrl,
    currenciesAccepted: "PKR",
    paymentAccepted: "Cash, Bank Transfer, JazzCash, Easypaisa, Raast",
  };
}

interface ProductJsonLdParams {
  name: string;
  description?: string;
  images: string[];
  priceRupees: number;
  sku?: string;
  slug: string;
  inStock: boolean;
}

export function productJsonLd(p: ProductJsonLdParams) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.images,
    sku: p.sku,
    brand: {
      "@type": "Brand",
      name: SITE.name,
    },
    offers: {
      "@type": "Offer",
      url: `${SITE.url}/products/${p.slug}`,
      priceCurrency: "PKR",
      price: p.priceRupees,
      availability: p.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
      seller: {
        "@type": "Organization",
        name: SITE.name,
      },
    },
  };
}

interface ArticleJsonLdParams {
  title: string;
  description?: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  ogImage?: string;
  authorName?: string;
}

export function articleJsonLd(a: ArticleJsonLdParams) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    image: a.ogImage ?? `${SITE.url}${SITE.ogImage}`,
    datePublished: a.publishedAt,
    dateModified: a.updatedAt ?? a.publishedAt,
    author: {
      "@type": "Person",
      name: a.authorName ?? SITE.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: `${SITE.url}${SITE.logo}` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE.url}/blog/${a.slug}` },
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE.url}${item.href}`,
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
