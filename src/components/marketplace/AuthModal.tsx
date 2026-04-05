'use client'
import { useState } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { PROVINCES } from '@/lib/types'
import { toast } from 'sonner'

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalTab, navigate } = useNavigation()
  const { setUser } = useAuth()
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Buyer Register
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regProvince, setRegProvince] = useState('')
  const [regCity, setRegCity] = useState('')

  // Seller Register
  const [sellerName, setSellerName] = useState('')
  const [sellerEmail, setSellerEmail] = useState('')
  const [sellerPassword, setSellerPassword] = useState('')
  const [storeName, setStoreName] = useState('')
  const [storeDesc, setStoreDesc] = useState('')
  const [sellerProvince, setSellerProvince] = useState('')
  const [sellerCity, setSellerCity] = useState('')

  const resetForms = () => {
    setLoginEmail(''); setLoginPassword('')
    setRegName(''); setRegEmail(''); setRegPassword(''); setRegProvince(''); setRegCity('')
    setSellerName(''); setSellerEmail(''); setSellerPassword('')
    setStoreName(''); setStoreDesc(''); setSellerProvince(''); setSellerCity('')
    setSuccess(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      toast.error(t('common.pleaseEnterEmailPassword'))
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      if (res.ok) {
        const user = await res.json()
        setUser(user)
        closeAuthModal()
        resetForms()
        toast.success(t('common.welcomeBack'))
      } else {
        const data = await res.json()
        toast.error(data.error || t('common.invalidCredentials'))
      }
    } catch {
      toast.error(t('common.loginFailed'))
    }
    setLoading(false)
  }

  const handleBuyerRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regName || !regEmail || !regPassword) {
      toast.error(t('common.fillRequiredFields'))
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, password: regPassword, name: regName, province: regProvince, city: regCity }),
      })
      if (res.ok) {
        const user = await res.json()
        setSuccess(true)
        toast.success(t('common.accountCreated'))
      } else {
        const data = await res.json()
        toast.error(data.error || t('common.registrationFailed'))
      }
    } catch {
      toast.error(t('common.registrationFailed'))
    }
    setLoading(false)
  }

  const handleSellerRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sellerName || !sellerEmail || !sellerPassword || !storeName) {
      toast.error(t('common.fillRequiredFields'))
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register-seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: sellerEmail, password: sellerPassword, name: sellerName,
          storeName, storeDescription: storeDesc, province: sellerProvince, city: sellerCity,
        }),
      })
      if (res.ok) {
        const user = await res.json()
        setSuccess(true)
        toast.success(t('common.sellerAccountCreated'))
      } else {
        const data = await res.json()
        toast.error(data.error || t('common.registrationFailed'))
      }
    } catch {
      toast.error(t('common.registrationFailed'))
    }
    setLoading(false)
  }

  const inputClass = "bg-cm-hover border-cm-border-hover text-cm-primary placeholder:text-cm-faint focus:border-red-500/50 focus:ring-red-500/20 h-11 rounded-xl"

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => { if (!open) { closeAuthModal(); resetForms() } }}>
      <DialogContent className="sm:max-w-md bg-cm-elevated border-cm-border-hover p-0 gap-0 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600/10 to-red-500/10 p-6 text-center border-b border-cm-border-subtle">
          <div className="w-12 h-12 rounded-2xl overflow-hidden mx-auto mb-3 shadow-lg shadow-red-500/20">
            <img src="/logo-square.png" alt="Canada Marketplace" className="w-full h-full object-cover" />
          </div>
          <DialogTitle className="text-xl font-bold text-cm-primary">
            {success ? t('auth.welcome') : t('auth.welcomeTitle')}
          </DialogTitle>
          <p className="text-sm text-cm-muted mt-1">
            {success ? t('auth.accountCreatedDesc') : t('auth.welcomeSubtitle')}
          </p>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-cm-primary mb-2">{t('auth.accountCreated')}</h3>
            <p className="text-sm text-cm-muted mb-4">{t('auth.accountCreatedDesc')}</p>
            <Button
              onClick={() => { resetForms(); }}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl h-11"
            >
              {t('auth.goToSignIn')}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue={authModalTab} className="mt-0">
            <TabsList className="w-full grid grid-cols-3 bg-transparent border-b border-cm-border-subtle h-12 rounded-none p-0">
              <TabsTrigger value="login" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:text-red-400 data-[state=active]:border-b-2 data-[state=active]:border-red-500 text-cm-dim h-12 rounded-t-none text-sm">
                {t('auth.login')}
              </TabsTrigger>
              <TabsTrigger value="register" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:text-red-400 data-[state=active]:border-b-2 data-[state=active]:border-red-500 text-cm-dim h-12 rounded-t-none text-sm">
                {t('auth.buyer')}
              </TabsTrigger>
              <TabsTrigger value="register-seller" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:text-red-400 data-[state=active]:border-b-2 data-[state=active]:border-red-500 text-cm-dim h-12 rounded-t-none text-sm">
                {t('auth.seller')}
              </TabsTrigger>
            </TabsList>

            {/* Login */}
            <TabsContent value="login" className="p-6 mt-0">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label className="text-cm-secondary text-xs mb-1.5 block">{t('auth.email')}</Label>
                  <Input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <Label className="text-cm-secondary text-xs mb-1.5 block">{t('auth.password')}</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputClass} pr-10`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cm-dim hover:text-cm-secondary"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="text-right mt-1.5">
                    <button
                      type="button"
                      onClick={() => { closeAuthModal(); resetForms(); navigate('forgot-password') }}
                      className="text-xs text-cm-dim hover:text-red-400 transition-colors"
                    >
                      {t('auth.forgotPassword')}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl h-11"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t('auth.login')}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-cm-border-subtle" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-cm-elevated text-cm-dim">{t('auth.demoAccounts')}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: 'Admin', email: 'admin@canadamarketplace.ca' },
                    { label: 'Seller', email: 'sarah@techshop.ca' },
                    { label: 'Buyer', email: 'alex@gmail.com' },
                  ].map((demo) => (
                    <button
                      type="button"
                      key={demo.label}
                      onClick={() => { setLoginEmail(demo.email); setLoginPassword('') }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-cm-hover hover:bg-cm-hover-strong text-xs text-cm-muted transition-colors"
                    >
                      <span>{demo.label}: {demo.email}</span>
                      <span className="text-cm-faint text-[10px]">{t('auth.useDemo')}</span>
                    </button>
                  ))}
                </div>
              </form>
            </TabsContent>

            {/* Buyer Register */}
            <TabsContent value="register" className="p-6 mt-0">
              <form onSubmit={handleBuyerRegister} className="space-y-4">
                <div>
                  <Label className="text-cm-secondary text-xs mb-1.5 block">{t('auth.name')} *</Label>
                  <Input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="John Doe" className={inputClass} required />
                </div>
                <div>
                  <Label className="text-cm-secondary text-xs mb-1.5 block">{t('auth.email')} *</Label>
                  <Input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="you@example.com" className={inputClass} required />
                </div>
                <div>
                  <Label className="text-cm-secondary text-xs mb-1.5 block">{t('auth.password')} *</Label>
                  <Input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="••••••••" className={inputClass} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-cm-secondary text-xs mb-1.5 block">{t('auth.province')}</Label>
                    <Select value={regProvince} onValueChange={setRegProvince}>
                      <SelectTrigger className={`${inputClass} h-11`}><SelectValue placeholder={t('auth.select')} /></SelectTrigger>
                      <SelectContent className="bg-cm-elevated border-cm-border-hover">
                        {PROVINCES.map((p) => <SelectItem key={p.slug} value={p.slug} className="text-cm-secondary">{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-cm-secondary text-xs mb-1.5 block">{t('auth.city')}</Label>
                    <Input value={regCity} onChange={(e) => setRegCity(e.target.value)} placeholder={t('auth.city')} className={inputClass} />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl h-11">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t('auth.createBuyerAccount')}
                </Button>
              </form>
            </TabsContent>

            {/* Seller Register */}
            <TabsContent value="register-seller" className="p-6 mt-0">
              <form onSubmit={handleSellerRegister} className="space-y-4">
                <div>
                  <Label className="text-cm-secondary text-xs mb-1.5 block">{t('auth.name')} *</Label>
                  <Input value={sellerName} onChange={(e) => setSellerName(e.target.value)} placeholder="Jane Smith" className={inputClass} required />
                </div>
                <div>
                  <Label className="text-cm-secondary text-xs mb-1.5 block">{t('auth.email')} *</Label>
                  <Input type="email" value={sellerEmail} onChange={(e) => setSellerEmail(e.target.value)} placeholder="you@example.com" className={inputClass} required />
                </div>
                <div>
                  <Label className="text-cm-secondary text-xs mb-1.5 block">{t('auth.password')} *</Label>
                  <Input type="password" value={sellerPassword} onChange={(e) => setSellerPassword(e.target.value)} placeholder="••••••••" className={inputClass} required />
                </div>
                <div>
                  <Label className="text-cm-secondary text-xs mb-1.5 block">{t('auth.storeName')} *</Label>
                  <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder={t('auth.storeName')} className={inputClass} required />
                </div>
                <div>
                  <Label className="text-cm-secondary text-xs mb-1.5 block">{t('auth.storeDescription')}</Label>
                  <Input value={storeDesc} onChange={(e) => setStoreDesc(e.target.value)} placeholder={t('auth.storeDescription')} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-cm-secondary text-xs mb-1.5 block">{t('auth.province')}</Label>
                    <Select value={sellerProvince} onValueChange={setSellerProvince}>
                      <SelectTrigger className={`${inputClass} h-11`}><SelectValue placeholder={t('auth.select')} /></SelectTrigger>
                      <SelectContent className="bg-cm-elevated border-cm-border-hover">
                        {PROVINCES.map((p) => <SelectItem key={p.slug} value={p.slug} className="text-cm-secondary">{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-cm-secondary text-xs mb-1.5 block">{t('auth.city')}</Label>
                    <Input value={sellerCity} onChange={(e) => setSellerCity(e.target.value)} placeholder={t('auth.city')} className={inputClass} />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-300 hover:to-red-500 text-black font-semibold rounded-xl h-11">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t('auth.createSellerAccount')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
