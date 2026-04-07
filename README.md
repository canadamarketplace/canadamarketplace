# Canada Marketplace

Canada's trusted online multi-vendor marketplace — buy and sell safely across all 13 provinces and territories. Built with modern web technologies for performance, security, and scalability.

**Live Site:** [https://www.canadamarketplace.ca](https://www.canadamarketplace.ca)

---

## Features

### For Buyers
- Browse and search products across all Canadian provinces
- Filter by category, province, price range, condition, and seller
- Shopping cart with per-vendor order splitting
- Secure checkout with Stripe payment integration
- Order tracking with real-time status updates (Pending → Paid → Shipped → Delivered)
- Product reviews and ratings system
- Buyer-seller messaging system
- Dispute resolution and refund requests
- Coupon code support (percentage and fixed discounts)
- Wishlist/favorites functionality
- Seller store locator with interactive map (Leaflet)
- Responsive design — works on desktop, tablet, and mobile

### For Sellers
- Seller dashboard with sales analytics and revenue charts
- Product management — create, edit, duplicate, and list products
- Product variants support (size, colour, etc.) with stock tracking
- Order management with status updates and shipping details
- Payout tracking and history
- Store profile customization (logo, description, social links)
- Vacation mode toggle
- Buyer messaging and conversation management
- Review responses
- Low stock alerts
- SEO-optimized product listings with custom slugs

### For Administrators
- Full admin dashboard with key metrics and analytics
- Seller approval workflow and moderation
- Product moderation — approve, reject, or feature listings
- Bulk operations — mass delete, approve, and assign
- User management with role-based access control
- Order and dispute management
- Site settings persistence (marketplace fees, dispute windows, payout speed)
- Coupon management with usage tracking
- Province and category management
- Shipping carrier configuration
- Financial reports and payout oversight

### Platform Features
- Multi-language support (English/French) with next-intl
- SEO optimized — dynamic metadata, JSON-LD structured data, sitemap, robots.txt
- Server-side rendering (SSR) for fast initial page loads
- Real-time notifications system
- Progressive Web App (PWA) with service worker and manifest
- Dark/light theme toggle with next-themes
- Animated UI with Framer Motion
- Responsive design with Tailwind CSS v4

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Frontend** | React 19, Tailwind CSS v4, shadcn/ui |
| **State Management** | Zustand |
| **Database** | PostgreSQL (Neon via Vercel Postgres) |
| **ORM** | Prisma 6 |
| **Authentication** | NextAuth.js |
| **Payments** | Stripe |
| **Maps** | Leaflet / React-Leaflet |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod |
| **Email** | Nodemailer |
| **Real-time** | Socket.IO Client |
| **Animations** | Framer Motion |
| **Internationalization** | next-intl |
| **Hosting** | Vercel |
| **Image Processing** | Sharp |
| **AI Integration** | z-ai-web-dev-sdk |

---

## Project Structure

```
canadamarketplace/
├── prisma/
│   ├── schema.prisma          # Database schema (30+ models)
│   ├── seed.ts                # Standalone seed script
│   └── migrations/            # Database migrations
├── public/
│   ├── logo.png               # Marketplace logo
│   ├── logo-wide.png          # Wide logo (navbar/footer)
│   ├── logo-square.png        # Square logo (auth modals)
│   ├── icon.png               # Favicon / PWA icon
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── products/              # Product images
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── page.tsx           # Homepage
│   │   ├── layout.tsx         # Root layout with metadata
│   │   ├── globals.css        # Global styles
│   │   ├── products/          # Product listing & detail pages
│   │   ├── category/          # Category browsing pages
│   │   ├── orders/            # Buyer orders page
│   │   ├── profile/           # User profile & settings
│   │   ├── stores/            # Store pages
│   │   ├── seller-locator/    # Interactive seller map
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── seller/            # Seller dashboard pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── products/      # Product CRUD
│   │   │   ├── orders/        # Order management
│   │   │   ├── stores/        # Store endpoints
│   │   │   ├── admin/         # Admin API endpoints
│   │   │   ├── setup/         # Database setup & seed
│   │   │   └── ...
│   │   ├── sitemap.ts         # Dynamic sitemap generator
│   │   └── robots.ts          # Robots.txt configuration
│   ├── components/
│   │   ├── ui/                # shadcn/ui base components
│   │   └── marketplace/       # Custom marketplace components
│   │       ├── Navbar.tsx     # Main navigation bar
│   │       ├── Footer.tsx     # Site footer
│   │       ├── AuthModal.tsx  # Login/Register modal
│   │       ├── ProductCard.tsx
│   │       ├── CartDrawer.tsx
│   │       ├── SearchBar.tsx
│   │       └── ...
│   ├── hooks/                 # Custom React hooks
│   │   └── useSEO.ts          # Dynamic SEO metadata hook
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── stripe.ts          # Stripe client setup
│   │   ├── email.ts           # Email templates & sender
│   │   ├── structured-data.ts # JSON-LD schemas
│   │   ├── constants.ts       # App constants
│   │   └── auto-seed.ts       # Runtime auto-seed logic
│   └── store/                 # Zustand state stores
│       ├── authStore.ts       # Authentication state
│       ├── cartStore.ts       # Shopping cart state
│       └── ...
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or use Vercel Postgres)
- Stripe account (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/canadamarketplace/canadamarketplace.git
cd canadamarketplace

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL, Stripe keys, etc.

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# (Optional) Seed with demo data
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
# Database (prefix STORAGE_ for Vercel Postgres)
STORAGE_DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-password

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Database Schema

The application uses **30+ Prisma models** including:

- **User** — Admin, Seller, and Buyer roles with verification
- **Store** — Seller storefronts with ratings, social links, vacation mode
- **Product** — Full product listings with images, variants, SEO slugs
- **ProductVariant** — Size, colour, and other product options
- **Order / OrderItem** — Per-vendor order splitting
- **Cart / CartItem** — Shopping cart with variant support
- **Review** — Product ratings and reviews
- **Dispute** — Buyer-seller dispute resolution
- **Conversation / Message** — Real-time messaging
- **Notification** — User notifications (orders, messages, payouts)
- **Coupon / AppliedCoupon** — Discount codes
- **Payout** — Seller payment tracking
- **Category / Province** — Marketplace taxonomy
- **SiteSetting** — Persistent admin settings
- **Report** — User and product reporting

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@canadamarketplace.ca | Admin123! |
| Seller | sarah@techshop.ca | Seller123! |
| Seller | jp@montrealfashion.ca | Seller123! |
| Seller | mike@homegear.ca | Seller123! |
| Seller | emily@sportsplus.ca | Seller123! |
| Seller | david@canread.ca | Seller123! |
| Buyer | alex@gmail.com | Buyer123! |
| Buyer | marie@hotmail.com | Buyer123! |

---

## API Endpoints

### Setup & Seed
- `GET /api/setup` — Auto-seed database on first request
- `GET /api/setup?force=true` — Force reseed (clears all data)

### Authentication
- `POST /api/auth/signup` — Register new account
- `POST /api/auth/signin` — Login
- `POST /api/auth/signout` — Logout
- `GET /api/auth/session` — Get current session

### Products
- `GET /api/products` — List products (with filters)
- `POST /api/products` — Create product (seller)
- `GET /api/products/[id]` — Get product details
- `PUT /api/products/[id]` — Update product
- `DELETE /api/products/[id]` — Delete product

### Orders
- `GET /api/orders` — List user orders
- `POST /api/orders` — Create order
- `PATCH /api/orders/[id]/status` — Update order status
- `POST /api/orders/[id]/refund` — Process refund

### Stores
- `GET /api/stores` — List stores
- `GET /api/stores/[slug]` — Get store details
- `PUT /api/stores` — Update store profile

### Cart
- `GET /api/cart` — Get cart items
- `POST /api/cart` — Add to cart
- `DELETE /api/cart/[id]` — Remove from cart

### Admin
- `GET /api/admin/stats` — Dashboard statistics
- `GET /api/admin/users` — List all users
- `PATCH /api/admin/users/[id]` — Update user role/status
- `GET /api/admin/disputes` — List disputes
- `PATCH /api/admin/disputes/[id]` — Resolve dispute

---

## Deployment

The project is deployed on **Vercel** with automatic deployments from the `main` branch.

### Deploy Steps
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Vercel automatically builds and deploys
5. Run `GET https://yourdomain.com/api/setup?force=true` to seed the database

### Database Migrations
The project uses `prisma db push` in the Vercel build command for automatic schema synchronization. For production migrations, use Prisma Migrate.

---

## SEO

- **Dynamic metadata** via `useSEO` hook for every page
- **JSON-LD structured data** — Organization, Product, BreadcrumbList, FAQPage, LocalBusiness schemas
- **Dynamic sitemap** at `/sitemap.xml` with all products, categories, stores, and static pages
- **robots.txt** — Blocks admin/seller dashboards from indexing
- **Open Graph & Twitter cards** for social sharing
- **Semantic HTML** with proper heading hierarchy and landmarks
- **hreflang tags** for English/French language alternates

---

## License

Proprietary — Canada Marketplace. All rights reserved.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request
