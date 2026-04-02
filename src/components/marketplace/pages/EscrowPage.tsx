'use client'
import { useState } from 'react'
import { useNavigation } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, Shield, Lock, CheckCircle2, DollarSign, AlertTriangle,
  Clock, ThumbsUp, CreditCard, ChevronDown, ChevronUp, ArrowRight
} from 'lucide-react'

export default function EscrowPage() {
  const { navigate } = useNavigation()
  const { t } = useTranslation()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const steps = [
    {
      step: '01',
      title: t('escrow.step1Title'),
      desc: t('escrow.step1Desc'),
      icon: CreditCard,
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      step: '02',
      title: t('escrow.step2Title'),
      desc: t('escrow.step2Desc'),
      icon: Lock,
      color: 'text-red-300 bg-red-500/10',
    },
    {
      step: '03',
      title: t('escrow.step3Title'),
      desc: t('escrow.step3Desc'),
      icon: CheckCircle2,
      color: 'text-green-400 bg-green-500/10',
    },
    {
      step: '04',
      title: t('escrow.step4Title'),
      desc: t('escrow.step4Desc'),
      icon: ThumbsUp,
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      step: '05',
      title: t('escrow.step5Title'),
      desc: t('escrow.step5Desc'),
      icon: AlertTriangle,
      color: 'text-red-400 bg-red-500/10',
    },
  ]

  const buyerBenefits = [
    { icon: DollarSign, title: t('escrow.buyerFullRefund'), desc: t('escrow.buyerFullRefundDesc') },
    { icon: Lock, title: t('escrow.buyerNoRelease'), desc: t('escrow.buyerNoReleaseDesc') },
    { icon: Clock, title: t('escrow.buyerDispute'), desc: t('escrow.buyerDisputeDesc') },
  ]

  const sellerBenefits = [
    { icon: CheckCircle2, title: t('escrow.sellerProof'), desc: t('escrow.sellerProofDesc') },
    { icon: Shield, title: t('escrow.sellerFraud'), desc: t('escrow.sellerFraudDesc') },
    { icon: ThumbsUp, title: t('escrow.sellerFair'), desc: t('escrow.sellerFairDesc') },
  ]

  const faqs = [
    { q: t('escrow.faq1Q'), a: t('escrow.faq1A') },
    { q: t('escrow.faq2Q'), a: t('escrow.faq2A') },
    { q: t('escrow.faq3Q'), a: t('escrow.faq3A') },
    { q: t('escrow.faq4Q'), a: t('escrow.faq4A') },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent" />
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <button
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </button>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 mb-6">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-blue-400 uppercase tracking-[0.2em]">{t('escrow.badge')}</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            {t('escrow.heroTitle')}
          </h1>
          <p className="text-lg text-stone-400 font-light max-w-2xl mx-auto leading-relaxed">
            {t('escrow.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* What is Escrow */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-900/10 via-neutral-900/50 to-transparent border border-blue-500/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-100 mb-3">{t('escrow.whatIsTitle')}</h2>
                <p className="text-stone-400 font-light leading-relaxed">{t('escrow.whatIsDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-blue-400 uppercase tracking-[0.2em]">{t('escrow.processLabel')}</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              {t('escrow.processTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map((item, idx) => (
              <div key={item.step} className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-stone-600">{item.step}</span>
                  <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-stone-200 mb-2">{item.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-px bg-stone-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Buyers */}
      <section className="px-6 py-16 bg-gradient-to-b from-transparent via-blue-900/[0.03] to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-green-400 uppercase tracking-[0.2em]">{t('escrow.buyersLabel')}</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              {t('escrow.buyersTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {buyerBenefits.map((item) => (
              <div key={item.title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-base font-semibold text-stone-200 mb-2">{item.title}</h3>
                <p className="text-sm text-stone-400 font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Sellers */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-red-300 uppercase tracking-[0.2em]">{t('escrow.sellersLabel')}</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              {t('escrow.sellersTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sellerBenefits.map((item) => (
              <div key={item.title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-red-300" />
                </div>
                <h3 className="text-base font-semibold text-stone-200 mb-2">{item.title}</h3>
                <p className="text-sm text-stone-400 font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-blue-400 uppercase tracking-[0.2em]">{t('escrow.faqLabel')}</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              {t('escrow.faqTitle')}
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <h3 className="text-sm font-semibold text-stone-200 pr-4">{faq.q}</h3>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-stone-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-stone-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-2xl bg-gradient-to-br from-blue-900/20 via-neutral-900/50 to-red-900/10 border border-white/5">
            <h2 className="text-2xl md:text-3xl font-bold text-stone-100 mb-3">
              {t('escrow.ctaTitle')}
            </h2>
            <p className="text-stone-400 font-light mb-8">
              {t('escrow.ctaDesc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => navigate('browse')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl px-8 shadow-lg shadow-blue-500/20"
              >
                <span className="flex items-center gap-2">
                  {t('escrow.ctaShop')}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('become-seller')}
                className="border-white/10 text-stone-300 hover:bg-white/5 rounded-xl px-8"
              >
                {t('escrow.ctaSell')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
