import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "canada-marketplace-secret-key-2024"

// Routes that don't need auth check
const PUBLIC_PATHS = [
  "/_next",
  "/api",
  "/favicon.ico",
  "/robots.txt",
  "/logo.svg",
  "/logo.png",
  "/manifest.json",
  "/sw.js",
  "/icon.png",
  "/apple-icon.png",
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p))
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip auth for public/static paths
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Try to get JWT from Authorization header or cookie
  let token: string | null = null
  const authHeader = req.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7)
  }
  if (!token) {
    token = req.cookies.get("__cm_session")?.value || null
  }

  // If no token on protected routes, redirect to home
  if (!token) {
    if (pathname.startsWith("/admin/") || pathname.startsWith("/seller/")) {
      const url = req.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
    // For non-protected routes, just pass through without user headers
    return NextResponse.next()
  }

  // Verify JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      role: string
      email: string
    }

    // Create response with user headers for API routes
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-user-id", decoded.userId)
    requestHeaders.set("x-user-role", decoded.role)
    requestHeaders.set("x-user-email", decoded.email)

    // Check role-based access for admin/seller routes
    if (pathname.startsWith("/admin/") && decoded.role !== "ADMIN") {
      const url = req.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith("/seller/") && decoded.role !== "SELLER" && decoded.role !== "ADMIN") {
      const url = req.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch {
    // Invalid token
    if (pathname.startsWith("/admin/") || pathname.startsWith("/seller/")) {
      const url = req.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
}
