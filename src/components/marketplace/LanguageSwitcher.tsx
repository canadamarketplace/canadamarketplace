'use client'
import { useLocale } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()

  const switchLocale = () => {
    const newLocale: Locale = locale === 'en' ? 'fr' : 'en'
    setLocale(newLocale)
    // Navigate to same URL with new locale prefix
    const { pathname, search } = window.location
    let cleanPath = pathname
    // Strip existing locale prefix
    if (cleanPath.startsWith('/fr') || cleanPath.startsWith('/fr/')) {
      cleanPath = cleanPath.replace(/^\/fr(\/|$)/, '/') || '/'
    }
    const prefix = newLocale === 'fr' ? '/fr' : ''
    const newPath = prefix + cleanPath + search
    window.history.pushState({}, '', newPath)
    window.scrollTo(0, 0)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={switchLocale}
      className="h-8 px-2 text-stone-400 hover:text-stone-100 hover:bg-white/5 gap-1.5 text-xs font-medium"
    >
      <Globe className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">
        {locale === 'en' ? (
          <>
            <span className="text-stone-100">🇨🇦 EN</span>
            <span className="text-stone-600 mx-0.5">/</span>
            <span>🇫🇷 FR</span>
          </>
        ) : (
          <>
            <span>🇨🇦 EN</span>
            <span className="text-stone-600 mx-0.5">/</span>
            <span className="text-stone-100">🇫🇷 FR</span>
          </>
        )}
      </span>
      <span className="sm:hidden">
        {locale === 'en' ? 'EN' : 'FR'}
      </span>
    </Button>
  )
}
