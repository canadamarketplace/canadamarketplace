'use client'
import { useNavigation } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, ArrowRight, CheckCircle, Shield, DollarSign, Clock,
  Store, Star, TrendingUp, Users, Package, CreditCard, Award,
  ChevronRight, Leaf, BarChart3, Truck, Lock, FileCheck, Zap
} from 'lucide-react'

const STEPS = [
  {
    step: '01',
    title: 'Create Your Account',
    desc: 'Sign up as a seller with your email, name, and store name. Choose a unique store URL that buyers will remember. The entire process takes under 2 minutes.',
    icon: Users,
    color: 'red',
  },
  {
    step: '02',
    title: 'Get Verified',
    desc: 'Upload a government-issued ID and proof of address. Our team reviews and verifies your identity within 24-48 hours. This builds trust with Canadian buyers.',
    icon: Shield,
    color: 'red',
  },
  {
    step: '03',
    title: 'List Your Products',
    desc: 'Add products with photos, descriptions, and competitive prices. Choose from 8 categories and reach buyers across all 13 provinces and territories.',
    icon: Package,
    color: 'green',
  },
  {
    step: '04',
    title: 'Start Earning',
    desc: 'Receive orders, ship via Canada Post, and get paid within 2 business days after buyer confirmation. Track everything from your seller dashboard.',
    icon: DollarSign,
    color: 'purple',
  },
]

const BENEFITS = [
  { icon: DollarSign, title: 'Low Marketplace Fee', desc: 'Only 8% per sale (5% for Gold sellers). No monthly fees, no subscriptions, no hidden costs. You only pay when you sell.', color: 'green' },
  { icon: Clock, title: 'Fast Payouts', desc: 'Get paid within 2 business days after buyer confirms delivery. Direct bank transfer to your Canadian bank account. No holds, no delays.', color: 'blue' },
  { icon: Shield, title: 'Seller Protection', desc: 'Our escrow system protects you too. Buyers\' payments are guaranteed. Our dispute resolution team ensures fair outcomes for both parties.', color: 'red' },
  { icon: TrendingUp, title: 'Grow Your Business', desc: 'Access analytics, sales reports, and promotional tools. Reach thousands of verified Canadian buyers actively looking for products.', color: 'purple' },
  { icon: Star, title: 'Gold Seller Program', desc: 'Reach Gold status with consistent sales and positive reviews. Unlock lower fees (5%), premium placement, and a verified Gold badge.', color: 'red' },
  { icon: Lock, title: 'Data Stays in Canada', desc: 'Your business data, sales records, and customer information are all stored on Canadian servers. Fully PIPEDA and Law 25 compliant.', color: 'green' },
]

const FAQS = [
  {
    q: 'How much does it cost to sell on Canada Marketplace?',
    a: 'It\'s free to create a seller account and list products. We charge a flat 8% marketplace fee only when you make a sale. Gold sellers pay just 5%. There are no monthly fees, no listing fees, and no hidden charges. If you don\'t sell, you don\'t pay.',
  },
  {
    q: 'How do I get verified as a seller?',
    a: 'During registration, you\'ll upload a government-issued photo ID (driver\'s license, passport, or provincial ID card) and a proof of address (utility bill, bank statement). Our compliance team reviews these documents within 24-48 hours. Once approved, you\'ll receive a verified seller badge.',
  },
  {
    q: 'How does escrow protect me as a seller?',
    a: 'When a buyer places an order, their payment goes into our secure escrow account — not directly to you. After you ship the item and the buyer confirms receipt and satisfaction, the funds are released to your account. This protects you from fraudulent chargebacks and ensures guaranteed payment for completed transactions.',
  },
  {
    q: 'When and how do I get paid?',
    a: 'You receive your payout within 2 business days after the buyer confirms delivery of their order. Payouts are sent via direct bank transfer to your Canadian bank account. You can track all payouts from your seller dashboard.',
  },
  {
    q: 'What can I sell on Canada Marketplace?',
    a: 'You can sell a wide range of legal products across 8 categories: Electronics, Fashion, Home & Garden, Sports, Vehicles, Books, Music, and Outdoor equipment. All items must be legal to sell in Canada. Prohibited items include weapons, counterfeit goods, and items that violate Canadian law.',
  },
  {
    q: 'How do I reach Gold seller status?',
    a: 'Gold seller status is awarded to sellers who maintain a minimum 4.5-star rating, have at least 50 completed sales, and have been active for at least 3 months with zero unresolved disputes. Gold sellers enjoy a reduced 5% fee, premium product placement, and a distinctive Gold verified badge.',
  },
]

