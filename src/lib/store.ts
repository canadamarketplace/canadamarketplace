"use client"
import { create } from "zustand"

export type PageView =
  | "home"
  | "browse"
  | "product-detail"
  | "category"
  | "regions"
  | "safety"
  | "sellers"
  | "storefront"
  | "login"
  | "register"
  | "register-seller"
  | "forgot-password"
  | "cart"
  | "checkout"
  | "orders"
  | "order-detail"
  | "profile"
  | "dashboard"
  | "my-products"
  | "add-product"
  | "edit-product"
  | "my-orders"
  | "my-store"
  | "my-payouts"
  | "terms"
  | "privacy"
  | "cookies"
  | "seller-terms"
  | "dispute-policy"
  | "contact"
  | "about"
  | "become-seller"
  | "file-dispute"
  | "notifications"
  | "messaging"
  | "seller-locator"
  | "admin-dashboard"
  | "admin-users"
  | "admin-products"
  | "admin-orders"
  | "admin-disputes"
  | "admin-settings"
  | "admin-user-detail"
  | "admin-product-detail"
  | "admin-order-detail"
  | "admin-dispute-detail"

interface NavigationState {
  currentPage: PageView
  pageParams: Record<string, string>
  previousPages: { page: PageView; params: Record<string, string> }[]
  navigate: (page: PageView, params?: Record<string, string>) => void
  goBack: () => void
  isCartOpen: boolean
  isMobileMenuOpen: boolean
  isSearchOpen: boolean
  isAuthModalOpen: boolean
  authModalTab: "login" | "register" | "register-seller"
  toggleCart: () => void
  toggleMobileMenu: () => void
  toggleSearch: () => void
  openAuthModal: (tab?: "login" | "register" | "register-seller") => void
  closeAuthModal: () => void
}

// Map page names to URL paths
function pageToUrl(page: PageView, params: Record<string, string>): string {
  const base: Record<string, string> = {
    "home": "/",
    "browse": "/browse",
    "product-detail": `/product/${params.id || ""}`,
    "storefront": `/store/${params.slug || ""}`,
    "category": `/browse?category=${params.category || ""}`,
    "regions": "/browse?regions=true",
    "safety": "/how-it-works",
    "sellers": "/become-seller",
    "cart": "/cart",
    "checkout": "/checkout",
    "orders": "/orders",
    "order-detail": `/orders/${params.id || ""}`,
    "file-dispute": `/disputes/new?order=${params.orderId || ""}`,
    "seller-locator": "/seller-locator",
    "notifications": "/notifications",
    "messaging": "/messages",
    "profile": "/profile",
    "forgot-password": "/forgot-password",
    "dashboard": "/seller/dashboard",
    "my-products": "/seller/products",
    "add-product": "/seller/products/new",
    "edit-product": `/seller/products/${params.id || ""}/edit`,
    "my-orders": "/seller/orders",
    "my-store": "/seller/store",
    "my-payouts": "/seller/payouts",
    "admin-dashboard": "/admin",
    "admin-users": "/admin/users",
    "admin-products": "/admin/products",
    "admin-orders": "/admin/orders",
    "admin-disputes": "/admin/disputes",
    "admin-settings": "/admin/settings",
    "terms": "/terms",
    "privacy": "/privacy",
    "cookies": "/cookies",
    "seller-terms": "/seller-terms",
    "dispute-policy": "/dispute-policy",
    "contact": "/contact",
    "about": "/about",
    "become-seller": "/become-seller",
  }
  return base[page] || "/"
}

