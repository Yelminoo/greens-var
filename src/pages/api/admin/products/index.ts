import type { APIRoute } from 'astro'
import { z } from 'zod'
import { db } from '../../../../db/db'
import { products, productSeasons } from '../../../../db/schema'
import { getAllProducts } from '../../../../db/products'
import { eq } from 'drizzle-orm'

const productSchema = z.object({
  slug:        z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens only'),
  brand:       z.enum(['fruithai', 'variegata']),
  name:        z.string().min(1),
  variety:     z.string().optional(),
  origin:      z.string().optional(),
  description: z.string().optional(),
  image:       z.string().optional(),
  unit:         z.string().optional(),
  tags:         z.array(z.string()).default([]),
  active:       z.boolean().default(true),
  sortOrder:    z.number().int().default(0),
  seasons:      z.array(z.number().int().min(1).max(12)).default([]),
  kgPerUnit:    z.number().positive().optional(),
  boxesPerUnit: z.number().int().positive().optional(),
  pricePerKg:   z.number().positive().optional(),
})

// GET /api/admin/products
export const GET: APIRoute = async () => {
  const all = await getAllProducts()
  return new Response(JSON.stringify(all), {
    headers: { 'Content-Type': 'application/json' },
  })
}

// POST /api/admin/products — create
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = productSchema.parse(await request.json())

    const [product] = await db.insert(products).values({
      slug:        data.slug,
      brand:       data.brand,
      name:        data.name,
      variety:     data.variety,
      origin:      data.origin,
      description: data.description,
      image:       data.image,
      unit:         data.unit,
      tags:         data.tags,
      active:       data.active,
      sortOrder:    data.sortOrder,
      kgPerUnit:    data.kgPerUnit,
      boxesPerUnit: data.boxesPerUnit,
      pricePerKg:   data.pricePerKg,
    }).returning()

    if (data.seasons.length > 0) {
      await db.insert(productSeasons).values(
        data.seasons.map(month => ({ productId: product.id, month }))
      )
    }

    return new Response(JSON.stringify({ id: product.id, slug: product.slug }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: 'Validation failed', issues: err.issues }), { status: 400 })
    }
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
