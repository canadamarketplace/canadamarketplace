'use client'
import { useState, useEffect } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus } from '@/lib/types'
import { motion } from 'framer-motion'
import { OrderTimeline } from '@/components/marketplace/OrderTimeline'
import {
  ChevronLeft, Package, Clock, MapPin, Truck, CheckCircle2,
  AlertTriangle, CreditCard, Calendar, Ban, RotateCcw, Scale, CircleDot
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RETURN_REASON_LABELS, type ReturnReason } from '@/lib/types'
import { toast } from 'sonner'

interface OrderItem {
  id: string; title: string; price: number; quantity: number; image?: string
  product?: { store: { sellerId: string; name: string } }
}

interface TimelineEvent {
  id: string
  event: string
  title: string
  description?: string | null
  metadata?: string | null
  createdAt: string
}

interface Order {
  id: string; orderNumber: string; status: string
  subtotal: number; fee: number; total: number; taxAmount?: number; taxRate?: number
  shippingAddress: string; shippingCity: string; shippingProvince: string; shippingPostalCode: string
  trackingNumber?: string; notes?: string; createdAt: string
  paidAt?: string; shippedAt?: string; deliveredAt?: string; cancelledAt?: string
  items: OrderItem[]
  disputes: Array<{ id: string; status: string }>
  timeline?: TimelineEvent[]
  buyer?: { id: string; name: string; email: string }
  seller?: { id: string; name: string; email: string }
}

const MAIN_STEPS: { status: OrderStatus; labelKey: string; icon: typeof CreditCard; getTimeField: (o: Order) => string | undefined }[] = [
  { status: 'PENDING', labelKey: 'timeline.pending', icon: Clock, getTimeField: (o) => o.createdAt },
  { status: 'PAID', labelKey: 'timeline.paid', icon: CreditCard, getTimeField: (o) => o.paidAt },
  { status: 'SHIPPED', labelKey: 'timeline.shipped', icon: Truck, getTimeField: (o) => o.shippedAt },
  { status: 'DELIVERED', labelKey: 'timeline.delivered', icon: CheckCircle2, getTimeField: (o) => o.deliveredAt },
]

const BRANCH_STATUSES: { status: OrderStatus; labelKey: string; icon: typeof Ban; color: string; getTimeField: (o: Order) => string | undefined }[] = [
  { status: 'CANCELLED', labelKey: 'timeline.cancelled', icon: Ban, color: 'text-cm-muted', getTimeField: (o) => o.cancelledAt },
  { status: 'DISPUTED', labelKey: 'timeline.disputed', icon: Scale, color: 'text-orange-400', getTimeField: (o) => o.createdAt },
  { status: 'REFUNDED', labelKey: 'timeline.refunded', icon: RotateCcw, color: 'text-cm-muted', getTimeField: (o) => o.cancelledAt },
]

function getStepStatus(
  order: Order,
  stepStatus: OrderStatus,
  idx: number
): 'completed' | 'current' | 'future' | 'branch' {
  const orderStatus = order.status as OrderStatus

  if (['CANCELLED', 'DISPUTED', 'REFUNDED'].includes(stepStatus)) {
    if (orderStatus === stepStatus) return 'branch'
    return 'future'
  }

  const mainIdx = MAIN_STEPS.findIndex(s => s.status === orderStatus)
  const isBranch = ['CANCELLED', 'DISPUTED', 'REFUNDED'].includes(orderStatus)

  if (isBranch) {
    const completedIdx = orderStatus === 'CANCELLED' || orderStatus === 'REFUNDED'
      ? MAIN_STEPS.findIndex(s => s.status === 'PENDING')
      : mainIdx >= 0 ? mainIdx : -1
    if (idx <= completedIdx) return 'completed'
    return 'future'
  }

  if (idx < mainIdx) return 'completed'
  if (idx === mainIdx) return 'current'
  return 'future'
}

