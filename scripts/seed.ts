import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'
import 'dotenv/config'
import * as schema from '../src/db/schema'

const client = new Client({ connectionString: process.env.DATABASE_URL })

async function seed() {
  await client.connect()
  const db = drizzle(client, { schema })

  console.log('Seeding departments...')
  const [apparel, paperGoods, celebrations] = await db
    .insert(schema.departments)
    .values([
      { slug: 'apparel', name: 'Apparel', description: 'Unstructured hats, heavyweight ribbed socks, and cotton essentials.' },
      { slug: 'paper-goods', name: 'Paper Goods', description: 'Thick matte covers, heavy linework, and utilitarian stationery.' },
      { slug: 'celebrations', name: 'Celebrations', description: 'Loot bags, bold stickers, and curated gifts for cool families.' },
    ])
    .returning()

  console.log('Seeding categories...')
  const categories = await db
    .insert(schema.categories)
    .values([
      { departmentId: apparel.id, slug: 'hats', name: 'Hats', sortOrder: 1 },
      { departmentId: apparel.id, slug: 'socks', name: 'Socks', sortOrder: 2 },
      { departmentId: paperGoods.id, slug: 'colouring-books', name: 'Colouring Books', sortOrder: 1 },
      { departmentId: paperGoods.id, slug: 'cards', name: 'Cards', sortOrder: 2 },
      { departmentId: paperGoods.id, slug: 'bookmarks', name: 'Bookmarks', sortOrder: 3 },
      { departmentId: celebrations.id, slug: 'loot-bags', name: 'Loot Bags', sortOrder: 1 },
      { departmentId: celebrations.id, slug: 'gifts', name: 'Gifts', sortOrder: 2 },
      { departmentId: celebrations.id, slug: 'stickers', name: 'Stickers', sortOrder: 3 },
    ])
    .returning()

  const hats = categories[0]!
  const socks = categories[1]!
  const colouringBooks = categories[2]!
  const cards = categories[3]!
  const lootBags = categories[5]!
  const stickers = categories[7]!

  console.log('Seeding products...')
  const [dlHat, ribbedSocks, colouringBook, birthdayCard, lootBag, stickerPack] = await db
    .insert(schema.products)
    .values([
      {
        departmentId: apparel.id,
        slug: 'dl-unstructured-hat',
        name: 'DL Unstructured Hat',
        description: 'Unstructured 6-panel cap in washed black or crisp white. Contrast-stitched DL logo.',
        priceCents: 3800,
        compareAtPriceCents: 4200,
        sku: 'DL-HAT-001',
        status: 'active',
      },
      {
        departmentId: apparel.id,
        slug: 'heavyweight-ribbed-socks',
        name: 'Heavyweight Ribbed Socks',
        description: 'Vintage-inspired athletic cotton socks. Double stripes at the calf. Bold font stamped on the sole.',
        priceCents: 1800,
        sku: 'DL-SOCK-001',
        status: 'active',
      },
      {
        departmentId: paperGoods.id,
        slug: 'matte-linework-colouring-book',
        name: 'Matte Linework Colouring Book',
        description: 'Ultra-thick matte white cover with heavy black linework. The kid provides the color.',
        priceCents: 1200,
        sku: 'DL-CB-001',
        status: 'active',
      },
      {
        departmentId: paperGoods.id,
        slug: 'another-year-older-card',
        name: 'Another Year Older Card',
        description: 'Heavy textured cardstock. High-contrast typography. "Another year older. Nice."',
        priceCents: 600,
        sku: 'DL-CARD-001',
        status: 'active',
      },
      {
        departmentId: celebrations.id,
        slug: 'matte-black-loot-bag',
        name: 'Matte Black Loot Bag',
        description: 'Durable matte black paper bag sealed with a heavy-duty sticker grid. Write the name in marker.',
        priceCents: 400,
        sku: 'DL-LB-001',
        status: 'active',
      },
      {
        departmentId: celebrations.id,
        slug: 'bold-graphic-sticker-pack',
        name: 'Bold Graphic Sticker Pack',
        description: 'Bold graphic silhouettes and simple deadpan statements for water bottles and skateboards.',
        priceCents: 800,
        sku: 'DL-STK-001',
        status: 'active',
      },
    ])
    .returning()

  console.log('Seeding product variants...')
  await db.insert(schema.productVariants).values([
    { productId: dlHat.id, sku: 'DL-HAT-001-BLK', optionValues: { color: 'black' }, priceCents: 3800, inventoryQuantity: 45 },
    { productId: dlHat.id, sku: 'DL-HAT-001-WHT', optionValues: { color: 'white' }, priceCents: 3800, inventoryQuantity: 32 },
    { productId: ribbedSocks.id, sku: 'DL-SOCK-001-BLK', optionValues: { color: 'black' }, priceCents: 1800, inventoryQuantity: 120 },
    { productId: ribbedSocks.id, sku: 'DL-SOCK-001-WHT', optionValues: { color: 'white' }, priceCents: 1800, inventoryQuantity: 98 },
    { productId: colouringBook.id, sku: 'DL-CB-001', optionValues: {}, priceCents: 1200, inventoryQuantity: 200 },
    { productId: birthdayCard.id, sku: 'DL-CARD-001', optionValues: {}, priceCents: 600, inventoryQuantity: 500 },
    { productId: lootBag.id, sku: 'DL-LB-001-SM', optionValues: { size: 'small' }, priceCents: 400, inventoryQuantity: 300 },
    { productId: lootBag.id, sku: 'DL-LB-001-LG', optionValues: { size: 'large' }, priceCents: 600, inventoryQuantity: 150 },
    { productId: stickerPack.id, sku: 'DL-STK-001', optionValues: {}, priceCents: 800, inventoryQuantity: 250 },
  ])

  console.log('Seeding product images...')
  await db.insert(schema.productImages).values([
    { productId: dlHat.id, url: 'https://placeholder.com/dl-hat.jpg', altText: 'DL Unstructured Hat', sortOrder: 1 },
    { productId: ribbedSocks.id, url: 'https://placeholder.com/dl-socks.jpg', altText: 'Heavyweight Ribbed Socks', sortOrder: 1 },
    { productId: colouringBook.id, url: 'https://placeholder.com/dl-cb.jpg', altText: 'Matte Linework Colouring Book', sortOrder: 1 },
    { productId: birthdayCard.id, url: 'https://placeholder.com/dl-card.jpg', altText: 'Another Year Older Card', sortOrder: 1 },
    { productId: lootBag.id, url: 'https://placeholder.com/dl-lb.jpg', altText: 'Matte Black Loot Bag', sortOrder: 1 },
    { productId: stickerPack.id, url: 'https://placeholder.com/dl-stk.jpg', altText: 'Bold Graphic Sticker Pack', sortOrder: 1 },
  ])

  console.log('Seeding product categories...')
  await db.insert(schema.productCategories).values([
    { productId: dlHat.id, categoryId: hats.id },
    { productId: ribbedSocks.id, categoryId: socks.id },
    { productId: colouringBook.id, categoryId: colouringBooks.id },
    { productId: birthdayCard.id, categoryId: cards.id },
    { productId: lootBag.id, categoryId: lootBags.id },
    { productId: stickerPack.id, categoryId: stickers.id },
  ])

  console.log('Seeding admin user...')
  const bcrypt = await import('bcryptjs')
  const passwordHash = await bcrypt.hash('admin123', 10)
  await db.insert(schema.users).values({
    email: 'admin@downlow.store',
    passwordHash,
    role: 'superadmin',
    firstName: 'Down',
    lastName: 'Low',
  })

  console.log('Seed complete.')
  await client.end()
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
