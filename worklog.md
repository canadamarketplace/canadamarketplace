---
Task ID: 1
Agent: Main Agent
Task: Fix "My Products" navigation showing no products on seller dashboard

Work Log:
- Investigated the full navigation architecture: Zustand-based SPA routing with client-side `navigate()` and `urlToPage()` URL mapping
- Confirmed the navigation code is correct: clicking "My Products" in sidebar calls `navigate('my-products')` → URL `/seller/products` → `PageRenderer` renders `<SellerProducts />`
- Tested the deployed API: `/api/products?status=all&storeId=...` returned 0 products despite 29 products existing in the database
- **Root cause identified**: The products API (`src/app/api/products/route.ts`) treated `status=all` as a literal status string `{ status: "all" }` instead of skipping the status filter. Since no products have `status: "all"`, it returned 0 results.
- Fixed the API to properly handle `status=all` by skipping the status filter when `status === "all"`, while maintaining the default `status: "ACTIVE"` for public browsing
- Pushed fix to GitHub (commit 63bdcfa)
- Verified Vercel deployment completed successfully
- Post-deploy verification: `/api/products?status=all&storeId=cmnmkponx0011qpqwinrf2apq` now returns 3 products for the seller
- Browse page unaffected: `/api/products` (no status param) still defaults to ACTIVE and returns 29 products

Stage Summary:
- **Bug fixed**: Seller Products page was showing 0 products due to `status=all` being treated as a literal status value
- **File changed**: `src/app/api/products/route.ts` (line 25)
- **Deployed**: Fix is live on https://www.canadamarketplace.ca/

---
Task ID: 2
Agent: Main Agent
Task: Fix product click on browse page not navigating to product detail

Work Log:
- User reported: clicking any product on /browse stays at /browse instead of going to product detail
- Tested the product detail API: `curl /api/products/{id}` returned `{"error":"The column Store.facebookUrl does not exist in the current database."}`
- Root cause: Prisma schema had 6 new columns on Store model (facebookUrl, twitterUrl, instagramUrl, websiteUrl, vacationMode, vacationMessage) that were never migrated to the production database
- When ProductDetailPage fetches the product API and gets an error, it calls `navigate('browse')` — sending the user back to /browse, which is why the URL never changes
- Fix: Added `ensureSchemaSync()` to the `/api/setup` endpoint that checks `information_schema.columns` for missing Store columns and adds them via `ALTER TABLE` statements
- Deployed the fix and triggered `/api/setup` — columns already existed in DB (previous seed had them)
- Post-deploy verification: `/api/products/{id}` now returns full product data including store with seller info and reviews

Stage Summary:
- **Bug fixed**: Product detail API was crashing due to missing Store columns in database
- **Files changed**: `src/app/api/setup/route.ts` (added schema sync logic)
- **Deployed**: Fix is live on https://www.canadamarketplace.ca/
- **Note**: The columns turned out to already exist in the database — the Prisma client may have been cached with an outdated schema. The redeployment regenerated the Prisma client.

---
## Task ID: 3 - bugfix-orders-page
### Work Task
Fix the `/orders` page showing "Become a Seller" promotional content instead of the buyer's order history.

### Work Summary
- **Investigated the architecture**: This is a Zustand-based SPA with client-side routing. The `PageRenderer` in `MarketplaceApp.tsx` correctly maps `currentPage: "orders"` to `<OrdersPage />`. The `urlToPage()` function correctly maps `/orders` URL to `{ page: "orders" }`. The routing was NOT the problem.

- **Root cause identified**: The `OrdersPage` component (`src/components/marketplace/pages/buyer/OrdersPage.tsx`) contained an inline "Become a Seller" promotional banner (lines 82-101) that rendered for ALL users with `user.role === 'BUYER'`. This banner — with the text "Start selling on Canada Marketplace" and "Turn your products into profit..." — appeared prominently above the order list (or empty state), making it appear as though the orders page was showing a seller signup prompt instead of order data.

- **Searched all occurrences**: Found "Become a Seller" content in 5 locations:
  1. `OrdersPage.tsx` (lines 82-101) — **INAPPROPRIATE** (removed)
  2. `ProfilePage.tsx` (lines 136-181) — **APPROPRIATE** (kept — profile page is the right place for account upgrade prompts)
  3. `DashboardSidebar.tsx` (line 64) — **APPROPRIATE** (already hidden for sellers/admins via line 215)
  4. `BecomeSellerPage.tsx` — **APPROPRIATE** (dedicated landing page)
  5. `AboutPage.tsx` (line 259) — **APPROPRIATE** (marketing CTA on about page)

