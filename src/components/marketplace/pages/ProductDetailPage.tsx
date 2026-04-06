'use client'
import { useState, useEffect, useCallback } from 'react'
import { useNavigation, useCart, useAuth, useWishlist } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ORDER_STATUS_LABELS } from '@/lib/types'
import {
  Star, ShoppingCart, MapPin, Shield, ChevronLeft, Package,
  Heart, Share2, Store, Clock, Truck, CheckCircle2, ThumbsUp, User, ChevronRight, MessageCircle,
  X, ZoomIn, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon
} from 'lucide-react'
import { toast } from 'sonner'

interface ProductVariant {
  id: string; name: string; value: string; priceDelta: number | null; stock: number | null; sku: string | null; position: number
}

interface Product {
  id: string; title: string; slug: string; description: string
  price: number; comparePrice?: number | null; condition: string
  images: string; stock: number; sold: number; views: number; isFeatured: boolean
  store: { id: string; name: string; slug: string; rating: number; totalSales: number
    seller: { id: string; name: string; isVerified: boolean; province: string; city: string }
    _count: { products: number }
  }
  reviews: Array<{ id: string; rating: number; title: string; comment: string; createdAt: string; reviewer: { id: string; name: string; avatar: string } }>
  _count: { reviews: number }
  avgRating: number
  category: { name: string; slug: string }
  variants?: ProductVariant[]
}

/* ─── Lightbox Component ─── */
function Lightbox({ images, initialIndex, onClose }: {
  images: string[]
  initialIndex: number
  onClose: () => void
}) {
  const [current, setCurrent] = useState(initialIndex)

  const goNext = useCallback(() => {
    setCurrent(prev => (prev + 1) % images.length)
  }, [images.length])

  const goPrev = useCallback(() => {
    setCurrent(prev => (prev - 1 + images.length) % images.length)
  }, [images.length])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, goNext, goPrev])

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-cm-hover-strong hover:bg-cm-hover-strong flex items-center justify-center text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Image counter */}
      <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-cm-hover-strong text-sm text-white font-medium">
        {current + 1} / {images.length}
      </div>

      {/* Prev button */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goPrev() }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-cm-hover-strong hover:bg-cm-hover-strong flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
      )}

      {/* Image */}
      <img
        src={images[current]}
        alt={`Image ${current + 1}`}
        className="max-w-[90vw] max-h-[85vh] object-contain select-none"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goNext() }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-cm-hover-strong hover:bg-cm-hover-strong flex items-center justify-center text-white transition-colors"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 px-2"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                i === current ? 'border-red-500 opacity-100' : 'border-cm-border-hover opacity-50 hover:opacity-80'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Product Detail Page ─── */
