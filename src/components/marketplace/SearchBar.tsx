'use client'
import { useState, useEffect, useRef } from 'react'
import { useNavigation } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Input } from '@/components/ui/input'
import { Search, X, TrendingUp } from 'lucide-react'

export default function SearchBar() {
  const { isSearchOpen, toggleSearch, navigate } = useNavigation()
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isSearchOpen])

  const handleSearch = (searchQuery?: string) => {
    const q = searchQuery || query
    if (q.trim()) {
      navigate('browse', { search: q.trim() })
      setQuery('')
      toggleSearch()
    }
  }

  if (!isSearchOpen) return null

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24" onClick={toggleSearch}>
      <div className="w-full max-w-2xl mx-4 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <Search className="w-5 h-5 text-stone-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('search.placeholder')}
            className="flex-1 bg-transparent text-stone-100 placeholder:text-stone-500 text-base outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-stone-500 hover:text-stone-300">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-stone-500">
            ESC
          </kbd>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-stone-500" />
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">{t('search.popularSearches')}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Vehicles', 'Books'].map((term) => (
              <button
                key={term}
                onClick={() => handleSearch(term)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-stone-400 hover:text-stone-200 transition-all border border-white/5"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
