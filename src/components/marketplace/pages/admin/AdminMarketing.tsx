'use client'
import { useState, useEffect } from 'react'
import { useNavigation } from '@/lib/store'
import AdminAuthGuard from './AdminAuthGuard'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Megaphone, Save, Loader2, Plus, Trash2, Star, Tag, Percent, Clock, Users, TrendingUp, Eye, Copy, Flame
} from 'lucide-react'
import { toast } from 'sonner'

interface Deal {
  id: string
  productId: string
  dealPrice: number
  startsAt: string
  endsAt: string
  maxQty: number | null
  soldQty: number
  isActive: boolean
  product: { id: string; title: string; price: number; images: string } | null
}

interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed' | 'free_shipping'
  value: number
  minOrder: number
  usageLimit: number
  usedCount: number
  status: 'active' | 'expired' | 'scheduled'
  startDate: string
  endDate: string
}

interface Promotion {
  id: string
  name: string
  type: string
  status: 'active' | 'paused' | 'ended'
  startDate: string
  endDate: string
  metrics: { views: number; conversions: number; revenue: number }
}

interface FeaturedProduct {
  id: string
  name: string
  store: string
  price: number
  image: string
  position: number
  clicks: number
}

const INITIAL_COUPONS: Coupon[] = [
  { id: '1', code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 50, usageLimit: 1000, usedCount: 342, status: 'active', startDate: '2024-01-01', endDate: '2024-12-31' },
  { id: '2', code: 'SUMMER25', type: 'percentage', value: 25, minOrder: 75, usageLimit: 500, usedCount: 487, status: 'active', startDate: '2024-06-01', endDate: '2024-08-31' },
  { id: '3', code: 'FREESHIP', type: 'free_shipping', value: 0, minOrder: 0, usageLimit: 2000, usedCount: 1203, status: 'active', startDate: '2024-01-01', endDate: '2024-12-31' },
  { id: '4', code: 'SPRING15', type: 'percentage', value: 15, minOrder: 60, usageLimit: 800, usedCount: 800, status: 'expired', startDate: '2024-03-01', endDate: '2024-05-31' },
  { id: '5', code: 'SAVE20CAD', type: 'fixed', value: 20, minOrder: 100, usageLimit: 300, usedCount: 156, status: 'active', startDate: '2024-07-01', endDate: '2024-12-31' },
]

const INITIAL_PROMOTIONS: Promotion[] = [
  { id: '1', name: 'Canada Day Sale', type: 'Flash Sale', status: 'ended', startDate: '2024-07-01', endDate: '2024-07-02', metrics: { views: 15420, conversions: 1843, revenue: 89240 } },
  { id: '2', name: 'Back to School', type: 'Seasonal', status: 'active', startDate: '2024-08-15', endDate: '2024-09-15', metrics: { views: 28350, conversions: 3421, revenue: 156780 } },
  { id: '3', name: 'Black Friday Early', type: 'Seasonal', status: 'scheduled', startDate: '2024-11-25', endDate: '2024-11-30', metrics: { views: 0, conversions: 0, revenue: 0 } },
  { id: '4', name: 'Free Shipping Weekend', type: 'Shipping Promo', status: 'ended', startDate: '2024-06-15', endDate: '2024-06-16', metrics: { views: 9870, conversions: 1234, revenue: 67890 } },
  { id: '5', name: 'New Seller Spotlight', type: 'Feature', status: 'active', startDate: '2024-09-01', endDate: '2024-09-30', metrics: { views: 12450, conversions: 987, revenue: 45670 } },
]

const INITIAL_FEATURED: FeaturedProduct[] = [
  { id: '1', name: 'Handcrafted Maple Syrup Set', store: 'Maple Lane Goods', price: 49.99, image: '🍁', position: 1, clicks: 2341 },
  { id: '2', name: 'Indigenous Art Print Collection', store: 'Northern Canvas', price: 129.99, image: '🎨', position: 2, clicks: 1876 },
  { id: '3', name: 'Organic BC Honey Variety', store: 'Bee Wild Farms', price: 34.99, image: '🍯', position: 3, clicks: 1543 },
  { id: '4', name: 'Winter Parka - Made in Canada', store: 'Northward Apparel', price: 289.99, image: '🧥', position: 4, clicks: 3201 },
  { id: '5', name: 'Wild Salmon Gift Box', store: 'Pacific Catch Co', price: 79.99, image: '🐟', position: 5, clicks: 987 },
]

