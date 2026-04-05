'use client'
import { useState } from 'react'
import { useNavigation } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  MapPin, Phone, Mail, Clock, Send, Leaf, CheckCircle,
  Building2, MessageSquare, Globe, ArrowLeft
} from 'lucide-react'

const SUBJECTS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Order Support' },
  { value: 'seller', label: 'Seller Support' },
  { value: 'billing', label: 'Billing Question' },
  { value: 'dispute', label: 'Dispute / Return' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'partnership', label: 'Partnership Inquiry' },
  { value: 'other', label: 'Other' },
]

export default function ContactPage() {
  const { navigate } = useNavigation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSending(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-cm-bg">
      {/* Hero Banner */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 via-transparent to-transparent" />
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-red-600/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <button
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-2 text-sm text-cm-dim hover:text-cm-secondary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-800 mb-6">
            <MessageSquare className="w-4 h-4 text-red-400" />
            <span className="text-xs font-medium text-cm-muted uppercase tracking-[0.2em]">Get In Touch</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Contact <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-500 bg-clip-text text-transparent">Us</span>
          </h1>
          <p className="text-lg text-cm-muted font-light max-w-2xl mx-auto">
            Have a question, concern, or just want to say hello? We&apos;re here to help. Our Canadian-based support team is ready to assist you.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Address */}
            <div className="p-6 rounded-2xl bg-cm-hover border border-cm-border-subtle hover:border-cm-border-hover transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-sm font-semibold text-cm-secondary mb-1">Our Office</h3>
              <p className="text-sm text-cm-muted leading-relaxed">
                Canada Marketplace Inc.<br />
                14914 104 Ave, Unit 105<br />
                Surrey, BC V3R 1M7<br />
                Canada
              </p>
            </div>

            {/* Phone */}
            <div className="p-6 rounded-2xl bg-cm-hover border border-cm-border-subtle hover:border-cm-border-hover transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5 text-red-300" />
              </div>
              <h3 className="text-sm font-semibold text-cm-secondary mb-1">Phone</h3>
              <p className="text-sm text-cm-muted leading-relaxed">
                <a href="tel:+16044971001" className="hover:text-red-300 transition-colors">(604) 497-1001</a>
              </p>
              <p className="text-xs text-cm-faint mt-2">Mon-Fri, 10AM - 6PM PST</p>
            </div>

            {/* Email */}
            <div className="p-6 rounded-2xl bg-cm-hover border border-cm-border-subtle hover:border-cm-border-hover transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-sm font-semibold text-cm-secondary mb-1">Email</h3>
              <p className="text-sm text-cm-muted leading-relaxed">
                <a href="mailto:support@canadamarketplace.ca" className="hover:text-green-400 transition-colors">support@canadamarketplace.ca</a>
              </p>
              <p className="text-xs text-cm-faint mt-2">We respond within 24 hours</p>
            </div>

            {/* Hours */}
            <div className="p-6 rounded-2xl bg-cm-hover border border-cm-border-subtle hover:border-cm-border-hover transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-sm font-semibold text-cm-secondary mb-1">Business Hours</h3>
              <div className="text-sm text-cm-muted leading-relaxed">
                <p>Mon - Fri: 10:00 AM - 6:00 PM</p>
                <p>Sat: 11:00 AM - 4:00 PM</p>
                <p>Sun: Closed</p>
                <p className="text-xs text-cm-faint mt-1">Pacific Standard Time (PST)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form + Map */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="p-8 rounded-2xl bg-cm-hover border border-cm-border-subtle">
            <h2 className="text-xl font-bold text-cm-primary mb-1">Send Us a Message</h2>
            <p className="text-sm text-cm-dim mb-6">Fill out the form below and we&apos;ll get back to you within 24 hours.</p>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-cm-primary mb-2">Message Sent!</h3>
                <p className="text-sm text-cm-muted mb-6">Thank you for reaching out. Our team will review your message and respond within 24 hours.</p>
                <Button
                  onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', subject: 'general', message: '' }) }}
                  variant="outline"
                  className="border-cm-border-hover text-cm-primary hover:bg-cm-hover"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-cm-secondary text-xs mb-1.5 block">Full Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-cm-secondary text-xs mb-1.5 block">Email Address *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-cm-secondary text-xs mb-1.5 block">Phone Number</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(604) 000-0000"
                      className="bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-cm-secondary text-xs mb-1.5 block">Subject *</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(v) => setFormData({ ...formData, subject: v })}
                    >
                      <SelectTrigger className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-cm-elevated border-cm-border-hover">
                        {SUBJECTS.map((s) => (
                          <SelectItem key={s.value} value={s.value} className="text-cm-secondary">
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-cm-secondary text-xs mb-1.5 block">Message *</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us how we can help you..."
                    rows={5}
                    className="bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint rounded-xl resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl h-11 shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {sending ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Message
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Map / Office Info */}
          <div className="space-y-6">
            {/* Embedded Map Placeholder */}
            <div className="rounded-2xl overflow-hidden border border-cm-border-subtle h-72 bg-cm-elevated relative flex items-center justify-center">
              <div className="text-center px-6">
                <MapPin className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-cm-secondary mb-1">Canada Marketplace HQ</h3>
                <p className="text-sm text-cm-muted">
                  14914 104 Ave, Unit 105<br />
                  Surrey, BC V3R 1M7
                </p>
                <a
                  href="https://maps.google.com/?q=14914+104+Ave+Surrey+BC+V3R+1M7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Open in Google Maps
                </a>
              </div>
              {/* Decorative grid overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cm-bg/80 pointer-events-none" />
            </div>

            {/* FAQ Quick Links */}
            <div className="p-6 rounded-2xl bg-cm-hover border border-cm-border-subtle">
              <h3 className="text-sm font-semibold text-cm-secondary mb-4">Quick Help</h3>
              <div className="space-y-3">
                {[
                  { label: 'How escrow payments protect you', page: 'safety' as const },
                  { label: 'How to file a dispute', page: 'dispute-policy' as const },
                  { label: 'Seller registration guide', page: 'sellers' as const },
                  { label: 'Shipping & delivery info', page: 'safety' as const },
                  { label: 'Our privacy commitment', page: 'privacy' as const },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.page)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-cm-secondary hover:text-cm-primary hover:bg-cm-hover transition-all"
                  >
                    {item.label}
                    <span className="text-cm-faint">→</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="p-6 rounded-2xl bg-cm-hover border border-cm-border-subtle">
              <h3 className="text-sm font-semibold text-cm-secondary mb-4">Why Choose Us</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '🇨🇦', label: '100% Canadian' },
                  { icon: '🔒', label: 'PIPEDA Compliant' },
                  { icon: '🛡️', label: 'Escrow Protected' },
                  { icon: '⚡', label: '24hr Response' },
                ].map((badge) => (
                  <div key={badge.label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cm-hover">
                    <span className="text-lg">{badge.icon}</span>
                    <span className="text-xs text-cm-muted">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
