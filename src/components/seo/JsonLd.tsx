"use client"

import React from "react"

const SITE_URL = "https://www.canadamarketplace.ca"

// ──────────────────────────────────────────────────────────────────
// Shared helper
// ──────────────────────────────────────────────────────────────────

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// ──────────────────────────────────────────────────────────────────
// a) OrganizationJsonLd
// ──────────────────────────────────────────────────────────────────

export function OrganizationJsonLd() {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Canada Marketplace",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "Canada's most trusted online marketplace for buying and selling new and used products. Connect with local sellers across all Canadian provinces.",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@canadamarketplace.ca",
      areaServed: "CA",
      availableLanguage: ["English", "French"],
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "CA",
    },
  }

  return <JsonLdScript data={data} />
}

// ──────────────────────────────────────────────────────────────────
// b) WebSiteJsonLd — with SearchAction
// ──────────────────────────────────────────────────────────────────

export function WebSiteJsonLd() {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Canada Marketplace",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/browse?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }

  return <JsonLdScript data={data} />
}

// ──────────────────────────────────────────────────────────────────
// c) BreadcrumbJsonLd
// ──────────────────────────────────────────────────────────────────

interface BreadcrumbItem {
  name: string
  url: string
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  }

  return <JsonLdScript data={data} />
}

// ──────────────────────────────────────────────────────────────────
// d) ProductJsonLd
// ──────────────────────────────────────────────────────────────────

export interface ProductJsonLdProps {
  name: string
  description: string
  image: string | string[]
  price: number
  currency?: string
  availability?: "InStock" | "OutOfStock" | "PreOrder" | "LimitedAvailability"
  condition?: "NewCondition" | "UsedCondition" | "RefurbishedCondition"
  sellerName?: string
  sellerUrl?: string
  category?: string
  ratingValue?: number
  reviewCount?: number
  url?: string
  sku?: string
}

export function ProductJsonLd({
  name,
  description,
  image,
  price,
  currency = "CAD",
  availability = "InStock",
  condition = "NewCondition",
  sellerName,
  sellerUrl,
  category,
  ratingValue,
  reviewCount,
  url,
  sku,
}: ProductJsonLdProps) {
  const images = Array.isArray(image) ? image : [image]
  const normalizedImages = images.map((img) =>
    img.startsWith("http") ? img : `${SITE_URL}${img}`
  )

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: normalizedImages,
    sku: sku || undefined,
    ...(category && { category }),
    ...(url && { url: url.startsWith("http") ? url : `${SITE_URL}${url}` }),
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      seller: sellerName
        ? {
            "@type": "Organization",
            name: sellerName,
            ...(sellerUrl && {
              url: sellerUrl.startsWith("http") ? sellerUrl : `${SITE_URL}${sellerUrl}`,
            }),
          }
        : undefined,
    },
    ...(condition && {
      itemCondition: `https://schema.org/${condition}`,
    }),
  }

  if (ratingValue !== undefined && ratingValue > 0) {
    Object.assign(data, {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue,
        reviewCount: reviewCount || 1,
        bestRating: 5,
        worstRating: 1,
      },
    })
  }

  return <JsonLdScript data={data} />
}

// ──────────────────────────────────────────────────────────────────
// e) FAQJsonLd
// ──────────────────────────────────────────────────────────────────

interface FaqItem {
  question: string
  answer: string
}

export function FAQJsonLd({ faqs }: { faqs: FaqItem[] }) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return <JsonLdScript data={data} />
}

// ──────────────────────────────────────────────────────────────────
// f) LocalBusinessJsonLd — for seller locator
// ──────────────────────────────────────────────────────────────────

export interface LocalBusinessJsonLdProps {
  name: string
  description?: string
  url?: string
  image?: string
  telephone?: string
  email?: string
  address: {
    streetAddress?: string
    addressLocality: string  // city
    addressRegion: string    // province
    postalCode?: string
    addressCountry?: string
  }
  geo?: {
    latitude: number
    longitude: number
  }
  ratingValue?: number
  reviewCount?: number
  priceRange?: string
  openingHours?: string[]
}

export function LocalBusinessJsonLd({
  name,
  description,
  url,
  image,
  telephone,
  email,
  address,
  geo,
  ratingValue,
  reviewCount,
  priceRange,
  openingHours,
}: LocalBusinessJsonLdProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    ...(description && { description }),
    ...(url && {
      url: url.startsWith("http") ? url : `${SITE_URL}${url}`,
    }),
    ...(image && {
      image: image.startsWith("http") ? image : `${SITE_URL}${image}`,
    }),
    ...(telephone && { telephone }),
    ...(email && { email }),
    address: {
      "@type": "PostalAddress",
      streetAddress: address.streetAddress || undefined,
      addressLocality: address.addressLocality,
      addressRegion: address.addressRegion,
      postalCode: address.postalCode || undefined,
      addressCountry: address.addressCountry || "CA",
    },
    ...(geo && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: geo.latitude,
        longitude: geo.longitude,
      },
    }),
    ...(priceRange && { priceRange }),
    ...(openingHours && { openingHours }),
  }

  if (ratingValue !== undefined && ratingValue > 0) {
    Object.assign(data, {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue,
        reviewCount: reviewCount || 1,
        bestRating: 5,
        worstRating: 1,
      },
    })
  }

  return <JsonLdScript data={data} />
}
