'use client'

import { useState, useEffect, useCallback } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import AdminAuthGuard from './AdminAuthGuard'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Quote,
  MessageSquare,
  Clock,
  Loader2,
  DollarSign,
  Users,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'

interface AdminQuote {
  id: string
  productName: string
  productId?: string
  buyerName: string
  buyerEmail?: string
  sellerName: string
  sellerEmail?: string
  message: string
  quantity: number
  targetPrice: number
  quotePrice?: number | null
  responseMessage?: string
  status: string
  createdAt: string
  updatedAt: string
  respondedAt?: string
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  RESPONDED: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  ACCEPTED: 'bg-green-500/10 text-green-400 border-green-500/20',
  DECLINED: 'bg-red-500/10 text-red-400 border-red-500/20',
  EXPIRED: 'bg-stone-500/10 text-cm-muted border-stone-500/20',
}

const STATUS_OPTIONS = ['PENDING', 'RESPONDED', 'ACCEPTED', 'DECLINED', 'EXPIRED']

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'RESPONDED', label: 'Responded' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'DECLINED', label: 'Declined' },
]

const mockQuotes: AdminQuote[] = [
  {
    id: '1',
    productName: 'MacBook Pro 14" M3',
    productId: 'prod-001',
    buyerName: 'Sarah Johnson',
    buyerEmail: 'sarah@example.com',
    sellerName: 'TechHub Canada',
    sellerEmail: 'sales@techhub.ca',
    message: 'Looking for bulk discount on 5 units for our design team. Can we get a better price?',
    quantity: 5,
    targetPrice: 1800,
    status: 'ACCEPTED',
    quotePrice: 1850,
    responseMessage: 'We can offer $1,850 each with free shipping.',
    respondedAt: '2024-03-14T10:30:00Z',
    createdAt: '2024-03-12T08:15:00Z',
    updatedAt: '2024-03-14T10:30:00Z',
  },
  {
    id: '2',
    productName: 'Sony WH-1000XM5 Headphones',
    productId: 'prod-002',
    buyerName: 'Michael Chen',
    buyerEmail: 'michael@company.com',
    sellerName: 'Audio World',
    sellerEmail: 'info@audioworld.ca',
    message: 'Need 10 pairs for corporate gifting program. What is the best price you can do?',
    quantity: 10,
    targetPrice: 280,
    status: 'PENDING',
    createdAt: '2024-03-15T14:20:00Z',
    updatedAt: '2024-03-15T14:20:00Z',
  },
  {
    id: '3',
    productName: 'Ergonomic Standing Desk Pro',
    productId: 'prod-003',
    buyerName: 'Emily Davis',
    buyerEmail: 'emily@startup.io',
    sellerName: 'Office Furnish Canada',
    message: 'Need 3 desks for our new office space. Assembly included?',
    quantity: 3,
    targetPrice: 450,
    status: 'RESPONDED',
    quotePrice: 460,
    responseMessage: '$460 each with free assembly and 2-year warranty.',
    respondedAt: '2024-03-10T09:00:00Z',
    createdAt: '2024-03-08T16:45:00Z',
    updatedAt: '2024-03-10T09:00:00Z',
  },
  {
    id: '4',
    productName: 'Dell 27" 4K Monitor U2723QE',
    productId: 'prod-004',
    buyerName: 'James Wilson',
    buyerEmail: 'james@techcorp.com',
    sellerName: 'TechHub Canada',
    sellerEmail: 'sales@techhub.ca',
    message: 'Looking for competitive pricing on 2 monitors for our developers.',
    quantity: 2,
    targetPrice: 350,
    status: 'DECLINED',
    quotePrice: null,
    responseMessage: 'We cannot go below retail price for this model at this time.',
    respondedAt: '2024-03-05T11:20:00Z',
    createdAt: '2024-03-03T07:30:00Z',
    updatedAt: '2024-03-05T11:20:00Z',
  },
  {
    id: '5',
    productName: 'Logitech MX Master 3S Mouse',
    productId: 'prod-005',
    buyerName: 'Lisa Park',
    buyerEmail: 'lisa@design.co',
    sellerName: 'TechHub Canada',
    message: 'Need 20 mice for the entire design team. Any volume discount available?',
    quantity: 20,
    targetPrice: 70,
    status: 'PENDING',
    createdAt: '2024-03-16T12:00:00Z',
    updatedAt: '2024-03-16T12:00:00Z',
  },
  {
    id: '6',
    productName: 'Samsung Galaxy Tab S9 FE',
    productId: 'prod-006',
    buyerName: 'Robert Kim',
    buyerEmail: 'robert@school.ca',
    sellerName: 'Mobile Plus',
    message: 'Requesting quote for 15 tablets for classroom use. Educational discount?',
    quantity: 15,
    targetPrice: 350,
    status: 'PENDING',
    createdAt: '2024-03-17T09:00:00Z',
    updatedAt: '2024-03-17T09:00:00Z',
  },
]

