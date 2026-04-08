# Returns/RMA Feature — Worklog

## Date: 2025-01-01

## Summary
Implemented a complete Returns/RMA management system for the Canada Marketplace platform. This feature allows buyers to request returns, sellers to manage return requests, and admins to oversee the entire process.

## Changes Made

### 1. Prisma Schema (`prisma/schema.prisma`)
- Added `Return` model with fields: id, rmaNumber (unique), orderId, orderItemId, buyerId, sellerId, reason, description, status, refundAmount, refundMethod, returnShippingMethod, trackingNumber, sellerNotes, adminNotes, timestamp fields (approvedAt, rejectedAt, receivedAt, refundedAt, closedAt), createdAt, updatedAt
- Added `returns Return[]` relation to `Order` model
- Added `buyerReturns Return[] @relation("ReturnBuyer")` and `sellerReturns Return[] @relation("ReturnSeller")` to `User` model
- Added database indexes on orderId, buyerId, sellerId, status

### 2. Type Definitions (`src/lib/types.ts`)
- Added `ReturnStatus` type: REQUESTED | APPROVED | REJECTED | RETURN_RECEIVED | INSPECTING | REFUNDED | PARTIAL_REFUND | CLOSED
- Added `ReturnReason` type: DEFECTIVE | WRONG_ITEM | NOT_AS_DESCRIBED | DAMAGED | WRONG_SIZE | CHANGE_OF_MIND | OTHER
- Added `RETURN_STATUS_LABELS` mapping for human-readable labels
- Added `RETURN_STATUS_COLORS` mapping for badge styling (using dark theme color classes)
- Added `RETURN_REASON_LABELS` mapping for reason labels

### 3. Page Registration (5 touchpoints each for 3 pages)

#### `src/lib/store.ts`
- Added `seller-returns`, `admin-returns`, `my-returns` to `PageView` type
- Added URL mappings in `pageToUrlBase()`:
  - `seller-returns` → `/seller/returns`
  - `admin-returns` → `/admin/returns`
  - `my-returns` → `/my-returns`
- Added reverse URL mappings in `urlToPage()`
- Added `returns: "admin-returns"` to admin pageMap

#### `src/components/marketplace/MarketplaceApp.tsx`
- Added imports for SellerReturns, AdminReturns, MyReturnsPage
- Added case handlers in PageRenderer switch

#### `src/components/marketplace/layouts/DashboardSidebar.tsx`
- Added `RotateCcw` icon import
- Added `{ label: 'Returns/RMA', icon: RotateCcw, page: 'seller-returns' }` to SELLER_MENU (after Orders)
- Added `{ label: 'Returns/RMA', icon: RotateCcw, page: 'admin-returns' }` to ADMIN_MENU (after Disputes)
- Added `{ label: 'My Returns', icon: RotateCcw, page: 'my-returns' }` to BUYER_MENU (after My Orders)

### 4. API Routes

#### `src/app/api/returns/route.ts`
- **GET**: List returns with filters (buyerId, sellerId, status, admin=true for all). Auto-filters by authenticated user role if no explicit filter.
- **POST**: Create return request (buyer only). Validates order belongs to buyer, order status is PAID/SHIPPED/DELIVERED, no open return exists. Generates RMA number, creates OrderTimeline entry.

#### `src/app/api/returns/[id]/route.ts`
- **GET**: Get single return with full details. Authorization check: buyer, seller, or admin.
- **PATCH**: Update return status. Validates role (seller or admin), status transitions for sellers, supports all transitions for admin. Sets timestamps, creates OrderTimeline entries, auto-refunds order when REFUNDED.

### 5. Buyer Returns Page (`src/components/marketplace/pages/buyer/MyReturnsPage.tsx`)
- Wrapped with `<DashboardSidebar role="buyer" activeItem="my-returns">`
- Status filter tabs (All, Requested, Approved, Received, Inspecting, Refunded, Rejected, Closed)
- Each return shows: RMA number, status badge, reason, order number, date, refund amount
- Expandable details: product images, description, return shipping method, seller notes, timeline dates
- "View Order" button linking to order detail

#### Buyer OrderDetailPage Modifications (`src/components/marketplace/pages/buyer/OrderDetailPage.tsx`)
- Added "Request Return" button when order is DELIVERED/PAID/SHIPPED and no open return exists
- Added Return Request Dialog with reason selector (RETURN_REASON_LABELS) and description textarea
- Shows existing return requests for the order with links to My Returns page

### 6. Seller Returns Page (`src/components/marketplace/pages/seller/SellerReturns.tsx`)
- Wrapped with `<DashboardSidebar role="seller" activeItem="seller-returns">`
- Status filter tabs
- Each return card shows: RMA#, buyer name, order#, reason, status badge, date, refund amount
- Expandable detail with product images, buyer description, order total, shipping method, timeline
- Internal seller notes textarea with save
- Status-based action buttons:
  - REQUESTED → Approve (dialog with shipping method: buyer pays / seller pays / prepaid label) + Reject (dialog with reason)
  - RETURN_RECEIVED → Start Inspection
  - INSPECTING → Issue Full Refund + Issue Partial Refund (dialog with amount input)

