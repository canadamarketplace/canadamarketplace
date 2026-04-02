'use client'
import { useNavigation } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  Leaf, Shield, MapPin, Users, Award, Heart, Globe, Lock,
  ArrowRight, CheckCircle, Star, TrendingUp, Eye, Building2,
  Phone, Mail, Clock, ArrowLeft
} from 'lucide-react'

export default function AboutPage() {
  const { navigate } = useNavigation()

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 via-transparent to-transparent" />
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-red-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <button
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-800 mb-6">
            <Leaf className="w-4 h-4 text-red-400" />
            <span className="text-xs font-medium text-stone-400 uppercase tracking-[0.2em]">Our Story</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Built by Canadians,<br />
            <span className="bg-gradient-to-r from-red-400 via-red-300 to-red-500 bg-clip-text text-transparent">For Canadians</span>
          </h1>
          <p className="text-lg text-stone-400 font-light max-w-2xl mx-auto leading-relaxed">
            Canada Marketplace was founded with a simple mission: to create a safe, fair, and truly Canadian online marketplace where buyers and sellers can transact with confidence. Every dollar stays in Canada. Every transaction is protected.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '125K+', label: 'Active Listings', icon: '📦' },
            { value: '38K+', label: 'Verified Sellers', icon: '✅' },
            { value: '13', label: 'Provinces & Territories', icon: '🇨🇦' },
            { value: '$0', label: 'Fraud Incidents', icon: '🛡️' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-3xl mb-2 block">{stat.icon}</span>
              <div className="text-3xl md:text-4xl font-bold text-stone-100 mb-1">{stat.value}</div>
              <div className="text-xs text-stone-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center mb-5">
              <Star className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-stone-100 mb-3">Our Mission</h2>
            <p className="text-stone-400 font-light leading-relaxed">
              To empower Canadians to buy and sell safely online by providing a marketplace that prioritizes security, transparency, and trust above all else. We believe every Canadian deserves access to a fair marketplace where their data is protected, their money is secure, and their rights are respected.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center mb-5">
              <Eye className="w-6 h-6 text-red-300" />
            </div>
            <h2 className="text-2xl font-bold text-stone-100 mb-3">Our Vision</h2>
            <p className="text-stone-400 font-light leading-relaxed">
              To become Canada&apos;s most trusted online marketplace — a platform where every transaction is protected by escrow, every seller is verified, and every buyer shops with complete peace of mind. We envision a future where Canadians no longer need to look south of the border for a world-class marketplace experience.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-red-400 uppercase tracking-[0.2em]">What Drives Us</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              Our Core <span className="bg-gradient-to-r from-stone-300 to-stone-500 bg-clip-text text-transparent">Values</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                color: 'red',
                title: 'Safety First',
                desc: 'Every transaction is protected by our escrow system. Buyers\' payments are held securely until they confirm receipt and satisfaction with their purchase. Sellers are verified through government ID checks before they can list.',
              },
              {
                icon: Lock,
                color: 'red',
                title: 'Data Privacy',
                desc: 'All data is stored on Canadian servers. We are fully PIPEDA compliant and ready for Quebec\'s Law 25. Your information never crosses the border. We believe Canadians\' data should stay in Canada.',
              },
              {
                icon: Users,
                color: 'green',
                title: 'Community Trust',
                desc: 'We build trust through transparency. Every seller is verified, every transaction is documented, and our dispute resolution system ensures fair outcomes for both buyers and sellers.',
              },
              {
                icon: TrendingUp,
                color: 'purple',
                title: 'Fair Pricing',
                desc: 'Our marketplace fee is just 8% (5% for Gold sellers) — among the lowest in the industry. No hidden fees, no subscriptions, no surprises. All prices displayed in Canadian dollars.',
              },
              {
                icon: Heart,
                color: 'pink',
                title: 'Canadian First',
                desc: 'We support Canadian sellers and the Canadian economy. From our headquarters in Surrey, BC, to sellers in every province and territory, we are proudly and unapologetically Canadian.',
              },
              {
                icon: Award,
                color: 'cyan',
                title: 'Excellence',
                desc: 'We hold ourselves to the highest standards of service and reliability. Our platform is continuously improved based on feedback from our community of Canadian buyers and sellers.',
              },
            ].map((value) => (
              <div
                key={value.title}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${value.color}-500/20 to-${value.color}-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <value.icon className={`w-5 h-5 text-${value.color}-400`} />
                </div>
                <h3 className="text-lg font-semibold text-stone-100 mb-2">{value.title}</h3>
                <p className="text-sm text-stone-400 font-light leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Timeline */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-red-500 uppercase tracking-[0.2em]">Our Journey</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              The Canada Marketplace <span className="bg-gradient-to-r from-red-300 to-red-400 bg-clip-text text-transparent">Story</span>
            </h2>
          </div>
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-red-500/30 via-red-500/20 to-transparent" />

            {[
              {
                year: '2023',
                title: 'The Idea',
                desc: 'Frustrated with the lack of a truly Canadian marketplace, our founders set out to build a platform where Canadians could buy and sell safely, with all data stored in Canada and every transaction protected.',
              },
              {
                year: '2024',
                title: 'Building Trust',
                desc: 'We launched with a focus on security and verification. Every seller underwent ID verification, escrow payments were built into every transaction, and our dispute resolution system ensured fair outcomes for all parties.',
              },
              {
                year: '2024',
                title: 'Growing Fast',
                desc: 'Word spread across Canada. Within months, we had verified sellers in every province and territory. Our community of buyers and sellers grew to tens of thousands, all united by a desire for a safe, fair marketplace.',
              },
              {
                year: '2025',
                title: 'Market Leader',
                desc: 'With over 125,000 listings, 38,000 verified sellers, and zero fraud incidents, Canada Marketplace has become the go-to platform for Canadians who demand safety, transparency, and a truly Canadian shopping experience.',
              },
            ].map((item, idx) => (
              <div key={idx} className={`relative flex items-start gap-6 mb-12 ${idx % 2 === 1 ? 'md:flex-row-reverse md:text-right' : ''}`}>
                {/* Dot */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-red-500 border-2 border-[#0a0a0a] mt-2 z-10" />
                {/* Content */}
                <div className={`ml-12 md:ml-0 md:w-1/2 ${idx % 2 === 1 ? 'md:pl-8' : 'md:pr-8'}`}>
                  <span className="text-sm font-bold text-red-400">{item.year}</span>
                  <h3 className="text-lg font-semibold text-stone-100 mt-1">{item.title}</h3>
                  <p className="text-sm text-stone-400 font-light mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-medium text-red-400 uppercase tracking-[0.2em]">The People Behind It</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3 mb-4">
            Headquartered in <span className="bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">Surrey, BC</span>
          </h2>
          <p className="text-stone-400 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
            Our team is made up of passionate Canadians who believe in building technology that serves Canadians. From engineers to customer support, every member of our team is committed to making Canada Marketplace the safest and most trusted place to buy and sell online in Canada.
          </p>
          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-stone-400">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-red-400" />
                <span>14914 104 Ave, Unit 105</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-300" />
                <span>Surrey, BC V3R 1M7</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-400" />
                <span>(604) 497-1001</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <span>support@canadamarketplace.ca</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-stone-500">
              <Clock className="w-3 h-3" />
              <span>Open Mon-Fri 10AM - 6PM PST | Sat 11AM - 4PM PST</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-2xl bg-gradient-to-br from-red-900/20 via-neutral-900/50 to-red-900/10 border border-white/5">
            <h2 className="text-2xl md:text-3xl font-bold text-stone-100 mb-3">
              Ready to Join Canada&apos;s Most Trusted Marketplace?
            </h2>
            <p className="text-stone-400 font-light mb-8">
              Whether you&apos;re looking to buy or sell, we&apos;ve got you covered with escrow protection, verified sellers, and data that stays in Canada.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => navigate('browse')}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl px-8 shadow-lg shadow-red-500/20"
              >
                <span className="flex items-center gap-2">
                  Start Shopping
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Button>
              <Button
                onClick={() => navigate('sellers')}
                variant="outline"
                className="border-white/10 text-stone-300 hover:bg-white/5 rounded-xl px-8"
              >
                Become a Seller
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
