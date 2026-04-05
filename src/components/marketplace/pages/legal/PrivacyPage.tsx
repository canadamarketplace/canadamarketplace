'use client'
import { useNavigation } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft, Shield, Lock, Database, Eye, FileCheck, UserCheck,
  Globe, Scale, AlertTriangle, Mail, Phone, MapPin, Clock, Leaf, CheckCircle
} from 'lucide-react'

export default function PrivacyPage() {
  const { navigate } = useNavigation()

  return (
    <div className="min-h-screen bg-cm-bg">
      {/* Hero */}
      <section className="relative py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <button onClick={() => navigate('home')} className="inline-flex items-center gap-2 text-sm text-cm-dim hover:text-cm-secondary mb-6 group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </button>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/20 bg-green-500/5 mb-6">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-xs font-medium text-green-400 uppercase tracking-[0.2em]">PIPEDA Compliant</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Privacy & Data <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Protection</span>
          </h1>
          <p className="text-cm-muted font-light max-w-2xl mx-auto">
            Canada Marketplace is committed to protecting your privacy and ensuring your personal data stays in Canada. We comply with PIPEDA, Quebec&apos;s Law 25, and all applicable Canadian privacy laws.
          </p>
        </div>
      </section>

      {/* Privacy Officer */}
      <section className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-green-900/10 to-emerald-900/5 border border-green-500/10 p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-7 h-7 text-green-400" />
              </div>
              <div className="flex-1">
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 mb-3">
                  <Shield className="w-3 h-3 mr-1" />
                  Designated Privacy Officer
                </Badge>
                <h2 className="text-xl font-bold text-cm-primary mb-1">Privacy Compliance Officer</h2>
                <p className="text-cm-muted text-sm mb-4 leading-relaxed">
                  Our designated Privacy Officer is responsible for ensuring Canada Marketplace&apos;s compliance with PIPEDA and all applicable Canadian privacy legislation. You may contact our Privacy Officer directly for any privacy-related inquiries, concerns, or complaints.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-cm-hover">
                    <Mail className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-cm-dim">Email</p>
                      <a href="mailto:privacy@canadamarketplace.ca" className="text-sm text-cm-secondary hover:text-green-400 transition-colors">privacy@canadamarketplace.ca</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-cm-hover">
                    <Mail className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-cm-dim">General Inquiries</p>
                      <a href="mailto:support@canadamarketplace.ca" className="text-sm text-cm-secondary hover:text-green-400 transition-colors">support@canadamarketplace.ca</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-cm-hover">
                    <Phone className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-cm-dim">Phone</p>
                      <a href="tel:+16044971001" className="text-sm text-cm-secondary hover:text-green-400 transition-colors">(604) 497-1001</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-cm-hover">
                    <MapPin className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-cm-dim">Mailing Address</p>
                      <p className="text-sm text-cm-secondary">14914 104 Ave, Unit 105, Surrey, BC V3R 1M7</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-cm-dim mt-4 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Privacy-related requests are acknowledged within 10 business days and resolved within 30 days as required by PIPEDA.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PIPEDA Compliance Badges */}
      <section className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-cm-primary mb-6 flex items-center gap-2">
            <Scale className="w-5 h-5 text-green-400" />
            Our Compliance Framework
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Database, title: 'Data Residency', desc: 'All personal data is stored exclusively on Canadian servers. Your information never crosses the border without your explicit written consent.' },
              { icon: Lock, title: 'Encryption', desc: 'All data in transit is encrypted using TLS 1.3. Data at rest is encrypted using AES-256. Payment data is processed through PCI-DSS compliant processors.' },
              { icon: Eye, title: 'Transparency', desc: 'We clearly disclose what data we collect, why we collect it, and how we use it. No hidden tracking, no surprise data sharing.' },
              { icon: FileCheck, title: 'Consent', desc: 'We obtain meaningful consent before collecting, using, or disclosing your personal information. You can withdraw consent at any time.' },
              { icon: Shield, title: 'Breach Protocol', desc: 'In the event of a data breach, we notify affected individuals and the Privacy Commissioner of Canada as required by PIPEDA.' },
              { icon: Globe, title: 'Quebec Law 25', desc: 'We are fully compliant with Quebec\'s Law 25 (Bill 64), including enhanced consent requirements and data portability provisions.' },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-2xl bg-cm-hover border border-cm-border-subtle">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-sm font-semibold text-cm-secondary mb-1.5">{item.title}</h3>
                <p className="text-xs text-cm-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Policy Content */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-cm-hover border border-cm-border-subtle p-8">
            <div className="flex items-center gap-3 mb-8">
              <Shield className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-bold text-cm-primary">Full Privacy Policy</h2>
            </div>
            <p className="text-xs text-cm-faint mb-8">Last updated: January 1, 2025 · Effective Date: January 1, 2025</p>

            <div className="space-y-8 text-cm-muted leading-relaxed">
              <section>
                <h3 className="text-lg font-semibold text-cm-secondary mb-3">1. Introduction</h3>
                <p>Canada Marketplace Inc. (&quot;Canada Marketplace,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting the privacy and personal information of all users of our platform located at www.canadamarketplace.ca. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our marketplace services as a buyer, seller, or visitor.</p>
                <p className="mt-3">We comply with the Personal Information Protection and Electronic Documents Act (PIPEDA), Canada&apos;s federal private-sector privacy law, as well as substantially similar provincial privacy legislation including Quebec&apos;s Act respecting the protection of personal information in the private sector (Law 25 / Bill 64), Alberta&apos;s Personal Information Protection Act (PIPA), and British Columbia&apos;s Personal Information Protection Act (PIPA). This policy is governed by and interpreted in accordance with the laws of Canada and the province of British Columbia.</p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-cm-secondary mb-3">2. Data Storage & Canadian Residency</h3>
                <p className="mb-3">All personal data collected by Canada Marketplace is stored and processed exclusively within Canada. We use Canadian-based data centers operated by Canadian cloud infrastructure providers to ensure full compliance with Canadian privacy regulations. Specifically:</p>
                <ul className="list-none space-y-2">
                  {[
                    'All user account data (names, emails, addresses) is stored on servers physically located in Canada.',
                    'All transaction records, order history, and payment metadata remain on Canadian soil.',
                    'Our databases, backups, and disaster recovery systems are all housed within Canadian data centers.',
                    'No personal information is transferred to, stored on, or accessible from servers located outside of Canada without your explicit written consent.',
                    'Third-party service providers we engage are contractually obligated to maintain Canadian data residency for any data they process on our behalf.',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-cm-secondary mb-3">3. Information We Collect</h3>
                <p className="mb-3">We collect information in the following categories:</p>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-cm-hover border border-cm-border-subtle">
                    <h4 className="text-sm font-semibold text-cm-secondary mb-2">Information You Provide Directly</h4>
                    <ul className="text-sm space-y-1 text-cm-dim">
                      <li>• Account registration: name, email address, password, phone number (optional)</li>
                      <li>• Seller verification: government-issued ID, proof of address</li>
                      <li>• Shipping address: street address, city, province, postal code</li>
                      <li>• Payment information: processed through secure PCI-DSS compliant payment processors — we never store full credit card numbers</li>
                      <li>• Communications: messages, reviews, dispute descriptions</li>
                      <li>• Store information: store name, description, logo, banner images</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-cm-hover border border-cm-border-subtle">
                    <h4 className="text-sm font-semibold text-cm-secondary mb-2">Information Collected Automatically</h4>
                    <ul className="text-sm space-y-1 text-cm-dim">
                      <li>• Device information: browser type, operating system, screen resolution</li>
                      <li>• Usage data: pages visited, features used, time spent, click patterns</li>
                      <li>• Location data: province-level location for marketplace relevance (never precise GPS)</li>
                      <li>• Cookies and similar technologies: session cookies, analytics cookies (see our Cookie Policy)</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-cm-secondary mb-3">4. How We Use Your Information</h3>
                <p className="mb-3">We use your personal information only for the purposes for which it was collected, or for purposes authorized under PIPEDA:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Provide and operate marketplace services',
                    'Process and fulfill transactions',
                    'Verify seller identity and prevent fraud',
                    'Communicate order updates and notifications',
                    'Resolve disputes and provide customer support',
                    'Improve our platform and user experience',
                    'Comply with legal and regulatory obligations',
                    'Detect and prevent security threats',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-cm-muted">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm"><strong className="text-cm-secondary">We do not sell, rent, or trade your personal information to third parties for marketing purposes.</strong></p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-cm-secondary mb-3">5. Your Rights Under PIPEDA</h3>
                <p className="mb-3">Under PIPEDA, you have the following rights regarding your personal information:</p>
                <div className="space-y-3">
                  {[
                    { title: 'Right of Access', desc: 'You may request a copy of all personal information we hold about you. We will provide this within 30 days of your request, free of charge.' },
                    { title: 'Right to Correction', desc: 'You may request correction of any inaccurate or incomplete personal information. Updates are reflected across all our systems promptly.' },
                    { title: 'Right to Withdrawal of Consent', desc: 'You may withdraw consent for any data processing activity at any time. We will inform you of the consequences of withdrawal.' },
                    { title: 'Right to Complaint', desc: 'You may file a complaint with us or directly with the Office of the Privacy Commissioner of Canada if you believe your privacy rights have been violated.' },
                    { title: 'Right to Deletion', desc: 'Upon request and subject to legal retention requirements, we will delete your personal information from our active systems.' },
                    { title: 'Right to Data Portability (Law 25)', desc: 'Quebec residents may request their personal information in a structured, commonly used format. We will provide this within 30 days.' },
                  ].map((item) => (
                    <div key={item.title} className="p-4 rounded-xl bg-cm-hover border border-cm-border-subtle">
                      <h4 className="text-sm font-semibold text-cm-secondary mb-1">{item.title}</h4>
                      <p className="text-xs text-cm-dim leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-cm-secondary mb-3">6. Data Security</h3>
                <p>We implement industry-leading security measures to protect your personal information including TLS 1.3 encryption for all data in transit, AES-256 encryption for data at rest, regular penetration testing and security audits, multi-factor authentication for internal systems, strict access controls with principle of least privilege, and 24/7 intrusion detection and monitoring systems. Payment information is processed exclusively through PCI-DSS Level 1 certified payment processors and is never stored on our servers in full.</p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-cm-secondary mb-3">7. Data Breach Notification</h3>
                <p>In accordance with PIPEDA\'s mandatory breach notification requirements, in the event of a breach of security safeguards that poses a real risk of significant harm to individuals, we will notify affected individuals as soon as feasible, report the breach to the Privacy Commissioner of Canada, and notify any other organizations as required. Notifications will include a description of the breach, the personal information involved, steps individuals should take to protect themselves, and what we are doing to mitigate and investigate the breach.</p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-cm-secondary mb-3">8. Data Retention</h3>
                <p>We retain personal information only as long as necessary to fulfill the purposes for which it was collected, or as required by law. Active account data is retained for the duration of your account. Transaction records are retained for a minimum of 7 years for tax and legal compliance. Seller verification documents are retained for the duration of the seller relationship plus 7 years. Upon account deletion, personal data is removed from active systems within 30 days and from backups within 90 days, except where legal retention requirements apply.</p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-cm-secondary mb-3">9. Contact Our Privacy Officer</h3>
                <p className="mb-3">For any privacy-related inquiries, requests, or complaints, please contact our designated Privacy Officer:</p>
                <div className="p-4 rounded-xl bg-green-900/10 border border-green-500/10">
                  <p className="text-sm text-cm-secondary font-semibold">Privacy Officer</p>
                  <p className="text-sm text-cm-muted">Canada Marketplace Inc.</p>
                  <p className="text-sm text-cm-muted">Email: <a href="mailto:privacy@canadamarketplace.ca" className="text-green-400 hover:underline">privacy@canadamarketplace.ca</a></p>
                  <p className="text-sm text-cm-muted">Phone: <a href="tel:+16044971001" className="text-green-400 hover:underline">(604) 497-1001</a></p>
                  <p className="text-sm text-cm-muted">Address: 14914 104 Ave, Unit 105, Surrey, BC V3R 1M7</p>
                </div>
                <p className="mt-3 text-sm">You also have the right to file a complaint directly with the <a href="https://www.priv.gc.ca" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">Office of the Privacy Commissioner of Canada</a> if you are unsatisfied with our response to your privacy concern.</p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
