'use client'
import { useState } from 'react'
import { useNavigation } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Leaf, Loader2, Mail, ArrowLeft, KeyRound } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const { openAuthModal } = useNavigation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Please enter your email address')
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
        toast.error(data.error || 'Something went wrong')
      }
    } catch {
      toast.error('Request failed. Please try again.')
    }
    setLoading(false)
  }

  const handleBackToSignIn = () => {
    openAuthModal('login')
  }

  const inputClass =
    'bg-white/5 border-white/10 text-stone-100 placeholder:text-stone-600 focus:border-red-500/50 focus:ring-red-500/20 h-11 rounded-xl'

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/20">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-stone-100 mb-1">
            Forgot Your Password?
          </h1>
          <p className="text-sm text-stone-400">
            {sent
              ? 'Check your inbox for a reset link'
              : "No worries — we'll send you a reset link"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 sm:p-8">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label className="text-stone-300 text-xs mb-1.5 block">
                  Email Address
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
                Send Reset Link
              </Button>

              <p className="text-center text-xs text-stone-500">
                Enter the email address associated with your account and
                we&apos;ll send you a link to reset your password.
              </p>
            </form>
          ) : (
            /* ── Success state ── */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-stone-100 mb-1">
                  Check Your Email
                </h2>
                <p className="text-sm text-stone-400">
                  We&apos;ve sent a password reset link to{' '}
                  <span className="text-stone-200 font-medium">{email}</span>.
                  The link expires in 1 hour.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-3">
                <KeyRound className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-stone-400 text-left">
                  Didn&apos;t receive the email? Check your spam folder or{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false)
                      setEmail('')
                    }}
                    className="text-red-400 hover:text-red-300 underline underline-offset-2"
                  >
                    try again
                  </button>{' '}
                  with a different address.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  onClick={handleBackToSignIn}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl h-11 font-semibold"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
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
              className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
