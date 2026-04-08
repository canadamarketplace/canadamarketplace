"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useNavigation } from "@/lib/store"
import { toast } from "sonner"
import DashboardSidebar from "@/components/marketplace/layouts/DashboardSidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Copy, Link, Users, DollarSign, TrendingUp, Gift, Share2, ExternalLink
} from "lucide-react"

export default function SellerAffiliate() {
  const { data: session, status: authStatus } = useSession()
  const { navigate } = useNavigation()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (authStatus !== "authenticated") return
    const fetchAffiliate = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/affiliate")
        if (res.ok) {
          const d = await res.json()
          setData(d)
        }
      } catch { toast.error("Failed to load affiliate data") }
      setLoading(false)
    }
    fetchAffiliate()
  }, [authStatus])

  const copyText = async (text: string, type: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${type === "code" ? "Referral code" : "Referral link"} copied!`)
      if (type === "code") setCopiedCode(true)
      else setCopiedLink(true)
      setTimeout(() => {
        if (type === "code") setCopiedCode(false)
        else setCopiedLink(false)
      }, 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const referralLink = data?.referralLink || ""

  if (authStatus === "loading") {
    return (
      <DashboardSidebar role="seller" activeItem="seller-affiliate" onNavigate={p => navigate(p)}>
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      </DashboardSidebar>
    )
  }

  if (!session) {
    return (
      <DashboardSidebar role="seller" activeItem="seller-affiliate" onNavigate={p => navigate(p)}>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <Share2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <h1 className="text-2xl font-bold mb-2">Affiliate Program</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign in to access your referral program.</p>
          <Button onClick={() => navigate("home")} className="rounded-xl">Sign In</Button>
        </div>
      </DashboardSidebar>
    )
  }

  return (
    <DashboardSidebar role="seller" activeItem="seller-affiliate" onNavigate={p => navigate(p)}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Affiliate Program</h1>
            <p className="text-sm text-muted-foreground">Earn 5% commission on referrals first purchase</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{data?.totalReferrals ?? 0}</p>
                      <p className="text-xs text-muted-foreground">Total Referrals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">${data?.totalEarnings?.toFixed(2) ?? "0.00"}</p>
                      <p className="text-xs text-muted-foreground">Total Earnings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">5%</p>
                      <p className="text-xs text-muted-foreground">Commission Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Referral Code */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Gift className="w-4 h-4 text-violet-500" />
                  Your Referral Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 rounded-xl bg-muted font-mono text-lg font-bold text-center tracking-widest">
                    {data?.referralCode || "LOADING..."}
                  </div>
                  <Button
                    onClick={() => copyText(data?.referralCode || "", "code")}
                    variant="outline"
                    className="rounded-xl shrink-0"
                  >
                    <Copy className={`w-4 h-4 ${copiedCode ? "text-emerald-500" : ""}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Referral Link */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Link className="w-4 h-4 text-violet-500" />
                  Your Referral Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Share this link with friends. When they sign up and make their first purchase, you earn 5% commission!
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 rounded-xl bg-muted text-sm truncate">
                    {referralLink || "Loading..."}
                  </div>
                  <Button
                    onClick={() => copyText(referralLink, "link")}
                    variant="outline"
                    className="rounded-xl shrink-0"
                  >
                    <Copy className={`w-4 h-4 ${copiedLink ? "text-emerald-500" : ""}`} />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Check out Canada Marketplace! Use my referral link to get started.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-medium hover:bg-sky-600 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Share on Twitter
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Share on Facebook
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { step: "1", title: "Share", desc: "Share your referral code or link with friends" },
                    { step: "2", title: "They Purchase", desc: "When referred users make their first purchase" },
                    { step: "3", title: "You Earn", desc: "You receive 5% commission on their first order" },
                  ].map(item => (
                    <div key={item.step} className="text-center p-3">
                      <div className="w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center text-sm font-bold mx-auto mb-2">
                        {item.step}
                      </div>
                      <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardSidebar>
  )
}
