import type { APIRoute } from 'astro'
import { z } from 'zod'
import { db } from '../../../../../db/db'
import { quoteRequests } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'

const patchSchema = z.object({
  status: z.enum(['pending', 'in-review', 'sent', 'accepted', 'rejected']),
})

// GET /api/admin/quotes/:id — fetch single quote as JSON
export const GET: APIRoute = async ({ params }) => {
  try {
    const id = Number(params.id)
    const [quote] = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id))
    if (!quote) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    return new Response(JSON.stringify(quote), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[GET quote]', err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}

// PATCH /api/admin/quotes/:id — update status
export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    const id   = Number(params.id)
    const data = patchSchema.parse(await request.json())

    const [updated] = await db
      .update(quoteRequests)
      .set({ status: data.status, updatedAt: new Date() })
      .where(eq(quoteRequests.id, id))
      .returning()

    if (!updated) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })

    return new Response(JSON.stringify({ ok: true, status: updated.status }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    if (err instanceof z.ZodError) return new Response(JSON.stringify({ error: err.issues }), { status: 400 })
    console.error('[PATCH quote]', err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}

// DELETE /api/admin/quotes/:id
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = Number(params.id)
    await db.delete(quoteRequests).where(eq(quoteRequests.id, id))
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err) {
    console.error('[DELETE quote]', err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
