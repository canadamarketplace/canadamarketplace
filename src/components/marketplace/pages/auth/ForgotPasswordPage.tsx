'use client'
import { useState } from 'react'
import { useNavigation } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Leaf, Loader2, Mail, ArrowLeft, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { signIn } from 'next-auth/react'

export default function ForgotPasswordPage() {
  const { openAuthModal } = useNavigation()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error(t('common.pleaseEnterEmail'))
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (res.ok) {
        setSent(true)
      } else {
        const data = await res.json()
        toast.error(data.error || t('common.somethingWentWrong'))
      }
    } catch {
      toast.error(t('common.requestFailed'))
    }
    setLoading(false)
  }

  const handleBackToSignIn = () => {
    openAuthModal('login')
  }

  const inputClass =
    'bg-cm-hover border-cm-border-hover text-cm-primary placeholder:text-cm-faint focus:border-red-500/50 focus:ring-red-500/20 h-11 rounded-xl'

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg shadow-red-500/20">
            <img src="/logo-square.png" alt="Canada Marketplace" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-cm-primary mb-1">
            {t('forgotPassword.title')}
          </h1>
          <p className="text-sm text-cm-muted">
            {sent
              ? t('forgotPassword.subtitleSent')
              : t('forgotPassword.subtitle')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-cm-elevated border border-cm-border-hover rounded-2xl p-6 sm:p-8">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label className="text-cm-secondary text-xs mb-1.5 block">
                  {t('forgotPassword.emailAddress')}
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                  required
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl h-11 font-semibold"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                {t('forgotPassword.sendResetLink')}
              </Button>

              <p className="text-center text-xs text-cm-dim">
                {t('forgotPassword.infoText')}
              </p>

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
                  onClick={() => signIn('google', { callbackUrl: '/?social=1' })}
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
                  onClick={() => signIn('facebook', { callbackUrl: '/?social=1' })}
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
            </form>
          ) : (
            /* ── Success state ── */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-cm-primary mb-1">
                  {t('forgotPassword.checkYourEmail')}
                </h2>
                <p className="text-sm text-cm-muted">
                  {t('forgotPassword.checkYourEmailDesc', { email })}
                </p>
              </div>

              <div className="bg-cm-hover border border-cm-border-hover rounded-xl p-3 flex items-start gap-3">
                <KeyRound className="w-4 h-4 text-red-300 mt-0.5 shrink-0" />
                <p className="text-xs text-cm-muted text-left">
                  {t('forgotPassword.didntReceive')}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false)
                      setEmail('')
                    }}
                    className="text-red-400 hover:text-red-300 underline underline-offset-2"
                  >
                    {t('forgotPassword.tryAgain')}
                  </button>{' '}
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  onClick={handleBackToSignIn}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl h-11 font-semibold"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('forgotPassword.backToSignIn')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Back link (non-sent state) */}
        {!sent && (
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={handleBackToSignIn}
              className="inline-flex items-center gap-1.5 text-sm text-cm-muted hover:text-cm-secondary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('forgotPassword.backToSignIn')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