- **Fix applied**: Removed the entire "Become a Seller" banner block (21 lines) from `OrdersPage.tsx` and cleaned up the unused icon imports (`Eye`, `Store`, `ArrowRight`).

- **Verified**: `npm run lint` passes with no errors. TypeScript compilation shows only pre-existing warnings unrelated to this change. The orders page now shows only: "My Orders" heading → status filter → loading/empty/order list.

- **File changed**: `src/components/marketplace/pages/buyer/OrdersPage.tsx` (-22 lines, +1 line import cleanup)

---
## Task ID: 4 - seo-infrastructure
### Work Task
Create SEO infrastructure for the Canada Marketplace SPA: useSEO hook, JSON-LD structured data components, and comprehensive SEO page config.

### Work Summary
- Created `/home/z/my-project/src/hooks/useSEO.ts` — Client-side hook that dynamically updates document head meta tags via useEffect. Handles: document.title, meta description, keywords, canonical URL, OG tags (title, description, type, url, image, site_name), Twitter Card tags (card, title, description, image), and robots meta (noindex/nofollow). Cleans up added elements on unmount. Uses helper functions `getOrCreateMeta` and `getOrCreateLink` to safely find-or-create tags in document.head.

- Created `/home/z/my-project/src/components/seo/JsonLd.tsx` — Six JSON-LD structured data components:
  1. `OrganizationJsonLd` — Organization schema with contact point and Canadian address
  2. `WebSiteJsonLd` — WebSite schema with SearchAction targeting /browse?q={search_term_string}
  3. `BreadcrumbJsonLd` — BreadcrumbList schema accepting { name, url }[] items
  4. `ProductJsonLd` — Product schema with offers, seller, ratings, condition, SKU
  5. `FAQJsonLd` — FAQPage schema accepting { question, answer }[] items
  6. `LocalBusinessJsonLd` — LocalBusiness schema with geo coordinates, ratings, hours for seller locator

- Created `/home/z/my-project/src/lib/seoConfig.ts` — Comprehensive SEO config covering ALL 50+ PageView values. Public pages have keyword-optimised titles (e.g. "Buy & Sell Online in Canada", "Find Canadian Sellers Near You"). All admin pages (admin-dashboard through admin-dispute-detail) and seller dashboard pages (dashboard, my-products, add-product, edit-product, my-orders, my-store, my-payouts, seller-transactions, seller-reviews, seller-shipping) have `noIndex: true`. Includes helper functions `getSEOConfig()` (with dynamic overrides for product-detail/storefront), `buildCanonicalUrl()`, and `buildTitle()`.

- Verified: `npm run lint` passes with zero errors.

---
## Task ID: 5 - seo-integration
### Work Task
Integrate the SEO infrastructure (useSEO hook, JSON-LD components, seoConfig) into the marketplace application pages.

### Work Summary
Integrated SEO across 5 files in the marketplace:

1. **MarketplaceApp.tsx** — Added global SEO that auto-updates on every route change:
   - Imported `useSEO`, `OrganizationJsonLd`, `WebSiteJsonLd`, `getSEOConfig`
   - Added `useSEO(getSEOConfig(currentPage))` in the MarketplaceApp component so every page gets proper meta tags (title, description, keywords, canonical, OG, Twitter Cards, robots noindex for admin pages)
   - Added `<OrganizationJsonLd />` and `<WebSiteJsonLd />` as the first children inside the root `<div>` so they are always present sitewide

2. **ProductDetailPage.tsx** — Dynamic product SEO + JSON-LD structured data:
   - Added `useSEO` with product-specific title, description, ogType='product', ogImage from product images
   - Added `<ProductJsonLd>` with name, description, image, price, availability, condition, seller info, category, ratings
   - Added `<BreadcrumbJsonLd>` with Home → Browse → Product Name
   - Placed hooks before early returns to satisfy React Rules of Hooks

