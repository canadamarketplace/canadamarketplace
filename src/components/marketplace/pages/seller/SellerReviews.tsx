'use client'
import { useState, useEffect, useMemo } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Star, MessageSquare, ThumbsUp, ThumbsDown, MinusCircle,
  TrendingUp, Package, Filter
} from 'lucide-react'

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  createdAt: string
  buyer: { id: string; name: string }
  product: { id: string; title: string; image?: string }
  sentiment?: 'positive' | 'negative' | 'neutral'
}

const mockReviews: Review[] = [
  { id: 'R-001', rating: 5, title: 'Excellent quality!', comment: 'Absolutely love this product. The craftsmanship is outstanding and it arrived faster than expected. Will definitely buy again from this seller.', createdAt: '2024-02-10T14:30:00Z', buyer: { id: 'b1', name: 'Sarah Johnson' }, product: { id: 'p1', title: 'Handcrafted Maple Wood Cutting Board' }, sentiment: 'positive' },
  { id: 'R-002', rating: 4, title: 'Great product, minor issue', comment: 'Really nice product overall. The only reason I\'m not giving 5 stars is the packaging could have been better protected during shipping.', createdAt: '2024-02-08T09:15:00Z', buyer: { id: 'b2', name: 'Michael Chen' }, product: { id: 'p2', title: 'Organic Maple Syrup - Grade A Dark' }, sentiment: 'positive' },
  { id: 'R-003', rating: 5, title: 'Best purchase this year', comment: 'This exceeded my expectations. The quality is premium and the attention to detail is remarkable. Highly recommend to anyone looking for authentic Canadian products.', createdAt: '2024-02-05T16:45:00Z', buyer: { id: 'b3', name: 'Emily Rodriguez' }, product: { id: 'p3', title: 'Pure Beeswax Candle Set' }, sentiment: 'positive' },
  { id: 'R-004', rating: 3, title: 'Decent for the price', comment: 'Product is okay. It works as described but I expected a bit more for the price point. Shipping was on time though.', createdAt: '2024-02-01T11:20:00Z', buyer: { id: 'b4', name: 'David Park' }, product: { id: 'p4', title: 'Canadian Wildflower Honey' }, sentiment: 'neutral' },
  { id: 'R-005', rating: 5, title: 'Perfect gift!', comment: 'Bought this as a gift and the recipient loved it. Beautiful presentation and the quality is top-notch. The seller even included a handwritten thank you note!', createdAt: '2024-01-28T13:10:00Z', buyer: { id: 'b5', name: 'Amanda Taylor' }, product: { id: 'p5', title: 'Indigenous Art Print Collection' }, sentiment: 'positive' },
  { id: 'R-006', rating: 2, title: 'Not what I expected', comment: 'The product looked different from the photos. Color was off and it felt cheaper than described. Disappointed with this purchase.', createdAt: '2024-01-25T08:00:00Z', buyer: { id: 'b6', name: 'James Wilson' }, product: { id: 'p6', title: 'Handmade Ceramic Mug' }, sentiment: 'negative' },
  { id: 'R-007', rating: 4, title: 'Solid product', comment: 'Good quality and fast shipping. Would recommend. The only improvement would be more size options available.', createdAt: '2024-01-22T17:30:00Z', buyer: { id: 'b7', name: 'Lisa Nguyen' }, product: { id: 'p1', title: 'Handcrafted Maple Wood Cutting Board' }, sentiment: 'positive' },
  { id: 'R-008', rating: 5, title: 'Outstanding service', comment: 'Not only is the product amazing, but the seller went above and beyond to ensure I was satisfied. Customer service was exceptional.', createdAt: '2024-01-20T10:45:00Z', buyer: { id: 'b8', name: 'Robert Brown' }, product: { id: 'p3', title: 'Pure Beeswax Candle Set' }, sentiment: 'positive' },
  { id: 'R-009', rating: 1, title: 'Very disappointed', comment: 'Product arrived damaged and the seller was unresponsive to my messages. Would not recommend. Had to open a dispute to get my money back.', createdAt: '2024-01-18T14:00:00Z', buyer: { id: 'b9', name: 'Karen White' }, product: { id: 'p2', title: 'Organic Maple Syrup - Grade A Dark' }, sentiment: 'negative' },
  { id: 'R-010', rating: 4, title: 'Beautiful craftsmanship', comment: 'You can tell this was made with care. The natural wood grain patterns are unique to each piece. Very happy with my purchase.', createdAt: '2024-01-15T12:15:00Z', buyer: { id: 'b10', name: 'Thomas Martin' }, product: { id: 'p1', title: 'Handcrafted Maple Wood Cutting Board' }, sentiment: 'positive' },
  { id: 'R-011', rating: 3, title: 'Average product', comment: 'It\'s okay, nothing special. Does what it says but nothing more. I\'ve seen similar products for less.', createdAt: '2024-01-12T09:30:00Z', buyer: { id: 'b11', name: 'Jennifer Lee' }, product: { id: 'p4', title: 'Canadian Wildflower Honey' }, sentiment: 'neutral' },
  { id: 'R-012', rating: 5, title: 'Amazing quality!', comment: 'This is my third time ordering from this seller and the quality is consistently excellent. The products are always well-made and packaged carefully.', createdAt: '2024-01-10T15:00:00Z', buyer: { id: 'b12', name: 'Christopher Adams' }, product: { id: 'p5', title: 'Indigenous Art Print Collection' }, sentiment: 'positive' },
]

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-cm-faint'}`}
        />
      ))}
    </div>
  )
}

