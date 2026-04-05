import nodemailer from 'nodemailer'

// ──────────────────────────────────────────────
// Transport
// ──────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
})

const fromEmail = process.env.FROM_EMAIL || 'noreply@canadamarketplace.ca'
const fromName = process.env.FROM_NAME || 'Canada Marketplace'
const siteUrl = process.env.SITE_URL || 'https://www.canadamarketplace.ca'

type SendEmailParams = {
  to: string
  subject: string
  htmlBody: string
}

/**
 * Core email sender. In development (no SMTP vars configured) it logs to console
 * instead of throwing so the app stays functional.
 */
export async function sendEmail({ to, subject, htmlBody }: SendEmailParams) {
  const isConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)

  if (!isConfigured) {
    // ── Dev fallback: console logger ──
    console.log('📧 [Email Service – dev mode]')
    console.log(`   To:      ${to}`)
    console.log(`   Subject: ${subject}`)
    console.log(`   HTML:    ${htmlBody.slice(0, 200)}…`)
    return { success: true, devMode: true }
  }

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html: htmlBody,
    })
    return { success: true, messageId: info.messageId }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('❌ Email send failed:', message)
    return { success: false, error: message }
  }
}

// ──────────────────────────────────────────────
// Branded HTML wrapper
// ──────────────────────────────────────────────
function brandedHtml(innerHtml: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Canada Marketplace</title>
  <style>
    body { margin:0; padding:0; background:#0f0f0f; font-family:'Segoe UI',system-ui,-apple-system,sans-serif; }
    .wrapper { max-width:560px; margin:0 auto; padding:24px 16px; }
    .header { text-align:center; padding:32px 0 24px; }
    .logo-box { display:inline-flex; align-items:center; justify-content:center; width:52px; height:52px; border-radius:14px; background:linear-gradient(135deg,#dc2626,#d97706); margin-bottom:12px; }
    .logo-leaf { color:#fff; font-size:28px; }
    .brand { color:#f5f5f4; font-size:22px; font-weight:700; margin:0; }
    .tagline { color:#a8a29e; font-size:13px; margin:4px 0 0; }
    .card { background:#1c1c1e; border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:32px; margin-top:8px; }
    .card h1 { color:#f5f5f4; font-size:22px; font-weight:700; margin:0 0 12px; }
    .card p { color:#a8a29e; font-size:15px; line-height:1.65; margin:0 0 16px; }
    .card a { color:#f5f5f4; }
    .btn { display:inline-block; padding:13px 32px; border-radius:12px; background:linear-gradient(135deg,#dc2626,#b91c1c); color:#fff; text-decoration:none; font-weight:600; font-size:15px; margin:8px 0 4px; }
    .btn:hover { background:linear-gradient(135deg,#ef4444,#dc2626); }
    .divider { border:none; border-top:1px solid rgba(255,255,255,0.06); margin:24px 0; }
    .footer { text-align:center; padding:24px 0 8px; color:#57534e; font-size:12px; line-height:1.6; }
    .footer a { color:#78716c; text-decoration:underline; }
    .highlight { color:#f59e0b; font-weight:600; }
    .muted { color:#78716c; font-size:13px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo-box">🍁</div>
      <p class="brand">Canada Marketplace</p>
      <p class="tagline">Canada's Trusted Marketplace</p>
    </div>
    <div class="card">
      ${innerHtml}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Canada Marketplace. All rights reserved.</p>
      <p><a href="${siteUrl}">canadamarketplace.ca</a> · <a href="${siteUrl}/terms">Terms</a> · <a href="${siteUrl}/privacy">Privacy</a></p>
    </div>
  </div>
</body>
</html>`
}

// ──────────────────────────────────────────────
// Helper email functions
// ──────────────────────────────────────────────

type UserLike = { name: string; email: string }

/**
 * Welcome email sent after registration.
 */
export async function sendWelcomeEmail(user: UserLike) {
  const html = brandedHtml(`
    <h1>Welcome, ${user.name}! 🍁</h1>
    <p>
      Thanks for joining <span class="highlight">Canada Marketplace</span> — the country's most trusted
      online marketplace. Your account is ready to go!
    </p>
    <p>
      Browse thousands of products from Canadian sellers, list your own items, or open a storefront.
      We're glad you're here.
    </p>
    <a href="${siteUrl}" class="btn">Start Shopping</a>
    <p class="muted">
      Need help? <a href="${siteUrl}/contact">Contact our support team</a>.
    </p>
  `)

  return sendEmail({
    to: user.email,
    subject: 'Welcome to Canada Marketplace! 🍁',
    htmlBody: html,
  })
}

/**
 * Password reset email with a secure one-time link.
 */
export async function sendPasswordResetEmail(user: UserLike, resetUrl: string) {
  const html = brandedHtml(`
    <h1>Reset Your Password</h1>
    <p>
      We received a request to reset the password for your account
      <span class="highlight">(${user.email})</span>.
    </p>
    <p>
      Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
    </p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <p class="muted" style="margin-top:16px;">
      If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
    </p>
    <hr class="divider" />
    <p class="muted">
      If the button doesn't work, copy and paste this link into your browser:<br />
      <span style="word-break:break-all;color:#a8a29e;">${resetUrl}</span>
    </p>
  `)

  return sendEmail({
    to: user.email,
    subject: 'Password Reset — Canada Marketplace',
    htmlBody: html,
  })
}

/**
 * Order confirmation email after a purchase.
 */
export async function sendOrderConfirmationEmail(
  user: UserLike,
  order: { orderNumber: string; total: number; itemCount: number },
) {
  const html = brandedHtml(`
    <h1>Order Confirmed! 🎉</h1>
    <p>
      Thank you for your purchase, <span class="highlight">${user.name}</span>!
      Your order has been placed successfully.
    </p>
    <p>
      <strong>Order Number:</strong> #${order.orderNumber}<br />
      <strong>Items:</strong> ${order.itemCount}<br />
      <strong>Total:</strong> $${order.total.toFixed(2)} CAD
    </p>
    <a href="${siteUrl}" class="btn">View My Orders</a>
    <p class="muted">
      You'll receive updates when your order ships. Track everything from your dashboard.
    </p>
  `)

  return sendEmail({
    to: user.email,
    subject: `Order Confirmed — #${order.orderNumber}`,
    htmlBody: html,
  })
}

/**
 * Message notification when someone sends a message.
 */
export async function sendMessageNotification(
  user: UserLike,
  fromUser: { name: string },
  _message: { content: string },
) {
  const html = brandedHtml(`
    <h1>New Message 💬</h1>
    <p>
      <span class="highlight">${fromUser.name}</span> sent you a message on Canada Marketplace.
    </p>
    <a href="${siteUrl}" class="btn">View Messages</a>
    <p class="muted">
      Stay connected with buyers and sellers. Reply from your inbox to keep the conversation going.
    </p>
  `)

  return sendEmail({
    to: user.email,
    subject: `New message from ${fromUser.name}`,
    htmlBody: html,
  })
}

/**
 * Order status update email (shipped, delivered, cancelled, etc.).
 */
export async function sendOrderStatusUpdateEmail(
  user: UserLike,
  order: { orderNumber: string },
  newStatus: string,
) {
  const statusEmoji: Record<string, string> = {
    PROCESSING: '📦',
    SHIPPED: '🚚',
    DELIVERED: '✅',
    CANCELLED: '❌',
    REFUNDED: '💰',
  }

  const emoji = statusEmoji[newStatus] || '📋'
  const statusLabel = newStatus.charAt(0) + newStatus.slice(1).toLowerCase()

  const html = brandedHtml(`
    <h1>${emoji} Order Update</h1>
    <p>
      Your order <span class="highlight">#${order.orderNumber}</span> has been updated to
      <strong>${statusLabel}</strong>.
    </p>
    <a href="${siteUrl}" class="btn">View Order Details</a>
    <p class="muted">
      If you have questions about this update, please <a href="${siteUrl}/contact">contact support</a>.
    </p>
  `)

  return sendEmail({
    to: user.email,
    subject: `Order #${order.orderNumber} — ${statusLabel}`,
    htmlBody: html,
  })
}
