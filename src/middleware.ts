import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "canada-marketplace-secret-key-2024"

// JWT payload shape
interface JwtPayload {
  userId: string
  email: string
  role: string
  name: string
}

// Public API routes that don't require authentication
const PUBLIC_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/register-seller",
  "/api/auth/logout",
  "/api/auth/[...nextauth]",
  "/api/auth/social-callback",
  "/api/forgot-password",
  "/api/reset-password",
  "/api/products",
  "/api/stores",
  "/api/chat",
  "/api/upload",
  "/api/setup",
]

// Public route prefixes (wildcard matching)
const PUBLIC_PREFIXES = ["/api/webhooks/"]

function isPublicRoute(pathname: string): boolean {
  // Exact match
  if (PUBLIC_ROUTES.some((route) => pathname === route)) {
    return true
  }

  // Exact match with dynamic segments
  // /api/products/[id] → /api/products/anything
  if (/^\/api\/products\/[^/]+$/.test(pathname)) {
    return true
  }
  // /api/stores/[slug] → /api/stores/anything
  if (/^\/api\/stores\/[^/]+$/.test(pathname)) {
    return true
  }

  // Prefix match
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true
  }

  return false
}

function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    return decoded
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only intercept /api/* routes — let page routes pass through for SPA rewrites
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Allow public routes without auth check
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Try to read JWT from httpOnly cookie
  const token = request.cookies.get("cm-auth-token")?.value

  if (!token) {
    // No token present — let the request through to API routes
    // API routes handle missing auth via their own requireAuth/requireRole guards
    // But inject empty headers so downstream code doesn't crash
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", "")
    requestHeaders.set("x-user-role", "")
    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  // Verify the JWT token
  const payload = verifyToken(token)

  if (!payload) {
    // Token is invalid/expired — clear the cookie and continue without auth
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", "")
    requestHeaders.set("x-user-role", "")
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    })
    response.cookies.set("cm-auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })
    return response
  }

  // Valid token — inject userId and role as headers for downstream API routes
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-user-id", payload.userId)
  requestHeaders.set("x-user-role", payload.role)
  requestHeaders.set("x-user-email", payload.email)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

// Configure which routes the middleware runs on
export const config = {
  // Match all routes — middleware itself filters to only /api/* routes
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo|marker-icon|icon|apple-icon|robots.txt|sitemap.xml).*)"],
}
