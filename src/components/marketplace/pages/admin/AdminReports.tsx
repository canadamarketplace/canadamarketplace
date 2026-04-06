'use client'
import { useState } from 'react'
import { useNavigation } from '@/lib/store'
import AdminAuthGuard from './AdminAuthGuard'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, Download, TrendingUp, Users, DollarSign, Package, Eye, ShoppingBag, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Area, AreaChart, PieChart, Pie
} from 'recharts'
import { toast } from 'sonner'

const revenueByProvince = [
  { province: 'ON', revenue: 284500, orders: 3420 },
  { province: 'QC', revenue: 198700, orders: 2450 },
  { province: 'BC', revenue: 176300, orders: 2100 },
  { province: 'AB', revenue: 134200, orders: 1680 },
  { province: 'MB', revenue: 56700, orders: 710 },
  { province: 'SK', revenue: 43200, orders: 540 },
  { province: 'NS', revenue: 38900, orders: 480 },
  { province: 'NB', revenue: 22100, orders: 290 },
  { province: 'SK', revenue: 18500, orders: 230 },
  { province: 'NL', revenue: 15800, orders: 195 },
  { province: 'PE', revenue: 12400, orders: 150 },
]

const orderTrends = [
  { month: 'Jan', orders: 620, revenue: 48500 },
  { month: 'Feb', orders: 580, revenue: 43200 },
  { month: 'Mar', orders: 710, revenue: 56700 },
  { month: 'Apr', orders: 780, revenue: 62300 },
  { month: 'May', orders: 850, revenue: 68900 },
  { month: 'Jun', orders: 920, revenue: 74200 },
  { month: 'Jul', orders: 890, revenue: 71500 },
  { month: 'Aug', orders: 960, revenue: 78100 },
  { month: 'Sep', orders: 1040, revenue: 84500 },
  { month: 'Oct', orders: 1120, revenue: 92300 },
  { month: 'Nov', orders: 1350, revenue: 112800 },
  { month: 'Dec', orders: 1580, revenue: 134200 },
]

const customerGrowth = [
  { month: 'Jan', total: 1240, new: 180 },
  { month: 'Feb', total: 1380, new: 210 },
  { month: 'Mar', total: 1560, new: 260 },
  { month: 'Apr', total: 1720, new: 230 },
  { month: 'May', total: 1910, new: 290 },
  { month: 'Jun', total: 2080, new: 250 },
  { month: 'Jul', total: 2260, new: 270 },
  { month: 'Aug', total: 2450, new: 310 },
  { month: 'Sep', total: 2680, new: 330 },
  { month: 'Oct', total: 2890, new: 290 },
  { month: 'Nov', total: 3140, new: 350 },
  { month: 'Dec', total: 3420, new: 380 },
]

const bestsellers = [
  { rank: 1, name: 'Handcrafted Maple Syrup Set', store: 'Maple Lane Goods', sold: 842, revenue: 41958 },
  { rank: 2, name: 'Winter Parka - Made in Canada', store: 'Northward Apparel', sold: 634, revenue: 183666 },
  { rank: 3, name: 'Indigenous Art Print Collection', store: 'Northern Canvas', sold: 521, revenue: 67719 },
  { rank: 4, name: 'Organic BC Honey Variety', store: 'Bee Wild Farms', sold: 489, revenue: 17111 },
  { rank: 5, name: 'Wild Salmon Gift Box', store: 'Pacific Catch Co', sold: 456, revenue: 36474 },
  { rank: 6, name: 'Québec Ice Cider', store: 'Domaine Neige', sold: 398, revenue: 12338 },
  { rank: 7, name: 'Handknit Wool Blanket', store: 'Prairie Home Co', sold: 367, revenue: 34865 },
  { rank: 8, name: ' artisan Soap Gift Set', store: 'Wildcraft Studio', sold: 334, revenue: 6680 },
]

const topViewed = [
  { rank: 1, name: 'Winter Parka - Made in Canada', store: 'Northward Apparel', views: 12450 },
  { rank: 2, name: 'Handcrafted Maple Syrup Set', store: 'Maple Lane Goods', views: 9870 },
  { rank: 3, name: 'Indigenous Art Print Collection', store: 'Northern Canvas', views: 8230 },
  { rank: 4, name: 'Pacific Northwest Jewelry Set', store: 'Tide & Stone', views: 7650 },
  { rank: 5, name: 'Wild Salmon Gift Box', store: 'Pacific Catch Co', views: 6540 },
]

