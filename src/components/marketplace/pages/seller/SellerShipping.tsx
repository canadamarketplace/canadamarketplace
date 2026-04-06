'use client'
import { useState, useMemo } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Truck, Plus, Edit, Trash2, Plane, MapPin, Clock, Package,
  AlertTriangle, CheckCircle, Globe, Zap, DollarSign, Timer
} from 'lucide-react'
import { toast } from 'sonner'

interface ShippingRate {
  id: string
  zone: string
  carrier: string
  baseRate: number
  perKg: number
  freeThreshold: number | null
  estimatedDays: string
  isActive: boolean
}

const ZONES = [
  { value: 'domestic', label: 'Domestic', desc: 'Within your province', icon: MapPin, color: 'text-green-400' },
  { value: 'regional', label: 'Regional', desc: 'Same region (multiple provinces)', icon: Truck, color: 'text-blue-400' },
  { value: 'usa', label: 'USA', desc: 'United States', icon: Globe, color: 'text-purple-400' },
  { value: 'international', label: 'International', desc: 'Rest of the world', icon: Plane, color: 'text-red-400' },
]

const CARRIERS = ['Canada Post', 'Purolator', 'UPS', 'FedEx', 'DHL']

const INITIAL_RATES: ShippingRate[] = [
  { id: '1', zone: 'domestic', carrier: 'Canada Post', baseRate: 8.99, perKg: 1.50, freeThreshold: 75, estimatedDays: '3-5 business days', isActive: true },
  { id: '2', zone: 'domestic', carrier: 'Purolator', baseRate: 12.99, perKg: 2.00, freeThreshold: 100, estimatedDays: '1-3 business days', isActive: true },
  { id: '3', zone: 'regional', carrier: 'Canada Post', baseRate: 14.99, perKg: 2.50, freeThreshold: null, estimatedDays: '5-7 business days', isActive: true },
  { id: '4', zone: 'regional', carrier: 'UPS', baseRate: 18.99, perKg: 3.00, freeThreshold: null, estimatedDays: '3-5 business days', isActive: true },
  { id: '5', zone: 'usa', carrier: 'UPS', baseRate: 24.99, perKg: 4.00, freeThreshold: null, estimatedDays: '7-14 business days', isActive: true },
  { id: '6', zone: 'usa', carrier: 'Canada Post', baseRate: 19.99, perKg: 3.50, freeThreshold: null, estimatedDays: '10-15 business days', isActive: true },
  { id: '7', zone: 'international', carrier: 'DHL', baseRate: 39.99, perKg: 8.00, freeThreshold: null, estimatedDays: '14-21 business days', isActive: false },
  { id: '8', zone: 'international', carrier: 'FedEx', baseRate: 49.99, perKg: 10.00, freeThreshold: null, estimatedDays: '10-20 business days', isActive: true },
]

const defaultForm = {
  zone: 'domestic',
  carrier: 'Canada Post',
  baseRate: '',
  perKg: '',
  freeThreshold: '',
  estimatedDays: '3-5 business days',
  isActive: true,
}

