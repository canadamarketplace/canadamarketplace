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
