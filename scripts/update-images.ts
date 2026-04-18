/**
 * Update all product images to use placeholder.svg
 */

import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { products } from '../src/db/schema'
import { eq } from 'drizzle-orm'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool)

const updates = [
  { slug: 'mango', image: '/images/fruithai/placeholder.svg' },
  { slug: 'durian', image: '/images/fruithai/placeholder.svg' },
  { slug: 'longan', image: '/images/fruithai/placeholder.svg' },
  { slug: 'rambutan', image: '/images/fruithai/placeholder.svg' },
  { slug: 'mangosteen', image: '/images/fruithai/placeholder.svg' },
  { slug: 'papaya', image: '/images/fruithai/placeholder.svg' },
  { slug: 'baby-corn', image: '/images/variegata/placeholder.svg' },
  { slug: 'galangal', image: '/images/variegata/placeholder.svg' },
  { slug: 'lemongrass', image: '/images/variegata/placeholder.svg' },
  { slug: 'kaffir-lime-leaf', image: '/images/variegata/placeholder.svg' },
  { slug: 'thai-chili', image: '/images/variegata/placeholder.svg' },
  { slug: 'morning-glory', image: '/images/variegata/placeholder.svg' },
]

async function main() {
  for (const { slug, image } of updates) {
    await db.update(products)
      .set({ image })
      .where(eq(products.slug, slug))
    console.log(`✓ Updated ${slug}`)
  }
  console.log('\nDone!')
  await pool.end()
}

main()