export default function SellerShipping() {
  const { navigate } = useNavigation()
  const { user } = useAuth()

  // Shipping rates
  const [rates, setRates] = useState<ShippingRate[]>(INITIAL_RATES)
  const [zoneFilter, setZoneFilter] = useState<string>('all')

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)

  // Vacation mode
  const [vacationMode, setVacationMode] = useState(false)
  const [vacationMessage, setVacationMessage] = useState('')

  // Computed stats
  const activeRates = useMemo(() => rates.filter(r => r.isActive), [rates])
  const filteredRates = useMemo(
    () => zoneFilter === 'all' ? rates : rates.filter(r => r.zone === zoneFilter),
    [rates, zoneFilter]
  )

  const cheapestRate = useMemo(() => {
    if (activeRates.length === 0) return 0
    return Math.min(...activeRates.map(r => r.baseRate))
  }, [activeRates])

  const zonesCovered = useMemo(() => {
    return new Set(activeRates.map(r => r.zone)).size
  }, [activeRates])

  const avgDelivery = useMemo(() => {
    if (activeRates.length === 0) return 'N/A'
    const avg = activeRates.reduce((sum, r) => {
      const match = r.estimatedDays.match(/(\d+)-(\d+)/)
      if (match) return sum + (parseInt(match[1]) + parseInt(match[2])) / 2
      return sum
    }, 0) / activeRates.length
    return `${Math.round(avg)} days`
  }, [activeRates])

  const handleOpenAdd = () => {
    setEditingId(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  const handleOpenEdit = (rate: ShippingRate) => {
    setEditingId(rate.id)
    setForm({
      zone: rate.zone,
      carrier: rate.carrier,
      baseRate: rate.baseRate.toString(),
      perKg: rate.perKg.toString(),
      freeThreshold: rate.freeThreshold?.toString() || '',
      estimatedDays: rate.estimatedDays,
      isActive: rate.isActive,
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.baseRate || parseFloat(form.baseRate) < 0) {
      toast.error('Please enter a valid base rate')
      return
    }
    if (!form.perKg || parseFloat(form.perKg) < 0) {
      toast.error('Please enter a valid per-KG rate')
      return
    }
    if (!form.estimatedDays.trim()) {
      toast.error('Please enter estimated delivery days')
      return
    }

    if (editingId) {
      setRates(prev =>
        prev.map(r =>
          r.id === editingId
            ? {
                ...r,
                zone: form.zone,
                carrier: form.carrier,
                baseRate: parseFloat(form.baseRate),
                perKg: parseFloat(form.perKg),
                freeThreshold: form.freeThreshold ? parseFloat(form.freeThreshold) : null,
                estimatedDays: form.estimatedDays,
                isActive: form.isActive,
              }
            : r
        )
      )
      toast.success('Shipping rate updated')
    } else {
      const newRate: ShippingRate = {
        id: Date.now().toString(),
        zone: form.zone,
        carrier: form.carrier,
        baseRate: parseFloat(form.baseRate),
        perKg: parseFloat(form.perKg),
        freeThreshold: form.freeThreshold ? parseFloat(form.freeThreshold) : null,
        estimatedDays: form.estimatedDays,
        isActive: form.isActive,
      }
      setRates(prev => [...prev, newRate])
      toast.success('Shipping rate added')
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setRates(prev => prev.filter(r => r.id !== id))
    toast.success('Shipping rate removed')
  }

  const handleToggleActive = (id: string) => {
    setRates(prev =>
      prev.map(r => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    )
  }

  const getZoneBadge = (zone: string) => {
    const z = ZONES.find(z => z.value === zone)
    if (!z) return null
    const Icon = z.icon
    return (
      <Badge variant="outline" className="gap-1.5 text-xs border-cm-border-subtle">
        <Icon className={`w-3 h-3 ${z.color}`} />
        {z.label}
      </Badge>
    )
  }

  const inputClass =
    'bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint focus:border-red-500/50 focus:ring-red-500/20 rounded-xl h-11'

  return (
    <DashboardSidebar
      role="seller"
      activeItem="seller-shipping"
      onNavigate={(page) => navigate(page)}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cm-primary">Shipping Settings</h1>
            <p className="text-sm text-cm-dim mt-1">
              Manage shipping rates, carriers, and delivery zones
            </p>
          </div>
          <Button
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Rate
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-xs text-cm-dim">Active Rates</span>
            </div>
            <p className="text-2xl font-bold text-cm-primary">{activeRates.length}</p>
            <p className="text-[10px] text-cm-faint">of {rates.length} total</p>
          </div>

          <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-xs text-cm-dim">Cheapest Rate</span>
            </div>
            <p className="text-2xl font-bold text-cm-primary">
              ${cheapestRate.toFixed(2)}
            </p>
            <p className="text-[10px] text-cm-faint">base rate</p>
          </div>

          <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Timer className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-xs text-cm-dim">Avg. Delivery</span>
            </div>
            <p className="text-2xl font-bold text-cm-primary">{avgDelivery}</p>
            <p className="text-[10px] text-cm-faint">business days</p>
          </div>

          <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-orange-400" />
              </div>
              <span className="text-xs text-cm-dim">Zones Covered</span>
            </div>
            <p className="text-2xl font-bold text-cm-primary">{zonesCovered}</p>
            <p className="text-[10px] text-cm-faint">of {ZONES.length} zones</p>
          </div>
        </div>

        {/* Zone Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          <Button
            variant={zoneFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setZoneFilter('all')}
            className={
              zoneFilter === 'all'
                ? 'bg-red-600 text-white rounded-lg text-xs h-8 shrink-0'
                : 'border-cm-border-hover text-cm-secondary rounded-lg text-xs h-8 shrink-0'
            }
          >
            All Zones ({rates.length})
          </Button>
          {ZONES.map(zone => {
            const count = rates.filter(r => r.zone === zone.value).length
            const Icon = zone.icon
            return (
              <Button
                key={zone.value}
                variant={zoneFilter === zone.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setZoneFilter(zone.value)}
                className={
                  zoneFilter === zone.value
                    ? 'bg-red-600 text-white rounded-lg text-xs h-8 shrink-0 gap-1.5'
                    : 'border-cm-border-hover text-cm-secondary rounded-lg text-xs h-8 shrink-0 gap-1.5'
                }
              >
                <Icon className="w-3 h-3" />
                {zone.label} ({count})
              </Button>
            )
          })}
        </div>

        {/* Shipping Rates Table */}
        <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle overflow-hidden mb-8">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cm-border-subtle">
                  <th className="text-left text-xs font-semibold text-cm-dim px-5 py-3">
                    Zone
                  </th>
                  <th className="text-left text-xs font-semibold text-cm-dim px-5 py-3">
                    Carrier
                  </th>
                  <th className="text-left text-xs font-semibold text-cm-dim px-5 py-3">
                    Base Rate
                  </th>
                  <th className="text-left text-xs font-semibold text-cm-dim px-5 py-3">
                    Per KG
                  </th>
                  <th className="text-left text-xs font-semibold text-cm-dim px-5 py-3">
                    Free Shipping
                  </th>
                  <th className="text-left text-xs font-semibold text-cm-dim px-5 py-3">
                    Est. Days
                  </th>
                  <th className="text-left text-xs font-semibold text-cm-dim px-5 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-semibold text-cm-dim px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRates.map(rate => (
                  <tr
                    key={rate.id}
                    className="border-b border-cm-border-subtle/50 hover:bg-cm-hover/50 transition-colors"
                  >
                    <td className="px-5 py-4">{getZoneBadge(rate.zone)}</td>
                    <td className="px-5 py-4 text-sm text-cm-secondary">{rate.carrier}</td>
                    <td className="px-5 py-4 text-sm font-medium text-cm-primary">
                      ${rate.baseRate.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-sm text-cm-secondary">
                      ${rate.perKg.toFixed(2)}/kg
                    </td>
                    <td className="px-5 py-4 text-sm text-cm-secondary">
                      {rate.freeThreshold ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-green-500/20 text-green-400 bg-green-500/5"
                        >
                          Free over ${rate.freeThreshold.toFixed(0)}
                        </Badge>
                      ) : (
                        <span className="text-cm-faint text-xs">None</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-cm-secondary">
                        <Clock className="w-3.5 h-3.5 text-cm-dim" />
                        {rate.estimatedDays}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleActive(rate.id)}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                        style={{
                          backgroundColor: rate.isActive
                            ? 'rgb(34 197 94)'
                            : 'rgb(64 64 64)',
                        }}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            rate.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(rate)}
                          className="h-8 w-8 p-0 text-cm-dim hover:text-cm-secondary hover:bg-cm-hover rounded-lg"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(rate.id)}
                          className="h-8 w-8 p-0 text-cm-dim hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-3">
            {filteredRates.map(rate => {
              const zone = ZONES.find(z => z.value === rate.zone)
              const Icon = zone?.icon || Truck
              return (
                <div
                  key={rate.id}
                  className="rounded-xl bg-cm-hover/50 border border-cm-border-subtle/50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${zone?.color || 'text-cm-dim'}`} />
                      <span className="text-sm font-medium text-cm-secondary">
                        {rate.carrier}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleActive(rate.id)}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                      style={{
                        backgroundColor: rate.isActive
                          ? 'rgb(34 197 94)'
                          : 'rgb(64 64 64)',
                      }}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          rate.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cm-dim">Zone</span>
                    {getZoneBadge(rate.zone)}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-cm-dim">Base Rate</span>
                      <p className="text-sm font-medium text-cm-primary">
                        ${rate.baseRate.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-cm-dim">Per KG</span>
                      <p className="text-sm font-medium text-cm-primary">
                        ${rate.perKg.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-cm-dim">Free Shipping</span>
                      <p className="text-sm text-cm-secondary">
                        {rate.freeThreshold
                          ? `Over $${rate.freeThreshold.toFixed(0)}`
                          : 'None'}
                      </p>
                    </div>
                    <div>
                      <span className="text-cm-dim">Est. Delivery</span>
                      <p className="text-sm text-cm-secondary flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {rate.estimatedDays}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(rate)}
                      className="flex-1 border-cm-border-hover text-cm-secondary text-xs h-8 rounded-lg"
                    >
                      <Edit className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(rate.id)}
                      className="border-cm-border-hover text-red-400 hover:bg-red-500/10 text-xs h-8 rounded-lg"
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredRates.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-cm-faint mx-auto mb-3" />
              <p className="text-sm text-cm-dim mb-4">
                No shipping rates for this zone
              </p>
              <Button
                onClick={handleOpenAdd}
                variant="outline"
                className="border-cm-border-hover text-cm-secondary rounded-xl text-sm"
              >
                <Plus className="w-4 h-4 mr-2" /> Add a Rate
              </Button>
            </div>
          )}
        </div>

        {/* Vacation Mode */}
        <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-cm-secondary flex items-center gap-2">
                <Clock className="w-4 h-4" /> Vacation Mode
              </h2>
              <p className="text-xs text-cm-dim mt-1">
                Temporarily disable your shipping while you&apos;re away
              </p>
            </div>
            <Switch checked={vacationMode} onCheckedChange={setVacationMode} />
          </div>
          {vacationMode && (
            <div>
              <Label className="text-cm-secondary text-xs mb-1.5 block">
                Vacation Message
              </Label>
              <Textarea
                value={vacationMessage}
                onChange={(e) => setVacationMessage(e.target.value)}
                placeholder="Let customers know when you'll resume shipping..."
                className="bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint rounded-xl min-h-[80px]"
              />
            </div>
          )}
          {vacationMode && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <p className="text-xs text-yellow-400">
                Shipping is paused. Customers will see extended delivery estimates.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Rate Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-cm-elevated border-cm-border-hover rounded-2xl max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="text-cm-primary">
              {editingId ? 'Edit Shipping Rate' : 'Add Shipping Rate'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-cm-secondary text-xs mb-1.5 block">
                  Zone
                </Label>
                <Select
                  value={form.zone}
                  onValueChange={(v) => setForm({ ...form, zone: v })}
                >
                  <SelectTrigger className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-cm-elevated border-cm-border-hover">
                    {ZONES.map(z => (
                      <SelectItem key={z.value} value={z.value} className="text-cm-secondary">
                        {z.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-cm-secondary text-xs mb-1.5 block">
                  Carrier
                </Label>
                <Select
                  value={form.carrier}
                  onValueChange={(v) => setForm({ ...form, carrier: v })}
                >
                  <SelectTrigger className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-cm-elevated border-cm-border-hover">
                    {CARRIERS.map(c => (
                      <SelectItem key={c} value={c} className="text-cm-secondary">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-cm-secondary text-xs mb-1.5 block">
                  Base Rate (CAD)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.baseRate}
                  onChange={(e) => setForm({ ...form, baseRate: e.target.value })}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
              <div>
                <Label className="text-cm-secondary text-xs mb-1.5 block">
                  Per KG (CAD)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.perKg}
                  onChange={(e) => setForm({ ...form, perKg: e.target.value })}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-cm-secondary text-xs mb-1.5 block">
                  Free Shipping Threshold
                </Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={form.freeThreshold}
                  onChange={(e) =>
                    setForm({ ...form, freeThreshold: e.target.value })
                  }
                  placeholder="Leave blank for none"
                  className={inputClass}
                />
                <p className="text-[10px] text-cm-faint mt-1">
                  Orders above this amount get free shipping
                </p>
              </div>
              <div>
                <Label className="text-cm-secondary text-xs mb-1.5 block">
                  Estimated Delivery
                </Label>
                <Input
                  value={form.estimatedDays}
                  onChange={(e) =>
                    setForm({ ...form, estimatedDays: e.target.value })
                  }
                  placeholder="e.g. 3-5 business days"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-cm-hover border border-cm-border-subtle p-3">
              <div>
                <Label className="text-cm-secondary text-xs">Active</Label>
                <p className="text-[10px] text-cm-dim mt-0.5">
                  Enable this rate for customers
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-cm-border-hover text-cm-secondary rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl"
            >
              {editingId ? 'Update Rate' : 'Add Rate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardSidebar>
  )
}
