'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigation } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Search, X, TrendingUp, Loader2, ArrowRight } from 'lucide-react'

interface Suggestion {
  id: string
  title: string
  price: number
  image: string
  storeName: string
  slug: string
}

export default function SearchBar() {
  const { isSearchOpen, toggleSearch, navigate } = useNavigation()
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isSearchOpen])

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=6`)
      if (res.ok) {
        const data = await res.json()
        setSuggestions((data.products || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          image: (() => { try { return JSON.parse(p.images)[0] } catch { return '' } })(),
          storeName: p.store?.name || '',
          slug: p.slug,
        })))
        setShowDropdown(true)
      }
    } catch {}
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => fetchSuggestions(query), 300)
    } else {
      setSuggestions([])
      setShowDropdown(false)
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, fetchSuggestions])

  const handleSearch = (searchQuery?: string) => {
    const q = searchQuery || query
    if (q.trim()) {
      navigate('browse', { search: q.trim() })
      setQuery('')
      setSuggestions([])
      setShowDropdown(false)
      toggleSearch()
    }
  }

  const handleSelect = (item: Suggestion) => {
    navigate('product-detail', { id: item.id })
    setQuery('')
    setSuggestions([])
    setShowDropdown(false)
    toggleSearch()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex(prev => Math.min(prev + 1, suggestions.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Escape') {
      setQuery('')
      setSuggestions([])
      setShowDropdown(false)
      toggleSearch()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        handleSelect(suggestions[highlightIndex])
      } else {
        handleSearch()
      }
    }
  }

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="text-red-400 font-medium">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  }

  if (!isSearchOpen) return null

  return (
    <div className="fixed inset-0 z-[60] bg-cm-overlay backdrop-blur-sm flex items-start justify-center pt-24" onClick={toggleSearch}>
      <div
        ref={dropdownRef}
        className="w-full max-w-2xl mx-4 bg-cm-elevated border border-cm-border-hover rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-cm-border-subtle">
          <Search className="w-5 h-5 text-cm-dim" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setHighlightIndex(-1) }}
            onKeyDown={handleKeyDown}
            placeholder={t('search.placeholder')}
            className="flex-1 bg-transparent text-cm-primary placeholder:text-cm-dim text-base outline-none"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-cm-dim animate-spin" />}
          {query && (
            <button onClick={() => { setQuery(''); setSuggestions([]); setShowDropdown(false) }} className="text-cm-dim hover:text-cm-secondary">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-cm-hover border border-cm-border-hover text-[10px] text-cm-dim">
            ESC
          </kbd>
        </div>

        {/* Dropdown Suggestions */}
        {showDropdown && query.length >= 2 && (
          <div className="max-h-96 overflow-y-auto">
            {suggestions.length > 0 ? (
              <>
                <div className="p-2">
                  {suggestions.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setHighlightIndex(index)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                        index === highlightIndex ? 'bg-cm-hover' : 'hover:bg-cm-hover'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-cm-input overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-cm-faint">
                            <Search className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-cm-secondary truncate">{highlightText(item.title, query)}</p>
                        <p className="text-xs text-cm-dim mt-0.5">{item.storeName}</p>
                      </div>
                      <span className="text-sm font-semibold text-red-400 flex-shrink-0">${item.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
                <div className="border-t border-cm-border-subtle p-2">
                  <button
                    onClick={() => handleSearch()}
                    onMouseEnter={() => setHighlightIndex(suggestions.length)}
                    className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl transition-all text-left ${
                      highlightIndex === suggestions.length ? 'bg-cm-hover' : 'hover:bg-cm-hover'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-4 h-4 text-cm-dim" />
                      <span className="text-sm text-cm-secondary">{t('search.searchFor')} &quot;{query}&quot;</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-cm-dim" />
                  </button>
                </div>
              </>
            ) : !isLoading ? (
              <div className="p-6 text-center">
                <p className="text-sm text-cm-dim">{t('search.noResults')}</p>
              </div>
            ) : null}
          </div>
        )}

        {/* Popular Searches (when no query) */}
        {!showDropdown && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-cm-dim" />
              <span className="text-xs font-medium text-cm-dim uppercase tracking-wider">{t('search.popularSearches')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Vehicles', 'Books'].map((term) => (
                <button
                  key={term}
                  onClick={() => handleSearch(term)}
                  className="px-3 py-1.5 rounded-lg bg-cm-hover hover:bg-cm-hover-strong text-sm text-cm-secondary hover:text-cm-primary transition-all border border-cm-border-subtle"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