export default function BecomeSellerPage() {
  const { navigate } = useNavigation()
  const { openAuthModal } = useNavigation.getState()

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 via-transparent to-transparent" />
        <div className="absolute top-10 left-1/3 w-72 h-72 bg-red-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <button onClick={() => navigate('home')} className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </button>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 mb-6">
            <Store className="w-4 h-4 text-red-300" />
            <span className="text-xs font-medium text-red-300 uppercase tracking-[0.2em]">Seller Program</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Become a <span className="bg-gradient-to-r from-red-300 via-red-400 to-red-500 bg-clip-text text-transparent">Verified Seller</span>
          </h1>
          <p className="text-lg text-stone-400 font-light max-w-2xl mx-auto mb-8 leading-relaxed">
            Join thousands of Canadian entrepreneurs selling on Canada&apos;s most trusted marketplace. Low fees, fast payouts, escrow protection, and buyers across all 13 provinces.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => openAuthModal('register-seller')}
              size="lg"
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-300 hover:to-red-500 text-black font-semibold rounded-2xl px-8 shadow-lg shadow-red-500/20"
            >
              <span className="flex items-center gap-2">
                Create Your Store Free
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('seller-terms')}
              className="border-white/10 text-stone-300 hover:bg-white/5 rounded-2xl px-8"
            >
              Read Seller Agreement
            </Button>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-red-300">8%</div>
              <div className="text-xs text-stone-500 mt-1">Marketplace Fee</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-red-300">2 Days</div>
              <div className="text-xs text-stone-500 mt-1">Payout Speed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-red-300">$0</div>
              <div className="text-xs text-stone-500 mt-1">Monthly Fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-red-500 uppercase tracking-[0.2em]">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              Start Selling in <span className="bg-gradient-to-r from-red-300 to-red-400 bg-clip-text text-transparent">4 Easy Steps</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((item, idx) => (
              <div key={item.step} className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-stone-600">{item.step}</span>
                  <div className={`w-12 h-12 rounded-xl bg-${item.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-stone-200 mb-2">{item.title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">{item.desc}</p>
                {idx < STEPS.length - 1 && (
                  <ChevronRight className="absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-700 hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-6 py-20 bg-gradient-to-b from-transparent via-red-900/[0.03] to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-red-500 uppercase tracking-[0.2em]">Why Sell With Us</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              Seller <span className="bg-gradient-to-r from-red-300 to-red-400 bg-clip-text text-transparent">Benefits</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((item) => (
              <div key={item.title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-${item.color}-500/10 flex items-center justify-center mb-4`}>
                  <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                </div>
                <h3 className="text-base font-semibold text-stone-200 mb-2">{item.title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seller Dashboard Preview */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-red-500 uppercase tracking-[0.2em]">Powerful Tools</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              Your Seller <span className="bg-gradient-to-r from-red-300 to-red-400 bg-clip-text text-transparent">Dashboard</span>
            </h2>
            <p className="text-stone-400 mt-3 max-w-2xl mx-auto">Everything you need to manage your store, track sales, and grow your business — all in one place.</p>
          </div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: BarChart3, label: 'Revenue Analytics', desc: 'Track sales trends and monthly growth' },
                { icon: Package, label: 'Product Management', desc: 'Add, edit, and organize your listings' },
                { icon: CreditCard, label: 'Order Management', desc: 'View, fulfill, and track all orders' },
                { icon: TrendingUp, label: 'Payout History', desc: 'Monitor earnings and withdrawal status' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <item.icon className="w-5 h-5 text-red-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-stone-200">{item.label}</h4>
                    <p className="text-xs text-stone-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button variant="outline" onClick={() => navigate('seller-terms')} className="border-white/10 text-stone-300 hover:bg-white/5 rounded-xl">
                <FileCheck className="w-4 h-4 mr-2" />
                Seller Agreement
              </Button>
              <Button variant="outline" onClick={() => navigate('privacy')} className="border-white/10 text-stone-300 hover:bg-white/5 rounded-xl">
                <Lock className="w-4 h-4 mr-2" />
                Privacy & PIPEDA
              </Button>
              <Button variant="outline" onClick={() => navigate('dispute-policy')} className="border-white/10 text-stone-300 hover:bg-white/5 rounded-xl">
                <Shield className="w-4 h-4 mr-2" />
                Dispute Policy
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-red-500 uppercase tracking-[0.2em]">Common Questions</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">
              Seller <span className="bg-gradient-to-r from-red-300 to-stone-300 bg-clip-text text-transparent">FAQ</span>
            </h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                <h3 className="text-base font-semibold text-stone-200 mb-2 flex items-start gap-2">
                  <span className="text-red-300 flex-shrink-0 mt-0.5">Q:</span>
                  {faq.q}
                </h3>
                <p className="text-sm text-stone-400 leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-2xl bg-gradient-to-br from-red-900/20 via-neutral-900/50 to-red-900/10 border border-red-500/10">
            <Award className="w-12 h-12 text-red-300 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-stone-100 mb-3">
              Ready to Start Selling?
            </h2>
            <p className="text-stone-400 font-light mb-8 max-w-lg mx-auto">
              Join our community of verified Canadian sellers. Set up your store in minutes, list your first product today, and start earning.
            </p>
            <Button
              onClick={() => openAuthModal('register-seller')}
              size="lg"
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-300 hover:to-red-500 text-white font-semibold rounded-2xl px-10 shadow-lg shadow-red-500/20"
            >
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Create Your Free Store
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>
            <p className="text-xs text-stone-600 mt-4">No credit card required • Free to list • Only pay when you sell</p>
          </div>
        </div>
      </section>
    </div>
  )
}
