'use client'
import { useState, useEffect, useCallback } from 'react'
import { useNavigation, useCart, useAuth, useWishlist } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { CATEGORIES, PROVINCES } from '@/lib/types'
import {
  Search, SlidersHorizontal, X, Package, Star, ShoppingCart, MapPin, Heart,
  ChevronLeft, ChevronRight, ArrowUpDown, ChevronDown, Store
} from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string; title: string; price: number; comparePrice?: number | null
  images: string; condition: string; slug: string
  store: { id: string; name: string; slug: string; rating: number }
  _count: { reviews: number }
  province?: string; city?: string
  variants?: Array<{ id: string; name: string; value: string; priceDelta: number | null; stock: number | null }>
}

const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'USED', label: 'Used' },
]

const RATING_OPTIONS = [
  { value: '0', label: 'Any Rating' },
  { value: '4', label: '4+ Stars' },
  { value: '3', label: '3+ Stars' },
  { value: '2', label: '2+ Stars' },
]

export default function BrowsePage() {
  const { navigate, pageParams } = useNavigation()
  const { addItem } = useCart()
  const { user } = useAuth()
  const { isWished, toggleItem } = useWishlist()
  const { openAuthModal } = useNavigation()
  const { t } = useTranslation()
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const [search, setSearch] = useState(pageParams.search || '')
  const [category, setCategory] = useState(pageParams.category || '')
  const [province, setProvince] = useState(pageParams.province || '')
  const [sort, setSort] = useState('newest')
  const [condition, setCondition] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [rating, setRating] = useState('0')
  const [showFilters, setShowFilters] = useState(false)
  const [showMoreProvinces, setShowMoreProvinces] = useState(false)
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [selectedSeller, setSelectedSeller] = useState('')
  const [sellers, setSellers] = useState<Array<{ id: string; name: string }>>([])

  const topProvinces = PROVINCES.slice(0, 5)
  const moreProvinces = PROVINCES.slice(5)

  const limit = 24

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      if (province) params.set('province', province)
      if (search) params.set('search', search)
      params.set('sort', sort)
      params.set('page', page.toString())
      params.set('limit', limit.toString())
      if (selectedConditions.length > 0) params.set('condition', selectedConditions.join(','))
      if (minPrice) params.set('minPrice', minPrice)
      if (maxPrice) params.set('maxPrice', maxPrice)
      if (rating && rating !== '0') params.set('rating', rating)
      if (selectedSeller) params.set('storeId', selectedSeller)

      const res = await fetch(`/api/products?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
        setTotal(data.total || 0)
        setPages(data.pages || 1)
      }
    } catch {}
    setLoading(false)
  }, [category, province, search, sort, page, selectedConditions, minPrice, maxPrice, rating, selectedSeller])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Fetch sellers list for dropdown
  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) setSellers(data.map((s: any) => ({ id: s.id, name: s.name })))
      })
      .catch(() => {})
  }, [])

  const getImages = (imagesStr: string) => {
    try { return JSON.parse(imagesStr) } catch { return [] }
  }

  const handleAddToCart = (product: Product) => {
    if (!user) {
      openAuthModal('login')
      return
    }
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: getImages(product.images)[0] || undefined,
      storeName: product.store.name,
      storeId: product.store.id,
    })
    toast.success('Added to cart!')
  }

  const clearFilters = () => {
    setSearch(''); setCategory(''); setProvince(''); setSort('newest')
    setSelectedConditions([]); setMinPrice(''); setMaxPrice(''); setRating('0')
    setSelectedSeller(''); setPage(1)
  }

  const toggleCondition = (cond: string) => {
    setSelectedConditions(prev =>
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    )
    setPage(1)
  }

  const activeFilterCount = [
    category, province, search, selectedConditions.length > 0, minPrice, maxPrice, rating !== '0', selectedSeller
  ].filter(Boolean).length

  const hasActiveFilters = activeFilterCount > 0

  const filterContent = (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="text-xs font-semibold text-cm-muted uppercase tracking-wider mb-3">{t('filters.category')}</h3>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {CATEGORIES.map((c) => (
            <label key={c.slug} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={category === c.slug}
                onChange={() => { setCategory(category === c.slug ? '' : c.slug); setPage(1) }}
                className="w-3.5 h-3.5 accent-red-500"
              />
              <span className="text-sm text-cm-secondary group-hover:text-cm-primary">{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-xs font-semibold text-cm-muted uppercase tracking-wider mb-3">{t('filters.priceRange')}</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint h-9 rounded-lg text-sm"
            min="0"
          />
          <span className="text-cm-faint text-sm">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint h-9 rounded-lg text-sm"
            min="0"
          />
        </div>
      </div>

      {/* Condition */}
      <div>
        <h3 className="text-xs font-semibold text-cm-muted uppercase tracking-wider mb-3">{t('filters.condition')}</h3>
        <div className="space-y-1.5">
          {CONDITIONS.map((c) => (
            <label key={c.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedConditions.includes(c.value)}
                onChange={() => toggleCondition(c.value)}
                className="w-3.5 h-3.5 accent-red-500 rounded"
              />
              <span className="text-sm text-cm-secondary group-hover:text-cm-primary">{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Seller Rating */}
      <div>
        <h3 className="text-xs font-semibold text-cm-muted uppercase tracking-wider mb-3">{t('filters.sellerRating')}</h3>
        <div className="space-y-1.5">
          {RATING_OPTIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => { setRating(r.value); setPage(1) }}
              className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg transition-all ${
                rating === r.value ? 'bg-red-500/10 text-red-300' : 'text-cm-secondary hover:bg-cm-hover'
              }`}
            >
              {r.value !== '0' && (
                <div className="flex">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-red-300 fill-red-300" />
                  ))}
                  {parseInt(r.value) < 5 && <Star className="w-3 h-3 text-neutral-700" />}
                </div>
              )}
              <span className="text-sm">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-xs font-semibold text-cm-muted uppercase tracking-wider mb-3">{t('filters.location')}</h3>
        <div className="space-y-1.5">
          {topProvinces.map((p) => (
            <label key={p.slug} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="province"
                checked={province === p.slug}
                onChange={() => { setProvince(province === p.slug ? '' : p.slug); setPage(1) }}
                className="w-3.5 h-3.5 accent-red-500"
              />
              <span className="text-sm text-cm-secondary group-hover:text-cm-primary">{p.name}</span>
            </label>
          ))}
          {showMoreProvinces && (
            <>
              <div className="border-t border-cm-border-subtle my-2" />
              {moreProvinces.map((p) => (
                <label key={p.slug} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="province"
                    checked={province === p.slug}
                    onChange={() => { setProvince(province === p.slug ? '' : p.slug); setPage(1) }}
                    className="w-3.5 h-3.5 accent-red-500"
                  />
                  <span className="text-sm text-cm-secondary group-hover:text-cm-primary">{p.name}</span>
                </label>
              ))}
            </>
          )}
          <button
            onClick={() => setShowMoreProvinces(!showMoreProvinces)}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 mt-1"
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${showMoreProvinces ? 'rotate-180' : ''}`} />
            {showMoreProvinces ? t('common.showLess') : t('common.showMore')}
          </button>
        </div>
      </div>

      {/* Filter by Seller */}
      <div>
        <h3 className="text-xs font-semibold text-cm-muted uppercase tracking-wider mb-3">Filter by Seller</h3>
        <Select value={selectedSeller} onValueChange={(v) => { setSelectedSeller(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="bg-cm-hover border-cm-border-hover text-cm-secondary h-10 rounded-xl">
            <SelectValue placeholder="All Sellers" />
          </SelectTrigger>
          <SelectContent className="bg-cm-elevated border-cm-border-hover">
            <SelectItem value="all" className="text-cm-secondary">All Sellers</SelectItem>
            {sellers.map((s) => (
              <SelectItem key={s.id} value={s.id} className="text-cm-secondary">{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort By */}
      <div>
        <h3 className="text-xs font-semibold text-cm-muted uppercase tracking-wider mb-3">{t('browse.sortBy')}</h3>
        <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1) }}>
          <SelectTrigger className="bg-cm-hover border-cm-border-hover text-cm-secondary h-10 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-cm-elevated border-cm-border-hover">
            <SelectItem value="newest" className="text-cm-secondary">{t('filters.sortNewest')}</SelectItem>
            <SelectItem value="price-low" className="text-cm-secondary">{t('filters.sortPriceLow')}</SelectItem>
            <SelectItem value="price-high" className="text-cm-secondary">{t('filters.sortPriceHigh')}</SelectItem>
            <SelectItem value="popular" className="text-cm-secondary">{t('filters.sortPopular')}</SelectItem>
            <SelectItem value="rating" className="text-cm-secondary">{t('filters.sortRating')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="text-red-400 hover:bg-red-500/10 text-xs w-full justify-start">
          <X className="w-3 h-3 mr-1" /> {t('filters.clearAll')}
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <div className="bg-cm-deep border-b border-cm-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cm-faint" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
                placeholder={t('browse.title') + '...'}
                className="pl-10 bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint h-12 rounded-xl focus:border-red-500/50"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-cm-dim hover:text-cm-secondary">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-cm-border-hover text-cm-primary hover:bg-cm-hover lg:hidden"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              {t('browse.filters')}
              {activeFilterCount > 0 && (
                <span className="ml-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Select value={selectedSeller || 'all'} onValueChange={(v) => { setSelectedSeller(v === 'all' ? '' : v); setPage(1) }}>
              <SelectTrigger className="w-48 bg-cm-hover border-cm-border-hover text-cm-secondary h-12 rounded-xl hidden lg:flex">
                <Store className="w-4 h-4 mr-2 text-cm-dim" />
                <SelectValue placeholder="All Sellers" />
              </SelectTrigger>
              <SelectContent className="bg-cm-elevated border-cm-border-hover">
                <SelectItem value="all">All Sellers</SelectItem>
                {sellers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1) }}>
              <SelectTrigger className="w-48 bg-cm-hover border-cm-border-hover text-cm-secondary h-12 rounded-xl hidden lg:flex">
                <ArrowUpDown className="w-4 h-4 mr-2 text-cm-dim" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-cm-elevated border-cm-border-hover">
                <SelectItem value="newest">{t('filters.sortNewest')}</SelectItem>
                <SelectItem value="price-low">{t('filters.sortPriceLow')}</SelectItem>
                <SelectItem value="price-high">{t('filters.sortPriceHigh')}</SelectItem>
                <SelectItem value="popular">{t('filters.sortPopular')}</SelectItem>
                <SelectItem value="rating">{t('filters.sortRating')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              {category && (
                <Badge variant="secondary" className="bg-cm-hover text-cm-secondary border-cm-border-hover gap-1 cursor-pointer hover:bg-cm-hover-strong" onClick={() => { setCategory(''); setPage(1) }}>
                  {CATEGORIES.find(c => c.slug === category)?.name || category} <X className="w-3 h-3" />
                </Badge>
              )}
              {province && (
                <Badge variant="secondary" className="bg-cm-hover text-cm-secondary border-cm-border-hover gap-1 cursor-pointer hover:bg-cm-hover-strong" onClick={() => { setProvince(''); setPage(1) }}>
                  {PROVINCES.find(p => p.slug === province)?.name || province} <X className="w-3 h-3" />
                </Badge>
              )}
              {search && (
                <Badge variant="secondary" className="bg-cm-hover text-cm-secondary border-cm-border-hover gap-1 cursor-pointer hover:bg-cm-hover-strong" onClick={() => { setSearch(''); setPage(1) }}>
                  &quot;{search}&quot; <X className="w-3 h-3" />
                </Badge>
              )}
              {selectedConditions.map(c => (
                <Badge key={c} variant="secondary" className="bg-cm-hover text-cm-secondary border-cm-border-hover gap-1 cursor-pointer hover:bg-cm-hover-strong" onClick={() => toggleCondition(c)}>
                  {c.replace('_', ' ')} <X className="w-3 h-3" />
                </Badge>
              ))}
              {minPrice && (
                <Badge variant="secondary" className="bg-cm-hover text-cm-secondary border-cm-border-hover gap-1 cursor-pointer hover:bg-cm-hover-strong" onClick={() => setMinPrice('')}>
                  ${minPrice}+ <X className="w-3 h-3" />
                </Badge>
              )}
              {maxPrice && (
                <Badge variant="secondary" className="bg-cm-hover text-cm-secondary border-cm-border-hover gap-1 cursor-pointer hover:bg-cm-hover-strong" onClick={() => setMaxPrice('')}>
                  &lt;${maxPrice} <X className="w-3 h-3" />
                </Badge>
              )}
              {rating !== '0' && (
                <Badge variant="secondary" className="bg-cm-hover text-cm-secondary border-cm-border-hover gap-1 cursor-pointer hover:bg-cm-hover-strong" onClick={() => { setRating('0'); setPage(1) }}>
                  {rating}+ ★ <X className="w-3 h-3" />
                </Badge>
              )}
              {selectedSeller && (
                <Badge variant="secondary" className="bg-cm-hover text-cm-secondary border-cm-border-hover gap-1 cursor-pointer hover:bg-cm-hover-strong" onClick={() => { setSelectedSeller(''); setPage(1) }}>
                  {sellers.find(s => s.id === selectedSeller)?.name || 'Seller'} <X className="w-3 h-3" />
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 rounded-2xl bg-cm-elevated backdrop-blur-xl border border-cm-border-subtle p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-cm-secondary">{t('browse.filters')}</h3>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {filterContent}
            </div>
          </aside>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="fixed inset-0 z-50 bg-cm-overlay backdrop-blur-sm lg:hidden" onClick={() => setShowFilters(false)}>
              <div className="absolute bottom-0 left-0 right-0 bg-cm-elevated border-t border-cm-border-hover rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-cm-primary">{t('browse.filters')}</h3>
                  <button onClick={() => setShowFilters(false)} className="p-2 text-cm-muted"><X className="w-5 h-5" /></button>
                </div>
                {filterContent}
                <Button
                  onClick={() => setShowFilters(false)}
                  className="w-full mt-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl"
                >
                  {t('filters.apply')}
                </Button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-cm-dim">
                {loading ? t('common.loading') : `${total} product${total !== 1 ? 's' : ''} found`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-cm-elevated border border-cm-border-subtle overflow-hidden animate-pulse">
                    <div className="aspect-square bg-cm-input" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-cm-input rounded w-3/4" />
                      <div className="h-3 bg-cm-input rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 rounded-2xl bg-cm-elevated border border-cm-border-subtle">
                <Package className="w-16 h-16 text-cm-faint mx-auto mb-4" />
                <h3 className="text-lg font-medium text-cm-muted mb-2">{t('browse.noResults')}</h3>
                <p className="text-sm text-cm-faint mb-4">{t('filters.noResultsDesc')}</p>
                <Button variant="outline" onClick={clearFilters} className="border-cm-border-hover text-cm-primary">
                  {t('filters.clearAll')}
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {products.map((product) => {
                    const images = getImages(product.images)
                    const hasDiscount = product.comparePrice && product.comparePrice > product.price
                    const hasVariants = product.variants && product.variants.length > 0
                    // Calculate price range for products with variants
                    const minVariantPrice = hasVariants ? product.price + Math.min(...product.variants!.map(v => v.priceDelta || 0)) : product.price
                    const maxVariantPrice = hasVariants ? product.price + Math.max(...product.variants!.map(v => v.priceDelta || 0)) : product.price
                    const hasPriceRange = hasVariants && minVariantPrice !== maxVariantPrice
                    return (
                      <div key={product.id} className="rounded-2xl bg-cm-elevated backdrop-blur-xl border border-cm-border-subtle hover:border-cm-border-hover overflow-hidden transition-all group">
                        <button onClick={() => navigate('product-detail', { id: product.id })} className="block w-full">
                          <div className="aspect-square bg-cm-input relative overflow-hidden">
                            {images.length > 0 ? (
                              <img src={images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-cm-faint"><Package className="w-12 h-12" /></div>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleItem({ productId: product.id, title: product.title, price: product.price, image: getImages(product.images)[0], storeName: product.store.name, storeSlug: product.store.slug }) }}
                              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-cm-secondary hover:text-red-400 transition-all z-10"
                            >
                              <Heart className={`w-4 h-4 ${isWished(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>
                            <Badge className="absolute top-3 left-3 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-lg">
                              {product.condition}
                            </Badge>
                            {hasDiscount && (
                              <Badge className="absolute top-12 left-3 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-lg">
                                -{Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}%
                              </Badge>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="text-sm font-medium text-cm-secondary truncate group-hover:text-cm-primary">{product.title}</h3>
                            <p className="text-xs text-cm-faint mt-0.5">{product.store.name}</p>
                            <div className="flex items-center gap-1 mt-1.5">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < Math.round(product.store.rating || 0) ? 'text-red-300 fill-red-300' : 'text-neutral-700'}`} />
                                ))}
                              </div>
                              <span className="text-[10px] text-cm-faint">({product._count.reviews})</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-base font-bold text-red-400">
                                {hasPriceRange ? `$${minVariantPrice.toFixed(2)} - $${maxVariantPrice.toFixed(2)}` : `$${product.price.toFixed(2)}`}
                              </span>
                              {hasDiscount && !hasVariants && (
                                <span className="text-xs text-cm-faint line-through">${product.comparePrice!.toFixed(2)}</span>
                              )}
                            </div>
                            {hasVariants && (
                              <Badge className="mt-1.5 bg-cm-hover text-cm-muted text-[10px] px-2 py-0.5 rounded-lg border-0">
                                Multiple options
                              </Badge>
                            )}
                            {product.province && (
                              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-cm-faint">
                                <MapPin className="w-3 h-3" /> {product.city}{product.province ? `, ${product.province}` : ''}
                              </div>
                            )}
                          </div>
                        </button>
                        <div className="px-4 pb-4">
                          <Button
                            onClick={() => handleAddToCart(product)}
                            size="sm"
                            className="w-full bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-500 hover:to-red-600 text-white rounded-xl h-9 text-xs"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> {t('browse.addToCart')}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-cm-border-hover text-cm-primary hover:bg-cm-hover disabled:opacity-30 rounded-xl"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                      let pageNum: number
                      if (pages <= 7) {
                        pageNum = i + 1
                      } else if (page <= 4) {
                        pageNum = i + 1
                      } else if (page >= pages - 3) {
                        pageNum = pages - 6 + i
                      } else {
                        pageNum = page - 3 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? 'default' : 'outline'}
                          onClick={() => setPage(pageNum)}
                          className={pageNum === page
                            ? 'bg-red-600 text-white hover:bg-red-500 rounded-xl min-w-[40px]'
                            : 'border-cm-border-hover text-cm-secondary hover:bg-cm-hover rounded-xl min-w-[40px]'
                          }
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(pages, p + 1))}
                      disabled={page === pages}
                      className="border-cm-border-hover text-cm-primary hover:bg-cm-hover disabled:opacity-30 rounded-xl"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