export default function ProductDetailPage() {
  const { navigate, pageParams } = useNavigation()
  const { addItem } = useCart()
  const { user } = useAuth()
  const { isWished, toggleItem } = useWishlist()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const fetchProduct = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${id}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data)
        // Fetch related products
        const relRes = await fetch(`/api/products?category=${data.category.slug}&limit=4`)
        if (relRes.ok) {
          const relData = await relRes.json()
          setRelatedProducts((relData.products || []).filter((p: any) => p.id !== id).slice(0, 4))
        }
      } else {
        toast.error('Product not found')
        navigate('browse')
      }
    } catch {}
    setLoading(false)
  }, [navigate])

  useEffect(() => {
    if (pageParams.id) {
      fetchProduct(pageParams.id)
    }
  }, [pageParams.id, fetchProduct])

  const getImages = (imagesStr: string) => {
    try { return JSON.parse(imagesStr) } catch { return [] }
  }

  // Group variants by name
  const variantGroups = product?.variants?.length ? (() => {
    const groups: Record<string, ProductVariant[]> = {}
    product.variants!.forEach(v => {
      if (!groups[v.name]) groups[v.name] = []
      groups[v.name].push(v)
    })
    return groups
  })() : {}

  const variantNames = Object.keys(variantGroups)

  // Initialize selected variants to first option
  useEffect(() => {
    if (product?.variants?.length && Object.keys(selectedVariants).length === 0) {
      const initial: Record<string, string> = {}
      Object.keys(variantGroups).forEach(name => {
        initial[name] = variantGroups[name][0].id
      })
      setSelectedVariants(initial)
    }
  }, [product?.variants])

  // Calculate current price delta
  const currentPriceDelta = Object.values(selectedVariants).reduce((sum, variantId) => {
    const variant = product?.variants?.find(v => v.id === variantId)
    return sum + (variant?.priceDelta || 0)
  }, 0)

  const effectivePrice = (product?.price || 0) + currentPriceDelta

  // Get stock from selected variants
  const selectedVariantStock = Object.values(selectedVariants).reduce((min, variantId) => {
    const variant = product?.variants?.find(v => v.id === variantId)
    const stock = variant?.stock || product?.stock || 0
    return Math.min(min, stock)
  }, product?.stock || 999)

  const selectedVariantInfo = Object.values(selectedVariants).map(variantId => {
    const variant = product?.variants?.find(v => v.id === variantId)
    return variant?.value || ''
  }).filter(Boolean).join(' / ')

  const handleAddToCart = () => {
    if (!product) return
    if (!user) {
      useNavigation.getState().openAuthModal('login')
      toast.error('Please sign in to add to cart')
      return
    }
    const titleWithVariant = selectedVariantInfo ? `${product.title} (${selectedVariantInfo})` : product.title
    addItem({
      productId: product.id,
      title: titleWithVariant,
      price: effectivePrice,
      image: getImages(product.images)[0] || undefined,
      storeName: product.store.name,
      storeId: product.store.id,
    })
    toast.success('Added to cart!')
  }

  const handleMessageSeller = () => {
    if (!product) return
    if (!user) {
      useNavigation.getState().openAuthModal('login')
      toast.error('Please sign in to message sellers')
      return
    }
    if (user.id === product.store.seller.id) {
      toast.info('This is your listing')
      return
    }
    navigate('messaging', { recipientId: product.store.seller.id })
  }

  const hasDiscount = product?.comparePrice && product.comparePrice > product.price
  const wished = product ? isWished(product.id) : false

  const handleToggleWishlist = () => {
    if (!product) return
    toggleItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: getImages(product.images)[0],
      storeName: product.store.name,
      storeSlug: product.store.slug,
      addedAt: Date.now(),
    })
    toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square rounded-2xl bg-cm-input" />
          <div className="space-y-4">
            <div className="h-8 bg-cm-input rounded w-3/4" />
            <div className="h-6 bg-cm-input rounded w-1/2" />
            <div className="h-20 bg-cm-input rounded" />
            <div className="h-12 bg-cm-input rounded w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const images = getImages(product.images)
  const conditionColors: Record<string, string> = {
    NEW: 'bg-green-500/10 text-green-400 border-green-500/20',
    LIKE_NEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    GOOD: 'bg-red-500/10 text-red-300 border-red-500/20',
    FAIR: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    USED: 'bg-stone-500/10 text-cm-muted border-stone-500/20',
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <button onClick={() => navigate('browse')} className="flex items-center gap-2 text-sm text-cm-dim hover:text-cm-secondary mb-6 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Browse
        </button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div
              className="aspect-square rounded-2xl bg-cm-input overflow-hidden border border-cm-border-subtle cursor-zoom-in relative group"
              onClick={() => images.length > 0 && setLightboxOpen(true)}
            >
              {images.length > 0 ? (
                <>
                  <img src={images[selectedImage]} alt={product.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center pointer-events-none">
                    <ZoomIn className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-cm-faint">
                  <Package className="w-20 h-20" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      i === selectedImage ? 'border-red-500' : 'border-cm-border-hover hover:border-cm-border-hover'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className={`${conditionColors[product.condition] || conditionColors.USED} text-xs border`}>
                {product.condition}
              </Badge>
              {product.isFeatured && (
                <Badge className="bg-red-500/10 text-red-300 border-red-500/20 text-xs border">
                  <Star className="w-3 h-3 mr-1 fill-red-300" /> Featured
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-cm-primary mb-2">{product.title}</h1>

            <p className="text-sm text-cm-dim mb-4">
              {product.category.name} · {product.sold} sold · {product.views} views
            </p>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-red-400">${effectivePrice.toFixed(2)}</span>
              {currentPriceDelta !== 0 && (
                <span className="text-sm text-cm-faint">Base: ${product.price.toFixed(2)}</span>
              )}
              {hasDiscount && (
                <>
                  <span className="text-lg text-cm-faint line-through">${(product.comparePrice! + currentPriceDelta).toFixed(2)}</span>
                  <Badge className="bg-red-500 text-white text-xs">
                    Save {Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}%
                  </Badge>
                </>
              )}
              <span className="text-sm text-cm-faint">CAD</span>
            </div>

            {/* Variant Selector */}
            {variantNames.length > 0 && (
              <div className="mb-6 space-y-4">
                {variantNames.map(name => (
                  <div key={name}>
                    <label className="text-sm font-medium text-cm-secondary mb-2 block">{name}: <span className="text-cm-primary">{selectedVariants[name] ? product?.variants?.find(v => v.id === selectedVariants[name])?.value : ''}</span></label>
                    <div className="flex flex-wrap gap-2">
                      {variantGroups[name].map(variant => {
                        const isSelected = selectedVariants[name] === variant.id
                        return (
                          <button
                            key={variant.id}
                            onClick={() => setSelectedVariants(prev => ({ ...prev, [name]: variant.id }))}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                              isSelected
                                ? 'bg-red-500/10 text-red-300 border-red-500/40'
                                : 'bg-cm-hover text-cm-secondary border-cm-border-hover hover:border-cm-border-hover hover:text-cm-primary'
                            }`}
                          >
                            {variant.value}
                            {variant.priceDelta && variant.priceDelta !== 0 && (
                              <span className={`ml-1.5 text-xs ${variant.priceDelta > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {variant.priceDelta > 0 ? '+' : ''}{variant.priceDelta.toFixed(0)}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                {selectedVariantInfo && (
                  <p className="text-xs text-cm-dim">{selectedVariantInfo} · ${effectivePrice.toFixed(2)}</p>
                )}
              </div>
            )}

            <p className="text-sm text-cm-muted leading-relaxed mb-6 whitespace-pre-wrap">{product.description}</p>

            <div className="flex items-center gap-3 mb-6">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl h-12"
              >
                <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
              </Button>
              <Button
                onClick={handleMessageSeller}
                variant="outline"
                size="lg"
                className="flex-1 border-cm-border-hover text-cm-primary hover:bg-cm-hover hover:text-red-400 rounded-xl h-12"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {user && user.id === product.store.seller.id ? 'Your Listing' : 'Message Seller'}
              </Button>
              <Button
                onClick={handleToggleWishlist}
                variant="outline"
                size="lg"
                className={`border-cm-border-hover rounded-xl h-12 ${wished ? 'text-red-500 hover:text-red-400 border-red-500/30 hover:bg-red-500/10' : 'text-cm-primary hover:bg-cm-hover'}`}
              >
                <Heart className={`w-5 h-5 ${wished ? 'fill-red-500' : ''}`} />
              </Button>
              <Button variant="outline" size="lg" className="border-cm-border-hover text-cm-primary hover:bg-cm-hover rounded-xl h-12">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <Separator className="bg-cm-hover my-6" />

            {/* Store Info */}
            <button
              onClick={() => navigate('storefront', { slug: product.store.slug })}
              className="w-full p-4 rounded-2xl bg-cm-elevated border border-cm-border-subtle hover:border-cm-border-hover transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/10 border border-cm-border-subtle flex items-center justify-center">
                  <Store className="w-7 h-7 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-cm-primary group-hover:text-red-400 transition-colors truncate">{product.store.name}</h3>
                    {product.store.seller.isVerified && (
                      <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-cm-dim mt-0.5">by {product.store.seller.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-red-300 fill-red-300" />
                      <span className="text-xs text-cm-muted">{product.store.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-cm-faint">|</span>
                    <span className="text-xs text-cm-dim">{product.store.totalSales} sales</span>
                    <span className="text-xs text-cm-faint">|</span>
                    <div className="flex items-center gap-1 text-xs text-cm-dim">
                      <MapPin className="w-3 h-3" />
                      {product.store.seller.city}, {product.store.seller.province}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-cm-faint group-hover:text-cm-muted group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            {/* Stock */}
            <div className="mt-4 flex items-center gap-2 text-xs">
              <Badge className={`${product.stock > 5 ? 'bg-green-500/10 text-green-400 border-green-500/20' : product.stock > 0 ? 'bg-red-500/10 text-red-300 border-red-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} border`}>
                {product.stock > 5 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-cm-primary mb-6">Customer Reviews</h2>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Rating Summary */}
            <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-6 text-center">
              <p className="text-5xl font-bold text-cm-primary">{product.avgRating.toFixed(1)}</p>
              <div className="flex justify-center gap-0.5 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.round(product.avgRating) ? 'text-red-300 fill-red-300' : 'text-neutral-700'}`} />
                ))}
              </div>
              <p className="text-sm text-cm-dim mt-2">{product._count.reviews} review{product._count.reviews !== 1 ? 's' : ''}</p>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-4">
              {product.reviews.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-cm-elevated border border-cm-border-subtle">
                  <ThumbsUp className="w-12 h-12 text-cm-faint mx-auto mb-3" />
                  <p className="text-cm-dim">No reviews yet</p>
                </div>
              ) : (
                product.reviews.map((review) => (
                  <div key={review.id} className="p-4 rounded-2xl bg-cm-elevated border border-cm-border-subtle">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-500 flex items-center justify-center text-xs font-bold text-white">
                        {review.reviewer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-cm-secondary">{review.reviewer.name}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-red-300 fill-red-300' : 'text-neutral-700'}`} />
                            ))}
                          </div>
                          <span className="text-[10px] text-cm-faint">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {review.title && <p className="text-sm font-medium text-cm-secondary mb-1">{review.title}</p>}
                    {review.comment && <p className="text-sm text-cm-dim leading-relaxed">{review.comment}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-cm-primary mb-6">Related Products</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((rp) => {
                const rpImages = getImages(rp.images)
                return (
                  <button
                    key={rp.id}
                    onClick={() => { navigate('product-detail', { id: rp.id }); setSelectedImage(0) }}
                    className="rounded-2xl bg-cm-elevated border border-cm-border-subtle hover:border-cm-border-hover overflow-hidden transition-all text-left group"
                  >
                    <div className="aspect-square bg-cm-input overflow-hidden">
                      {rpImages.length > 0 ? (
                        <img src={rpImages[0]} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-cm-faint"><Package className="w-10 h-10" /></div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-medium text-cm-secondary truncate">{rp.title}</p>
                      <p className="text-sm font-bold text-red-400 mt-1">${rp.price.toFixed(2)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <Lightbox
          images={images}
          initialIndex={selectedImage}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
