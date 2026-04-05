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
  { status: 'CANCELLED', labelKey: 'timeline.cancelled', icon: Ban, color: 'text-stone-400', getTimeField: (o) => o.cancelledAt },
  { status: 'DISPUTED', labelKey: 'timeline.disputed', icon: Scale, color: 'text-orange-400', getTimeField: (o) => o.createdAt },
  { status: 'REFUNDED', labelKey: 'timeline.refunded', icon: RotateCcw, color: 'text-stone-400', getTimeField: (o) => o.cancelledAt },
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
  const showTrackingInput = isSeller && (order.status === 'PAID' || order.status === 'SHIPPED')
  const isBranchOrder = ['CANCELLED', 'DISPUTED', 'REFUNDED'].includes(order.status)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('orders')} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 mb-6 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        {t('common.back')}
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-100">{t('orders.orderDetails')} {order.orderNumber}</h1>
          <p className="text-sm text-stone-500 mt-1">
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
        className="rounded-2xl bg-neutral-900/60 border border-white/5 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-stone-300 flex items-center gap-2">
            <Truck className="w-4 h-4 text-red-400" />
            {t('timeline.orderProgress')}
          </h2>
          {estimatedDelivery && (order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
            <span className="text-xs text-stone-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {t('timeline.estDelivery')}: {estimatedDelivery.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Order Progress Bar */}
        <div className="flex items-center justify-between relative mb-4">
          {/* Background line */}
          <div className="absolute top-5 left-8 right-8 h-0.5 bg-neutral-800" />

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
                    : 'bg-neutral-800 border border-white/10'
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
                    <Icon className="w-5 h-5 text-stone-600" />
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium ${stepState === 'completed' ? 'text-stone-200' : stepState === 'current' ? 'text-red-400' : 'text-stone-600'}`}>
                  {t(step.labelKey)}
                </span>
                {timeValue && stepState === 'completed' && (
                  <span className="text-[10px] text-stone-600 mt-0.5">
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
            className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/5"
          >
            <div className="flex items-center gap-2">
              {(() => {
                const branch = BRANCH_STATUSES.find(s => s.status === order.status)
                if (!branch) return null
                const BranchIcon = branch.icon
                return (
                  <>
                    <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center">
                      <BranchIcon className={`w-4 h-4 ${branch.color}`} />
                    </div>
                    <div>
                      <span className={`text-xs font-medium ${branch.color}`}>{t(branch.labelKey)}</span>
                      {order.cancelledAt && (
                        <span className="text-[10px] text-stone-600 block">
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
            className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/5"
          >
            <p className="text-xs text-stone-400 mb-2 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              {t('timeline.enterTrackingForBuyer')}
            </p>
            <div className="flex gap-2">
              <Input
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder={t('timeline.trackingPlaceholder')}
                className="flex-1 h-9 bg-white/5 border-white/10 text-stone-200 placeholder:text-stone-600 rounded-lg text-sm font-mono"
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
      <div className="md:hidden rounded-2xl bg-neutral-900/60 border border-white/5 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-stone-300 flex items-center gap-2">
            <Truck className="w-4 h-4 text-red-400" />
            {t('timeline.orderProgress')}
          </h2>
          {estimatedDelivery && (order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
            <span className="text-[10px] text-stone-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {t('timeline.estDelivery')}: {estimatedDelivery.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        <div className="relative pl-6">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-neutral-800" />
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
                      : 'bg-neutral-800 border border-white/10'
                  }`}>
                    {stepState === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    ) : stepState === 'current' ? (
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Icon className="w-3.5 h-3.5 text-red-400" />
                      </motion.div>
                    ) : (
                      <Icon className="w-3.5 h-3.5 text-stone-600" />
                    )}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${stepState === 'completed' ? 'text-stone-200' : stepState === 'current' ? 'text-red-400' : 'text-stone-600'}`}>
                        {t(step.labelKey)}
                      </span>
                      {timeValue && stepState === 'completed' && (
                        <span className="text-[10px] text-stone-600">
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
                      <div className="absolute left-[-21px] w-6 h-6 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center">
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
          <div className="mt-4 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
            <p className="text-[10px] text-stone-500 mb-2">{t('timeline.enterTrackingForBuyer')}</p>
            <div className="flex gap-2">
              <Input
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder={t('timeline.trackingPlaceholder')}
                className="flex-1 h-8 bg-white/5 border-white/10 text-stone-200 placeholder:text-stone-600 rounded-lg text-xs font-mono"
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
      <div className="rounded-2xl bg-neutral-900/60 border border-white/5 p-6 mb-6">
        <h2 className="text-sm font-semibold text-stone-300 mb-4">{t('orders.items')}</h2>
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
                <p className="text-xs text-stone-500">{t('orders.items')}: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-stone-200">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <Separator className="bg-white/5 my-4" />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">{t('cart.subtotal')}</span>
            <span className="text-stone-300">${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">{t('cart.marketplaceFee')}</span>
            <span className="text-stone-300">${order.fee.toFixed(2)}</span>
          </div>
          {order.taxAmount && order.taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">{t('cart.tax')} ({order.taxRate ? `${order.taxRate}%` : ''})</span>
              <span className="text-stone-300">${order.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <Separator className="bg-white/5" />
          <div className="flex justify-between">
            <span className="text-base font-semibold text-stone-200">{t('cart.total')}</span>
            <span className="text-lg font-bold text-stone-100">${order.total.toFixed(2)} {t('common.currency')}</span>
          </div>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="rounded-2xl bg-neutral-900/60 border border-white/5 p-6 mb-6">
        <h2 className="text-sm font-semibold text-stone-300 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> {t('checkout.shippingInfo')}
        </h2>
        <p className="text-sm text-stone-400">{order.shippingAddress}</p>
        <p className="text-sm text-stone-400">{order.shippingCity}, {order.shippingProvince} {order.shippingPostalCode}</p>
        {order.notes && <p className="text-xs text-stone-600 mt-2">{t('common.note')}: {order.notes}</p>}
      </div>

      {/* Actions */}
      {canDispute && (
        <Button
          onClick={() => navigate('file-dispute', { orderId: order.id })}
          variant="outline"
          className="border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl"
        >
          <AlertTriangle className="w-4 h-4 mr-2" /> {t('orders.fileDispute')}
        </Button>
      )}

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
