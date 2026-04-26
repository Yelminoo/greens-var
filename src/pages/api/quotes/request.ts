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
  captchaToken: z.string().min(1, 'CAPTCHA verification is required'),
  items: z.array(z.object({
    slug:        z.string(),
    name:        z.string(),
    unit:        z.string().optional().default('unit'),
    quantity:    z.number().min(1),
    brand:       z.string(),
    requestedKg: z.number().nullable().optional(),
  })).min(1),
})

async function verifyCaptcha(token: string): Promise<boolean> {
  const secret = import.meta.env.RECAPTCHA_SECRET_KEY ?? process.env['RECAPTCHA_SECRET_KEY']
  if (!secret) {
    console.warn('[reCAPTCHA] No secret key configured — skipping verification')
    return true   // fail open in dev if key is missing
  }
  try {
    const res  = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({ secret, response: token }),
    })
    const json = await res.json() as { success: boolean; 'error-codes'?: string[] }
    if (!json.success) {
      console.warn('[reCAPTCHA] Verification failed:', json['error-codes'])
    }
    return json.success
  } catch (err) {
    console.error('[reCAPTCHA] Network error during verification:', err)
    return false
  }
}

function generateRef(): string {
  const ts  = Date.now().toString(36).toUpperCase()
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `GV-${new Date().getFullYear()}-${ts}${rnd}`
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json()
    const data = schema.parse(body)

    // Verify CAPTCHA before touching the database
    const captchaOk = await verifyCaptcha(data.captchaToken)
    if (!captchaOk) {
      return new Response(
        JSON.stringify({ error: 'CAPTCHA verification failed. Please try again.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const ref   = generateRef()
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
        weightKg:    item.requestedKg ?? null,
      }))
    )

    // Fire emails in parallel — log failures but don't block the response
    const emailItems = data.items.map(i => ({ name: i.name, quantity: i.quantity, unit: i.unit }))
    const [r1, r2] = await Promise.allSettled([
      sendRequestReceivedEmail({ ref, buyerName: data.buyerName, email: data.email, items: emailItems }),
      sendNewRequestAlertEmail({ ref, buyerName: data.buyerName, company: data.company, email: data.email, phone: data.phone, region: data.region, notes: data.notes, items: emailItems }),
    ])
    if (r1.status === 'rejected') console.error('[email] customer confirmation failed:', r1.reason)
    if (r2.status === 'rejected') console.error('[email] admin alert failed:', r2.reason)

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
