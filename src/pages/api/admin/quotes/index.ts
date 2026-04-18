import type { APIRoute } from 'astro'
import { z } from 'zod'
import { db } from '../../../../db/db'
import { quoteRequests, quoteItems } from '../../../../db/schema'
import { eq, desc } from 'drizzle-orm'

// GET /api/admin/quotes — list all
export const GET: APIRoute = async () => {
  const quotes = await db
    .select()
    .from(quoteRequests)
    .orderBy(desc(quoteRequests.createdAt))

  return new Response(JSON.stringify(quotes), {
    headers: { 'Content-Type': 'application/json' },
  })
}

// POST /api/admin/quotes — manual quote creation
const createSchema = z.object({
  buyerName:    z.string().min(1),
  company:      z.string().optional(),
  email:        z.string().email(),
  phone:        z.string().optional(),
  region:       z.string().optional(),
  deliveryDate: z.string().optional(),
  notes:        z.string().optional(),
  brand:        z.enum(['fruithai', 'variegata']),
  status:       z.enum(['pending', 'in-review', 'sent', 'accepted', 'rejected']).optional(),
  items: z.array(z.object({
    productName: z.string(),
    productSlug: z.string(),
    quantity:    z.number(),
    unit:        z.string(),
    unitPrice:   z.number().optional(),
  })).optional(),
})

function generateRef() {
  // timestamp base-36 + 3 random chars → effectively collision-proof
  const ts  = Date.now().toString(36).toUpperCase()
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `GV-${new Date().getFullYear()}-${ts}${rnd}`
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = createSchema.parse(await request.json())
    const ref  = generateRef()

    const [quote] = await db.insert(quoteRequests).values({
      ref, brand: data.brand, status: data.status || 'in-review',
      buyerName: data.buyerName, company: data.company, email: data.email,
      phone: data.phone, region: data.region, deliveryDate: data.deliveryDate, notes: data.notes,
    }).returning()

    if (data.items && data.items.length > 0) {
      await db.insert(quoteItems).values(
        data.items.map(i => ({
          quoteId: quote.id, productName: i.productName, productSlug: i.productSlug,
          quantity: i.quantity, unit: i.unit, unitPrice: i.unitPrice,
          totalPrice: i.unitPrice ? i.quantity * i.unitPrice : undefined,
        }))
      )
    }

    return new Response(JSON.stringify({ id: quote.id, ref }), { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return new Response(JSON.stringify({ error: err.issues }), { status: 400 })
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
