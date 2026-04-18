/**
 * Seed script — run once to populate the products table from the static data files.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Safe to re-run: skips products whose slug already exists.
 */

import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { products, productSeasons } from '../src/db/schema'
import { eq } from 'drizzle-orm'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db   = drizzle(pool)

const fruithaiSeed = [
  {
    slug: 'mango', brand: 'fruithai', name: 'Mango',
    variety: 'Nam Dok Mai / Mahachanok',
    origin: 'Chiang Mai & Phetchabun, Thailand',
    description: "Thailand's finest export mango, prized for its golden skin, fibre-free flesh, and rich honey-sweet flavour.",
    image: '/images/fruithai/placeholder.svg',
    unit: 'carton (5 kg)',
    tags: ['bestseller', 'export-grade'],
    seasons: [3, 4, 5, 6, 7],
    sortOrder: 1,
  },
  {
    slug: 'durian', brand: 'fruithai', name: 'Durian',
    variety: 'Monthong / Chanee',
    origin: 'Chanthaburi & Rayong, Thailand',
    description: 'The king of fruits. Monthong offers creamy, mildly sweet flesh with low odour — preferred for international markets.',
    image: '/images/fruithai/placeholder.svg',
    unit: 'kg',
    tags: ['premium', 'seasonal'],
    seasons: [5, 6, 7, 8],
    sortOrder: 2,
  },
  {
    slug: 'longan', brand: 'fruithai', name: 'Longan',
    variety: 'Daw / Biew Kiew',
    origin: 'Lamphun, Thailand',
    description: 'Small, translucent pearls of sweetness. Thai longan is celebrated for its delicate floral aroma and high sugar content.',
    image: '/images/fruithai/placeholder.svg',
    unit: 'carton (10 kg)',
    tags: ['dried-available'],
    seasons: [7, 8, 9],
    sortOrder: 3,
  },
  {
    slug: 'rambutan', brand: 'fruithai', name: 'Rambutan',
    variety: 'Rongrien / See Chompoo',
    origin: 'Surat Thani, Thailand',
    description: 'Bright red hairy shells reveal juicy, translucent flesh. Rongrien is the most widely exported Thai rambutan.',
    image: '/images/fruithai/placeholder.svg',
    unit: 'carton (10 kg)',
    tags: ['export-grade'],
    seasons: [5, 6, 7, 8, 9],
    sortOrder: 4,
  },
  {
    slug: 'mangosteen', brand: 'fruithai', name: 'Mangosteen',
    variety: 'Queen of Fruits',
    origin: 'Chanthaburi, Thailand',
    description: 'Deep purple rind concealing snow-white segments of extraordinary sweetness with a hint of citrus.',
    image: '/images/fruithai/placeholder.svg',
    unit: 'carton (5 kg)',
    tags: ['premium'],
    seasons: [5, 6, 7, 8],
    sortOrder: 5,
  },
  {
    slug: 'papaya', brand: 'fruithai', name: 'Papaya',
    variety: 'Holland / Red Lady',
    origin: 'Central Thailand',
    description: "Buttery orange flesh with natural enzyme richness. Thailand's Red Lady papaya ships well and arrives with consistent quality.",
    image: '/images/fruithai/placeholder.svg',
    unit: 'carton (10 kg)',
    tags: ['year-round'],
    seasons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    sortOrder: 6,
  },
]

const variegataSeed = [
  {
    slug: 'baby-corn', brand: 'variegata', name: 'Baby Corn',
    variety: 'Super Sweet',
    origin: 'Lopburi, Thailand',
    description: 'Tender, young corn harvested before pollination. Mild sweetness with a satisfying crunch.',
    image: '/images/variegata/placeholder.svg',
    unit: 'carton (10 kg)',
    tags: ['year-round', 'processing'],
    seasons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    sortOrder: 1,
  },
  {
    slug: 'galangal', brand: 'variegata', name: 'Galangal',
    variety: 'Greater Galangal',
    origin: 'Chonburi, Thailand',
    description: 'An essential rhizome in Thai and Southeast Asian cooking. Sharper and more piney than ginger.',
    image: '/images/variegata/placeholder.svg',
    unit: 'kg',
    tags: ['herb', 'specialty'],
    seasons: [1, 2, 3, 10, 11, 12],
    sortOrder: 2,
  },
  {
    slug: 'lemongrass', brand: 'variegata', name: 'Lemongrass',
    variety: 'Cymbopogon citratus',
    origin: 'Nakhon Ratchasima, Thailand',
    description: 'Citrus-fragrant stalks essential to Thai, Vietnamese, and Indonesian cuisine.',
    image: '/images/variegata/placeholder.svg',
    unit: 'bundle (1 kg)',
    tags: ['year-round', 'herb'],
    seasons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    sortOrder: 3,
  },
  {
    slug: 'kaffir-lime-leaf', brand: 'variegata', name: 'Kaffir Lime Leaf',
    variety: 'Makrut Lime',
    origin: 'Central Thailand',
    description: 'Double-lobed aromatic leaves with an intense citrus perfume irreplaceable in Thai curries and soups.',
    image: '/images/variegata/placeholder.svg',
    unit: 'pack (500 g)',
    tags: ['year-round', 'herb', 'frozen-available'],
    seasons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    sortOrder: 4,
  },
  {
    slug: 'thai-chili', brand: 'variegata', name: 'Thai Chili',
    variety: "Bird's Eye / Prik Kee Noo",
    origin: 'Ubon Ratchathani, Thailand',
    description: "Small, potent chilies with intense heat (100,000+ SHU) and bright, fruity flavour.",
    image: '/images/variegata/placeholder.svg',
    unit: 'kg',
    tags: ['specialty', 'dried-available'],
    seasons: [2, 3, 4, 5, 6, 11, 12],
    sortOrder: 5,
  },
  {
    slug: 'morning-glory', brand: 'variegata', name: 'Morning Glory',
    variety: 'Water Spinach / Pak Boong',
    origin: 'Central Thailand',
    description: 'Hollow-stemmed aquatic green with tender leaves, essential in Southeast Asian stir-fries.',
    image: '/images/variegata/placeholder.svg',
    unit: 'carton (5 kg)',
    tags: ['fresh', 'export-grade'],
    seasons: [4, 5, 6, 7, 8, 9, 10],
    sortOrder: 6,
  },
]

async function seed() {
  const allSeed = [...fruithaiSeed, ...variegataSeed]
  let created = 0
  let skipped = 0

  for (const item of allSeed) {
    const { seasons, tags, ...fields } = item

    // Skip if slug already exists
    const [existing] = await db.select({ id: products.id })
      .from(products).where(eq(products.slug, fields.slug))

    if (existing) {
      console.log(`  ⏭  Skipped (already exists): ${fields.slug}`)
      skipped++
      continue
    }

    const [product] = await db.insert(products).values({
      ...fields,
      tags,
      active: true,
    }).returning()

    if (seasons.length > 0) {
      await db.insert(productSeasons).values(
        seasons.map(month => ({ productId: product.id, month }))
      )
    }

    console.log(`  ✅ Created: ${fields.name} (${fields.brand})`)
    created++
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped.\n`)
  await pool.end()
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
