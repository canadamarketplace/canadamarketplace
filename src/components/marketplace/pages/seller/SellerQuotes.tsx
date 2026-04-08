"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useNavigation } from "@/lib/store"
import { toast } from "sonner"
import DashboardSidebar from "@/components/marketplace/layouts/DashboardSidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MessageSquare, Clock, Loader2, DollarSign, Package, User, Send, XCircle, CheckCircle2
} from "lucide-react"

type QuoteStatus = "PENDING" | "RESPONDED" | "ACCEPTED" | "DECLINED"

interface QuoteData {
  id: string
  buyerName: string
  buyerEmail?: string
  productName?: string
  productImage?: string
  quantity: number | null
  targetPrice: number | null
  message: string
  status: QuoteStatus
  response?: string
  quotePrice?: number
  createdAt: string
  updatedAt: string
}

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

function fmt(amount: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(amount)
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })
}

export default function SellerQuotes() {
  const { data: session, status: authStatus } = useSession()
  const { navigate } = useNavigation()
  const [quotes, setQuotes] = useState<QuoteData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [responding, setResponding] = useState<string | null>(null)
  const [response, setResponse] = useState("")
  const [quotePrice, setQuotePrice] = useState("")

  useEffect(() => {
    if (authStatus !== "authenticated") return
    const fetchQuotes = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/quotes")
        if (res.ok) {
          const data = await res.json()
          setQuotes(Array.isArray(data) ? data : data.quotes ?? [])
        }
      } catch { toast.error("Failed to load quotes") }
      setLoading(false)
    }
    fetchQuotes()
  }, [authStatus])

  const filtered = filter === "all" ? quotes : quotes.filter(q => q.status === filter)

  const handleRespond = async (quoteId: string, action: "RESPONDED" | "DECLINED") => {
    setResponding(quoteId)
    try {
      const body: any = { status: action }
      if (action === "RESPONDED") {
        body.response = response
        body.quotePrice = parseFloat(quotePrice) || null
      }
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(action === "RESPONDED" ? "Quote sent to buyer" : "Quote declined")
        setQuotes(prev => prev.map(q =>
          q.id === quoteId
            ? { ...q, status: action, response: action === "RESPONDED" ? response : q.response, quotePrice: action === "RESPONDED" ? parseFloat(quotePrice) || undefined : q.quotePrice }
            : q
        ))
        setResponding(null)
        setResponse("")
        setQuotePrice("")
      } else {
        toast.error("Failed to update quote")
      }
    } catch { toast.error("Network error") }
    setResponding(null)
  }

  if (authStatus === "loading") {
    return (
      <DashboardSidebar role="seller" activeItem="seller-quotes" onNavigate={p => navigate(p)}>
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      </DashboardSidebar>
    )
  }

  return (
    <DashboardSidebar role="seller" activeItem="seller-quotes" onNavigate={p => navigate(p)}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Quote Requests</h1>
              <p className="text-sm text-muted-foreground">Review and respond to buyer quote requests</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "PENDING", "RESPONDED", "ACCEPTED", "DECLINED"].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === s ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              {s === "all" ? "All" : STATUS_LABELS[s as QuoteStatus]}
              {s !== "all" && (
                <span className="ml-1 opacity-60">({quotes.filter(q => q.status === s).length})</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border bg-muted/30">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-lg font-semibold mb-1">No quote requests</h2>
            <p className="text-sm text-muted-foreground">
              {filter === "all" ? "Buyers haven't requested any quotes yet." : `No ${STATUS_LABELS[filter as QuoteStatus]?.toLowerCase()} quotes.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(quote => (
              <Card key={quote.id} className="rounded-2xl hover:shadow-md transition-shadow">
                <CardContent className="p-5 sm:p-6 space-y-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold">{quote.buyerName}</h3>
                      {quote.productName && (
                        <p className="text-sm text-muted-foreground mt-0.5">Re: {quote.productName}</p>
                      )}
                    </div>
                    <Badge variant="outline" className={`text-[10px] w-fit px-2.5 py-0.5 ${STATUS_STYLES[quote.status]}`}>
                      {STATUS_LABELS[quote.status]}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {quote.quantity && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">Quantity</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Package className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium">{quote.quantity} units</span>
                        </div>
                      </div>
                    )}
                    {quote.targetPrice != null && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">Target Price</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium">{fmt(quote.targetPrice)}/unit</span>
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">Submitted</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{fmtDate(quote.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="p-3 rounded-xl bg-muted/50 border">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide mb-1">Buyer Message</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{quote.message}</p>
                  </div>

                  {/* Seller Response (if already responded) */}
                  {(quote.status === "RESPONDED" || quote.status === "ACCEPTED") && quote.response && (
                    <div className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/20">
                      <p className="text-[10px] text-sky-500 uppercase font-semibold tracking-wide mb-1">Your Response</p>
                      <p className="text-sm">{quote.response}</p>
                      {quote.quotePrice != null && (
                        <p className="text-lg font-bold text-emerald-500 mt-1">{fmt(quote.quotePrice)}/unit</p>
                      )}
                    </div>
                  )}

                  {/* Response Form (for PENDING quotes) */}
                  {quote.status === "PENDING" && responding === quote.id && (
                    <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
                      <h4 className="text-sm font-semibold">Respond to Quote</h4>
                      <div>
                        <Label className="text-xs">Your Quote Price (per unit, CAD)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={quotePrice}
                          onChange={e => setQuotePrice(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Message to Buyer</Label>
                        <Textarea
                          placeholder="Describe your offer, terms, or conditions..."
                          value={response}
                          onChange={e => setResponse(e.target.value)}
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRespond(quote.id, "RESPONDED")}
                          disabled={!response.trim()}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                        >
                          <Send className="w-3.5 h-3.5 mr-1.5" />
                          Send Quote
                        </Button>
                        <Button
                          onClick={() => handleRespond(quote.id, "DECLINED")}
                          size="sm"
                          variant="outline"
                          className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-xl"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1.5" />
                          Decline
                        </Button>
                        <Button onClick={() => setResponding(null)} size="sm" variant="ghost">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Respond Button */}
                  {quote.status === "PENDING" && responding !== quote.id && (
                    <Button onClick={() => { setResponding(quote.id); setResponse(""); setQuotePrice("") }} size="sm" className="rounded-xl">
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Respond
                    </Button>
                  )}

                  {/* Accepted indicator */}
                  {quote.status === "ACCEPTED" && (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Buyer accepted your quote!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardSidebar>
  )
}
