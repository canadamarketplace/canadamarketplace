'use client'
import { useEffect } from 'react'
import { useNavigation, urlToPage } from '@/lib/store'
import { useLocale } from '@/lib/i18n'
import { useSEO } from '@/hooks/useSEO'
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd'
import { getSEOConfig } from '@/lib/seoConfig'
import Navbar from './Navbar'
import Footer from './Footer'
import AuthModal from './AuthModal'
import CartSidebar from './CartSidebar'
import SearchBar from './SearchBar'
import ChatAI from './ChatAI'
import PWAInstallPrompt from './PWAInstallPrompt'
import HomePage from './pages/HomePage'
import BrowsePage from './pages/BrowsePage'
import ProductDetailPage from './pages/ProductDetailPage'
import StorefrontPage from './pages/StorefrontPage'
import ProfilePage from './pages/auth/ProfilePage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import CartPage from './pages/buyer/CartPage'
import CheckoutPage from './pages/buyer/CheckoutPage'
import OrdersPage from './pages/buyer/OrdersPage'
import OrderDetailPage from './pages/buyer/OrderDetailPage'
import FileDisputePage from './pages/buyer/FileDisputePage'
import SellerDashboard from './pages/seller/SellerDashboard'
import SellerProducts from './pages/seller/SellerProducts'
import AddProductPage from './pages/seller/AddProductPage'
import SellerOrders from './pages/seller/SellerOrders'
import SellerStorePage from './pages/seller/SellerStorePage'
import SellerPayouts from './pages/seller/SellerPayouts'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminDisputes from './pages/admin/AdminDisputes'
import AdminSettings from './pages/admin/AdminSettings'
import AdminTax from './pages/admin/AdminTax'
import AdminPayments from './pages/admin/AdminPayments'
import AdminShipping from './pages/admin/AdminShipping'
import AdminMarketing from './pages/admin/AdminMarketing'
import AdminReports from './pages/admin/AdminReports'
import TermsPage from './pages/legal/TermsPage'
import PrivacyPage from './pages/legal/PrivacyPage'
import CookiesPage from './pages/legal/CookiesPage'
import SellerTermsPage from './pages/legal/SellerTermsPage'
import DisputePolicyPage from './pages/legal/DisputePolicyPage'
import ContactPage from './pages/ContactPage'
import AboutPage from './pages/AboutPage'
import BecomeSellerPage from './pages/BecomeSellerPage'
import SellerLocatorPage from './pages/SellerLocatorPage'
import EscrowPage from './pages/EscrowPage'
import SellerGuidePage from './pages/SellerGuidePage'
import ShippingPage from './pages/ShippingPage'
import FaqPage from './pages/FaqPage'
import NotificationsPage from './pages/NotificationsPage'
import MessagingPage from './MessagingPage'
import CouponsPage from './pages/CouponsPage'
import WishlistPage from './pages/WishlistPage'
import SellerReviews from './pages/seller/SellerReviews'
import SellerTransactions from './pages/seller/SellerTransactions'
import BuyerAddressBook from './pages/buyer/BuyerAddressBook'
import BuyerReviews from './pages/buyer/BuyerReviews'
import SellerShipping from './pages/seller/SellerShipping'
import ComparePage from './pages/ComparePage'
import CompareFloatingBar from './CompareFloatingBar'
import type { PageView } from '@/lib/store'