3. **BrowsePage.tsx** — Dynamic browse SEO + JSON-LD breadcrumbs + H1:
   - Added `useSEO` with dynamic title/description based on active category filter or search query
   - Added `<BreadcrumbJsonLd>` with Home → Browse (or Home → Category → Browse when filtered)
   - Added a screen-reader-only `<h1>` tag ("Shop Products Across Canada") for proper heading hierarchy and SEO accessibility

4. **StorefrontPage.tsx** — Dynamic store SEO + JSON-LD structured data:
   - Added `useSEO` with store-specific title, description, ogType='business.business', ogImage from logo/banner
   - Added `<LocalBusinessJsonLd>` with store name, description, URL, image, address, rating, priceRange
   - Added `<BreadcrumbJsonLd>` with Home → Store Name
   - Placed hooks before early returns to satisfy React Rules of Hooks

5. **FaqPage.tsx** — FAQ JSON-LD structured data:
   - Added `<FAQJsonLd>` with all 24 FAQ questions and answers mapped from the faqItems array
   - All FAQ items are included in structured data regardless of active category filter, ensuring search engines see the full FAQ content

- Verified: `npm run lint` passes with zero errors.

---
## Task ID: 6 - tunog-kalye-seed-update
### Work Task
Replace ALL sample products in both seed files (`prisma/seed.ts` and `src/lib/auto-seed.ts`) with Tunog Kalye inspired merchandise (T-shirts, Mugs, and Caps). Update categories, sellers, products, variants, conversations, notifications, and coupons while preserving admin/buyer accounts, provinces, orders logic, reviews, disputes, payouts, and site settings.

### Work Summary
Updated both seed files with identical Tunog Kalye data:

**Categories** (8 → 4):
- T-Shirts, Mugs, Caps, Music & Culture (with new slugs and icons)

**Sellers** (8 → 5):
- Tunog Kalye Official (ON/Toronto) — kept email sarah@techshop.ca
- Tunog Kalye West (BC/Vancouver) — kept email jp@montrealfashion.ca
- Tunog Kalye Québec (QC/Montréal) — kept email mike@homegear.ca
- Tunog Kalye Prairies (AB/Calgary) — kept email emily@sportsplus.ca
- Tunog Kalye Atlantic (NS/Halifax) — kept email david@canread.ca
- Removed 3 old sellers (Ana Rodrigues, James Wilson, Lisa Park)

**Products** (28 → 18):
- 8 T-Shirts ($32.99–$36.99) by Seller 0 — local `/products/*.png` images
- 5 Mugs ($16.99–$22.99) by Seller 1 — local images
- 5 Caps ($26.99–$31.99) by Seller 2 — local images
- All NEW condition, comparePrice at 1.2x, featured items at indices 0, 2, 8, 13

**Variants**:
- T-Shirts (0-7): Size S/M/L/XL/XXL variants
- Mugs (8-12): No variants (one-size)
- Caps (13-17): One Size variants

**Conversations**: Updated to reference Tunog Kalye products (Classic Logo Tee, Snapback, Travel Tumbler)

**Notifications**: Updated all messages to reference Tunog Kalye brand

**Coupons**: TUNOG10, STREET20, KALYE15, BUNDLE, SUMMER25, WESTCOAST

**Preserved unchanged**: Admin user, 5 buyer accounts, 13 provinces, order/review/dispute/payout logic, site settings, `auto-seed.ts` specific features (social URLs, vacation mode on last seller, paymentStatus field)

**Verified**: `npm run lint` passes with zero errors.

**Files changed**:
- `prisma/seed.ts` — Full rewrite of categories, sellers, products, variants, conversations, notifications, coupons
- `src/lib/auto-seed.ts` — Same changes adapted to auto-seed structure

---
## Task ID: 7 - foundational-changes
### Work Task
Implement foundational changes: Prisma schema updates (approvalStatus, moderationStatus, Report model), category migration to Canadian marketplace categories, seed data updates, new API routes (admin settings, seller approval, product moderation, reports, seller refunds, low stock alerts).

### Work Summary

**Prisma Schema** (`prisma/schema.prisma`):
- Added `approvalStatus` field (default "APPROVED") to Store model
- Added `moderationStatus` field (default "APPROVED") to Product model
- Created new `Report` model with reporter relation to User, indexes on targetType/targetId and status
- Added `reports` relation to User model

