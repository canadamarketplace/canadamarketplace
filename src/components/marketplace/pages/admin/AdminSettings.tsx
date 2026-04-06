'use client'
import { useState, useEffect } from 'react'
import { useNavigation } from '@/lib/store'
import AdminAuthGuard from './AdminAuthGuard'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

interface SettingField {
  key: string
  label: string
  desc: string
  icon: string
  type: 'number' | 'text'
  defaultValue: string
}

const settingFields: SettingField[] = [
  { key: 'marketplace_fee', label: 'Marketplace Fee (%)', desc: 'Standard fee charged on each transaction', icon: '💰', type: 'number', defaultValue: '8' },
  { key: 'gold_seller_fee', label: 'Gold Seller Fee (%)', desc: 'Reduced fee for verified Gold sellers', icon: '⭐', type: 'number', defaultValue: '5' },
  { key: 'dispute_window_days', label: 'Dispute Window (days)', desc: 'Number of days after delivery to file a dispute', icon: '⚖️', type: 'number', defaultValue: '30' },
  { key: 'payout_speed_days', label: 'Payout Speed (days)', desc: 'Default payout processing time for sellers', icon: '🚀', type: 'number', defaultValue: '2' },
  { key: 'max_listing_images', label: 'Max Listing Images', desc: 'Maximum number of images allowed per product listing', icon: '🖼️', type: 'number', defaultValue: '10' },
  { key: 'low_stock_threshold', label: 'Low Stock Threshold', desc: 'Stock level at which a low stock alert is triggered', icon: '📦', type: 'number', defaultValue: '5' },
  { key: 'currency', label: 'Currency', desc: 'Default marketplace currency code', icon: '💱', type: 'text', defaultValue: 'CAD' },
  { key: 'site_name', label: 'Site Name', desc: 'Display name for the marketplace', icon: '🏪', type: 'text', defaultValue: 'Canada Marketplace' },
  { key: 'site_description', label: 'Site Description', desc: 'Short description used in meta tags and SEO', icon: '📝', type: 'text', defaultValue: 'Buy and sell online in Canada' },
]

export default function AdminSettings() {
  const { navigate } = useNavigation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})

  // Initialize defaults
  useEffect(() => {
    const defaults: Record<string, string> = {}
    for (const f of settingFields) {
      defaults[f.key] = f.defaultValue
    }
    setValues(defaults)
  }, [])

  // Fetch settings from API on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const data = await res.json()
          setValues((prev) => {
            const updated = { ...prev }
            for (const f of settingFields) {
              if (data[f.key] !== undefined) {
                updated[f.key] = data[f.key]
              }
            }
            return updated
          })
        }
      } catch {}
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const settings = settingFields.map((f) => ({
        key: f.key,
        value: values[f.key] || f.defaultValue,
      }))
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      if (res.ok) {
        toast.success('Settings saved successfully')
      } else {
        toast.error('Failed to save settings')
      }
    } catch {
      toast.error('Failed to save settings')
    }
    setSaving(false)
  }

  const inputClass = "bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint focus:border-red-500/50 focus:ring-red-500/20 rounded-xl h-11"

  if (loading) {
    return (
      <AdminAuthGuard>
      <DashboardSidebar role="admin" activeItem="admin-settings" onNavigate={(page) => navigate(page)}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
        </div>
      </div>
      </DashboardSidebar>
      </AdminAuthGuard>
    )
  }

  return (
    <AdminAuthGuard>
    <DashboardSidebar role="admin" activeItem="admin-settings" onNavigate={(page) => navigate(page)}>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-cm-primary mb-2">System Settings</h1>
      <p className="text-sm text-cm-dim mb-8">Configure marketplace-wide settings</p>

      <div className="space-y-4">
        {settingFields.map((field) => (
          <div key={field.key} className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-cm-hover flex items-center justify-center text-lg flex-shrink-0">
                {field.icon}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-cm-secondary">{field.label}</h3>
                    <p className="text-xs text-cm-faint mt-0.5">{field.desc}</p>
                  </div>
                  <div className={field.type === 'text' && field.key === 'site_description' ? 'w-full sm:w-80' : field.type === 'text' ? 'w-full sm:w-48' : 'w-24'}>
                    <Input
                      type={field.type}
                      value={values[field.key] || ''}
                      onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      className={`${inputClass} ${field.type === 'text' ? '' : 'text-center'}`}
                      placeholder={field.defaultValue}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl h-11 px-8 mt-8"
      >
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Save Settings
      </Button>
    </div>
    </DashboardSidebar>
    </AdminAuthGuard>
  )
}
