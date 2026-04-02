'use client'
import { useNavigation } from '@/lib/store'
import { ChevronLeft, Store } from 'lucide-react'

export default function SellerTermsPage() {
  const { navigate } = useNavigation()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('home')} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 mb-6 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
      </button>

      <div className="rounded-2xl bg-neutral-900/60 border border-white/5 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Store className="w-5 h-5 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-stone-100">Seller Agreement</h1>
        </div>
        <p className="text-xs text-stone-600 mb-8">Last updated: January 1, 2025</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-stone-400 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-stone-200 mb-3">1. Seller Eligibility</h2>
            <p>To sell on Canada Marketplace, you must be at least 18 years old, a Canadian resident or business, and in good standing. All sellers must complete our verification process before listing products.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-stone-200 mb-3">2. Fees and Payouts</h2>
            <p>Canada Marketplace charges an 8% fee on each transaction. Gold verified sellers receive a reduced fee of 5%. Payouts are processed within 2 business days after buyer confirmation. No monthly subscription fees are charged.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-stone-200 mb-3">3. Listing Requirements</h2>
            <p>All product listings must accurately describe the item, including condition, specifications, and any defects. Images must be of the actual item. Misleading listings will be removed and may result in account suspension.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-stone-200 mb-3">4. Fulfillment</h2>
            <p>Sellers must ship items within 3 business days of payment confirmation. Tracking information must be provided for all shipments. Sellers are responsible for items until delivery is confirmed by the buyer.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-stone-200 mb-3">5. Returns and Refunds</h2>
            <p>Sellers must have a clear return policy displayed on their storefront. Canada Marketplace&apos;s escrow system protects both parties. In the event of a dispute, our resolution team will mediate based on the evidence provided.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-stone-200 mb-3">6. Tax Obligations</h2>
            <p>Sellers are responsible for collecting and remitting applicable taxes (GST, HST, PST) as required by their province. Canada Marketplace does not collect taxes on behalf of sellers. Please consult a tax professional for guidance.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
