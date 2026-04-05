import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { useAuth } from '@/lib/store'

const JWT_SECRET = process.env.JWT_SECRET || 'canada-marketplace-secret-key-2024'

// JWT payload shape
export interface JwtUserPayload {
  userId: string
  email: string
  role: string
  name: string
}

// Verify a JWT token and return its payload, or null if invalid
export function verifyToken(token: string): JwtUserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload
    return decoded
  } catch {
    return null
  }
}

// Client-side auth guard hook
export function useRequireAuth(requiredRole?: string) {
  const { user } = useAuth()
  
  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isSeller: user?.role === 'SELLER',
    isBuyer: user?.role === 'BUYER',
    hasRole: user?.role === requiredRole || user?.role === 'ADMIN', // Admin has access to everything
  }
}

// Check if user is authenticated (server-side)
// This is called from API route handlers — at this point the middleware has already
// injected x-user-id and x-user-role headers from the JWT cookie.
export async function requireAuth(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const userRole = req.headers.get('x-user-role')

    if (userId && userRole && userId !== '') {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (user) {
        return { user: { ...user, password: undefined } }
      }
    }

    return null
  } catch (error) {
    return null
  }
}

// Require specific role (server-side)
export async function requireRole(req: NextRequest, roles: string[]) {
  const auth = await requireAuth(req)
  if (!auth) return null
  if (!roles.includes(auth.user.role)) return null
  return auth
}

// Public route helper (still extracts user if available, but doesn't require it)
export async function optionalAuth(req: NextRequest) {
  return await requireAuth(req) // Returns null if no auth, user object if authenticated
}
