export type UserRole = "BUYER" | "SELLER" | "ADMIN"
export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "DISPUTED" | "REFUNDED"
export type ProductCondition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "USED"
export type ProductStatus = "ACTIVE" | "DRAFT" | "SOLD" | "REMOVED"
export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED"
export type PayoutStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"

export interface NavPage {
  id: string
  label: string
  icon?: string
  requiresAuth?: boolean
  requiredRole?: UserRole
  isPublic?: boolean
}

export const NAV_PAGES: Record<string, NavPage[]> = {
  public: [
    { id: "home", label: "Home", isPublic: true },
    { id: "browse", label: "Browse", isPublic: true },
    { id: "category", label: "Categories", isPublic: true },
    { id: "regions", label: "Regions", isPublic: true },
    { id: "safety", label: "How It Works", isPublic: true },
    { id: "sellers", label: "For Sellers", isPublic: true },
    { id: "terms", label: "Terms of Service", isPublic: true },
    { id: "privacy", label: "Privacy Policy", isPublic: true },
    { id: "cookies", label: "Cookie Policy", isPublic: true },
    { id: "seller-terms", label: "Seller Terms", isPublic: true },
    { id: "dispute-policy", label: "Dispute Policy", isPublic: true },
  ],
  buyer: [
    { id: "home", label: "Home", isPublic: true },
    { id: "browse", label: "Browse", isPublic: true },
    { id: "orders", label: "My Orders", requiresAuth: true },
    { id: "cart", label: "Cart", requiresAuth: true },
    { id: "profile", label: "My Profile", requiresAuth: true },
  ],
  seller: [
    { id: "home", label: "Home", isPublic: true },
    { id: "dashboard", label: "Dashboard", requiresAuth: true, requiredRole: "SELLER" },
    { id: "my-products", label: "My Products", requiresAuth: true, requiredRole: "SELLER" },
    { id: "my-orders", label: "Orders", requiresAuth: true, requiredRole: "SELLER" },
    { id: "my-store", label: "Storefront Settings", requiresAuth: true, requiredRole: "SELLER" },
    { id: "my-payouts", label: "Payouts", requiresAuth: true, requiredRole: "SELLER" },
  ],
  admin: [
    { id: "admin-dashboard", label: "Dashboard", requiresAuth: true, requiredRole: "ADMIN" },
    { id: "admin-users", label: "Users", requiresAuth: true, requiredRole: "ADMIN" },
    { id: "admin-products", label: "Products", requiresAuth: true, requiredRole: "ADMIN" },
    { id: "admin-orders", label: "Orders", requiresAuth: true, requiredRole: "ADMIN" },
    { id: "admin-disputes", label: "Disputes", requiresAuth: true, requiredRole: "ADMIN" },
    { id: "admin-settings", label: "Settings", requiresAuth: true, requiredRole: "ADMIN" },
  ],
}

export const CATEGORIES = [
  { name: "T-Shirts", slug: "tshirts", icon: "tshirt-crew", count: 8 },
  { name: "Mugs", slug: "mugs", icon: "cup", count: 5 },
  { name: "Caps", slug: "caps", icon: "hat-fedora", count: 5 },
  { name: "Music & Culture", slug: "music-culture", icon: "music-note", count: 3 },
]

export const PROVINCES = [
  { name: "Alberta", slug: "alberta", code: "AB" },
  { name: "British Columbia", slug: "british-columbia", code: "BC" },
  { name: "Manitoba", slug: "manitoba", code: "MB" },
  { name: "New Brunswick", slug: "new-brunswick", code: "NB" },
  { name: "Newfoundland and Labrador", slug: "newfoundland-labrador", code: "NL" },
  { name: "Nova Scotia", slug: "nova-scotia", code: "NS" },
  { name: "Ontario", slug: "ontario", code: "ON" },
  { name: "Prince Edward Island", slug: "prince-edward-island", code: "PE" },
  { name: "Quebec", slug: "quebec", code: "QC" },
  { name: "Saskatchewan", slug: "saskatchewan", code: "SK" },
  { name: "Northwest Territories", slug: "northwest-territories", code: "NT" },
  { name: "Yukon", slug: "yukon", code: "YT" },
  { name: "Nunavut", slug: "nunavut", code: "NU" },
]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending Payment",
  PAID: "Paid - Awaiting Shipment",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  DISPUTED: "Under Dispute",
  REFUNDED: "Refunded",
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  PAID: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SHIPPED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  DELIVERED: "bg-green-500/10 text-green-400 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
  DISPUTED: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  REFUNDED: "bg-stone-500/10 text-stone-400 border-stone-500/20",
}

export type CouponType = "PERCENTAGE" | "FIXED"

export interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number
  minOrderAmount: number | null
  maxUses: number | null
  usedCount: number
  startsAt: string | null
  expiresAt: string | null
  isActive: boolean
  sellerId: string | null
  createdAt: string
  updatedAt: string
}

export interface AppliedCoupon {
  id: string
  couponId: string
  orderId: string
  discountAmount: number
  coupon: Coupon
}
