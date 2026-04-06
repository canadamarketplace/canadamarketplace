'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigation } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Store, Star, MapPin, Package, CheckCircle2, ChevronLeft, ShoppingCart,
  Clock, TrendingUp, Calendar, MessageCircle, Facebook, Twitter, Instagram, Globe
} from 'lucide-react'
import { toast } from 'sonner'

interface StoreData {
  id: string; name: string; slug: string; description?: string
  logo?: string; banner?: string; rating: number; totalSales: number; createdAt: string
  facebookUrl?: string | null
  twitterUrl?: string | null
  instagramUrl?: string | null
  websiteUrl?: string | null
  vacationMode?: boolean
  vacationMessage?: string | null
  seller: { id: string; name: string; avatar?: string; isVerified: boolean; province: string; city: string; createdAt: string }
  products: Array<{
    id: string; title: string; price: number; images: string; condition: string
    _count: { reviews: number }
  }>
  _count: { products: number }
  reviews?: Array<{
    id: string; rating: number; title?: string; comment?: string
    reviewer: { name: string; avatar?: string | null }
    createdAt: string
  }>
  averageRating?: number
  reviewCount?: number
}

export default function StorefrontPage() {
  const { navigate, pageParams } = useNavigation()
  const [store, setStore] = useState<StoreData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStore = useCallback(async (slug: string) => {
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
  }, [navigate])

  useEffect(() => {
    if (pageParams?.slug) fetchStore(pageParams.slug)
    else if (pageParams?.id) {
      // Fallback: try to find store by looking up from stores list
      fetch(`/api/stores`).then(r => r.json()).then((stores: any[]) => {
        const s = stores.find((s: any) => s.id === pageParams.id)
        if (s?.slug) navigate('storefront', { slug: s.slug })
        else navigate('browse')
      }).catch(() => navigate('browse'))
    }
  }, [pageParams?.slug, pageParams?.id, fetchStore])

  const getImages = (imagesStr: string) => {
    try { return JSON.parse(imagesStr) } catch { return [] }
  }

  // Compute rating distribution for the reviews section
  const starDistribution = useMemo(() => {
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    if (store?.reviews) {
      for (const review of store.reviews) {
        const star = Math.round(review.rating)
        if (star >= 1 && star <= 5) dist[star]++
      }
    }
    return dist
  }, [store])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-48 bg-cm-input rounded-2xl mb-6" />
        <div className="h-8 bg-cm-input rounded w-1/3 mb-4" />
        <div className="h-4 bg-cm-input rounded w-2/3" />
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
        <div className="absolute inset-0 bg-gradient-to-t from-cm-bg to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <button onClick={() => navigate('browse')} className="flex items-center gap-2 text-sm text-cm-dim hover:text-cm-secondary mb-6 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Browse
        </button>

        {/* Store Info */}
        <div className="flex items-start gap-5 mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-cm-input border-4 border-cm-bg overflow-hidden flex-shrink-0">
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
              <h1 className="text-2xl sm:text-3xl font-bold text-cm-primary">{store.name}</h1>
              {store.seller.isVerified && (
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <p className="text-sm text-cm-dim mt-1">by {store.seller.name}</p>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-red-300 fill-red-300" />
                <span className="text-sm text-cm-secondary">{(store.averageRating || store.rating || 0).toFixed(1)}</span>
              </div>
              <span className="text-xs text-cm-faint">|</span>
              <span className="text-sm text-cm-muted">{store.totalSales} sales</span>
              <span className="text-xs text-cm-faint">|</span>
              <span className="text-sm text-cm-muted">{store._count.products} products</span>
              <span className="text-xs text-cm-faint">|</span>
              <div className="flex items-center gap-1 text-sm text-cm-muted">
                <MapPin className="w-4 h-4" />
                {store.seller.city}, {store.seller.province}
              </div>
            </div>
            {store.description && (
              <p className="text-sm text-cm-dim mt-3 max-w-xl leading-relaxed">{store.description}</p>
            )}

            {/* E. Social Media Links */}
            {(store.facebookUrl || store.twitterUrl || store.instagramUrl || store.websiteUrl) && (
              <div className="flex items-center gap-3 mt-3">
                {store.facebookUrl && (
                  <a href={store.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-cm-hover border border-cm-border-subtle flex items-center justify-center text-cm-muted hover:text-blue-400 hover:border-blue-400/20 transition-all">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {store.twitterUrl && (
                  <a href={store.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-cm-hover border border-cm-border-subtle flex items-center justify-center text-cm-muted hover:text-blue-300 hover:border-blue-300/20 transition-all">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {store.instagramUrl && (
                  <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-cm-hover border border-cm-border-subtle flex items-center justify-center text-cm-muted hover:text-pink-400 hover:border-pink-400/20 transition-all">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {store.websiteUrl && (
                  <a href={store.websiteUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-cm-hover border border-cm-border-subtle flex items-center justify-center text-cm-muted hover:text-cm-secondary hover:border-cm-border-hover transition-all">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* A. Vacation Mode Banner */}
        {store.vacationMode && (
          <div className="mb-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-yellow-400">Store on Vacation</h3>
                <p className="text-xs text-cm-dim mt-0.5">{store.vacationMessage || 'This store is currently on vacation. Orders will be processed when they return.'}</p>
              </div>
            </div>
          </div>
        )}

        {/* B. Store Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Products', value: store._count.products, icon: Package },
            { label: 'Total Sales', value: store.totalSales, icon: TrendingUp },
            { label: 'Rating', value: (store.averageRating || store.rating || 0).toFixed(1), icon: Star },
            { label: 'Since', value: new Date(store.createdAt || store.seller.createdAt).getFullYear(), icon: Calendar },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-3 p-4 rounded-xl bg-cm-elevated border border-cm-border-subtle">
              <stat.icon className="w-5 h-5 text-cm-faint" />
              <div>
                <p className="text-lg font-bold text-cm-secondary">{stat.value}</p>
                <p className="text-xs text-cm-dim">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* C. Contact Vendor Block */}
        <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-6 mb-8">
          <h2 className="text-base font-semibold text-cm-secondary mb-4 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-red-400" />
            Contact Seller
          </h2>
          <p className="text-sm text-cm-dim mb-4">Have a question about a product? Send a message to {store.seller.name}.</p>
          <Button
            onClick={() => navigate('messaging', { recipientId: store.seller.id })}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>

        {/* Products */}
        <h2 className="text-lg font-semibold text-cm-secondary mb-4">All Products ({store._count.products})</h2>

        {store.products.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-cm-elevated border border-cm-border-subtle">
            <Package className="w-16 h-16 text-cm-faint mx-auto mb-4" />
            <p className="text-cm-dim">No products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
            {store.products.map((product) => {
              const images = getImages(product.images)
              return (
                <button
                  key={product.id}
                  onClick={() => navigate('product-detail', { id: product.id })}
                  className="rounded-2xl bg-cm-elevated border border-cm-border-subtle hover:border-cm-border-hover overflow-hidden transition-all text-left group"
                >
                  <div className="aspect-square bg-cm-input relative overflow-hidden">
                    {images.length > 0 ? (
                      <img src={images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cm-faint"><Package className="w-12 h-12" /></div>
                    )}
                    <Badge className="absolute top-3 right-3 bg-cm-overlay backdrop-blur-sm text-cm-secondary text-[10px] px-2 py-0.5 rounded-lg border-0">
                      {product.condition}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-cm-secondary truncate">{product.title}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-red-300 fill-red-300" />
                      <span className="text-[10px] text-cm-dim">({product._count.reviews} reviews)</span>
                    </div>
                    <p className="text-base font-bold text-red-400 mt-2">${product.price.toFixed(2)}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* D. Reviews & Ratings Section */}
        <div className="mt-12 pb-12">
          <h2 className="text-lg font-semibold text-cm-secondary mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-red-300 fill-red-300" />
            Reviews & Ratings
            <Badge className="bg-cm-hover text-cm-muted text-xs border border-cm-border-subtle">
              {(store.reviewCount || 0)} reviews
            </Badge>
          </h2>

          {/* Review summary cards */}
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            {/* Average rating card */}
            <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-6 flex flex-col items-center justify-center">
              <p className="text-5xl font-bold text-cm-primary">{(store.averageRating || store.rating || 0).toFixed(1)}</p>
              <div className="flex items-center gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`w-5 h-5 ${i <= Math.round(store.averageRating || store.rating || 0) ? 'text-red-300 fill-red-300' : 'text-cm-faint'}`} />
                ))}
              </div>
              <p className="text-xs text-cm-dim mt-2">{(store.reviewCount || 0)} reviews</p>
            </div>

            {/* Rating distribution */}
            <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-6 space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const count = starDistribution[star] || 0
                const pct = (store.reviewCount || 0) > 0 ? (count / store.reviewCount) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs text-cm-dim w-3">{star}</span>
                    <Star className="w-3 h-3 text-red-300 fill-red-300" />
                    <div className="flex-1 h-2 bg-cm-hover rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-cm-faint w-6 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Review cards */}
          {(!store.reviews || store.reviews.length === 0) ? (
            <div className="text-center py-12 rounded-2xl bg-cm-elevated border border-cm-border-subtle">
              <Star className="w-12 h-12 text-cm-faint mx-auto mb-3" />
              <p className="text-sm text-cm-dim">No reviews yet. Be the first to leave a review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {store.reviews.map((review) => (
                <div key={review.id} className="rounded-xl bg-cm-elevated border border-cm-border-subtle p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-cm-hover border border-cm-border-subtle flex items-center justify-center text-cm-muted text-sm font-semibold">
                      {review.reviewer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-cm-secondary">{review.reviewer.name}</p>
                      <p className="text-[10px] text-cm-faint">{new Date(review.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`w-3 h-3 ${i <= Math.round(review.rating) ? 'text-red-300 fill-red-300' : 'text-neutral-700'}`} />
                      ))}
                    </div>
                  </div>
                  {review.title && (
                    <p className="text-sm font-medium text-cm-primary mb-1">{review.title}</p>
                  )}
                  {review.comment && (
                    <p className="text-sm text-cm-dim leading-relaxed">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