// Map URL paths back to page names
export function urlToPage(pathname: string, search: string): { page: PageView; params: Record<string, string> } {
  const params = new URLSearchParams(search)
  if (pathname === "/" || pathname === "") return { page: "home", params: {} }
  if (pathname === "/browse") {
    const category = params.get("category")
    if (category) return { page: "category", params: { category } }
    if (params.get("regions")) return { page: "regions", params: {} }
    return { page: "browse", params: {} }
  }
  if (pathname.startsWith("/product/")) return { page: "product-detail", params: { id: pathname.split("/")[2] } }
  if (pathname.startsWith("/store/")) return { page: "storefront", params: { slug: pathname.split("/")[2] } }
  if (pathname === "/how-it-works") return { page: "safety", params: {} }
  if (pathname === "/become-seller" || pathname === "/sellers") return { page: "become-seller", params: {} }
  if (pathname === "/cart") return { page: "cart", params: {} }
  if (pathname === "/checkout") return { page: "checkout", params: {} }
  if (pathname === "/orders") return { page: "orders", params: {} }
  if (pathname.startsWith("/orders/")) return { page: "order-detail", params: { id: pathname.split("/")[2] } }
  if (pathname.startsWith("/disputes/new")) return { page: "file-dispute", params: { orderId: params.get("order") || "" } }
  if (pathname === "/seller-locator") return { page: "seller-locator", params: {} }
  if (pathname === "/notifications") return { page: "notifications", params: {} }
  if (pathname === "/messages") return { page: "messaging", params: {} }
  if (pathname === "/profile") return { page: "profile", params: {} }
  if (pathname === "/forgot-password") return { page: "forgot-password", params: {} }
  if (pathname.startsWith("/seller/dashboard")) return { page: "dashboard", params: {} }
  if (pathname === "/seller/products") return { page: "my-products", params: {} }
  if (pathname.startsWith("/seller/products/new")) return { page: "add-product", params: {} }
  if (pathname.startsWith("/seller/products/") && pathname.endsWith("/edit")) return { page: "edit-product", params: { id: pathname.split("/")[3] } }
  if (pathname.startsWith("/seller/orders")) return { page: "my-orders", params: {} }
  if (pathname.startsWith("/seller/store")) return { page: "my-store", params: {} }
  if (pathname.startsWith("/seller/payouts")) return { page: "my-payouts", params: {} }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const sub = pathname.replace("/admin/", "").replace("/admin", "")
    const pageMap: Record<string, PageView> = {
      "": "admin-dashboard", "users": "admin-users", "products": "admin-products",
      "orders": "admin-orders", "disputes": "admin-disputes", "settings": "admin-settings"
    }
    return { page: pageMap[sub] || "admin-dashboard", params: {} }
  }
  if (pathname === "/terms") return { page: "terms", params: {} }
  if (pathname === "/privacy") return { page: "privacy", params: {} }
  if (pathname === "/cookies") return { page: "cookies", params: {} }
  if (pathname === "/seller-terms") return { page: "seller-terms", params: {} }
  if (pathname === "/dispute-policy") return { page: "dispute-policy", params: {} }
  if (pathname === "/contact") return { page: "contact", params: {} }
  if (pathname === "/about") return { page: "about", params: {} }
  return { page: "home", params: {} }
}

export const useNavigation = create<NavigationState>((set, get) => ({
  currentPage: "home",
  pageParams: {},
  previousPages: [],
  navigate: (page, params = {}) => {
    const state = get()
    set({
      previousPages: [
        ...state.previousPages.slice(-20),
        { page: state.currentPage, params: state.pageParams },
      ],
      currentPage: page,
      pageParams: params,
      isMobileMenuOpen: false,
      isSearchOpen: false,
    })
    // Update browser URL
    const url = pageToUrl(page, params)
    window.history.pushState({}, "", url)
    window.scrollTo(0, 0)
  },
  goBack: () => {
    const state = get()
    if (state.previousPages.length > 0) {
      const prev = state.previousPages[state.previousPages.length - 1]
      set({
        currentPage: prev.page,
        pageParams: prev.params,
        previousPages: state.previousPages.slice(0, -1),
      })
      const url = pageToUrl(prev.page, prev.params)
      window.history.pushState({}, "", url)
      window.scrollTo(0, 0)
    } else {
      set({ currentPage: "home", pageParams: {} })
      window.history.pushState({}, "", "/")
      window.scrollTo(0, 0)
    }
  },
  isCartOpen: false,
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isAuthModalOpen: false,
  authModalTab: "login",
  toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  openAuthModal: (tab = "login") => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
}))

interface CartState {
  items: { productId: string; title: string; price: number; quantity: number; image?: string; storeName: string; storeId: string }[]
  addItem: (item: { productId: string; title: string; price: number; image?: string; storeName: string; storeId: string }) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => {
    const items = get().items
    const existing = items.find((i) => i.productId === item.productId)
    if (existing) {
      set({ items: items.map((i) => (i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i)) })
    } else {
      set({ items: [...items, { ...item, quantity: 1 }] })
    }
  },
  removeItem: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    set({ items: get().items.map((i) => (i.productId === productId ? { ...i, quantity } : i)) })
  },
  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}))

interface AuthState {
  user: {
    id: string
    email: string
    name: string
    role: string
    avatar?: string | null
    storeId?: string | null
    storeName?: string | null
    storeSlug?: string | null
    isVerified?: boolean
    phone?: string | null
    province?: string | null
    city?: string | null
    address?: string | null
    postalCode?: string | null
    bio?: string | null
  } | null
  setUser: (user: AuthState["user"]) => void
  logout: () => void
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))
