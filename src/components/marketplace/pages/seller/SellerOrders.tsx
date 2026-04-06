'use client'
import { useState, useEffect, useCallback } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/types'
import { OrderTimeline } from '@/components/marketplace/OrderTimeline'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Package, Truck, Loader2, ChevronDown, ChevronUp, Clock, FileText, Printer, RotateCcw } from 'lucide-react'
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
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null)
  const [refundReason, setRefundReason] = useState('')
  const [refunding, setRefunding] = useState(false)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders?sellerId=${user?.id || 'seller'}`)
      if (res.ok) setOrders(await res.json())
    } catch {}
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

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

  const handleRefund = async () => {
    if (!refundOrderId || !refundReason.trim()) return
    setRefunding(true)
    try {
      const res = await fetch(`/api/orders/${refundOrderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REFUNDED', refundReason: refundReason.trim() }),
      })
      if (res.ok) {
        toast.success('Order refunded successfully')
        setRefundOrderId(null)
        setRefundReason('')
        setExpandedId(null)
        fetchOrders()
      } else {
        toast.error('Failed to process refund')
      }
    } catch {
      toast.error('Failed to process refund')
    }
    setRefunding(false)
  }

  const handlePrintInvoice = (order: Order) => {
    const storeName = user?.storeName || 'Your Store'
    const storeAddr = user?.storeId ? '123 Market Street, Toronto, ON M5V 2K1' : ''
    const subtotal = order.total * 0.87 // rough estimate if tax not available
    const tax = order.total - subtotal
    const invoiceHtml = `
      <html><head><title>Invoice ${order.orderNumber}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px 12px; border-bottom: 1px solid #eee; text-align: left; }
        th { background: #f7f7f7; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
        .total { font-weight: bold; font-size: 1.1em; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .invoice-title { font-size: 28px; font-weight: 800; color: #dc2626; letter-spacing: -0.02em; }
        .info-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
        .info-value { font-size: 14px; color: #333; margin-bottom: 8px; }
        .section-title { font-size: 14px; font-weight: 700; margin: 24px 0 8px 0; color: #555; }
        .totals-table { margin-left: auto; width: 250px; }
        .totals-table td { padding: 6px 12px; }
        .totals-table .grand-total td { font-size: 16px; font-weight: 700; border-top: 2px solid #1a1a1a; color: #dc2626; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <div class="header">
        <div>
          <div class="invoice-title">INVOICE</div>
          <div class="info-label">Invoice Number</div>
          <div class="info-value">${order.orderNumber}</div>
          <div class="info-label">Date</div>
          <div class="info-value">${new Date(order.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700; font-size:16px; margin-bottom:4px;">${storeName}</div>
          <div style="color:#666; font-size:13px;">${storeAddr}</div>
          <div style="margin-top:12px;">
            <span style="display:inline-block; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:600; background:${order.status === 'PAID' ? '#dcfce7' : order.status === 'SHIPPED' ? '#dbeafe' : '#f3f4f6'}; color:${order.status === 'PAID' ? '#166534' : order.status === 'SHIPPED' ? '#1e40af' : '#374151'};">${order.status.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div class="section-title">Bill To:</div>
      <div style="color:#333; font-size:14px; margin-bottom:24px;">
        <strong>${order.buyer?.name || 'N/A'}</strong><br>
        ${order.shippingAddress}<br>
        ${order.shippingCity}, ${order.shippingProvince} ${order.shippingPostalCode}
      </div>

      <table>
        <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>
          ${order.items.map(item => `<tr><td>${item.title}</td><td style="text-align:center">${item.quantity}</td><td style="text-align:right">$${item.price.toFixed(2)}</td><td style="text-align:right">$${(item.price * item.quantity).toFixed(2)}</td></tr>`).join('')}
        </tbody>
      </table>

      <table class="totals-table">
        <tr><td style="color:#888">Subtotal</td><td style="text-align:right">$${subtotal.toFixed(2)}</td></tr>
        <tr><td style="color:#888">Tax (GST/HST)</td><td style="text-align:right">$${tax.toFixed(2)}</td></tr>
        <tr><td style="color:#888">Shipping</td><td style="text-align:right">$${(order.total * 0.08).toFixed(2)}</td></tr>
        <tr class="grand-total"><td>Total</td><td style="text-align:right">$${order.total.toFixed(2)}</td></tr>
      </table>

      <div class="footer">
        <p>Thank you for your purchase from ${storeName} on Canada Marketplace.</p>
        <p style="margin-top:4px;">Questions about this invoice? Contact the seller directly.</p>
      </div>
      </body></html>
    `
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(invoiceHtml)
      win.document.close()
      setTimeout(() => win.print(), 500)
    }
  }

  const handlePrintShippingSlip = (order: Order) => {
    const storeName = user?.storeName || 'Your Store'
    const storeAddr = user?.storeId ? '123 Market Street, Toronto, ON M5V 2K1' : ''
    const slipHtml = `
      <html><head><title>Shipping Slip ${order.orderNumber}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
        .shipping-label { border: 2px dashed #333; border-radius: 8px; padding: 30px; margin-bottom: 30px; }
        .shipping-label h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin: 0 0 16px 0; }
        .shipping-label .address { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
        .shipping-label .detail { font-size: 15px; color: #555; line-height: 1.6; }
        .order-info { display: flex; gap: 30px; margin-bottom: 24px; font-size: 13px; }
        .order-info .label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
        .order-info .value { font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px 12px; border-bottom: 1px solid #eee; text-align: left; }
        th { background: #f7f7f7; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
        .return-section { margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; font-size: 13px; }
        .return-section h3 { font-size: 13px; font-weight: 700; margin-bottom: 8px; }
        .return-section p { color: #666; margin: 2px 0; }
        .footer { margin-top: 30px; text-align: center; color: #ccc; font-size: 20px; letter-spacing: 0.3em; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px;">
        <div><h1 style="font-size:24px; font-weight:800; color:#1a1a1a; margin:0;">SHIPPING SLIP</h1></div>
        <div style="text-align:right; font-size:12px; color:#888;">Order: <strong style="color:#333;">${order.orderNumber}</strong><br/>Date: ${new Date(order.createdAt).toLocaleDateString()}</div>
      </div>

      <div class="shipping-label">
        <h2>Ship To</h2>
        <div class="address">${order.buyer?.name || 'N/A'}</div>
        <div class="detail">
          ${order.shippingAddress}<br>
          ${order.shippingCity}, ${order.shippingProvince} ${order.shippingPostalCode}
        </div>
      </div>

      <div class="order-info">
        <div><div class="label">Order Number</div><div class="value">${order.orderNumber}</div></div>
        <div><div class="label">Items</div><div class="value">${order.items.length}</div></div>
        <div><div class="label">Order Total</div><div class="value">$${order.total.toFixed(2)}</div></div>
        ${order.trackingNumber ? `<div><div class="label">Tracking</div><div class="value" style="color:#7c3aed;">${order.trackingNumber}</div></div>` : ''}
      </div>

      <h3 style="font-size:14px; font-weight:700; color:#555;">Package Contents</h3>
      <table>
        <thead><tr><th>#</th><th>Item</th><th style="text-align:center">Qty</th></tr></thead>
        <tbody>
          ${order.items.map((item, idx) => `<tr><td>${idx + 1}</td><td>${item.title}</td><td style="text-align:center">${item.quantity}</td></tr>`).join('')}
        </tbody>
      </table>

      <div class="return-section">
        <h3>Return Address</h3>
        <p><strong>${storeName}</strong></p>
        <p>${storeAddr}</p>
      </div>

      <div class="footer">CANADA MARKETPLACE</div>
      </body></html>
    `
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(slipHtml)
      win.document.close()
      setTimeout(() => win.print(), 500)
    }
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
    <DashboardSidebar role="seller" activeItem="my-orders" onNavigate={(page) => navigate(page)}>
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

                  {/* Invoice & Shipping Slip Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintInvoice(order)}
                      className="border-cm-border-hover text-cm-secondary hover:text-cm-primary text-xs h-8 rounded-lg gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Generate Invoice
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintShippingSlip(order)}
                      className="border-cm-border-hover text-cm-secondary hover:text-cm-primary text-xs h-8 rounded-lg gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Shipping Slip
                    </Button>
                  </div>

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

                  {(order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                    <Button
                      onClick={() => { setRefundOrderId(order.id); setRefundReason('') }}
                      size="sm"
                      className="bg-amber-600/80 hover:bg-amber-600 text-white rounded-lg text-sm"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Process Refund
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Refund Dialog */}
          <Dialog open={!!refundOrderId} onOpenChange={(open) => { if (!open) { setRefundOrderId(null); setRefundReason('') } }}>
            <DialogContent className="bg-cm-elevated border-cm-border-hover rounded-2xl max-w-md">
              <DialogHeader>
                <DialogTitle className="text-cm-primary">Process Refund</DialogTitle>
                <DialogDescription className="text-cm-dim">
                  Are you sure you want to refund this order? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-2">
                <label className="text-sm font-medium text-cm-secondary mb-2 block">Refund Reason <span className="text-red-400">*</span></label>
                <Textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Please provide a reason for this refund..."
                  className="bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint min-h-[100px] rounded-xl"
                />
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => { setRefundOrderId(null); setRefundReason('') }}
                  disabled={refunding}
                  className="border-cm-border-hover text-cm-secondary rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRefund}
                  disabled={refunding || !refundReason.trim()}
                  className="bg-amber-600/80 hover:bg-amber-600 text-white rounded-xl"
                >
                  {refunding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                  Confirm Refund
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
    </DashboardSidebar>
  )
}
