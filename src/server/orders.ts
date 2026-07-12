import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import Stripe from 'stripe'
import { db } from '#/db'
import { orders, orderItems, cartItems, productVariants } from '#/db/schema'
import { eq, sql } from 'drizzle-orm'
import { requireAuth } from './auth.server'
import { env } from '#/utils/env'

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2026-06-24.dahlia' })

export const createOrderFromCart = createServerFn({ method: 'POST' })
  .validator(z.object({
    shippingAddress: z.record(z.string(), z.string()),
    billingAddress: z.record(z.string(), z.string()),
  }))
  .handler(async ({ data }) => {
    const user = await requireAuth()
    const cart = await db.select().from(cartItems).where(eq(cartItems.userId, user.id))
    if (cart.length === 0) throw new Error('Cart is empty')

    let totalCents = 0
    const lineItems: { variantId: number; quantity: number; priceCents: number }[] = []

    for (const item of cart) {
      const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, item.productVariantId)).limit(1)
      if (!variant) throw new Error('Variant not found')
      if (variant.inventoryQuantity < item.quantity) throw new Error(`Not enough inventory for ${variant.sku}`)
      const price = variant.priceCents ?? 0
      totalCents += price * item.quantity
      lineItems.push({ variantId: item.productVariantId, quantity: item.quantity, priceCents: price })
    }

    const [order] = await db.insert(orders).values({
      userId: user.id,
      status: 'pending',
      totalCents,
      shippingAddress: data.shippingAddress as Record<string, string>,
      billingAddress: data.billingAddress as Record<string, string>,
    }).returning()

    for (const line of lineItems) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productVariantId: line.variantId,
        quantity: line.quantity,
        priceCents: line.priceCents,
      })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      metadata: { orderId: String(order.id) },
    })

    await db.update(orders).set({ paymentIntentId: paymentIntent.id }).where(eq(orders.id, order.id))

    return { orderId: order.id, clientSecret: paymentIntent.client_secret }
  })

export const getOrders = createServerFn({ method: 'GET' })
  .handler(async () => {
    const user = await requireAuth()
    const rows = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(sql`${orders.createdAt} DESC`)
    return rows
  })

export const getOrderById = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const user = await requireAuth()
    const [order] = await db.select().from(orders).where(eq(orders.id, data.id)).limit(1)
    if (!order || order.userId !== user.id) throw new Error('Order not found')
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
    const enriched = await Promise.all(items.map(async (item) => {
      const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, item.productVariantId)).limit(1)
      return { ...item, variant }
    }))
    return { ...order, items: enriched }
  })

// Stripe webhook should be handled via a dedicated API route or middleware
// to access raw request body. This placeholder returns success for now.
export const handleStripeWebhook = createServerFn({ method: 'POST' })
  .handler(async () => {
    return { received: true }
  })
