'use client'
import { useState, useEffect, useCallback } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { RETURN_STATUS_LABELS, RETURN_STATUS_COLORS, RETURN_REASON_LABELS, type ReturnStatus, type ReturnReason } from '@/lib/types'
import {
  RotateCcw, Package, ChevronDown, ChevronUp, Clock, Loader2,
  CheckCircle2, XCircle, Search, Eye, PackageOpen
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
  buyer: { id: string; name: string; email: string; province?: string | null; city?: string | null }
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
]

export default function SellerReturns() {
  const { navigate } = useNavigation()
  const { user } = useAuth()
  const [returns, setReturns] = useState<ReturnRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Dialogs
  const [approveDialogId, setApproveDialogId] = useState<string | null>(null)
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null)
  const [partialRefundId, setPartialRefundId] = useState<string | null>(null)
  const [shippingMethod, setShippingMethod] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [partialAmount, setPartialAmount] = useState('')
  const [sellerNotes, setSellerNotes] = useState('')

  const fetchReturns = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/returns?sellerId=${user?.id || ''}`)
      if (res.ok) setReturns(await res.json())
    } catch {}
    setLoading(false)
  }, [user])

  useEffect(() => { fetchReturns() }, [fetchReturns])

  const handleUpdateStatus = async (id: string, status: string, extraData: any = {}) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/returns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extraData }),
      })
      if (res.ok) {
        toast.success(`Return ${status.toLowerCase()}`)
        setExpandedId(null)
        fetchReturns()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update return')
      }
    } catch {
      toast.error('Failed to update return')
    }
    setUpdatingId(null)
  }

  const handleApprove = () => {
    if (!approveDialogId || !shippingMethod) return
    handleUpdateStatus(approveDialogId, 'APPROVED', { returnShippingMethod: shippingMethod })
    setApproveDialogId(null)
    setShippingMethod('')
  }

  const handleReject = () => {
    if (!rejectDialogId || !rejectReason.trim()) return
    handleUpdateStatus(rejectDialogId, 'REJECTED', { sellerNotes: rejectReason.trim() })
    setRejectDialogId(null)
    setRejectReason('')
  }

  const handlePartialRefund = () => {
    if (!partialRefundId || !partialAmount) return
    handleUpdateStatus(partialRefundId, 'PARTIAL_REFUND', {
      refundAmount: parseFloat(partialAmount),
      refundMethod: 'ORIGINAL',
    })
    setPartialRefundId(null)
    setPartialAmount('')
  }

  const handleSaveNotes = (id: string) => {
    handleUpdateStatus(id, returns.find(r => r.id === id)?.status || '', { sellerNotes })
    setSellerNotes('')
  }

  const filteredReturns = activeTab === 'all' ? returns : returns.filter((r) => r.status === activeTab)

  return (
    <DashboardSidebar role="seller" activeItem="seller-returns" onNavigate={(page) => navigate(page)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-cm-primary">Returns / RMA</h1>
            <p className="text-sm text-cm-dim mt-1">{returns.length} return requests</p>
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
                      <p className="text-xs text-cm-dim">{ret.buyer.name}</p>
                      <span className="text-cm-faint">·</span>
                      <p className="text-xs text-cm-dim">{ret.order.orderNumber}</p>
                      <span className="text-cm-faint">·</span>
                      <p className="text-xs text-cm-faint">{new Date(ret.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    {ret.refundAmount != null && (
                      <span className="text-sm font-semibold text-cm-secondary">${ret.refundAmount.toFixed(2)}</span>
                    )}
                    {expandedId === ret.id ? <ChevronUp className="w-4 h-4 text-cm-dim" /> : <ChevronDown className="w-4 h-4 text-cm-dim" />}
                  </div>
                </button>

                {expandedId === ret.id && (
                  <div className="border-t border-cm-border-subtle p-5 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Product Info */}
                      <div>
                        <h4 className="text-xs font-semibold text-cm-dim mb-2">Product</h4>
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
                              <p className="text-sm font-medium text-cm-secondary">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Return Details */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-semibold text-cm-dim mb-1">Buyer Description</h4>
                          <p className="text-sm text-cm-muted">{ret.description}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-cm-dim">
                          <span>Order total: <strong className="text-cm-secondary">${ret.order.subtotal.toFixed(2)}</strong></span>
                          {ret.returnShippingMethod && (
                            <span>Shipping: <strong className="text-cm-secondary">{ret.returnShippingMethod.replace(/_/g, ' ')}</strong></span>
                          )}
                        </div>
                        {/* Timeline */}
                        <div className="flex flex-wrap gap-3 text-xs text-cm-dim">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(ret.createdAt).toLocaleDateString()}</span>
                          {ret.approvedAt && <span>Approved: {new Date(ret.approvedAt).toLocaleDateString()}</span>}
                          {ret.receivedAt && <span>Received: {new Date(ret.receivedAt).toLocaleDateString()}</span>}
                          {ret.refundedAt && <span className="text-green-400">Refunded: {new Date(ret.refundedAt).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Seller Notes */}
                    <div className="p-3 rounded-xl bg-cm-hover border border-cm-border-subtle">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-cm-muted">Internal Notes</Label>
                        {ret.sellerNotes && <span className="text-[10px] text-cm-faint">Last updated</span>}
                      </div>
                      {ret.sellerNotes && <p className="text-sm text-cm-dim mb-2">{ret.sellerNotes}</p>}
                      <div className="flex gap-2">
                        <Textarea
                          value={sellerNotes}
                          onChange={(e) => setSellerNotes(e.target.value)}
                          placeholder="Add internal notes..."
                          className="flex-1 bg-cm-input border-cm-border-hover text-cm-secondary placeholder:text-cm-faint rounded-lg min-h-[40px] text-sm"
                          rows={2}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSaveNotes(ret.id)}
                          disabled={updatingId === ret.id}
                          className="self-end h-8 px-3 bg-cm-elevated border border-cm-border-hover text-cm-secondary rounded-lg text-xs"
                        >
                          Save
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons based on status */}
                    {ret.status === 'REQUESTED' && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          onClick={() => setApproveDialogId(ret.id)}
                          size="sm"
                          className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Approve
                        </Button>
                        <Button
                          onClick={() => setRejectDialogId(ret.id)}
                          size="sm"
                          className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                        </Button>
                      </div>
                    )}

                    {ret.status === 'RETURN_RECEIVED' && (
                      <Button
                        onClick={() => handleUpdateStatus(ret.id, 'INSPECTING')}
                        disabled={updatingId === ret.id}
                        size="sm"
                        className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg text-sm"
                      >
                        {updatingId === ret.id ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Eye className="w-3.5 h-3.5 mr-1.5" />}
                        Start Inspection
                      </Button>
                    )}

                    {ret.status === 'INSPECTING' && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          onClick={() => handleUpdateStatus(ret.id, 'REFUNDED', { refundAmount: ret.order.subtotal, refundMethod: 'ORIGINAL' })}
                          disabled={updatingId === ret.id}
                          size="sm"
                          className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm"
                        >
                          {updatingId === ret.id ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                          Issue Full Refund (${ret.order.subtotal.toFixed(2)})
                        </Button>
                        <Button
                          onClick={() => setPartialRefundId(ret.id)}
                          size="sm"
                          className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg text-sm"
                        >
                          Issue Partial Refund
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Approve Dialog */}
        <Dialog open={!!approveDialogId} onOpenChange={(open) => { if (!open) { setApproveDialogId(null); setShippingMethod('') } }}>
          <DialogContent className="bg-cm-elevated border-cm-border-hover rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-cm-primary">Approve Return</DialogTitle>
              <DialogDescription className="text-cm-dim">Choose how the return shipping will be handled.</DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <Label className="text-sm font-medium text-cm-secondary mb-2 block">Return Shipping Method</Label>
              <Select value={shippingMethod} onValueChange={setShippingMethod}>
                <SelectTrigger className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl h-10">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent className="bg-cm-elevated border-cm-border-hover">
                  <SelectItem value="BUYER_PAYS" className="text-cm-secondary">Buyer Pays Shipping</SelectItem>
                  <SelectItem value="SELLER_PAYS" className="text-cm-secondary">Seller Pays Shipping</SelectItem>
                  <SelectItem value="PREPAID_LABEL" className="text-cm-secondary">Provide Prepaid Label</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => { setApproveDialogId(null); setShippingMethod('') }} className="border-cm-border-hover text-cm-secondary rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleApprove} disabled={!shippingMethod} className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Return
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={!!rejectDialogId} onOpenChange={(open) => { if (!open) { setRejectDialogId(null); setRejectReason('') } }}>
          <DialogContent className="bg-cm-elevated border-cm-border-hover rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-cm-primary">Reject Return</DialogTitle>
              <DialogDescription className="text-cm-dim">Provide a reason for rejecting this return request.</DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <Label className="text-sm font-medium text-cm-secondary mb-2 block">Rejection Reason <span className="text-red-400">*</span></Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this return is being rejected..."
                className="bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint min-h-[80px] rounded-xl"
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => { setRejectDialogId(null); setRejectReason('') }} className="border-cm-border-hover text-cm-secondary rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleReject} disabled={!rejectReason.trim()} className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl">
                <XCircle className="w-4 h-4 mr-2" /> Reject Return
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Partial Refund Dialog */}
        <Dialog open={!!partialRefundId} onOpenChange={(open) => { if (!open) { setPartialRefundId(null); setPartialAmount('') } }}>
          <DialogContent className="bg-cm-elevated border-cm-border-hover rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-cm-primary">Issue Partial Refund</DialogTitle>
              <DialogDescription className="text-cm-dim">Enter the refund amount (max: ${returns.find(r => r.id === partialRefundId)?.order.subtotal.toFixed(2) || '0.00'})</DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <Label className="text-sm font-medium text-cm-secondary mb-2 block">Refund Amount (CAD) <span className="text-red-400">*</span></Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cm-dim text-sm">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  className="pl-7 bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl h-10"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => { setPartialRefundId(null); setPartialAmount('') }} className="border-cm-border-hover text-cm-secondary rounded-xl">
                Cancel
              </Button>
              <Button onClick={handlePartialRefund} disabled={!partialAmount || parseFloat(partialAmount) <= 0} className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl">
                Confirm Partial Refund
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardSidebar>
  )
}
