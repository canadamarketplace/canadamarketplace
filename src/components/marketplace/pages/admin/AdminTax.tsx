'use client'
import { useState } from 'react'
import { useNavigation } from '@/lib/store'
import AdminAuthGuard from './AdminAuthGuard'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Receipt, Save, Loader2, MapPin, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface TaxRule {
  province: string
  code: string
  gst: number
  pst: number
  hst: number
  qst?: number
  type: string
}

const INITIAL_TAX_RULES: TaxRule[] = [
  { province: 'Alberta', code: 'AB', gst: 5, pst: 0, hst: 0, type: 'GST' },
  { province: 'British Columbia', code: 'BC', gst: 5, pst: 7, hst: 0, type: 'GST + PST' },
  { province: 'Manitoba', code: 'MB', gst: 5, pst: 7, hst: 0, type: 'GST + PST' },
  { province: 'New Brunswick', code: 'NB', gst: 0, pst: 0, hst: 15, type: 'HST' },
  { province: 'Newfoundland & Labrador', code: 'NL', gst: 0, pst: 0, hst: 15, type: 'HST' },
  { province: 'Nova Scotia', code: 'NS', gst: 0, pst: 0, hst: 15, type: 'HST' },
  { province: 'Ontario', code: 'ON', gst: 0, pst: 0, hst: 13, type: 'HST' },
  { province: 'Prince Edward Island', code: 'PE', gst: 0, pst: 0, hst: 15, type: 'HST' },
  { province: 'Quebec', code: 'QC', gst: 5, pst: 0, hst: 0, qst: 9.975, type: 'GST + QST' },
  { province: 'Saskatchewan', code: 'SK', gst: 5, pst: 6, hst: 0, type: 'GST + PST' },
  { province: 'Northwest Territories', code: 'NT', gst: 5, pst: 0, hst: 0, type: 'GST' },
  { province: 'Nunavut', code: 'NU', gst: 5, pst: 0, hst: 0, type: 'GST' },
  { province: 'Yukon', code: 'YT', gst: 5, pst: 0, hst: 0, type: 'GST' },
]

function getEffectiveRate(rule: TaxRule): number {
  if (rule.hst > 0) return rule.hst
  return rule.gst + rule.pst + (rule.qst || 0)
}

export default function AdminTax() {
  const { navigate } = useNavigation()
  const [taxRules, setTaxRules] = useState<TaxRule[]>(INITIAL_TAX_RULES)
  const [saving, setSaving] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)

  const handleRateChange = (index: number, field: keyof TaxRule, value: string) => {
    const updated = [...taxRules]
    ;(updated[index] as any)[field] = parseFloat(value) || 0
    setTaxRules(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1200))
    setEditIndex(null)
    toast.success('Tax rules updated successfully')
    setSaving(false)
  }

  const inputClass = "bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint focus:border-red-500/50 focus:ring-red-500/20 rounded-xl h-10 text-center text-sm"

  return (
    <AdminAuthGuard>
    <DashboardSidebar role="admin" activeItem="admin-tax" onNavigate={(page) => navigate(page)}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cm-primary">Tax Rules</h1>
            <p className="text-sm text-cm-dim mt-1">Manage GST, HST, PST, and QST rates by province</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl h-10 px-6"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        {/* Info Banner */}
        <div className="rounded-2xl bg-blue-500/5 border border-blue-500/20 p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-300">Canadian Tax Configuration</p>
            <p className="text-xs text-blue-400/70 mt-0.5">
              Tax rates are calculated automatically based on the buyer&apos;s shipping province. Ensure rates match current CRA guidelines.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-4">
              <p className="text-[10px] text-cm-dim uppercase font-semibold">Provinces</p>
              <p className="text-xl font-bold text-cm-primary mt-1">{taxRules.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-4">
              <p className="text-[10px] text-cm-dim uppercase font-semibold">Highest Rate</p>
              <p className="text-xl font-bold text-red-400 mt-1">{Math.max(...taxRules.map(getEffectiveRate))}%</p>
            </CardContent>
          </Card>
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-4">
              <p className="text-[10px] text-cm-dim uppercase font-semibold">Lowest Rate</p>
              <p className="text-xl font-bold text-green-400 mt-1">{Math.min(...taxRules.map(getEffectiveRate))}%</p>
            </CardContent>
          </Card>
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-4">
              <p className="text-[10px] text-cm-dim uppercase font-semibold">HST Provinces</p>
              <p className="text-xl font-bold text-cm-primary mt-1">{taxRules.filter(r => r.hst > 0).length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tax Table */}
        <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cm-border-subtle">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase">Province</th>
                    <th className="text-left px-3 py-3 text-[10px] font-semibold text-cm-dim uppercase">Type</th>
                    <th className="text-center px-3 py-3 text-[10px] font-semibold text-cm-dim uppercase">GST</th>
                    <th className="text-center px-3 py-3 text-[10px] font-semibold text-cm-dim uppercase">PST</th>
                    <th className="text-center px-3 py-3 text-[10px] font-semibold text-cm-dim uppercase">HST</th>
                    <th className="text-center px-3 py-3 text-[10px] font-semibold text-cm-dim uppercase">QST</th>
                    <th className="text-center px-3 py-3 text-[10px] font-semibold text-cm-dim uppercase">Total</th>
                    <th className="text-center px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {taxRules.map((rule, index) => (
                    <tr key={rule.code} className="border-b border-cm-border-subtle last:border-0 hover:bg-cm-hover transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-3.5 h-3.5 text-cm-muted flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-cm-secondary">{rule.province}</p>
                            <p className="text-[10px] text-cm-faint">{rule.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge className="bg-cm-hover border-cm-border-hover text-cm-muted text-[10px] border">
                          {rule.type}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {editIndex === index ? (
                          <Input type="number" step="0.001" value={rule.gst} onChange={(e) => handleRateChange(index, 'gst', e.target.value)} className={`${inputClass} w-16`} />
                        ) : (
                          <span className="text-sm text-cm-secondary">{rule.gst > 0 ? `${rule.gst}%` : '—'}</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {editIndex === index ? (
                          <Input type="number" step="0.001" value={rule.pst} onChange={(e) => handleRateChange(index, 'pst', e.target.value)} className={`${inputClass} w-16`} />
                        ) : (
                          <span className="text-sm text-cm-secondary">{rule.pst > 0 ? `${rule.pst}%` : '—'}</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {editIndex === index ? (
                          <Input type="number" step="0.001" value={rule.hst} onChange={(e) => handleRateChange(index, 'hst', e.target.value)} className={`${inputClass} w-16`} />
                        ) : (
                          <span className="text-sm text-cm-secondary">{rule.hst > 0 ? `${rule.hst}%` : '—'}</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {editIndex === index ? (
                          <Input type="number" step="0.001" value={rule.qst || 0} onChange={(e) => handleRateChange(index, 'qst', e.target.value)} className={`${inputClass} w-16`} />
                        ) : (
                          <span className="text-sm text-cm-secondary">{rule.qst && rule.qst > 0 ? `${rule.qst}%` : '—'}</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-sm font-bold text-cm-primary">{getEffectiveRate(rule)}%</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditIndex(editIndex === index ? null : index)}
                          className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg h-8"
                        >
                          {editIndex === index ? 'Done' : 'Edit'}
                        </Button>
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
