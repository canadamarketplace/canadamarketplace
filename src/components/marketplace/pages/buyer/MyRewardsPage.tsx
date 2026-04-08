"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useNavigation } from "@/lib/store"
import { toast } from "sonner"
import DashboardSidebar from "@/components/marketplace/layouts/DashboardSidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Gift,
  CreditCard,
  Star,
  Copy,
  Loader2,
  Coins,
  AlertCircle,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────────────

interface PointHistory {
  id: string
  date: string
  type: "EARNED" | "REDEEMED" | "EXPIRED"
  points: number
  description: string
}

interface RewardsData {
  pointsBalance: number
  pointHistory: PointHistory[]
}

interface CreditHistory {
  id: string
  date: string
  type: "EARNED" | "REDEEMED" | "REFUNDED"
  amount: number
  description: string
}

interface CreditsData {
  creditBalance: number
  creditHistory: CreditHistory[]
}

interface GiftCard {
  id: string
  code: string
  balance: number
  initial: number
  status: "ACTIVE" | "USED" | "EXPIRED"
  expiry: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getPointTypeStyle(type: string) {
  switch (type) {
    case "EARNED":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    case "REDEEMED":
      return "bg-sky-500/10 text-sky-400 border-sky-500/20"
    case "EXPIRED":
      return "bg-rose-500/10 text-rose-400 border-rose-500/20"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

function getCreditTypeStyle(type: string) {
  switch (type) {
    case "EARNED":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    case "REDEEMED":
      return "bg-rose-500/10 text-rose-400 border-rose-500/20"
    case "REFUNDED":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

function getGiftCardStatusStyle(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    case "USED":
      return "bg-muted text-muted-foreground border-border"
    case "EXPIRED":
      return "bg-rose-500/10 text-rose-400 border-rose-500/20"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

// ─── Points Loading Skeleton ────────────────────────────────────────────────

function PointsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <Skeleton className="h-3 w-24" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="pt-6 space-y-3">
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-3 w-28 mx-auto" />
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-2xl">
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Credits Loading Skeleton ───────────────────────────────────────────────

function CreditsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <Skeleton className="h-3 w-28" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
      <Card className="rounded-2xl">
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Gift Cards Loading Skeleton ────────────────────────────────────────────

function GiftCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-14 rounded-md" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-8 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function MyRewardsPage() {
  const { data: session, status } = useSession()
  const { navigate } = useNavigation()

  // Points state
  const [pointsLoading, setPointsLoading] = useState(true)
  const [pointsBalance, setPointsBalance] = useState(0)
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([])

  // Credits state
  const [creditsLoading, setCreditsLoading] = useState(true)
  const [creditBalance, setCreditBalance] = useState(0)
  const [creditHistory, setCreditHistory] = useState<CreditHistory[]>([])

  // Gift cards state
  const [giftCardsLoading, setGiftCardsLoading] = useState(true)
  const [giftCards, setGiftCards] = useState<GiftCard[]>([])

  // Redeem dialog state
  const [redeemOpen, setRedeemOpen] = useState(false)
  const [redeemPoints, setRedeemPoints] = useState("")
  const [redeeming, setRedeeming] = useState(false)

  // ─── Fetch Points ───────────────────────────────────────────────────────

  const fetchPoints = useCallback(async () => {
    setPointsLoading(true)
    try {
      const res = await fetch("/api/rewards")
      if (res.ok) {
        const data: RewardsData = await res.json()
        setPointsBalance(data.pointsBalance ?? 0)
        setPointHistory(data.pointHistory ?? [])
      } else {
        toast.error("Failed to load rewards data")
      }
    } catch {
      toast.error("Failed to load rewards data")
    }
    setPointsLoading(false)
  }, [])

  // ─── Fetch Credits ──────────────────────────────────────────────────────

  const fetchCredits = useCallback(async () => {
    setCreditsLoading(true)
    try {
      const res = await fetch("/api/credits")
      if (res.ok) {
        const data: CreditsData = await res.json()
        setCreditBalance(data.creditBalance ?? 0)
        setCreditHistory(data.creditHistory ?? [])
      } else {
        toast.error("Failed to load credits data")
      }
    } catch {
      toast.error("Failed to load credits data")
    }
    setCreditsLoading(false)
  }, [])

  // ─── Fetch Gift Cards ───────────────────────────────────────────────────

  const fetchGiftCards = useCallback(async () => {
    setGiftCardsLoading(true)
    try {
      const res = await fetch("/api/gift-cards")
      if (res.ok) {
        const data: GiftCard[] = await res.json()
        setGiftCards(Array.isArray(data) ? data : [])
      } else {
        toast.error("Failed to load gift cards")
      }
    } catch {
      toast.error("Failed to load gift cards")
    }
    setGiftCardsLoading(false)
  }, [])

  // ─── Load data on mount ─────────────────────────────────────────────────

  useEffect(() => {
    if (status === "authenticated") {
      fetchPoints()
      fetchCredits()
      fetchGiftCards()
    }
  }, [status, fetchPoints, fetchCredits, fetchGiftCards])

  // ─── Handle Redeem ──────────────────────────────────────────────────────

  const handleRedeem = async () => {
    const pts = parseInt(redeemPoints, 10)
    if (isNaN(pts) || pts < 100) {
      toast.error("Minimum 100 points required to redeem")
      return
    }
    if (pts > pointsBalance) {
      toast.error("Insufficient points balance")
      return
    }

    setRedeeming(true)
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: pts }),
      })
      if (res.ok) {
        const credit = (pts / 100).toFixed(2)
        toast.success(`Redeemed ${pts.toLocaleString()} points for $${credit} store credit`)
        setRedeemOpen(false)
        setRedeemPoints("")
        // Refresh points and credits data
        fetchPoints()
        fetchCredits()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || "Failed to redeem points")
      }
    } catch {
      toast.error("Network error — please try again")
    }
    setRedeeming(false)
  }

  // ─── Copy gift card code ────────────────────────────────────────────────

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(
      () => toast.success("Gift card code copied to clipboard"),
      () => toast.error("Failed to copy code")
    )
  }

  // ─── Auth guard ─────────────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <DashboardSidebar role="buyer" activeItem="my-rewards" onNavigate={(page) => navigate(page)}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </DashboardSidebar>
    )
  }

  if (!session) {
    return (
      <DashboardSidebar role="buyer" activeItem="my-rewards" onNavigate={(page) => navigate(page)}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Gift className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Sign in to view your rewards</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Access your points, credits, and gift cards by signing into your account.
          </p>
          <Button onClick={() => navigate("home")} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-8">
            Sign In
          </Button>
        </div>
      </DashboardSidebar>
    )
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <DashboardSidebar role="buyer" activeItem="my-rewards" onNavigate={(page) => navigate(page)}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">My Rewards</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Track your points, credits, and gift cards
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="points" className="space-y-6">
          <TabsList className="bg-muted rounded-xl h-10 p-1">
            <TabsTrigger
              value="points"
              className="rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Star className="w-4 h-4 mr-1.5" />
              Points
            </TabsTrigger>
            <TabsTrigger
              value="credits"
              className="rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <CreditCard className="w-4 h-4 mr-1.5" />
              Credits
            </TabsTrigger>
            <TabsTrigger
              value="giftcards"
              className="rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Gift className="w-4 h-4 mr-1.5" />
              Gift Cards
            </TabsTrigger>
          </TabsList>

          {/* ── Points Tab ──────────────────────────────────────────────── */}
          <TabsContent value="points">
            {pointsLoading ? (
              <PointsSkeleton />
            ) : (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="rounded-2xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Points Balance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold tracking-tight">
                          {pointsBalance.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground mb-1">pts</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        ≈ ${(pointsBalance / 100).toFixed(2)} store credit
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl flex flex-col justify-center">
                    <CardContent className="pt-6 space-y-3">
                      <Button
                        onClick={() => setRedeemOpen(true)}
                        disabled={pointsBalance < 100}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-11 font-medium"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Redeem Points
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        100 points = $1.00 credit &middot; Min. 100 pts
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Points History */}
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Points History</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pb-2">
                    {pointHistory.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <AlertCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No point history yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          Earn points by making purchases, writing reviews, and referring friends
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        <table className="w-full">
                          <thead className="sticky top-0 bg-background z-10">
                            <tr className="border-b">
                              <th className="text-left px-6 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Date
                              </th>
                              <th className="text-left px-6 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Type
                              </th>
                              <th className="text-left px-6 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Points
                              </th>
                              <th className="text-left px-6 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Description
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pointHistory.map((item) => (
                              <tr
                                key={item.id}
                                className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                              >
                                <td className="px-6 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(item.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-3">
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] ${getPointTypeStyle(item.type)}`}
                                  >
                                    {item.type}
                                  </Badge>
                                </td>
                                <td
                                  className={`px-6 py-3 text-sm font-semibold whitespace-nowrap ${
                                    item.points >= 0 ? "text-emerald-500" : "text-rose-500"
                                  }`}
                                >
                                  {item.points >= 0 ? "+" : ""}
                                  {item.points.toLocaleString()}
                                </td>
                                <td className="px-6 py-3 text-sm text-muted-foreground max-w-[280px] truncate">
                                  {item.description}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ── Credits Tab ─────────────────────────────────────────────── */}
          <TabsContent value="credits">
            {creditsLoading ? (
              <CreditsSkeleton />
            ) : (
              <div className="space-y-6">
                {/* Balance Card */}
                <Card className="rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Credits Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-bold tracking-tight">
                        ${creditBalance.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Available store credit
                    </p>
                  </CardContent>
                </Card>

                {/* Credit History */}
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Credit History</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pb-2">
                    {creditHistory.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <Coins className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No credit history yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          Redeem your points to earn store credit
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        <table className="w-full">
                          <thead className="sticky top-0 bg-background z-10">
                            <tr className="border-b">
                              <th className="text-left px-6 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Date
                              </th>
                              <th className="text-left px-6 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Type
                              </th>
                              <th className="text-left px-6 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Amount
                              </th>
                              <th className="text-left px-6 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Description
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {creditHistory.map((item) => (
                              <tr
                                key={item.id}
                                className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                              >
                                <td className="px-6 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(item.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-3">
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] ${getCreditTypeStyle(item.type)}`}
                                  >
                                    {item.type}
                                  </Badge>
                                </td>
                                <td
                                  className={`px-6 py-3 text-sm font-semibold whitespace-nowrap ${
                                    item.amount >= 0 ? "text-emerald-500" : "text-rose-500"
                                  }`}
                                >
                                  {item.amount >= 0 ? "+" : "-"}$
                                  {Math.abs(item.amount).toFixed(2)}
                                </td>
                                <td className="px-6 py-3 text-sm text-muted-foreground max-w-[280px] truncate">
                                  {item.description}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ── Gift Cards Tab ──────────────────────────────────────────── */}
          <TabsContent value="giftcards">
            {giftCardsLoading ? (
              <GiftCardsSkeleton />
            ) : giftCards.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border bg-muted/30">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                    <Gift className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                </div>
                <h2 className="text-lg font-semibold mb-1">No gift cards yet</h2>
                <p className="text-sm text-muted-foreground">
                  Gift cards you receive or purchase will appear here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {giftCards.map((card) => {
                  const usedPercent =
                    card.initial > 0
                      ? ((card.initial - card.balance) / card.initial) * 100
                      : 0

                  return (
                    <Card key={card.id} className="rounded-2xl overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold">Gift Card</CardTitle>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${getGiftCardStatusStyle(card.status)}`}
                          >
                            {card.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Code */}
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1.5">
                            Code
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-sm font-mono bg-muted px-3 py-1.5 rounded-lg truncate">
                              {card.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyCode(card.code)}
                              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span className="sr-only">Copy code</span>
                            </Button>
                          </div>
                        </div>

                        {/* Balance / Initial */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                              Balance
                            </p>
                            <p className="text-lg font-bold">${card.balance.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                              Initial
                            </p>
                            <p className="text-lg font-bold text-muted-foreground">
                              ${card.initial.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Usage Bar */}
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all duration-500"
                            style={{ width: `${usedPercent}%` }}
                          />
                        </div>

                        {/* Expiry */}
                        <p className="text-xs text-muted-foreground">
                          Expires {new Date(card.expiry).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ── Redeem Points Dialog ─────────────────────────────────────── */}
        <Dialog open={redeemOpen} onOpenChange={setRedeemOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Redeem Points
              </DialogTitle>
              <DialogDescription>
                Convert your points into store credit that can be used on any purchase.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Available balance */}
              <div className="p-4 rounded-xl bg-muted/50 border">
                <Label className="text-xs text-muted-foreground">Available Points</Label>
                <p className="text-2xl font-bold mt-0.5">
                  {pointsBalance.toLocaleString()} pts
                </p>
                <p className="text-xs text-muted-foreground">
                  ≈ ${(pointsBalance / 100).toFixed(2)} credit
                </p>
              </div>

              {/* Input */}
              <div>
                <Label htmlFor="redeem-amount" className="text-xs text-muted-foreground mb-1.5 block">
                  Points to Redeem (min 100)
                </Label>
                <Input
                  id="redeem-amount"
                  type="number"
                  value={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.value)}
                  placeholder="Enter points to redeem..."
                  min={100}
                  max={pointsBalance}
                  className="h-10 rounded-xl"
                />
              </div>

              {/* Preview */}
              {redeemPoints && parseInt(redeemPoints, 10) >= 100 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    You will receive{" "}
                    <span className="font-bold">
                      ${(parseInt(redeemPoints, 10) / 100).toFixed(2)}
                    </span>{" "}
                    store credit
                  </p>
                </div>
              )}

              {redeemPoints && parseInt(redeemPoints, 10) > 0 && parseInt(redeemPoints, 10) < 100 && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">
                    Minimum 100 points required to redeem
                  </p>
                </div>
              )}

              {redeemPoints && parseInt(redeemPoints, 10) > pointsBalance && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">
                    You only have {pointsBalance.toLocaleString()} points available
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setRedeemOpen(false)
                  setRedeemPoints("")
                }}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRedeem}
                disabled={
                  redeeming ||
                  !redeemPoints ||
                  parseInt(redeemPoints, 10) < 100 ||
                  parseInt(redeemPoints, 10) > pointsBalance
                }
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
              >
                {redeeming ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Star className="w-4 h-4 mr-2" />
                )}
                Redeem Points
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardSidebar>
  )
}
