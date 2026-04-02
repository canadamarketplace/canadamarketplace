'use client'
import { useNavigation } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Leaf, Twitter, Github, Mail } from 'lucide-react'

export default function Footer() {
  const { navigate } = useNavigation()
  const { t } = useTranslation()

  const sections = [
    {
      title: t('footer.marketplace'),
      links: [
        { label: t('footer.browseProducts'), page: 'browse' as const },
        { label: t('footer.categories'), page: 'category' as const },
        { label: t('footer.regions'), page: 'regions' as const },
        { label: t('footer.sellerLocator'), page: 'seller-locator' as const },
        { label: t('footer.howItWorks'), page: 'safety' as const },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { label: t('footer.aboutUs'), page: 'about' as const },
        { label: t('footer.contactUs'), page: 'contact' as const },
        { label: t('footer.howItWorks'), page: 'safety' as const },
      ],
    },
    {
      title: t('footer.selling'),
      links: [
        { label: t('footer.becomeASeller'), page: 'become-seller' as const },
        { label: t('footer.sellerAgreement'), page: 'seller-terms' as const },
        { label: t('footer.feesAndPayouts'), page: 'become-seller' as const },
      ],
    },
    {
      title: t('footer.support'),
      links: [
        { label: t('footer.helpCenter'), page: 'safety' as const },
        { label: t('footer.disputePolicy'), page: 'dispute-policy' as const },
        { label: t('footer.fileADispute'), page: 'file-dispute' as const },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('footer.termsOfService'), page: 'terms' as const },
        { label: t('footer.privacyPolicy'), page: 'privacy' as const },
        { label: t('footer.cookiePolicy'), page: 'cookies' as const },
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
              <img src="/logo.png" alt="Canada Marketplace" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-sm font-bold text-stone-100">Canada<span className="text-red-500">Marketplace</span></span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed mb-4">
              {t('footer.tagline')}
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
            &copy; {new Date().getFullYear()} Canada Marketplace. {t('footer.allRightsReserved')}
          </p>
          <div className="flex items-center gap-1 text-xs text-stone-600">
            <span>🍁</span>
            <span>{t('footer.dataHosted')}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