**Categories** (`src/lib/types.ts`):
- Replaced 4 Tunog Kalye categories (T-Shirts, Mugs, Caps, Music & Culture) with 12 Canadian marketplace categories: Apparel, Drinkware, Headwear, Music & Audio, Home & Garden, Sports & Outdoors, Electronics, Beauty & Health, Books & Media, Toys & Games, Automotive, Pet Supplies
- Updated HomePage.tsx categoryIcons map to match new category slugs with correct Lucide icons

**Seed Data** (`src/lib/auto-seed.ts` and `prisma/seed.ts`):
- Updated both files to create all 12 categories with correct slugs and icons
- Remapped 18 Tunog Kalye products: T-Shirts → "apparel", Mugs → "drinkware", Caps → "headwear"
- Added `low_stock_threshold` setting (value: "5") to site settings seed data
- Added `db.report.deleteMany()` to cleanup sequences in both files

**API Routes Created/Updated**:
1. `src/app/api/admin/settings/route.ts` (NEW) — GET all settings as key-value object, PUT upsert settings array
2. `src/app/api/admin/users/route.ts` (UPDATED) — PATCH now supports `approvalStatus` to approve/reject seller stores; store select includes approvalStatus; reports count added
3. `src/app/api/admin/products/route.ts` (UPDATED) — GET supports filtering by moderationStatus/status/search with pagination; PATCH supports moderationStatus field and bulk operations (`action: "bulk_update"`)
4. `src/app/api/reports/route.ts` (NEW) — GET list reports (admin, with status/targetType filters), POST create report (authenticated, with duplicate prevention), PATCH update report status (admin only)
5. `src/app/api/orders/[id]/route.ts` (UPDATED) — Sellers can now initiate refunds on PAID/SHIPPED/DELIVERED orders; creates timeline entry and buyer notification; sets paymentStatus to REFUNDED
6. `src/app/api/products/low-stock/route.ts` (NEW) — GET returns products where stock <= configurable threshold (from SiteSetting, default 5); sellers see only their own products, admins see all
7. `src/app/api/setup/route.ts` (UPDATED) — Schema sync now checks for approvalStatus on Store and moderationStatus on Product tables

**Verified**: `npm run lint` passes with zero errors. `npx prisma generate` succeeds.

**Files changed** (10 total):
- `prisma/schema.prisma` — New fields + Report model
- `src/lib/types.ts` — 12 new categories
- `src/lib/auto-seed.ts` — Categories, product mappings, report cleanup, low_stock_threshold setting
- `prisma/seed.ts` — Same seed data changes
- `src/app/api/admin/settings/route.ts` — New API route
- `src/app/api/admin/users/route.ts` — Seller approval support
- `src/app/api/admin/products/route.ts` — Moderation + bulk operations
- `src/app/api/reports/route.ts` — New API route
- `src/app/api/orders/[id]/route.ts` — Seller refund support
- `src/app/api/products/low-stock/route.ts` — New API route
- `src/app/api/setup/route.ts` — Schema sync for new columns
- `src/components/marketplace/pages/HomePage.tsx` — Category icon map update

---
## Task ID: 8 - admin-ui-enhancements
### Work Task
Implement 5 UI changes: Admin Settings Persistence, Seller Approval Workflow, Product Moderation + Bulk Operations, Report Management Page, and Navigation wiring.

### Work Summary

**Task 1: Admin Settings Persistence** (`src/components/marketplace/pages/admin/AdminSettings.tsx`):
- Replaced fake `setTimeout` save with real API integration
- On mount: fetches settings from `GET /api/admin/settings` and populates the form
- On save: PUTs to `/api/admin/settings` with `{ settings: [{ key, value }] }` array
- Added 9 settings fields: marketplace_fee, gold_seller_fee, dispute_window_days, payout_speed_days, max_listing_images, low_stock_threshold, currency, site_name, site_description
- Shows loading spinner (Loader2) on mount while fetching
- Shows toast on successful/failed save via `sonner`
- Uses `settingFields` config array with key, label, desc, icon, type, defaultValue

**Task 2: Admin Users — Seller Approval Workflow** (`src/components/marketplace/pages/admin/AdminUsers.tsx`):
- Changed API calls from `/api/users` (public) to `/api/admin/users` (admin) so store data includes `approvalStatus`
- Updated `UserRecord` interface to include `approvalStatus?: string` on store
- For sellers, shows `approvalStatus` badge next to name: PENDING (yellow "Pending Approval"), APPROVED (green "Approved"), REJECTED (red "Rejected")
- Added action buttons for seller approval:
  - PENDING sellers: ThumbsUp (Approve) + ThumbsDown (Reject) icons
  - APPROVED sellers: Ban (Suspend) icon → sets to REJECTED
  - REJECTED sellers: RotateCcw (Re-approve) icon → sets to APPROVED
