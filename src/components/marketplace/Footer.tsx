'use client'
import { useNavigation } from '@/lib/store'
import { Leaf, Twitter, Github, Mail } from 'lucide-react'

export default function Footer() {
  const { navigate } = useNavigation()

  const sections = [
    {
      title: 'Marketplace',
      links: [
        { label: 'Browse Products', page: 'browse' as const },
        { label: 'Categories', page: 'category' as const },
        { label: 'Regions', page: 'regions' as const },
        { label: 'Seller Locator', page: 'seller-locator' as const },
        { label: 'How It Works', page: 'safety' as const },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', page: 'about' as const },
        { label: 'Contact Us', page: 'contact' as const },
        { label: 'How It Works', page: 'safety' as const },
      ],
    },
    {
      title: 'Selling',
      links: [
        { label: 'Become a Seller', page: 'become-seller' as const },
        { label: 'Seller Agreement', page: 'seller-terms' as const },
        { label: 'Fees & Payouts', page: 'become-seller' as const },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', page: 'safety' as const },
        { label: 'Dispute Policy', page: 'dispute-policy' as const },
        { label: 'File a Dispute', page: 'file-dispute' as const },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Service', page: 'terms' as const },
        { label: 'Privacy Policy', page: 'privacy' as const },
        { label: 'Cookie Policy', page: 'cookies' as const },
      ],
    },
  ]

  return (
    <footer className="bg-[#050505] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-stone-100">Canada<span className="text-red-500">MP</span></span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed mb-4">
              Canada&apos;s trusted marketplace. Built safe by design for Canadians, by Canadians.
            </p>
            <div className="flex gap-3">
              <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-stone-200 transition-colors">
                <Twitter className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-stone-200 transition-colors">
                <Github className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-stone-200 transition-colors">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Links */}
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-stone-200 mb-4">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.page)}
                      className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-600">
            &copy; {new Date().getFullYear()} Canada Marketplace. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-stone-600">
            <Leaf className="w-3 h-3 text-red-500" />
            <span>Data hosted in Canada</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
