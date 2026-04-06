'use client'
import { useState } from 'react'
import { useNavigation } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { FAQJsonLd } from '@/components/seo/JsonLd'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, HelpCircle, ChevronDown, ChevronUp, ArrowRight,
  Search
} from 'lucide-react'

type FaqCategory = 'all' | 'buying' | 'selling' | 'payments' | 'shipping' | 'account' | 'safety'

export default function FaqPage() {
  const { navigate } = useNavigation()
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('all')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const categories: { key: FaqCategory; label: string }[] = [
    { key: 'all', label: t('faq.catAll') },
    { key: 'buying', label: t('faq.catBuying') },
    { key: 'selling', label: t('faq.catSelling') },
    { key: 'payments', label: t('faq.catPayments') },
    { key: 'shipping', label: t('faq.catShipping') },
    { key: 'account', label: t('faq.catAccount') },
    { key: 'safety', label: t('faq.catSafety') },
  ]

  const faqItems: { category: FaqCategory; q: string; a: string }[] = [
    // Buying
    { category: 'buying', q: t('faq.q1'), a: t('faq.a1') },
    { category: 'buying', q: t('faq.q2'), a: t('faq.a2') },
    { category: 'buying', q: t('faq.q3'), a: t('faq.a3') },
    { category: 'buying', q: t('faq.q4'), a: t('faq.a4') },
    { category: 'buying', q: t('faq.q5'), a: t('faq.a5') },
    // Selling
    { category: 'selling', q: t('faq.q6'), a: t('faq.a6') },
    { category: 'selling', q: t('faq.q7'), a: t('faq.a7') },
    { category: 'selling', q: t('faq.q8'), a: t('faq.a8') },
    { category: 'selling', q: t('faq.q9'), a: t('faq.a9') },
    { category: 'selling', q: t('faq.q10'), a: t('faq.a10') },
    // Payments
    { category: 'payments', q: t('faq.q11'), a: t('faq.a11') },
    { category: 'payments', q: t('faq.q12'), a: t('faq.a12') },
    { category: 'payments', q: t('faq.q13'), a: t('faq.a13') },
    { category: 'payments', q: t('faq.q14'), a: t('faq.a14') },
    // Shipping
    { category: 'shipping', q: t('faq.q15'), a: t('faq.a15') },
    { category: 'shipping', q: t('faq.q16'), a: t('faq.a16') },
    { category: 'shipping', q: t('faq.q17'), a: t('faq.a17') },
    { category: 'shipping', q: t('faq.q18'), a: t('faq.a18') },
    // Account
    { category: 'account', q: t('faq.q19'), a: t('faq.a19') },
    { category: 'account', q: t('faq.q20'), a: t('faq.a20') },
    // Safety
    { category: 'safety', q: t('faq.q21'), a: t('faq.a21') },
    { category: 'safety', q: t('faq.q22'), a: t('faq.a22') },
    { category: 'safety', q: t('faq.q23'), a: t('faq.a23') },
    { category: 'safety', q: t('faq.q24'), a: t('faq.a24') },
  ]

  const filteredItems = faqItems.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const matchesSearch = searchQuery === '' ||
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Prepare FAQ items for JSON-LD structured data (always use all items for SEO)
  const faqStructuredData = faqItems.map((item) => ({
    question: item.q,
    answer: item.a,
  }))

  return (
    <div className="min-h-screen bg-cm-bg">
      <FAQJsonLd faqs={faqStructuredData} />
      {/* Hero */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent" />
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <button
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-2 text-sm text-cm-dim hover:text-cm-secondary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </button>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 mb-6">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-purple-400 uppercase tracking-[0.2em]">{t('faq.badge')}</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            {t('faq.heroTitle')}
          </h1>
          <p className="text-lg text-cm-muted font-light max-w-2xl mx-auto leading-relaxed">
            {t('faq.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="px-6 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-dim" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setOpenFaq(null) }}
              placeholder={t('faq.searchPlaceholder')}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-cm-hover border border-cm-border-hover text-cm-secondary placeholder:text-cm-faint text-sm focus:outline-none focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/20 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => { setActiveCategory(cat.key); setOpenFaq(null) }}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  activeCategory === cat.key
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-cm-hover text-cm-secondary border border-cm-border-subtle hover:bg-cm-hover hover:text-cm-primary'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <HelpCircle className="w-12 h-12 text-cm-faint mx-auto mb-4" />
              <p className="text-cm-dim">{t('faq.noResults')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item, idx) => (
                <div key={`${item.category}-${idx}`} className="rounded-2xl bg-cm-hover border border-cm-border-subtle overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-cm-hover transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider flex-shrink-0 mt-0.5 ${
                        item.category === 'buying' ? 'bg-green-500/10 text-green-400' :
                        item.category === 'selling' ? 'bg-red-500/10 text-red-300' :
                        item.category === 'payments' ? 'bg-blue-500/10 text-blue-400' :
                        item.category === 'shipping' ? 'bg-emerald-500/10 text-emerald-400' :
                        item.category === 'account' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {categories.find(c => c.key === item.category)?.label}
                      </span>
                      <h3 className="text-sm font-semibold text-cm-secondary">{item.q}</h3>
                    </div>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-cm-dim flex-shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-cm-dim flex-shrink-0 ml-2" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 pl-16">
                      <p className="text-sm text-cm-muted leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Result count */}
          <p className="text-xs text-cm-faint text-center mt-6">
            {filteredItems.length} {t('faq.questionCount')}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-2xl bg-gradient-to-br from-purple-900/20 via-neutral-900/50 to-red-900/10 border border-cm-border-subtle">
            <h2 className="text-2xl md:text-3xl font-bold text-cm-primary mb-3">
              {t('faq.ctaTitle')}
            </h2>
            <p className="text-cm-muted font-light mb-8">
              {t('faq.ctaDesc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => navigate('contact')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl px-8 shadow-lg shadow-purple-500/20"
              >
                <span className="flex items-center gap-2">
                  {t('faq.ctaContact')}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('browse')}
                className="border-cm-border-hover text-cm-primary hover:bg-cm-hover rounded-xl px-8"
              >
                {t('faq.ctaBrowse')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
