'use client'
import { useState, useEffect } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Star, Pencil, Trash2, Filter, StarOff, TrendingUp, MessageSquare,
  ChevronDown, Package
} from 'lucide-react'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { toast } from 'sonner'

interface Review {
  id: string
  productTitle: string
  productImage: string
  rating: number
  title: string
  comment: string
  date: string
  storeName: string
}

const mockReviews: Review[] = [
  { id: '1', productTitle: 'MacBook Pro 14" M3', productImage: 'https://picsum.photos/seed/macbook/100/100', rating: 5, title: 'Excellent laptop!', comment: 'Fast delivery, exactly as described. Very happy with the purchase. The performance is incredible and the battery life exceeds expectations.', date: '2024-01-15', storeName: 'TechHub Canada' },
  { id: '2', productTitle: 'Sony WH-1000XM5', productImage: 'https://picsum.photos/seed/sony/100/100', rating: 4, title: 'Great noise cancellation', comment: 'Sound quality is amazing. Only wish the carrying case was sturdier. Otherwise a perfect pair of headphones.', date: '2024-01-20', storeName: 'TechHub Canada' },
  { id: '3', productTitle: 'Bauer Supreme 3S Stick', productImage: 'https://picsum.photos/seed/bauer/100/100', rating: 5, title: 'Perfect stick!', comment: 'Great flex and feel. Shipped quickly from Calgary. Would recommend to any hockey player.', date: '2024-02-05', storeName: 'Great White North Sports' },
]

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${iconSize} ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-cm-faint'}`}
        />
      ))}
    </div>
  )
}

