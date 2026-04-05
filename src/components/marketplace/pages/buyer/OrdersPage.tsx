'use client'
import { useState, useEffect } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/types'
import {
  Package, ChevronRight, Clock, MapPin, ShoppingBag, Eye
} from 'lucide-react'
import { toast } from 'sonner'

interface Order {
  id: string; orderNumber: string; status: string
  subtotal: number; fee: number; total: number
  shippingAddress: string; shippingCity: string; shippingProvince: string; shippingPostalCode: string
  trackingNumber?: string; createdAt: string
  items: Array<{ id: string; title: string; price: number; quantity: number; image?: string }>
  _count?: { disputes: number }
}

export default function OrdersPage() {
  const { navigate } = useNavigation()
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchOrders = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch(`/api/orders?sellerId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data || [])
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    if (user) fetchOrders()
  }, [user, statusFilter, fetchOrders])

  const getImages = (image?: string) => {
    if (image) return image
    return undefined
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Package className="w-16 h-16 text-cm-faint mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-cm-secondary mb-2">Please sign in</h1>
        <Button onClick={() => useNavigation.getState().openAuthModal('login')} className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl mt-4">Sign In</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-cm-primary">My Orders</h1>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-44 bg-cm-hover border-cm-border-hover text-cm-secondary h-10 rounded-xl">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-cm-elevated border-cm-border-hover">
            <SelectItem value="all" className="text-cm-secondary">All Orders</SelectItem>
            {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-cm-secondary">{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-cm-input" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-cm-elevated border border-cm-border-subtle">
          <ShoppingBag className="w-16 h-16 text-cm-faint mx-auto mb-4" />
          <p className="text-cm-dim">No orders yet</p>
          <Button onClick={() => navigate('browse')} className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl mt-4">Start Shopping</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders
            .filter((o) => !statusFilter || o.status === statusFilter)
            .map((order) => (
            <button
              key={order.id}
              onClick={() => navigate('order-detail', { id: order.id })}
              className="w-full text-left rounded-2xl bg-cm-elevated border border-cm-border-subtle hover:border-cm-border-hover p-5 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-cm-faint font-mono">{order.orderNumber}</p>
                  <p className="text-sm text-cm-dim mt-0.5">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(order.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <Badge className={`${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] || ''} text-xs border`}>
                  {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
                </Badge>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {order.items.slice(0, 4).map((item) => (
                  <div key={item.id} className="w-14 h-14 rounded-lg overflow-hidden bg-cm-input flex-shrink-0">
                    {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : (
                      <div className="w-full h-full flex items-center justify-center text-cm-faint"><Package className="w-5 h-5" /></div>
                    )}
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div className="w-14 h-14 rounded-lg bg-cm-input flex items-center justify-center text-cm-dim text-xs">+{order.items.length - 4}</div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-cm-dim">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {order.shippingCity}, {order.shippingProvince}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-cm-secondary">${order.total.toFixed(2)}</span>
                  <ChevronRight className="w-4 h-4 text-cm-faint group-hover:text-cm-muted group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