const categoryDistribution = [
  { name: 'Food & Beverages', value: 32, color: '#dc2626' },
  { name: 'Clothing', value: 24, color: '#a855f7' },
  { name: 'Home & Garden', value: 18, color: '#3b82f6' },
  { name: 'Art & Crafts', value: 14, color: '#22c55e' },
  { name: 'Electronics', value: 8, color: '#f97316' },
  { name: 'Other', value: 4, color: '#78716c' },
]

export default function AdminReports() {
  const { navigate } = useNavigation()

  const handleExport = (type: string) => {
    toast.success(`Exporting ${type} report as CSV...`)
  }

  const provinceColors = ['#dc2626', '#3b82f6', '#a855f7', '#22c55e', '#f97316', '#eab308', '#06b6d4', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e']

  return (
    <AdminAuthGuard>
    <DashboardSidebar role="admin" activeItem="admin-reports" onNavigate={(page) => navigate(page)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cm-primary">Reports & Analytics</h1>
            <p className="text-sm text-cm-dim mt-1">Detailed marketplace performance insights</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('sales')} className="border-cm-border-subtle text-cm-secondary hover:bg-cm-hover rounded-xl h-9 px-4 text-xs">
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export Sales
            </Button>
            <Button onClick={() => handleExport('full')} className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl h-9 px-4 text-xs">
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export All
            </Button>
          </div>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <div className="flex items-center gap-0.5 text-green-400">
                  <ArrowUpRight className="w-3 h-3" />
                  <span className="text-[10px] font-bold">12.5%</span>
                </div>
              </div>
              <p className="text-xl font-bold text-cm-primary">$843,200</p>
              <p className="text-[10px] text-cm-dim mt-0.5">Total Revenue (YTD)</p>
            </CardContent>
          </Card>
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <ShoppingBag className="w-4 h-4 text-blue-400" />
                <div className="flex items-center gap-0.5 text-green-400">
                  <ArrowUpRight className="w-3 h-3" />
                  <span className="text-[10px] font-bold">8.3%</span>
                </div>
              </div>
              <p className="text-xl font-bold text-cm-primary">12,400</p>
              <p className="text-[10px] text-cm-dim mt-0.5">Total Orders (YTD)</p>
            </CardContent>
          </Card>
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-4 h-4 text-purple-400" />
                <div className="flex items-center gap-0.5 text-green-400">
                  <ArrowUpRight className="w-3 h-3" />
                  <span className="text-[10px] font-bold">23.1%</span>
                </div>
              </div>
              <p className="text-xl font-bold text-cm-primary">3,420</p>
              <p className="text-[10px] text-cm-dim mt-0.5">Total Customers</p>
            </CardContent>
          </Card>
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-4 h-4 text-orange-400" />
                <div className="flex items-center gap-0.5 text-red-400">
                  <ArrowDownRight className="w-3 h-3" />
                  <span className="text-[10px] font-bold">2.1%</span>
                </div>
              </div>
              <p className="text-xl font-bold text-cm-primary">$68.00</p>
              <p className="text-[10px] text-cm-dim mt-0.5">Avg. Order Value</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue by Province */}
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-cm-secondary">Revenue by Province</h2>
                <Button variant="ghost" size="sm" onClick={() => handleExport('revenue-by-province')} className="text-[10px] text-cm-dim hover:text-cm-secondary rounded-lg h-7">
                  <Download className="w-3 h-3 mr-1" />CSV
                </Button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByProvince} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#78716c', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="province" tick={{ fill: '#a8a29e', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} width={30} />
                    <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e7e5e4', fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                      {revenueByProvince.map((_, i) => <Cell key={i} fill={provinceColors[i % provinceColors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Trends */}
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-cm-secondary">Order Trends</h2>
                <Button variant="ghost" size="sm" onClick={() => handleExport('order-trends')} className="text-[10px] text-cm-dim hover:text-cm-secondary rounded-lg h-7">
                  <Download className="w-3 h-3 mr-1" />CSV
                </Button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={orderTrends}>
                    <defs>
                      <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: '#78716c', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <YAxis tick={{ fill: '#78716c', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e7e5e4', fontSize: 12 }} />
                    <Area type="monotone" dataKey="orders" stroke="#dc2626" strokeWidth={2} fill="url(#orderGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Growth + Category Distribution */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-cm-secondary">Customer Growth</h2>
                <Button variant="ghost" size="sm" onClick={() => handleExport('customer-growth')} className="text-[10px] text-cm-dim hover:text-cm-secondary rounded-lg h-7">
                  <Download className="w-3 h-3 mr-1" />CSV
                </Button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={customerGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: '#78716c', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <YAxis tick={{ fill: '#78716c', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e7e5e4', fontSize: 12 }} />
                    <Line type="monotone" dataKey="total" stroke="#a855f7" strokeWidth={2} dot={false} name="Total Customers" />
                    <Line type="monotone" dataKey="new" stroke="#22c55e" strokeWidth={2} dot={false} name="New Customers" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded bg-purple-500" />
                  <span className="text-[10px] text-cm-dim">Total Customers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded bg-green-500" />
                  <span className="text-[10px] text-cm-dim">New Customers</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold text-cm-secondary mb-4">Sales by Category</h2>
              <div className="h-48 flex items-center justify-center">
                <PieChart width={180} height={180}>
                  <Pie data={categoryDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {categoryDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e7e5e4', fontSize: 12 }} formatter={(v: number) => [`${v}%`, 'Share']} />
                </PieChart>
              </div>
              <div className="space-y-1.5 mt-2">
                {categoryDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] text-cm-dim truncate">{item.name}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-cm-secondary">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bestsellers + Top Viewed */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-cm-secondary">Bestsellers</h2>
                <Button variant="ghost" size="sm" onClick={() => handleExport('bestsellers')} className="text-[10px] text-cm-dim hover:text-cm-secondary rounded-lg h-7">
                  <Download className="w-3 h-3 mr-1" />CSV
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cm-border-subtle">
                      <th className="text-left px-2 py-2 text-[10px] font-semibold text-cm-dim uppercase">#</th>
                      <th className="text-left px-2 py-2 text-[10px] font-semibold text-cm-dim uppercase">Product</th>
                      <th className="text-right px-2 py-2 text-[10px] font-semibold text-cm-dim uppercase">Sold</th>
                      <th className="text-right px-2 py-2 text-[10px] font-semibold text-cm-dim uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bestsellers.slice(0, 6).map((item) => (
                      <tr key={item.rank} className="border-b border-cm-border-subtle last:border-0 hover:bg-cm-hover">
                        <td className="px-2 py-2.5">
                          <Badge className="bg-cm-hover text-cm-muted text-[10px] border border-cm-border-hover">{item.rank}</Badge>
                        </td>
                        <td className="px-2 py-2.5">
                          <p className="text-xs font-medium text-cm-secondary truncate max-w-[180px]">{item.name}</p>
                          <p className="text-[10px] text-cm-faint">{item.store}</p>
                        </td>
                        <td className="px-2 py-2.5 text-right text-xs font-medium text-cm-secondary">{item.sold.toLocaleString()}</td>
                        <td className="px-2 py-2.5 text-right text-xs font-bold text-green-400">${item.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-cm-secondary">Top Viewed Products</h2>
                <Button variant="ghost" size="sm" onClick={() => handleExport('top-viewed')} className="text-[10px] text-cm-dim hover:text-cm-secondary rounded-lg h-7">
                  <Download className="w-3 h-3 mr-1" />CSV
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cm-border-subtle">
                      <th className="text-left px-2 py-2 text-[10px] font-semibold text-cm-dim uppercase">#</th>
                      <th className="text-left px-2 py-2 text-[10px] font-semibold text-cm-dim uppercase">Product</th>
                      <th className="text-right px-2 py-2 text-[10px] font-semibold text-cm-dim uppercase">Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topViewed.map((item) => (
                      <tr key={item.rank} className="border-b border-cm-border-subtle last:border-0 hover:bg-cm-hover">
                        <td className="px-2 py-2.5">
                          <Badge className="bg-cm-hover text-cm-muted text-[10px] border border-cm-border-hover">{item.rank}</Badge>
                        </td>
                        <td className="px-2 py-2.5">
                          <p className="text-xs font-medium text-cm-secondary truncate max-w-[200px]">{item.name}</p>
                          <p className="text-[10px] text-cm-faint">{item.store}</p>
                        </td>
                        <td className="px-2 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Eye className="w-3 h-3 text-cm-faint" />
                            <span className="text-xs font-medium text-cm-secondary">{item.views.toLocaleString()}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardSidebar>
    </AdminAuthGuard>
  )
}
