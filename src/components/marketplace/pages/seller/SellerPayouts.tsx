'use client'
import { useState, useEffect } from 'react'
import { useAuth, useNavigation } from '@/lib/store'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'

interface Payout {
  id: string; amount: number; fee: number; net: number; status: string; method: string; createdAt: string; processedAt?: string
}

export default function SellerPayouts() {
  const { user } = useAuth()
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayouts = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/payouts?sellerId=${user.id}`)
        if (res.ok) {
          const data = await res.json()
          setPayouts(data || [])
        }
      } catch {}
      setLoading(false)
    }
    fetchPayouts()
  }, [user?.id])

  const totalEarned = payouts.reduce((s, p) => s + p.net, 0)
  const pending = payouts.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING').reduce((s, p) => s + p.net, 0)
  const completed = payouts.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.net, 0)

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    COMPLETED: { label: 'Completed', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle2 },
    PENDING: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: Clock },
    PROCESSING: { label: 'Processing', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: TrendingUp },
    FAILED: { label: 'Failed', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
  }

  const { navigate } = useNavigation()

  return (
    <DashboardSidebar role="seller" activeItem="my-payouts" onNavigate={(page) => navigate(page)}>
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-cm-primary mb-8">Payouts</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-cm-primary">${totalEarned.toFixed(2)}</p>
            <p className="text-xs text-cm-dim mt-1">Total Earned</p>
          </CardContent>
        </Card>
        <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-cm-primary">${pending.toFixed(2)}</p>
            <p className="text-xs text-cm-dim mt-1">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-cm-primary">${completed.toFixed(2)}</p>
            <p className="text-xs text-cm-dim mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-cm-border-subtle">
          <h2 className="text-base font-semibold text-cm-secondary">Payout History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cm-border-subtle">
                <th className="text-left px-5 py-3 text-xs font-semibold text-cm-dim uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-cm-dim uppercase">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-cm-dim uppercase">Fee (8%)</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-cm-dim uppercase">Net</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-cm-dim uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-cm-dim text-sm">Loading...</td></tr>
              ) : payouts.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-cm-dim text-sm">No payouts yet</td></tr>
              ) : (
                payouts.map((payout) => {
                const cfg = statusConfig[payout.status] || statusConfig.PENDING
                return (
                  <tr key={payout.id} className="border-b border-cm-border-subtle last:border-0">
                    <td className="px-5 py-4 text-sm text-cm-muted">
                      {new Date(payout.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-sm text-cm-secondary">${payout.amount.toFixed(2)}</td>
                    <td className="px-5 py-4 text-sm text-cm-dim">${payout.fee.toFixed(2)}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-cm-secondary">${payout.net.toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <Badge className={`${cfg.color} text-[10px] border`}>
                        <cfg.icon className="w-3 h-3 mr-1" />
                        {cfg.label}
                      </Badge>
                    </td>
                  </tr>
                )
              })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
    </DashboardSidebar>
  )
}