function PageRenderer() {
  const { currentPage, pageParams } = useNavigation()

  switch (currentPage as PageView) {
    case 'home': return <HomePage />
    case 'browse': return <BrowsePage />
    case 'product-detail': return <ProductDetailPage />
    case 'storefront': return <StorefrontPage />
    case 'category': return <HomePage scrollTo="categories" />
    case 'regions': return <HomePage scrollTo="regions" />
    case 'safety': return <HomePage scrollTo="how-it-works" />
    case 'sellers': return <BecomeSellerPage />
    case 'cart': return <CartPage />
    case 'checkout': return <CheckoutPage />
    case 'orders': return <OrdersPage />
    case 'order-detail': return <OrderDetailPage />
    case 'file-dispute': return <FileDisputePage />
    case 'seller-locator': return <SellerLocatorPage />
    case 'escrow': return <EscrowPage />
    case 'seller-guide': return <SellerGuidePage />
    case 'shipping': return <ShippingPage />
    case 'faq': return <FaqPage />
    case 'notifications': return <NotificationsPage />
    case 'messaging': return <MessagingPage />
    case 'wishlist': return <WishlistPage />
    case 'coupons': return <CouponsPage />
    case 'seller-reviews': return <SellerReviews />
    case 'seller-transactions': return <SellerTransactions />
    case 'seller-shipping': return <SellerShipping />
    case 'address-book': return <BuyerAddressBook />
    case 'buyer-reviews': return <BuyerReviews />
    case 'compare': return <ComparePage />
    case 'profile': return <ProfilePage />
    case 'forgot-password': return <ForgotPasswordPage />
    case 'dashboard': return <SellerDashboard />
    case 'my-products': return <SellerProducts />
    case 'add-product': return <AddProductPage />
    case 'edit-product': return <AddProductPage />
    case 'my-orders': return <SellerOrders />
    case 'my-store': return <SellerStorePage />
    case 'my-payouts': return <SellerPayouts />
    case 'admin-dashboard': return <AdminDashboard />
    case 'admin-users': return <AdminUsers />
    case 'admin-products': return <AdminProducts />
    case 'admin-orders': return <AdminOrders />
    case 'admin-disputes': return <AdminDisputes />
    case 'admin-settings': return <AdminSettings />
    case 'admin-tax': return <AdminTax />
    case 'admin-payments': return <AdminPayments />
    case 'admin-shipping': return <AdminShipping />
    case 'admin-marketing': return <AdminMarketing />
    case 'admin-reports': return <AdminReports />
    case 'terms': return <TermsPage />
    case 'privacy': return <PrivacyPage />
    case 'cookies': return <CookiesPage />
    case 'seller-terms': return <SellerTermsPage />
    case 'dispute-policy': return <DisputePolicyPage />
    case 'contact': return <ContactPage />
    case 'about': return <AboutPage />
    case 'become-seller': return <BecomeSellerPage />
    default: return <HomePage />
  }
}

export default function MarketplaceApp() {
  const { navigate, currentPage } = useNavigation()
  const { setLocale } = useLocale()

  // Global SEO — updates whenever the route changes
  const seoConfig = getSEOConfig(currentPage)
  useSEO({
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
    canonicalUrl: seoConfig.canonicalPath,
    ogType: seoConfig.ogType,
    ogImage: seoConfig.ogImage,
    noIndex: seoConfig.noIndex,
  })

  // Ensure database is seeded on first visit
  useEffect(() => {
    const setupDb = async () => {
      try {
        await fetch('/api/setup', { method: 'POST' })
      } catch {
        // Silent fail - seed will retry on next request
      }
    }
    setupDb()
  }, [])

  // Sync URL on page load (handle direct links / refresh)
  useEffect(() => {
    // Detect locale from URL and set it
    const pathname = window.location.pathname
    if (pathname.startsWith('/fr') || pathname.startsWith('/fr/')) {
      setLocale('fr')
    } else {
      setLocale('en')
    }

    const { page, params } = urlToPage(window.location.pathname, window.location.search)
    if (page !== "home" || window.location.pathname !== "/") {
      navigate(page, params)
    }
  }, [])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      // Detect locale from URL on popstate
      const pathname = window.location.pathname
      if (pathname.startsWith('/fr') || pathname.startsWith('/fr/')) {
        useLocale.getState().setLocale('fr')
      } else {
        useLocale.getState().setLocale('en')
      }
      const { page, params } = urlToPage(window.location.pathname, window.location.search)
      useNavigation.setState({ currentPage: page, pageParams: params })
      window.scrollTo(0, 0)
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  return (
    <div className="min-h-screen bg-cm-bg text-cm-primary">
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <Navbar />
      <main className="pt-16 lg:pt-20">
        <PageRenderer />
      </main>
      <Footer />
      <AuthModal />
      <CartSidebar />
      <SearchBar />
      <ChatAI />
      <PWAInstallPrompt />
      <CompareFloatingBar />
    </div>
  )
}
