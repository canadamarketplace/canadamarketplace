'use client'
import { useNavigation } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, Truck, Package, MapPin, Clock, CheckCircle2, Box,
  ArrowRight, Mail, Shield, RotateCcw
} from 'lucide-react'

export default function ShippingPage() {
  const { navigate } = useNavigation()
  const { t } = useTranslation()

  const shippingPartners = [
    {
      name: 'Canada Post',
      desc: t('shipping.canadaPostDesc'),
      color: 'text-red-400 bg-red-500/10',
    },
    {
      name: 'Purolator',
      desc: t('shipping.purolatorDesc'),
      color: 'text-red-300 bg-red-500/10',
    },
    {
      name: 'UPS',
      desc: t('shipping.upsDesc'),
      color: 'text-green-400 bg-green-500/10',
    },
    {
      name: 'FedEx',
      desc: t('shipping.fedexDesc'),
      color: 'text-purple-400 bg-purple-500/10',
    },
  ]

  const timelines = [
    {
      zone: t('shipping.zone1'),
      time: t('shipping.zone1Time'),
      color: 'border-green-500/20 bg-green-500/5',
      badge: 'bg-green-500/10 text-green-400',
    },
    {
      zone: t('shipping.zone2'),
      time: t('shipping.zone2Time'),
      color: 'border-blue-500/20 bg-blue-500/5',
      badge: 'bg-blue-500/10 text-blue-400',
    },
    {
      zone: t('shipping.zone3'),
      time: t('shipping.zone3Time'),
      color: 'border-red-500/20 bg-red-500/5',
      badge: 'bg-red-500/10 text-red-300',
    },
    {
      zone: t('shipping.zone4'),
      time: t('shipping.zone4Time'),
      color: 'border-red-500/20 bg-red-500/5',
      badge: 'bg-red-500/10 text-red-400',
    },
  ]

  const packageTips = [
    { icon: Box, title: t('shipping.tip1Title'), desc: t('shipping.tip1Desc') },
    { icon: Package, title: t('shipping.tip2Title'), desc: t('shipping.tip2Desc') },
    { icon: Mail, title: t('shipping.tip3Title'), desc: t('shipping.tip3Desc') },
    { icon: Shield, title: t('shipping.tip4Title'), desc: t('shipping.tip4Desc') },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 via-transparent to-transparent" />
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-emerald-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <button
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </button>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-6">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-[0.2em]">{t('shipping.badge')}</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            {t('shipping.heroTitle')}
          </h1>
          <p className="text-lg text-stone-400 font-light max-w-2xl mx-auto leading-relaxed">
            {t('shipping.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Shipping Partners */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-[0.2em]">{t('shipping.partnersLabel')}</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              {t('shipping.partnersTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {shippingPartners.map((partner) => (
              <div key={partner.name} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
                <div className={`w-12 h-12 rounded-xl ${partner.color} flex items-center justify-center mb-4`}>
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-stone-200 mb-2">{partner.name}</h3>
                <p className="text-sm text-stone-400 font-light leading-relaxed">{partner.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping Timelines */}
      <section className="px-6 py-16 bg-gradient-to-b from-transparent via-emerald-900/[0.03] to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-[0.2em]">{t('shipping.timelineLabel')}</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              {t('shipping.timelineTitle')}
            </h2>
          </div>
          <div className="space-y-4">
            {timelines.map((item) => (
              <div key={item.zone} className={`p-5 rounded-xl border ${item.color} flex items-center justify-between gap-4`}>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-stone-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-stone-200">{item.zone}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${item.badge}`}>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping Costs */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-900/10 via-neutral-900/50 to-transparent border border-emerald-500/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-100 mb-3">{t('shipping.costsTitle')}</h2>
                <p className="text-stone-400 font-light leading-relaxed">{t('shipping.costsDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tracking */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-blue-400 uppercase tracking-[0.2em]">{t('shipping.trackingLabel')}</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              {t('shipping.trackingTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: t('shipping.tracking1Title'), desc: t('shipping.tracking1Desc') },
              { title: t('shipping.tracking2Title'), desc: t('shipping.tracking2Desc') },
              { title: t('shipping.tracking3Title'), desc: t('shipping.tracking3Desc') },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-stone-200 mb-2">{item.title}</h3>
                <p className="text-sm text-stone-400 font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packaging Tips */}
      <section className="px-6 py-16 bg-gradient-to-b from-transparent via-red-900/[0.03] to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-red-300 uppercase tracking-[0.2em]">{t('shipping.tipsLabel')}</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              {t('shipping.tipsTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {packageTips.map((tip) => (
              <div key={tip.title} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-3">
                  <tip.icon className="w-5 h-5 text-red-300" />
                </div>
                <h3 className="text-sm font-semibold text-stone-200 mb-1.5">{tip.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Returns & Exchanges */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-red-400 uppercase tracking-[0.2em]">{t('shipping.returnsLabel')}</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              {t('shipping.returnsTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: RotateCcw, title: t('shipping.return1Title'), desc: t('shipping.return1Desc') },
              { icon: Clock, title: t('shipping.return2Title'), desc: t('shipping.return2Desc') },
              { icon: Shield, title: t('shipping.return3Title'), desc: t('shipping.return3Desc') },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-base font-semibold text-stone-200 mb-2">{item.title}</h3>
                <p className="text-sm text-stone-400 font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Territories & Pickup */}
      <section className="px-6 py-16 bg-gradient-to-b from-transparent via-emerald-900/[0.03] to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-100 mb-2">{t('shipping.territoriesTitle')}</h2>
                  <p className="text-sm text-stone-400 font-light leading-relaxed">
                    {t('shipping.territoriesDesc')}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {['Yukon', 'NWT', 'Nunavut'].map((t) => (
                      <span key={t} className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-100 mb-2">{t('shipping.pickupTitle')}</h2>
                  <p className="text-sm text-stone-400 font-light leading-relaxed">
                    {t('shipping.pickupDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-2xl bg-gradient-to-br from-emerald-900/20 via-neutral-900/50 to-blue-900/10 border border-white/5">
            <h2 className="text-2xl md:text-3xl font-bold text-stone-100 mb-3">
              {t('shipping.ctaTitle')}
            </h2>
            <p className="text-stone-400 font-light mb-8">
              {t('shipping.ctaDesc')}
            </p>
            <Button
              onClick={() => navigate('browse')}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl px-8 shadow-lg shadow-emerald-500/20"
            >
              <span className="flex items-center gap-2">
                {t('shipping.ctaButton')}
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
