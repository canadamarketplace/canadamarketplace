'use client'
import { useState } from 'react'
import { useNavigation } from '@/lib/store'
import AdminAuthGuard from './AdminAuthGuard'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CreditCard, Save, Loader2, CheckCircle2, XCircle, Clock, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentMethod {
  id: string
  name: string
  icon: string
  enabled: boolean
  type: string
  description: string
  fee: number
  minPayout: number
  payoutSpeed: string
}

const INITIAL_METHODS: PaymentMethod[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    icon: '💳',
    enabled: true,
    type: 'Credit/Debit Card',
    description: 'Accept Visa, Mastercard, Amex and other major cards',
    fee: 2.9,
    minPayout: 10,
    payoutSpeed: '2-3 business days',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '🅿️',
    enabled: true,
    type: 'Digital Wallet',
    description: 'Enable PayPal checkout for buyers',
    fee: 2.5,
    minPayout: 15,
    payoutSpeed: '3-5 business days',
  },
  {
    id: 'interac',
    name: 'Interac e-Transfer',
    icon: '🏦',
    enabled: true,
    type: 'Bank Transfer',
    description: 'Canadian bank-to-bank transfers via Interac',
    fee: 1.5,
    minPayout: 25,
    payoutSpeed: '1-2 business days',
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    icon: '🍎',
    enabled: false,
    type: 'Digital Wallet',
    description: 'Accept Apple Pay for quick mobile checkout',
    fee: 2.9,
    minPayout: 10,
    payoutSpeed: '2-3 business days',
  },
  {
    id: 'google-pay',
    name: 'Google Pay',
    icon: '📱',
    enabled: false,
    type: 'Digital Wallet',
    description: 'Accept Google Pay for quick mobile checkout',
    fee: 2.9,
    minPayout: 10,
    payoutSpeed: '2-3 business days',
  },
]

export default function AdminPayments() {
  const { navigate } = useNavigation()
  const [methods, setMethods] = useState<PaymentMethod[]>(INITIAL_METHODS)
  const [saving, setSaving] = useState(false)
  const [marketplaceFee, setMarketplaceFee] = useState('8')
  const [goldSellerFee, setGoldSellerFee] = useState('5')
  const [minPayoutAmount, setMinPayoutAmount] = useState('50')
  const [payoutFrequency, setPayoutFrequency] = useState('weekly')

  const toggleMethod = (id: string) => {
    setMethods(methods.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m))
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1200))
    toast.success('Payment settings saved successfully')
    setSaving(false)
  }

  const inputClass = "bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint focus:border-red-500/50 focus:ring-red-500/20 rounded-xl h-10 text-sm"

  return (
    <AdminAuthGuard>
    <DashboardSidebar role="admin" activeItem="admin-payments" onNavigate={(page) => navigate(page)}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cm-primary">Payment Settings</h1>
            <p className="text-sm text-cm-dim mt-1">Manage payment methods, fees and payout configuration</p>
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

        {/* Marketplace Fee Settings */}
        <h2 className="text-base font-semibold text-cm-secondary mb-4">Marketplace Fees</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-red-400" />
                <p className="text-xs font-semibold text-cm-dim">Standard Fee</p>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" value={marketplaceFee} onChange={(e) => setMarketplaceFee(e.target.value)} className={`${inputClass} w-20`} />
                <span className="text-sm text-cm-muted">%</span>
              </div>
              <p className="text-[10px] text-cm-faint mt-2">Per transaction</p>
            </CardContent>
          </Card>
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">⭐</span>
                <p className="text-xs font-semibold text-cm-dim">Gold Seller Fee</p>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" value={goldSellerFee} onChange={(e) => setGoldSellerFee(e.target.value)} className={`${inputClass} w-20`} />
                <span className="text-sm text-cm-muted">%</span>
              </div>
              <p className="text-[10px] text-cm-faint mt-2">Verified Gold sellers</p>
            </CardContent>
          </Card>
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-green-400" />
                <p className="text-xs font-semibold text-cm-dim">Min Payout</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-cm-muted">$</span>
                <Input type="number" value={minPayoutAmount} onChange={(e) => setMinPayoutAmount(e.target.value)} className={`${inputClass} w-24`} />
              </div>
              <p className="text-[10px] text-cm-faint mt-2">CAD minimum</p>
            </CardContent>
          </Card>
          <Card className="bg-cm-elevated border-cm-border-subtle rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-blue-400" />
                <p className="text-xs font-semibold text-cm-dim">Payout Frequency</p>
              </div>
              <select
                value={payoutFrequency}
                onChange={(e) => setPayoutFrequency(e.target.value)}
                className={`${inputClass} w-full`}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <p className="text-[10px] text-cm-faint mt-2">Auto-payout schedule</p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <h2 className="text-base font-semibold text-cm-secondary mb-4">Payment Methods</h2>
        <div className="grid gap-4 mb-8">
          {methods.map((method) => (
            <Card key={method.id} className="bg-cm-elevated border-cm-border-subtle rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                  <div className="w-12 h-12 rounded-xl bg-cm-hover flex items-center justify-center text-2xl flex-shrink-0">
                    {method.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-cm-secondary">{method.name}</h3>
                      <Badge className={`${method.enabled ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-cm-hover border-cm-border-hover text-cm-faint'} text-[10px] border`}>
                        {method.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-cm-faint mt-0.5">{method.description}</p>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <span className="text-[10px] text-cm-dim"><span className="font-medium">Type:</span> {method.type}</span>
                      <span className="text-[10px] text-cm-dim"><span className="font-medium">Fee:</span> {method.fee}% + $0.30</span>
                      <span className="text-[10px] text-cm-dim"><span className="font-medium">Min Payout:</span> ${method.minPayout}</span>
                      <span className="text-[10px] text-cm-dim"><span className="font-medium">Speed:</span> {method.payoutSpeed}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleMethod(method.id)}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:bg-cm-hover"
                  >
                    {method.enabled ? (
                      <>
                        <ToggleRight className="w-5 h-5 text-green-400" />
                        <span className="text-green-400">Enabled</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5 text-cm-faint" />
                        <span className="text-cm-faint">Disabled</span>
                      </>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardSidebar>
    </AdminAuthGuard>
  )
}
