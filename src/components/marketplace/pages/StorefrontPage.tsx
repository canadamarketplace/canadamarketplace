'use client'
import { useState, useEffect } from 'react'
import { useNavigation } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Store, Star, MapPin, Package, CheckCircle2, ChevronLeft, ShoppingCart
} from 'lucide-react'
import { toast } from 'sonner'

interface StoreData {
  id: string; name: string; slug: string; description?: string
  logo?: string; banner?: string; rating: number; totalSales: number
  seller: { id: string; name: string; avatar?: string; isVerified: boolean; province: string; city: string; createdAt: string }
  products: Array<{
    id: string; title: string; price: number; images: string; condition: string
    _count: { reviews: number }
  }>
  _count: { products: number }
}

export default function StorefrontPage() {
  const { navigate, pageParams } = useNavigation()
  const [store, setStore] = useState<StoreData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStore = async (slug: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/stores/${slug}`)
      if (res.ok) {
        setStore(await res.json())
      } else {
        toast.error('Store not found')
        navigate('browse')
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    if (pageParams.slug) fetchStore(pageParams.slug)
  }, [pageParams.slug, fetchStore])

  const getImages = (imagesStr: string) => {
    try { return JSON.parse(imagesStr) } catch { return [] }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-48 bg-neutral-800 rounded-2xl mb-6" />
        <div className="h-8 bg-neutral-800 rounded w-1/3 mb-4" />
        <div className="h-4 bg-neutral-800 rounded w-2/3" />
      </div>
    )
  }

  if (!store) return null

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="h-48 sm:h-64 bg-gradient-to-r from-red-900/30 via-neutral-900 to-red-900/20 relative">
        {store.banner && (
          <img src={store.banner} alt="" className="w-full h-full object-cover opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <button onClick={() => navigate('browse')} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 mb-6 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Browse
        </button>

        {/* Store Info */}
        <div className="flex items-start gap-5 mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-neutral-800 border-4 border-[#0a0a0a] overflow-hidden flex-shrink-0">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500/20 to-red-500/20">
                <Store className="w-10 h-10 text-red-400" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-100">{store.name}</h1>
              {store.seller.isVerified && (
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <p className="text-sm text-stone-500 mt-1">by {store.seller.name}</p>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-red-300 fill-red-300" />
                <span className="text-sm text-stone-300">{store.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-stone-600">|</span>
              <span className="text-sm text-stone-400">{store.totalSales} sales</span>
              <span className="text-xs text-stone-600">|</span>
              <span className="text-sm text-stone-400">{store._count.products} products</span>
              <span className="text-xs text-stone-600">|</span>
              <div className="flex items-center gap-1 text-sm text-stone-400">
                <MapPin className="w-4 h-4" />
                {store.seller.city}, {store.seller.province}
              </div>
            </div>
            {store.description && (
              <p className="text-sm text-stone-500 mt-3 max-w-xl leading-relaxed">{store.description}</p>
            )}
          </div>
        </div>

        {/* Products */}
        <h2 className="text-lg font-semibold text-stone-200 mb-4">All Products ({store._count.products})</h2>

        {store.products.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-neutral-900/60 border border-white/5">
            <Package className="w-16 h-16 text-stone-700 mx-auto mb-4" />
            <p className="text-stone-500">No products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
            {store.products.map((product) => {
              const images = getImages(product.images)
              return (
                <button
                  key={product.id}
                  onClick={() => navigate('product-detail', { id: product.id })}
                  className="rounded-2xl bg-neutral-900/60 border border-white/5 hover:border-white/10 overflow-hidden transition-all text-left group"
                >
                  <div className="aspect-square bg-neutral-800 relative overflow-hidden">
                    {images.length > 0 ? (
                      <img src={images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-700"><Package className="w-12 h-12" /></div>
                    )}
                    <Badge className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-stone-300 text-[10px] px-2 py-0.5 rounded-lg border-0">
                      {product.condition}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-stone-200 truncate">{product.title}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-red-300 fill-red-300" />
                      <span className="text-[10px] text-stone-500">({product._count.reviews} reviews)</span>
                    </div>
                    <p className="text-base font-bold text-red-400 mt-2">${product.price.toFixed(2)}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