export default function SellerReviews() {
  const { navigate } = useNavigation()
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Try fetching reviews from the API
        const res = await fetch('/api/reviews')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            // Filter reviews for seller's products
            const sellerReviews = data.filter((r: any) =>
              r.product?.sellerId === user?.id || r.product?.storeId === user?.storeId
            )
            if (sellerReviews.length > 0) {
              setReviews(sellerReviews)
              setLoading(false)
              return
            }
          }
        }
      } catch {}
      // Fall back to mock data
      setReviews(mockReviews)
      setLoading(false)
    }
    fetchReviews()
  }, [user?.id, user?.storeId])

  const filteredReviews = useMemo(() => {
    if (ratingFilter === null) return reviews
    return reviews.filter((r) => r.rating === ratingFilter)
  }, [reviews, ratingFilter])

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  }, [reviews])

  const ratingDist = useMemo(() => {
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach((r) => { dist[r.rating] = (dist[r.rating] || 0) + 1 })
    return dist
  }, [reviews])

  const sentimentCounts = useMemo(() => {
    const counts = { positive: 0, negative: 0, neutral: 0 }
    reviews.forEach((r) => {
      if (r.rating >= 4) counts.positive++
      else if (r.rating <= 2) counts.negative++
      else counts.neutral++
    })
    return counts
  }, [reviews])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-cm-input" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-cm-primary flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-400" />
          Customer Reviews
        </h1>
        <p className="text-sm text-cm-dim mt-1">
          Monitor and manage customer feedback for your products
        </p>
      </div>

      {/* Reviews Overview */}
      <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Average Rating */}
            <div className="flex flex-col items-center justify-center min-w-[180px]">
              <p className="text-5xl font-bold text-cm-primary mb-2">{avgRating.toFixed(1)}</p>
              <Stars rating={Math.round(avgRating)} size="md" />
              <p className="text-xs text-cm-dim mt-2">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDist[star] || 0
                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                return (
                  <button
                    key={star}
                    onClick={() => setRatingFilter(ratingFilter === star ? null : star)}
                    className={`flex items-center gap-3 w-full group ${ratingFilter === star ? 'opacity-100' : 'opacity-80 hover:opacity-100'} transition-opacity`}
                  >
                    <span className="text-xs font-medium text-cm-secondary w-6 text-right">{star}</span>
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 h-2.5 bg-cm-hover rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-cm-dim w-8 text-right">{count}</span>
                  </button>
                )
              })}
            </div>

            {/* Sentiment Summary */}
            <div className="flex flex-col gap-3 min-w-[160px]">
              <p className="text-xs font-semibold text-cm-dim uppercase tracking-wide mb-1">Sentiment</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <ThumbsUp className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-cm-primary">{sentimentCounts.positive}</p>
                  <p className="text-[10px] text-cm-dim">Positive</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <MinusCircle className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-cm-primary">{sentimentCounts.neutral}</p>
                  <p className="text-[10px] text-cm-dim">Neutral</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <ThumbsDown className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-cm-primary">{sentimentCounts.negative}</p>
                  <p className="text-[10px] text-cm-dim">Negative</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-cm-dim mr-2">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRatingFilter(null)}
          className={`rounded-lg text-xs h-8 px-3 ${ratingFilter === null ? 'bg-red-500/10 text-red-400' : 'text-cm-dim hover:text-cm-secondary hover:bg-cm-hover'}`}
        >
          All ({reviews.length})
        </Button>
        {[5, 4, 3, 2, 1].map((star) => (
          <Button
            key={star}
            variant="ghost"
            size="sm"
            onClick={() => setRatingFilter(star)}
            className={`rounded-lg text-xs h-8 px-3 ${ratingFilter === star ? 'bg-red-500/10 text-red-400' : 'text-cm-dim hover:text-cm-secondary hover:bg-cm-hover'}`}
          >
            {star} Star{(ratingDist[star] || 0) !== 1 ? 's' : ''} ({ratingDist[star] || 0})
          </Button>
        ))}
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-cm-elevated border border-cm-border-subtle">
          <div className="w-20 h-20 rounded-2xl bg-cm-input border border-cm-border-subtle flex items-center justify-center mb-5">
            <MessageSquare className="w-10 h-10 text-cm-faint" />
          </div>
          <h3 className="text-lg font-semibold text-cm-secondary mb-2">
            {ratingFilter ? `No ${ratingFilter}-star reviews` : 'No reviews yet'}
          </h3>
          <p className="text-sm text-cm-dim text-center max-w-sm mb-6">
            {ratingFilter
              ? `You don't have any ${ratingFilter}-star reviews at the moment.`
              : 'When customers purchase your products, their reviews will appear here.'}
          </p>
          {ratingFilter && (
            <Button
              onClick={() => setRatingFilter(null)}
              variant="outline"
              className="border-cm-border-hover text-cm-primary hover:bg-cm-hover rounded-xl"
            >
              View All Reviews
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="bg-cm-elevated border-cm-border-subtle rounded-2xl overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {review.buyer.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-cm-secondary">{review.buyer.name}</span>
                        <span className="text-xs text-cm-faint">
                          {new Date(review.createdAt).toLocaleDateString('en-CA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <Stars rating={review.rating} />
                    </div>

                    {/* Product */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <Package className="w-3 h-3 text-cm-faint" />
                      <span className="text-xs text-cm-dim">{review.product.title}</span>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-semibold text-cm-primary mb-1">{review.title}</h4>

                    {/* Comment */}
                    <p className="text-sm text-cm-muted leading-relaxed">{review.comment}</p>

                    {/* Sentiment Badge */}
                    <div className="mt-3">
                      <Badge
                        className={`text-[10px] border ${
                          review.rating >= 4
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : review.rating <= 2
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}
                      >
                        {review.rating >= 4 ? (
                          <><ThumbsUp className="w-3 h-3 mr-1" /> Positive</>
                        ) : review.rating <= 2 ? (
                          <><ThumbsDown className="w-3 h-3 mr-1" /> Negative</>
                        ) : (
                          <><MinusCircle className="w-3 h-3 mr-1" /> Neutral</>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