function getEstimatedDelivery(shippedAt?: string): Date | null {
  if (!shippedAt) return null
  const date = new Date(shippedAt)
  let businessDays = 7
  while (businessDays > 0) {
    date.setDate(date.getDate() + 1)
    const day = date.getDay()
    if (day !== 0 && day !== 6) {
      businessDays--
    }
  }
  return date
}

export default function OrderDetailPage() {
  const { navigate, pageParams } = useNavigation()
  const { user } = useAuth()
  const { t } = useTranslation()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [trackingInput, setTrackingInput] = useState('')
  const [savingTracking, setSavingTracking] = useState(false)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  const [returnDescription, setReturnDescription] = useState('')
  const [submittingReturn, setSubmittingReturn] = useState(false)
  const [existingReturns, setExistingReturns] = useState<any[]>([])

  const fetchOrder = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
        if (data.trackingNumber) setTrackingInput(data.trackingNumber)
      } else {
        toast.error(t('orders.orderNotFound'))
        navigate('orders')
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    if (pageParams.id) fetchOrder(pageParams.id)
  }, [pageParams.id, fetchOrder])

  const handleSaveTracking = async () => {
    if (!order || !trackingInput.trim()) return
    setSavingTracking(true)
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: trackingInput.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
        toast.success(t('timeline.trackingUpdated'))
      } else {
        toast.error(t('timeline.trackingUpdateFailed'))
      }
    } catch {
      toast.error(t('timeline.trackingUpdateFailed'))
    }
    setSavingTracking(false)
  }

  const isSeller = order?.seller?.id === user?.id || order?.items?.some((item: any) => item.product?.store?.sellerId === user?.id)
  const isBuyer = order?.buyer?.id === user?.id
  const estimatedDelivery = getEstimatedDelivery(order?.shippedAt)

  // Fetch existing returns for this order
  useEffect(() => {
    if (order?.id) {
      fetch(`/api/returns?buyerId=${user?.id || ''}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setExistingReturns(data.filter((r: any) => r.order?.id === order.id)))
        .catch(() => {})
    }
  }, [order?.id, user?.id])

  const hasOpenReturn = existingReturns.some((r: any) => ["REQUESTED", "APPROVED", "RETURN_RECEIVED", "INSPECTING"].includes(r.status))
  const canRequestReturn = isBuyer && (order.status === 'DELIVERED' || order.status === 'PAID' || order.status === 'SHIPPED') && !hasOpenReturn

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-6 bg-cm-input rounded w-1/4 mb-8" />
        <div className="h-48 bg-cm-input rounded-2xl mb-6" />
        <div className="h-32 bg-cm-input rounded-2xl" />
      </div>
    )
  }

  if (!order) return null

  const canDispute = order.status === 'DELIVERED' && !order.disputes.some(d => d.status === 'OPEN' || d.status === 'UNDER_REVIEW')

  const handleSubmitReturn = async () => {
    if (!returnReason || !returnDescription.trim()) {
      toast.error('Please select a reason and provide a description')
      return
    }
    setSubmittingReturn(true)
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, reason: returnReason, description: returnDescription.trim() }),
      })
      if (res.ok) {
        toast.success('Return request submitted successfully!')
        setReturnDialogOpen(false)
        setReturnReason('')
        setReturnDescription('')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit return request')
      }
    } catch {
      toast.error('Failed to submit return request')
    }
    setSubmittingReturn(false)
  }
  const showTrackingInput = isSeller && (order.status === 'PAID' || order.status === 'SHIPPED')
  const isBranchOrder = ['CANCELLED', 'DISPUTED', 'REFUNDED'].includes(order.status)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('orders')} className="flex items-center gap-2 text-sm text-cm-dim hover:text-cm-secondary mb-6 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        {t('common.back')}
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cm-primary">{t('orders.orderDetails')} {order.orderNumber}</h1>
          <p className="text-sm text-cm-dim mt-1">
            <Clock className="w-3.5 h-3.5 inline mr-1" />
            {new Date(order.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <Badge className={`${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] || ''} text-sm border self-start`}>
          {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
        </Badge>
      </div>

      {/* Current Status Indicator - Large Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-cm-secondary flex items-center gap-2">
            <Truck className="w-4 h-4 text-red-400" />
            {t('timeline.orderProgress')}
          </h2>
          {estimatedDelivery && (order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
            <span className="text-xs text-cm-dim flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {t('timeline.estDelivery')}: {estimatedDelivery.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Order Progress Bar */}
        <div className="flex items-center justify-between relative mb-4">
          {/* Background line */}
          <div className="absolute top-5 left-8 right-8 h-0.5 bg-cm-input" />

          {/* Progress line */}
          {(() => {
            const mainIdx = MAIN_STEPS.findIndex(s => s.status === order.status)
            const completedMainSteps = isBranchOrder ? 1 : Math.max(0, mainIdx)
            const progressPct = isBranchOrder ? (completedMainSteps / (MAIN_STEPS.length - 1)) * 100 : (mainIdx / (MAIN_STEPS.length - 1)) * 100

            return (
              <motion.div
                className="absolute top-5 left-8 h-0.5 bg-gradient-to-r from-green-500 to-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, progressPct)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            )
          })()}

          {MAIN_STEPS.map((step, i) => {
            const stepState = getStepStatus(order, step.status, i)
            const Icon = step.icon
            const timeValue = step.getTimeField(order)

            return (
              <motion.div
                key={step.status}
                className="relative flex flex-col items-center z-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  stepState === 'completed'
                    ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/20'
                    : stepState === 'current'
                    ? 'bg-red-500/10 border-2 border-red-500 shadow-lg shadow-red-500/10'
                    : 'bg-cm-input border border-cm-border-hover'
                }`}>
                  {stepState === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : stepState === 'current' ? (
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Icon className="w-5 h-5 text-red-400" />
                    </motion.div>
                  ) : (
                    <Icon className="w-5 h-5 text-cm-faint" />
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium ${stepState === 'completed' ? 'text-cm-secondary' : stepState === 'current' ? 'text-red-400' : 'text-cm-faint'}`}>
                  {t(step.labelKey)}
                </span>
                {timeValue && stepState === 'completed' && (
                  <span className="text-[10px] text-cm-faint mt-0.5">
                    {new Date(timeValue).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Branch status display */}
        {isBranchOrder && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-cm-hover border border-cm-border-subtle"
          >
            <div className="flex items-center gap-2">
              {(() => {
                const branch = BRANCH_STATUSES.find(s => s.status === order.status)
                if (!branch) return null
                const BranchIcon = branch.icon
                return (
                  <>
                    <div className="w-8 h-8 rounded-full bg-cm-input border border-cm-border-hover flex items-center justify-center">
                      <BranchIcon className={`w-4 h-4 ${branch.color}`} />
                    </div>
                    <div>
                      <span className={`text-xs font-medium ${branch.color}`}>{t(branch.labelKey)}</span>
                      {order.cancelledAt && (
                        <span className="text-[10px] text-cm-faint block">
                          {new Date(order.cancelledAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </>
                )
              })()}
            </div>
          </motion.div>
        )}

        {/* Tracking Number Input (Seller) */}
        {showTrackingInput && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-cm-hover border border-cm-border-subtle"
          >
            <p className="text-xs text-cm-muted mb-2 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              {t('timeline.enterTrackingForBuyer')}
            </p>
            <div className="flex gap-2">
              <Input
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder={t('timeline.trackingPlaceholder')}
                className="flex-1 h-9 bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint rounded-lg text-sm font-mono"
              />
              <Button
                size="sm"
                onClick={handleSaveTracking}
                disabled={savingTracking || !trackingInput.trim()}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm px-4"
              >
                {savingTracking ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <CircleDot className="w-3.5 h-3.5" />
                  </motion.div>
                ) : (
                  t('common.save')
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Mobile Status Progress */}
      <div className="md:hidden rounded-2xl bg-cm-elevated border border-cm-border-subtle p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-cm-secondary flex items-center gap-2">
            <Truck className="w-4 h-4 text-red-400" />
            {t('timeline.orderProgress')}
          </h2>
          {estimatedDelivery && (order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
            <span className="text-[10px] text-cm-dim flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {t('timeline.estDelivery')}: {estimatedDelivery.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        <div className="relative pl-6">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-cm-input" />
          {(() => {
            const mainIdx = MAIN_STEPS.findIndex(s => s.status === order.status)
            const progressHeight = isBranchOrder ? '16.67%' : `${(mainIdx / (MAIN_STEPS.length - 1)) * 100}%`
            return (
              <motion.div
                className="absolute left-[11px] top-2 w-0.5 bg-gradient-to-b from-green-500 to-green-500"
                initial={{ height: 0 }}
                animate={{ height: progressHeight }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            )
          })()}

          <div className="space-y-4">
            {MAIN_STEPS.map((step, i) => {
              const stepState = getStepStatus(order, step.status, i)
              const Icon = step.icon
              const timeValue = step.getTimeField(order)

              return (
                <motion.div
                  key={step.status}
                  className="relative flex items-start gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={`absolute left-[-21px] w-6 h-6 rounded-full flex items-center justify-center ${
                    stepState === 'completed'
                      ? 'bg-gradient-to-br from-green-500 to-green-600'
                      : stepState === 'current'
                      ? 'bg-red-500/10 border-2 border-red-500'
                      : 'bg-cm-input border border-cm-border-hover'
                  }`}>
                    {stepState === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    ) : stepState === 'current' ? (
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Icon className="w-3.5 h-3.5 text-red-400" />
                      </motion.div>
                    ) : (
                      <Icon className="w-3.5 h-3.5 text-cm-faint" />
                    )}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${stepState === 'completed' ? 'text-cm-secondary' : stepState === 'current' ? 'text-red-400' : 'text-cm-faint'}`}>
                        {t(step.labelKey)}
                      </span>
                      {timeValue && stepState === 'completed' && (
                        <span className="text-[10px] text-cm-faint">
                          {new Date(timeValue).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}

            {isBranchOrder && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative flex items-center gap-3"
              >
                {(() => {
                  const branch = BRANCH_STATUSES.find(s => s.status === order.status)
                  if (!branch) return null
                  const BranchIcon = branch.icon
                  return (
                    <>
                      <div className="absolute left-[-21px] w-6 h-6 rounded-full bg-cm-input border border-cm-border-hover flex items-center justify-center">
                        <BranchIcon className={`w-3.5 h-3.5 ${branch.color}`} />
                      </div>
                      <span className={`text-xs font-medium ${branch.color}`}>{t(branch.labelKey)}</span>
                    </>
                  )
                })()}
              </motion.div>
            )}
          </div>
        </div>

        {/* Tracking Input - Mobile */}
        {showTrackingInput && (
          <div className="mt-4 p-2.5 rounded-lg bg-cm-hover border border-cm-border-subtle">
            <p className="text-[10px] text-cm-dim mb-2">{t('timeline.enterTrackingForBuyer')}</p>
            <div className="flex gap-2">
              <Input
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder={t('timeline.trackingPlaceholder')}
                className="flex-1 h-8 bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint rounded-lg text-xs font-mono"
              />
              <Button
                size="sm"
                onClick={handleSaveTracking}
                disabled={savingTracking || !trackingInput.trim()}
                className="bg-red-600 text-white rounded-lg text-xs px-3 h-8"
              >
                {t('common.save')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="mb-6">
          <OrderTimeline
            events={order.timeline}
            trackingNumber={order.trackingNumber}
            isBuyer={isBuyer}
          />
        </div>
      )}

      {/* Items */}
      <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-6 mb-6">
        <h2 className="text-sm font-semibold text-cm-secondary mb-4">{t('orders.items')}</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-cm-input flex-shrink-0">
                {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : (
                  <div className="w-full h-full flex items-center justify-center text-cm-faint"><Package className="w-6 h-6" /></div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-cm-secondary">{item.title}</p>
                <p className="text-xs text-cm-dim">{t('orders.items')}: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-cm-secondary">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <Separator className="bg-cm-hover my-4" />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-cm-dim">{t('cart.subtotal')}</span>
            <span className="text-cm-secondary">${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-cm-dim">{t('cart.marketplaceFee')}</span>
            <span className="text-cm-secondary">${order.fee.toFixed(2)}</span>
          </div>
          {order.taxAmount && order.taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-cm-dim">{t('cart.tax')} ({order.taxRate ? `${order.taxRate}%` : ''})</span>
              <span className="text-cm-secondary">${order.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <Separator className="bg-cm-hover" />
          <div className="flex justify-between">
            <span className="text-base font-semibold text-cm-secondary">{t('cart.total')}</span>
            <span className="text-lg font-bold text-cm-primary">${order.total.toFixed(2)} {t('common.currency')}</span>
          </div>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-6 mb-6">
        <h2 className="text-sm font-semibold text-cm-secondary mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> {t('checkout.shippingInfo')}
        </h2>
        <p className="text-sm text-cm-muted">{order.shippingAddress}</p>
        <p className="text-sm text-cm-muted">{order.shippingCity}, {order.shippingProvince} {order.shippingPostalCode}</p>
        {order.notes && <p className="text-xs text-cm-faint mt-2">{t('common.note')}: {order.notes}</p>}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {canRequestReturn && (
          <Button
            onClick={() => setReturnDialogOpen(true)}
            variant="outline"
            className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10 rounded-xl"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Request Return
          </Button>
        )}
        {canDispute && (
          <Button
            onClick={() => navigate('file-dispute', { orderId: order.id })}
            variant="outline"
            className="border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl"
          >
            <AlertTriangle className="w-4 h-4 mr-2" /> {t('orders.fileDispute')}
          </Button>
        )}
      </div>

      {/* Existing Returns Info */}
      {existingReturns.length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
          <p className="text-sm text-cm-secondary flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-purple-400" />
            {existingReturns.length} return{existingReturns.length > 1 ? 's' : ''} for this order
          </p>
          {existingReturns.map((r: any) => (
            <button
              key={r.id}
              onClick={() => navigate('my-returns')}
              className="block text-xs text-purple-300 hover:text-purple-200 mt-1 ml-6"
            >
              {r.rmaNumber} — {r.status}
            </button>
          ))}
        </div>
      )}

      {/* Return Request Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={(open) => { if (!open) { setReturnDialogOpen(false); setReturnReason(''); setReturnDescription('') } }}>
        <DialogContent className="bg-cm-elevated border-cm-border-hover rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cm-primary">Request Return</DialogTitle>
            <DialogDescription className="text-cm-dim">
              Submit a return request for order {order.orderNumber}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-cm-secondary mb-2 block">Reason <span className="text-red-400">*</span></label>
              <Select value={returnReason} onValueChange={setReturnReason}>
                <SelectTrigger className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl h-10">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent className="bg-cm-elevated border-cm-border-hover">
                  {(Object.entries(RETURN_REASON_LABELS) as [ReturnReason, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-cm-secondary">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-cm-secondary mb-2 block">Description <span className="text-red-400">*</span></label>
              <Textarea
                value={returnDescription}
                onChange={(e) => setReturnDescription(e.target.value)}
                placeholder="Please describe the issue with your order..."
                className="bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint min-h-[100px] rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { setReturnDialogOpen(false); setReturnReason(''); setReturnDescription('') }}
              disabled={submittingReturn}
              className="border-cm-border-hover text-cm-secondary rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReturn}
              disabled={submittingReturn || !returnReason || !returnDescription.trim()}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl"
            >
              {submittingReturn ? <CircleDot className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
              Submit Return Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {order.disputes.length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
          <p className="text-sm text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {order.disputes.length} {order.disputes.length > 1 ? 'disputes' : 'dispute'} {t('timeline.forThisOrder')}
          </p>
        </div>
      )}
    </div>
  )
}
