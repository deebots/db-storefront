import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '#/db'
import { products, productVariants, orders, inventoryLogs } from '#/db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAdmin } from './auth.server'

export const adminListOrders = createServerFn({ method: 'GET' })
  .validator(z.object({
    status: z.enum(['pending', 'paid', 'shipped', 'cancelled']).optional(),
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0),
  }))
  .handler(async ({ data }) => {
    await requireAdmin()
    let conditions = undefined
    if (data.status) {
      conditions = eq(orders.status, data.status)
    }
    const rows = await db.select().from(orders).where(conditions).limit(data.limit).offset(data.offset).orderBy(desc(orders.createdAt))
    return rows
  })

export const adminCreateProduct = createServerFn({ method: 'POST' })
  .validator(z.object({
    departmentId: z.number(),
    slug: z.string(),
    name: z.string(),
    description: z.string().optional(),
    priceCents: z.number(),
    compareAtPriceCents: z.number().optional(),
    sku: z.string().optional(),
    status: z.enum(['draft', 'active', 'archived']).default('draft'),
  }))
  .handler(async ({ data }) => {
    await requireAdmin()
    const [product] = await db.insert(products).values(data).returning()
    return product
  })

export const adminUpdateProduct = createServerFn({ method: 'POST' })
  .validator(z.object({
    id: z.number(),
    values: z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      priceCents: z.number().optional(),
      compareAtPriceCents: z.number().optional(),
      status: z.enum(['draft', 'active', 'archived']).optional(),
    }),
  }))
  .handler(async ({ data }) => {
    await requireAdmin()
    const [updated] = await db.update(products).set({ ...data.values, updatedAt: new Date() }).where(eq(products.id, data.id)).returning()
    return updated
  })

export const adminManageVariants = createServerFn({ method: 'POST' })
  .validator(z.object({
    productId: z.number(),
    variants: z.array(z.object({
      id: z.number().optional(),
      sku: z.string(),
      optionValues: z.record(z.string(), z.string()),
      priceCents: z.number().optional(),
      inventoryQuantity: z.number().optional(),
    })),
  }))
  .handler(async ({ data }) => {
    await requireAdmin()
    const results = []
    for (const variant of data.variants) {
      if (variant.id) {
        const [updated] = await db.update(productVariants)
          .set({
            sku: variant.sku,
            optionValues: variant.optionValues,
            priceCents: variant.priceCents ?? null,
            inventoryQuantity: variant.inventoryQuantity ?? 0,
            updatedAt: new Date(),
          })
          .where(eq(productVariants.id, variant.id))
          .returning()
        results.push(updated)
      } else {
        const [created] = await db.insert(productVariants).values({
          productId: data.productId,
          sku: variant.sku,
          optionValues: variant.optionValues,
          priceCents: variant.priceCents ?? null,
          inventoryQuantity: variant.inventoryQuantity ?? 0,
        }).returning()
        results.push(created)
      }
    }
    return results
  })

export const adminAdjustInventory = createServerFn({ method: 'POST' })
  .validator(z.object({
    variantId: z.number(),
    delta: z.number(),
    reason: z.enum(['restock', 'adjustment']),
  }))
  .handler(async ({ data }) => {
    await requireAdmin()
    const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, data.variantId)).limit(1)
    if (!variant) throw new Error('Variant not found')
    const newQty = variant.inventoryQuantity + data.delta
    await db.update(productVariants).set({ inventoryQuantity: newQty, updatedAt: new Date() }).where(eq(productVariants.id, data.variantId))
    await db.insert(inventoryLogs).values({
      productVariantId: data.variantId,
      quantityChange: data.delta,
      reason: data.reason,
    })
    return { variantId: data.variantId, newQuantity: newQty }
  })

export const adminGetSalesMetrics = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAdmin()
    const paidOrders = await db.select().from(orders).where(eq(orders.status, 'paid'))
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalCents, 0)
    const totalOrders = paidOrders.length
    return { totalRevenueCents: totalRevenue, totalOrders, averageOrderCents: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0 }
  })