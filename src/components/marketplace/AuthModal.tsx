'use client'
import { useState, useCallback, useEffect } from 'react'
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
import { Eye, EyeOff, Loader2, CheckCircle2, RefreshCw } from 'lucide-react'
import { PROVINCES } from '@/lib/types'
import { toast } from 'sonner'
import { signIn } from 'next-auth/react'

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalTab, navigate } = useNavigation()
  const { setUser } = useAuth()
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Buyer CAPTCHA
  const [regCaptchaA, setRegCaptchaA] = useState(0)
  const [regCaptchaB, setRegCaptchaB] = useState(0)
  const [regCaptchaAnswer, setRegCaptchaAnswer] = useState('')
  const [regCaptchaError, setRegCaptchaError] = useState('')

  // Seller CAPTCHA
  const [sellerCaptchaA, setSellerCaptchaA] = useState(0)
  const [sellerCaptchaB, setSellerCaptchaB] = useState(0)
  const [sellerCaptchaAnswer, setSellerCaptchaAnswer] = useState('')
  const [sellerCaptchaError, setSellerCaptchaError] = useState('')

  const generateRegCaptcha = useCallback(() => {
    setRegCaptchaA(Math.floor(Math.random() * 10) + 1)
    setRegCaptchaB(Math.floor(Math.random() * 10) + 1)
    setRegCaptchaAnswer('')
    setRegCaptchaError('')
  }, [])

  const generateSellerCaptcha = useCallback(() => {
    setSellerCaptchaA(Math.floor(Math.random() * 10) + 1)
    setSellerCaptchaB(Math.floor(Math.random() * 10) + 1)
    setSellerCaptchaAnswer('')
    setSellerCaptchaError('')
  }, [])

  useEffect(() => {
    generateRegCaptcha()
    generateSellerCaptcha()
  }, [generateRegCaptcha, generateSellerCaptcha])

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
    if (parseInt(regCaptchaAnswer) !== regCaptchaA + regCaptchaB) {
      setRegCaptchaError('Incorrect answer. Please try again.')
      generateRegCaptcha()
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
    if (parseInt(sellerCaptchaAnswer) !== sellerCaptchaA + sellerCaptchaB) {
      setSellerCaptchaError('Incorrect answer. Please try again.')
      generateSellerCaptcha()
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

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    signIn(provider, { callbackUrl: '/?social=1' })
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

                {/* Social Login Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-cm-border-subtle" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-cm-elevated text-cm-dim">{t('auth.orContinueWith')}</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="flex items-center justify-center gap-2 h-11 rounded-xl border border-cm-border-hover bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('facebook')}
                    className="flex items-center justify-center gap-2 h-11 rounded-xl text-white text-sm font-medium transition-colors"
                    style={{ background: '#1877F2' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#166FE5')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#1877F2')}
                  >
                    <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </button>
                </div>

                {/* Demo Accounts Divider */}
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
                    { label: 'Admin', email: 'admin@canadamarketplace.ca', password: 'Admin123!' },
                    { label: 'Seller', email: 'sarah@techshop.ca', password: 'Seller123!' },
                    { label: 'Buyer', email: 'alex@gmail.com', password: 'Buyer123!' },
                  ].map((demo) => (
                    <button
                      type="button"
                      key={demo.label}
                      onClick={() => { setLoginEmail(demo.email); setLoginPassword(demo.password) }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-cm-hover hover:bg-cm-hover-strong text-xs text-cm-secondary transition-colors"
                    >
                      <span>{demo.label}: {demo.email}</span>
                      <span className="text-cm-faint text-[10px]">pw: {demo.password}</span>
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
                {/* Buyer CAPTCHA */}
                <div className="p-3 rounded-xl bg-cm-hover border border-cm-border-subtle">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-cm-dim">What is</span>
                    <span className="text-sm font-bold text-red-400">{regCaptchaA} + {regCaptchaB}</span>
                    <span className="text-xs text-cm-dim">?</span>
                    <Input
                      type="number"
                      value={regCaptchaAnswer}
                      onChange={(e) => { setRegCaptchaAnswer(e.target.value); setRegCaptchaError('') }}
                      placeholder="?"
                      className={`w-16 h-8 text-xs ${regCaptchaError ? 'border-red-500/50' : ''} ${inputClass}`}
                    />
                    <button type="button" onClick={generateRegCaptcha} className="text-cm-dim hover:text-cm-secondary">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {regCaptchaError && <p className="text-[10px] text-red-400 mt-1">{regCaptchaError}</p>}
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
                {/* Seller CAPTCHA */}
                <div className="p-3 rounded-xl bg-cm-hover border border-cm-border-subtle">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-cm-dim">What is</span>
                    <span className="text-sm font-bold text-red-400">{sellerCaptchaA} + {sellerCaptchaB}</span>
                    <span className="text-xs text-cm-dim">?</span>
                    <Input
                      type="number"
                      value={sellerCaptchaAnswer}
                      onChange={(e) => { setSellerCaptchaAnswer(e.target.value); setSellerCaptchaError('') }}
                      placeholder="?"
                      className={`w-16 h-8 text-xs ${sellerCaptchaError ? 'border-red-500/50' : ''} ${inputClass}`}
                    />
                    <button type="button" onClick={generateSellerCaptcha} className="text-cm-dim hover:text-cm-secondary">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {sellerCaptchaError && <p className="text-[10px] text-red-400 mt-1">{sellerCaptchaError}</p>}
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
