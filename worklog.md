---
Task ID: 1
Agent: Main Agent
Task: Migrate from SQLite to PostgreSQL for Vercel production + auto-seed + role-based routes

Work Log:
- Analyzed the root cause: SQLite on Vercel serverless is ephemeral — database resets on every cold start
- Changed Prisma schema provider from "sqlite" to "postgresql"
- Created comprehensive auto-seed module (src/lib/auto-seed.ts) that seeds all demo data: 8 categories, 13 provinces, 1 admin, 8 sellers with stores, 5 buyers, 28 products with variants, 15 orders, 20 reviews, disputes, payouts, conversations, messages, notifications, 6 coupons, 8 site settings
- Created /api/setup endpoint (src/app/api/setup/route.ts) that triggers auto-seed on first request
- Updated MarketplaceApp.tsx to call /api/setup on mount
- Updated login route to use shared auto-seed module
- Added /api/setup to middleware public routes
- Reduced Prisma query logging in production
- Updated vercel-build script for PostgreSQL schema sync
- Verified role-based routes already exist: /admin/*, /seller/*, /buyer routes (orders, cart, checkout, etc.)

Stage Summary:
- Pushed commit 07bb7b8 to GitHub
- Vercel will auto-deploy from this push
- User needs to: 1) Create Vercel Postgres database, 2) Set DATABASE_URL env var, 3) Redeploy
- All demo accounts (admin, sellers, buyers) will be auto-created on first app visit
