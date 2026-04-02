'use client'
import { useState, useEffect } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/types'
import {
  ChevronLeft, Package, Clock, MapPin, Truck, CheckCircle2,
  Shield, AlertTriangle, CreditCard, Eye
} from 'lucide-react'
import { toast } from 'sonner'

interface OrderItem {
  id: string; title: string; price: number; quantity: number; image?: string
  product?: { store: { sellerId: string; name: string } }
}

interface Order {
  id: string; orderNumber: string; status: string
  subtotal: number; fee: number; total: number
  shippingAddress: string; shippingCity: string; shippingProvince: string; shippingPostalCode: string
  trackingNumber?: string; notes?: string; createdAt: string
  paidAt?: string; shippedAt?: string; deliveredAt?: string; cancelledAt?: string
  items: OrderItem[]
  disputes: Array<{ id: string; status: string }>
  buyer?: { id: string; name: string; email: string }
}

export default function OrderDetailPage() {
  const { navigate, pageParams } = useNavigation()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOrder = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${id}`)
      if (res.ok) {
        setOrder(await res.json())
      } else {
        toast.error('Order not found')
        navigate('orders')
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    if (pageParams.id) fetchOrder(pageParams.id)
  }, [pageParams.id, fetchOrder])

  const statusSteps = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED']
  const currentStepIdx = statusSteps.indexOf(order?.status || '')

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-6 bg-neutral-800 rounded w-1/4 mb-8" />
        <div className="h-48 bg-neutral-800 rounded-2xl mb-6" />
        <div className="h-32 bg-neutral-800 rounded-2xl" />
      </div>
    )
  }

  if (!order) return null

  const canDispute = order.status === 'DELIVERED' && !order.disputes.some(d => d.status === 'OPEN' || d.status === 'UNDER_REVIEW')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('orders')} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 mb-6 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Orders
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-100">Order {order.orderNumber}</h1>
          <p className="text-sm text-stone-500 mt-1">
            <Clock className="w-3.5 h-3.5 inline mr-1" />
            {new Date(order.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <Badge className={`${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] || ''} text-sm border self-start`}>
          {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
        </Badge>
      </div>

      {/* Status Timeline */}
      {(order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED' || order.status === 'PENDING') && (
        <div className="rounded-2xl bg-neutral-900/60 border border-white/5 p-6 mb-6">
          <h2 className="text-sm font-semibold text-stone-300 mb-4">Order Status</h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-8 right-8 h-0.5 bg-neutral-800" />
            <div
              className="absolute top-5 left-8 h-0.5 bg-gradient-to-r from-red-500 to-red-500 transition-all duration-500"
              style={{ width: `${Math.max(0, currentStepIdx / (statusSteps.length - 1)) * 100}%` }}
            />
            {[
              { label: 'Paid', icon: CreditCard, done: ['PAID', 'SHIPPED', 'DELIVERED'].includes(order.status) },
              { label: 'Shipped', icon: Truck, done: ['SHIPPED', 'DELIVERED'].includes(order.status) },
              { label: 'Delivered', icon: CheckCircle2, done: order.status === 'DELIVERED' },
            ].map((step, i) => (
              <div key={step.label} className="relative flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.done ? 'bg-gradient-to-br from-red-500 to-red-500' : 'bg-neutral-800 border border-white/10'
                }`}>
                  <step.icon className={`w-5 h-5 ${step.done ? 'text-white' : 'text-stone-600'}`} />
                </div>
                <span className={`text-xs mt-2 ${step.done ? 'text-stone-200' : 'text-stone-600'}`}>{step.label}</span>
              </div>
            ))}
          </div>
          {order.trackingNumber && (
            <div className="mt-4 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Tracking: <span className="font-mono">{order.trackingNumber}</span></span>
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="rounded-2xl bg-neutral-900/60 border border-white/5 p-6 mb-6">
        <h2 className="text-sm font-semibold text-stone-300 mb-4">Items</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0">
                {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : (
                  <div className="w-full h-full flex items-center justify-center text-stone-600"><Package className="w-6 h-6" /></div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-200">{item.title}</p>
                <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-stone-200">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <Separator className="bg-white/5 my-4" />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Subtotal</span>
            <span className="text-stone-300">${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Marketplace fee</span>
            <span className="text-stone-300">${order.fee.toFixed(2)}</span>
          </div>
          <Separator className="bg-white/5" />
          <div className="flex justify-between">
            <span className="text-base font-semibold text-stone-200">Total</span>
            <span className="text-lg font-bold text-stone-100">${order.total.toFixed(2)} CAD</span>
          </div>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="rounded-2xl bg-neutral-900/60 border border-white/5 p-6 mb-6">
        <h2 className="text-sm font-semibold text-stone-300 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Shipping Address
        </h2>
        <p className="text-sm text-stone-400">{order.shippingAddress}</p>
        <p className="text-sm text-stone-400">{order.shippingCity}, {order.shippingProvince} {order.shippingPostalCode}</p>
        {order.notes && <p className="text-xs text-stone-600 mt-2">Notes: {order.notes}</p>}
      </div>

      {/* Actions */}
      {canDispute && (
        <Button
          onClick={() => navigate('file-dispute', { orderId: order.id })}
          variant="outline"
          className="border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl"
        >
          <AlertTriangle className="w-4 h-4 mr-2" /> File a Dispute
        </Button>
      )}

      {order.disputes.length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
          <p className="text-sm text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {order.disputes.length} dispute{order.disputes.length > 1 ? 's' : ''} filed for this order
          </p>
        </div>
      )}
    </div>
  )
}
