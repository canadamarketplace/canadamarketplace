'use client'
import { useAuth, useNavigation } from '@/lib/store'
import { Shield, Lock, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Reusable admin auth guard component.
 * Renders the admin access required prompt when user is not authenticated as ADMIN.
 * Otherwise renders children (the actual admin page content).
 */
export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { openAuthModal } = useNavigation()

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Shield Icon */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-700/10 border border-red-500/20 flex items-center justify-center">
            <Shield className="w-10 h-10 text-red-400" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-cm-primary flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-red-400" />
              Admin Access Required
            </h1>
            <p className="text-sm text-cm-dim leading-relaxed">
              Please sign in with your admin account to access the dashboard.
            </p>
          </div>

          {/* Sign In Button */}
          <Button
            onClick={() => openAuthModal('login')}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl h-11 px-8 hover:from-red-500 hover:to-red-600 transition-all"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>

          {/* Admin Email Hint */}
          <div className="pt-2">
            <p className="text-xs text-cm-faint">
              Admin account:{' '}
              <span className="text-cm-dim font-mono">a***@canadamarketplace.ca</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
