import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie } from '@tanstack/react-start/server'
import { db } from '#/db'
import { cartItems, productVariants } from '#/db/schema'
import { eq, and } from 'drizzle-orm'
import { getSessionUser } from './auth.server'

const CART_SESSION_COOKIE = 'dl_cart_session'

// Session token handling for guest carts is managed via cookie reads in handlers

export const getCart = createServerFn({ method: 'GET' })
  .handler(async () => {
    const user = await getSessionUser()
    const sessionToken = getCookie(CART_SESSION_COOKIE) ?? null

    let items
    if (user) {
      items = await db.select().from(cartItems).where(eq(cartItems.userId, user.id))
    } else if (sessionToken) {
      items = await db.select().from(cartItems).where(eq(cartItems.sessionToken, sessionToken))
    } else {
      return { items: [], totalCents: 0 }
    }

    const enriched = await Promise.all(
      items.map(async (item) => {
        const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, item.productVariantId)).limit(1)
        return { ...item, variant }
      })
    )

    const totalCents = enriched.reduce((sum, item) => sum + (item.variant?.priceCents ?? 0) * item.quantity, 0)
    return { items: enriched, totalCents }
  })

export const addCartItem = createServerFn({ method: 'POST' })
  .validator(z.object({
    productVariantId: z.number(),
    quantity: z.number().min(1).default(1),
  }))
  .handler(async ({ data }) => {
    const user = await getSessionUser()
    const sessionToken = getCookie(CART_SESSION_COOKIE) ?? null

    const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, data.productVariantId)).limit(1)
    if (!variant) throw new Error('Variant not found')
    if (variant.inventoryQuantity < data.quantity) throw new Error('Not enough inventory')

    let conditions
    if (user) {
      conditions = and(eq(cartItems.userId, user.id), eq(cartItems.productVariantId, data.productVariantId))
    } else if (sessionToken) {
      conditions = and(eq(cartItems.sessionToken, sessionToken), eq(cartItems.productVariantId, data.productVariantId))
    } else {
      throw new Error('No cart session or user')
    }

    const existing = await db.select().from(cartItems).where(conditions)
    if (existing.length > 0) {
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + data.quantity, updatedAt: new Date() })
        .where(eq(cartItems.id, existing[0].id))
        .returning()
      return updated
    }

    const [item] = await db.insert(cartItems).values({
      userId: user?.id ?? null,
      sessionToken: sessionToken,
      productVariantId: data.productVariantId,
      quantity: data.quantity,
    }).returning()

    return item
  })

export const updateCartItem = createServerFn({ method: 'POST' })
  .validator(z.object({
    id: z.number(),
    quantity: z.number().min(0),
  }))
  .handler(async ({ data }) => {
    if (data.quantity === 0) {
      await db.delete(cartItems).where(eq(cartItems.id, data.id))
      return { id: data.id, removed: true }
    }
    const [updated] = await db
      .update(cartItems)
      .set({ quantity: data.quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, data.id))
      .returning()
    return updated
  })

export const removeCartItem = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    await db.delete(cartItems).where(eq(cartItems.id, data.id))
    return { success: true }
  })

export const mergeGuestCart = createServerFn({ method: 'POST' })
  .handler(async () => {
    const user = await getSessionUser()
    if (!user) return { merged: false }
    const sessionToken = getCookie(CART_SESSION_COOKIE)
    if (!sessionToken) return { merged: false }

    const guestItems = await db.select().from(cartItems).where(eq(cartItems.sessionToken, sessionToken))
    for (const guest of guestItems) {
      const existing = await db.select().from(cartItems)
        .where(and(eq(cartItems.userId, user.id), eq(cartItems.productVariantId, guest.productVariantId)))
      if (existing.length > 0) {
        await db.update(cartItems)
          .set({ quantity: existing[0].quantity + guest.quantity, updatedAt: new Date() })
          .where(eq(cartItems.id, existing[0].id))
      } else {
        await db.insert(cartItems).values({
          userId: user.id,
          productVariantId: guest.productVariantId,
          quantity: guest.quantity,
        })
      }
      await db.delete(cartItems).where(eq(cartItems.id, guest.id))
    }
    return { merged: true, count: guestItems.length }
  })
