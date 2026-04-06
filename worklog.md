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
