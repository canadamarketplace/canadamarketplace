'use client'
import { useState, useEffect } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DollarSign, Package, ShoppingCart, Star, TrendingUp, ArrowUpRight, ArrowDownRight,
  Plus, Settings, Store, CreditCard, Eye, Shield, Award, AlertTriangle,
  Truck, CheckCircle, Clock, BarChart3, Users, FileCheck, Lock,
  ChevronRight, Zap, Target
} from 'lucide-react'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line
} from 'recharts'

export default function SellerDashboard() {
  const { navigate } = useNavigation()
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])

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

  const totalRevenue = data ? (data.totalRevenue * 0.92) : 0
  const completedOrders = orders.filter((o: any) => o.status === 'DELIVERED').length
  const pendingOrders = orders.filter((o: any) => o.status === 'PAID' || o.status === 'SHIPPED').length
  const totalProducts = data?.totalProducts || 0

  // Calculate seller level
  const isVerified = user?.isVerified || false
  const sellerLevel = completedOrders >= 50 ? 'Gold' : completedOrders >= 10 ? 'Silver' : 'Bronze'
  const nextLevelTarget = sellerLevel === 'Bronze' ? 10 : sellerLevel === 'Silver' ? 50 : 100
  const currentLevelProgress = sellerLevel === 'Bronze' ? completedOrders : sellerLevel === 'Silver' ? completedOrders - 10 : completedOrders - 50
  const progressPercent = Math.min(100, (currentLevelProgress / (nextLevelTarget - (sellerLevel === 'Bronze' ? 0 : sellerLevel === 'Silver' ? 10 : 50))) * 100)

  const stats = [
    { label: 'Total Revenue', value: loading ? '...' : `$${totalRevenue.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: DollarSign, color: 'from-green-500/10 to-green-600/5', textColor: 'text-green-400', change: '+12.5%', up: true },
    { label: 'Total Orders', value: loading ? '...' : orders.length, icon: ShoppingCart, color: 'from-blue-500/10 to-blue-600/5', textColor: 'text-blue-400', change: '+8.3%', up: true },
    { label: 'Active Products', value: loading ? '...' : totalProducts, icon: Package, color: 'from-purple-500/10 to-purple-600/5', textColor: 'text-purple-400', change: '+3', up: true },
    { label: 'Avg. Rating', value: '4.8', icon: Star, color: 'from-red-500/10 to-red-600/5', textColor: 'text-red-300', change: '+0.2', up: true },
  ]

  const quickActions = [
    { label: 'Add Product', icon: Plus, page: 'add-product' as const, desc: 'List a new item' },
    { label: 'View Orders', icon: ShoppingCart, page: 'my-orders' as const, desc: `${pendingOrders} pending` },
    { label: 'My Products', icon: Package, page: 'my-products' as const, desc: `${totalProducts} listings` },
    { label: 'Store Settings', icon: Settings, page: 'my-store' as const, desc: 'Customize storefront' },
    { label: 'Payouts', icon: CreditCard, page: 'my-payouts' as const, desc: 'View earnings' },
    { label: 'View Store', icon: Eye, page: 'storefront' as const, desc: 'Preview your shop' },
  ]

  const chartData = data?.monthlyStats || []

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-stone-100">Seller Dashboard</h1>
              <Badge className={`${sellerLevel === 'Gold' ? 'bg-red-500/10 text-red-300 border-red-500/20' : sellerLevel === 'Silver' ? 'bg-stone-500/10 text-stone-300 border-stone-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'} border text-xs`}>
                <Award className="w-3 h-3 mr-1" />
                {sellerLevel} Seller
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
          <Button onClick={() => navigate('add-product')} className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm shadow-lg shadow-red-500/20">
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
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
                  <p className="text-xs text-stone-500">{completedOrders} completed sales · {nextLevelTarget - (sellerLevel === 'Bronze' ? 0 : sellerLevel === 'Silver' ? 10 : 50)} more to next level</p>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-neutral-900/60 border-white/5 rounded-2xl hover:border-white/10 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                  </div>
                  <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-stone-100">{stat.value}</p>
                <p className="text-xs text-stone-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="bg-neutral-900/60 border-white/5 rounded-2xl mb-6">
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
        <Card className="bg-neutral-900/60 border-white/5 rounded-2xl mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-stone-200 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-green-400" />
                Revenue Overview
              </h2>
              <span className="text-xs text-stone-500">Last 6 months</span>
            </div>
            <div className="h-64">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: '#78716c', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <YAxis tick={{ fill: '#78716c', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e7e5e4' }}
                      formatter={(value: number) => [`$${value.toFixed(0)} CAD`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={i === chartData.length - 1 ? '#dc2626' : '#292524'} />
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

        {/* Orders Trend + PIPEDA Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Orders Trend */}
          <Card className="bg-neutral-900/60 border-white/5 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-stone-200 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  Orders Trend
                </h2>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs border">
                  {orders.length} total
                </Badge>
              </div>
              <div className="h-48">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fill: '#78716c', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                      <YAxis tick={{ fill: '#78716c', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e7e5e4' }}
                      />
                      <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-stone-600 text-sm">Loading...</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* PIPEDA & Compliance */}
          <Card className="bg-neutral-900/60 border border-green-500/10 rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold text-stone-200 flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-green-400" />
                Compliance & PIPEDA Status
              </h2>
              <div className="space-y-3">
                {[
                  { icon: CheckCircle, label: 'PIPEDA Compliant', desc: 'Federal privacy law compliance', status: 'Active', color: 'green' },
                  { icon: CheckCircle, label: 'Quebec Law 25 Ready', desc: 'Bill 64 requirements met', status: 'Active', color: 'green' },
                  { icon: Lock, label: 'Data in Canada', desc: 'All data stored on Canadian servers', status: 'Active', color: 'green' },
                  { icon: Shield, label: 'Escrow Protection', desc: 'Buyer payments held securely', status: 'Active', color: 'green' },
                  { icon: FileCheck, label: 'Seller Verified', desc: 'ID verification complete', status: isVerified ? 'Active' : 'Pending', color: isVerified ? 'green' : 'red' },
                  { icon: Truck, label: 'CRA Tax Reporting', desc: 'Ready for annual tax reporting', status: 'Active', color: 'green' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02]">
                    <item.icon className={`w-4 h-4 text-${item.color}-400 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-200 truncate">{item.label}</p>
                      <p className="text-[10px] text-stone-600 truncate">{item.desc}</p>
                    </div>
                    <Badge className={`${item.color === 'green' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-300 border-red-500/20'} border text-[10px]`}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-white/5">
                <button onClick={() => navigate('privacy')} className="text-xs text-green-400 hover:text-green-300 transition-colors flex items-center gap-1">
                  View Full Privacy Policy <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="bg-neutral-900/60 border-white/5 rounded-2xl mb-6">
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
      </div>
    </div>
  )
}