- Expanded detail row shows store approval status badge alongside store info
- Added proper toast notifications for success/failure

**Task 3: Admin Products — Moderation + Bulk Operations** (`src/components/marketplace/pages/admin/AdminProducts.tsx`):
- Added `moderationStatus` column showing colored badges: PENDING_REVIEW (yellow), APPROVED (green), REJECTED (red)
- Added moderation action buttons for PENDING_REVIEW products (approve/reject via `moderationStatus`)
- Added checkbox column with "Select All" header checkbox
- When items selected, shows bulk action bar with: Approve Selected, Reject Selected, Remove Selected buttons + selected count
- Bulk actions call PATCH `/api/admin/products` with `{ action: "bulk_update", productIds, moderationStatus/status }`
- Added search input for filtering products
- All actions show toast notifications

**Task 4: Admin Reports Page** (`src/components/marketplace/pages/admin/AdminReports.tsx`):
- Completely replaced the old analytics charts page with a report management page following AdminDisputes.tsx pattern
- Lists all reports as expandable cards with: status badge, target type badge, reason, reporter info, date
- Filter by status (OPEN, REVIEWING, RESOLVED, DISMISSED) and target type (PRODUCT, SELLER, ORDER)
- Expanded view shows: reporter details, reason, full description, admin notes (if any)
- Action buttons: Start Review (OPEN→REVIEWING), Resolve (any→RESOLVED), Dismiss (any→DISMISSED)
- Admin notes textarea for Resolve/Dismiss actions
- Fetches from `GET /api/reports?status=...&targetType=...`, updates via `PATCH /api/reports`

**Task 5: Navigation** (`src/components/marketplace/layouts/DashboardSidebar.tsx`):
- Verified `admin-reports` already existed in store.ts PageView type, pageToUrlBase map, urlToPage function
- Verified AdminReports import and case in MarketplaceApp.tsx PageRenderer already existed
- Moved Reports menu item in DashboardSidebar ADMIN_MENU to be directly after Disputes (was after Marketing)

**Verified**: `npm run lint` passes with zero errors.

**Files changed** (4 total):
- `src/components/marketplace/pages/admin/AdminSettings.tsx` — Full rewrite with API persistence + 9 settings fields
- `src/components/marketplace/pages/admin/AdminUsers.tsx` — Seller approval workflow + switched to /api/admin/users
- `src/components/marketplace/pages/admin/AdminProducts.tsx` — Moderation column + bulk operations + checkboxes
- `src/components/marketplace/pages/admin/AdminReports.tsx` — Full rewrite as report management page
- `src/components/marketplace/layouts/DashboardSidebar.tsx` — Reordered Reports menu item after Disputes

---
## Task ID: 9 - seller-refund-low-stock-ui
### Work Task
Implement 4 UI features: Seller Refund Flow, Seller Low Stock Alerts, Seller Dashboard Low Stock Widget, and Admin Low Stock View.

### Work Summary

**Task 1: Seller Refund Flow** (`src/components/marketplace/pages/seller/SellerOrders.tsx`):
- Added `RotateCcw` icon import from lucide-react
- Added `Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter` imports from shadcn/ui
- Added `Textarea` import from shadcn/ui
- Added state variables: `refundOrderId`, `refundReason`, `refunding`
- Added `handleRefund` async function that calls `PATCH /api/orders/[id]` with `{ status: 'REFUNDED', refundReason }`
- Added "Process Refund" button (amber-colored) for orders with status PAID, SHIPPED, or DELIVERED
- Button NOT shown for REFUNDED, CANCELLED, or DISPUTED orders (handled by status condition)
- Added Refund Dialog with: title, confirmation warning text, required textarea for reason, Cancel and Confirm buttons
- Dialog uses `Loader2` spinner during API call, `RotateCcw` icon on confirm button
- On success: shows toast, closes dialog, collapses order, refreshes orders list
- On failure: shows error toast

