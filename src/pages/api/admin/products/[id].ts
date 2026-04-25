import type { APIRoute } from 'astro'
import { z } from 'zod'
import { db } from '../../../../db/db'
import { products, productSeasons } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { unlink } from 'fs/promises'
import { join } from 'path'

const UPLOAD_DIR = process.env['IMAGE_UPLOAD_DIR']
  ?? join(process.cwd(), 'public', 'images', 'products')

async function deleteImageFile(imageUrl: string | null | undefined) {
  if (!imageUrl || !imageUrl.startsWith('/images/products/')) return
  const filename = imageUrl.split('/images/products/')[1]
  if (!filename) return
  try {
    await unlink(join(UPLOAD_DIR, filename))
  } catch {
    // File already gone — not an error
  }
}

const updateSchema = z.object({
  slug:        z.string().min(1).regex(/^[a-z0-9-]+$/),
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

// PUT /api/admin/products/:id — full update
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id   = Number(params.id)
    const data = updateSchema.parse(await request.json())

    // If image changed, delete the old uploaded file
    const [existing] = await db.select({ image: products.image }).from(products).where(eq(products.id, id))
    if (existing?.image !== data.image) {
      await deleteImageFile(existing?.image)
    }

    await db.update(products).set({
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
      updatedAt:    new Date(),
    }).where(eq(products.id, id))

    // Replace seasons: delete all then re-insert
    await db.delete(productSeasons).where(eq(productSeasons.productId, id))
    if (data.seasons.length > 0) {
      await db.insert(productSeasons).values(
        data.seasons.map(month => ({ productId: id, month }))
      )
    }

    return new Response(JSON.stringify({ ok: true }), {
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

// DELETE /api/admin/products/:id
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = Number(params.id)

    // Delete uploaded image file if it's one we own
    const [existing] = await db.select({ image: products.image }).from(products).where(eq(products.id, id))
    await deleteImageFile(existing?.image)

    // Seasons are cascade deleted via FK
    await db.delete(products).where(eq(products.id, id))
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
