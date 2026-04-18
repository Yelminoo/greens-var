import type { APIRoute } from 'astro'
import { z } from 'zod'
import { db } from '../../../../../db/db'
import { quoteRequests, quoteItems, quoteDocuments } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { sendOutboundQuoteEmail } from '../../../../../lib/email'
import { generateQuotePDF } from '../../../../../lib/pdf'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const schema = z.object({
  invoiceNo:     z.string().optional(),
  customerId:    z.string().optional(),
  consignee:     z.string().optional(),
  shipperSender: z.string().optional(),
  validUntil:    z.string(),
  paymentTerms:  z.string(),
  deliveryTerms: z.string(),
  adminNotes:    z.string().optional(),
  shippingCost:  z.number().default(0),
  discount:      z.number().default(0),
  totalPackages: z.number().optional(),
  netWeight:     z.number().optional(),
  grossWeight:   z.number().optional(),
  items: z.array(z.object({
    id:         z.number(),
    unitPrice:  z.number(),
    totalPrice: z.number(),
    marks:      z.string().optional(),
    packages:   z.number().optional(),
    weightKg:   z.number().optional(),
  })),
})

// PDF storage — outside dist/ so it survives rebuilds
const PDF_DIR = process.env.PDF_STORAGE_DIR
  ?? join(process.cwd(), 'storage', 'quotes')

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const id   = Number(params.id)
    const data = schema.parse(await request.json())

    const [quote] = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id))
    if (!quote) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })

    const allItems = await db.select().from(quoteItems).where(eq(quoteItems.quoteId, id))

    const priced = allItems.map(item => {
      const row = data.items.find(i => i.id === item.id)
      return {
        name:       item.productName,
        quantity:   item.quantity ?? 0,
        unit:       item.unit ?? '',
        unitPrice:  row?.unitPrice  ?? 0,
        totalPrice: row?.totalPrice ?? 0,
        marks:      row?.marks,
        packages:   row?.packages,
        weightKg:   row?.weightKg,
      }
    })

    // Update item records with pricing + invoice columns
    await Promise.all(
      data.items.map(row =>
        db.update(quoteItems)
          .set({
            unitPrice:  row.unitPrice,
            totalPrice: row.totalPrice,
            marks:      row.marks,
            packages:   row.packages,
            weightKg:   row.weightKg,
          })
          .where(eq(quoteItems.id, row.id))
      )
    )

    // Generate PDF
    const pdfBuffer = await generateQuotePDF({
      ref:           quote.ref,
      invoiceNo:     data.invoiceNo,
      customerId:    data.customerId,
      buyerName:     quote.buyerName,
      company:       quote.company ?? undefined,
      email:         quote.email,
      consignee:     data.consignee,
      shipperSender: data.shipperSender,
      validUntil:    data.validUntil,
      paymentTerms:  data.paymentTerms,
      deliveryTerms: data.deliveryTerms,
      adminNotes:    data.adminNotes,
      shippingCost:  data.shippingCost,
      discount:      data.discount,
      totalPackages: data.totalPackages,
      netWeight:     data.netWeight,
      grossWeight:   data.grossWeight,
      items:         priced,
    })

    // Save PDF to persistent storage (not dist/ which is wiped on rebuild)
    await mkdir(PDF_DIR, { recursive: true })
    const pdfPath = join(PDF_DIR, `${quote.ref}.pdf`)
    await writeFile(pdfPath, pdfBuffer)

    // Send email
    await sendOutboundQuoteEmail({
      ref:           quote.ref,
      buyerName:     quote.buyerName,
      email:         quote.email,
      validUntil:    data.validUntil,
      paymentTerms:  data.paymentTerms,
      deliveryTerms: data.deliveryTerms,
      items:         priced,
      pdfBuffer,
    })

    // Upsert document record — safe to re-send without crashing on unique constraint
    const docValues = {
      requestId:     id,
      ref:           quote.ref,
      invoiceNo:     data.invoiceNo,
      customerId:    data.customerId,
      consignee:     data.consignee,
      shipperSender: data.shipperSender,
      validUntil:    data.validUntil,
      paymentTerms:  data.paymentTerms,
      deliveryTerms: data.deliveryTerms,
      adminNotes:    data.adminNotes,
      shippingCost:  data.shippingCost,
      discount:      data.discount,
      totalPackages: data.totalPackages,
      netWeight:     data.netWeight,
      grossWeight:   data.grossWeight,
      pdfPath,
      sentAt:        new Date(),
    }

    await db.insert(quoteDocuments)
      .values(docValues)
      .onConflictDoUpdate({
        target: quoteDocuments.ref,
        set:    docValues,
      })

    await db.update(quoteRequests)
      .set({ status: 'sent', updatedAt: new Date() })
      .where(eq(quoteRequests.id, id))

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err) {
    if (err instanceof z.ZodError) return new Response(JSON.stringify({ error: err.issues }), { status: 400 })
    console.error('[send quote]', err)
    const message = err instanceof Error ? err.message : 'Server error'
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}
