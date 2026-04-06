"use client"

import { useEffect, useRef } from "react"

interface UseSEOOptions {
  title: string
  description: string
  keywords?: string
  canonicalUrl?: string
  ogType?: string
  ogImage?: string
  noIndex?: boolean
}

const SITE_NAME = "Canada Marketplace"
const BASE_URL = "https://www.canadamarketplace.ca"

/**
 * Helper to find or create a meta tag by attribute selector.
 * Tracks created elements so they can be removed on cleanup.
 */
function getOrCreateMeta(
  attributeName: string,
  attributeValue: string,
  added: Set<HTMLElement>
): HTMLMetaElement {
  const selector = `meta[${attributeName}="${attributeValue}"]`
  let element = document.querySelector<HTMLMetaElement>(selector)

  if (!element) {
    element = document.createElement("meta")
    element.setAttribute(attributeName, attributeValue)
    document.head.appendChild(element)
    added.add(element)
  }

  return element
}

/**
 * Helper to find or create a link tag by rel and optional href.
 * Tracks created elements so they can be removed on cleanup.
 */
function getOrCreateLink(
  rel: string,
  href?: string,
  added?: Set<HTMLElement>
): HTMLLinkElement {
  let element = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)

  if (!element) {
    element = document.createElement("link")
    element.setAttribute("rel", rel)
    document.head.appendChild(element)
    if (added) added.add(element)
  }

  if (href !== undefined) {
    element.setAttribute("href", href)
  }

  return element
}

/**
 * useSEO — Client-side hook to dynamically update document head meta tags.
 *
 * - Sets document.title
 * - Updates/creates meta tags (description, keywords, robots, OG, Twitter)
 * - Updates/creates canonical link
 * - Cleans up added meta tags on unmount
 */
export function useSEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType = "website",
  ogImage,
  noIndex = false,
}: UseSEOOptions): void {
  const addedElements = useRef<Set<HTMLElement>>(new Set())

  useEffect(() => {
    if (typeof document === "undefined") return

    // ── document.title ──────────────────────────────────────────────
    document.title = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`

    // ── Canonical URL ──────────────────────────────────────────────
    const canonicalHref = canonicalUrl
      ? canonicalUrl.startsWith("http")
        ? canonicalUrl
        : `${BASE_URL}${canonicalUrl.startsWith("/") ? "" : "/"}${canonicalUrl}`
      : `${BASE_URL}${window.location.pathname}`

    getOrCreateLink("canonical", canonicalHref, addedElements.current)

    // ── Meta: description ──────────────────────────────────────────
    getOrCreateMeta("name", "description", addedElements.current)
      .setAttribute("content", description)

    // ── Meta: keywords (only if provided) ──────────────────────────
    if (keywords) {
      getOrCreateMeta("name", "keywords", addedElements.current)
        .setAttribute("content", keywords)
    }

    // ── Meta: robots (noIndex) ─────────────────────────────────────
    if (noIndex) {
      getOrCreateMeta("name", "robots", addedElements.current)
        .setAttribute("content", "noindex, nofollow")
    } else {
      // Remove robots tag if it was previously added
      const existingRobots = document.querySelector('meta[name="robots"]')
      if (existingRobots && addedElements.current.has(existingRobots)) {
        existingRobots.remove()
        addedElements.current.delete(existingRobots)
      }
    }

    // ── Build OG / Twitter values ──────────────────────────────────
    const ogTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
    const ogUrl = `${BASE_URL}${window.location.pathname}`
    const ogDesc = description
    const twitterImage = ogImage || `${BASE_URL}/og-default.png`

    // ── Open Graph tags ────────────────────────────────────────────
    getOrCreateMeta("property", "og:title", addedElements.current)
      .setAttribute("content", ogTitle)

    getOrCreateMeta("property", "og:description", addedElements.current)
      .setAttribute("content", ogDesc)

    getOrCreateMeta("property", "og:type", addedElements.current)
      .setAttribute("content", ogType)

    getOrCreateMeta("property", "og:url", addedElements.current)
      .setAttribute("content", ogUrl)

    if (ogImage) {
      getOrCreateMeta("property", "og:image", addedElements.current)
        .setAttribute("content", ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`)
    }

    getOrCreateMeta("property", "og:site_name", addedElements.current)
      .setAttribute("content", SITE_NAME)

    // ── Twitter Card tags ──────────────────────────────────────────
    getOrCreateMeta("name", "twitter:card", addedElements.current)
      .setAttribute("content", "summary_large_image")

    getOrCreateMeta("name", "twitter:title", addedElements.current)
      .setAttribute("content", ogTitle)

    getOrCreateMeta("name", "twitter:description", addedElements.current)
      .setAttribute("content", ogDesc)

    getOrCreateMeta("name", "twitter:image", addedElements.current)
      .setAttribute("content", twitterImage)

    // ── Cleanup: remove elements we added ──────────────────────────
    return () => {
      addedElements.current.forEach((el) => {
        if (el.parentNode) {
          el.parentNode.removeChild(el)
        }
      })
      addedElements.current.clear()
    }
  }, [title, description, keywords, canonicalUrl, ogType, ogImage, noIndex])
}

export default useSEO
