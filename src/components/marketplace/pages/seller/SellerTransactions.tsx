'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  DollarSign, TrendingUp, Clock, ArrowUpRight, ArrowDownRight,
  Download, CreditCard, CheckCircle2, RefreshCcw, Wallet,
  Calendar
} from 'lucide-react'

interface Transaction {
  id: string
  date: string
  type: 'Sale' | 'Refund' | 'Payout'
  amount: number
  fee: number
  net: number
  status: 'COMPLETED' | 'PENDING' | 'PROCESSING'
}

const mockTransactions: Transaction[] = [
  { id: 'TXN-001', date: '2024-01-15', type: 'Sale', amount: 349.00, fee: 27.92, net: 321.08, status: 'COMPLETED' },
  { id: 'TXN-002', date: '2024-01-18', type: 'Payout', amount: -1500.00, fee: 0, net: -1500.00, status: 'COMPLETED' },
  { id: 'TXN-003', date: '2024-01-22', type: 'Sale', amount: 2199.00, fee: 175.92, net: 2023.08, status: 'COMPLETED' },
  { id: 'TXN-004', date: '2024-02-01', type: 'Refund', amount: -148.00, fee: 0, net: -148.00, status: 'COMPLETED' },
  { id: 'TXN-005', date: '2024-02-05', type: 'Sale', amount: 599.00, fee: 47.92, net: 551.08, status: 'PENDING' },
  { id: 'TXN-006', date: '2024-02-10', type: 'Sale', amount: 749.00, fee: 59.92, net: 689.08, status: 'PROCESSING' },
  { id: 'TXN-007', date: '2024-02-12', type: 'Sale', amount: 189.00, fee: 15.12, net: 173.88, status: 'COMPLETED' },
  { id: 'TXN-008', date: '2024-02-15', type: 'Payout', amount: -2500.00, fee: 0, net: -2500.00, status: 'COMPLETED' },
  { id: 'TXN-009', date: '2024-02-18', type: 'Sale', amount: 1249.00, fee: 99.92, net: 1149.08, status: 'COMPLETED' },
  { id: 'TXN-010', date: '2024-02-20', type: 'Refund', amount: -89.00, fee: 0, net: -89.00, status: 'PENDING' },
  { id: 'TXN-011', date: '2024-02-22', type: 'Sale', amount: 449.00, fee: 35.92, net: 413.08, status: 'COMPLETED' },
  { id: 'TXN-012', date: '2024-02-25', type: 'Sale', amount: 899.00, fee: 71.92, net: 827.08, status: 'PROCESSING' },
]

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  COMPLETED: { label: 'Completed', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle2 },
  PENDING: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: Clock },
  PROCESSING: { label: 'Processing', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: RefreshCcw },
}

const typeConfig: Record<string, { label: string; color: string; icon: typeof CreditCard }> = {
  Sale: { label: 'Sale', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: ArrowUpRight },
  Refund: { label: 'Refund', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: ArrowDownRight },
  Payout: { label: 'Payout', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: Wallet },
}

