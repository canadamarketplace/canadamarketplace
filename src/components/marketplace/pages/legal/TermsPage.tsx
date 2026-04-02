'use client'
import { useNavigation } from '@/lib/store'
import { ChevronLeft, FileText } from 'lucide-react'

export default function TermsPage() {
  const { navigate } = useNavigation()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('home')} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 mb-6 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
      </button>

      <div className="rounded-2xl bg-neutral-900/60 border border-white/5 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-stone-100">Terms of Service</h1>
        </div>
        <p className="text-xs text-stone-600 mb-8">Last updated: January 1, 2025</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-stone-400 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-stone-200 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Canada Marketplace, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. These terms constitute a legally binding agreement between you and Canada Marketplace.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-200 mb-3">2. Description of Service</h2>
            <p>Canada Marketplace is an online platform that connects buyers and sellers across Canada. We provide a marketplace where users can list, discover, and purchase goods and services. All transactions are in Canadian Dollars (CAD).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-200 mb-3">3. User Accounts</h2>
            <p>You must be at least 18 years old and a resident of Canada to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information during registration.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-200 mb-3">4. Seller Responsibilities</h2>
            <p>Sellers are responsible for accurately describing their products, maintaining adequate inventory, and shipping items in a timely manner. Sellers must comply with all applicable Canadian laws and regulations, including consumer protection laws, tax obligations, and product safety standards.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-200 mb-3">5. Escrow and Payments</h2>
            <p>All payments are held in escrow until the buyer confirms receipt of the item. Canada Marketplace charges a transaction fee of 8% on each sale. Payments are processed in Canadian Dollars only. Sellers receive payouts within 2 business days after buyer confirmation.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-200 mb-3">6. Dispute Resolution</h2>
            <p>We provide a dispute resolution service for transactions that encounter issues. Buyers may file a dispute within 30 days of delivery. Our team will review disputes and mediate between parties to reach a fair resolution. Decisions made by our dispute resolution team are final.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-200 mb-3">7. Prohibited Items</h2>
            <p>Users may not list or sell illegal items, counterfeit goods, weapons, hazardous materials, or any items prohibited by Canadian law. We reserve the right to remove any listing that violates these terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-200 mb-3">8. Limitation of Liability</h2>
            <p>Canada Marketplace acts as an intermediary platform and is not a party to transactions between buyers and sellers. We are not responsible for the quality, safety, or legality of items listed, the accuracy of listings, or the ability of sellers to sell or buyers to pay.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-200 mb-3">9. Privacy</h2>
            <p>Your privacy is important to us. Please refer to our Privacy Policy for information about how we collect, use, and share your personal data. All data is stored and processed in Canada in compliance with PIPEDA.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-200 mb-3">10. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the platform after changes constitutes acceptance of the updated terms.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
