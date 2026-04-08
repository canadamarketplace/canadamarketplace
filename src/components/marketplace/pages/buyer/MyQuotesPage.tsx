"use client"

import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useNavigation } from "@/lib/store"
import { toast } from "sonner"
import DashboardSidebar from "@/components/marketplace/layouts/DashboardSidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Quote,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  DollarSign,
  Package,
  Store,
  AlertCircle,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────────────

type QuoteStatus = "PENDING" | "RESPONDED" | "ACCEPTED" | "DECLINED"

interface BuyerQuote {
  id: string
  productName: string
  productImage?: string
  sellerName: string
  sellerId?: string
  quantity: number
  targetPrice: number
  message: string
  status: QuoteStatus
  quotePrice?: number
  responseMessage?: string
  respondedAt?: string
  createdAt: string
  updatedAt: string
}

type StatusFilter = "all" | QuoteStatus

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<QuoteStatus, string> = {
  PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  RESPONDED: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  ACCEPTED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  DECLINED: "bg-rose-500/10 text-rose-500 border-rose-500/20",
}

const STATUS_LABELS: Record<QuoteStatus, string> = {
  PENDING: "Pending",
  RESPONDED: "Responded",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function QuotesSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="rounded-2xl">
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
            <Skeleton className="h-16 w-full rounded-xl" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: StatusFilter }) {
  const messages: Record<StatusFilter, { title: string; description: string }> = {
    all: {
      title: "No quotes yet",
      description: "You haven't submitted any quote requests. Browse products and request a quote from sellers.",
    },
    PENDING: {
      title: "No pending quotes",
      description: "You have no pending quote requests at the moment.",
    },
    RESPONDED: {
      title: "No responded quotes",
      description: "No sellers have responded to your quote requests yet.",
    },
    ACCEPTED: {
      title: "No accepted quotes",
      description: "None of your quotes have been accepted yet.",
    },
    DECLINED: {
      title: "No declined quotes",
      description: "None of your quotes have been declined.",
    },
  }

  const msg = messages[filter]

  return (
    <div className="text-center py-16 rounded-2xl border bg-muted/30">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <MessageSquare className="w-8 h-8 text-muted-foreground/40" />
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-1">{msg.title}</h2>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">{msg.description}</p>
    </div>
  )
}

// ─── Status Summary Bar ─────────────────────────────────────────────────────