export default function AdminMarketing() {
  const { navigate } = useNavigation()
  const [coupons] = useState<Coupon[]>(INITIAL_COUPONS)
  const [promotions] = useState<Promotion[]>(INITIAL_PROMOTIONS)
  const [featured] = useState<FeaturedProduct[]>(INITIAL_FEATURED)
  const [deals, setDeals] = useState<Deal[]>([])
  const [dealsLoading, setDealsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'coupons' | 'promotions' | 'featured' | 'deals'>('deals')
  const [saving, setSaving] = useState(false)

  // Create deal dialog
  const [dealDialogOpen, setDealDialogOpen] = useState(false)
  const [dealForm, setDealForm] = useState({
    productId: '',
    dealPrice: '',
    startsAt: new Date().toISOString().split('T')[0],
    endsAt: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    maxQty: '50',
    isActive: true,
  })
  const [dealSaving, setDealSaving] = useState(false)

  // Fetch deals on mount
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch('/api/deals')
        if (res.ok) {
          const data = await res.json()
          setDeals(data.deals || [])
        }
      } catch {}
      setDealsLoading(false)
    }
    fetchDeals()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    toast.success('Marketing settings saved')
    setSaving(false)
  }

  const handleCreateDeal = async () => {
    if (!dealForm.productId || !dealForm.dealPrice) {
      toast.error('Product ID and deal price are required')
      return
    }
    setDealSaving(true)
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: dealForm.productId,
          dealPrice: parseFloat(dealForm.dealPrice),
          startsAt: dealForm.startsAt,
          endsAt: dealForm.endsAt,
          maxQty: dealForm.maxQty ? parseInt(dealForm.maxQty) : null,
          isActive: dealForm.isActive,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setDeals(prev => [...prev, data.deal])
        setDealDialogOpen(false)
        setDealForm({ productId: '', dealPrice: '', startsAt: new Date().toISOString().split('T')[0], endsAt: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], maxQty: '50', isActive: true })
        toast.success('Deal created successfully!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create deal')
      }
    } catch {
      toast.error('Failed to create deal')
    }
    setDealSaving(false)
  }

  const handleDeleteDeal = async (dealId: string) => {
    try {
      const res = await fetch(`/api/deals/${dealId}?id=${dealId}`, { method: 'DELETE' })
      if (res.ok) {
        setDeals(prev => prev.filter(d => d.id !== dealId))
        toast.success('Deal deleted')
      }
    } catch {
      toast.error('Failed to delete deal')
    }
  }

  const tabs = [
    { id: 'deals' as const, label: 'Daily Deals', icon: Flame, count: deals.filter(d => d.isActive).length },
    { id: 'coupons' as const, label: 'Coupons', icon: Tag, count: coupons.filter(c => c.status === 'active').length },
    { id: 'promotions' as const, label: 'Promotions', icon: TrendingUp, count: promotions.filter(p => p.status === 'active').length },
    { id: 'featured' as const, label: 'Featured Products', icon: Star, count: featured.length },
  ]

  const statusColor: Record<string, string> = {
    active: 'bg-green-500/10 border-green-500/20 text-green-400',
    expired: 'bg-cm-hover border-cm-border-hover text-cm-faint',
    paused: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    scheduled: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    ended: 'bg-cm-hover border-cm-border-hover text-cm-faint',
    inactive: 'bg-cm-hover border-cm-border-hover text-cm-faint',
  }

  return (
    <AdminAuthGuard>
    <DashboardSidebar role="admin" activeItem="admin-marketing" onNavigate={(page) => navigate(page)}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cm-primary">Marketing</h1>
            <p className="text-sm text-cm-dim mt-1">Coupons, promotions and featured products</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl h-10 px-6"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <p className="text-[10px] text-cm-dim uppercase font-semibold">Active Deals</p>
              </div>
              <p className="text-xl font-bold text-cm-primary">{deals.filter(d => d.isActive).length}</p>
            </CardContent>
          </Card>
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-red-400" />
                <p className="text-[10px] text-cm-dim uppercase font-semibold">Active Coupons</p>
              </div>
              <p className="text-xl font-bold text-cm-primary">{coupons.filter(c => c.status === 'active').length}</p>
            </CardContent>
          </Card>
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-4 h-4 text-blue-400" />
                <p className="text-[10px] text-cm-dim uppercase font-semibold">Redemptions</p>
              </div>
              <p className="text-xl font-bold text-cm-primary">{coupons.reduce((s, c) => s + c.usedCount, 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-purple-400" />
                <p className="text-[10px] text-cm-dim uppercase font-semibold">Promo Views</p>
              </div>
              <p className="text-xl font-bold text-cm-primary">{promotions.reduce((s, p) => s + p.metrics.views, 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <p className="text-[10px] text-cm-dim uppercase font-semibold">Revenue</p>
              </div>
              <p className="text-xl font-bold text-cm-primary">${promotions.reduce((s, p) => s + p.metrics.revenue, 0).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-cm-elevated border border-cm-border-subtle rounded-xl mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-red-500/10 text-red-400'
                  : 'text-cm-dim hover:bg-cm-hover hover:text-cm-secondary'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              <Badge className="bg-cm-hover text-cm-muted text-[9px] px-1.5 py-0">{tab.count}</Badge>
            </button>
          ))}
        </div>

        {/* Daily Deals Tab */}
        {activeTab === 'deals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-cm-secondary">Daily Deals Management</h2>
              <Button onClick={() => setDealDialogOpen(true)} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white rounded-xl h-9 px-4 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> New Deal
              </Button>
            </div>
            {dealsLoading ? (
              <div className="flex items-center gap-2 text-cm-dim py-12 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading deals...
              </div>
            ) : deals.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-cm-elevated border border-cm-border-subtle">
                <Flame className="w-12 h-12 text-cm-faint mx-auto mb-3" />
                <p className="text-cm-dim">No deals created yet</p>
                <Button onClick={() => setDealDialogOpen(true)} className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl h-9 px-4 text-xs mt-4">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Create First Deal
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {deals.map((deal) => {
                  const now = new Date()
                  const ends = new Date(deal.endsAt)
                  const starts = new Date(deal.startsAt)
                  const isExpired = ends < now
                  const isUpcoming = starts > now
                  const status = isExpired ? 'expired' : isUpcoming ? 'scheduled' : deal.isActive ? 'active' : 'inactive'
                  const discount = deal.product ? Math.round(((deal.product.price - deal.dealPrice) / deal.product.price) * 100) : 0

                  return (
                    <Card key={deal.id} className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/20 flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-lg">🔥</span>
                            <span className="text-xs font-bold text-orange-400">-{discount}%</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-semibold text-cm-secondary truncate">
                                {deal.product?.title || `Product ${deal.productId.slice(0, 8)}`}
                              </h3>
                              <Badge className={`${statusColor[status] || statusColor.expired} text-[10px] border`}>{status}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2">
                              <span className="text-[10px] text-cm-dim">
                                Deal: <span className="text-orange-400 font-semibold">${deal.dealPrice.toFixed(2)}</span>
                                {deal.product && <span className="line-through ml-1">${deal.product.price.toFixed(2)}</span>}
                              </span>
                              <span className="text-[10px] text-cm-dim flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(deal.startsAt).toLocaleDateString()} → {new Date(deal.endsAt).toLocaleDateString()}
                              </span>
                              {deal.maxQty && (
                                <span className="text-[10px] text-cm-dim">
                                  Sold: {deal.soldQty}/{deal.maxQty}
                                </span>
                              )}
                            </div>
                            {/* Sold progress */}
                            {deal.maxQty && (
                              <div className="mt-2 h-1.5 bg-cm-hover rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                                  style={{ width: `${Math.min((deal.soldQty / deal.maxQty) * 100, 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg h-8">
                              <Trash2 className="w-3.5 h-3.5" onClick={() => handleDeleteDeal(deal.id)} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-cm-secondary">Coupon Management</h2>
              <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-9 px-4 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> New Coupon
              </Button>
            </div>
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <Card key={coupon.id} className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-red-400 uppercase">
                          {coupon.type === 'free_shipping' ? 'Free Ship' : coupon.type === 'fixed' ? '$ OFF' : '% OFF'}
                        </span>
                        <span className="text-lg font-bold text-cm-primary">
                          {coupon.type === 'free_shipping' ? '🎁' : coupon.type === 'fixed' ? `$${coupon.value}` : `${coupon.value}%`}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-sm font-bold text-cm-primary bg-cm-hover px-2 py-0.5 rounded-lg">{coupon.code}</code>
                          <Badge className={`${statusColor[coupon.status]} text-[10px] border`}>{coupon.status}</Badge>
                          <button onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success('Code copied!') }}>
                            <Copy className="w-3.5 h-3.5 text-cm-muted hover:text-cm-secondary" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className="text-[10px] text-cm-dim">Min order: ${coupon.minOrder}</span>
                          <span className="text-[10px] text-cm-dim">Used: {coupon.usedCount}/{coupon.usageLimit}</span>
                          <span className="text-[10px] text-cm-dim flex items-center gap-1"><Clock className="w-3 h-3" />{coupon.startDate} → {coupon.endDate}</span>
                        </div>
                        <div className="mt-2 h-1.5 bg-cm-hover rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all"
                            style={{ width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="text-xs text-cm-dim hover:text-cm-secondary rounded-lg h-8">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg h-8">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-cm-secondary">Promotional Campaigns</h2>
              <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-9 px-4 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> New Campaign
              </Button>
            </div>
            <div className="space-y-3">
              {promotions.map((promo) => (
                <Card key={promo.id} className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                      <div className="w-12 h-12 rounded-xl bg-cm-hover flex items-center justify-center text-xl flex-shrink-0">
                        <Megaphone className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-cm-secondary">{promo.name}</h3>
                          <Badge className="bg-cm-hover border-cm-border-hover text-cm-muted text-[10px] border">{promo.type}</Badge>
                          <Badge className={`${statusColor[promo.status]} text-[10px] border`}>{promo.status}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <span className="text-[10px] text-cm-dim flex items-center gap-1"><Eye className="w-3 h-3" />{promo.metrics.views.toLocaleString()} views</span>
                          <span className="text-[10px] text-cm-dim flex items-center gap-1"><Users className="w-3 h-3" />{promo.metrics.conversions.toLocaleString()} conversions</span>
                          <span className="text-[10px] text-cm-dim font-semibold text-green-400">${promo.metrics.revenue.toLocaleString()} revenue</span>
                          <span className="text-[10px] text-cm-dim flex items-center gap-1"><Clock className="w-3 h-3" />{promo.startDate} → {promo.endDate}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="text-xs text-cm-dim hover:text-cm-secondary rounded-lg h-8">Edit</Button>
                        {promo.status === 'active' && (
                          <Button variant="ghost" size="sm" className="text-xs text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg h-8">Pause</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Featured Products Tab */}
        {activeTab === 'featured' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-cm-secondary">Featured Products</h2>
              <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-9 px-4 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Product
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((product) => (
                <Card key={product.id} className="bg-cm-elevated border-cm-border-subtle rounded-2xl overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-xl bg-cm-hover flex items-center justify-center text-2xl flex-shrink-0">
                          {product.image}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-cm-secondary truncate">{product.name}</h3>
                          <p className="text-xs text-cm-dim mt-0.5">{product.store}</p>
                          <p className="text-sm font-bold text-cm-primary mt-1">${product.price.toFixed(2)}</p>
                        </div>
                        <Badge className="bg-red-500/10 border-red-500/20 text-red-400 text-[10px] border flex-shrink-0">
                          #{product.position}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-cm-border-subtle">
                        <span className="text-[10px] text-cm-dim flex items-center gap-1">
                          <Eye className="w-3 h-3" />{product.clicks.toLocaleString()} clicks
                        </span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="text-xs text-cm-dim hover:text-cm-secondary rounded-lg h-7 px-2">Edit</Button>
                          <Button variant="ghost" size="sm" className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg h-7 px-2">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Deal Dialog */}
      <Dialog open={dealDialogOpen} onOpenChange={setDealDialogOpen}>
        <DialogContent className="sm:max-w-md bg-cm-elevated border-cm-border-hover">
          <DialogHeader>
            <DialogTitle className="text-cm-primary">Create Daily Deal</DialogTitle>
            <DialogDescription className="text-cm-dim">Set up a time-limited deal for a product.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-cm-secondary text-xs mb-1.5 block">Product ID *</Label>
              <Input
                value={dealForm.productId}
                onChange={(e) => setDealForm({ ...dealForm, productId: e.target.value })}
                placeholder="Enter product ID"
                className="bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint rounded-xl"
              />
            </div>
            <div>
              <Label className="text-cm-secondary text-xs mb-1.5 block">Deal Price (CAD) *</Label>
              <Input
                type="number"
                step="0.01"
                value={dealForm.dealPrice}
                onChange={(e) => setDealForm({ ...dealForm, dealPrice: e.target.value })}
                placeholder="19.99"
                className="bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-cm-secondary text-xs mb-1.5 block">Start Date</Label>
                <Input
                  type="date"
                  value={dealForm.startsAt}
                  onChange={(e) => setDealForm({ ...dealForm, startsAt: e.target.value })}
                  className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl"
                />
              </div>
              <div>
                <Label className="text-cm-secondary text-xs mb-1.5 block">End Date</Label>
                <Input
                  type="date"
                  value={dealForm.endsAt}
                  onChange={(e) => setDealForm({ ...dealForm, endsAt: e.target.value })}
                  className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl"
                />
              </div>
            </div>
            <div>
              <Label className="text-cm-secondary text-xs mb-1.5 block">Max Quantity (optional)</Label>
              <Input
                type="number"
                value={dealForm.maxQty}
                onChange={(e) => setDealForm({ ...dealForm, maxQty: e.target.value })}
                placeholder="50"
                className="bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDealDialogOpen(false)} className="border-cm-border-hover text-cm-primary hover:bg-cm-hover rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleCreateDeal} disabled={dealSaving} className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl">
              {dealSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Flame className="w-4 h-4 mr-2" />}
              Create Deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardSidebar>
    </AdminAuthGuard>
  )
}
