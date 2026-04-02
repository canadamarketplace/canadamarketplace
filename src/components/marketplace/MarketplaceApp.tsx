'use client'
import { useNavigation } from '@/lib/store'
import Navbar from './Navbar'
import Footer from './Footer'
import AuthModal from './AuthModal'
import CartSidebar from './CartSidebar'
import SearchBar from './SearchBar'
import ChatAI from './ChatAI'
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
import TermsPage from './pages/legal/TermsPage'
import PrivacyPage from './pages/legal/PrivacyPage'
import CookiesPage from './pages/legal/CookiesPage'
import SellerTermsPage from './pages/legal/SellerTermsPage'
import DisputePolicyPage from './pages/legal/DisputePolicyPage'
import ContactPage from './pages/ContactPage'
import AboutPage from './pages/AboutPage'
import BecomeSellerPage from './pages/BecomeSellerPage'
import SellerLocatorPage from './pages/SellerLocatorPage'
import NotificationsPage from './pages/NotificationsPage'
import MessagingPage from './MessagingPage'
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
    case 'notifications': return <NotificationsPage />
    case 'messaging': return <MessagingPage />
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
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-100">
      <Navbar />
      <main className="pt-16 lg:pt-20">
        <PageRenderer />
      </main>
      <Footer />
      <AuthModal />
      <CartSidebar />
      <SearchBar />
      <ChatAI />
    </div>
  )
}
