'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  DollarSign, Package, ShoppingCart, Star, TrendingUp, ArrowUpRight, ArrowDownRight,
  Plus, Settings, Store, CreditCard, Eye, Shield, Award, AlertTriangle,
  Truck, CheckCircle, Clock, BarChart3, Users, FileCheck, Lock,
  ChevronRight, Zap, Target, Download, Medal, Crown, Trophy, MapPin, EyeIcon
} from 'lucide-react'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PROVINCES } from '@/lib/types'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line,
  PieChart, Pie, Legend, ComposedChart
} from 'recharts'

const PIE_COLORS = ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2', '#991b1b', '#7f1d1d', '#b91c1c', '#c2410c', '#ea580c', '#f97316', '#fb923c']

function getPerformanceBadge(monthlyRevenue: number): { label: string; icon: typeof Medal; color: string; bgColor: string; borderColor: string } {
  if (monthlyRevenue >= 5000) {
    return { label: 'Platinum', icon: Trophy, color: 'text-cm-secondary', bgColor: 'bg-stone-400/10', borderColor: 'border-stone-400/20' }
  }
  if (monthlyRevenue >= 2000) {
    return { label: 'Gold', icon: Crown, color: 'text-red-300', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' }
  }
  if (monthlyRevenue >= 500) {
    return { label: 'Silver', icon: Medal, color: 'text-cm-secondary', bgColor: 'bg-stone-500/10', borderColor: 'border-stone-500/20' }
  }
  return { label: 'Bronze', icon: Medal, color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20' }
}

// Custom legend renderer for pie charts with percentages
function CustomPieLegend({ payload, total }: { payload: Array<{ value: string; color: string; payload?: { value: number } }>; total: number }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center">
      {payload.map((entry, i) => {
        const val = entry.payload?.value || 0
        const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0'
        return (
          <div key={i} className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-cm-muted">{entry.value}</span>
            <span className="text-cm-faint">({pct}%)</span>
          </div>
        )
      })}
    </div>
  )
}

export default function SellerDashboard() {
  const { navigate } = useNavigation()
  const { user } = useAuth()
  const { t } = useTranslation()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  const fetchDashboard = async () => {
    if (!user?.storeId) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`/api/seller/dashboard?storeId=${user.storeId}`)
      if (res.ok) setData(await res.json())
    } catch {}
    setLoading(false)
  }

  const fetchOrders = async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/orders?sellerId=${user.id}`)
      if (res.ok) setOrders(await res.json())
    } catch {}
  }

  useEffect(() => {
    fetchDashboard()
    fetchOrders()
  }, [])

  // Use API data where available
  const topProducts = data?.topProducts || []
  const categoryBreakdown = data?.categoryBreakdown || []
  const provinceBreakdown = data?.provinceBreakdown || []
  const weeklyTrend = data?.weeklyTrend || []
  const recentOrders = data?.recentOrders || orders.slice(0, 5)
  const conversionRate = data?.conversionRate || 0
  const averageOrderValue = data?.averageOrderValue || 0
  const growthRates = data?.growthRates || []

  // Computed metrics
  const totalRevenue = data ? (data.totalRevenue * 0.92) : 0
  const completedOrders = orders.filter((o: any) => o.status === 'DELIVERED').length
  const pendingOrders = orders.filter((o: any) => o.status === 'PAID' || o.status === 'SHIPPED').length
  const totalProducts = data?.totalProducts || 0
  const avgOrderValueComputed = orders.length > 0 ? totalRevenue / orders.length : 0

  // Monthly revenue for this month
  const now = new Date()
  const thisMonth = orders.filter((o: any) => {
    if (o.status === 'CANCELLED') return false
    const d = new Date(o.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const thisMonthRevenue = thisMonth.reduce((sum: number, o: any) => sum + o.total * 0.92, 0)

  // Performance badge
  const badge = getPerformanceBadge(thisMonthRevenue)

  // Chart data from API
  const monthlyStats = data?.monthlyStats || []

  const twelveMonthData = useMemo(() => {
    if (monthlyStats.length >= 12) return monthlyStats.slice(-12)
    if (monthlyStats.length === 0) return Array.from({ length: 12 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (11 - i))
      return { month: d.toLocaleString('default', { month: 'short' }), revenue: 0, orders: 0 }
    })
    const result = Array.from({ length: 12 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (11 - i))
      const monthLabel = d.toLocaleString('default', { month: 'short' })
      const existing = monthlyStats.find((c: any) => c.month === monthLabel)
      return existing || { month: monthLabel, revenue: 0, orders: 0 }
    })
    return result
  }, [monthlyStats])

  // Province data from API
  const provinceData = useMemo(() => {
    if (provinceBreakdown.length > 0) {
      return provinceBreakdown.map((p: any) => {
        const fullName = PROVINCES.find(pr => pr.code === p.province)?.name || p.province
        return { name: fullName, value: Math.round(p.revenue * 100) / 100 }
      }).sort((a: any, b: any) => b.value - a.value)
    }
    // Fallback: compute from orders
    const pm: Record<string, number> = {}
    orders.forEach((o: any) => {
      if (o.status === 'CANCELLED') return
      const prov = o.shippingProvince || 'Unknown'
      pm[prov] = (pm[prov] || 0) + o.total * 0.92
    })
    return Object.entries(pm)
      .map(([name, value]) => {
        const fullName = PROVINCES.find(p => p.code === name || p.slug === name.toLowerCase())?.name || name
        return { name: fullName, value: Math.round(value * 100) / 100 }
      })
      .sort((a, b) => b.value - a.value)
  }, [provinceBreakdown, orders])

  // Category data for pie chart
  const categoryPieData = useMemo(() => {
    return categoryBreakdown.map((c: any) => ({ name: c.category, value: Math.round(c.revenue * 100) / 100 }))
  }, [categoryBreakdown])

  const categoryTotal = categoryPieData.reduce((sum: number, d: any) => sum + d.value, 0)

  // Daily order data (30 days)
  const dailyOrderData = useMemo(() => {
    const dayMap: Record<string, number> = {}
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    orders.forEach((o: any) => {
      const d = new Date(o.createdAt)
      if (d < thirtyDaysAgo) return
      const key = d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
      dayMap[key] = (dayMap[key] || 0) + 1
    })
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      const key = d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
      return { day: key, orders: dayMap[key] || 0 }
    })
  }, [orders])

  // Seller level
  const isVerified = user?.isVerified || false
  const sellerLevel = completedOrders >= 50 ? 'Gold' : completedOrders >= 10 ? 'Silver' : 'Bronze'
  const nextLevelTarget = sellerLevel === 'Bronze' ? 10 : sellerLevel === 'Silver' ? 50 : 100
  const currentLevelBase = sellerLevel === 'Bronze' ? 0 : sellerLevel === 'Silver' ? 10 : 50
  const progressPercent = Math.min(100, ((completedOrders - currentLevelBase) / (nextLevelTarget - currentLevelBase)) * 100)

  // === CSV EXPORT (Analytics Report) ===
  const exportAnalyticsCSV = useCallback(() => {
    const lines: string[] = []
    const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`

    lines.push(['Canada Marketplace - Seller Analytics Report'].map(esc).join(','))
    lines.push([t('seller.analytics.reportGenerated', { date: new Date().toLocaleDateString('en-CA') })].map(esc).join(','))
    lines.push([t('seller.analytics.reportDateRange'), `${new Date(Date.now() - 30 * 86400000).toLocaleDateString('en-CA')} - ${new Date().toLocaleDateString('en-CA')}`].map(esc).join(','))
    lines.push('')

    // Summary
    lines.push([t('seller.analytics.reportTotalRevenue'), `$${totalRevenue.toFixed(2)}`].map(esc).join(','))
    lines.push([t('seller.analytics.reportTotalOrders'), String(orders.length)].map(esc).join(','))
    lines.push([t('seller.analytics.avgOrderValue'), `$${avgOrderValueComputed.toFixed(2)}`].map(esc).join(','))
    lines.push([t('seller.analytics.conversionRate'), `${conversionRate}%`].map(esc).join(','))
    lines.push('')

    // Growth Metrics
    lines.push([t('seller.analytics.reportGrowthMetrics')].map(esc).join(','))
    growthRates.forEach((g: any) => {
      lines.push([g.metric, `$${(g.current || 0).toFixed(2)}`, `$${(g.previous || 0).toFixed(2)}`, `${g.change > 0 ? '+' : ''}${g.change}%`].map(esc).join(','))
    })
    lines.push('')

    // Top Products
    lines.push([t('seller.analytics.reportTopProducts')].map(esc).join(','))
    lines.push(['Product', 'Units Sold', 'Revenue', 'Views'].map(esc).join(','))
    topProducts.forEach((p: any) => {
      lines.push([p.title, String(p.sold), `$${p.revenue.toFixed(2)}`, String(p.views || 0)].map(esc).join(','))
    })
    lines.push('')

    // Category Breakdown
    lines.push([t('seller.analytics.reportCategoryBreakdown')].map(esc).join(','))
    lines.push(['Category', 'Revenue', 'Items'].map(esc).join(','))
    categoryBreakdown.forEach((c: any) => {
      lines.push([c.category, `$${c.revenue.toFixed(2)}`, String(c.count)].map(esc).join(','))
    })
    lines.push('')

    // Province Breakdown
    lines.push([t('seller.analytics.reportProvinceBreakdown')].map(esc).join(','))
    lines.push(['Province', 'Revenue', 'Orders'].map(esc).join(','))
    provinceBreakdown.forEach((p: any) => {
      lines.push([p.province, `$${p.revenue.toFixed(2)}`, String(p.count)].map(esc).join(','))
    })

    const csv = lines.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [totalRevenue, orders, avgOrderValueComputed, conversionRate, growthRates, topProducts, categoryBreakdown, provinceBreakdown, t])

  // === ORDER CSV EXPORT ===
  const exportOrderCSV = useCallback(() => {
    const headers = ['Order Number', 'Status', 'Date', 'Buyer', 'Items', 'Subtotal', 'Fee', 'Tax', 'Total', 'Province']
    const rows = orders.map((o: any) => [
      o.orderNumber, o.status,
      new Date(o.createdAt).toLocaleDateString('en-CA'),
      o.buyer?.name || '',
      o.items?.map((i: any) => `${i.title} (x${i.quantity})`).join('; ') || '',
      o.subtotal?.toFixed(2) || '0', o.fee?.toFixed(2) || '0',
      o.taxAmount?.toFixed(2) || '0', o.total?.toFixed(2) || '0',
      o.shippingProvince || '',
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-data-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [orders])

  const quickActions = [
    { label: t('seller.analytics.addProductDesc').split(' ').slice(0, 2).join(' '), fullLabel: t('seller.analytics.quickActions'), icon: Plus, page: 'add-product' as const, desc: t('seller.analytics.addProductDesc') },
    { label: t('seller.analytics.viewOrders'), icon: ShoppingCart, page: 'my-orders' as const, desc: t('seller.analytics.pendingAction', { count: pendingOrders }) },
    { label: t('seller.analytics.myProducts'), icon: Package, page: 'my-products' as const, desc: t('seller.analytics.listings', { count: totalProducts }) },
    { label: t('seller.analytics.storeSettings'), icon: Settings, page: 'my-store' as const, desc: t('seller.analytics.customizeStorefront') },
    { label: t('seller.analytics.payouts'), icon: CreditCard, page: 'my-payouts' as const, desc: t('seller.analytics.viewEarnings') },
    { label: t('seller.analytics.viewStore'), icon: Eye, page: 'storefront' as const, desc: t('seller.analytics.previewShop') },
  ]

  // Growth helper
  const getGrowth = (metric: string) => growthRates.find((g: any) => g.metric === metric)

  const tooltipStyle = {
    contentStyle: { backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e7e5e4' },
  }

  return (
    <DashboardSidebar role="seller" activeItem="dashboard" onNavigate={navigate}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold text-cm-primary">{t('seller.analytics.dashboard')}</h1>
              <Badge className={`${badge.bgColor} ${badge.color} ${badge.borderColor} border text-xs`}>
                <badge.icon className="w-3 h-3 mr-1" />
                {badge.label}
              </Badge>
              {isVerified && (
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 border text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {t('common.verified')}
                </Badge>
              )}
            </div>
            <p className="text-sm text-cm-dim">{t('seller.analytics.welcomeBack', { name: user?.name || 'Seller' })}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={exportAnalyticsCSV} variant="outline" className="border-cm-border-hover text-cm-primary rounded-xl text-sm h-10">
              <Download className="w-4 h-4 mr-2" />
              {t('seller.analytics.downloadReport')}
            </Button>
            <Button onClick={() => navigate('add-product')} className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm shadow-lg shadow-red-500/20 h-10">
              <Plus className="w-4 h-4 mr-2" />
              {t('seller.analytics.addNewProduct')}
            </Button>
          </div>
        </div>

        {/* Seller Level Progress */}
        <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl mb-6">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sellerLevel === 'Gold' ? 'bg-red-500/10' : sellerLevel === 'Silver' ? 'bg-stone-500/10' : 'bg-orange-500/10'}`}>
                  <Award className={`w-5 h-5 ${sellerLevel === 'Gold' ? 'text-red-300' : sellerLevel === 'Silver' ? 'text-cm-secondary' : 'text-orange-400'}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-cm-secondary">
                    {t('seller.analytics.sellerLevel', { level: sellerLevel })} → <span className="text-cm-muted">{sellerLevel === 'Gold' ? t('seller.analytics.toLevel') : sellerLevel === 'Silver' ? 'Gold' : 'Silver'}</span>
                  </h3>
                  <p className="text-xs text-cm-dim">{t('seller.analytics.completedSales', { count: completedOrders })} · {t('seller.analytics.moreToNext', { count: nextLevelTarget - completedOrders })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-cm-dim">{t('seller.analytics.fee')}: {sellerLevel === 'Gold' ? '5%' : '8%'}</span>
                <span className="text-cm-faint">•</span>
                <span className="text-cm-dim">{t('seller.analytics.sales')}: {completedOrders}</span>
              </div>
            </div>
            <Progress value={progressPercent} className="h-2 bg-cm-hover [&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-red-500 rounded-full" />
          </CardContent>
        </Card>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: t('seller.analytics.totalRevenue'), value: loading ? '...' : `$${totalRevenue.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: DollarSign, color: 'from-green-500/10 to-green-600/5', textColor: 'text-green-400' },
            { label: t('seller.analytics.monthlyRevenue'), value: loading ? '...' : `$${thisMonthRevenue.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'from-red-500/10 to-red-600/5', textColor: 'text-red-300' },
            { label: t('seller.analytics.totalOrders'), value: loading ? '...' : orders.length, icon: ShoppingCart, color: 'from-blue-500/10 to-blue-600/5', textColor: 'text-blue-400' },
            { label: t('seller.analytics.avgOrderValue'), value: loading ? '...' : `$${avgOrderValueComputed.toFixed(0)}`, icon: DollarSign, color: 'from-purple-500/10 to-purple-600/5', textColor: 'text-purple-400' },
          ].map((stat) => (
            <Card key={stat.label} className="bg-cm-elevated border-cm-border-subtle rounded-2xl hover:border-cm-border-hover transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-cm-primary">{stat.value}</p>
                <p className="text-xs text-cm-dim mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Growth Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: t('seller.analytics.revenueGrowth'), key: 'revenue', icon: TrendingUp, color: 'text-green-400' },
            { label: t('seller.analytics.ordersGrowth'), key: 'orders', icon: ShoppingCart, color: 'text-blue-400' },
            { label: t('seller.analytics.customersGrowth'), key: 'customers', icon: Users, color: 'text-purple-400' },
            { label: t('seller.analytics.avgOrderValueGrowth'), key: 'avgOrderValue', icon: DollarSign, color: 'text-red-300' },
            { label: t('seller.analytics.conversionRate'), value: `${conversionRate}%`, desc: t('seller.analytics.viewsToOrders'), icon: EyeIcon, color: 'text-red-400', noGrowth: true },
            { label: t('seller.analytics.newCustomers'), value: getGrowth('customers')?.current || 0, desc: t('seller.analytics.vsLastMonth'), icon: Users, color: 'text-red-300', noGrowth: true },
          ].map((item) => {
            const growth = !item.noGrowth ? getGrowth(item.key) : null
            const change = growth?.change || 0
            const isPositive = change >= 0
            const displayValue = item.value !== undefined ? item.value : (growth ? (item.key === 'avgOrderValue' ? `$${(growth.current || 0).toFixed(2)}` : (growth.current || 0)) : 0)
            return (
              <Card key={item.label} className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    {!item.noGrowth && change !== 0 && (
                      <span className={`flex items-center text-[11px] font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                        {Math.abs(change).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-bold text-cm-primary">{displayValue}</p>
                  <p className="text-[10px] text-cm-dim mt-0.5">{item.label}</p>
                  {!item.noGrowth && <p className="text-[9px] text-cm-faint">{t('seller.analytics.vsLastMonth')}</p>}
                  {item.noGrowth && item.desc && <p className="text-[9px] text-cm-faint">{item.desc}</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-cm-elevated border border-cm-border-subtle rounded-xl p-1 h-10">
            <TabsTrigger value="overview" className="rounded-lg text-xs data-[state=active]:bg-cm-hover data-[state=active]:text-cm-secondary text-cm-dim px-4">{t('seller.analytics.overview')}</TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg text-xs data-[state=active]:bg-cm-hover data-[state=active]:text-cm-secondary text-cm-dim px-4">{t('seller.analytics.products')}</TabsTrigger>
            <TabsTrigger value="revenue" className="rounded-lg text-xs data-[state=active]:bg-cm-hover data-[state=active]:text-cm-secondary text-cm-dim px-4">{t('seller.analytics.revenue')}</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-cm-secondary mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-300" />
                  {t('seller.analytics.quickActions')}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => navigate(action.page, action.page === 'storefront' && user?.storeSlug ? { slug: user.storeSlug } : {})}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-cm-hover border border-cm-border-subtle hover:bg-cm-hover hover:border-cm-border-hover transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-cm-hover flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                        <action.icon className="w-4 h-4 text-cm-muted group-hover:text-red-300 transition-colors" />
                      </div>
                      <span className="text-xs font-medium text-cm-secondary">{action.label}</span>
                      <span className="text-[10px] text-cm-faint">{action.desc}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Category (Donut) + Weekly Sales Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue by Category Donut Chart */}
              <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-cm-secondary flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-red-400" />
                      {t('seller.analytics.revenueByCategory')}
                    </h2>
                    <Badge className="bg-red-500/10 text-red-300 border-red-500/20 text-xs border">
                      {categoryPieData.length} {t('seller.analytics.revenue')}
                    </Badge>
                  </div>
                  <div className="h-56">
                    {categoryPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryPieData}
                            cx="50%"
                            cy="45%"
                            innerRadius={45}
                            outerRadius={75}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {categoryPieData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip {...tooltipStyle} formatter={(value: number) => [`$${value.toFixed(2)} CAD`, t('seller.analytics.revenue')]} />
                          <Legend content={<CustomPieLegend payload={categoryPieData.map((d: any) => ({ value: d.name, color: PIE_COLORS[categoryPieData.indexOf(d) % PIE_COLORS.length], payload: d }))} total={categoryTotal} />} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-cm-faint text-sm">{t('seller.analytics.noSalesData')}</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Sales Trend - Dual Axis */}
              <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-cm-secondary flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      {t('seller.analytics.weeklySalesTrend')}
                    </h2>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs border">
                      {t('seller.analytics.last7Days')}
                    </Badge>
                  </div>
                  <div className="h-56">
                    {weeklyTrend.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={weeklyTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="date" tick={{ fill: '#78716c', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                          <YAxis yAxisId="revenue" tick={{ fill: '#78716c', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} orientation="left" />
                          <YAxis yAxisId="orders" tick={{ fill: '#78716c', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} orientation="right" allowDecimals={false} />
                          <Tooltip {...tooltipStyle} content={({ payload, label }) => {
                            if (!payload || payload.length === 0) return null
                            const rev = payload.find((p: any) => p.dataKey === 'revenue')?.value || 0
                            const ords = payload.find((p: any) => p.dataKey === 'orders')?.value || 0
                            return (
                              <div className="bg-cm-elevated border border-cm-border-hover rounded-xl p-3 shadow-xl">
                                <p className="text-xs text-cm-muted mb-1">{label}</p>
                                <p className="text-sm text-cm-secondary font-semibold">${rev.toFixed(2)} {t('seller.analytics.revenue')}</p>
                                <p className="text-xs text-cm-muted">{ords} {t('seller.analytics.ordersGrowth').toLowerCase()}</p>
                              </div>
                            )
                          }} />
                          <Bar yAxisId="orders" dataKey="orders" fill="rgba(239,68,68,0.2)" radius={[4, 4, 0, 0]} barSize={20} />
                          <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#dc2626" strokeWidth={2.5} dot={{ fill: '#dc2626', r: 3 }} activeDot={{ fill: '#dc2626', r: 5 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-cm-faint text-sm">{t('seller.analytics.noSalesData')}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Chart 12 Months */}
            <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-cm-secondary flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-green-400" />
                    {t('seller.analytics.revenueOverview')}
                  </h2>
                  <span className="text-xs text-cm-dim">{t('seller.analytics.last12Months')}</span>
                </div>
                <div className="h-64">
                  {twelveMonthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={twelveMonthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" tick={{ fill: '#78716c', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                        <YAxis tick={{ fill: '#78716c', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                        <Tooltip {...tooltipStyle} formatter={(value: number) => [`$${value.toFixed(0)} CAD`, t('seller.analytics.revenue')]} />
                        <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                          {twelveMonthData.map((_, i) => (
                            <Cell key={i} fill={i === twelveMonthData.length - 1 ? '#dc2626' : i === twelveMonthData.length - 2 ? '#ef4444' : '#292524'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-cm-faint text-sm">{t('seller.analytics.noSalesData')}</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Orders Trend + Sales by Province */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Orders Trend */}
              <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-cm-secondary flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      {t('seller.analytics.ordersTrend')}
                    </h2>
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs border">
                      {orders.length} total
                    </Badge>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyOrderData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" tick={{ fill: '#78716c', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} interval={4} />
                        <YAxis tick={{ fill: '#78716c', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} allowDecimals={false} />
                        <Tooltip {...tooltipStyle} />
                        <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ fill: '#3b82f6', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Sales by Province */}
              <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-cm-secondary flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-400" />
                      {t('seller.analytics.salesByProvince')}
                    </h2>
                    <Badge className="bg-red-500/10 text-red-300 border-red-500/20 text-xs border">
                      {provinceData.length} {t('seller.analytics.regions', { count: provinceData.length })}
                    </Badge>
                  </div>
                  <div className="h-48">
                    {provinceData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={provinceData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                            {provinceData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip {...tooltipStyle} formatter={(value: number) => [`$${value.toFixed(2)} CAD`, t('seller.analytics.revenue')]} />
                          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', color: '#a8a29e' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-cm-faint text-sm">{t('seller.analytics.noSalesData')}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-cm-secondary flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-blue-400" />
                    {t('seller.analytics.recentOrders')}
                    {pendingOrders > 0 && (
                      <Badge className="bg-red-500/10 text-red-300 border-red-500/20 text-[10px] border ml-2">
                        {t('seller.analytics.pendingActionBadge', { count: pendingOrders })}
                      </Badge>
                    )}
                  </h2>
                  <Button variant="ghost" onClick={() => navigate('my-orders')} className="text-xs text-cm-secondary hover:text-cm-primary">
                    {t('seller.analytics.viewAll')} →
                  </Button>
                </div>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-10 h-10 text-cm-faint mx-auto mb-3" />
                    <p className="text-sm text-cm-faint">{t('seller.analytics.noOrdersYet')}</p>
                    <Button onClick={() => navigate('add-product')} variant="outline" className="mt-4 border-cm-border-hover text-cm-primary text-sm rounded-xl">
                      <Plus className="w-4 h-4 mr-1" /> {t('seller.analytics.addFirstProduct')}
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-cm-border-subtle">
                          <th className="text-left text-xs font-medium text-cm-dim pb-3 pr-4">{t('seller.analytics.orders')}</th>
                          <th className="text-left text-xs font-medium text-cm-dim pb-3 pr-4">{t('seller.analytics.revenue')}</th>
                          <th className="text-left text-xs font-medium text-cm-dim pb-3 pr-4">{t('orders.status')}</th>
                          <th className="text-right text-xs font-medium text-cm-dim pb-3">{t('orders.date')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order: any) => (
                          <tr key={order.id} className="border-b border-cm-border-subtle last:border-0 hover:bg-cm-hover cursor-pointer" onClick={() => navigate('order-detail', { id: order.id })}>
                            <td className="py-3 pr-4">
                              <div>
                                <p className="text-sm font-medium text-cm-secondary">{order.orderNumber}</p>
                                <p className="text-[11px] text-cm-faint">{order.buyerName} · {order.itemsCount} item(s)</p>
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              <span className="text-sm font-semibold text-cm-primary">${(order.total * 0.92).toFixed(2)}</span>
                            </td>
                            <td className="py-3 pr-4">
                              <Badge className={`${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] || ''} text-[10px] border`}>
                                {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
                              </Badge>
                            </td>
                            <td className="py-3 text-right">
                              <span className="text-xs text-cm-dim">{new Date(order.createdAt).toLocaleDateString('en-CA')}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRODUCTS TAB */}
          <TabsContent value="products" className="space-y-6">
            {/* Top Products Table */}
            <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-cm-secondary flex items-center gap-2">
                    <Star className="w-4 h-4 text-red-400" />
                    {t('seller.analytics.topProducts')}
                  </h2>
                  <Badge className="bg-red-500/10 text-red-300 border-red-500/20 text-xs border">
                    {t('seller.analytics.top5')}
                  </Badge>
                </div>
                {topProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-cm-border-subtle">
                          <th className="text-left text-xs font-medium text-cm-dim pb-3 pr-4">#</th>
                          <th className="text-left text-xs font-medium text-cm-dim pb-3 pr-4">{t('seller.analytics.product')}</th>
                          <th className="text-right text-xs font-medium text-cm-dim pb-3 pr-4">{t('seller.analytics.unitsSold')}</th>
                          <th className="text-right text-xs font-medium text-cm-dim pb-3 pr-4">{t('seller.analytics.revenue')}</th>
                          <th className="text-right text-xs font-medium text-cm-dim pb-3 pr-4">{t('seller.analytics.views')}</th>
                          <th className="text-right text-xs font-medium text-cm-dim pb-3">{t('seller.analytics.conversion')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((product: any, idx: number) => {
                          const conv = product.views > 0 ? ((product.sold / product.views) * 100).toFixed(1) : '0.0'
                          return (
                            <tr key={idx} className="border-b border-cm-border-subtle last:border-0">
                              <td className="py-3 pr-4">
                                <span className={`inline-flex w-6 h-6 rounded-lg items-center justify-center text-xs font-bold ${
                                  idx === 0 ? 'bg-red-500/10 text-red-300' :
                                  idx === 1 ? 'bg-stone-500/10 text-cm-secondary' :
                                  idx === 2 ? 'bg-orange-500/10 text-orange-400' :
                                  'bg-cm-hover text-cm-dim'
                                }`}>
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="py-3 pr-4">
                                <span className="text-sm text-cm-secondary font-medium">{product.title}</span>
                              </td>
                              <td className="py-3 pr-4 text-right">
                                <span className="text-sm text-cm-secondary">{product.sold}</span>
                              </td>
                              <td className="py-3 pr-4 text-right">
                                <span className="text-sm font-semibold text-cm-primary">${product.revenue.toFixed(2)}</span>
                              </td>
                              <td className="py-3 pr-4 text-right">
                                <span className="text-sm text-cm-muted">{product.views || 0}</span>
                              </td>
                              <td className="py-3 text-right">
                                <span className={`text-sm font-medium ${parseFloat(conv) > 5 ? 'text-green-400' : parseFloat(conv) > 2 ? 'text-red-300' : 'text-cm-muted'}`}>
                                  {conv}%
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-10 h-10 text-cm-faint mx-auto mb-3" />
                    <p className="text-sm text-cm-faint">{t('seller.analytics.noProductData')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Summary */}
            <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-base font-semibold text-cm-secondary flex items-center gap-2 mb-4">
                  <Package className="w-4 h-4 text-purple-400" />
                  {t('seller.analytics.productSummary')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-cm-hover border border-cm-border-subtle">
                    <p className="text-xs text-cm-dim mb-1">{t('seller.analytics.totalProducts')}</p>
                    <p className="text-2xl font-bold text-cm-primary">{totalProducts}</p>
                    <p className="text-[10px] text-cm-faint mt-1">{t('seller.analytics.activeListings')}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-cm-hover border border-cm-border-subtle">
                    <p className="text-xs text-cm-dim mb-1">{t('seller.analytics.uniqueProductsSold')}</p>
                    <p className="text-2xl font-bold text-cm-primary">{topProducts.length}</p>
                    <p className="text-[10px] text-cm-faint mt-1">{t('seller.analytics.differentProducts')}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-cm-hover border border-cm-border-subtle">
                    <p className="text-xs text-cm-dim mb-1">{t('seller.analytics.topProductRevenue')}</p>
                    <p className="text-2xl font-bold text-cm-primary">
                      {topProducts.length > 0 ? `$${topProducts[0].revenue.toFixed(0)}` : '$0'}
                    </p>
                    <p className="text-[10px] text-cm-faint mt-1">{topProducts[0]?.title || 'N/A'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button onClick={() => navigate('my-products')} variant="outline" className="border-cm-border-hover text-cm-primary text-sm rounded-xl">
                    {t('seller.analytics.manageProducts')} →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REVENUE TAB */}
          <TabsContent value="revenue" className="space-y-6">
            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-cm-dim">{t('seller.analytics.totalRevenueNet')}</p>
                      <p className="text-xl font-bold text-cm-primary">${totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-cm-faint">{t('seller.analytics.afterFee')}</p>
                </CardContent>
              </Card>
              <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-red-300" />
                    </div>
                    <div>
                      <p className="text-xs text-cm-dim">{t('seller.analytics.thisMonth')}</p>
                      <p className="text-xl font-bold text-cm-primary">${thisMonthRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-cm-faint">{t('seller.analytics.ordersThisMonth', { count: thisMonth.length })}</p>
                </CardContent>
              </Card>
              <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-cm-dim">{t('seller.analytics.avgOrderValue')}</p>
                      <p className="text-xl font-bold text-cm-primary">${avgOrderValueComputed.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-cm-faint">{t('seller.analytics.revenuePerOrder')}</p>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Revenue Bar Chart */}
            <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-cm-secondary flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-green-400" />
                    {t('seller.analytics.monthlyRevenue12')}
                  </h2>
                  <Button onClick={exportOrderCSV} variant="outline" size="sm" className="border-cm-border-hover text-cm-primary text-xs rounded-lg h-8">
                    <Download className="w-3 h-3 mr-1" />
                    CSV
                  </Button>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={twelveMonthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fill: '#78716c', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                      <YAxis tick={{ fill: '#78716c', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                      <Tooltip {...tooltipStyle} formatter={(value: number) => [`$${value.toFixed(0)} CAD`, t('seller.analytics.revenue')]} />
                      <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                        {twelveMonthData.map((_, i) => (
                          <Cell key={i} fill={i === twelveMonthData.length - 1 ? '#dc2626' : i === twelveMonthData.length - 2 ? '#ef4444' : '#292524'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Orders Over Time + Province Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-cm-secondary flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      {t('seller.analytics.dailyOrders30')}
                    </h2>
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyOrderData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" tick={{ fill: '#78716c', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} interval={4} />
                        <YAxis tick={{ fill: '#78716c', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} allowDecimals={false} />
                        <Tooltip {...tooltipStyle} />
                        <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ fill: '#3b82f6', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
                <CardContent className="p-6">
                  <h2 className="text-base font-semibold text-cm-secondary flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-red-400" />
                    {t('seller.analytics.revenueByProvince')}
                  </h2>
                  {provinceData.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {provinceData.map((prov: any) => {
                        const maxVal = provinceData[0].value
                        const pct = maxVal > 0 ? (prov.value / maxVal) * 100 : 0
                        return (
                          <div key={prov.name} className="flex items-center gap-3">
                            <span className="text-xs text-cm-muted w-28 truncate flex-shrink-0">{prov.name}</span>
                            <div className="flex-1 h-2 bg-cm-hover rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-500" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-cm-secondary font-medium w-20 text-right">${prov.value.toFixed(0)}</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-cm-faint text-sm">{t('seller.analytics.noSalesData')}</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-base font-semibold text-cm-secondary flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  {t('seller.analytics.performanceMetrics')}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: t('seller.analytics.completionRate'), value: '98%', desc: t('seller.analytics.completionRateDesc'), bar: 98, barColor: 'bg-green-500' },
                    { label: t('seller.analytics.avgResponseTime'), value: '2.1 hrs', desc: t('seller.analytics.avgResponseTimeDesc'), bar: 85, barColor: 'bg-blue-500' },
                    { label: t('seller.analytics.sellerRating'), value: '4.8/5', desc: t('seller.analytics.sellerRatingDesc'), bar: 96, barColor: 'bg-red-500' },
                    { label: t('seller.analytics.repeatBuyers'), value: '34%', desc: t('seller.analytics.repeatBuyersDesc'), bar: 34, barColor: 'bg-purple-500' },
                  ].map((metric) => (
                    <div key={metric.label} className="p-4 rounded-xl bg-cm-hover border border-cm-border-subtle">
                      <p className="text-xs text-cm-dim mb-1">{metric.label}</p>
                      <p className="text-lg font-bold text-cm-primary">{metric.value}</p>
                      <p className="text-[10px] text-cm-faint mb-2">{metric.desc}</p>
                      <div className="w-full h-1.5 bg-cm-hover rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${metric.barColor} transition-all`} style={{ width: `${metric.bar}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardSidebar>
  )
}
