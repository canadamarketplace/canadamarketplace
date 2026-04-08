'use client'
import { useState, useEffect, useCallback } from 'react'
import { useNavigation } from '@/lib/store'
import AdminAuthGuard from './AdminAuthGuard'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { RETURN_STATUS_LABELS, RETURN_STATUS_COLORS, RETURN_REASON_LABELS, type ReturnStatus, type ReturnReason } from '@/lib/types'
import {
  RotateCcw, Package, ChevronDown, ChevronUp, Clock, Loader2,
  Save, Search, PackageOpen, TrendingUp, AlertCircle, CheckCircle2
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
  order: { id: string; orderNumber: string; status: string; subtotal: number; items: ReturnItem[] }
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

export default function AdminReturns() {
  const { navigate } = useNavigation()
  const [returns, setReturns] = useState<ReturnRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Admin update form
  const [newStatus, setNewStatus] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [refundAmount, setRefundAmount] = useState('')

  const fetchReturns = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/returns?admin=true`)
      if (res.ok) setReturns(await res.json())
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchReturns() }, [fetchReturns])

  const handleUpdate = async (returnId: string) => {
    if (!newStatus) { toast.error('Please select a status'); return }
    setUpdatingId(returnId)
    try {
      const body: any = { status: newStatus }
      if (adminNotes) body.adminNotes = adminNotes
      if (newStatus === 'REFUNDED' || newStatus === 'PARTIAL_REFUND') {
        if (refundAmount) body.refundAmount = parseFloat(refundAmount)
        if (!refundAmount && newStatus === 'REFUNDED') {
          const ret = returns.find(r => r.id === returnId)
          if (ret) body.refundAmount = ret.order.subtotal
        }
        body.refundMethod = 'ORIGINAL'
      }

      const res = await fetch(`/api/returns/${returnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success('Return updated')
        setExpandedId(null)
        setNewStatus('')
        setAdminNotes('')
        setRefundAmount('')
        fetchReturns()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update')
      }
    } catch {
      toast.error('Failed to update')
    }
    setUpdatingId(null)
  }

  // Stats
  const stats = {
    total: returns.length,
    requested: returns.filter(r => r.status === 'REQUESTED').length,
    approved: returns.filter(r => r.status === 'APPROVED').length,
    refunded: returns.filter(r => ['REFUNDED', 'PARTIAL_REFUND'].includes(r.status)).length,
  }

  // Filter
  const filteredReturns = returns
    .filter(r => activeTab === 'all' || r.status === activeTab)
    .filter(r => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        r.rmaNumber.toLowerCase().includes(q) ||
        r.buyer.name.toLowerCase().includes(q) ||
        r.buyer.email.toLowerCase().includes(q) ||
        r.seller.name.toLowerCase().includes(q) ||
        r.seller.email.toLowerCase().includes(q) ||
        r.order.orderNumber.toLowerCase().includes(q)
      )
    })

  return (
    <AdminAuthGuard>
      <DashboardSidebar role="admin" activeItem="admin-returns" onNavigate={(page) => navigate(page)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-cm-primary">Returns / RMA Management</h1>
              <p className="text-sm text-cm-dim mt-1">{returns.length} total returns</p>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="rounded-xl bg-cm-elevated border border-cm-border-subtle p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-cm-dim" />
                <span className="text-xs text-cm-dim">Total Returns</span>
              </div>
              <p className="text-xl font-bold text-cm-secondary">{stats.total}</p>
            </div>
            <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/10 p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-cm-dim">Pending</span>
              </div>
              <p className="text-xl font-bold text-yellow-400">{stats.requested}</p>
            </div>
            <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-cm-dim">Approved</span>
              </div>
              <p className="text-xl font-bold text-blue-400">{stats.approved}</p>
            </div>
            <div className="rounded-xl bg-green-500/5 border border-green-500/10 p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-xs text-cm-dim">Refunded</span>
              </div>
              <p className="text-xl font-bold text-green-400">{stats.refunded}</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-faint" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by RMA#, buyer, seller, or order #..."
                className="pl-9 bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint rounded-xl h-10"
              />
            </div>
          </div>

          {/* Status Tabs */}
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
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-cm-input" />)}
            </div>
          ) : filteredReturns.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-cm-elevated border border-cm-border-subtle">
              <PackageOpen className="w-16 h-16 text-cm-faint mx-auto mb-4" />
              <p className="text-cm-dim">No returns found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReturns.map((ret) => (
                <div key={ret.id} className="rounded-2xl bg-cm-elevated border border-cm-border-subtle overflow-hidden">
                  <button
                    onClick={() => setExpandedId(expandedId === ret.id ? null : ret.id)}
                    className="w-full text-left p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <p className="text-sm font-mono text-cm-muted">{ret.rmaNumber}</p>
                          <Badge className={`${RETURN_STATUS_COLORS[ret.status as ReturnStatus] || ''} text-[10px] border`}>
                            {RETURN_STATUS_LABELS[ret.status as ReturnStatus] || ret.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-cm-secondary">
                          {RETURN_REASON_LABELS[ret.reason as ReturnReason] || ret.reason}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-cm-dim flex-wrap">
                          <span>{ret.buyer.name}</span>
                          <span className="text-cm-faint">vs</span>
                          <span>{ret.seller.name}</span>
                          <span className="text-cm-faint">·</span>
                          <span>{ret.order.orderNumber}</span>
                          <span className="text-cm-faint">·</span>
                          <span>{new Date(ret.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {ret.refundAmount != null && (
                          <span className="text-sm font-semibold text-cm-secondary">${ret.refundAmount.toFixed(2)}</span>
                        )}
                        {expandedId === ret.id ? <ChevronUp className="w-4 h-4 text-cm-dim" /> : <ChevronDown className="w-4 h-4 text-cm-dim" />}
                      </div>
                    </div>
                  </button>

                  {expandedId === ret.id && (
                    <div className="border-t border-cm-border-subtle p-5 space-y-4">
                      <div className="grid sm:grid-cols-3 gap-4">
                        {/* Buyer & Seller */}
                        <div>
                          <h4 className="text-xs font-semibold text-cm-dim mb-2">Parties</h4>
                          <p className="text-sm text-cm-secondary">Buyer: {ret.buyer.name}</p>
                          <p className="text-xs text-cm-faint">{ret.buyer.email}</p>
                          <p className="text-sm text-cm-secondary mt-2">Seller: {ret.seller.name}</p>
                          <p className="text-xs text-cm-faint">{ret.seller.email}</p>
                        </div>

                        {/* Product */}
                        <div>
                          <h4 className="text-xs font-semibold text-cm-dim mb-2">Products</h4>
                          {ret.order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-2 mb-1">
                              <div className="w-8 h-8 rounded-lg bg-cm-input overflow-hidden flex-shrink-0">
                                {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : (
                                  <div className="w-full h-full flex items-center justify-center text-cm-faint"><Package className="w-3 h-3" /></div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-cm-secondary truncate">{item.title}</p>
                                <p className="text-[10px] text-cm-faint">{item.quantity}x ${item.price.toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Details */}
                        <div>
                          <h4 className="text-xs font-semibold text-cm-dim mb-2">Details</h4>
                          <p className="text-xs text-cm-muted"><strong className="text-cm-secondary">Description:</strong> {ret.description}</p>
                          <p className="text-xs text-cm-muted mt-1"><strong className="text-cm-secondary">Order Total:</strong> ${ret.order.subtotal.toFixed(2)}</p>
                          {ret.returnShippingMethod && (
                            <p className="text-xs text-cm-muted mt-1"><strong className="text-cm-secondary">Shipping:</strong> {ret.returnShippingMethod.replace(/_/g, ' ')}</p>
                          )}
                          {ret.refundMethod && (
                            <p className="text-xs text-cm-muted mt-1"><strong className="text-cm-secondary">Refund Method:</strong> {ret.refundMethod.replace(/_/g, ' ')}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-cm-faint">
                            <span>{new Date(ret.createdAt).toLocaleDateString()}</span>
                            {ret.approvedAt && <span>Approved: {new Date(ret.approvedAt).toLocaleDateString()}</span>}
                            {ret.refundedAt && <span className="text-green-400">Refunded: {new Date(ret.refundedAt).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Seller Notes */}
                      {ret.sellerNotes && (
                        <div className="p-3 rounded-xl bg-cm-hover border border-cm-border-subtle">
                          <p className="text-xs font-semibold text-cm-muted mb-1">Seller Notes</p>
                          <p className="text-sm text-cm-dim">{ret.sellerNotes}</p>
                        </div>
                      )}

                      {/* Admin Notes */}
                      {ret.adminNotes && (
                        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                          <p className="text-xs font-semibold text-red-300 mb-1">Admin Notes</p>
                          <p className="text-sm text-cm-dim">{ret.adminNotes}</p>
                        </div>
                      )}

                      {/* Admin Actions */}
                      {!['REFUNDED', 'PARTIAL_REFUND', 'CLOSED'].includes(ret.status) && (
                        <div className="space-y-3 pt-2 border-t border-cm-border-subtle">
                          <div className="grid sm:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs text-cm-muted mb-1 block">Override Status</Label>
                              <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl h-10">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="bg-cm-elevated border-cm-border-hover">
                                  <SelectItem value="APPROVED" className="text-cm-secondary">Approved</SelectItem>
                                  <SelectItem value="REJECTED" className="text-cm-secondary">Rejected</SelectItem>
                                  <SelectItem value="RETURN_RECEIVED" className="text-cm-secondary">Return Received</SelectItem>
                                  <SelectItem value="INSPECTING" className="text-cm-secondary">Inspecting</SelectItem>
                                  <SelectItem value="REFUNDED" className="text-cm-secondary">Refunded</SelectItem>
                                  <SelectItem value="PARTIAL_REFUND" className="text-cm-secondary">Partial Refund</SelectItem>
                                  <SelectItem value="CLOSED" className="text-cm-secondary">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {(newStatus === 'REFUNDED' || newStatus === 'PARTIAL_REFUND') && (
                              <div>
                                <Label className="text-xs text-cm-muted mb-1 block">
                                  Refund Amount {newStatus === 'REFUNDED' && !refundAmount && <span className="text-cm-faint">(auto: ${ret.order.subtotal.toFixed(2)})</span>}
                                </Label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cm-dim text-sm">$</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="pl-7 bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl h-10"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          <div>
                            <Label className="text-xs text-cm-muted mb-1 block">Admin Notes</Label>
                            <Textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Internal admin notes..."
                              className="bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint rounded-xl min-h-[60px]"
                            />
                          </div>
                          <Button
                            onClick={() => handleUpdate(ret.id)}
                            disabled={updatingId === ret.id || !newStatus}
                            size="sm"
                            className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl"
                          >
                            {updatingId === ret.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Update Return
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardSidebar>
    </AdminAuthGuard>
  )
}
