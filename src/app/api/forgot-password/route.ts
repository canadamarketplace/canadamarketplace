import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 },
      )
    }

    // Look up user — always succeed even if not found (prevent email enumeration)
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (user) {
      // Generate a random token
      const rawToken = crypto.randomBytes(32).toString('hex')
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
      const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken: tokenHash,
          resetTokenExpiry: expiry,
        },
      })

      // Build the reset URL (raw token, not the hash)
      const resetUrl = `${SITE_URL}/reset-password?token=${rawToken}`

      // Fire-and-forget email send
      sendPasswordResetEmail(
        { name: user.name, email: user.email },
        resetUrl,
      ).catch((err) => console.error('Failed to send reset email:', err))
    }

    // Always return the same response regardless of whether user exists
    return NextResponse.json({
      message: 'If an account exists, a reset link has been sent.',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Forgot password error:', message)
    // Still return generic message to prevent enumeration
    return NextResponse.json({
      message: 'If an account exists, a reset link has been sent.',
    })
  }
}