function StatusSummary({ quotes }: { quotes: BuyerQuote[] }) {
  const counts = useMemo(() => {
    const c: Record<QuoteStatus, number> = {
      PENDING: 0,
      RESPONDED: 0,
      ACCEPTED: 0,
      DECLINED: 0,
    }
    for (const q of quotes) {
      c[q.status]++
    }
    return c
  }, [quotes])

  return (
    <div className="flex flex-wrap gap-3">
      {(Object.entries(counts) as [QuoteStatus, number][]).map(([status, count]) => (
        <div
          key={status}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/30"
        >
          <div className={`w-2 h-2 rounded-full ${
            status === "PENDING" ? "bg-amber-500" :
            status === "RESPONDED" ? "bg-sky-500" :
            status === "ACCEPTED" ? "bg-emerald-500" :
            "bg-rose-500"
          }`} />
          <span className="text-xs text-muted-foreground">{STATUS_LABELS[status]}</span>
          <span className="text-xs font-semibold">{count}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function MyQuotesPage() {
  const { data: session, status } = useSession()
  const { navigate } = useNavigation()

  const [quotes, setQuotes] = useState<BuyerQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // ─── Fetch Quotes ──────────────────────────────────────────────────────

  useEffect(() => {
    if (status !== "authenticated") return

    const fetchQuotes = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/quotes")
        if (res.ok) {
          const data = await res.json()
          const list = Array.isArray(data) ? data : data.quotes ?? []
          setQuotes(list)
        } else {
          toast.error("Failed to load quotes")
        }
      } catch {
        toast.error("Failed to load quotes")
      }
      setLoading(false)
    }

    fetchQuotes()
  }, [status])

  // ─── Filtered Quotes ───────────────────────────────────────────────────

  const filteredQuotes = useMemo(
    () => (statusFilter === "all" ? quotes : quotes.filter((q) => q.status === statusFilter)),
    [quotes, statusFilter]
  )

  // ─── Accept / Decline Handler ──────────────────────────────────────────

  const handleAction = async (quoteId: string, action: "ACCEPT" | "DECLINE") => {
    setActionLoading(quoteId)
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      })

      if (res.ok) {
        const label = action === "ACCEPT" ? "accepted" : "declined"
        toast.success(`Quote ${label} successfully`)

        // Optimistic UI update
        setQuotes((prev) =>
          prev.map((q) =>
            q.id === quoteId ? { ...q, status: action, updatedAt: new Date().toISOString() } : q
          )
        )
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || "Failed to update quote")
      }
    } catch {
      toast.error("Network error — please try again")
    }
    setActionLoading(null)
  }

  // ─── Auth Guard: Loading ───────────────────────────────────────────────

  if (status === "loading") {
    return (
      <DashboardSidebar role="buyer" activeItem="my-quotes" onNavigate={(page) => navigate(page)}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </DashboardSidebar>
    )
  }

  // ─── Auth Guard: Unauthenticated ───────────────────────────────────────

  if (!session) {
    return (
      <DashboardSidebar role="buyer" activeItem="my-quotes" onNavigate={(page) => navigate(page)}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center">
              <Quote className="w-8 h-8 text-sky-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Sign in to view your quotes</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Manage your quote requests and seller responses after signing in.
          </p>
          <Button onClick={() => navigate("home")} className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-8">
            Sign In
          </Button>
        </div>
      </DashboardSidebar>
    )
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <DashboardSidebar role="buyer" activeItem="my-quotes" onNavigate={(page) => navigate(page)}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <Quote className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">My Quotes</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Manage quote requests and seller responses
                </p>
              </div>
            </div>
            {quotes.length > 0 && (
              <Badge variant="secondary" className="w-fit text-xs font-medium">
                {quotes.length} {quotes.length === 1 ? "quote" : "quotes"}
              </Badge>
            )}
          </div>
        </div>

        {/* Status Summary */}
        {!loading && quotes.length > 0 && (
          <div className="mb-6">
            <StatusSummary quotes={quotes} />
          </div>
        )}

        {/* Status Filter Tabs */}
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          className="space-y-6"
        >
          <TabsList className="bg-muted rounded-xl h-10 p-1">
            <TabsTrigger
              value="all"
              className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="PENDING"
              className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="RESPONDED"
              className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Responded
            </TabsTrigger>
            <TabsTrigger
              value="ACCEPTED"
              className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Accepted
            </TabsTrigger>
            <TabsTrigger
              value="DECLINED"
              className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Declined
            </TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter}>
            {loading ? (
              <QuotesSkeleton />
            ) : filteredQuotes.length === 0 ? (
              <EmptyState filter={statusFilter} />
            ) : (
              <div className="space-y-4">
                {filteredQuotes.map((quote) => (
                  <QuoteCard
                    key={quote.id}
                    quote={quote}
                    actionLoading={actionLoading}
                    onAccept={() => handleAction(quote.id, "ACCEPT")}
                    onDecline={() => handleAction(quote.id, "DECLINE")}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardSidebar>
  )
}

// ─── Quote Card ─────────────────────────────────────────────────────────────

function QuoteCard({
  quote,
  actionLoading,
  onAccept,
  onDecline,
}: {
  quote: BuyerQuote
  actionLoading: string | null
  onAccept: () => void
  onDecline: () => void
}) {
  const isLoading = actionLoading === quote.id
  const isResponded = quote.status === "RESPONDED"
  const isTerminal = quote.status === "ACCEPTED" || quote.status === "DECLINED"

  return (
    <Card className="rounded-2xl hover:shadow-md transition-shadow">
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Top: Product Name + Status Badge */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="space-y-0.5">
            <h3 className="text-base font-semibold leading-tight">{quote.productName}</h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Store className="w-3.5 h-3.5" />
              <span>{quote.sellerName}</span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] w-fit px-2.5 py-0.5 ${STATUS_STYLES[quote.status]}`}
          >
            {STATUS_LABELS[quote.status]}
          </Badge>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">
              Quantity
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Package className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">{quote.quantity} units</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">
              Target Price
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">{formatCurrency(quote.targetPrice)}/unit</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">
              Submitted
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{formatDate(quote.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Buyer Message */}
        <div className="p-3 rounded-xl bg-muted/50 border">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide mb-1">
            Your Message
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">{quote.message}</p>
        </div>

        {/* Seller Response — RESPONDED state */}
        {isResponded && (
          <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/20 space-y-3">
            <p className="text-[10px] text-sky-500 uppercase font-semibold tracking-wide">
              Seller Response
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quote.quotePrice != null && quote.quotePrice > 0 && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span className="text-lg font-bold text-emerald-500">
                    {formatCurrency(quote.quotePrice)}
                  </span>
                  <span className="text-xs text-muted-foreground">/unit</span>
                </div>
              )}
              {quote.respondedAt && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(quote.respondedAt)}
                  </span>
                </div>
              )}
            </div>

            {quote.responseMessage && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {quote.responseMessage}
              </p>
            )}

            {/* Accept / Decline Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                onClick={onAccept}
                disabled={isLoading}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                )}
                Accept Quote
              </Button>
              <Button
                onClick={onDecline}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl text-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                )}
                Decline
              </Button>
            </div>
          </div>
        )}

        {/* Terminal State Summary — ACCEPTED or DECLINED */}
        {isTerminal && (
          <div
            className={`p-3 rounded-xl border ${
              quote.status === "ACCEPTED"
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-rose-500/5 border-rose-500/20"
            }`}
          >
            <div className="flex items-start gap-2">
              {quote.status === "ACCEPTED" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              )}
              <div className="min-w-0">
                <span className="text-sm font-medium text-foreground">
                  {quote.status === "ACCEPTED" ? "Accepted" : "Declined"}
                </span>
                {quote.quotePrice != null && quote.quotePrice > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {" "}
                    &mdash; Seller offered {formatCurrency(quote.quotePrice)}/unit
                  </span>
                )}
                {quote.responseMessage && (
                  <p className="text-xs text-muted-foreground mt-1">{quote.responseMessage}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
