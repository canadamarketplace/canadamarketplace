'use client'
import { useState } from 'react'
import { useAuth, useNavigation } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { PROVINCES } from '@/lib/types'
import { User, Mail, Phone, MapPin, Loader2, Save, Store, TrendingUp, Shield, ArrowRight } from 'lucide-react'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const { navigate } = useNavigation()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')

  const handleSave = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name, email, phone,
          province, city, address, postalCode,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setUser({ ...user, ...updated })
        toast.success('Profile updated!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update profile')
      }
    } catch {
      toast.error('Failed to update profile')
    }
    setLoading(false)
  }

  const inputClass = "bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint focus:border-red-500/50 focus:ring-red-500/20 rounded-xl h-11"

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <User className="w-16 h-16 text-cm-faint mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-cm-secondary mb-2">Please sign in</h1>
        <Button onClick={() => navigate('home')} className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl mt-4">Go Home</Button>
      </div>
    )
  }

  return (
    <DashboardSidebar role="buyer" activeItem="profile" onNavigate={(page) => navigate(page)}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-cm-primary mb-8">My Profile</h1>

      {/* User Card */}
      <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-500 flex items-center justify-center text-2xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-cm-primary">{user.name}</h2>
            <p className="text-sm text-cm-dim">{user.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-6 space-y-4">
        <h2 className="text-sm font-semibold text-cm-secondary">Personal Information</h2>

        <div>
          <Label className="text-cm-secondary text-xs mb-1.5 block flex items-center gap-1.5"><User className="w-3 h-3" /> Full Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <Label className="text-cm-secondary text-xs mb-1.5 block flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div>
          <Label className="text-cm-secondary text-xs mb-1.5 block flex items-center gap-1.5"><Phone className="w-3 h-3" /> Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" className={inputClass} />
        </div>

        <h2 className="text-sm font-semibold text-cm-secondary pt-4">Address</h2>

        <div>
          <Label className="text-cm-secondary text-xs mb-1.5 block flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Street Address</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St" className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-cm-secondary text-xs mb-1.5 block">Province</Label>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger className={`${inputClass} h-11`}><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent className="bg-cm-elevated border-cm-border-hover">
                {PROVINCES.map((p) => <SelectItem key={p.slug} value={p.slug} className="text-cm-secondary">{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-cm-secondary text-xs mb-1.5 block">City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className={inputClass} />
          </div>
        </div>
        <div className="w-1/2">
          <Label className="text-cm-secondary text-xs mb-1.5 block">Postal Code</Label>
          <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="M5V 3L9" className={inputClass} />
        </div>

        <Button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl h-11 px-8">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      {/* Become a Seller - only for BUYER users */}
      {user.role === 'BUYER' && (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-red-500/30 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/5 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-cm-primary">Become a Seller</h2>
                <p className="text-xs text-cm-dim">Start your business on Canada Marketplace</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-5">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-cm-elevated/60 border border-cm-border-subtle">
                <TrendingUp className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-cm-secondary">Grow Revenue</p>
                  <p className="text-[11px] text-cm-dim mt-0.5">Reach millions of Canadian buyers nationwide</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-cm-elevated/60 border border-cm-border-subtle">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-cm-secondary">Secure Payments</p>
                  <p className="text-[11px] text-cm-dim mt-0.5">Escrow protection on every transaction</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-cm-elevated/60 border border-cm-border-subtle">
                <Store className="w-5 h-5 text-red-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-cm-secondary">Custom Storefront</p>
                  <p className="text-[11px] text-cm-dim mt-0.5">Build your brand with a personalized store page</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigate('become-seller')}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl h-11 px-6 shadow-lg shadow-red-500/20 w-full sm:w-auto"
            >
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
      </div>
    </DashboardSidebar>
  )
}