export default function AdminQuotes() {
  const { navigate } = useNavigation()
  const { user } = useAuth()
  const [quotes, setQuotes] = useState<AdminQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchQuotes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/quotes')
      if (res.ok) {
        const data = await res.json()
        const arr = data.quotes || data
        if (Array.isArray(arr) && arr.length > 0) {
          setQuotes(arr)
          setLoading(false)
          return
        }
      }
    } catch {
      // API not available yet
    }
    setQuotes(mockQuotes)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (user) fetchQuotes()
  }, [user, fetchQuotes])

  const handleStatusUpdate = async (quoteId: string, newStatus: string) => {
    setUpdatingId(quoteId)
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success(`Quote #${quoteId} updated to ${newStatus}`)
        setQuotes((prev) =>
          prev.map((q) =>
            q.id === quoteId
              ? { ...q, status: newStatus, updatedAt: new Date().toISOString() }
              : q
          )
        )
      } else {
        toast.error('Failed to update quote status')
      }
    } catch {
      toast.error('Failed to update quote status')
    }
    setUpdatingId(null)
  }

  const filteredQuotes = quotes.filter(
    (q) => statusFilter === 'all' || q.status === statusFilter
  )

  const counts = {
    all: quotes.length,
    PENDING: quotes.filter((q) => q.status === 'PENDING').length,
    RESPONDED: quotes.filter((q) => q.status === 'RESPONDED').length,
    ACCEPTED: quotes.filter((q) => q.status === 'ACCEPTED').length,
    DECLINED: quotes.filter((q) => q.status === 'DECLINED').length,
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount)

  return (
    <AdminAuthGuard>
      <DashboardSidebar role="admin" activeItem="admin-quotes" onNavigate={(page) => navigate(page)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Quote className="w-6 h-6 text-orange-400" />
                <h1 className="text-2xl font-bold text-cm-primary">Quote Management</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cm-hover text-xs text-cm-muted border border-cm-border-hover">
                  {quotes.length} quotes
                </span>
              </div>
              <p className="text-sm text-cm-dim">
                View and manage all quote requests across the marketplace
              </p>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === tab.value
                    ? 'bg-cm-elevated text-cm-primary border border-cm-border-hover shadow-sm'
                    : 'bg-cm-hover text-cm-dim border border-transparent hover:text-cm-secondary hover:bg-cm-elevated'
                }`}
              >
                {tab.label}
                {tab.value !== 'all' && counts[tab.value as keyof typeof counts] > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                      statusFilter === tab.value
                        ? 'bg-cm-hover text-cm-muted'
                        : 'bg-cm-input text-cm-faint'
                    }`}
                  >
                    {counts[tab.value as keyof typeof counts]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Quote Cards */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-52 rounded-2xl bg-cm-input" />
                ))}
              </div>
            ) : filteredQuotes.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-cm-elevated border border-cm-border-subtle">
                <AlertTriangle className="w-16 h-16 text-cm-faint mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-cm-secondary mb-2">No quotes found</h2>
                <p className="text-sm text-cm-dim">
                  {statusFilter === 'all'
                    ? 'No quote requests in the system yet'
                    : `No ${statusFilter.toLowerCase()} quotes`}
                </p>
              </div>
            ) : (
              filteredQuotes.map((quote) => {
                const isExpanded = expandedId === quote.id
                return (
                  <div
                    key={quote.id}
                    className="rounded-2xl bg-cm-elevated border border-cm-border-subtle overflow-hidden"
                  >
                    {/* Collapsed Header */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : quote.id)}
                      className="w-full text-left p-5 hover:bg-cm-hover/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <p className="text-xs font-mono text-cm-muted">#{quote.id}</p>
                            <Badge
                              className={`${STATUS_COLORS[quote.status] || 'bg-cm-hover text-cm-muted border-cm-border-hover'} text-[10px] border`}
                            >
                              {quote.status}
                            </Badge>
                          </div>
                          <p className="text-sm font-semibold text-cm-secondary truncate">
                            {quote.productName}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-cm-dim">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {quote.buyerName}
                            </span>
                            <span className="text-cm-faint">→</span>
                            <span>{quote.sellerName}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(quote.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {quote.quotePrice != null && quote.quotePrice > 0 && (
                            <span className="text-sm font-bold text-green-400">
                              {formatCurrency(quote.quotePrice)}
                              <span className="text-[10px] text-cm-faint font-normal">/unit</span>
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-cm-faint" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-cm-faint" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="border-t border-cm-border-subtle p-5 space-y-4">
                        {/* Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <p className="text-[10px] text-cm-faint uppercase font-semibold">Quantity</p>
                            <p className="text-sm font-medium text-cm-secondary mt-0.5">
                              {quote.quantity} units
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-cm-faint uppercase font-semibold">Target Price</p>
                            <p className="text-sm font-medium text-cm-secondary mt-0.5">
                              {formatCurrency(quote.targetPrice)}/unit
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-cm-faint uppercase font-semibold">Quoted Price</p>
                            <p className="text-sm font-medium text-cm-secondary mt-0.5">
                              {quote.quotePrice != null && quote.quotePrice > 0
                                ? `${formatCurrency(quote.quotePrice)}/unit`
                                : '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-cm-faint uppercase font-semibold">Total Value</p>
                            <p className="text-sm font-medium text-cm-secondary mt-0.5">
                              {quote.quotePrice != null && quote.quotePrice > 0
                                ? formatCurrency(quote.quotePrice * quote.quantity)
                                : formatCurrency(quote.targetPrice * quote.quantity)}
                            </p>
                          </div>
                        </div>

                        {/* Buyer & Seller Info */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-[10px] text-cm-faint uppercase font-semibold mb-1">Buyer</h4>
                            <div className="p-3 rounded-xl bg-cm-hover border border-cm-border-subtle">
                              <p className="text-sm font-medium text-cm-secondary">{quote.buyerName}</p>
                              {quote.buyerEmail && (
                                <p className="text-xs text-cm-dim mt-0.5">{quote.buyerEmail}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-[10px] text-cm-faint uppercase font-semibold mb-1">Seller</h4>
                            <div className="p-3 rounded-xl bg-cm-hover border border-cm-border-subtle">
                              <p className="text-sm font-medium text-cm-secondary">{quote.sellerName}</p>
                              {quote.sellerEmail && (
                                <p className="text-xs text-cm-dim mt-0.5">{quote.sellerEmail}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Buyer Message */}
                        <div className="p-3 rounded-xl bg-cm-hover border border-cm-border-subtle">
                          <div className="flex items-center gap-1.5 mb-1">
                            <FileText className="w-3.5 h-3.5 text-cm-dim" />
                            <p className="text-[10px] text-cm-dim uppercase font-semibold">
                              Buyer&apos;s Message
                            </p>
                          </div>
                          <p className="text-sm text-cm-muted">{quote.message}</p>
                        </div>

                        {/* Seller Response */}
                        {quote.responseMessage && (
                          <div
                            className={`p-3 rounded-xl border ${
                              quote.status === 'ACCEPTED'
                                ? 'bg-green-500/5 border-green-500/20'
                                : quote.status === 'DECLINED'
                                ? 'bg-red-500/5 border-red-500/20'
                                : 'bg-cyan-500/5 border-cyan-500/20'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <MessageSquare
                                className={`w-3.5 h-3.5 ${
                                  quote.status === 'ACCEPTED'
                                    ? 'text-green-400'
                                    : quote.status === 'DECLINED'
                                    ? 'text-red-400'
                                    : 'text-cyan-400'
                                }`}
                              />
                              <p
                                className={`text-[10px] uppercase font-semibold ${
                                  quote.status === 'ACCEPTED'
                                    ? 'text-green-400'
                                    : quote.status === 'DECLINED'
                                    ? 'text-red-400'
                                    : 'text-cyan-400'
                                }`}
                              >
                                Seller&apos;s Response
                              </p>
                            </div>
                            <p className="text-sm text-cm-muted">{quote.responseMessage}</p>
                            {quote.respondedAt && (
                              <p className="text-[10px] text-cm-faint mt-1.5">
                                Responded {formatDateTime(quote.respondedAt)}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Admin Status Update */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-cm-border-subtle">
                          <div className="flex flex-wrap gap-3 text-[10px] text-cm-faint">
                            <span>Created: {formatDateTime(quote.createdAt)}</span>
                            <span>Updated: {formatDateTime(quote.updatedAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {updatingId === quote.id && (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-cm-dim" />
                            )}
                            <Select
                              value={quote.status}
                              onValueChange={(val) => handleStatusUpdate(quote.id, val)}
                              disabled={updatingId === quote.id}
                            >
                              <SelectTrigger className="w-[150px] h-9 text-xs rounded-xl bg-cm-hover border-cm-border-hover text-cm-secondary">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-cm-elevated border-cm-border-hover rounded-xl">
                                {STATUS_OPTIONS.map((opt) => (
                                  <SelectItem key={opt} value={opt} className="text-cm-secondary text-xs">
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </DashboardSidebar>
    </AdminAuthGuard>
  )
}
