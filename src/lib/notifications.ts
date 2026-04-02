import { db } from '@/lib/db'

/**
 * Create a notification for a user
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
) {
  try {
    const notification = await db.notification.create({
      data: {
        userId,
        type: type.toUpperCase(),
        title,
        message,
        link: link || null,
      },
    })
    return notification
  } catch (error) {
    console.error('Failed to create notification:', error)
    return null
  }
}

/**
 * Notify a buyer about order status change
 */
export async function notifyOrderStatus(
  userId: string,
  orderNumber: string,
  newStatus: string
) {
  const statusMessages: Record<string, { title: string; message: string }> = {
    CONFIRMED: {
      title: 'Order Confirmed',
      message: `Your order #${orderNumber} has been confirmed and is being prepared.`,
    },
    PROCESSING: {
      title: 'Order Processing',
      message: `Your order #${orderNumber} is now being processed by the seller.`,
    },
    SHIPPED: {
      title: 'Order Shipped',
      message: `Your order #${orderNumber} has been shipped! Track your package for updates.`,
    },
    DELIVERED: {
      title: 'Order Delivered',
      message: `Your order #${orderNumber} has been delivered. We hope you enjoy your purchase!`,
    },
    CANCELLED: {
      title: 'Order Cancelled',
      message: `Your order #${orderNumber} has been cancelled. A refund will be processed if applicable.`,
    },
  }

  const data = statusMessages[newStatus] || {
    title: 'Order Update',
    message: `Your order #${orderNumber} status has been updated to ${newStatus}.`,
  }

  return createNotification(
    userId,
    'ORDER',
    data.title,
    data.message,
    'orders'
  )
}

/**
 * Notify a user about a new message
 */
export async function notifyNewMessage(
  userId: string,
  fromName: string,
  productName?: string
) {
  const message = productName
    ? `${fromName} sent you a message about "${productName}".`
    : `${fromName} sent you a new message.`

  return createNotification(
    userId,
    'MESSAGE',
    'New Message',
    message
  )
}

/**
 * Notify a seller about a new order
 */
export async function notifyNewOrder(
  sellerId: string,
  orderNumber: string
) {
  return createNotification(
    sellerId,
    'ORDER',
    'New Order Received',
    `You received a new order #${orderNumber}. Please process it as soon as possible.`,
    'my-orders'
  )
}

/**
 * Notify a seller about a new review
 */
export async function notifyNewReview(
  sellerId: string,
  productName: string,
  rating: number
) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  return createNotification(
    sellerId,
    'REVIEW',
    'New Review',
    `Your product "${productName}" received a ${stars} review.`,
    'my-products'
  )
}

/**
 * Notify a seller about a processed payout
 */
export async function notifyPayoutProcessed(
  sellerId: string,
  amount: number
) {
  return createNotification(
    sellerId,
    'PAYOUT',
    'Payout Processed',
    `A payout of $${amount.toFixed(2)} CAD has been processed to your account.`,
    'my-payouts'
  )
}

/**
 * Notify an admin about a new dispute
 */
export async function notifyDisputeFiled(
  adminId: string,
  orderNumber: string
) {
  return createNotification(
    adminId,
    'DISPUTE',
    'New Dispute Filed',
    `A new dispute has been filed for order #${orderNumber}. Please review and take action.`,
    'admin-disputes'
  )
}
