import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '#/db'
import { departments, products, productImages, productVariants, categories, productCategories } from '#/db/schema'
import { eq, and, sql, inArray, desc } from 'drizzle-orm'

export const getDepartments = createServerFn({ method: 'GET' })
  .handler(async () => {
    return db.select().from(departments).where(eq(departments.isActive, true))
  })

export const getDepartmentBySlug = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const [dept] = await db.select().from(departments).where(and(eq(departments.slug, data.slug), eq(departments.isActive, true))).limit(1)
    if (!dept) throw new Error('Department not found')
    const cats = await db.select().from(categories).where(eq(categories.departmentId, dept.id)).orderBy(categories.sortOrder)
    return { department: dept, categories: cats }
  })

export const getDepartmentProducts = createServerFn({ method: 'GET' })
  .validator(z.object({
    slug: z.string(),
    categorySlug: z.string().optional(),
    limit: z.number().min(1).max(100).optional().default(20),
    offset: z.number().min(0).optional().default(0),
  }))
  .handler(async ({ data }) => {
    const [dept] = await db.select().from(departments).where(and(eq(departments.slug, data.slug), eq(departments.isActive, true))).limit(1)
    if (!dept) throw new Error('Department not found')

    let conditions = and(eq(products.departmentId, dept.id), eq(products.status, 'active'))

    if (data.categorySlug) {
      const [cat] = await db.select().from(categories).where(and(eq(categories.slug, data.categorySlug), eq(categories.departmentId, dept.id))).limit(1)
      if (cat) {
        const links = await db.select().from(productCategories).where(eq(productCategories.categoryId, cat.id))
        const ids = links.map((l) => l.productId)
        if (ids.length > 0) {
          conditions = and(conditions, inArray(products.id, ids))
        }
      }
    }

    const rows = await db.select().from(products).where(conditions).limit(data.limit).offset(data.offset).orderBy(desc(products.createdAt))
    return rows
  })

export const getProducts = createServerFn({ method: 'GET' })
  .validator(z.object({
    departmentSlug: z.string().optional(),
    search: z.string().optional(),
    limit: z.number().min(1).max(100).optional().default(20),
    offset: z.number().min(0).optional().default(0),
  }))
  .handler(async ({ data }) => {
    let conditions = eq(products.status, 'active')

    if (data.departmentSlug) {
      const [dept] = await db.select().from(departments).where(eq(departments.slug, data.departmentSlug)).limit(1)
      if (dept) {
        conditions = and(conditions, eq(products.departmentId, dept.id))!
      }
    }

    if (data.search) {
      const searchTerm = `%${data.search}%`
      conditions = and(conditions, sql`${products.name} ILIKE ${searchTerm}`)!
    }

    const rows = await db.select().from(products).where(conditions).limit(data.limit).offset(data.offset).orderBy(desc(products.createdAt))
    return rows
  })

export const getProductBySlug = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const [product] = await db.select().from(products).where(eq(products.slug, data.slug)).limit(1)
    if (!product) throw new Error('Product not found')

    const images = await db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(productImages.sortOrder)
    const variants = await db.select().from(productVariants).where(eq(productVariants.productId, product.id))

    return { ...product, images, variants }
  })
