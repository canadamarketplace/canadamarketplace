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
      className="h-8 px-2 text-cm-secondary hover:text-cm-primary hover:bg-cm-hover gap-1.5 text-xs font-medium"
    >
      <Globe className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">
        {locale === 'en' ? (
          <>
            <span className="text-cm-primary">🇨🇦 EN</span>
            <span className="text-cm-faint mx-0.5">/</span>
            <span>🇫🇷 FR</span>
          </>
        ) : (
          <>
            <span>🇨🇦 EN</span>
            <span className="text-cm-faint mx-0.5">/</span>
            <span className="text-cm-primary">🇫🇷 FR</span>
          </>
        )}
      </span>
      <span className="sm:hidden">
        {locale === 'en' ? 'EN' : 'FR'}
      </span>
    </Button>
  )
}
