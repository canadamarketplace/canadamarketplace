'use client'
import { useState, useEffect } from 'react'
import { useNavigation, useAuth, useCart } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Search, ShoppingCart, Menu, X, User, LogOut, LayoutDashboard, Package, Store, CreditCard,
  Shield, Settings, ChevronDown, Leaf, MapPin, Plus, FileText, AlertTriangle, Gavel, ClipboardList,
  Bell, MessageCircle
} from 'lucide-react'
import NotificationBell from './NotificationBell'
import { PROVINCES } from '@/lib/types'

export default function Navbar() {
  const { navigate, isMobileMenuOpen, toggleMobileMenu, isSearchOpen, toggleSearch, openAuthModal } = useNavigation()
  const { user, logout } = useAuth()
  const { toggleCart, itemCount } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const count = itemCount()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navLinks = [
    { label: 'Browse', onClick: () => navigate('browse') },
    { label: 'Categories', onClick: () => navigate('category') },
    { label: 'Regions', onClick: () => navigate('regions') },
    { label: 'Seller Locator', onClick: () => navigate('seller-locator') },
    { label: 'How It Works', onClick: () => navigate('safety') },
    { label: 'For Sellers', onClick: () => navigate('sellers') },
  ]

  const infoLinks = [
    { label: 'About Us', page: 'about' as const },
    { label: 'Contact', page: 'contact' as const },
  ]

  const legalLinks = [
    { label: 'Terms of Service', page: 'terms' as const },
    { label: 'Privacy Policy', page: 'privacy' as const },
    { label: 'Cookie Policy', page: 'cookies' as const },
    { label: 'Seller Agreement', page: 'seller-terms' as const },
    { label: 'Dispute Policy', page: 'dispute-policy' as const },
  ]

  const buyerLinks = [
    { label: 'My Orders', icon: Package, onClick: () => navigate('orders') },
    { label: 'Messages', icon: MessageCircle, onClick: () => navigate('messaging') },
    { label: 'Notifications', icon: Bell, onClick: () => navigate('notifications') },
    { label: 'Cart', icon: ShoppingCart, onClick: () => toggleCart() },
    { label: 'Profile', icon: User, onClick: () => navigate('profile') },
  ]

  const sellerLinks = [
    { label: 'Dashboard', icon: LayoutDashboard, onClick: () => navigate('dashboard') },
    { label: 'My Products', icon: Package, onClick: () => navigate('my-products') },
    { label: 'Orders', icon: ClipboardList, onClick: () => navigate('my-orders') },
    { label: 'Messages', icon: MessageCircle, onClick: () => navigate('messaging') },
    { label: 'Notifications', icon: Bell, onClick: () => navigate('notifications') },
    { label: 'Store Settings', icon: Store, onClick: () => navigate('my-store') },
    { label: 'Payouts', icon: CreditCard, onClick: () => navigate('my-payouts') },
    { label: 'Profile', icon: User, onClick: () => navigate('profile') },
  ]

  const adminLinks = [
    { label: 'Dashboard', icon: LayoutDashboard, onClick: () => navigate('admin-dashboard') },
    { label: 'Users', icon: User, onClick: () => navigate('admin-users') },
    { label: 'Products', icon: Package, onClick: () => navigate('admin-products') },
    { label: 'Orders', icon: ClipboardList, onClick: () => navigate('admin-orders') },
    { label: 'Disputes', icon: AlertTriangle, onClick: () => navigate('admin-disputes') },
    { label: 'Settings', icon: Settings, onClick: () => navigate('admin-settings') },
  ]

  const roleLinks = user?.role === 'ADMIN' ? adminLinks : user?.role === 'SELLER' ? sellerLinks : buyerLinks

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <button onClick={() => navigate('home')} className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-shadow">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-stone-100 hidden sm:block">
                Canada<span className="text-red-500">Marketplace</span>
              </span>
            </button>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className="px-3 py-2 text-sm text-stone-400 hover:text-stone-100 rounded-lg hover:bg-white/5 transition-all"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSearch}
                className="text-stone-400 hover:text-stone-100 hover:bg-white/5"
              >
                <Search className="w-5 h-5" />
              </Button>

              {user && <NotificationBell />}

              <button
                onClick={toggleCart}
                className="relative p-2 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-white/5 transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="hidden sm:flex items-center gap-2 text-stone-300 hover:bg-white/5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-xs font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm max-w-[100px] truncate">{user.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-neutral-900 border-white/10">
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-sm font-medium text-stone-100">{user.name}</p>
                      <p className="text-xs text-stone-500">{user.email}</p>
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {user.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </div>
                    {roleLinks.map((link) => (
                      <DropdownMenuItem key={link.label} onClick={link.onClick} className="text-stone-300 hover:bg-white/5 cursor-pointer">
                        <link.icon className="w-4 h-4 mr-2" />
                        {link.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={logout} className="text-red-400 hover:bg-red-500/10 cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => openAuthModal('login')}
                    className="text-stone-300 hover:bg-white/5 hover:text-stone-100"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => openAuthModal('register')}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/20"
                  >
                    Get Started
                  </Button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-stone-400 hover:text-stone-100"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className="w-full text-left px-4 py-3 text-sm text-stone-400 hover:text-stone-100 rounded-lg hover:bg-white/5 transition-all"
                >
                  {link.label}
                </button>
              ))}
              <div className="border-t border-white/5 my-2" />
              {user ? (
                <>
                  {roleLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => { link.onClick(); toggleMobileMenu() }}
                      className="w-full text-left px-4 py-3 text-sm text-stone-400 hover:text-stone-100 rounded-lg hover:bg-white/5 flex items-center gap-3"
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </button>
                  ))}
                  <button
                    onClick={() => { logout(); toggleMobileMenu() }}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-3"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-4 py-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/10 text-stone-300"
                    onClick={() => { openAuthModal('login'); toggleMobileMenu() }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white"
                    onClick={() => { openAuthModal('register'); toggleMobileMenu() }}
                  >
                    Get Started
                  </Button>
                </div>
              )}
              <div className="border-t border-white/5 my-2" />
              <p className="px-4 py-2 text-[10px] text-stone-600 uppercase tracking-wider font-medium">Company</p>
              {infoLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.page)}
                  className="w-full text-left px-4 py-2 text-xs text-stone-500 hover:text-stone-300 rounded-lg hover:bg-white/5"
                >
                  {link.label}
                </button>
              ))}
              <div className="border-t border-white/5 my-2" />
              <p className="px-4 py-2 text-[10px] text-stone-600 uppercase tracking-wider font-medium">Legal</p>
              {legalLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.page)}
                  className="w-full text-left px-4 py-2 text-xs text-stone-500 hover:text-stone-300 rounded-lg hover:bg-white/5"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
