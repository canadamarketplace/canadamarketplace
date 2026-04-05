'use client'
import { useState } from 'react'
import AdminAuthGuard from './AdminAuthGuard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminSettings() {
  const [loading, setLoading] = useState(false)
  const [marketplaceFee, setMarketplaceFee] = useState('8')
  const [goldSellerFee, setGoldSellerFee] = useState('5')
  const [disputeWindow, setDisputeWindow] = useState('30')
  const [payoutSpeed, setPayoutSpeed] = useState('2')

  const handleSave = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Settings saved successfully')
    setLoading(false)
  }

  const inputClass = "bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint focus:border-red-500/50 focus:ring-red-500/20 rounded-xl h-11"

  const settings = [
    { label: 'Marketplace Fee (%)', desc: 'Standard fee charged on each transaction', value: marketplaceFee, onChange: setMarketplaceFee, icon: '💰' },
    { label: 'Gold Seller Fee (%)', desc: 'Reduced fee for verified Gold sellers', value: goldSellerFee, onChange: setGoldSellerFee, icon: '⭐' },
    { label: 'Dispute Window (days)', desc: 'Number of days after delivery to file a dispute', value: disputeWindow, onChange: setDisputeWindow, icon: '⚖️' },
    { label: 'Payout Speed (days)', desc: 'Default payout processing time for sellers', value: payoutSpeed, onChange: setPayoutSpeed, icon: '🚀' },
  ]

  return (
    <AdminAuthGuard>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-cm-primary mb-2">System Settings</h1>
      <p className="text-sm text-cm-dim mb-8">Configure marketplace-wide settings</p>

      <div className="space-y-4">
        {settings.map((setting) => (
          <div key={setting.label} className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-cm-hover flex items-center justify-center text-lg flex-shrink-0">
                {setting.icon}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-cm-secondary">{setting.label}</h3>
                    <p className="text-xs text-cm-faint mt-0.5">{setting.desc}</p>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      value={setting.value}
                      onChange={(e) => setting.onChange(e.target.value)}
                      className={`${inputClass} text-center`}
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
        disabled={loading}
        className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl h-11 px-8 mt-8"
      >
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Save Settings
      </Button>
    </div>
    </AdminAuthGuard>
  )
}
