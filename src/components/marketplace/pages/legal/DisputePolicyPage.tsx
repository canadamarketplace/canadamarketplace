'use client'
import { useNavigation } from '@/lib/store'
import { ChevronLeft, Scale } from 'lucide-react'

export default function DisputePolicyPage() {
  const { navigate } = useNavigation()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('home')} className="flex items-center gap-2 text-sm text-cm-dim hover:text-cm-secondary mb-6 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
      </button>

      <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-cm-primary">Dispute Policy</h1>
        </div>
        <p className="text-xs text-cm-faint mb-8">Last updated: January 1, 2025</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-cm-muted leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-cm-secondary mb-3">1. Dispute Window</h2>
            <p>Buyers may file a dispute within 30 days of the confirmed delivery date. After this window, disputes will not be accepted unless there are exceptional circumstances approved by our team.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-cm-secondary mb-3">2. Valid Dispute Reasons</h2>
            <p>Valid reasons for filing a dispute include: item not received, item significantly different from description, item arrived damaged, seller not responding to communication, wrong item received, and counterfeit items.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-cm-secondary mb-3">3. How to File a Dispute</h2>
            <p>Navigate to your order details and click &quot;File a Dispute&quot;. Select the reason, provide a detailed description, and include any supporting evidence such as photos or communication records. Our team will review your dispute within 48 hours.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-cm-secondary mb-3">4. Resolution Process</h2>
            <p>Once a dispute is filed, the seller will be notified and given 48 hours to respond. Our mediation team will review all evidence from both parties. Possible outcomes include: full refund to buyer, partial refund, item replacement, or no action if the dispute is unfounded.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-cm-secondary mb-3">5. Escrow Protection</h2>
            <p>During the dispute process, the payment remains in escrow and will not be released to the seller until the dispute is resolved. This ensures that buyers are protected throughout the resolution process.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-cm-secondary mb-3">6. Final Decisions</h2>
            <p>Dispute resolution decisions made by Canada Marketplace are final. In cases where the buyer is found to be filing fraudulent disputes, the buyer&apos;s account may be suspended. Repeated abuse of the dispute system will result in permanent account termination.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
