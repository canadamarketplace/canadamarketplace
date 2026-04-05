import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { ensureDatabaseSeeded } from "@/lib/auto-seed"

const JWT_SECRET = process.env.JWT_SECRET || "canada-marketplace-secret-key-2024"
const JWT_EXPIRY = "7d"

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Ensure database is seeded (handles fresh PostgreSQL databases)
    await ensureDatabaseSeeded()

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
