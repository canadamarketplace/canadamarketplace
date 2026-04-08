'use client'
import { useState, useEffect, useCallback } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RETURN_STATUS_LABELS, RETURN_STATUS_COLORS, RETURN_REASON_LABELS, type ReturnStatus, type ReturnReason } from '@/lib/types'
import {
  RotateCcw, Package, ChevronDown, ChevronUp, Clock, ShoppingCart,
  ExternalLink, Loader2, PackageOpen
} from 'lucide-react'
import { toast } from 'sonner'

interface ReturnItem {
  id: string; title: string; price: number; quantity: number; image?: string
}

interface ReturnRecord {
  id: string; rmaNumber: string; reason: string; description: string
  status: string; refundAmount?: number | null; refundMethod?: string | null
  returnShippingMethod?: string | null; trackingNumber?: string | null
  sellerNotes?: string | null; adminNotes?: string | null
  approvedAt?: string | null; rejectedAt?: string | null; receivedAt?: string | null
  refundedAt?: string | null; closedAt?: string | null; createdAt: string
  order: { id: string; orderNumber: string; status: string; items: ReturnItem[] }
  buyer: { id: string; name: string; email: string }
  seller: { id: string; name: string; email: string }
}

const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'REQUESTED', label: 'Requested' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'RETURN_RECEIVED', label: 'Received' },
  { value: 'INSPECTING', label: 'Inspecting' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CLOSED', label: 'Closed' },
]

export default function MyReturnsPage() {
  const { navigate } = useNavigation()
  const { user } = useAuth()
  const [returns, setReturns] = useState<ReturnRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchReturns = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/returns?buyerId=${user?.id || ''}`)
      if (res.ok) setReturns(await res.json())
    } catch {}
    setLoading(false)
  }, [user])

  useEffect(() => { fetchReturns() }, [fetchReturns])

  const filteredReturns = activeTab === 'all'
    ? returns
    : returns.filter((r) => r.status === activeTab)

  return (
    <DashboardSidebar role="buyer" activeItem="my-returns" onNavigate={(page) => navigate(page)}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-cm-primary">My Returns</h1>
          <p className="text-sm text-cm-dim mt-1">{returns.length} return requests</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.value
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-cm-hover text-cm-dim border border-cm-border-subtle hover:text-cm-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-cm-input" />
            ))}
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-cm-elevated border border-cm-border-subtle">
            <PackageOpen className="w-16 h-16 text-cm-faint mx-auto mb-4" />
            <p className="text-cm-dim">No returns found</p>
            {activeTab !== 'all' && (
              <button onClick={() => setActiveTab('all')} className="text-sm text-red-400 hover:text-red-300 mt-2">
                View all returns
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReturns.map((ret) => (
              <div key={ret.id} className="rounded-2xl bg-cm-elevated border border-cm-border-subtle overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === ret.id ? null : ret.id)}
                  className="w-full text-left p-5 flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className="text-sm font-mono text-cm-muted">{ret.rmaNumber}</p>
                      <Badge className={`${RETURN_STATUS_COLORS[ret.status as ReturnStatus] || ''} text-[10px] border`}>
                        {RETURN_STATUS_LABELS[ret.status as ReturnStatus] || ret.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-cm-secondary">
                      {RETURN_REASON_LABELS[ret.reason as ReturnReason] || ret.reason}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-cm-dim flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3" />
                        {ret.order.orderNumber}
                      </p>
                      <p className="text-xs text-cm-faint flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ret.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    {ret.refundAmount != null && (
                      <span className="text-sm font-semibold text-cm-secondary">
                        ${ret.refundAmount.toFixed(2)}
                      </span>
                    )}
                    {expandedId === ret.id
                      ? <ChevronUp className="w-4 h-4 text-cm-dim" />
                      : <ChevronDown className="w-4 h-4 text-cm-dim" />
                    }
                  </div>
                </button>

                {expandedId === ret.id && (
                  <div className="border-t border-cm-border-subtle p-5 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Product Info */}
                      <div>
                        <h4 className="text-xs font-semibold text-cm-dim mb-2">Order Items</h4>
                        <div className="space-y-2">
                          {ret.order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-cm-input overflow-hidden flex-shrink-0">
                                {item.image ? (
                                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-cm-faint">
                                    <Package className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-cm-secondary truncate">{item.title}</p>
                                <p className="text-xs text-cm-faint">{item.quantity} x ${item.price.toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Return Details */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-semibold text-cm-dim mb-1">Description</h4>
                          <p className="text-sm text-cm-muted">{ret.description}</p>
                        </div>
                        {ret.returnShippingMethod && (
                          <div>
                            <h4 className="text-xs font-semibold text-cm-dim mb-1">Return Shipping</h4>
                            <p className="text-sm text-cm-muted">{ret.returnShippingMethod.replace(/_/g, ' ')}</p>
                          </div>
                        )}
                        {ret.refundMethod && (
                          <div>
                            <h4 className="text-xs font-semibold text-cm-dim mb-1">Refund Method</h4>
                            <p className="text-sm text-cm-muted">{ret.refundMethod.replace(/_/g, ' ')}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Seller Notes */}
                    {ret.sellerNotes && (
                      <div className="p-3 rounded-xl bg-cm-hover border border-cm-border-subtle">
                        <p className="text-xs font-semibold text-cm-muted mb-1">Seller Notes</p>
                        <p className="text-sm text-cm-dim">{ret.sellerNotes}</p>
                      </div>
                    )}

                    {/* Timeline Dates */}
                    <div className="flex flex-wrap gap-4 text-xs text-cm-dim">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Created: {new Date(ret.createdAt).toLocaleDateString()}
                      </span>
                      {ret.approvedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Approved: {new Date(ret.approvedAt).toLocaleDateString()}
                        </span>
                      )}
                      {ret.receivedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Received: {new Date(ret.receivedAt).toLocaleDateString()}
                        </span>
                      )}
                      {ret.refundedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Refunded: {new Date(ret.refundedAt).toLocaleDateString()}
                        </span>
                      )}
                      {ret.rejectedAt && (
                        <span className="flex items-center gap-1 text-red-400">
                          <Clock className="w-3 h-3" /> Rejected: {new Date(ret.rejectedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* View Order Button */}
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('order-detail', { id: ret.order.id })}
                        className="border-cm-border-hover text-cm-secondary hover:text-cm-primary text-xs h-8 rounded-lg gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Order {ret.order.orderNumber}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardSidebar>
  )
}
