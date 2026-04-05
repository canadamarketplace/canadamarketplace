'use client'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n'
import {
  Package, CreditCard, Truck, CheckCircle2, XCircle, AlertTriangle,
  Clock, Copy, Check
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface TimelineEvent {
  id: string
  event: string
  title: string
  description?: string | null
  metadata?: string | null
  createdAt: string
}

const EVENT_CONFIG: Record<string, {
  icon: typeof Package
  color: string
  dotColor: string
  bg: string
}> = {
  ORDER_PLACED: { icon: Package, color: 'text-blue-400', dotColor: 'bg-blue-500', bg: 'bg-blue-500/10' },
  PAYMENT_RECEIVED: { icon: CreditCard, color: 'text-green-400', dotColor: 'bg-green-500', bg: 'bg-green-500/10' },
  PROCESSING: { icon: Clock, color: 'text-yellow-400', dotColor: 'bg-yellow-500', bg: 'bg-yellow-500/10' },
  SHIPPED: { icon: Truck, color: 'text-purple-400', dotColor: 'bg-purple-500', bg: 'bg-purple-500/10' },
  OUT_FOR_DELIVERY: { icon: Truck, color: 'text-orange-400', dotColor: 'bg-orange-500', bg: 'bg-orange-500/10' },
  DELIVERED: { icon: CheckCircle2, color: 'text-green-400', dotColor: 'bg-green-500', bg: 'bg-green-500/10' },
  CANCELLED: { icon: XCircle, color: 'text-red-400', dotColor: 'bg-red-500', bg: 'bg-red-500/10' },
  REFUNDED: { icon: AlertTriangle, color: 'text-stone-400', dotColor: 'bg-stone-500', bg: 'bg-stone-500/10' },
  DISPUTE_OPENED: { icon: AlertTriangle, color: 'text-orange-400', dotColor: 'bg-orange-500', bg: 'bg-orange-500/10' },
  DISPUTE_RESOLVED: { icon: CheckCircle2, color: 'text-green-400', dotColor: 'bg-green-500', bg: 'bg-green-500/10' },
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatFullTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface OrderTimelineProps {
  events: TimelineEvent[]
  trackingNumber?: string
  isBuyer?: boolean
  compact?: boolean
}

export function OrderTimeline({ events, trackingNumber, isBuyer, compact = false }: OrderTimelineProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const displayEvents = compact ? events.slice(0, 3) : events

  const handleCopyTracking = () => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber)
      setCopied(true)
      toast.success(t('timeline.trackingCopied'))
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (events.length === 0) return null

  return (
    <div className={compact ? '' : 'rounded-2xl bg-neutral-900/60 border border-white/5 p-6'}>
      {/* Header */}
      <h2 className={`text-sm font-semibold text-stone-300 mb-5 flex items-center gap-2 ${compact ? 'mb-3' : ''}`}>
        <Clock className="w-4 h-4 text-red-400" />
        {compact ? t('timeline.recentActivity') : t('timeline.orderTimeline')}
      </h2>

      {/* Tracking Number Display */}
      {trackingNumber && !compact && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-3 rounded-xl bg-white/[0.02] border border-white/5"
        >
          <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-1.5">
            {t('timeline.trackingNumber')}
          </p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-mono text-purple-300 break-all">{trackingNumber}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleCopyTracking}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-stone-300 hover:bg-white/10 transition-all"
              >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                {copied ? t('timeline.copied') : t('timeline.copy')}
              </button>
              {isBuyer && (
                <a
                  href={`https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${encodeURIComponent(trackingNumber)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 hover:bg-purple-500/20 transition-all"
                >
                  <Truck className="w-3 h-3" />
                  {t('timeline.trackPackage')}
                </a>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-neutral-800" />

        <div className="space-y-0">
          {displayEvents.map((event, index) => {
            const config = EVENT_CONFIG[event.event] || EVENT_CONFIG.ORDER_PLACED
            const Icon = config.icon
            const isFirst = index === 0

            return (
              <motion.div
                key={event.id}
                className="relative flex items-start gap-4 pb-4 last:pb-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.3 }}
              >
                {/* Dot */}
                <div className={`relative z-10 w-[30px] h-[30px] rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 border border-white/5`}>
                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                  {isFirst && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-red-500/40"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${isFirst ? 'text-stone-100' : 'text-stone-300'}`}>
                        {event.title}
                      </p>
                      {event.description && (
                        <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                          {event.description}
                        </p>
                      )}
                      {/* Tracking info from metadata */}
                      {event.event === 'SHIPPED' && (() => {
                        try {
                          const meta = event.metadata ? JSON.parse(event.metadata) : {}
                          if (meta.trackingNumber) {
                            return (
                              <p className="text-xs text-purple-400 mt-1 flex items-center gap-1">
                                <Truck className="w-3 h-3" />
                                <span className="font-mono">{meta.trackingNumber}</span>
                              </p>
                            )
                          }
                        } catch {}
                        return null
                      })()}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-[10px] ${isFirst ? 'text-stone-400' : 'text-stone-600'}`}>
                        {formatRelativeTime(event.createdAt)}
                      </p>
                      <p className="text-[10px] text-stone-700">
                        {formatFullTime(event.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Compact: show more indicator */}
        {compact && events.length > 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative flex items-center gap-4 pl-0 pt-1"
          >
            <div className="relative z-10 w-[30px] h-[30px] rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-medium text-stone-500">+{events.length - 3}</span>
            </div>
            <span className="text-xs text-stone-500 pt-1">
              {events.length - 3} more {events.length - 3 === 1 ? 'event' : 'events'}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  )
}
