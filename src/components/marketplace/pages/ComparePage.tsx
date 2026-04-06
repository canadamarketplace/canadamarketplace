'use client'
import { useState, useEffect, useCallback } from 'react'
import { useCompare, useNavigation } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  GitCompare, X, ChevronLeft, Star, Package, ShoppingCart,
  Store, MapPin, ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'

interface ProductData {
  id: string
  title: string
  slug: string
  description: string
  price: number
  comparePrice?: number | null
  condition: string
  stock: number
  images: string
  sold: number
  views: number
  category: { name: string; slug: string }
  store: { id: string; name: string; slug: string; rating: number }
  avgRating: number
  _count: { reviews: number }
}

export default function ComparePage() {
  const { items, removeItem, clearAll, itemCount } = useCompare()
  const { navigate } = useNavigation()
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)

  const count = itemCount()

  const fetchProducts = useCallback(async () => {
    if (items.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const results = await Promise.all(
        items.map(id => fetch(`/api/products/${id}`).then(r => r.ok ? r.json() : null))
      )
      setProducts(results.filter(Boolean))
    } catch {
      setProducts([])
    }
    setLoading(false)
  }, [items])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const getImages = (imagesStr: string) => {
    try { return JSON.parse(imagesStr) } catch { return [] }
  }

  const conditionColors: Record<string, string> = {
    NEW: 'bg-green-500/10 text-green-400 border-green-500/20',
    LIKE_NEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    GOOD: 'bg-red-500/10 text-red-300 border-red-500/20',
    FAIR: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    USED: 'bg-stone-500/10 text-cm-muted border-stone-500/20',
    EXCELLENT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  }

  if (count < 2) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button onClick={() => navigate('browse')} className="flex items-center gap-2 text-sm text-cm-dim hover:text-cm-secondary mb-8 group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Browse
          </button>
          <div className="text-center py-20 rounded-2xl bg-cm-elevated border border-cm-border-subtle">
            <GitCompare className="w-16 h-16 text-cm-faint mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-cm-primary mb-2">Product Comparison</h2>
            <p className="text-sm text-cm-dim mb-6">Add at least 2 products to compare</p>
            <Button onClick={() => navigate('browse')} className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Products
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => navigate('browse')} className="flex items-center gap-2 text-sm text-cm-dim hover:text-cm-secondary mb-4 group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Browse
            </button>
            <h1 className="text-2xl font-bold text-cm-primary flex items-center gap-3">
              <GitCompare className="w-6 h-6 text-red-400" />
              Compare Products
              <Badge className="bg-red-500/10 text-red-300 border-red-500/20 text-sm">{count}</Badge>
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={clearAll}
            className="border-cm-border-hover text-cm-dim hover:text-red-400 hover:bg-red-500/10 rounded-xl text-sm"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>

        {loading ? (
          <div className="flex gap-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex-1 animate-pulse">
                <div className="h-48 bg-cm-input rounded-2xl mb-4" />
                <div className="h-4 bg-cm-input rounded w-3/4 mb-2" />
                <div className="h-3 bg-cm-input rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-cm-border-subtle">
            <table className="w-full min-w-[600px]">
              <tbody>
                {/* Product Header Row */}
                <tr>
                  <td className="p-4 bg-cm-elevated align-top w-36">
                    <span className="text-xs font-semibold text-cm-dim uppercase tracking-wider">Product</span>
                  </td>
                  {products.map((p) => {
                    const images = getImages(p.images)
                    return (
                      <td key={p.id} className="p-4 bg-cm-elevated align-top relative group">
                        <button
                          onClick={() => { removeItem(p.id); toast.success('Removed from comparison') }}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-cm-hover border border-cm-border-subtle flex items-center justify-center text-cm-dim hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="aspect-square rounded-xl bg-cm-input overflow-hidden mb-3 max-w-[200px] mx-auto cursor-pointer" onClick={() => navigate('product-detail', { id: p.id })}>
                          {images.length > 0 ? (
                            <img src={images[0]} alt={p.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-cm-faint" /></div>
                          )}
                        </div>
                        <button
                          onClick={() => navigate('product-detail', { id: p.id })}
                          className="text-sm font-semibold text-cm-secondary hover:text-red-400 transition-colors line-clamp-2 text-center block mx-auto"
                        >
                          {p.title}
                        </button>
                      </td>
                    )
                  })}
                </tr>

                {/* Price */}
                <tr className="border-t border-cm-border-subtle">
                  <td className="p-4 bg-cm-hover/50 align-top">
                    <span className="text-xs font-semibold text-cm-dim uppercase tracking-wider">Price</span>
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 bg-cm-hover/50">
                      <span className="text-lg font-bold text-red-400">${p.price.toFixed(2)}</span>
                      <span className="text-xs text-cm-faint ml-1">CAD</span>
                    </td>
                  ))}
                </tr>

                {/* Compare Price / Discount */}
                <tr className="border-t border-cm-border-subtle">
                  <td className="p-4 align-top">
                    <span className="text-xs font-semibold text-cm-dim uppercase tracking-wider">Compare Price</span>
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4">
                      {p.comparePrice && p.comparePrice > p.price ? (
                        <div>
                          <span className="text-sm text-cm-faint line-through">${p.comparePrice.toFixed(2)}</span>
                          <Badge className="ml-2 bg-red-500 text-white text-xs">
                            -{Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)}%
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-sm text-cm-faint">—</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Store */}
                <tr className="border-t border-cm-border-subtle bg-cm-hover/50">
                  <td className="p-4 align-top">
                    <span className="text-xs font-semibold text-cm-dim uppercase tracking-wider">Store</span>
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4">
                      <button
                        onClick={() => navigate('storefront', { slug: p.store.slug })}
                        className="text-sm text-cm-secondary hover:text-red-400 transition-colors flex items-center gap-1"
                      >
                        <Store className="w-3.5 h-3.5" />
                        {p.store.name}
                      </button>
                    </td>
                  ))}
                </tr>

                {/* Condition */}
                <tr className="border-t border-cm-border-subtle">
                  <td className="p-4 align-top">
                    <span className="text-xs font-semibold text-cm-dim uppercase tracking-wider">Condition</span>
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4">
                      <Badge className={`${conditionColors[p.condition] || conditionColors.USED} text-xs border`}>
                        {p.condition}
                      </Badge>
                    </td>
                  ))}
                </tr>

                {/* Stock */}
                <tr className="border-t border-cm-border-subtle bg-cm-hover/50">
                  <td className="p-4 align-top">
                    <span className="text-xs font-semibold text-cm-dim uppercase tracking-wider">Stock</span>
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4">
                      <Badge className={`${p.stock > 5 ? 'bg-green-500/10 text-green-400 border-green-500/20' : p.stock > 0 ? 'bg-red-500/10 text-red-300 border-red-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} border text-xs`}>
                        {p.stock > 5 ? 'In Stock' : p.stock > 0 ? `${p.stock} left` : 'Out of Stock'}
                      </Badge>
                    </td>
                  ))}
                </tr>

                {/* Rating */}
                <tr className="border-t border-cm-border-subtle">
                  <td className="p-4 align-top">
                    <span className="text-xs font-semibold text-cm-dim uppercase tracking-wider">Rating</span>
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4">
                      <div className="flex items-center gap-1.5">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(p.avgRating) ? 'text-red-300 fill-red-300' : 'text-neutral-700'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-cm-muted">{p.avgRating.toFixed(1)}</span>
                        <span className="text-xs text-cm-faint">({p._count.reviews})</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Category */}
                <tr className="border-t border-cm-border-subtle bg-cm-hover/50">
                  <td className="p-4 align-top">
                    <span className="text-xs font-semibold text-cm-dim uppercase tracking-wider">Category</span>
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4">
                      <span className="text-sm text-cm-secondary">{p.category.name}</span>
                    </td>
                  ))}
                </tr>

                {/* Description */}
                <tr className="border-t border-cm-border-subtle">
                  <td className="p-4 align-top">
                    <span className="text-xs font-semibold text-cm-dim uppercase tracking-wider">Description</span>
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4">
                      <p className="text-xs text-cm-dim leading-relaxed line-clamp-4 max-w-xs">{p.description}</p>
                    </td>
                  ))}
                </tr>

                {/* Actions */}
                <tr className="border-t border-cm-border-subtle bg-cm-hover/50">
                  <td className="p-4 align-top">
                    <span className="text-xs font-semibold text-cm-dim uppercase tracking-wider">Actions</span>
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4">
                      <Button
                        onClick={() => navigate('product-detail', { id: p.id })}
                        size="sm"
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs w-full"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                        View Product
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
