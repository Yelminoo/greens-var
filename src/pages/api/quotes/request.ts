import type { APIRoute } from 'astro'
import { z } from 'zod'
import { db } from '../../../db/db'
import { quoteRequests, quoteItems } from '../../../db/schema'
import { sendRequestReceivedEmail, sendNewRequestAlertEmail } from '../../../lib/email'

const schema = z.object({
  buyerName:    z.string().min(1),
  company:      z.string().optional(),
  email:        z.string().email(),
  phone:        z.string().optional(),
  region:       z.string().min(1),
  deliveryDate: z.string().optional(),
  notes:        z.string().optional(),
  items: z.array(z.object({
    slug:     z.string(),
    name:     z.string(),
    unit:     z.string(),
    quantity: z.number().min(1),
    brand:    z.string(),
  })).min(1),
})

function generateRef(): string {
  const ts  = Date.now().toString(36).toUpperCase()
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `GV-${new Date().getFullYear()}-${ts}${rnd}`
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    const ref  = generateRef()
    const brand = locals.brand === 'main' ? data.items[0]?.brand ?? 'fruithai' : locals.brand

    const [quote] = await db.insert(quoteRequests).values({
      ref,
      brand,
      buyerName:    data.buyerName,
      company:      data.company,
      email:        data.email,
      phone:        data.phone,
      region:       data.region,
      deliveryDate: data.deliveryDate,
      notes:        data.notes,
    }).returning()

    await db.insert(quoteItems).values(
      data.items.map(item => ({
        quoteId:     quote.id,
        productName: item.name,
        productSlug: item.slug,
        quantity:    item.quantity,
        unit:        item.unit,
      }))
    )

    // Fire emails in parallel, don't block the response on failure
    const emailItems = data.items.map(i => ({ name: i.name, quantity: i.quantity, unit: i.unit }))
    await Promise.allSettled([
      sendRequestReceivedEmail({ ref, buyerName: data.buyerName, email: data.email, items: emailItems }),
      sendNewRequestAlertEmail({ ref, buyerName: data.buyerName, company: data.company, email: data.email, phone: data.phone, region: data.region, notes: data.notes, items: emailItems }),
    ])

    return new Response(JSON.stringify({ ref }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: 'Invalid request data', issues: err.issues }), { status: 400 })
    }
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
