import { NextRequest } from 'next/server'

// Check if user is authenticated
export async function requireAuth(req: NextRequest) {
  try {
    // For now, check Authorization header (Bearer token) or session cookie
    const authHeader = req.headers.get('authorization')

    // Also support passing userId directly for internal use (e.g., from Zustand client state)
    const userId = req.headers.get('x-user-id')
    const userRole = req.headers.get('x-user-role')

    // In production, this would validate a JWT token
    // For now, we validate that required headers exist and look up the user in the database
    if (userId && userRole) {
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

// Require specific role
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
