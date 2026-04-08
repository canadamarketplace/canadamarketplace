import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "canada-marketplace-secret-key-2024"
const JWT_EXPIRY = "7d"

function createJwtToken(payload: {
  userId: string
  email: string
  role: string
  name: string
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY })
}

/**
 * GET /api/auth/social-callback
 *
 * Called after a successful OAuth sign-in (Google/Facebook) via NextAuth.
 * Bridges the NextAuth session to our custom JWT cookie system.
 * The SPA detects ?social=1 in the URL and calls this endpoint.
 */
export async function GET(req: NextRequest) {
  try {
    // Get the NextAuth session (set by OAuth flow)
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No OAuth session found. Please sign in again." },
        { status: 401 }
      )
    }

    // Find the user in our database (created by the signIn callback)
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { store: { select: { id: true, name: true, slug: true } } },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User account not found. Please try again." },
        { status: 404 }
      )
    }

    // Build user data (same shape as /api/auth/login response)
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

    // Create our custom JWT token
    const token = createJwtToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })

    // Build response with user data and set JWT cookie
    const response = NextResponse.json(userData)

    response.cookies.set("cm-auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("Social callback error:", message)
    return NextResponse.json(
      { error: "Social login failed. Please try again." },
      { status: 500 }
    )
  }
}
