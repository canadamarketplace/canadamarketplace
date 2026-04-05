'use client'
import { useState, useEffect } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  AlertTriangle, ChevronLeft, Loader2, Shield, Package
} from 'lucide-react'
import { toast } from 'sonner'

export default function FileDisputePage() {
  const { navigate, pageParams } = useNavigation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [sellerId, setSellerId] = useState<string>('')

  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')

  // Fetch order to get the real sellerId
  useEffect(() => {
    if (pageParams.id) {
      fetch(`/api/orders/${pageParams.id}`)
        .then(res => res.json())
        .then(order => {
          if (order.items?.[0]?.product?.store?.sellerId) {
            setSellerId(order.items[0].product.store.sellerId)
          } else {
            // Fallback: try to get sellerId from store
            fetch(`/api/products/${order.items?.[0]?.productId}`)
              .then(r => r.json())
              .then(product => {
                if (product.store?.seller?.id) setSellerId(product.store.seller.id)
              })
              .catch(() => {})
          }
        })
        .catch(() => {})
    }
  }, [pageParams.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason || !description) {
      toast.error('Please fill all fields')
      return
    }
    if (!sellerId) {
      toast.error('Could not determine seller. Please try again.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: pageParams.id,
          buyerId: user?.id,
          sellerId,
          reason,
          description,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        toast.success('Dispute filed successfully')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to file dispute')
      }
    } catch {
      toast.error('Failed to file dispute')
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-red-300" />
        </div>
        <h1 className="text-2xl font-bold text-cm-primary mb-2">Dispute Filed</h1>
        <p className="text-cm-muted mb-6">Your dispute has been submitted. Our team will review it and get back to you within 48 hours.</p>
        <Button onClick={() => navigate('orders')} className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl">
          View My Orders
        </Button>
      </div>
    )
  }

  const reasons = [
    'Item not received',
    'Item significantly not as described',
    'Item arrived damaged',
    'Seller not responding',
    'Wrong item received',
    'Other',
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('order-detail', { id: pageParams.id })} className="flex items-center gap-2 text-sm text-cm-dim hover:text-cm-secondary mb-6 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Order
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-300" />
          </div>
          <h1 className="text-2xl font-bold text-cm-primary">File a Dispute</h1>
        </div>
        <p className="text-sm text-cm-dim">We take disputes seriously. Please provide detailed information about the issue.</p>
      </div>

      <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-cm-secondary text-xs mb-2 block">Reason for Dispute *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl h-11">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent className="bg-cm-elevated border-cm-border-hover">
                {reasons.map((r) => (
                  <SelectItem key={r} value={r} className="text-cm-secondary">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-cm-secondary text-xs mb-2 block">Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the issue in detail. Include any relevant information such as communication with the seller, photos of damage, etc."
              className="bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint rounded-xl min-h-[160px]"
              required
            />
          </div>

          <Separator className="bg-cm-hover" />

          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <p className="text-xs text-blue-300 flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Your dispute will be reviewed by our team within 48 hours. The payment is currently held in escrow and will not be released until the dispute is resolved.</span>
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('order-detail', { id: pageParams.id })} className="border-cm-border-hover text-cm-secondary rounded-xl flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl h-11">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
              Submit Dispute
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
