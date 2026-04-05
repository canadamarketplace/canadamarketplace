'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth, useNavigation } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tag,
  Plus,
  Copy,
  Edit2,
  Trash2,
  Check,
  Sparkles,
  Clock,
  Zap,
  TrendingDown,
  Loader2,
  Percent,
  DollarSign,
  Calendar,
  Hash,
} from 'lucide-react'
import { toast } from 'sonner'

interface Coupon {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minOrderAmount: number | null
  maxUses: number | null
  usedCount: number
  startsAt: string | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

interface CouponStats {
  total: number
  active: number
  expired: number
  totalDiscount: number
}

function generateCode(): string {
  const prefix = 'CM'
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = prefix
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

function isActivePeriod(startsAt: string | null, expiresAt: string | null, isActive: boolean): boolean {
  if (!isActive) return false
  if (isExpired(expiresAt)) return false
  if (startsAt && new Date(startsAt) > new Date()) return false
  return true
}

const emptyForm = {
  code: '',
  type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
  value: '',
  minOrderAmount: '',
  maxUses: '',
  startsAt: '',
  expiresAt: '',
  isActive: true,
}

export default function CouponsPage() {
  const { user } = useAuth()
  const { navigate } = useNavigation()
  const { t } = useTranslation()

  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [stats, setStats] = useState<CouponStats>({ total: 0, active: 0, expired: 0, totalDiscount: 0 })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all')

  const fetchCoupons = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/coupons', {
        headers: { 'x-user-id': user.id, 'x-user-role': user.role },
      })
      if (res.ok) {
        const data = await res.json()
        setCoupons(data.coupons || [])
        setStats({
          total: data.coupons?.length || 0,
          active: (data.coupons || []).filter((c: Coupon) => isActivePeriod(c.startsAt, c.expiresAt, c.isActive)).length,
          expired: (data.coupons || []).filter((c: Coupon) => isExpired(c.expiresAt)).length,
          totalDiscount: data.totalDiscount || 0,
        })
      }
    } catch (err) {
      console.error('Failed to fetch coupons:', err)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  const handleSave = async () => {
    if (!user) return
    if (!form.code.trim()) {
      toast.error('Coupon code is required')
      return
    }
    if (!form.value || parseFloat(form.value) <= 0) {
      toast.error('Discount value must be greater than 0')
      return
    }

    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: parseFloat(form.value),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        startsAt: form.startsAt || null,
        expiresAt: form.expiresAt || null,
      }

      let res: Response
      if (editingId) {
        res = await fetch(`/api/coupons/${editingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
            'x-user-role': user.role,
          },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/coupons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
            'x-user-role': user.role,
          },
          body: JSON.stringify(body),
        })
      }

      if (res.ok) {
        toast.success(editingId ? 'Coupon updated!' : 'Coupon created!')
        setDialogOpen(false)
        setForm(emptyForm)
        setEditingId(null)
        fetchCoupons()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save coupon')
      }
    } catch {
      toast.error('Failed to save coupon')
    }
    setSaving(false)
  }

  const handleToggleActive = async (coupon: Coupon) => {
    if (!user) return
    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-role': user.role,
        },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      })
      if (res.ok) {
        toast.success(coupon.isActive ? 'Coupon deactivated' : 'Coupon activated')
        fetchCoupons()
      } else {
        toast.error('Failed to update coupon')
      }
    } catch {
      toast.error('Failed to update coupon')
    }
  }

  const handleDelete = async (coupon: Coupon) => {
    if (!user) return
    if (!confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id, 'x-user-role': user.role },
      })
      if (res.ok) {
        toast.success('Coupon deleted')
        fetchCoupons()
      } else {
        toast.error('Failed to delete coupon')
      }
    } catch {
      toast.error('Failed to delete coupon')
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Copied "${code}" to clipboard`)
  }

  const openCreate = () => {
    setForm({ ...emptyForm, code: generateCode() })
    setEditingId(null)
    setDialogOpen(true)
  }

  const openEdit = (coupon: Coupon) => {
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : '',
      maxUses: coupon.maxUses ? String(coupon.maxUses) : '',
      startsAt: coupon.startsAt ? coupon.startsAt.split('T')[0] : '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '',
      isActive: coupon.isActive,
    })
    setEditingId(coupon.id)
    setDialogOpen(true)
  }

  // Filter coupons
  const filteredCoupons = coupons.filter((c) => {
    if (filter === 'active') return isActivePeriod(c.startsAt, c.expiresAt, c.isActive)
    if (filter === 'expired') return isExpired(c.expiresAt) || !c.isActive
    return true
  })

  // Not logged in or not seller
  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Tag className="w-16 h-16 text-cm-faint mb-4" />
          <h2 className="text-xl font-semibold text-cm-secondary mb-2">Sign in to manage coupons</h2>
          <p className="text-cm-dim mb-6">You need a seller account to create and manage coupons.</p>
          <Button onClick={() => useNavigation.getState().openAuthModal('login')} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  const inputClass = "bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint focus:border-red-500/50 focus:ring-red-500/20 rounded-xl h-11"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-cm-primary flex items-center gap-2">
            <Tag className="w-6 h-6 text-red-400" />
            Coupon Management
          </h1>
          <p className="text-sm text-cm-dim mt-1">Create and manage discount coupons for your customers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setForm(emptyForm); setEditingId(null) } }}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-cm-elevated border-cm-border-hover text-cm-primary max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-cm-primary">
                {editingId ? 'Edit Coupon' : 'Create New Coupon'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {/* Code */}
              <div>
                <Label className="text-cm-secondary text-xs mb-1.5 block">Coupon Code</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SAVE20"
                    className={`${inputClass} flex-1 font-mono`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setForm({ ...form, code: generateCode() })}
                    className="border-cm-border-hover text-cm-muted hover:bg-cm-hover hover:text-cm-secondary rounded-xl shrink-0"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    Auto
                  </Button>
                </div>
              </div>

              {/* Type */}
              <div>
                <Label className="text-cm-secondary text-xs mb-1.5 block">Discount Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setForm({ ...form, type: 'PERCENTAGE' })}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                      form.type === 'PERCENTAGE'
                        ? 'border-red-500/50 bg-red-500/10 text-white'
                        : 'border-cm-border-hover bg-cm-hover text-cm-muted hover:border-cm-border-hover'
                    }`}
                  >
                    <Percent className="w-4 h-4" />
                    <span className="text-sm font-medium">Percentage</span>
                  </button>
                  <button
                    onClick={() => setForm({ ...form, type: 'FIXED' })}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                      form.type === 'FIXED'
                        ? 'border-red-500/50 bg-red-500/10 text-white'
                        : 'border-cm-border-hover bg-cm-hover text-cm-muted hover:border-cm-border-hover'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium">Fixed Amount</span>
                  </button>
                </div>
              </div>

              {/* Value */}
              <div>
                <Label className="text-cm-secondary text-xs mb-1.5 block">
                  Discount Value {form.type === 'PERCENTAGE' ? '(%)' : '(CAD)'}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cm-dim text-sm">
                    {form.type === 'PERCENTAGE' ? '%' : '$'}
                  </span>
                  <Input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder={form.type === 'PERCENTAGE' ? '10' : '5.00'}
                    className={`${inputClass} pl-8`}
                    min="0"
                    step={form.type === 'PERCENTAGE' ? '1' : '0.01'}
                  />
                </div>
                {form.type === 'PERCENTAGE' && parseFloat(form.value) > 100 && (
                  <p className="text-xs text-red-400 mt-1">Percentage cannot exceed 100%</p>
                )}
              </div>

              {/* Min Order */}
              <div>
                <Label className="text-cm-secondary text-xs mb-1.5 block">Min Order Amount (CAD) — Optional</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cm-dim text-sm">$</span>
                  <Input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    placeholder="0.00"
                    className={`${inputClass} pl-8`}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Max Uses */}
              <div>
                <Label className="text-cm-secondary text-xs mb-1.5 block">Max Uses — Optional</Label>
                <Input
                  type="number"
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                  placeholder="Unlimited"
                  className={inputClass}
                  min="1"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-cm-secondary text-xs mb-1.5 block">Start Date</Label>
                  <Input
                    type="date"
                    value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label className="text-cm-secondary text-xs mb-1.5 block">Expiry Date</Label>
                  <Input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-cm-hover border border-cm-border-hover">
                <div>
                  <p className="text-sm font-medium text-cm-secondary">Active</p>
                  <p className="text-xs text-cm-dim">Customers can use this coupon</p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="flex-1 border-cm-border-hover text-cm-muted hover:bg-cm-hover rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !form.code.trim() || !form.value}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl disabled:opacity-40"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {editingId ? 'Update Coupon' : 'Create Coupon'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <div className="rounded-xl bg-cm-elevated border border-cm-border-subtle p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Tag className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-cm-primary">{stats.total}</p>
          <p className="text-xs text-cm-dim">Total Coupons</p>
        </div>
        <div className="rounded-xl bg-cm-elevated border border-cm-border-subtle p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-cm-primary">{stats.active}</p>
          <p className="text-xs text-cm-dim">Active</p>
        </div>
        <div className="rounded-xl bg-cm-elevated border border-cm-border-subtle p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-cm-primary">{stats.expired}</p>
          <p className="text-xs text-cm-dim">Expired</p>
        </div>
        <div className="rounded-xl bg-cm-elevated border border-cm-border-subtle p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-300" />
            </div>
          </div>
          <p className="text-2xl font-bold text-cm-primary">${stats.totalDiscount.toFixed(2)}</p>
          <p className="text-xs text-cm-dim">Total Discounts</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4">
        {(['all', 'active', 'expired'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'text-cm-dim hover:text-cm-secondary hover:bg-cm-hover border border-transparent'
            }`}
          >
            {f === 'all' ? `All (${coupons.length})` : f === 'active' ? `Active (${stats.active})` : `Expired (${stats.expired})`}
          </button>
        ))}
      </div>

      {/* Coupon Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
          <p className="text-sm text-cm-dim mt-3">Loading coupons...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-cm-elevated border border-cm-border-subtle">
          <div className="w-20 h-20 rounded-2xl bg-cm-input border border-cm-border-subtle flex items-center justify-center mb-5">
            <Tag className="w-10 h-10 text-cm-faint" />
          </div>
          <h3 className="text-lg font-semibold text-cm-secondary mb-2">
            {filter === 'all' ? 'No coupons yet' : filter === 'active' ? 'No active coupons' : 'No expired coupons'}
          </h3>
          <p className="text-sm text-cm-dim text-center max-w-sm mb-6">
            {filter === 'all'
              ? 'Create your first coupon to attract customers and boost sales with exclusive discounts.'
              : filter === 'active'
              ? 'All your coupons are expired or inactive. Create a new one to get started.'
              : 'None of your coupons have expired yet.'}
          </p>
          {filter === 'all' && (
            <Button onClick={openCreate} className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Coupon
            </Button>
          )}
          {filter !== 'all' && (
            <Button onClick={() => setFilter('all')} variant="outline" className="border-cm-border-hover text-cm-muted hover:bg-cm-hover rounded-xl">
              View All Coupons
            </Button>
          )}
        </div>
      ) : (
        /* Coupons Table */
        <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-cm-border-subtle hover:bg-transparent">
                  <TableHead className="text-cm-dim text-xs">Code</TableHead>
                  <TableHead className="text-cm-dim text-xs">Type</TableHead>
                  <TableHead className="text-cm-dim text-xs">Value</TableHead>
                  <TableHead className="text-cm-dim text-xs">Min Order</TableHead>
                  <TableHead className="text-cm-dim text-xs">Uses</TableHead>
                  <TableHead className="text-cm-dim text-xs">Status</TableHead>
                  <TableHead className="text-cm-dim text-xs">Dates</TableHead>
                  <TableHead className="text-cm-dim text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((coupon) => {
                  const expired = isExpired(coupon.expiresAt)
                  const active = isActivePeriod(coupon.startsAt, coupon.expiresAt, coupon.isActive)
                  return (
                    <TableRow key={coupon.id} className="border-cm-border-subtle hover:bg-cm-hover">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-red-500/10 text-red-300 px-2 py-0.5 rounded-md text-sm font-mono font-bold">
                            {coupon.code}
                          </code>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="text-cm-faint hover:text-cm-secondary transition-colors"
                            title="Copy code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] border px-1.5 py-0 ${coupon.type === 'PERCENTAGE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                          {coupon.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-cm-secondary">
                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`}
                      </TableCell>
                      <TableCell className="text-cm-muted text-sm">
                        {coupon.minOrderAmount ? `$${coupon.minOrderAmount.toFixed(2)}` : '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className={coupon.maxUses && coupon.usedCount >= coupon.maxUses ? 'text-red-400' : 'text-cm-muted'}>
                          {coupon.usedCount}
                        </span>
                        {coupon.maxUses ? <span className="text-cm-faint">/{coupon.maxUses}</span> : <span className="text-cm-faint">/∞</span>}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] border px-1.5 py-0 ${
                          active
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : expired
                            ? 'bg-stone-500/10 text-cm-dim border-stone-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {active ? 'Active' : expired ? 'Expired' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-cm-dim text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(coupon.startsAt)}</span>
                          {coupon.startsAt && <span className="text-cm-faint">→</span>}
                          <span>{formatDate(coupon.expiresAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(coupon)}
                            className="p-1.5 rounded-lg text-cm-dim hover:text-cm-secondary hover:bg-cm-hover transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(coupon)}
                            className="p-1.5 rounded-lg text-cm-dim hover:text-cm-secondary hover:bg-cm-hover transition-all"
                            title={coupon.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {coupon.isActive ? (
                              <Trash2 className="w-3.5 h-3.5" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-green-400" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-white/5">
            {filteredCoupons.map((coupon) => {
              const expired = isExpired(coupon.expiresAt)
              const active = isActivePeriod(coupon.startsAt, coupon.expiresAt, coupon.isActive)
              return (
                <div key={coupon.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <code className="bg-red-500/10 text-red-300 px-2 py-0.5 rounded-md text-sm font-mono font-bold">
                        {coupon.code}
                      </code>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className="text-cm-faint hover:text-cm-secondary transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <Badge className={`text-[10px] border px-1.5 py-0 ${
                      active
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : expired
                        ? 'bg-stone-500/10 text-cm-dim border-stone-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {active ? 'Active' : expired ? 'Expired' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-cm-hover rounded-lg p-2">
                      <p className="text-xs text-cm-dim">Value</p>
                      <p className="text-sm font-semibold text-cm-secondary">
                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`}
                      </p>
                    </div>
                    <div className="bg-cm-hover rounded-lg p-2">
                      <p className="text-xs text-cm-dim">Uses</p>
                      <p className="text-sm font-semibold text-cm-secondary">
                        {coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : '/∞'}
                      </p>
                    </div>
                    <div className="bg-cm-hover rounded-lg p-2">
                      <p className="text-xs text-cm-dim">Min Order</p>
                      <p className="text-sm font-semibold text-cm-secondary">
                        {coupon.minOrderAmount ? `$${coupon.minOrderAmount.toFixed(2)}` : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-cm-faint">
                      {formatDate(coupon.startsAt)} {coupon.startsAt && '→'} {formatDate(coupon.expiresAt)}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(coupon)}
                        className="p-1.5 rounded-lg text-cm-dim hover:text-cm-secondary hover:bg-cm-hover"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className="p-1.5 rounded-lg text-cm-dim hover:text-cm-secondary hover:bg-cm-hover"
                      >
                        {coupon.isActive ? (
                          <Trash2 className="w-3.5 h-3.5" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