export default function SellerTransactions() {
  const { navigate } = useNavigation()
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState('all')

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`/api/payouts?sellerId=${user?.id || ''}`)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            const mapped: Transaction[] = data.map((p: any) => ({
              id: p.id || `TXN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
              date: p.createdAt || p.processedAt || new Date().toISOString(),
              type: 'Payout' as const,
              amount: -(p.net || p.amount || 0),
              fee: p.fee || 0,
              net: -(p.net || p.amount || 0),
              status: (p.status || 'COMPLETED') as Transaction['status'],
            }))
            setTransactions(mapped)
            setLoading(false)
            return
          }
        }
      } catch {}
      // Fall back to mock data
      setTransactions(mockTransactions)
      setLoading(false)
    }
    fetchTransactions()
  }, [user?.id])

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]

    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }

    if (dateRange !== 'all') {
      const now = new Date()
      let cutoff: Date
      if (dateRange === '7d') {
        cutoff = new Date(now.getTime() - 7 * 86400000)
      } else if (dateRange === '30d') {
        cutoff = new Date(now.getTime() - 30 * 86400000)
      } else if (dateRange === '90d') {
        cutoff = new Date(now.getTime() - 90 * 86400000)
      } else {
        cutoff = new Date(now.getFullYear(), 0, 1)
      }
      filtered = filtered.filter((t) => new Date(t.date) >= cutoff)
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, statusFilter, dateRange])

  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'Sale' && t.status === 'COMPLETED')
      .reduce((s, t) => s + t.net, 0)
  }, [transactions])

  const totalPayout = useMemo(() => {
    return Math.abs(
      transactions
        .filter((t) => t.type === 'Payout' && t.status === 'COMPLETED')
        .reduce((s, t) => s + t.net, 0)
    )
  }, [transactions])

  const pendingBalance = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'PENDING' || t.status === 'PROCESSING')
      .filter((t) => t.type === 'Sale')
      .reduce((s, t) => s + t.net, 0)
  }, [transactions])

  const thisMonthIncome = useMemo(() => {
    const now = new Date()
    return transactions
      .filter((t) => {
        if (t.type !== 'Sale') return false
        const d = new Date(t.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      .reduce((s, t) => s + t.net, 0)
  }, [transactions])

  const exportCSV = useCallback(() => {
    const headers = ['Transaction ID', 'Date', 'Type', 'Gross Amount', 'Fee', 'Net Amount', 'Status']
    const rows = filteredTransactions.map((t) => [
      t.id,
      new Date(t.date).toLocaleDateString('en-CA'),
      t.type,
      t.amount.toFixed(2),
      t.fee.toFixed(2),
      t.net.toFixed(2),
      t.status,
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filteredTransactions])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-cm-input" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cm-primary flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-400" />
            Transaction History
          </h1>
          <p className="text-sm text-cm-dim mt-1">
            Track all your sales, refunds, and payouts in one place
          </p>
        </div>
        <Button
          onClick={exportCSV}
          variant="outline"
          className="border-cm-border-hover text-cm-primary hover:bg-cm-hover rounded-xl text-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-cm-primary">${totalIncome.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-cm-dim mt-1">Total Income</p>
          </CardContent>
        </Card>
        <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-cm-primary">${totalPayout.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-cm-dim mt-1">Total Payout</p>
          </CardContent>
        </Card>
        <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-cm-primary">${pendingBalance.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-cm-dim mt-1">Pending Balance</p>
          </CardContent>
        </Card>
        <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-red-400" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-red-300" />
            </div>
            <p className="text-2xl font-bold text-cm-primary">${thisMonthIncome.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-cm-dim mt-1">This Month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-cm-hover border-cm-border-hover text-cm-secondary h-10 rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-cm-elevated border-cm-border-hover">
            <SelectItem value="all" className="text-cm-secondary">All Status</SelectItem>
            <SelectItem value="COMPLETED" className="text-cm-secondary">Completed</SelectItem>
            <SelectItem value="PENDING" className="text-cm-secondary">Pending</SelectItem>
            <SelectItem value="PROCESSING" className="text-cm-secondary">Processing</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40 bg-cm-hover border-cm-border-hover text-cm-secondary h-10 rounded-xl">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent className="bg-cm-elevated border-cm-border-hover">
            <SelectItem value="all" className="text-cm-secondary">All Time</SelectItem>
            <SelectItem value="7d" className="text-cm-secondary">Last 7 Days</SelectItem>
            <SelectItem value="30d" className="text-cm-secondary">Last 30 Days</SelectItem>
            <SelectItem value="90d" className="text-cm-secondary">Last 90 Days</SelectItem>
            <SelectItem value="year" className="text-cm-secondary">This Year</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-cm-dim ml-auto">
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Transactions Table */}
      <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cm-border-subtle">
                <th className="text-left px-5 py-3 text-xs font-semibold text-cm-dim uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-cm-dim uppercase">Transaction ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-cm-dim uppercase">Type</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-cm-dim uppercase">Gross</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-cm-dim uppercase">Fee</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-cm-dim uppercase">Net</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-cm-dim uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-cm-dim text-sm">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => {
                  const sCfg = statusConfig[txn.status] || statusConfig.PENDING
                  const tCfg = typeConfig[txn.type] || typeConfig.Sale
                  return (
                    <tr key={txn.id} className="border-b border-cm-border-subtle last:border-0 hover:bg-cm-hover/50 transition-colors">
                      <td className="px-5 py-4 text-sm text-cm-muted">
                        {new Date(txn.date).toLocaleDateString('en-CA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-mono text-cm-secondary">{txn.id}</span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge className={`${tCfg.color} text-[10px] border`}>
                          <tCfg.icon className="w-3 h-3 mr-1" />
                          {tCfg.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`text-sm ${txn.amount < 0 ? 'text-red-400' : 'text-cm-secondary'}`}>
                          {txn.amount < 0 ? '-' : ''}${Math.abs(txn.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm text-cm-dim">
                          {txn.fee > 0 ? `$${txn.fee.toFixed(2)}` : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`text-sm font-semibold ${txn.net < 0 ? 'text-red-400' : 'text-cm-primary'}`}>
                          {txn.net < 0 ? '-' : ''}${Math.abs(txn.net).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge className={`${sCfg.color} text-[10px] border`}>
                          <sCfg.icon className="w-3 h-3 mr-1" />
                          {sCfg.label}
                        </Badge>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-white/5">
          {filteredTransactions.length === 0 ? (
            <div className="px-5 py-12 text-center text-cm-dim text-sm">
              No transactions found
            </div>
          ) : (
            filteredTransactions.map((txn) => {
              const sCfg = statusConfig[txn.status] || statusConfig.PENDING
              const tCfg = typeConfig[txn.type] || typeConfig.Sale
              return (
                <div key={txn.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={`${tCfg.color} text-[10px] border`}>
                        <tCfg.icon className="w-3 h-3 mr-1" />
                        {tCfg.label}
                      </Badge>
                      <span className="text-xs text-cm-faint">{txn.id}</span>
                    </div>
                    <Badge className={`${sCfg.color} text-[10px] border`}>
                      <sCfg.icon className="w-3 h-3 mr-1" />
                      {sCfg.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cm-dim">
                      {new Date(txn.date).toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="text-right">
                      {txn.fee > 0 && (
                        <p className="text-[10px] text-cm-faint">Fee: ${txn.fee.toFixed(2)}</p>
                      )}
                      <p className={`text-base font-bold ${txn.net < 0 ? 'text-red-400' : 'text-cm-primary'}`}>
                        {txn.net < 0 ? '-' : ''}${Math.abs(txn.net).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}
