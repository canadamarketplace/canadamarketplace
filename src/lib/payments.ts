import Stripe from 'stripe'

// Stripe will be initialized with the key from environment variables
// For development, we'll create a mock that mimics Stripe's API
let stripe: Stripe | null = null

export function initStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    console.warn('[Payments] STRIPE_SECRET_KEY not set — using mock mode')
    return null
  }
  stripe = new Stripe(key, { apiVersion: '2026-03-25.dahlia' })
  return stripe
}

export function getStripe() {
  if (!stripe) return initStripe()
  return stripe
}

export interface CreatePaymentIntentParams {
  amount: number        // in CAD cents
  orderId: string
  buyerEmail: string
  buyerId: string
  description?: string
}

export interface CreatePaymentResult {
  clientSecret: string
  paymentIntentId: string
  amount: number
  currency: string
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'mock'
}

export async function createPaymentIntent(params: CreatePaymentIntentParams): Promise<CreatePaymentResult> {
  const st = getStripe()

  if (!st) {
    // Mock mode — for development without Stripe keys
    const mockId = `pi_mock_${Date.now()}`
    return {
      clientSecret: `${mockId}_secret_mock`,
      paymentIntentId: mockId,
      amount: params.amount,
      currency: 'cad',
      status: 'mock',
    }
  }

  const paymentIntent = await st.paymentIntents.create({
    amount: params.amount,
    currency: 'cad',
    metadata: {
      orderId: params.orderId,
      buyerId: params.buyerId,
      platform: 'canada-marketplace',
    },
    description: params.description || `Order ${params.orderId} — Canada Marketplace`,
    receipt_email: params.buyerEmail,
  })

  return {
    clientSecret: paymentIntent.client_secret || '',
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status as 'requires_payment_method',
  }
}

export interface RefundParams {
  paymentIntentId: string
  amount?: number     // partial refund amount (in cents). If omitted, full refund.
  reason?: string
}

export async function createRefund(params: RefundParams): Promise<{ refundId: string; status: string; amount: number }> {
  const st = getStripe()

  if (!st) {
    return {
      refundId: `re_mock_${Date.now()}`,
      status: 'mock_succeeded',
      amount: params.amount || 0,
    }
  }

  const refund = await st.refunds.create({
    payment_intent: params.paymentIntentId,
    amount: params.amount,
    reason: (params.reason as any) || 'requested_by_customer',
  })

  return {
    refundId: refund.id,
    status: refund.status,
    amount: refund.amount,
  }
}

// Payout helpers
export interface PayoutParams {
  sellerId: string
  amount: number     // in CAD cents
  method?: 'bank_transfer' | 'stripe_connect'
}

export async function createPayout(params: PayoutParams): Promise<{ payoutId: string; status: string }> {
  const st = getStripe()

  if (!st) {
    return {
      payoutId: `po_mock_${Date.now()}`,
      status: 'mock_pending',
    }
  }

  // In production, this would use Stripe Connect for automatic payouts
  // For now, return a mock
  return {
    payoutId: `po_${Date.now()}`,
    status: 'pending',
  }
}
