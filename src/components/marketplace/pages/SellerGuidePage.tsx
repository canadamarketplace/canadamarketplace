'use client'
import { useNavigation } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, ArrowRight, Store, UserPlus, FileText, Camera, DollarSign,
  Award, CheckCircle2, Star, ChevronRight, Mail, Phone, CreditCard, Image,
  Package, Zap
} from 'lucide-react'

export default function SellerGuidePage() {
  const { navigate } = useNavigation()
  const { t } = useTranslation()
  const { openAuthModal } = useNavigation.getState()

  const regSteps = [
    {
      step: '01',
      title: t('sellerGuide.step1Title'),
      desc: t('sellerGuide.step1Desc'),
      icon: UserPlus,
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      step: '02',
      title: t('sellerGuide.step2Title'),
      desc: t('sellerGuide.step2Desc'),
      icon: Store,
      color: 'text-amber-400 bg-amber-500/10',
    },
    {
      step: '03',
      title: t('sellerGuide.step3Title'),
      desc: t('sellerGuide.step3Desc'),
      icon: FileText,
      color: 'text-green-400 bg-green-500/10',
    },
    {
      step: '04',
      title: t('sellerGuide.step4Title'),
      desc: t('sellerGuide.step4Desc'),
      icon: CreditCard,
      color: 'text-purple-400 bg-purple-500/10',
    },
    {
      step: '05',
      title: t('sellerGuide.step5Title'),
      desc: t('sellerGuide.step5Desc'),
      icon: Package,
      color: 'text-cyan-400 bg-cyan-500/10',
    },
    {
      step: '06',
      title: t('sellerGuide.step6Title'),
      desc: t('sellerGuide.step6Desc'),
      icon: Camera,
      color: 'text-pink-400 bg-pink-500/10',
    },
    {
      step: '07',
      title: t('sellerGuide.step7Title'),
      desc: t('sellerGuide.step7Desc'),
      icon: Zap,
      color: 'text-emerald-400 bg-emerald-500/10',
    },
  ]

  const checklist = [
    { icon: Mail, label: t('sellerGuide.checkEmail'), color: 'text-blue-400' },
    { icon: Phone, label: t('sellerGuide.checkPhone'), color: 'text-green-400' },
    { icon: CreditCard, label: t('sellerGuide.checkId'), color: 'text-purple-400' },
    { icon: DollarSign, label: t('sellerGuide.checkBank'), color: 'text-amber-400' },
    { icon: Image, label: t('sellerGuide.checkPhotos'), color: 'text-pink-400' },
  ]

  const tips = [
    { title: t('sellerGuide.tip1Title'), desc: t('sellerGuide.tip1Desc') },
    { title: t('sellerGuide.tip2Title'), desc: t('sellerGuide.tip2Desc') },
    { title: t('sellerGuide.tip3Title'), desc: t('sellerGuide.tip3Desc') },
    { title: t('sellerGuide.tip4Title'), desc: t('sellerGuide.tip4Desc') },
    { title: t('sellerGuide.tip5Title'), desc: t('sellerGuide.tip5Desc') },
    { title: t('sellerGuide.tip6Title'), desc: t('sellerGuide.tip6Desc') },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 via-transparent to-transparent" />
        <div className="absolute top-10 left-1/3 w-72 h-72 bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <button
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </button>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/5 mb-6">
            <Store className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-amber-400 uppercase tracking-[0.2em]">{t('sellerGuide.badge')}</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            {t('sellerGuide.heroTitle')}
          </h1>
          <p className="text-lg text-stone-400 font-light max-w-2xl mx-auto leading-relaxed">
            {t('sellerGuide.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Registration Steps */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-amber-500 uppercase tracking-[0.2em]">{t('sellerGuide.stepsLabel')}</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              {t('sellerGuide.stepsTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {regSteps.map((item, idx) => (
              <div key={item.step} className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-stone-600">{item.step}</span>
                  <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-stone-200 mb-2">{item.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                {idx < regSteps.length - 1 && (
                  <ChevronRight className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-700 hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Need */}
      <section className="px-6 py-16 bg-gradient-to-b from-transparent via-amber-900/[0.03] to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-amber-500 uppercase tracking-[0.2em]">{t('sellerGuide.checklistLabel')}</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              {t('sellerGuide.checklistTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="text-sm text-stone-300 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips for Success */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-amber-500 uppercase tracking-[0.2em]">{t('sellerGuide.tipsLabel')}</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              {t('sellerGuide.tipsTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip) => (
              <div key={tip.title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-base font-semibold text-stone-200 mb-2">{tip.title}</h3>
                <p className="text-sm text-stone-400 font-light leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fees Explained */}
      <section className="px-6 py-16 bg-gradient-to-b from-transparent via-amber-900/[0.03] to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-green-400 uppercase tracking-[0.2em]">{t('sellerGuide.feesLabel')}</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              {t('sellerGuide.feesTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">8%</div>
              <div className="text-sm text-stone-300 font-medium mb-1">{t('sellerGuide.basicFee')}</div>
              <div className="text-xs text-stone-500">{t('sellerGuide.noMonthly')}</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-amber-500/20 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-1">5%</div>
              <div className="text-sm text-stone-300 font-medium mb-1">{t('sellerGuide.goldFee')}</div>
              <div className="text-xs text-stone-500">{t('sellerGuide.goldLabel')}</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
              <div className="text-3xl font-bold text-stone-100 mb-1">$0</div>
              <div className="text-sm text-stone-300 font-medium mb-1">{t('sellerGuide.freeToStart')}</div>
              <div className="text-xs text-stone-500">{t('sellerGuide.onlyPayWhenSell')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Seller Levels Comparison */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-amber-500 uppercase tracking-[0.2em]">{t('sellerGuide.levelsLabel')}</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              {t('sellerGuide.levelsTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-stone-500/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-stone-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-stone-200">{t('sellerGuide.basicLevel')}</h3>
                  <p className="text-xs text-stone-500">{t('sellerGuide.basicLabel')}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  t('sellerGuide.basicF1'),
                  t('sellerGuide.basicF2'),
                  t('sellerGuide.basicF3'),
                  t('sellerGuide.basicF4'),
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-stone-400">
                    <CheckCircle2 className="w-4 h-4 text-stone-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            {/* Gold */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-900/10 to-transparent border border-amber-500/20 relative">
              <div className="absolute -top-3 right-4">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  {t('sellerGuide.recommended')}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-300">{t('sellerGuide.goldLevel')}</h3>
                  <p className="text-xs text-amber-500">{t('sellerGuide.goldLabelDesc')}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  t('sellerGuide.goldF1'),
                  t('sellerGuide.goldF2'),
                  t('sellerGuide.goldF3'),
                  t('sellerGuide.goldF4'),
                  t('sellerGuide.goldF5'),
                  t('sellerGuide.goldF6'),
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-stone-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-2xl bg-gradient-to-br from-amber-900/20 via-neutral-900/50 to-red-900/10 border border-amber-500/10">
            <Award className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-stone-100 mb-3">
              {t('sellerGuide.ctaTitle')}
            </h2>
            <p className="text-stone-400 font-light mb-8 max-w-lg mx-auto">
              {t('sellerGuide.ctaDesc')}
            </p>
            <Button
              onClick={() => openAuthModal('register-seller')}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold rounded-2xl px-10 shadow-lg shadow-amber-500/20"
            >
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                {t('sellerGuide.ctaButton')}
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>
            <p className="text-xs text-stone-600 mt-4">{t('sellerGuide.ctaNote')}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
