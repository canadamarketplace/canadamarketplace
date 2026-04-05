'use client'
import { useState, useEffect, useMemo } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  DollarSign, Package, ShoppingCart, Star, TrendingUp, ArrowUpRight, ArrowDownRight,
  Plus, Settings, Store, CreditCard, Eye, Shield, Award, AlertTriangle,
  Truck, CheckCircle, Clock, BarChart3, Users, FileCheck, Lock,
  ChevronRight, Zap, Target, Download, Medal, Crown, Trophy, MapPin
} from 'lucide-react'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PROVINCES } from '@/lib/types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line,
  PieChart, Pie, Legend
} from 'recharts'

const PIE_COLORS = ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2', '#991b1b', '#7f1d1d', '#b91c1c', '#c2410c', '#ea580c', '#f97316', '#fb923c']

function getPerformanceBadge(monthlyRevenue: number): { label: string; icon: typeof Medal; color: string; bgColor: string; borderColor: string } {
  if (monthlyRevenue >= 5000) {
    return { label: 'Platinum', icon: Trophy, color: 'text-stone-200', bgColor: 'bg-stone-400/10', borderColor: 'border-stone-400/20' }
  }
  if (monthlyRevenue >= 2000) {
    return { label: 'Gold', icon: Crown, color: 'text-red-300', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' }
  }
  if (monthlyRevenue >= 500) {
    return { label: 'Silver', icon: Medal, color: 'text-stone-300', bgColor: 'bg-stone-500/10', borderColor: 'border-stone-500/20' }
  }
  return { label: 'Bronze', icon: Medal, color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20' }
}

export default function SellerDashboard() {
  const { navigate } = useNavigation()
  const { user } = useAuth()
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

  // Computed metrics
  const totalRevenue = data ? (data.totalRevenue * 0.92) : 0
  const completedOrders = orders.filter((o: any) => o.status === 'DELIVERED').length
  const pendingOrders = orders.filter((o: any) => o.status === 'PAID' || o.status === 'SHIPPED').length
  const totalProducts = data?.totalProducts || 0
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

  // Monthly revenue for this month
  const now = new Date()
  const thisMonth = orders.filter((o: any) => {
    if (o.status === 'CANCELLED') return false
    const d = new Date(o.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const thisMonthRevenue = thisMonth.reduce((sum: number, o: any) => sum + o.total * 0.92, 0)

  // Performance badge based on monthly revenue
  const badge = getPerformanceBadge(thisMonthRevenue)

  // Chart data
  const monthlyStats = data?.monthlyStats || []
  const chartData = monthlyStats.length > 0 ? monthlyStats : []

  // Generate 12-month chart data if we only have 6 months
  const twelveMonthData = useMemo(() => {
    if (chartData.length >= 12) return chartData.slice(-12)
    if (chartData.length === 0) return Array.from({ length: 12 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (11 - i))
      return { month: d.toLocaleString('default', { month: 'short' }), revenue: 0, orders: 0 }
    })
    // Pad with zeros for months we don't have
    const result = Array.from({ length: 12 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (11 - i))
      const monthLabel = d.toLocaleString('default', { month: 'short' })
      const existing = chartData.find((c: any) => c.month === monthLabel)
      return existing || { month: monthLabel, revenue: 0, orders: 0 }
    })
    return result
  }, [chartData])

  // Sales by Province data
  const provinceData = useMemo(() => {
    const provinceMap: Record<string, number> = {}
    orders.forEach((o: any) => {
      if (o.status === 'CANCELLED') return
      const prov = o.shippingProvince || 'Unknown'
      provinceMap[prov] = (provinceMap[prov] || 0) + o.total * 0.92
    })
    return Object.entries(provinceMap)
      .map(([name, value]) => {
        const fullName = PROVINCES.find(p => p.code === name || p.slug === name.toLowerCase())?.name || name
        return { name: fullName, value: Math.round(value * 100) / 100 }
      })
      .sort((a, b) => b.value - a.value)
  }, [orders])

  // Top Products data
  const topProducts = useMemo(() => {
    const productMap: Record<string, { title: string; revenue: number; units: number }> = {}
    orders.forEach((o: any) => {
      if (o.status === 'CANCELLED') return
      o.items?.forEach((item: any) => {
        if (!productMap[item.title]) {
          productMap[item.title] = { title: item.title, revenue: 0, units: 0 }
        }
        productMap[item.title].revenue += item.price * item.quantity * 0.92
        productMap[item.title].units += item.quantity
      })
    })
    return Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((p, i) => ({ ...p, rank: i + 1 }))
  }, [orders])

  // Daily order data for last 30 days
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

    const result = Array.from({ length: 30 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      const key = d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
      return { day: key, orders: dayMap[key] || 0 }
    })
    return result
  }, [orders])

  // Seller level
  const isVerified = user?.isVerified || false
  const sellerLevel = completedOrders >= 50 ? 'Gold' : completedOrders >= 10 ? 'Silver' : 'Bronze'
  const nextLevelTarget = sellerLevel === 'Bronze' ? 10 : sellerLevel === 'Silver' ? 50 : 100
  const currentLevelBase = sellerLevel === 'Bronze' ? 0 : sellerLevel === 'Silver' ? 10 : 50
  const progressPercent = Math.min(100, ((completedOrders - currentLevelBase) / (nextLevelTarget - currentLevelBase)) * 100)

  // Export CSV
  const exportCSV = () => {
    const headers = ['Order Number', 'Status', 'Date', 'Buyer', 'Items', 'Subtotal', 'Fee', 'Tax', 'Total', 'Province']
    const rows = orders.map((o: any) => [
      o.orderNumber,
      o.status,
      new Date(o.createdAt).toLocaleDateString('en-CA'),
      o.buyer?.name || '',
      o.items?.map((i: any) => `${i.title} (x${i.quantity})`).join('; ') || '',
      o.subtotal?.toFixed(2) || '0',
      o.fee?.toFixed(2) || '0',
      o.taxAmount?.toFixed(2) || '0',
      o.total?.toFixed(2) || '0',
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
  }

  const quickActions = [
    { label: 'Add Product', icon: Plus, page: 'add-product' as const, desc: 'List a new item' },
    { label: 'View Orders', icon: ShoppingCart, page: 'my-orders' as const, desc: `${pendingOrders} pending` },
    { label: 'My Products', icon: Package, page: 'my-products' as const, desc: `${totalProducts} listings` },
    { label: 'Store Settings', icon: Settings, page: 'my-store' as const, desc: 'Customize storefront' },
    { label: 'Payouts', icon: CreditCard, page: 'my-payouts' as const, desc: 'View earnings' },
    { label: 'View Store', icon: Eye, page: 'storefront' as const, desc: 'Preview your shop' },
  ]

  const tooltipStyle = {
    contentStyle: { backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e7e5e4' },
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-stone-100">Seller Dashboard</h1>
              <Badge className={`${badge.bgColor} ${badge.color} ${badge.borderColor} border text-xs`}>
                <badge.icon className="w-3 h-3 mr-1" />
                {badge.label}
              </Badge>
              {isVerified && (
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 border text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-sm text-stone-500">Welcome back, {user?.name || 'Seller'} — here&apos;s how your store is performing.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={exportCSV} variant="outline" className="border-white/10 text-stone-300 rounded-xl text-sm h-10">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => navigate('add-product')} className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm shadow-lg shadow-red-500/20 h-10">
              <Plus className="w-4 h-4 mr-2" />
              Add New Product
            </Button>
          </div>
        </div>

        {/* Seller Level Progress */}
        <Card className="bg-neutral-900/60 border-white/5 rounded-2xl mb-6">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sellerLevel === 'Gold' ? 'bg-red-500/10' : sellerLevel === 'Silver' ? 'bg-stone-500/10' : 'bg-orange-500/10'}`}>
                  <Award className={`w-5 h-5 ${sellerLevel === 'Gold' ? 'text-red-300' : sellerLevel === 'Silver' ? 'text-stone-300' : 'text-orange-400'}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-200">
                    {sellerLevel} Seller → <span className="text-stone-400">{sellerLevel === 'Gold' ? 'Maximum' : sellerLevel === 'Silver' ? 'Gold' : 'Silver'}</span>
                  </h3>
                  <p className="text-xs text-stone-500">{completedOrders} completed sales · {nextLevelTarget - completedOrders} more to next level</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-500">Fee: {sellerLevel === 'Gold' ? '5%' : '8%'}</span>
                <span className="text-stone-600">•</span>
                <span className="text-stone-500">Sales: {completedOrders}</span>
              </div>
            </div>
            <Progress value={progressPercent} className="h-2 bg-white/5 [&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-red-500 rounded-full" />
          </CardContent>
        </Card>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Revenue', value: loading ? '...' : `$${totalRevenue.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: DollarSign, color: 'from-green-500/10 to-green-600/5', textColor: 'text-green-400' },
            { label: 'Monthly Revenue', value: loading ? '...' : `$${thisMonthRevenue.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'from-red-500/10 to-red-600/5', textColor: 'text-red-300' },
            { label: 'Total Orders', value: loading ? '...' : orders.length, icon: ShoppingCart, color: 'from-blue-500/10 to-blue-600/5', textColor: 'text-blue-400' },
            { label: 'Avg Order Value', value: loading ? '...' : `$${avgOrderValue.toFixed(0)}`, icon: DollarSign, color: 'from-purple-500/10 to-purple-600/5', textColor: 'text-purple-400' },
          ].map((stat) => (
            <Card key={stat.label} className="bg-neutral-900/60 border-white/5 rounded-2xl hover:border-white/10 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-stone-100">{stat.value}</p>
                <p className="text-xs text-stone-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-neutral-900/60 border border-white/5 rounded-xl p-1 h-10">
            <TabsTrigger value="overview" className="rounded-lg text-xs data-[state=active]:bg-white/5 data-[state=active]:text-stone-200 text-stone-500 px-4">Overview</TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg text-xs data-[state=active]:bg-white/5 data-[state=active]:text-stone-200 text-stone-500 px-4">Products</TabsTrigger>
            <TabsTrigger value="revenue" className="rounded-lg text-xs data-[state=active]:bg-white/5 data-[state=active]:text-stone-200 text-stone-500 px-4">Revenue</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-neutral-900/60 border-white/5 rounded-2xl">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-stone-200 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-300" />
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => navigate(action.page, action.page === 'storefront' && user?.storeId ? { id: user.storeId } : {})}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                        <action.icon className="w-4 h-4 text-stone-400 group-hover:text-red-300 transition-colors" />
                      </div>
                      <span className="text-xs font-medium text-stone-300">{action.label}</span>
                      <span className="text-[10px] text-stone-600">{action.desc}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card className="bg-neutral-900/60 border-white/5 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-stone-200 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-green-400" />
                    Revenue Overview
                  </h2>
                  <span className="text-xs text-stone-500">Last 12 months</span>
                </div>
                <div className="h-64">
                  {twelveMonthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={twelveMonthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" tick={{ fill: '#78716c', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                        <YAxis tick={{ fill: '#78716c', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                        <Tooltip {...tooltipStyle} formatter={(value: number) => [`$${value.toFixed(0)} CAD`, 'Revenue']} />
                        <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                          {twelveMonthData.map((_, i) => (
                            <Cell key={i} fill={i === twelveMonthData.length - 1 ? '#dc2626' : i === twelveMonthData.length - 2 ? '#ef4444' : '#292524'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-stone-600 text-sm">Loading chart...</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Orders Trend + Sales by Province */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Orders Trend */}
              <Card className="bg-neutral-900/60 border-white/5 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-stone-200 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      Orders (30 Days)
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
              <Card className="bg-neutral-900/60 border-white/5 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-stone-200 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-400" />
                      Sales by Province
                    </h2>
                    <Badge className="bg-red-500/10 text-red-300 border-red-500/20 text-xs border">
                      {provinceData.length} regions
                    </Badge>
                  </div>
                  <div className="h-48">
                    {provinceData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={provinceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {provinceData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip {...tooltipStyle} formatter={(value: number) => [`$${value.toFixed(2)} CAD`, 'Revenue']} />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '10px', color: '#a8a29e' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-stone-600 text-sm">No sales data yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card className="bg-neutral-900/60 border-white/5 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-stone-200 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-blue-400" />
                    Recent Orders
                    {pendingOrders > 0 && (
                      <Badge className="bg-red-500/10 text-red-300 border-red-500/20 text-[10px] border ml-2">
                        {pendingOrders} pending action
                      </Badge>
                    )}
                  </h2>
                  <Button variant="ghost" onClick={() => navigate('my-orders')} className="text-xs text-stone-500 hover:text-stone-300">
                    View All →
                  </Button>
                </div>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-10 h-10 text-stone-700 mx-auto mb-3" />
                    <p className="text-sm text-stone-600">No orders yet</p>
                    <Button onClick={() => navigate('add-product')} variant="outline" className="mt-4 border-white/10 text-stone-300 text-sm rounded-xl">
                      <Plus className="w-4 h-4 mr-1" /> Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 8).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-stone-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-stone-200 truncate">{order.orderNumber}</p>
                            <p className="text-xs text-stone-600">{order.buyer?.name} · {order.items?.length || 0} item(s) · {new Date(order.createdAt).toLocaleDateString('en-CA')}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="text-sm font-bold text-stone-200">${order.total.toFixed(2)}</p>
                          <Badge className={`${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] || ''} text-[10px] border mt-1`}>
                            {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRODUCTS TAB */}
          <TabsContent value="products" className="space-y-6">
            {/* Top Products Table */}
            <Card className="bg-neutral-900/60 border-white/5 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-stone-200 flex items-center gap-2">
                    <Star className="w-4 h-4 text-red-400" />
                    Top Products by Revenue
                  </h2>
                  <Badge className="bg-red-500/10 text-red-300 border-red-500/20 text-xs border">
                    Top 5
                  </Badge>
                </div>
                {topProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left text-xs font-medium text-stone-500 pb-3 pr-4">#</th>
                          <th className="text-left text-xs font-medium text-stone-500 pb-3 pr-4">Product</th>
                          <th className="text-right text-xs font-medium text-stone-500 pb-3 pr-4">Units Sold</th>
                          <th className="text-right text-xs font-medium text-stone-500 pb-3">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((product) => (
                          <tr key={product.rank} className="border-b border-white/5 last:border-0">
                            <td className="py-3 pr-4">
                              <span className={`inline-flex w-6 h-6 rounded-lg items-center justify-center text-xs font-bold ${
                                product.rank === 1 ? 'bg-red-500/10 text-red-300' :
                                product.rank === 2 ? 'bg-stone-500/10 text-stone-300' :
                                product.rank === 3 ? 'bg-orange-500/10 text-orange-400' :
                                'bg-white/5 text-stone-500'
                              }`}>
                                {product.rank}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              <span className="text-sm text-stone-200 font-medium">{product.title}</span>
                            </td>
                            <td className="py-3 pr-4 text-right">
                              <span className="text-sm text-stone-300">{product.units}</span>
                            </td>
                            <td className="py-3 text-right">
                              <span className="text-sm font-semibold text-stone-100">${product.revenue.toFixed(2)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-10 h-10 text-stone-700 mx-auto mb-3" />
                    <p className="text-sm text-stone-600">No product data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Products Summary */}
            <Card className="bg-neutral-900/60 border-white/5 rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-base font-semibold text-stone-200 flex items-center gap-2 mb-4">
                  <Package className="w-4 h-4 text-purple-400" />
                  Product Summary
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-xs text-stone-500 mb-1">Total Products</p>
                    <p className="text-2xl font-bold text-stone-100">{totalProducts}</p>
                    <p className="text-[10px] text-stone-600 mt-1">Active listings</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-xs text-stone-500 mb-1">Unique Products Sold</p>
                    <p className="text-2xl font-bold text-stone-100">{topProducts.length}</p>
                    <p className="text-[10px] text-stone-600 mt-1">Different products with sales</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-xs text-stone-500 mb-1">Top Product Revenue</p>
                    <p className="text-2xl font-bold text-stone-100">
                      {topProducts.length > 0 ? `$${topProducts[0].revenue.toFixed(0)}` : '$0'}
                    </p>
                    <p className="text-[10px] text-stone-600 mt-1">{topProducts[0]?.title || 'N/A'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button onClick={() => navigate('my-products')} variant="outline" className="border-white/10 text-stone-300 text-sm rounded-xl">
                    Manage Products →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REVENUE TAB */}
          <TabsContent value="revenue" className="space-y-6">
            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-neutral-900/60 border-white/5 rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Total Revenue (Net)</p>
                      <p className="text-xl font-bold text-stone-100">${totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-600">After 8% marketplace fee</p>
                </CardContent>
              </Card>
              <Card className="bg-neutral-900/60 border-white/5 rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-red-300" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">This Month</p>
                      <p className="text-xl font-bold text-stone-100">${thisMonthRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-600">{thisMonth.length} orders this month</p>
                </CardContent>
              </Card>
              <Card className="bg-neutral-900/60 border-white/5 rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Avg Order Value</p>
                      <p className="text-xl font-bold text-stone-100">${avgOrderValue.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-600">Revenue per order (net)</p>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Revenue Bar Chart (12 months) */}
            <Card className="bg-neutral-900/60 border-white/5 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-stone-200 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-green-400" />
                    Monthly Revenue (12 Months)
                  </h2>
                  <Button onClick={exportCSV} variant="outline" size="sm" className="border-white/10 text-stone-400 text-xs rounded-lg h-8">
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
                      <Tooltip {...tooltipStyle} formatter={(value: number) => [`$${value.toFixed(0)} CAD`, 'Revenue']} />
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
              {/* Orders Over Time Line Chart */}
              <Card className="bg-neutral-900/60 border-white/5 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-stone-200 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      Daily Orders (30 Days)
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

              {/* Province Breakdown */}
              <Card className="bg-neutral-900/60 border-white/5 rounded-2xl">
                <CardContent className="p-6">
                  <h2 className="text-base font-semibold text-stone-200 flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-red-400" />
                    Revenue by Province
                  </h2>
                  {provinceData.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {provinceData.map((prov, i) => {
                        const maxVal = provinceData[0].value
                        const pct = maxVal > 0 ? (prov.value / maxVal) * 100 : 0
                        return (
                          <div key={prov.name} className="flex items-center gap-3">
                            <span className="text-xs text-stone-400 w-24 truncate flex-shrink-0">{prov.name}</span>
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-stone-300 font-medium w-20 text-right">${prov.value.toFixed(0)}</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-stone-600 text-sm">No province data yet</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card className="bg-neutral-900/60 border-white/5 rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-base font-semibold text-stone-200 flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  Performance Metrics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Completion Rate', value: '98%', desc: 'Orders delivered successfully', bar: 98, barColor: 'bg-green-500' },
                    { label: 'Avg. Response Time', value: '2.1 hrs', desc: 'Time to ship after order', bar: 85, barColor: 'bg-blue-500' },
                    { label: 'Seller Rating', value: '4.8/5', desc: 'Based on buyer reviews', bar: 96, barColor: 'bg-red-500' },
                    { label: 'Repeat Buyers', value: '34%', desc: 'Customers who bought again', bar: 34, barColor: 'bg-purple-500' },
                  ].map((metric) => (
                    <div key={metric.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-xs text-stone-500 mb-1">{metric.label}</p>
                      <p className="text-lg font-bold text-stone-100">{metric.value}</p>
                      <p className="text-[10px] text-stone-600 mb-2">{metric.desc}</p>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
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
    </div>
  )
}


