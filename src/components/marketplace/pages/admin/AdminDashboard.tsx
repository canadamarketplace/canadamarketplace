'use client'
import { useState, useEffect } from 'react'
import { useNavigation } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/types'
import { DollarSign, Users, Package, ShoppingCart, AlertTriangle, Eye } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'
import AdminAuthGuard from './AdminAuthGuard'

interface DashboardData {
  totalUsers: number; totalSellers: number; totalProducts: number; totalOrders: number
  totalRevenue: number; pendingDisputes: number; recentOrders: any[]; monthlyStats: any[]
  ordersByStatus: Array<{ status: string; _count: number }>
}

export default function AdminDashboard() {
  const { navigate } = useNavigation()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      if (res.ok) setData(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  const stats = [
    { label: 'Total Users', value: data?.totalUsers || 0, icon: Users, color: 'from-blue-500/10 to-blue-600/5', textColor: 'text-blue-400' },
    { label: 'Total Sellers', value: data?.totalSellers || 0, icon: Package, color: 'from-purple-500/10 to-purple-600/5', textColor: 'text-purple-400' },
    { label: 'Total Products', value: data?.totalProducts || 0, icon: Package, color: 'from-red-500/10 to-red-600/5', textColor: 'text-red-300' },
    { label: 'Total Revenue', value: data ? `$${data.totalRevenue.toFixed(0)}` : '$0', icon: DollarSign, color: 'from-green-500/10 to-green-600/5', textColor: 'text-green-400' },
    { label: 'Pending Disputes', value: data?.pendingDisputes || 0, icon: AlertTriangle, color: 'from-red-500/10 to-red-600/5', textColor: 'text-red-400' },
  ]

  const chartData = data?.monthlyStats || []
  const statusData = (data?.ordersByStatus || []).map((s) => ({
    name: ORDER_STATUS_LABELS[s.status as keyof typeof ORDER_STATUS_LABELS] || s.status,
    value: s._count,
  }))
  const statusColors = ['#dc2626', '#3b82f6', '#a855f7', '#22c55e', '#ef4444', '#f97316', '#78716c']

  return (
    <AdminAuthGuard>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-100">Admin Dashboard</h1>
          <p className="text-sm text-stone-500 mt-1">System overview and management</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: 'Users', page: 'admin-users' as const },
            { label: 'Products', page: 'admin-products' as const },
            { label: 'Orders', page: 'admin-orders' as const },
            { label: 'Disputes', page: 'admin-disputes' as const },
            { label: 'Settings', page: 'admin-settings' as const },
          ].map((item) => (
            <Button key={item.label} variant="outline" onClick={() => navigate(item.page)} className="border-white/10 text-stone-400 hover:text-stone-200 hover:bg-white/5 rounded-xl text-xs h-8">
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-neutral-900/60 border-white/5 rounded-2xl">
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                <stat.icon className={`w-4 h-4 ${stat.textColor}`} />
              </div>
              <p className="text-xl font-bold text-stone-100">{stat.value}</p>
              <p className="text-[10px] text-stone-500 mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 bg-neutral-900/60 border-white/5 rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold text-stone-200 mb-4">Revenue (Last 6 Months)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#78716c', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <YAxis tick={{ fill: '#78716c', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e7e5e4' }} formatter={(v: number) => [`$${v.toFixed(0)}`, 'Revenue']} />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => <Cell key={i} fill={i === chartData.length - 1 ? '#dc2626' : '#292524'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/60 border-white/5 rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold text-stone-200 mb-4">Orders by Status</h2>
            <div className="h-64 flex items-center justify-center">
              {statusData.length > 0 ? (
                <PieChart width={200} height={200}>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {statusData.map((_, i) => <Cell key={i} fill={statusColors[i % statusColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e7e5e4' }} />
                </PieChart>
              ) : (
                <p className="text-sm text-stone-600">No data</p>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              {statusData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColors[i % statusColors.length] }} />
                  <span className="text-[10px] text-stone-500">{s.name}: {s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-neutral-900/60 border-white/5 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-stone-200">Recent Orders</h2>
            <Button variant="ghost" onClick={() => navigate('admin-orders')} className="text-xs text-stone-500 hover:text-stone-300">View All →</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-stone-500 uppercase">Order</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-stone-500 uppercase">Buyer</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-stone-500 uppercase">Items</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-stone-500 uppercase">Total</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-stone-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentOrders || []).slice(0, 8).map((order: any) => (
                  <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-3 py-3 text-xs font-mono text-stone-400">{order.orderNumber}</td>
                    <td className="px-3 py-3 text-xs text-stone-300">{order.buyer?.name}</td>
                    <td className="px-3 py-3 text-xs text-stone-500">{order.items?.length || 0}</td>
                    <td className="px-3 py-3 text-xs font-semibold text-stone-200">${order.total?.toFixed(2)}</td>
                    <td className="px-3 py-3">
                      <Badge className={`${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] || ''} text-[10px] border`}>
                        {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    </AdminAuthGuard>
  )
}
