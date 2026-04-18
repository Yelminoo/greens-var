import { db } from './db'
import { products, productSeasons } from './schema'
import { eq, asc, and, inArray } from 'drizzle-orm'

export interface ProductWithSeasons {
  id:          number
  slug:        string
  brand:       string
  name:        string
  variety:     string | null
  origin:      string | null
  description: string | null
  image:       string | null
  unit:        string | null
  tags:        string[]
  active:      boolean | null
  sortOrder:   number | null
  seasons:     number[]
}

async function safeQuery<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn()
  } catch (err: any) {
    // Table not yet created — prompt dev to run db:push
    if (err?.message?.includes('does not exist') || err?.code === '42P01') {
      if (import.meta.env.DEV) {
        console.warn(`\n⚠️  [DB] Table missing for "${label}". Run: npm run db:push && npm run db:seed\n`)
      }
      return fallback
    }
    throw err
  }
}

export async function getProductsByBrand(brand: string): Promise<ProductWithSeasons[]> {
  return safeQuery(async () => {
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.brand, brand), eq(products.active, true)))
      .orderBy(asc(products.sortOrder), asc(products.name))
    return attachSeasons(rows)
  }, [], `products[brand=${brand}]`)
}

export async function getAllProducts(): Promise<ProductWithSeasons[]> {
  return safeQuery(async () => {
    const rows = await db
      .select()
      .from(products)
      .orderBy(asc(products.brand), asc(products.sortOrder), asc(products.name))
    return attachSeasons(rows)
  }, [], 'products[all]')
}

export async function getProductBySlug(slug: string): Promise<ProductWithSeasons | null> {
  return safeQuery(async () => {
    const [row] = await db.select().from(products).where(eq(products.slug, slug))
    if (!row) return null
    const [withSeasons] = await attachSeasons([row])
    return withSeasons ?? null
  }, null, `products[slug=${slug}]`)
}

export async function getProductById(id: number): Promise<ProductWithSeasons | null> {
  return safeQuery(async () => {
    const [row] = await db.select().from(products).where(eq(products.id, id))
    if (!row) return null
    const [withSeasons] = await attachSeasons([row])
    return withSeasons ?? null
  }, null, `products[id=${id}]`)
}

async function attachSeasons(rows: (typeof products.$inferSelect)[]): Promise<ProductWithSeasons[]> {
  if (rows.length === 0) return []

  const ids = rows.map(r => r.id)
  const allSeasons = await db
    .select()
    .from(productSeasons)
    .where(ids.length === 1 ? eq(productSeasons.productId, ids[0]) : inArray(productSeasons.productId, ids))

  return rows.map(r => ({
    ...r,
    tags:    (r.tags as string[]) ?? [],
    seasons: allSeasons
      .filter(s => s.productId === r.id)
      .map(s => s.month)
      .sort((a, b) => a - b),
  }))
}