### 7. Admin Returns Page (`src/components/marketplace/pages/admin/AdminReturns.tsx`)
- Wrapped with `<AdminAuthGuard><DashboardSidebar role="admin" activeItem="admin-returns">`
- Stats summary cards: Total Returns, Pending, Approved, Refunded
- Search bar (RMA#, buyer, seller, order#)
- Status filter tabs
- Each return shows: RMA#, buyer vs seller, order#, reason, status, refund amount
- Expandable detail: parties info, products with images, full description, shipping/refund methods, timeline
- Seller notes and admin notes display
- Admin override: can change status to any value, add admin notes, set refund amount
- Full refund auto-fills from order subtotal

### 8. Seed Files

#### `prisma/seed.ts` and `src/lib/auto-seed.ts`
- Added `Tunog Kalye Insulated Tumbler — 20oz` product (drinkware category, seller 1, $24.99)
- Updated Drinkware category productCount from 5 to 6
- Added `db.return.deleteMany()` to cleanup in both seed files
- Added 3 sample returns with different statuses (REQUESTED, APPROVED, REFUNDED) using first 3 orders

## Files Created
- `src/app/api/returns/route.ts`
- `src/app/api/returns/[id]/route.ts`
- `src/components/marketplace/pages/buyer/MyReturnsPage.tsx`
- `src/components/marketplace/pages/seller/SellerReturns.tsx`
- `src/components/marketplace/pages/admin/AdminReturns.tsx`

## Files Modified
- `prisma/schema.prisma`
- `src/lib/types.ts`
- `src/lib/store.ts`
- `src/components/marketplace/MarketplaceApp.tsx`
- `src/components/marketplace/layouts/DashboardSidebar.tsx`
- `src/components/marketplace/pages/buyer/OrderDetailPage.tsx`
- `prisma/seed.ts`
- `src/lib/auto-seed.ts`

## Notes
- ESLint passes with no errors
- Prisma schema push requires PostgreSQL environment variables (STORAGE_DATABASE_URL_UNPOOLED, STORAGE_POSTGRES_PRISMA_URL) that are available in the production environment
- All pages follow existing code patterns and styling conventions (dark theme with cm-* classes, rounded-2xl cards, shadcn/ui components)

---

# Social Login (Google + Facebook) & Review Reminder System — Worklog

## Date: 2025-06-13

## Summary
Implemented two major features: (1) Social login via Google and Facebook OAuth providers integrated with the existing NextAuth + custom JWT auth system, and (2) A review reminder system that allows admins to batch-send review reminder emails to buyers of delivered orders, with in-app notifications.

## Feature 1: Social Login (Google + Facebook)

### Architecture
The app uses a dual-auth system: NextAuth handles OAuth flows, while the app's own custom JWT (`cm-auth-token` httpOnly cookie) is used for API auth. A bridge endpoint syncs the two systems.

### Changes Made

#### 1. NextAuth Configuration (`src/app/api/auth/[...nextauth]/route.ts`)
- Added `GoogleProvider` and `FacebookProvider` imports and provider configs
- Providers read from env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`
- Added `signIn` callback: allows all credentials and OAuth sign-ins; for OAuth, creates a new user in the DB if no account with that email exists (auto-generates a password, sets role to BUYER, marks as verified)
- Enhanced `jwt` callback: for OAuth providers, looks up the user's ID and role from DB if not already in token
- `session` callback preserved: continues to expose `userId` and `role` from token

#### 2. Social Callback Bridge (`src/app/api/auth/social-callback/route.ts`) — NEW FILE
- `GET /api/auth/social-callback` — reads the NextAuth session after OAuth, finds/creates user in DB, creates the app's custom JWT cookie (`cm-auth-token`), returns user data as JSON
- Uses `getServerSession(authOptions)` to access the NextAuth session
- Returns user data in the same shape as `/api/auth/login` for Zustand compatibility

#### 3. Middleware (`src/middleware.ts`)
- Added `/api/auth/social-callback` to `PUBLIC_ROUTES` so the bridge endpoint is accessible without existing JWT auth

#### 4. AuthModal UI (`src/components/marketplace/AuthModal.tsx`)
- Added `signIn` import from `next-auth/react`
- Added `handleSocialLogin(provider)` function that calls `signIn(provider, { callbackUrl: '/?social=1' })`
- Added social login section in the Login tab between the "Sign In" button and demo accounts:
  - "or continue with" divider
  - Google button: white bg, official Google "G" SVG logo, "Google" text
  - Facebook button: #1877F2 blue bg, white Facebook SVG logo, "Facebook" text
  - Both buttons are side-by-side in a 2-column grid
- Buttons use `handleSocialLogin('google')` and `handleSocialLogin('facebook')`

#### 5. ForgotPasswordPage (`src/components/marketplace/pages/auth/ForgotPasswordPage.tsx`)
- Added `signIn` import from `next-auth/react`
- Added social login buttons (Google + Facebook) below the email info text, before the form closes
- Same visual style as AuthModal buttons

#### 6. MarketplaceApp (`src/components/marketplace/MarketplaceApp.tsx`)
- Added `useAuth` import from store
- In the URL sync `useEffect`, added OAuth callback detection: when `?social=1` is in the URL, calls `GET /api/auth/social-callback`, sets the user in Zustand via `useAuth.getState().setUser()`, then cleans the URL with `history.replaceState`
- This handles the full-page redirect that OAuth requires, bridging back to the SPA state

#### 7. Environment Variables (`.env.example`)
- Added Google OAuth vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Added Facebook OAuth vars: `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`

#### 8. i18n (`src/lib/locales/en.json`, `src/lib/locales/fr.json`)
- Added `auth.continueWithGoogle` / `auth.continueWithFacebook` translation keys (EN + FR)

## Feature 2: Review Reminder System

### Changes Made

#### 1. Email Template (`src/lib/email.ts`)
- Added `sendReviewReminder(userEmail, userName, orderNumber, productTitles)` function
- Follows the same branded HTML pattern as existing email functions
- HTML includes: greeting with user name, order number, product list (bullet points), "Leave a Review" CTA button
- Uses `siteUrl` for the review link

#### 2. Review Reminder API (`src/app/api/reviews/reminder/route.ts`) — NEW FILE
- `POST /api/reviews/reminder` — admin-only endpoint (requires ADMIN role)
- Accepts two modes:
  - `{ orderId }` — sends reminder for a specific order
  - `{ daysAfterDelivery: 7 }` — batch-processes all delivered orders older than N days
- Validation: checks order exists, is DELIVERED, has no existing review, and no previous reminder sent
- Rate limit: checks for existing `REVIEW_REMINDER` notification with matching order number
- Creates both an email (via `sendReviewReminder`) and an in-app notification (type: `REVIEW_REMINDER`)
- Emits notification via socket service for real-time delivery
- Batch mode limited to 50 orders per request
- Returns `{ success, sent, skipped, totalEligible }` for batch mode

#### 3. Admin Orders Page (`src/components/marketplace/pages/admin/AdminOrders.tsx`)
- Added `Star`, `Loader2` icon imports and `toast` import
- Added `sendingReminders` state and `handleSendReviewReminders` function
- Added "Send Review Reminders" button in the header bar (next to status filter)
- Button calls `POST /api/reviews/reminder` with `{ daysAfterDelivery: 7 }`
- Shows loading spinner while sending, toast success/error on completion

#### 4. Seed Data (`prisma/seed.ts`)
- Added REVIEW_REMINDER notification sample for buyers[0]:
  ```typescript
  { user: buyers[0], type: "REVIEW_REMINDER", title: "Leave a Review", message: "How was your recent order CM-DEMO001? Your feedback helps other buyers!", link: "orders" }
  ```

## Files Created
- `src/app/api/auth/social-callback/route.ts`
- `src/app/api/reviews/reminder/route.ts`

## Files Modified
- `src/app/api/auth/[...nextauth]/route.ts` — Added Google/Facebook OAuth providers + callbacks
- `src/middleware.ts` — Added social-callback to public routes
- `src/components/marketplace/AuthModal.tsx` — Added social login UI buttons
- `src/components/marketplace/pages/auth/ForgotPasswordPage.tsx` — Added social login buttons
- `src/components/marketplace/MarketplaceApp.tsx` — Added OAuth callback detection + JWT bridging
- `src/lib/email.ts` — Added `sendReviewReminder` function
- `src/components/marketplace/pages/admin/AdminOrders.tsx` — Added "Send Review Reminders" button
- `src/lib/locales/en.json` — Added social login i18n keys
- `src/lib/locales/fr.json` — Added social login i18n keys (French)
- `prisma/seed.ts` — Added REVIEW_REMINDER notification sample
- `.env.example` — Added Google + Facebook OAuth env vars

## Notes
- ESLint passes with no errors
- Social login flow: UI → NextAuth OAuth redirect → Google/Facebook → callback URL `/?social=1` → MarketplaceApp detects → calls `/api/auth/social-callback` → sets JWT cookie + Zustand state → cleans URL
- Review reminders respect rate limit of 1 per order (tracked via notification records)
- All new code follows existing patterns: dark theme classes, shadcn/ui components, toast notifications, server-side auth guards
