'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { create } from 'zustand'
import en from './locales/en.json'
import fr from './locales/fr.json'

export type Locale = 'en' | 'fr'

const translations: Record<Locale, Record<string, any>> = { en, fr }

const STORAGE_KEY = 'cm-locale'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'fr' || stored === 'en') return stored as Locale
  const browserLang = navigator.language || navigator.languages?.[0] || ''
  if (browserLang.startsWith('fr')) return 'fr'
  return 'en'
}

function detectLocaleFromUrl(): Locale | null {
  if (typeof window === 'undefined') return null
  const pathname = window.location.pathname
  if (pathname.startsWith('/fr') || pathname.startsWith('/fr/')) return 'fr'
  return 'en'
}

export const useLocale = create<LocaleState>((set, get) => ({
  locale: 'en',
  setLocale: (locale: Locale) => {
    set({ locale })
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, locale)
      document.documentElement.lang = locale === 'fr' ? 'fr-CA' : 'en-CA'
    }
  },
}))

// Initialize locale from URL or browser on first call
let initialized = false

function initializeLocale() {
  if (initialized) return
  initialized = true
  const urlLocale = detectLocaleFromUrl()
  const locale = urlLocale ?? detectBrowserLocale()
  useLocale.getState().setLocale(locale)
}

/**
 * Get a nested value from an object using dot notation.
 * Example: getNestedValue({ a: { b: 'c' } }, 'a.b') => 'c'
 */
function getNestedValue(obj: Record<string, any>, path: string): string {
  const keys = path.split('.')
  let current: any = obj
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return path // Return key path as fallback
    }
  }
  return typeof current === 'string' ? current : path
}

/**
 * Replace {variable} placeholders in a string.
 * Example: replaceParams("Hello {name}", { name: "John" }) => "Hello John"
 */
function replaceParams(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match
  })
}

/**
 * React hook for translations.
 * Usage: const t = useTranslation()
 *        t('nav.browse') => "Browse"
 *        t('chat.greeting', { name: 'John' }) => "Hey John!..."
 */
export function useTranslation() {
  const { locale } = useLocale()

  // Initialize locale on first use
  useEffect(() => {
    initializeLocale()
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const translation = getNestedValue(translations[locale], key)
      return replaceParams(translation, params)
    },
    [locale]
  )

  return { t, locale }
}

/**
 * Get the current locale without React hook (for non-component code).
 */
export function getCurrentLocale(): Locale {
  initializeLocale()
  return useLocale.getState().locale
}

/**
 * Get the locale prefix for URLs.
 * English (default): "" (no prefix)
 * French: "/fr"
 */
export function getLocalePrefix(locale?: Locale): string {
  const loc = locale || getCurrentLocale()
  return loc === 'fr' ? '/fr' : ''
}

/**
 * Add locale prefix to a path.
 */
export function localePath(path: string, locale?: Locale): string {
  const prefix = getLocalePrefix(locale)
  // Don't double-prefix
  if (prefix && !path.startsWith(prefix)) {
    return `${prefix}${path}`
  }
  return path
}

/**
 * Strip locale prefix from a pathname. Returns { locale, cleanPath }.
 */
export function stripLocalePrefix(pathname: string): { locale: Locale; cleanPath: string } {
  if (pathname.startsWith('/fr') || pathname.startsWith('/fr/')) {
    return { locale: 'fr', cleanPath: pathname.replace(/^\/fr(\/|$)/, '/') || '/' }
  }
  return { locale: 'en', cleanPath: pathname }
}
