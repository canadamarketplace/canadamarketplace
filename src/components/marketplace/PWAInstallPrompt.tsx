'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X, Leaf } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Only show on mobile-like devices
    const checkMobile = () => {
      const ua = navigator.userAgent
      const mobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
        window.innerWidth < 768
      setIsMobile(mobile)
    }
    checkMobile()

    // Check if already dismissed
    const dismissed = localStorage.getItem('cm-pwa-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      // Don't show again for 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return
      }
    }

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show prompt after a short delay so it doesn't interrupt on page load
      setTimeout(() => setShowPrompt(true), 3000)
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Also check if the prompt was already fired before this component mounted
    // by checking if we can detect iOS Safari (which doesn't support beforeinstallprompt)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: boolean }).MSStream
    if (isIOS && !window.matchMedia('(display-mode: standalone)').matches) {
      // For iOS, show a different kind of prompt after 3 seconds
      setTimeout(() => setShowPrompt(true), 5000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('cm-pwa-dismissed', Date.now().toString())
  }

  if (!showPrompt || isInstalled) return null

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: boolean }).MSStream

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:hidden animate-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-md mx-auto bg-cm-elevated border border-cm-border-hover rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Red accent line at top */}
        <div className="h-0.5 bg-gradient-to-r from-red-600 to-red-500" />

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* App icon */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-900/30">
              <Leaf className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-cm-primary">
                  Install Canada Marketplace
                </h3>
                <button
                  onClick={handleDismiss}
                  className="text-cm-dim hover:text-cm-secondary transition-colors p-0.5 -mr-1"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-cm-muted mt-0.5 leading-relaxed">
                {isIOS
                  ? 'Tap the Share button, then "Add to Home Screen"'
                  : 'Add to your home screen for a faster experience'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            {!isIOS && deferredPrompt && (
              <Button
                onClick={handleInstall}
                size="sm"
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs h-9 rounded-xl shadow-lg shadow-red-900/30"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Install App
              </Button>
            )}
            {!isIOS && !deferredPrompt && (
              <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/10 border border-red-500/20">
                <span className="text-xs text-red-400">
                  💡 Tap the install icon in your browser&apos;s address bar
                </span>
              </div>
            )}
            {isIOS && (
              <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/10 border border-red-500/20">
                <span className="text-xs text-red-400">
                  📱 Use Safari&apos;s Share → Add to Home Screen
                </span>
              </div>
            )}
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-cm-muted hover:text-cm-secondary hover:bg-cm-hover text-xs h-9 rounded-xl"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
