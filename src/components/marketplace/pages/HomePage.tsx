'use client'
import { useState, useEffect, useRef } from 'react'
import { useNavigation } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CATEGORIES, PROVINCES } from '@/lib/types'
import {
  Leaf, Shield, CheckCircle2, MapPin, DollarSign, FileText, Scale,
  Search, ArrowRight, Star, ShoppingCart, ChevronRight, Users, Package,
  TrendingUp, Lock, Eye, Zap, Globe, CreditCard, Store, Truck, ThumbsUp,
  Timer, Sparkles, Quote, Award, Map, MapPinned
} from 'lucide-react'

interface Product {
  id: string
  title: string
  price: number
  comparePrice?: number | null
  images: string
  condition: string
  store: { id: string; name: string; slug: string; rating: number }
  _count: { reviews: number }
  avgRating?: number
  slug: string
}

export default function HomePage({ scrollTo }: { scrollTo?: string }) {
  const { navigate, openAuthModal } = useNavigation()
  const { t } = useTranslation()
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [animateStats, setAnimateStats] = useState(false)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const regionsRef = useRef<HTMLDivElement>(null)
  const howItWorksRef = useRef<HTMLDivElement>(null)
  const sellerCtaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setAnimateStats(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (scrollTo) {
      setTimeout(() => {
        const ref = scrollTo === 'categories' ? categoriesRef
          : scrollTo === 'regions' ? regionsRef
          : scrollTo === 'how-it-works' ? howItWorksRef
          : scrollTo === 'seller-cta' ? sellerCtaRef
          : null
        ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
    }
  }, [scrollTo])

  useEffect(() => {
    fetchFeatured()
  }, [])

  const fetchFeatured = async () => {
    try {
      const res = await fetch('/api/products?featured=true&limit=8')
      if (res.ok) {
        const data = await res.json()
        setFeatured(data.products || [])
      }
    } catch {}
    setLoading(false)
  }

  const getImages = (imagesStr: string) => {
    try { return JSON.parse(imagesStr) } catch { return [] }
  }

  const stats = [
    { value: '125K+', label: t('home.listings'), icon: Package },
    { value: '38K+', label: t('home.verifiedSellers'), icon: Users },
    { value: '13', label: t('home.provinces'), icon: MapPin },
    { value: '0', label: t('home.fraudCases'), icon: Shield },
  ]

  const safetyFeatures = [
    { icon: Lock, title: t('home.escrowProtection'), desc: t('home.escrowProtectionDesc') },
    { icon: CheckCircle2, title: t('home.verifiedSellersBadge'), desc: t('home.verifiedSellersDesc') },
    { icon: Globe, title: t('home.dataInCanada'), desc: t('home.dataInCanadaDesc') },
    { icon: Scale, title: t('home.disputeProtection'), desc: t('home.disputeProtectionDesc') },
    { icon: DollarSign, title: t('home.cadOnly'), desc: t('home.cadOnlyDesc') },
    { icon: FileText, title: t('home.legalCompliance'), desc: t('home.legalComplianceDesc') },
  ]

  const categoryIcons: Record<string, any> = {
    electronics: Zap, fashion: Star, 'home-garden': Globe, sports: Award,
    vehicles: Truck, books: FileText, music: Sparkles, outdoor: MapPin,
  }

  const steps = [
    { icon: Search, title: t('home.findIt'), desc: t('home.findItDesc') },
    { icon: CreditCard, title: t('home.paySafely'), desc: t('home.paySafelyDesc') },
    { icon: Truck, title: t('home.getIt'), desc: t('home.getItDesc') },
    { icon: ThumbsUp, title: t('home.confirm'), desc: t('home.confirmDesc') },
  ]

  const StatCounter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
    const [count, setCount] = useState(0)
    useEffect(() => {
      if (!animateStats) return
      let start = 0
      const duration = 2000
      const increment = value / (duration / 16)
      const timer = setInterval(() => {
        start += increment
        if (start >= value) { setCount(value); clearInterval(timer) }
        else setCount(Math.floor(start))
      }, 16)
      return () => clearInterval(timer)
    }, [animateStats, value])
    return <>{value >= 1000 ? `${(count / 1000).toFixed(count >= value ? 0 : 0)}K` : count}{suffix}</>
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(220,38,38,0.08)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(245,158,11,0.05)_0%,_transparent_50%)]" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 mb-8">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-amber-400">{t('home.trustedBy')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight mb-6">
              <span className="bg-gradient-to-r from-stone-100 via-stone-200 to-stone-400 bg-clip-text text-transparent">
                {t('home.heroTitle')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-red-400 via-red-500 to-amber-500 bg-clip-text text-transparent">
                {t('home.heroTitleHighlight')}
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-stone-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('home.heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                onClick={() => navigate('browse')}
                size="lg"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-2xl px-8 h-12 text-base shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-shadow"
              >
                {t('home.startShopping')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => openAuthModal('register-seller')}
                variant="outline"
                size="lg"
                className="border-white/10 hover:bg-white/5 text-stone-300 rounded-2xl px-8 h-12 text-base"
              >
                <Store className="w-5 h-5 mr-2" />
                {t('home.startSelling')}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-100">
                    {stat.value.includes('K') ? (
                      <StatCounter value={parseInt(stat.value)} />
                    ) : (
                      stat.value === '0' ? (
                        <span className="text-green-400">
                          <StatCounter value={0} />
                        </span>
                      ) : stat.value
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="py-20 lg:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 mb-4">
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              {t('home.safetyFirst')}
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-stone-100 to-stone-300 bg-clip-text text-transparent">
                {t('home.builtSafeByDesign')}
              </span>
            </h2>
            <p className="text-stone-400 max-w-xl mx-auto">
              {t('home.safetyDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safetyFeatures.map((feature) => (
              <Card key={feature.title} className="bg-neutral-900/60 backdrop-blur-xl border-white/5 rounded-2xl hover:border-white/10 transition-all group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/10 to-amber-500/10 border border-white/5 flex items-center justify-center mb-4 group-hover:from-red-500/20 group-hover:to-amber-500/20 transition-all">
                    <feature.icon className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-base font-semibold text-stone-100 mb-2">{feature.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section ref={categoriesRef} id="categories" className="py-20 lg:py-24 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-stone-100 to-stone-300 bg-clip-text text-transparent">
                {t('home.browseByCategory')}
              </span>
            </h2>
            <p className="text-stone-400">{t('home.browseByCategoryDesc')}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = categoryIcons[cat.slug] || Package
              return (
                <button
                  key={cat.slug}
                  onClick={() => navigate('browse', { category: cat.slug })}
                  className="group p-5 rounded-2xl bg-neutral-900/60 backdrop-blur-xl border border-white/5 hover:border-red-500/20 transition-all text-left hover:-translate-y-1"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-white/5 flex items-center justify-center mb-3 group-hover:from-red-500/20 group-hover:to-red-600/10 transition-all">
                    <Icon className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-stone-200 mb-1">{cat.name}</h3>
                  <p className="text-xs text-stone-600">{cat.count.toLocaleString()} {t('home.items')}</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                <span className="bg-gradient-to-r from-stone-100 to-stone-300 bg-clip-text text-transparent">
                  {t('home.featuredProducts')}
                </span>
              </h2>
              <p className="text-stone-400 mt-1">{t('home.handpicked')}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('browse')}
              className="border-white/10 text-stone-400 hover:bg-white/5 hover:text-stone-200 rounded-xl hidden sm:flex"
            >
              {t('home.viewAll')} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-neutral-800" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-neutral-800 rounded w-3/4" />
                    <div className="h-3 bg-neutral-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-neutral-900/60 border border-white/5">
              <Package className="w-12 h-12 text-stone-700 mx-auto mb-4" />
              <p className="text-stone-500">{t('home.noFeaturedProducts')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map((product) => {
                const images = getImages(product.images)
                const hasDiscount = product.comparePrice && product.comparePrice > product.price
                return (
                  <button
                    key={product.id}
                    onClick={() => navigate('product-detail', { id: product.id })}
                    className="group rounded-2xl bg-neutral-900/60 backdrop-blur-xl border border-white/5 hover:border-white/10 overflow-hidden transition-all text-left hover:-translate-y-1"
                  >
                    <div className="aspect-square bg-neutral-800 relative overflow-hidden">
                      {images.length > 0 ? (
                        <img src={images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-700">
                          <Package className="w-12 h-12" />
                        </div>
                      )}
                      {hasDiscount && (
                        <Badge className="absolute top-3 left-3 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-lg">
                          -{Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}%
                        </Badge>
                      )}
                      <Badge className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-stone-300 text-[10px] px-2 py-0.5 rounded-lg border-0">
                        {product.condition}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-stone-200 truncate group-hover:text-stone-100 transition-colors">{product.title}</h3>
                      <p className="text-xs text-stone-600 mt-0.5 truncate">{product.store.name}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < (product.store.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-neutral-700'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] text-stone-600">({product._count.reviews})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-base font-bold text-red-400">${product.price.toFixed(2)}</span>
                        {hasDiscount && (
                          <span className="text-xs text-stone-600 line-through">${product.comparePrice!.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" onClick={() => navigate('browse')} className="border-white/10 text-stone-400 rounded-xl">
              {t('home.viewAllProducts')}
            </Button>
          </div>
        </div>
      </section>

      {/* Regions */}
      <section ref={regionsRef} id="regions" className="py-20 lg:py-24 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-stone-100 to-stone-300 bg-clip-text text-transparent">
                {t('home.shopAcrossCanada')}
              </span>
            </h2>
            <p className="text-stone-400">{t('home.shopAcrossCanadaDesc')}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {PROVINCES.map((province) => (
              <button
                key={province.slug}
                onClick={() => navigate('browse', { province: province.slug })}
                className="px-4 py-2.5 rounded-xl bg-neutral-900/60 border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 text-sm text-stone-400 hover:text-red-300 transition-all"
              >
                <MapPin className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                {province.name}
                <span className="text-stone-700 ml-1">{province.code}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Seller Locator CTA */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-red-900/15 via-neutral-900/60 to-amber-900/10 border border-white/5 p-8 lg:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-600/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                  <MapPinned className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">{t('home.interactiveMap')}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-stone-100 mb-3">
                  {t('home.findSellersOnMap').split(' ').slice(0, -1).join(' ')} <span className="bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent">Map</span>
                </h2>
                <p className="text-stone-400 leading-relaxed mb-6">
                  {t('home.findSellersOnMapDesc')}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => navigate('seller-locator')}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold rounded-2xl px-6 shadow-lg shadow-amber-500/20"
                  >
                    <Map className="w-4 h-4 mr-2" />
                    {t('home.openSellerLocator')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('browse')}
                    className="border-white/10 text-stone-300 hover:bg-white/5 rounded-2xl px-6"
                  >
                    {t('home.viewAllProducts')}
                  </Button>
                </div>
              </div>
              <div className="hidden lg:grid grid-cols-3 gap-3">
                {[
                  { province: 'British Columbia', city: 'Vancouver', sellers: 2, icon: '🏔️' },
                  { province: 'Ontario', city: 'Toronto', sellers: 3, icon: '🏙️' },
                  { province: 'Quebec', city: 'Montréal', sellers: 1, icon: '🌺' },
                  { province: 'Alberta', city: 'Calgary', sellers: 1, icon: '🤠' },
                  { province: 'Nova Scotia', city: 'Halifax', sellers: 1, icon: '🌊' },
                  { province: 'Manitoba', city: 'Winnipeg', sellers: 0, icon: '🦬' },
                ].map((loc) => (
                  <div key={loc.province} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
                    <span className="text-lg mb-1 block">{loc.icon}</span>
                    <p className="text-xs font-medium text-stone-200 truncate">{loc.city}</p>
                    <p className="text-[10px] text-stone-600">{loc.province}</p>
                    <p className="text-[10px] text-amber-400 mt-1">{loc.sellers > 0 ? `${loc.sellers} ${t('home.sellers')}` : t('home.comingSoon')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section ref={howItWorksRef} id="how-it-works" className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-stone-100 to-stone-300 bg-clip-text text-transparent">
                {t('home.howItWorks')}
              </span>
            </h2>
            <p className="text-stone-400">{t('home.simpleSafeCanadian')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center group">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] border-t border-dashed border-white/10" />
                )}
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/10 to-amber-500/10 border border-white/5 mb-4 group-hover:from-red-500/20 group-hover:to-amber-500/20 transition-all">
                  <step.icon className="w-8 h-8 text-red-400" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-red-500/20">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-base font-semibold text-stone-100 mb-2">{step.title}</h3>
                <p className="text-sm text-stone-500 max-w-[200px] mx-auto leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seller CTA */}
      <section ref={sellerCtaRef} id="seller-cta" className="py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.06)_0%,_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-3xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 backdrop-blur-xl border border-white/5 p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 mb-4">
                    <Award className="w-3.5 h-3.5 mr-1.5" />
                    {t('home.forSellers')}
                  </Badge>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent">
                      {t('home.startSellingToday')}
                    </span>
                  </h2>
                  <p className="text-stone-400 mb-6 leading-relaxed">
                    {t('home.startSellingTodayDesc')}
                  </p>
                  <Button
                    onClick={() => openAuthModal('register-seller')}
                    size="lg"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold rounded-2xl px-8 shadow-lg shadow-amber-500/20"
                  >
                    {t('home.createYourStore')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: '8%', label: t('home.marketplaceFee'), icon: TrendingUp },
                    { value: '2 Days', label: t('home.payoutSpeed'), icon: Timer },
                    { value: '$0', label: t('home.monthlyFee'), icon: DollarSign },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <item.icon className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                      <p className="text-xl font-bold text-stone-100">{item.value}</p>
                      <p className="text-[10px] text-stone-600 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
