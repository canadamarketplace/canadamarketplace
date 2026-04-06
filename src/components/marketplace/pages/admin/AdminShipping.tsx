'use client'
import { useState } from 'react'
import { useNavigation } from '@/lib/store'
import AdminAuthGuard from './AdminAuthGuard'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Truck, Save, Loader2, Globe, Package, Clock, CheckCircle2, XCircle, MapPin, Weight } from 'lucide-react'
import { toast } from 'sonner'

interface ShippingZone {
  id: string
  name: string
  regions: string
  enabled: boolean
  color: string
}

interface ShippingCarrier {
  id: string
  name: string
  logo: string
  enabled: boolean
  trackingUrl: string
  accountNumber: string
}

interface ShippingRate {
  id: string
  name: string
  zone: string
  baseRate: number
  perKg: number
  freeThreshold: number
  estimatedDays: string
}

const INITIAL_ZONES: ShippingZone[] = [
  { id: 'domestic', name: 'Domestic (Same Province)', regions: 'Within the same province', enabled: true, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  { id: 'regional', name: 'Regional (Within Canada)', regions: 'Between Canadian provinces', enabled: true, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { id: 'usa', name: 'United States', regions: 'All US states and territories', enabled: true, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { id: 'international', name: 'International', regions: 'Rest of the world', enabled: true, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
]

const INITIAL_CARRIERS: ShippingCarrier[] = [
  { id: 'canada-post', name: 'Canada Post', logo: '📮', enabled: true, trackingUrl: 'https://www.canadapost-postescanada.ca/track', accountNumber: 'CP-2024-78342' },
  { id: 'purolator', name: 'Purolator', logo: '🟤', enabled: true, trackingUrl: 'https://www.purolator.com/en/shipping/tracker', accountNumber: 'PUR-2024-11456' },
  { id: 'ups', name: 'UPS', logo: '🟫', enabled: true, trackingUrl: 'https://www.ups.com/track', accountNumber: 'UPS-2024-99821' },
  { id: 'fedex', name: 'FedEx', logo: '🟣', enabled: false, trackingUrl: 'https://www.fedex.com/tracking', accountNumber: 'FDX-2024-33478' },
  { id: 'dhl', name: 'DHL Express', logo: '🟡', enabled: false, trackingUrl: 'https://www.dhl.com/ca-en/home/tracking.html', accountNumber: 'DHL-2024-56201' },
]

const INITIAL_RATES: ShippingRate[] = [
  { id: 'dom-std', name: 'Standard', zone: 'Domestic', baseRate: 8.99, perKg: 1.50, freeThreshold: 75, estimatedDays: '3-5 business days' },
  { id: 'dom-exp', name: 'Express', zone: 'Domestic', baseRate: 14.99, perKg: 2.00, freeThreshold: 0, estimatedDays: '1-2 business days' },
  { id: 'reg-std', name: 'Standard', zone: 'Regional', baseRate: 12.99, perKg: 2.50, freeThreshold: 100, estimatedDays: '5-8 business days' },
  { id: 'reg-exp', name: 'Express', zone: 'Regional', baseRate: 22.99, perKg: 3.50, freeThreshold: 0, estimatedDays: '2-3 business days' },
  { id: 'usa-std', name: 'Standard', zone: 'USA', baseRate: 18.99, perKg: 4.00, freeThreshold: 150, estimatedDays: '7-14 business days' },
  { id: 'usa-exp', name: 'Express', zone: 'USA', baseRate: 34.99, perKg: 5.50, freeThreshold: 0, estimatedDays: '3-5 business days' },
  { id: 'int-std', name: 'Standard', zone: 'International', baseRate: 29.99, perKg: 8.00, freeThreshold: 0, estimatedDays: '14-30 business days' },
  { id: 'int-exp', name: 'Express', zone: 'International', baseRate: 59.99, perKg: 12.00, freeThreshold: 0, estimatedDays: '5-10 business days' },
]

export default function AdminShipping() {
  const { navigate } = useNavigation()
  const [zones, setZones] = useState(INITIAL_ZONES)
  const [carriers, setCarriers] = useState(INITIAL_CARRIERS)
  const [rates, setRates] = useState(INITIAL_RATES)
  const [saving, setSaving] = useState(false)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('75')
  const [defaultWeightUnit, setDefaultWeightUnit] = useState('kg')

  const toggleZone = (id: string) => setZones(zones.map(z => z.id === id ? { ...z, enabled: !z.enabled } : z))
  const toggleCarrier = (id: string) => setCarriers(carriers.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c))

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1200))
    toast.success('Shipping settings saved successfully')
    setSaving(false)
  }

  const inputClass = "bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint focus:border-red-500/50 focus:ring-red-500/20 rounded-xl h-10 text-sm"

  return (
    <AdminAuthGuard>
    <DashboardSidebar role="admin" activeItem="admin-shipping" onNavigate={(page) => navigate(page)}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cm-primary">Shipping Management</h1>
            <p className="text-sm text-cm-dim mt-1">Configure shipping zones, carriers and rates</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl h-10 px-6"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Settings
          </Button>
        </div>

        {/* Quick Settings */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4 text-green-400" />
                <p className="text-xs font-semibold text-cm-dim">Free Shipping Threshold</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-cm-muted">$</span>
                <Input type="number" value={freeShippingThreshold} onChange={(e) => setFreeShippingThreshold(e.target.value)} className={`${inputClass} w-24`} />
                <span className="text-xs text-cm-faint">CAD minimum order</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Weight className="w-4 h-4 text-blue-400" />
                <p className="text-xs font-semibold text-cm-dim">Default Weight Unit</p>
              </div>
              <select value={defaultWeightUnit} onChange={(e) => setDefaultWeightUnit(e.target.value)} className={`${inputClass} w-full`}>
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
            </CardContent>
          </Card>
        </div>

        {/* Shipping Zones */}
        <h2 className="text-base font-semibold text-cm-secondary mb-4">Shipping Zones</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {zones.map((zone) => (
            <Card key={zone.id} className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-cm-muted" />
                    <h3 className="text-sm font-semibold text-cm-secondary">{zone.name}</h3>
                  </div>
                  <Badge className={`${zone.color} text-[10px] border`}>
                    {zone.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-cm-faint mb-3">{zone.regions}</p>
                <button
                  onClick={() => toggleZone(zone.id)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                    zone.enabled
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                  }`}
                >
                  {zone.enabled ? 'Disable Zone' : 'Enable Zone'}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Carriers */}
        <h2 className="text-base font-semibold text-cm-secondary mb-4">Shipping Carriers</h2>
        <div className="grid gap-4 mb-8">
          {carriers.map((carrier) => (
            <Card key={carrier.id} className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                  <div className="w-12 h-12 rounded-xl bg-cm-hover flex items-center justify-center text-2xl flex-shrink-0">
                    {carrier.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-cm-secondary">{carrier.name}</h3>
                      <Badge className={`${carrier.enabled ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-cm-hover border-cm-border-hover text-cm-faint'} text-[10px] border`}>
                        {carrier.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-1.5">
                      <span className="text-[10px] text-cm-dim"><span className="font-medium">Account:</span> {carrier.accountNumber}</span>
                      <span className="text-[10px] text-cm-dim"><span className="font-medium">Tracking:</span> {carrier.trackingUrl.replace('https://', '')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCarrier(carrier.id)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                      carrier.enabled
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                    }`}
                  >
                    {carrier.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rates Table */}
        <h2 className="text-base font-semibold text-cm-secondary mb-4">Shipping Rates</h2>
        <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cm-border-subtle">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase">Service</th>
                    <th className="text-left px-3 py-3 text-[10px] font-semibold text-cm-dim uppercase">Zone</th>
                    <th className="text-center px-3 py-3 text-[10px] font-semibold text-cm-dim uppercase">Base Rate</th>
                    <th className="text-center px-3 py-3 text-[10px] font-semibold text-cm-dim uppercase">Per KG</th>
                    <th className="text-center px-3 py-3 text-[10px] font-semibold text-cm-dim uppercase">Free over</th>
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase">Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate) => (
                    <tr key={rate.id} className="border-b border-cm-border-subtle last:border-0 hover:bg-cm-hover transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-cm-muted" />
                          <span className="text-sm font-medium text-cm-secondary">{rate.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge className="bg-cm-hover border-cm-border-hover text-cm-muted text-[10px] border">
                          {rate.zone}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-center text-sm font-medium text-cm-secondary">${rate.baseRate.toFixed(2)}</td>
                      <td className="px-3 py-3 text-center text-sm text-cm-dim">${rate.perKg.toFixed(2)}</td>
                      <td className="px-3 py-3 text-center">
                        {rate.freeThreshold > 0 ? (
                          <Badge className="bg-green-500/10 border-green-500/20 text-green-400 text-[10px] border">
                            ${rate.freeThreshold}
                          </Badge>
                        ) : (
                          <span className="text-xs text-cm-faint">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-cm-faint" />
                          <span className="text-xs text-cm-dim">{rate.estimatedDays}</span>
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
    </DashboardSidebar>
    </AdminAuthGuard>
  )
}
