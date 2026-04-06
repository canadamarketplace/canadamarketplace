import type { PageView } from "@/lib/store"

// ──────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────

export interface SEOPageConfig {
  /** Matches a PageView from the Zustand store */
  pageKey: PageView
  /** Title optimised for Canadian search; "| Canada Marketplace" is appended automatically */
  title: string
  /** Compelling description, 150-160 characters, keyword-rich */
  description: string
  /** Comma-separated keywords */
  keywords: string
  /** Canonical URL path, e.g. "/browse" */
  canonicalPath: string
  /** Open Graph type */
  ogType: "website" | "product" | "business.business" | "article" | "profile"
  /** Set true for admin / seller dashboard pages that must NOT be indexed */
  noIndex?: boolean
}

// ──────────────────────────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────────────────────────

export const seoConfig: Record<PageView, SEOPageConfig> = {
  // ── Public pages ──────────────────────────────────────────────
  home: {
    pageKey: "home",
    title: "Buy & Sell Online in Canada",
    description:
      "Canada's most trusted online marketplace. Buy and sell new and used products from local Canadian sellers. Free listing, secure escrow payments, and Canada-wide shipping.",
    keywords:
      "buy online Canada, sell online Canada, Canadian marketplace, online shopping Canada, Canadian e-commerce, shop Canada, marketplace Canada, local sellers Canada",
    canonicalPath: "/",
    ogType: "website",
  },

  browse: {
    pageKey: "browse",
    title: "Shop Products Across Canada",
    description:
      "Browse thousands of products from verified Canadian sellers. Find electronics, fashion, home & garden, sports gear, and more. Shop safely with escrow protection.",
    keywords:
      "shop products Canada, browse items Canada, buy online Canada, Canadian products, shop local Canada, online marketplace Canada, best deals Canada",
    canonicalPath: "/browse",
    ogType: "website",
  },

  "product-detail": {
    pageKey: "product-detail",
    title: "Product Details",
    description:
      "View product details on Canada Marketplace. Buy with confidence using our secure escrow payment system. Read reviews from Canadian buyers.",
    keywords:
      "product details Canada, buy product online Canada, product reviews Canada, safe shopping Canada",
    canonicalPath: "/product",
    ogType: "product",
  },

  category: {
    pageKey: "category",
    title: "Shop by Category",
    description:
      "Explore product categories on Canada Marketplace. Find electronics, fashion, home & garden, sports, vehicles, books, music, and outdoor gear from Canadian sellers.",
    keywords:
      "product categories Canada, shop by category, Canadian electronics, fashion Canada, home garden Canada, sports equipment Canada",
    canonicalPath: "/browse",
    ogType: "website",
  },

  regions: {
    pageKey: "regions",
    title: "Shop by Canadian Region & Province",
    description:
      "Find local sellers across every Canadian province. Shop from Ontario, BC, Alberta, Quebec, and more. Support local Canadian businesses near you.",
    keywords:
      "shop by province Canada, local sellers Ontario, BC marketplace, Alberta sellers, Quebec online shopping, Canadian regions marketplace",
    canonicalPath: "/browse?regions=true",
    ogType: "website",
  },

  storefront: {
    pageKey: "storefront",
    title: "Visit Seller Store",
    description:
      "Browse this verified Canadian seller's storefront on Canada Marketplace. View products, read reviews, and shop with confidence using escrow protection.",
    keywords:
      "Canadian seller store, verified seller Canada, shop from seller, Canadian storefront, trusted seller Canada",
    canonicalPath: "/store",
    ogType: "business.business",
  },

  safety: {
    pageKey: "safety",
    title: "How It Works — Safe Online Shopping in Canada",
    description:
      "Learn how Canada Marketplace keeps your transactions safe. Escrow payments, verified sellers, dispute resolution, and buyer protection for every order in Canada.",
    keywords:
      "how it works, safe shopping Canada, escrow protection, buyer protection Canada, secure online shopping, marketplace safety",
    canonicalPath: "/how-it-works",
    ogType: "website",
  },

  sellers: {
    pageKey: "sellers",
    title: "Sell on Canada Marketplace",
    description:
      "Start selling on Canada's fastest-growing online marketplace. Reach millions of Canadian buyers, list for free, and get paid securely with escrow.",
    keywords:
      "sell on Canada Marketplace, become a seller Canada, online selling platform, Canadian sellers, start selling online, marketplace for sellers",
    canonicalPath: "/become-seller",
    ogType: "website",
  },

  about: {
    pageKey: "about",
    title: "About Canada Marketplace",
    description:
      "Learn about Canada Marketplace — Canada's trusted e-commerce platform connecting buyers and sellers nationwide. Our mission, values, and commitment to safe online shopping.",
    keywords:
      "about Canada Marketplace, Canadian e-commerce platform, online marketplace Canada, trusted marketplace Canada, company info",
    canonicalPath: "/about",
    ogType: "website",
  },

  "become-seller": {
    pageKey: "become-seller",
    title: "Start Your Online Business in Canada",
    description:
      "Sell on Canada Marketplace and reach millions of Canadian buyers. Easy setup, free listings, low fees, and secure escrow payments. Start your online business today.",
    keywords:
      "sell products Canada, start online business Canada, Canadian marketplace seller, online store Canada, sell online for free, e-commerce Canada seller",
    canonicalPath: "/become-seller",
    ogType: "website",
  },

  "seller-locator": {
    pageKey: "seller-locator",
    title: "Find Canadian Sellers Near You",
    description:
      "Discover local Canadian businesses and sellers on the interactive map. Filter by province, city, or category. Support local commerce across Canada.",
    keywords:
      "find sellers Canada, local sellers near me, Canadian business directory, local marketplace Canada, shop local Canada, Canadian seller locator",
    canonicalPath: "/seller-locator",
    ogType: "website",
  },

  escrow: {
    pageKey: "escrow",
    title: "Secure Escrow Protection",
    description:
      "Learn about Canada Marketplace's escrow payment system. Your money is held safely until you confirm delivery. Buyer and seller protection on every transaction.",
    keywords:
      "escrow protection Canada, secure payments Canada, buyer protection marketplace, safe online transactions Canada, escrow service",
    canonicalPath: "/escrow",
    ogType: "website",
  },

  shipping: {
    pageKey: "shipping",
    title: "Shipping Information",
    description:
      "Shipping information for Canada Marketplace. Canada-wide delivery options, estimated delivery times, shipping costs, and tracking for all orders across Canadian provinces.",
    keywords:
      "shipping Canada, delivery information Canada, Canada-wide shipping, shipping costs Canada, package tracking Canada, order delivery",
    canonicalPath: "/shipping",
    ogType: "website",
  },

  faq: {
    pageKey: "faq",
    title: "Frequently Asked Questions",
    description:
      "Get answers to common questions about buying, selling, payments, shipping, and returns on Canada Marketplace. Browse our help centre for quick support.",
    keywords:
      "Canada Marketplace FAQ, help centre Canada, marketplace questions, buyer FAQ Canada, seller FAQ Canada, support Canada",
    canonicalPath: "/faq",
    ogType: "website",
  },

  contact: {
    pageKey: "contact",
    title: "Contact Us",
    description:
      "Get in touch with Canada Marketplace customer support. Email, live chat, or submit a ticket. We're here to help Canadian buyers and sellers 7 days a week.",
    keywords:
      "contact Canada Marketplace, customer support Canada, marketplace help, support email, live chat Canada, buyer seller support",
    canonicalPath: "/contact",
    ogType: "website",
  },

  terms: {
    pageKey: "terms",
    title: "Terms of Service",
    description:
      "Read the Terms of Service for Canada Marketplace. Understand your rights and responsibilities as a buyer or seller on Canada's trusted e-commerce platform.",
    keywords:
      "terms of service Canada, marketplace terms, Canada Marketplace terms, user agreement Canada, e-commerce terms",
    canonicalPath: "/terms",
    ogType: "article",
  },

  privacy: {
    pageKey: "privacy",
    title: "Privacy Policy",
    description:
      "Canada Marketplace Privacy Policy. Learn how we collect, use, and protect your personal information. Compliant with Canadian PIPEDA privacy legislation.",
    keywords:
      "privacy policy Canada, data protection Canada, PIPEDA compliance, marketplace privacy, Canadian privacy law, personal data protection",
    canonicalPath: "/privacy",
    ogType: "article",
  },

  cookies: {
    pageKey: "cookies",
    title: "Cookie Policy",
    description:
      "Canada Marketplace Cookie Policy. Understand how we use cookies and tracking technologies to improve your browsing and shopping experience.",
    keywords:
      "cookie policy Canada, marketplace cookies, browser cookies, tracking preferences, Canada Marketplace cookies",
    canonicalPath: "/cookies",
    ogType: "article",
  },

  "seller-terms": {
    pageKey: "seller-terms",
    title: "Seller Terms & Conditions",
    description:
      "Seller terms and conditions for Canada Marketplace. Understand seller fees, listing policies, shipping requirements, and dispute resolution for Canadian sellers.",
    keywords:
      "seller terms Canada, marketplace seller agreement, seller policy Canada, selling rules Canada, seller fees",
    canonicalPath: "/seller-terms",
    ogType: "article",
  },

  "dispute-policy": {
    pageKey: "dispute-policy",
    title: "Dispute Resolution Policy",
    description:
      "Canada Marketplace dispute resolution policy. Learn how to file disputes, mediation steps, refund policies, and how we protect both buyers and sellers.",
    keywords:
      "dispute policy Canada, marketplace dispute resolution, refund policy Canada, buyer seller dispute, order dispute Canada",
    canonicalPath: "/dispute-policy",
    ogType: "article",
  },

  "seller-guide": {
    pageKey: "seller-guide",
    title: "Seller Guide — Start Selling Successfully",
    description:
      "Complete guide to selling on Canada Marketplace. Learn how to create listings, optimise for search, handle shipping, manage orders, and grow your Canadian online business.",
    keywords:
      "seller guide Canada, how to sell online, selling tips Canada, marketplace selling guide, online business tips Canada",
    canonicalPath: "/seller-guide",
    ogType: "article",
  },

  // ── Auth pages ───────────────────────────────────────────────
  login: {
    pageKey: "login",
    title: "Sign In",
    description: "Sign in to your Canada Marketplace account to buy, sell, and manage your orders securely.",
    keywords: "sign in Canada Marketplace, login, account access, buyer login, seller login",
    canonicalPath: "/login",
    ogType: "website",
  },

  register: {
    pageKey: "register",
    title: "Create an Account",
    description: "Join Canada Marketplace for free. Create your buyer account and start shopping from trusted Canadian sellers today.",
    keywords: "register Canada Marketplace, create account, sign up free, join marketplace Canada, buyer registration",
    canonicalPath: "/register",
    ogType: "website",
  },

  "register-seller": {
    pageKey: "register-seller",
    title: "Register as a Seller",
    description: "Register as a seller on Canada Marketplace. Set up your storefront, list products, and start selling to Canadian buyers in minutes.",
    keywords: "register seller Canada, become seller, seller sign up, create seller account, sell products Canada",
    canonicalPath: "/register-seller",
    ogType: "website",
  },

  "forgot-password": {
    pageKey: "forgot-password",
    title: "Reset Your Password",
    description: "Reset your Canada Marketplace password. Enter your email to receive a secure password reset link.",
    keywords: "reset password, forgot password Canada Marketplace, account recovery, password help",
    canonicalPath: "/forgot-password",
    ogType: "website",
  },

  // ── Buyer pages ──────────────────────────────────────────────
  cart: {
    pageKey: "cart",
    title: "Your Shopping Cart",
    description: "Review your shopping cart on Canada Marketplace. Proceed to secure checkout with escrow payment protection.",
    keywords: "shopping cart Canada, checkout, buy products online Canada, secure checkout",
    canonicalPath: "/cart",
    ogType: "website",
  },

  checkout: {
    pageKey: "checkout",
    title: "Secure Checkout",
    description: "Complete your purchase on Canada Marketplace with secure escrow payment. Multiple payment options, Canadian tax included, and buyer protection.",
    keywords: "checkout Canada, secure payment, escrow checkout, buy online Canada, Canadian payment processing",
    canonicalPath: "/checkout",
    ogType: "website",
  },

  orders: {
    pageKey: "orders",
    title: "My Orders",
    description: "View and track your orders on Canada Marketplace. Check shipping status, delivery estimates, and order history.",
    keywords: "my orders Canada, order tracking, purchase history, track delivery Canada, order status",
    canonicalPath: "/orders",
    ogType: "website",
  },

  "order-detail": {
    pageKey: "order-detail",
    title: "Order Details",
    description: "View detailed information about your order on Canada Marketplace including shipping, payment status, and seller details.",
    keywords: "order details, order information, order tracking Canada, purchase details",
    canonicalPath: "/orders",
    ogType: "website",
  },

  profile: {
    pageKey: "profile",
    title: "My Profile",
    description: "Manage your Canada Marketplace profile. Update your personal information, delivery addresses, and account settings.",
    keywords: "my profile, account settings Canada, manage account, Canada Marketplace profile, user settings",
    canonicalPath: "/profile",
    ogType: "profile",
  },

  wishlist: {
    pageKey: "wishlist",
    title: "My Wishlist",
    description: "View your saved items on Canada Marketplace. Keep track of products you want to buy from Canadian sellers.",
    keywords: "wishlist Canada, saved items, wish list, favourite products Canada, save for later",
    canonicalPath: "/wishlist",
    ogType: "website",
  },

  coupons: {
    pageKey: "coupons",
    title: "Coupons & Discounts",
    description: "Browse available coupons and discount codes on Canada Marketplace. Save money on your next purchase from Canadian sellers.",
    keywords: "coupons Canada, discount codes, promo codes Canada, marketplace coupons, save money Canada, deals Canada",
    canonicalPath: "/seller/coupons",
    ogType: "website",
  },

  notifications: {
    pageKey: "notifications",
    title: "Notifications",
    description: "View your Canada Marketplace notifications. Stay updated on orders, messages, and activity from sellers and buyers.",
    keywords: "notifications, order updates Canada, marketplace alerts, buyer notifications",
    canonicalPath: "/notifications",
    ogType: "website",
  },

  messaging: {
    pageKey: "messaging",
    title: "Messages",
    description: "Chat with buyers and sellers on Canada Marketplace. Discuss products, negotiate deals, and get support via secure messaging.",
    keywords: "messages, chat Canada Marketplace, buyer seller messaging, product questions, marketplace chat",
    canonicalPath: "/messages",
    ogType: "website",
  },

  "file-dispute": {
    pageKey: "file-dispute",
    title: "File a Dispute",
    description: "File a dispute on Canada Marketplace for order issues. Our mediation team will help resolve problems with buyers and sellers fairly.",
    keywords: "file dispute Canada, order dispute, report problem, marketplace dispute resolution, buyer protection claim",
    canonicalPath: "/disputes/new",
    ogType: "website",
  },

  "address-book": {
    pageKey: "address-book",
    title: "My Addresses",
    description: "Manage your shipping and billing addresses on Canada Marketplace. Add, edit, or delete delivery locations across Canada.",
    keywords: "address book Canada, shipping addresses, delivery addresses Canada, manage addresses",
    canonicalPath: "/address-book",
    ogType: "website",
  },

  "buyer-reviews": {
    pageKey: "buyer-reviews",
    title: "My Reviews",
    description: "View and manage your product reviews on Canada Marketplace. See your rating history and review feedback from purchases.",
    keywords: "my reviews Canada, product reviews, review history, rating feedback Canada",
    canonicalPath: "/my-reviews",
    ogType: "website",
  },

  // ── Seller dashboard pages (noIndex: true) ──────────────────
  dashboard: {
    pageKey: "dashboard",
    title: "Seller Dashboard",
    description: "Access your seller dashboard on Canada Marketplace. View sales, orders, revenue, and analytics for your Canadian online store.",
    keywords: "seller dashboard, sales analytics, seller stats, Canadian seller tools",
    canonicalPath: "/seller/dashboard",
    ogType: "website",
    noIndex: true,
  },

  "my-products": {
    pageKey: "my-products",
    title: "My Products",
    description: "Manage your product listings on Canada Marketplace. Add, edit, and track inventory for your Canadian online store.",
    keywords: "my products, manage listings, product inventory, seller products",
    canonicalPath: "/seller/products",
    ogType: "website",
    noIndex: true,
  },

  "add-product": {
    pageKey: "add-product",
    title: "Add New Product",
    description: "List a new product on Canada Marketplace. Add photos, set pricing, choose categories, and reach Canadian buyers.",
    keywords: "add product, list item, sell product Canada, new listing",
    canonicalPath: "/seller/products/new",
    ogType: "website",
    noIndex: true,
  },

  "edit-product": {
    pageKey: "edit-product",
    title: "Edit Product",
    description: "Edit your product listing on Canada Marketplace. Update photos, pricing, description, and shipping details.",
    keywords: "edit product, update listing, modify product details",
    canonicalPath: "/seller/products",
    ogType: "website",
    noIndex: true,
  },

  "my-orders": {
    pageKey: "my-orders",
    title: "Seller Orders",
    description: "Manage your incoming orders on Canada Marketplace. View, process, and ship orders from Canadian buyers.",
    keywords: "seller orders, manage orders, order fulfilment, shipping orders",
    canonicalPath: "/seller/orders",
    ogType: "website",
    noIndex: true,
  },

  "my-store": {
    pageKey: "my-store",
    title: "Storefront Settings",
    description: "Customise your storefront on Canada Marketplace. Update your store name, banner, description, and seller profile.",
    keywords: "storefront settings, customise store, seller profile settings, store branding",
    canonicalPath: "/seller/store",
    ogType: "website",
    noIndex: true,
  },

  "my-payouts": {
    pageKey: "my-payouts",
    title: "My Payouts",
    description: "View and manage your payouts on Canada Marketplace. Track earnings, withdrawal history, and payment status.",
    keywords: "seller payouts, earnings, withdrawal, payment history, seller income",
    canonicalPath: "/seller/payouts",
    ogType: "website",
    noIndex: true,
  },

  "seller-transactions": {
    pageKey: "seller-transactions",
    title: "Seller Transactions",
    description: "View all your transaction history on Canada Marketplace. Track payments, refunds, and earnings details.",
    keywords: "seller transactions, payment history, transaction records, earnings log",
    canonicalPath: "/seller/transactions",
    ogType: "website",
    noIndex: true,
  },

  "seller-reviews": {
    pageKey: "seller-reviews",
    title: "Seller Reviews",
    description: "View customer reviews for your products on Canada Marketplace. Monitor ratings and buyer feedback.",
    keywords: "seller reviews, customer feedback, product ratings, buyer reviews",
    canonicalPath: "/seller/reviews",
    ogType: "website",
    noIndex: true,
  },

  "seller-shipping": {
    pageKey: "seller-shipping",
    title: "Seller Shipping Settings",
    description: "Configure shipping options for your store on Canada Marketplace. Set rates, delivery zones, and shipping methods for Canadian provinces.",
    keywords: "seller shipping, shipping settings, delivery rates, shipping configuration",
    canonicalPath: "/seller/shipping",
    ogType: "website",
    noIndex: true,
  },

  // ── Admin pages (noIndex: true) ─────────────────────────────
  "admin-dashboard": {
    pageKey: "admin-dashboard",
    title: "Admin Dashboard",
    description: "Canada Marketplace admin dashboard. Monitor platform metrics, user activity, revenue, and overall system health.",
    keywords: "admin dashboard, platform analytics, marketplace management",
    canonicalPath: "/admin",
    ogType: "website",
    noIndex: true,
  },

  "admin-users": {
    pageKey: "admin-users",
    title: "Manage Users",
    description: "Admin user management for Canada Marketplace. View, edit, and moderate buyer and seller accounts.",
    keywords: "admin users, user management, account moderation",
    canonicalPath: "/admin/users",
    ogType: "website",
    noIndex: true,
  },

  "admin-products": {
    pageKey: "admin-products",
    title: "Manage Products",
    description: "Admin product management for Canada Marketplace. Review, approve, flag, and moderate product listings.",
    keywords: "admin products, product moderation, listing management",
    canonicalPath: "/admin/products",
    ogType: "website",
    noIndex: true,
  },

  "admin-orders": {
    pageKey: "admin-orders",
    title: "Manage Orders",
    description: "Admin order management for Canada Marketplace. Monitor, review, and resolve order issues platform-wide.",
    keywords: "admin orders, order management, platform orders",
    canonicalPath: "/admin/orders",
    ogType: "website",
    noIndex: true,
  },

  "admin-disputes": {
    pageKey: "admin-disputes",
    title: "Manage Disputes",
    description: "Admin dispute management for Canada Marketplace. Mediate buyer-seller disputes and issue resolution.",
    keywords: "admin disputes, dispute mediation, resolution management",
    canonicalPath: "/admin/disputes",
    ogType: "website",
    noIndex: true,
  },

  "admin-settings": {
    pageKey: "admin-settings",
    title: "Admin Settings",
    description: "Canada Marketplace admin settings. Configure platform preferences, fees, policies, and integrations.",
    keywords: "admin settings, platform configuration, marketplace settings",
    canonicalPath: "/admin/settings",
    ogType: "website",
    noIndex: true,
  },

  "admin-tax": {
    pageKey: "admin-tax",
    title: "Tax Configuration",
    description: "Configure Canadian tax rates (GST, HST, PST, QST) for provinces and territories on Canada Marketplace.",
    keywords: "admin tax, Canadian tax rates, GST HST PST QST, tax configuration",
    canonicalPath: "/admin/tax",
    ogType: "website",
    noIndex: true,
  },

  "admin-payments": {
    pageKey: "admin-payments",
    title: "Payment Management",
    description: "Admin payment management for Canada Marketplace. Monitor transactions, payouts, refunds, and Stripe integration.",
    keywords: "admin payments, payment processing, Stripe management, transaction monitoring",
    canonicalPath: "/admin/payments",
    ogType: "website",
    noIndex: true,
  },

  "admin-shipping": {
    pageKey: "admin-shipping",
    title: "Shipping Configuration",
    description: "Admin shipping settings for Canada Marketplace. Configure Canada Post, regional carriers, and delivery zones.",
    keywords: "admin shipping, carrier configuration, Canada Post, delivery zones",
    canonicalPath: "/admin/shipping",
    ogType: "website",
    noIndex: true,
  },

  "admin-marketing": {
    pageKey: "admin-marketing",
    title: "Marketing Management",
    description: "Admin marketing tools for Canada Marketplace. Manage promotions, featured listings, newsletters, and platform campaigns.",
    keywords: "admin marketing, promotions, featured listings, marketing campaigns",
    canonicalPath: "/admin/marketing",
    ogType: "website",
    noIndex: true,
  },

  "admin-reports": {
    pageKey: "admin-reports",
    title: "Platform Reports",
    description: "View comprehensive platform reports for Canada Marketplace. Sales analytics, user growth, revenue trends, and performance metrics.",
    keywords: "admin reports, platform analytics, sales reports, performance metrics",
    canonicalPath: "/admin/reports",
    ogType: "website",
    noIndex: true,
  },

  "admin-user-detail": {
    pageKey: "admin-user-detail",
    title: "User Detail",
    description: "Admin view for individual user details on Canada Marketplace.",
    keywords: "admin user detail, user profile admin",
    canonicalPath: "/admin/users",
    ogType: "website",
    noIndex: true,
  },

  "admin-product-detail": {
    pageKey: "admin-product-detail",
    title: "Product Detail (Admin)",
    description: "Admin view for individual product details on Canada Marketplace.",
    keywords: "admin product detail, product review admin",
    canonicalPath: "/admin/products",
    ogType: "website",
    noIndex: true,
  },

  "admin-order-detail": {
    pageKey: "admin-order-detail",
    title: "Order Detail (Admin)",
    description: "Admin view for individual order details on Canada Marketplace.",
    keywords: "admin order detail, order review admin",
    canonicalPath: "/admin/orders",
    ogType: "website",
    noIndex: true,
  },

  "admin-dispute-detail": {
    pageKey: "admin-dispute-detail",
    title: "Dispute Detail (Admin)",
    description: "Admin view for individual dispute details on Canada Marketplace.",
    keywords: "admin dispute detail, dispute review admin",
    canonicalPath: "/admin/disputes",
    ogType: "website",
    noIndex: true,
  },
}

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

const BASE_URL = "https://www.canadamarketplace.ca"
const SITE_NAME = "Canada Marketplace"

/**
 * Get the full SEO config for a given page, with optional dynamic overrides.
 */
export function getSEOConfig(
  pageKey: PageView,
  overrides?: Partial<Pick<SEOPageConfig, "title" | "description" | "keywords" | "ogImage">>
): SEOPageConfig & { ogImage?: string } {
  const config = seoConfig[pageKey]

  return {
    ...config,
    ...overrides,
  }
}

/**
 * Build a full canonical URL from a path.
 */
export function buildCanonicalUrl(path: string): string {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

/**
 * Build a full title with site name suffix.
 */
export function buildTitle(title: string): string {
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
}
