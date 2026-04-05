import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "canada-marketplace-secret-key-2024"
const JWT_EXPIRY = "7d"

// Demo account credentials
const DEMO_ACCOUNTS = [
  { email: "admin@canadamarketplace.ca", password: "Admin123!", name: "Admin User", role: "ADMIN" as const, province: "Ontario", city: "Ottawa", storeName: null, storeSlug: null },
  { email: "sarah@techshop.ca", password: "Seller123!", name: "Sarah Mitchell", role: "SELLER" as const, province: "BC", city: "Vancouver", storeName: "TechHub Canada", storeSlug: "techhub-canada" },
  { email: "jp@montrealfashion.ca", password: "Seller123!", name: "Jean-Pierre Beaumont", role: "SELLER" as const, province: "QC", city: "Montr\u00e9al", storeName: "Style Qu\u00e9bec", storeSlug: "style-quebec" },
  { email: "mike@homegear.ca", password: "Seller123!", name: "Mike Thompson", role: "SELLER" as const, province: "ON", city: "Toronto", storeName: "Maple Home Living", storeSlug: "maple-home-living" },
  { email: "emily@sportsplus.ca", password: "Seller123!", name: "Emily Chen", role: "SELLER" as const, province: "AB", city: "Calgary", storeName: "Great White North Sports", storeSlug: "great-white-north-sports" },
  { email: "alex@gmail.com", password: "Buyer123!", name: "Alex Johnson", role: "BUYER" as const, province: "ON", city: "Toronto", storeName: null, storeSlug: null },
  { email: "marie@hotmail.com", password: "Buyer123!", name: "Marie Tremblay", role: "BUYER" as const, province: "QC", city: "Qu\u00e9bec City", storeName: null, storeSlug: null },
  { email: "chris@outlook.com", password: "Buyer123!", name: "Chris Brown", role: "BUYER" as const, province: "AB", city: "Edmonton", storeName: null, storeSlug: null },
  { email: "priya@gmail.com", password: "Buyer123!", name: "Priya Patel", role: "BUYER" as const, province: "BC", city: "Surrey", storeName: null, storeSlug: null },
  { email: "tom@yahoo.ca", password: "Buyer123!", name: "Tom Harris", role: "BUYER" as const, province: "MB", city: "Winnipeg", storeName: null, storeSlug: null },
]

function createJwtToken(payload: { userId: string; email: string; role: string; name: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY })
}

function createAuthResponse(userData: Record<string, unknown>) {
  const token = createJwtToken({
    userId: userData.id as string,
    email: userData.email as string,
    role: userData.role as string,
    name: userData.name as string,
  })

  const response = NextResponse.json(userData)

  // Set httpOnly cookie with JWT token
  response.cookies.set("cm-auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return response
}

// Auto-seed demo accounts if they don't exist in the database
async function ensureDemoAccounts() {
  const userCount = await db.user.count()
  if (userCount === 0) {
    console.log("\uD83D\uDC33 Auto-seeding demo accounts...")
    for (const demo of DEMO_ACCOUNTS) {
      const hashedPassword = await bcrypt.hash(demo.password, 12)
      const storeData = demo.storeName ? {
        store: {
          create: {
            name: demo.storeName!,
            slug: demo.storeSlug!,
            description: `Welcome to ${demo.storeName}! Verified Canadian seller.`,
            rating: 4.5,
            totalSales: Math.floor(Math.random() * 200) + 50,
          },
        },
      } : {}
      await db.user.create({
        data: {
          email: demo.email,
          password: hashedPassword,
          name: demo.name,
          role: demo.role,
          isVerified: true,
          province: demo.province,
          city: demo.city,
          ...storeData,
        },
      })
    }
    console.log(`\u2705 ${DEMO_ACCOUNTS.length} demo accounts created`)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Auto-seed demo accounts if database is empty
    await ensureDemoAccounts()

    // Check database for the user
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { store: { select: { id: true, name: true, slug: true } } },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account is deactivated" }, { status: 403 })
    }

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      phone: user.phone,
      province: user.province,
      city: user.city,
      address: user.address,
      postalCode: user.postalCode,
      bio: user.bio,
      storeId: user.store?.id || null,
      storeName: user.store?.name || null,
      storeSlug: user.store?.slug || null,
    }

    return createAuthResponse(userData)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message || "Login failed" }, { status: 500 })
  }
}