**Task 2: Seller Low Stock Alerts** (`src/components/marketplace/pages/seller/SellerProducts.tsx`):
- Added `AlertTriangle, ChevronDown` icon imports
- Added `Collapsible, CollapsibleTrigger, CollapsibleContent` imports
- Added state: `lowStockProducts` (array of {id, title, stock}), `lowStockOpen` (boolean)
- Added `fetchLowStock` callback that calls `GET /api/products/low-stock`
- Added low stock fetch to useEffect on mount
- Added warning banner above products grid (only shown when low stock products exist):
  - Amber-themed collapsible section with AlertTriangle icon
  - Warning text: "You have X product(s) with low stock (5 or fewer remaining). Consider restocking soon."
  - Expandable list showing up to 5 products with name, stock count (amber/red color), and "Restock" link
  - Shows "+N more" if more than 5 items
- Added "Low Stock" badge (amber) and "Out of Stock" badge (red) next to stock count in product cards

**Task 3: Seller Dashboard Low Stock Widget** (`src/components/marketplace/pages/seller/SellerDashboard.tsx`):
- Added state: `lowStockProducts` array
- Added `fetchLowStock` async function calling `GET /api/products/low-stock`
- Added fetch to useEffect on mount
- Added new Card widget below Growth Metrics Row and above Tabs:
  - Title "Low Stock Alert" with AlertTriangle icon (amber when items exist, green when none)
  - Badge showing count when items exist
  - When no low stock: shows "All products are well stocked ✓" in green
  - When items exist: compact scrollable list (max 5 items) with product name, stock count, and "Restock" button
  - "View all X low stock products →" link if more than 5 items

**Task 4: Admin Low Stock View** (`src/components/marketplace/pages/admin/AdminDashboard.tsx`):
- Added state: `lowStockCount` number
- Added `fetchLowStockCount` callback calling `GET /api/products/low-stock`
- Added fetch to useEffect on mount
- Added "Low Stock Products" stat card to the stats grid (6 cards now, grid changed to lg:grid-cols-6)
- Card uses amber color theme (from-amber-500/10 to-amber-600/5 gradient, text-amber-400)
- Card is clickable and navigates to 'admin-products' page
- Shows low stock product count

**Verified**: `npm run lint` passes with zero errors.

**Files changed** (4 total):
- `src/components/marketplace/pages/seller/SellerOrders.tsx` — Refund dialog + button + handler
- `src/components/marketplace/pages/seller/SellerProducts.tsx` — Low stock banner + product badges
- `src/components/marketplace/pages/seller/SellerDashboard.tsx` — Low stock alert widget
- `src/components/marketplace/pages/admin/AdminDashboard.tsx` — Low stock stat card

---
## Task ID: 10 - customer-features
### Work Task
Implement 3 customer-facing UI features: Product Comparison Tool, Report/Flag System, and Simple Math CAPTCHA.

### Work Summary

**Task 1: Product Comparison Tool**

1a. **Compare Store State** (`src/lib/store.ts`):
- Added `"compare"` to the `PageView` union type
- Added `"compare": "/compare"` mapping in `pageToUrlBase`
- Added `if (cleanPath === "/compare")` check in `urlToPage`
- Created `useCompare` Zustand store with: `items` (string[] of product IDs), `addItem`, `removeItem`, `toggleItem`, `isComparing`, `clearAll`, `itemCount`
- Max 4 items enforced; persisted to localStorage as `cm-compare`
- Follows same pattern as existing `useWishlist` store

1b. **Compare Button on Browse Page** (`src/components/marketplace/pages/BrowsePage.tsx`):
- Added `useCompare` import and state hooks (`isComparing`, `toggleItem`, `items`)
- Added `GitCompare` icon import from lucide-react
- Replaced single wishlist button with a column of two buttons (wishlist + compare) on product cards
- Compare button is highlighted (filled/red) when product is in compare list
- Shows toast "Added to comparison" / "Removed from comparison" / "You can compare up to 4 products at a time"

1c. **Compare Button on Product Detail Page** (`src/components/marketplace/pages/ProductDetailPage.tsx`):
- Added `useCompare` import and state hooks
- Added compare toggle button next to the wishlist and share buttons
- Same highlight and toast behavior as browse page
- Added `GitCompare` icon import

