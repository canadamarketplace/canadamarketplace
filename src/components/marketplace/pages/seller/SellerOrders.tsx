'use client'
import { useState, useEffect } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/types'
import { OrderTimeline } from '@/components/marketplace/OrderTimeline'
import { Package, Truck, Loader2, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface TimelineEvent {
  id: string
  event: string
  title: string
  description?: string | null
  metadata?: string | null
  createdAt: string
}

interface Order {
  id: string; orderNumber: string; status: string; total: number
  shippingAddress: string; shippingCity: string; shippingProvince: string; shippingPostalCode: string
  trackingNumber?: string; createdAt: string
  buyer: { id: string; name: string; email: string; province: string; city: string }
  items: Array<{ id: string; title: string; price: number; quantity: number; image?: string }>
  _count?: { disputes: number }
  timeline?: TimelineEvent[]
}

export default function SellerOrders() {
  const { navigate } = useNavigation()
  const { user } = useAuth()
  const { t } = useTranslation()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [trackingNum, setTrackingNum] = useState('')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders?sellerId=${user?.id || 'seller'}`)
      if (res.ok) setOrders(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, fetchOrders])

  // Fetch timeline for expanded order
  const fetchOrderTimeline = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, timeline: data.timeline || [] } : o))
      }
    } catch {}
  }

  useEffect(() => {
    if (expandedId) {
      fetchOrderTimeline(expandedId)
    }
  }, [expandedId])

  const handleShip = async (orderId: string) => {
    if (!trackingNum.trim()) {
      toast.error(t('timeline.enterTrackingError'))
      return
    }
    setUpdatingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SHIPPED', trackingNumber: trackingNum }),
      })
      if (res.ok) {
        toast.success(t('timeline.orderShipped'))
        setExpandedId(null)
        setTrackingNum('')
        fetchOrders()
      }
    } catch {}
    setUpdatingId(null)
  }

  const handleDeliver = async (orderId: string) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DELIVERED' }),
      })
      if (res.ok) {
        toast.success(t('timeline.orderDelivered'))
        fetchOrders()
        // Re-fetch timeline for expanded order
        if (expandedId === orderId) fetchOrderTimeline(orderId)
      }
    } catch {}
    setUpdatingId(null)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-cm-primary">{t('seller.orders')}</h1>
          <p className="text-sm text-cm-dim mt-1">{orders.length} {t('seller.orders').toLowerCase()}</p>
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-48 bg-cm-hover border-cm-border-hover text-cm-secondary h-10 rounded-xl">
            <SelectValue placeholder={t('orders.status')} />
          </SelectTrigger>
          <SelectContent className="bg-cm-elevated border-cm-border-hover">
            <SelectItem value="all" className="text-cm-secondary">{t('orders.status')}: {t('common.all')}</SelectItem>
            {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-cm-secondary">{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-cm-input" />)}
        </div>
      ) : orders.filter(o => !statusFilter || o.status === statusFilter).length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-cm-elevated border border-cm-border-subtle">
          <Package className="w-16 h-16 text-cm-faint mx-auto mb-4" />
          <p className="text-cm-dim">{t('orders.noOrders')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders
            .filter(o => !statusFilter || o.status === statusFilter)
            .map((order) => (
            <div key={order.id} className="rounded-2xl bg-cm-elevated border border-cm-border-subtle overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="w-full text-left p-5 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-sm font-mono text-cm-muted">{order.orderNumber}</p>
                    <Badge className={`${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] || ''} text-[10px] border`}>
                      {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-cm-secondary">{order.buyer?.name} · {order.shippingCity}, {order.shippingProvince}</p>
                  <p className="text-xs text-cm-faint mt-0.5">{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} {t('cart.items').toLowerCase()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-base font-bold text-cm-secondary">${order.total.toFixed(2)}</span>
                  {expandedId === order.id ? <ChevronUp className="w-4 h-4 text-cm-dim" /> : <ChevronDown className="w-4 h-4 text-cm-dim" />}
                </div>
              </button>

              {expandedId === order.id && (
                <div className="border-t border-cm-border-subtle p-5 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-cm-dim mb-2">{t('orders.items')}</h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-cm-input overflow-hidden flex-shrink-0">
                              {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : (
                                <div className="w-full h-full flex items-center justify-center text-cm-faint"><Package className="w-4 h-4" /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-cm-secondary truncate">{item.title}</p>
                              <p className="text-xs text-cm-faint">{t('orders.items')}: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-medium text-cm-secondary">${item.price.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-cm-dim mb-2">{t('checkout.shippingInfo')}</h4>
                      <p className="text-sm text-cm-muted">{order.shippingAddress}</p>
                      <p className="text-sm text-cm-muted">{order.shippingCity}, {order.shippingProvince} {order.shippingPostalCode}</p>
                      {order.trackingNumber && (
                        <p className="text-sm text-purple-300 mt-2 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" /> {t('orders.tracking')}: <span className="font-mono">{order.trackingNumber}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mini Timeline Preview (last 3 events) */}
                  {order.timeline && order.timeline.length > 0 && (
                    <OrderTimeline
                      events={order.timeline}
                      trackingNumber={order.trackingNumber}
                      compact
                    />
                  )}

                  {(order.status === 'PAID') && (
                    <div className="p-3 rounded-xl bg-cm-hover border border-cm-border-subtle">
                      <h4 className="text-xs font-semibold text-cm-muted mb-2">{t('timeline.markAsShipped')}</h4>
                      <div className="flex gap-2">
                        <Input
                          value={trackingNum}
                          onChange={(e) => setTrackingNum(e.target.value)}
                          placeholder={t('timeline.trackingPlaceholder')}
                          className="flex-1 bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint rounded-lg h-9 text-sm"
                        />
                        <Button
                          onClick={() => handleShip(order.id)}
                          disabled={updatingId === order.id}
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-sm"
                        >
                          {updatingId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3 mr-1" />}
                          {t('timeline.ship')}
                        </Button>
                      </div>
                    </div>
                  )}

                  {order.status === 'SHIPPED' && (
                    <Button
                      onClick={() => handleDeliver(order.id)}
                      disabled={updatingId === order.id}
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm"
                    >
                      {updatingId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      {t('timeline.markAsDelivered')}
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
