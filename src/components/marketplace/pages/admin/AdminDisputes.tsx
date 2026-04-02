'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { AlertTriangle, Loader2, Package, Save } from 'lucide-react'
import { toast } from 'sonner'

interface Dispute {
  id: string; orderId: string; reason: string; description: string
  status: string; resolution?: string; adminNotes?: string; createdAt: string; resolvedAt?: string
  buyer: { id: string; name: string; email: string }
  seller: { id: string; name: string; email: string }
  order: { items: Array<{ title: string; price: number; quantity: number }> }
}

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [resolution, setResolution] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [newStatus, setNewStatus] = useState('')

  const fetchDisputes = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/disputes?type=${typeFilter}`)
      if (res.ok) setDisputes(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchDisputes() }, [typeFilter, fetchDisputes])

  const handleUpdate = async (disputeId: string) => {
    if (!newStatus) { toast.error('Please select a status'); return }
    setUpdating(true)
    try {
      const res = await fetch('/api/disputes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disputeId, status: newStatus, resolution, adminNotes }),
      })
      if (res.ok) {
        toast.success('Dispute updated')
        setExpandedId(null)
        setResolution('')
        setAdminNotes('')
        setNewStatus('')
        fetchDisputes()
      }
    } catch {}
    setUpdating(false)
  }

  const statusColors: Record<string, string> = {
    OPEN: 'bg-red-500/10 text-red-400 border-red-500/20',
    UNDER_REVIEW: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    RESOLVED: 'bg-green-500/10 text-green-400 border-green-500/20',
    CLOSED: 'bg-stone-500/10 text-stone-400 border-stone-500/20',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-100">Dispute Resolution</h1>
          <p className="text-sm text-stone-500 mt-1">{disputes.length} disputes</p>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44 bg-white/5 border-white/10 text-stone-200 h-10 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 border-white/10">
            <SelectItem value="all" className="text-stone-300">All</SelectItem>
            <SelectItem value="open" className="text-stone-300">Open</SelectItem>
            <SelectItem value="resolved" className="text-stone-300">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-neutral-800 animate-pulse" />)
        ) : disputes.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-neutral-900/60 border border-white/5">
            <AlertTriangle className="w-16 h-16 text-stone-700 mx-auto mb-4" />
            <p className="text-stone-500">No disputes found</p>
          </div>
        ) : (
          disputes.map((dispute) => (
            <div key={dispute.id} className="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
              <button onClick={() => setExpandedId(expandedId === dispute.id ? null : dispute.id)} className="w-full text-left p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-mono text-stone-400">{dispute.orderId}</p>
                      <Badge className={`${statusColors[dispute.status] || ''} text-[10px] border`}>{dispute.status}</Badge>
                    </div>
                    <p className="text-sm font-medium text-stone-200">{dispute.reason}</p>
                    <p className="text-xs text-stone-500 mt-1">
                      {dispute.buyer?.name} vs {dispute.seller?.name} · {new Date(dispute.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>

              {expandedId === dispute.id && (
                <div className="border-t border-white/5 p-5 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-stone-500 mb-1">Description</h4>
                      <p className="text-sm text-stone-400">{dispute.description}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-stone-500 mb-1">Order Items</h4>
                      <div className="space-y-1">
                        {dispute.order?.items?.map((item, i) => (
                          <p key={i} className="text-xs text-stone-400">{item.title} · ${item.price.toFixed(2)} x{item.quantity}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {dispute.resolution && (
                    <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                      <p className="text-xs font-semibold text-green-300 mb-1">Resolution</p>
                      <p className="text-sm text-stone-400">{dispute.resolution}</p>
                    </div>
                  )}
                  {dispute.adminNotes && (
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-xs font-semibold text-stone-400 mb-1">Admin Notes</p>
                      <p className="text-sm text-stone-500">{dispute.adminNotes}</p>
                    </div>
                  )}

                  {!['RESOLVED', 'CLOSED'].includes(dispute.status) && (
                    <div className="space-y-3 pt-2 border-t border-white/5">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-stone-400 mb-1 block">Update Status</Label>
                          <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-stone-200 rounded-xl h-10">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-900 border-white/10">
                              <SelectItem value="UNDER_REVIEW" className="text-stone-300">Under Review</SelectItem>
                              <SelectItem value="RESOLVED" className="text-stone-300">Resolved</SelectItem>
                              <SelectItem value="CLOSED" className="text-stone-300">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-stone-400 mb-1 block">Resolution</Label>
                          <select value={resolution} onChange={(e) => setResolution(e.target.value)} className="w-full bg-white/5 border-white/10 text-stone-200 rounded-xl h-10 px-3">
                            <option value="" className="bg-neutral-900">Select resolution</option>
                            <option value="REFUND" className="bg-neutral-900">Full Refund</option>
                            <option value="PARTIAL_REFUND" className="bg-neutral-900">Partial Refund</option>
                            <option value="REPLACE" className="bg-neutral-900">Replace Item</option>
                            <option value="NO_ACTION" className="bg-neutral-900">No Action Needed</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-stone-400 mb-1 block">Admin Notes</Label>
                        <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Internal notes..." className="bg-white/5 border-white/10 text-stone-200 placeholder:text-stone-600 rounded-xl min-h-[60px]" />
                      </div>
                      <Button onClick={() => handleUpdate(dispute.id)} disabled={updating} size="sm" className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl">
                        {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Update Dispute
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
