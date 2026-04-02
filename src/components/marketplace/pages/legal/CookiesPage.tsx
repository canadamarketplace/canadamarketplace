'use client'
import { useNavigation } from '@/lib/store'
import { ChevronLeft, Cookie } from 'lucide-react'

export default function CookiesPage() {
  const { navigate } = useNavigation()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('home')} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 mb-6 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
      </button>

      <div className="rounded-2xl bg-neutral-900/60 border border-white/5 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Cookie className="w-5 h-5 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-stone-100">Cookie Policy</h1>
        </div>
        <p className="text-xs text-stone-600 mb-8">Last updated: January 1, 2025</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-stone-400 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-stone-200 mb-3">1. What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and enabling core functionality.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-stone-200 mb-3">2. Types of Cookies We Use</h2>
            <p>We use essential cookies for authentication and security, performance cookies to analyze usage and improve our service, and preference cookies to remember your settings. We do not use advertising cookies from third parties.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-stone-200 mb-3">3. Managing Cookies</h2>
            <p>You can manage or disable cookies through your browser settings. Please note that disabling essential cookies may affect the functionality of our platform. For the best experience, we recommend keeping cookies enabled.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