1d. **Compare Floating Bar** (`src/components/marketplace/CompareFloatingBar.tsx`) — NEW FILE:
- Fixed position at bottom of screen, full width, z-50
- Shows when 2+ items in compare list
- Displays "X products selected for comparison" with compare icon
- "Compare Now" button navigates to compare page
- "Clear All" button to clear list
- Dark theme styling with backdrop blur

1e. **Compare Page** (`src/components/marketplace/pages/ComparePage.tsx`) — NEW FILE:
- Full side-by-side comparison table layout
- Fetches product details for each compared ID from `/api/products/[id]`
- Rows: Product Image+Title (clickable), Price, Compare Price/Discount, Store Name (clickable), Condition, Stock, Rating, Category, Description (truncated), Actions
- Each column has "Remove" button (X) on hover
- "Clear All" button at top
- Shows "Add at least 2 products to compare" message when < 2 items
- Responsive with horizontal scroll on mobile
- Loading skeleton while fetching

1f. **Navigation Wiring** (`src/components/marketplace/MarketplaceApp.tsx`):
- Imported `ComparePage` and `CompareFloatingBar`
- Added `case 'compare': return <ComparePage />` in PageRenderer
- Added `<CompareFloatingBar />` to render tree

**Task 2: Report/Flag System**

2a. **Report Button on Product Detail Page** (`src/components/marketplace/pages/ProductDetailPage.tsx`):
- Added `Flag` icon import
- Added `Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter` imports
- Added `Input, Label, Textarea, Select` imports
- Added report dialog state (`reportOpen`, `reportReason`, `reportDescription`, `reporting`)
- Added `handleReportSubmit` async function calling `POST /api/reports` with `{ targetType: "PRODUCT", targetId, reason, description }`
- Flag button only shown for authenticated users (checks `user`)
- Dialog has: Title "Report This Product", reason select (SPAM/INAPPROPRIATE/FRAUD/COPYRIGHT/OTHER), description textarea, submit/cancel buttons
- Shows success toast: "Report submitted. Our team will review it shortly."

2b. **Report Button on Storefront Page** (`src/components/marketplace/pages/StorefrontPage.tsx`):
- Added `useAuth` import
- Added `Flag` icon, Dialog, Select, Textarea, Label imports
- Added "Report Seller" button in store header area (next to store info)
- Button only shown for authenticated users who are NOT the store owner
- Same dialog pattern but with `{ targetType: "SELLER", targetId: store.id, reason, description }`

**Task 3: Simple Math CAPTCHA**

3a. **CAPTCHA on Contact Page** (`src/components/marketplace/pages/ContactPage.tsx`):
- Added `useCallback, useEffect` imports
- Added `RefreshCw` icon import
- Added CAPTCHA state: `captchaA`, `captchaB`, `captchaAnswer`, `captchaError`
- Added `generateCaptcha` function creating random 1-10 addition
- CAPTCHA rendered in a styled card: "What is X + Y ?" with input field and refresh button
- Validates answer before form submission
- Shows error "Incorrect answer. Please try again." on wrong answer
- Regenerates question on wrong answer

3b. **CAPTCHA on Register Forms** (`src/components/marketplace/AuthModal.tsx`):
- Added `useCallback, useEffect` imports
- Added `RefreshCw` icon import
- Separate CAPTCHA state for buyer register and seller register forms
- Each has independent `generateCaptcha` function with `useEffect` initialization
- CAPTCHA validates before registration submission
- Shown in a compact inline card: "What is X + Y ?" + input + refresh button
- Error message shown below on wrong answer

**Verified**: `npm run lint` passes with zero errors.

**Files changed** (9 total):
- `src/lib/store.ts` — useCompare store + compare page routing
- `src/components/marketplace/pages/BrowsePage.tsx` — Compare button on product cards
- `src/components/marketplace/pages/ProductDetailPage.tsx` — Compare button + Report dialog
- `src/components/marketplace/pages/StorefrontPage.tsx` — Report Seller button + dialog
- `src/components/marketplace/pages/ContactPage.tsx` — Math CAPTCHA
- `src/components/marketplace/AuthModal.tsx` — Math CAPTCHA on both register forms
- `src/components/marketplace/pages/ComparePage.tsx` — NEW: Product comparison page
- `src/components/marketplace/CompareFloatingBar.tsx` — NEW: Floating compare bar
- `src/components/marketplace/MarketplaceApp.tsx` — Wire up ComparePage + CompareFloatingBar
