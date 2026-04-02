'use client'
import { useState, useEffect, useCallback } from 'react'
import { useNavigation, useCart, useAuth } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { CATEGORIES, PROVINCES } from '@/lib/types'
import {
  Search, SlidersHorizontal, X, Package, Star, ShoppingCart, MapPin,
  ChevronLeft, ChevronRight, Grid3X3, List, ArrowUpDown
} from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string; title: string; price: number; comparePrice?: number | null
  images: string; condition: string; slug: string
  store: { id: string; name: string; slug: string; rating: number }
  _count: { reviews: number }
  province?: string; city?: string
}

export default function BrowsePage() {
  const { navigate, pageParams } = useNavigation()
  const { addItem } = useCart()
  const { user } = useAuth()
  const { openAuthModal } = useNavigation()
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
  const [showFilters, setShowFilters] = useState(false)

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

      const res = await fetch(`/api/products?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
        setTotal(data.total || 0)
        setPages(data.pages || 1)
      }
    } catch {}
    setLoading(false)
  }, [category, province, search, sort, page])

  // fetchProducts already has all deps via useCallback

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
    setSearch(''); setCategory(''); setProvince(''); setSort('newest'); setCondition('')
  }

  const hasActiveFilters = category || province || search || condition

  const filterContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Category</h3>
        <Select value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? "" : v)}>
          <SelectTrigger className="bg-white/5 border-white/10 text-stone-200 h-10 rounded-xl">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 border-white/10">
            <SelectItem value="all" className="text-stone-300">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.slug} value={c.slug} className="text-stone-300">{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Province</h3>
        <Select value={province || "all"} onValueChange={(v) => setProvince(v === "all" ? "" : v)}>
          <SelectTrigger className="bg-white/5 border-white/10 text-stone-200 h-10 rounded-xl">
            <SelectValue placeholder="All Provinces" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 border-white/10 max-h-64">
            <SelectItem value="all" className="text-stone-300">All Provinces</SelectItem>
            {PROVINCES.map((p) => (
              <SelectItem key={p.slug} value={p.slug} className="text-stone-300">{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Condition</h3>
        <Select value={condition || "all"} onValueChange={(v) => setCondition(v === "all" ? "" : v)}>
          <SelectTrigger className="bg-white/5 border-white/10 text-stone-200 h-10 rounded-xl">
            <SelectValue placeholder="Any Condition" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 border-white/10">
            <SelectItem value="all" className="text-stone-300">Any Condition</SelectItem>
            <SelectItem value="NEW" className="text-stone-300">New</SelectItem>
            <SelectItem value="LIKE_NEW" className="text-stone-300">Like New</SelectItem>
            <SelectItem value="GOOD" className="text-stone-300">Good</SelectItem>
            <SelectItem value="FAIR" className="text-stone-300">Fair</SelectItem>
            <SelectItem value="USED" className="text-stone-300">Used</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Sort By</h3>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="bg-white/5 border-white/10 text-stone-200 h-10 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 border-white/10">
            <SelectItem value="newest" className="text-stone-300">Newest First</SelectItem>
            <SelectItem value="price-low" className="text-stone-300">Price: Low to High</SelectItem>
            <SelectItem value="price-high" className="text-stone-300">Price: High to Low</SelectItem>
            <SelectItem value="popular" className="text-stone-300">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="text-red-400 hover:bg-red-500/10 text-xs w-full justify-start">
          <X className="w-3 h-3 mr-1" /> Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <div className="bg-[#050505] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-600" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
                placeholder="Search products..."
                className="pl-10 bg-white/5 border-white/10 text-stone-200 placeholder:text-stone-600 h-12 rounded-xl focus:border-red-500/50"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-white/10 text-stone-300 hover:bg-white/5 lg:hidden"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-44 bg-white/5 border-white/10 text-stone-200 h-12 rounded-xl hidden lg:flex">
                <ArrowUpDown className="w-4 h-4 mr-2 text-stone-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-white/10">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              {category && (
                <Badge variant="secondary" className="bg-white/5 text-stone-300 border-white/10 gap-1 cursor-pointer hover:bg-white/10" onClick={() => setCategory('')}>
                  {CATEGORIES.find(c => c.slug === category)?.name || category} <X className="w-3 h-3" />
                </Badge>
              )}
              {province && (
                <Badge variant="secondary" className="bg-white/5 text-stone-300 border-white/10 gap-1 cursor-pointer hover:bg-white/10" onClick={() => setProvince('')}>
                  {PROVINCES.find(p => p.slug === province)?.name || province} <X className="w-3 h-3" />
                </Badge>
              )}
              {search && (
                <Badge variant="secondary" className="bg-white/5 text-stone-300 border-white/10 gap-1 cursor-pointer hover:bg-white/10" onClick={() => setSearch('')}>
                  &quot;{search}&quot; <X className="w-3 h-3" />
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
            <div className="sticky top-24 rounded-2xl bg-neutral-900/60 backdrop-blur-xl border border-white/5 p-5">
              <h3 className="text-sm font-semibold text-stone-200 mb-4">Filters</h3>
              {filterContent}
            </div>
          </aside>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setShowFilters(false)}>
              <div className="absolute bottom-0 left-0 right-0 bg-neutral-900 border-t border-white/10 rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-stone-100">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="p-2 text-stone-400"><X className="w-5 h-5" /></button>
                </div>
                {filterContent}
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-stone-500">
                {loading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''} found`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden animate-pulse">
                    <div className="aspect-square bg-neutral-800" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-neutral-800 rounded w-3/4" />
                      <div className="h-3 bg-neutral-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 rounded-2xl bg-neutral-900/60 border border-white/5">
                <Package className="w-16 h-16 text-stone-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-stone-400 mb-2">No products found</h3>
                <p className="text-sm text-stone-600 mb-4">Try adjusting your filters or search terms</p>
                <Button variant="outline" onClick={clearFilters} className="border-white/10 text-stone-300">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {products.map((product) => {
                    const images = getImages(product.images)
                    const hasDiscount = product.comparePrice && product.comparePrice > product.price
                    return (
                      <div key={product.id} className="rounded-2xl bg-neutral-900/60 backdrop-blur-xl border border-white/5 hover:border-white/10 overflow-hidden transition-all group">
                        <button onClick={() => navigate('product-detail', { id: product.id })} className="block w-full">
                          <div className="aspect-square bg-neutral-800 relative overflow-hidden">
                            {images.length > 0 ? (
                              <img src={images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-700"><Package className="w-12 h-12" /></div>
                            )}
                            {hasDiscount && (
                              <Badge className="absolute top-3 left-3 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-lg">
                                -{Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}%
                              </Badge>
                            )}
                            <Badge className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-stone-300 text-[10px] px-2 py-0.5 rounded-lg border-0">
                              {product.condition}
                            </Badge>
                          </div>
                          <div className="p-4">
                            <h3 className="text-sm font-medium text-stone-200 truncate group-hover:text-stone-100">{product.title}</h3>
                            <p className="text-xs text-stone-600 mt-0.5">{product.store.name}</p>
                            <div className="flex items-center gap-1 mt-1.5">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < Math.round(product.store.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-neutral-700'}`} />
                                ))}
                              </div>
                              <span className="text-[10px] text-stone-600">({product._count.reviews})</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-base font-bold text-red-400">${product.price.toFixed(2)}</span>
                              {hasDiscount && (
                                <span className="text-xs text-stone-600 line-through">${product.comparePrice!.toFixed(2)}</span>
                              )}
                            </div>
                            {product.province && (
                              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-stone-600">
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
                            <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Add to Cart
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
                      className="border-white/10 text-stone-400 hover:bg-white/5 disabled:opacity-30 rounded-xl"
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
                            : 'border-white/10 text-stone-400 hover:bg-white/5 rounded-xl min-w-[40px]'
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
                      className="border-white/10 text-stone-400 hover:bg-white/5 disabled:opacity-30 rounded-xl"
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
