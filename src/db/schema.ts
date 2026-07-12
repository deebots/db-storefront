import { relations } from 'drizzle-orm'
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['customer', 'admin', 'superadmin'])
export const productStatusEnum = pgEnum('product_status', ['draft', 'active', 'archived'])
export const orderStatusEnum = pgEnum('order_status', ['pending', 'paid', 'shipped', 'cancelled'])
export const inventoryReasonEnum = pgEnum('inventory_reason', ['sale', 'restock', 'adjustment'])
export const addressTypeEnum = pgEnum('address_type', ['shipping', 'billing'])

export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  logoUrl: varchar('logo_url', { length: 512 }),
  heroImageUrl: varchar('hero_image_url', { length: 512 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('customer'),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  departmentId: integer('department_id').references(() => departments.id).notNull(),
  parentId: integer('parent_id'),
  slug: varchar('slug', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  departmentId: integer('department_id').references(() => departments.id).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(),
  compareAtPriceCents: integer('compare_at_price_cents'),
  sku: varchar('sku', { length: 255 }),
  status: productStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('product_department_idx').on(table.departmentId),
  index('product_status_idx').on(table.status),
])

export const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  url: varchar('url', { length: 512 }).notNull(),
  altText: varchar('alt_text', { length: 255 }),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const productVariants = pgTable('product_variants', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  sku: varchar('sku', { length: 255 }).notNull(),
  optionValues: jsonb('option_values').$type<Record<string, string>>().notNull().default({}),
  priceCents: integer('price_cents'),
  inventoryQuantity: integer('inventory_quantity').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const productCategories = pgTable('product_categories', {
  productId: integer('product_id').references(() => products.id).notNull(),
  categoryId: integer('category_id').references(() => categories.id).notNull(),
}, (table) => [
  primaryKey({ columns: [table.productId, table.categoryId] }),
])

export const inventoryLogs = pgTable('inventory_logs', {
  id: serial('id').primaryKey(),
  productVariantId: integer('product_variant_id').references(() => productVariants.id).notNull(),
  quantityChange: integer('quantity_change').notNull(),
  reason: inventoryReasonEnum('reason').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  sessionToken: varchar('session_token', { length: 255 }),
  productVariantId: integer('product_variant_id').references(() => productVariants.id).notNull(),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('cart_user_idx').on(table.userId),
  index('cart_session_idx').on(table.sessionToken),
])

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  status: orderStatusEnum('status').notNull().default('pending'),
  totalCents: integer('total_cents').notNull(),
  shippingAddress: jsonb('shipping_address').$type<Record<string, string>>().notNull(),
  billingAddress: jsonb('billing_address').$type<Record<string, string>>().notNull(),
  paymentIntentId: varchar('payment_intent_id', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  productVariantId: integer('product_variant_id').references(() => productVariants.id).notNull(),
  quantity: integer('quantity').notNull(),
  priceCents: integer('price_cents').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: addressTypeEnum('type').notNull(),
  line1: varchar('line_1', { length: 255 }).notNull(),
  line2: varchar('line_2', { length: 255 }),
  city: varchar('city', { length: 255 }).notNull(),
  state: varchar('state', { length: 255 }).notNull(),
  zip: varchar('zip', { length: 50 }).notNull(),
  country: varchar('country', { length: 255 }).notNull().default('US'),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const departmentsRelations = relations(departments, ({ many }) => ({
  products: many(products),
  categories: many(categories),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  department: one(departments, { fields: [categories.departmentId], references: [departments.id] }),
  productCategories: many(productCategories),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  department: one(departments, { fields: [products.departmentId], references: [departments.id] }),
  images: many(productImages),
  variants: many(productVariants),
  productCategories: many(productCategories),
}))

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}))

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
  inventoryLogs: many(inventoryLogs),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}))

export const productCategoriesRelations = relations(productCategories, ({ one }) => ({
  product: one(products, { fields: [productCategories.productId], references: [products.id] }),
  category: one(categories, { fields: [productCategories.categoryId], references: [categories.id] }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  addresses: many(addresses),
  cartItems: many(cartItems),
}))

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, { fields: [cartItems.userId], references: [users.id] }),
  variant: one(productVariants, { fields: [cartItems.productVariantId], references: [productVariants.id] }),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  variant: one(productVariants, { fields: [orderItems.productVariantId], references: [productVariants.id] }),
}))

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}))