export default function BuyerReviews() {
  const { navigate } = useNavigation()
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOption, setSortOption] = useState('newest')
  const [filterRating, setFilterRating] = useState('all')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [editForm, setEditForm] = useState({ title: '', comment: '', rating: 5 })
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return
      setLoading(true)
      try {
        const res = await fetch('/api/reviews')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setReviews(data)
            setLoading(false)
            return
          }
        }
      } catch {}
      // Fallback to mock data
      setReviews(mockReviews)
      setLoading(false)
    }

    if (user) fetchReviews()
  }, [user])

  const filteredReviews = reviews
    .filter((r) => filterRating === 'all' || r.rating === parseInt(filterRating))
    .sort((a, b) => {
      if (sortOption === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sortOption === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime()
      if (sortOption === 'highest') return b.rating - a.rating
      if (sortOption === 'lowest') return a.rating - b.rating
      return 0
    })

  const totalReviews = reviews.length
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0'

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: totalReviews > 0 ? (reviews.filter((r) => r.rating === star).length / totalReviews) * 100 : 0,
  }))

  const openEdit = (review: Review) => {
    setEditingReview(review)
    setEditForm({ title: review.title, comment: review.comment, rating: review.rating })
    setEditDialogOpen(true)
  }

  const handleEditSave = () => {
    if (!editForm.title.trim() || !editForm.comment.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    if (!editingReview) return

    const updated = reviews.map((r) =>
      r.id === editingReview.id
        ? { ...r, title: editForm.title, comment: editForm.comment, rating: editForm.rating }
        : r
    )
    setReviews(updated)
    setEditDialogOpen(false)
    toast.success('Review updated successfully')
  }

  const handleDelete = (id: string) => {
    setReviews(reviews.filter((r) => r.id !== id))
    setDeleteConfirmId(null)
    toast.success('Review deleted')
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <MessageSquare className="w-16 h-16 text-cm-faint mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-cm-secondary mb-2">Please sign in</h1>
        <p className="text-sm text-cm-dim mb-6">Sign in to view and manage your reviews</p>
        <Button onClick={() => useNavigation.getState().openAuthModal('login')} className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl mt-4">Sign In</Button>
      </div>
    )
  }

  return (
    <DashboardSidebar role="buyer" activeItem="buyer-reviews" onNavigate={(page) => navigate(page)}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              <h1 className="text-2xl font-bold text-cm-primary">My Reviews</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cm-hover text-xs text-cm-muted border border-cm-border-hover">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </span>
            </div>
            <p className="text-sm text-cm-dim mt-1">Manage your product reviews and ratings</p>
          </div>
          <Button
            onClick={() => navigate('browse')}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl h-10 px-5 shadow-lg shadow-red-500/20"
          >
            <Package className="w-4 h-4 mr-2" />
            Write a Review
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Average Rating */}
          <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <p className="text-xs text-cm-dim font-medium">Average Rating</p>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-cm-primary">{avgRating}</span>
              <StarRating rating={Math.round(parseFloat(avgRating))} size="md" />
            </div>
            <p className="text-xs text-cm-faint mt-1">Based on {totalReviews} reviews</p>
          </div>

          {/* Rating Distribution */}
          <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-5 sm:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-cm-muted" />
              <p className="text-xs text-cm-dim font-medium">Rating Distribution</p>
            </div>
            <div className="space-y-1.5">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterRating(filterRating === String(star) ? 'all' : String(star))}
                    className={`text-xs font-medium w-3 transition-colors ${
                      filterRating === String(star) ? 'text-amber-400' : 'text-cm-dim'
                    }`}
                  >
                    {star}
                  </button>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                  <div className="flex-1 h-2 rounded-full bg-cm-hover overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-cm-faint w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cm-muted" />
            <span className="text-sm text-cm-dim">Filter:</span>
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="w-36 bg-cm-hover border-cm-border-hover text-cm-secondary h-9 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-cm-elevated border-cm-border-hover">
                <SelectItem value="all" className="text-cm-secondary">All Ratings</SelectItem>
                <SelectItem value="5" className="text-cm-secondary">5 Stars</SelectItem>
                <SelectItem value="4" className="text-cm-secondary">4 Stars</SelectItem>
                <SelectItem value="3" className="text-cm-secondary">3 Stars</SelectItem>
                <SelectItem value="2" className="text-cm-secondary">2 Stars</SelectItem>
                <SelectItem value="1" className="text-cm-secondary">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <ChevronDown className="w-4 h-4 text-cm-muted" />
            <span className="text-sm text-cm-dim">Sort:</span>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-36 bg-cm-hover border-cm-border-hover text-cm-secondary h-9 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-cm-elevated border-cm-border-hover">
                <SelectItem value="newest" className="text-cm-secondary">Newest First</SelectItem>
                <SelectItem value="oldest" className="text-cm-secondary">Oldest First</SelectItem>
                <SelectItem value="highest" className="text-cm-secondary">Highest Rated</SelectItem>
                <SelectItem value="lowest" className="text-cm-secondary">Lowest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-cm-input" />
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-cm-elevated border border-cm-border-subtle">
            <div className="w-20 h-20 rounded-full bg-cm-hover flex items-center justify-center mx-auto mb-6">
              <StarOff className="w-10 h-10 text-cm-faint" />
            </div>
            <h2 className="text-lg font-semibold text-cm-secondary mb-2">
              {filterRating !== 'all' ? 'No reviews match this filter' : 'No reviews yet'}
            </h2>
            <p className="text-sm text-cm-dim mb-6">
              {filterRating !== 'all'
                ? 'Try changing the filter to see more reviews'
                : 'Start reviewing products you\'ve purchased'}
            </p>
            <Button
              onClick={() => navigate('browse')}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl"
            >
              <Package className="w-4 h-4 mr-2" />
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl bg-cm-elevated border border-cm-border-subtle hover:border-cm-border-hover p-5 transition-all group"
              >
                <div className="flex gap-4">
                  {/* Product Thumbnail */}
                  <button
                    onClick={() => navigate('product-detail', { id: review.id })}
                    className="w-20 h-20 rounded-xl overflow-hidden bg-cm-input flex-shrink-0 hover:ring-2 hover:ring-red-500/20 transition-all"
                  >
                    <img
                      src={review.productImage}
                      alt={review.productTitle}
                      className="w-full h-full object-cover"
                    />
                  </button>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-cm-secondary truncate">{review.productTitle}</h3>
                        <p className="text-xs text-cm-dim mt-0.5">by {review.storeName}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(review)}
                          className="h-8 w-8 text-cm-dim hover:text-blue-400 hover:bg-blue-500/10 rounded-lg"
                          title="Edit review"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmId(review.id)}
                          className="h-8 w-8 text-cm-dim hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                          title="Delete review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-2">
                      <StarRating rating={review.rating} />
                    </div>

                    <h4 className="text-sm font-medium text-cm-primary mt-2">{review.title}</h4>
                    <p className="text-sm text-cm-dim mt-1 leading-relaxed line-clamp-3">{review.comment}</p>

                    <p className="text-xs text-cm-faint mt-3">
                      {new Date(review.date).toLocaleDateString('en-CA', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Review Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-cm-elevated border-cm-border-subtle text-cm-primary sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-cm-primary">Edit Review</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Rating */}
              <div>
                <Label className="text-xs text-cm-dim mb-1.5 block">Your Rating</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setEditForm({ ...editForm, rating: star })}
                      className="p-0.5 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= editForm.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-cm-faint'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm text-cm-dim ml-2">{editForm.rating}/5</span>
                </div>
              </div>

              {/* Title */}
              <div>
                <Label className="text-xs text-cm-dim mb-1.5 block">Review Title *</Label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Summarize your experience"
                  className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl h-10"
                />
              </div>

              {/* Comment */}
              <div>
                <Label className="text-xs text-cm-dim mb-1.5 block">Your Review *</Label>
                <Textarea
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                  placeholder="Share your thoughts about this product"
                  rows={4}
                  className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setEditDialogOpen(false)}
                className="text-cm-dim hover:text-cm-secondary hover:bg-cm-hover rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSave}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null) }}>
          <DialogContent className="bg-cm-elevated border-cm-border-subtle text-cm-primary sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-cm-primary">Delete Review</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-cm-dim py-2">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setDeleteConfirmId(null)}
                className="text-cm-dim hover:text-cm-secondary hover:bg-cm-hover rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                className="bg-red-600 hover:bg-red-500 text-white rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardSidebar>
  )
}
