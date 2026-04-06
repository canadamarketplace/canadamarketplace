'use client'
import { useState, useEffect, useCallback } from 'react'
import { useNavigation } from '@/lib/store'
import AdminAuthGuard from './AdminAuthGuard'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Flag, Loader2, Save, Eye, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface ReportRecord {
  id: string
  targetType: string
  targetId: string
  reason: string
  description: string
  status: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
  reporter: { id: string; name: string; email: string }
}

export default function AdminReports() {
  const { navigate } = useNavigation()
  const [reports, setReports] = useState<ReportRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [targetTypeFilter, setTargetTypeFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      if (targetTypeFilter && targetTypeFilter !== 'all') params.set('targetType', targetTypeFilter)
      const query = params.toString()
      const res = await fetch(`/api/reports${query ? '?' + query : ''}`)
      if (res.ok) {
        const data = await res.json()
        setReports(data.reports || [])
      }
    } catch {}
    setLoading(false)
  }, [statusFilter, targetTypeFilter])

  useEffect(() => { fetchReports() }, [statusFilter, targetTypeFilter, fetchReports])

  const handleUpdate = async (reportId: string, status: string) => {
    if (!status) { toast.error('Please select an action'); return }
    setUpdating(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status, adminNotes: adminNotes || undefined }),
      })
      if (res.ok) {
        toast.success('Report updated')
        setExpandedId(null)
        setAdminNotes('')
        fetchReports()
      } else {
        toast.error('Failed to update report')
      }
    } catch {
      toast.error('Failed to update report')
    }
    setUpdating(false)
  }

  const statusColors: Record<string, string> = {
    OPEN: 'bg-red-500/10 text-red-400 border-red-500/20',
    REVIEWING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    RESOLVED: 'bg-green-500/10 text-green-400 border-green-500/20',
    DISMISSED: 'bg-stone-500/10 text-cm-muted border-stone-500/20',
  }

  const statusLabels: Record<string, string> = {
    OPEN: 'Open',
    REVIEWING: 'Reviewing',
    RESOLVED: 'Resolved',
    DISMISSED: 'Dismissed',
  }

  const targetTypeColors: Record<string, string> = {
    PRODUCT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    SELLER: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    ORDER: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  }

  const reasonLabels: Record<string, string> = {
    SPAM: 'Spam',
    INAPPROPRIATE: 'Inappropriate',
    FRAUD: 'Fraud',
    COPYRIGHT: 'Copyright Violation',
    OTHER: 'Other',
  }

  return (
    <AdminAuthGuard>
    <DashboardSidebar role="admin" activeItem="admin-reports" onNavigate={(page) => navigate(page)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cm-primary">Report Management</h1>
          <p className="text-sm text-cm-dim mt-1">{reports.length} reports</p>
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-cm-hover border-cm-border-hover text-cm-secondary h-10 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-cm-elevated border-cm-border-hover">
              <SelectItem value="all" className="text-cm-secondary">All Statuses</SelectItem>
              <SelectItem value="OPEN" className="text-cm-secondary">Open</SelectItem>
              <SelectItem value="REVIEWING" className="text-cm-secondary">Reviewing</SelectItem>
              <SelectItem value="RESOLVED" className="text-cm-secondary">Resolved</SelectItem>
              <SelectItem value="DISMISSED" className="text-cm-secondary">Dismissed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
            <SelectTrigger className="w-40 bg-cm-hover border-cm-border-hover text-cm-secondary h-10 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-cm-elevated border-cm-border-hover">
              <SelectItem value="all" className="text-cm-secondary">All Types</SelectItem>
              <SelectItem value="PRODUCT" className="text-cm-secondary">Product</SelectItem>
              <SelectItem value="SELLER" className="text-cm-secondary">Seller</SelectItem>
              <SelectItem value="ORDER" className="text-cm-secondary">Order</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-cm-input animate-pulse" />)
        ) : reports.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-cm-elevated border border-cm-border-subtle">
            <Flag className="w-16 h-16 text-cm-faint mx-auto mb-4" />
            <p className="text-cm-dim">No reports found</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="rounded-2xl bg-cm-elevated border border-cm-border-subtle overflow-hidden">
              <button onClick={() => setExpandedId(expandedId === report.id ? null : report.id)} className="w-full text-left p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <Badge className={`${statusColors[report.status] || ''} text-[10px] border`}>
                        {statusLabels[report.status] || report.status}
                      </Badge>
                      <Badge className={`${targetTypeColors[report.targetType] || ''} text-[10px] border`}>
                        {report.targetType}
                      </Badge>
                      <span className="text-[10px] text-cm-faint">{reasonLabels[report.reason] || report.reason}</span>
                    </div>
                    <p className="text-sm font-medium text-cm-secondary">
                      {report.targetType === 'PRODUCT' ? 'Product' : report.targetType === 'SELLER' ? 'Seller' : 'Order'} — {report.targetId.slice(0, 12)}...
                    </p>
                    <p className="text-xs text-cm-dim mt-1">
                      Reported by {report.reporter?.name} ({report.reporter?.email}) · {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-cm-dim flex-shrink-0">
                    {expandedId === report.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </button>

              {expandedId === report.id && (
                <div className="border-t border-cm-border-subtle p-5 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-cm-dim mb-1">Reporter</h4>
                      <p className="text-sm text-cm-muted">{report.reporter?.name}</p>
                      <p className="text-xs text-cm-faint">{report.reporter?.email}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-cm-dim mb-1">Reason</h4>
                      <p className="text-sm text-cm-muted">{reasonLabels[report.reason] || report.reason}</p>
                      <p className="text-xs text-cm-faint">Target: {report.targetType} ({report.targetId})</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-cm-dim mb-1">Description</h4>
                    <p className="text-sm text-cm-muted">{report.description}</p>
                  </div>

                  {report.adminNotes && (
                    <div className="p-3 rounded-xl bg-cm-hover border border-cm-border-subtle">
                      <p className="text-xs font-semibold text-cm-muted mb-1">Admin Notes</p>
                      <p className="text-sm text-cm-dim">{report.adminNotes}</p>
                    </div>
                  )}

                  {!['RESOLVED', 'DISMISSED'].includes(report.status) && (
                    <div className="space-y-3 pt-2 border-t border-cm-border-subtle">
                      <div>
                        <Label className="text-xs text-cm-muted mb-1 block">Admin Notes</Label>
                        <Textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Internal notes about this report..."
                          className="bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint rounded-xl min-h-[60px]"
                        />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {report.status === 'OPEN' && (
                          <Button
                            onClick={() => handleUpdate(report.id, 'REVIEWING')}
                            disabled={updating}
                            size="sm"
                            variant="outline"
                            className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10 rounded-xl"
                          >
                            {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                            Start Review
                          </Button>
                        )}
                        <Button
                          onClick={() => handleUpdate(report.id, 'RESOLVED')}
                          disabled={updating}
                          size="sm"
                          variant="outline"
                          className="border-green-500/20 text-green-400 hover:bg-green-500/10 rounded-xl"
                        >
                          {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          Resolve
                        </Button>
                        <Button
                          onClick={() => handleUpdate(report.id, 'DISMISSED')}
                          disabled={updating}
                          size="sm"
                          variant="outline"
                          className="border-stone-500/20 text-cm-dim hover:bg-cm-hover hover:text-cm-secondary rounded-xl"
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
    </DashboardSidebar>
    </AdminAuthGuard>
  )
}
