'use client'
import { useState, useEffect } from 'react'
import { useNavigation, useCart, useAuth } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ORDER_STATUS_LABELS } from '@/lib/types'
import {
  Star, ShoppingCart, MapPin, Shield, ChevronLeft, Package,
  Heart, Share2, Store, Clock, Truck, CheckCircle2, ThumbsUp, User, ChevronRight, MessageCircle
} from 'lucide-react'
import { toast } from 'sonner'

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
}

export default function ProductDetailPage() {
  const { navigate, pageParams } = useNavigation()
  const { addItem } = useCart()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])

  const fetchProduct = async (id: string) => {
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
  }

  useEffect(() => {
    if (pageParams.id) {
      fetchProduct(pageParams.id)
    }
  }, [pageParams.id, fetchProduct])

  const getImages = (imagesStr: string) => {
    try { return JSON.parse(imagesStr) } catch { return [] }
  }

  const handleAddToCart = () => {
    if (!product) return
    if (!user) {
      useNavigation.getState().openAuthModal('login')
      toast.error('Please sign in to add to cart')
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square rounded-2xl bg-neutral-800" />
          <div className="space-y-4">
            <div className="h-8 bg-neutral-800 rounded w-3/4" />
            <div className="h-6 bg-neutral-800 rounded w-1/2" />
            <div className="h-20 bg-neutral-800 rounded" />
            <div className="h-12 bg-neutral-800 rounded w-1/3" />
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
    USED: 'bg-stone-500/10 text-stone-400 border-stone-500/20',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <button onClick={() => navigate('browse')} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 mb-6 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Browse
      </button>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl bg-neutral-800 overflow-hidden border border-white/5">
            {images.length > 0 ? (
              <img src={images[selectedImage]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-700">
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
                    i === selectedImage ? 'border-red-500' : 'border-white/10 hover:border-white/20'
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

          <h1 className="text-2xl sm:text-3xl font-bold text-stone-100 mb-2">{product.title}</h1>

          <p className="text-sm text-stone-500 mb-4">
            {product.category.name} · {product.sold} sold · {product.views} views
          </p>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-red-400">${product.price.toFixed(2)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-stone-600 line-through">${product.comparePrice!.toFixed(2)}</span>
                <Badge className="bg-red-500 text-white text-xs">
                  Save {Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}%
                </Badge>
              </>
            )}
            <span className="text-sm text-stone-600">CAD</span>
          </div>

          <p className="text-sm text-stone-400 leading-relaxed mb-6 whitespace-pre-wrap">{product.description}</p>

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
              className="flex-1 border-white/10 text-stone-300 hover:bg-white/5 hover:text-red-400 rounded-xl h-12"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {user && user.id === product.store.seller.id ? 'Your Listing' : 'Message Seller'}
            </Button>
            <Button variant="outline" size="lg" className="border-white/10 text-stone-400 hover:bg-white/5 rounded-xl h-12">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-white/10 text-stone-400 hover:bg-white/5 rounded-xl h-12">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          <Separator className="bg-white/5 my-6" />

          {/* Store Info */}
          <button
            onClick={() => navigate('storefront', { slug: product.store.slug })}
            className="w-full p-4 rounded-2xl bg-neutral-900/60 border border-white/5 hover:border-white/10 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/10 border border-white/5 flex items-center justify-center">
                <Store className="w-7 h-7 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-stone-100 group-hover:text-red-400 transition-colors truncate">{product.store.name}</h3>
                  {product.store.seller.isVerified && (
                    <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-0.5">by {product.store.seller.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-red-300 fill-red-300" />
                    <span className="text-xs text-stone-400">{product.store.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-stone-600">|</span>
                  <span className="text-xs text-stone-500">{product.store.totalSales} sales</span>
                  <span className="text-xs text-stone-600">|</span>
                  <div className="flex items-center gap-1 text-xs text-stone-500">
                    <MapPin className="w-3 h-3" />
                    {product.store.seller.city}, {product.store.seller.province}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-600 group-hover:text-stone-400 group-hover:translate-x-1 transition-all" />
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
        <h2 className="text-xl font-bold text-stone-100 mb-6">Customer Reviews</h2>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Rating Summary */}
          <div className="rounded-2xl bg-neutral-900/60 border border-white/5 p-6 text-center">
            <p className="text-5xl font-bold text-stone-100">{product.avgRating.toFixed(1)}</p>
            <div className="flex justify-center gap-0.5 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.round(product.avgRating) ? 'text-red-300 fill-red-300' : 'text-neutral-700'}`} />
              ))}
            </div>
            <p className="text-sm text-stone-500 mt-2">{product._count.reviews} review{product._count.reviews !== 1 ? 's' : ''}</p>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {product.reviews.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-neutral-900/60 border border-white/5">
                <ThumbsUp className="w-12 h-12 text-stone-700 mx-auto mb-3" />
                <p className="text-stone-500">No reviews yet</p>
              </div>
            ) : (
              product.reviews.map((review) => (
                <div key={review.id} className="p-4 rounded-2xl bg-neutral-900/60 border border-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-500 flex items-center justify-center text-xs font-bold text-white">
                      {review.reviewer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-200">{review.reviewer.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-red-300 fill-red-300' : 'text-neutral-700'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] text-stone-600">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {review.title && <p className="text-sm font-medium text-stone-300 mb-1">{review.title}</p>}
                  {review.comment && <p className="text-sm text-stone-500 leading-relaxed">{review.comment}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold text-stone-100 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((rp) => {
              const rpImages = getImages(rp.images)
              return (
                <button
                  key={rp.id}
                  onClick={() => { navigate('product-detail', { id: rp.id }); setSelectedImage(0) }}
                  className="rounded-2xl bg-neutral-900/60 border border-white/5 hover:border-white/10 overflow-hidden transition-all text-left group"
                >
                  <div className="aspect-square bg-neutral-800 overflow-hidden">
                    {rpImages.length > 0 ? (
                      <img src={rpImages[0]} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-700"><Package className="w-10 h-10" /></div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-stone-300 truncate">{rp.title}</p>
                    <p className="text-sm font-bold text-red-400 mt-1">${rp.price.toFixed(2)}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
