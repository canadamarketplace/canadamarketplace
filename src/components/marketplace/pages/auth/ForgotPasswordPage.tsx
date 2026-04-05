'use client'
import { useState } from 'react'
import { useNavigation } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Leaf, Loader2, Mail, ArrowLeft, KeyRound } from 'lucide-react'
import { toast } from 'sonner'

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
