import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

// -- Swap back to Resend when ready --
// import { Resend } from 'resend'
// const resend = new Resend(import.meta.env.RESEND_API_KEY)

// Display name shown to recipient — can be anything, no domain needed.
// Actual sending address is GMAIL_USER (your Gmail account).
const FROM_NAME  = import.meta.env.QUOTE_FROM_NAME  ?? 'Greens Variegated'
const FROM_EMAIL = import.meta.env.GMAIL_USER        ?? import.meta.env.QUOTE_FROM_EMAIL ?? 'noreply@example.com'
const FROM = `"${FROM_NAME}" <${FROM_EMAIL}>`

const TO = import.meta.env.QUOTE_TO_EMAIL ?? FROM_EMAIL
const IS_DEV = import.meta.env.DEV

// In dev: Ethereal catches emails and gives a preview URL — nothing actually sends.
// In prod: Gmail via App Password.
async function createTransport(): Promise<Transporter> {
  if (IS_DEV) {
    const testAccount = await nodemailer.createTestAccount()
    return nodemailer.createTransport({
      host:   'smtp.ethereal.email',
      port:   587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: import.meta.env.GMAIL_USER,
      pass: import.meta.env.GMAIL_APP_PASSWORD,
    },
  })
}

async function sendMail(opts: Parameters<Transporter['sendMail']>[0]) {
  const transport = await createTransport()
  const info = await transport.sendMail(opts)

  if (IS_DEV) {
    // Logs a clickable URL to preview the email in the browser
    console.log(`\n📧 [DEV] Email sent — preview: ${nodemailer.getTestMessageUrl(info)}\n`)
  }

  return info
}

export async function sendRequestReceivedEmail(opts: {
  ref: string
  buyerName: string
  email: string
  items: { name: string; quantity: number; unit: string }[]
}) {
  const itemRows = opts.items.map(i =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">${i.name}</td>
     <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${i.quantity} × ${i.unit}</td></tr>`
  ).join('')

  await sendMail({
    from:    FROM,
    to:      opts.email,
    subject: `Your quote request has been received — Ref ${opts.ref}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1C2B1E">
        <div style="background:#2D7D46;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:22px">Quote Request Received</h1>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px">
          <p>Hi ${opts.buyerName},</p>
          <p>We've received your quote request. Our team will review it and get back to you within <strong>24 hours</strong>.</p>
          <p><strong>Reference:</strong> <code style="background:#f5f5f5;padding:2px 6px;border-radius:4px">${opts.ref}</code></p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
            <thead><tr style="background:#f9f9f9">
              <th style="padding:8px 12px;text-align:left">Product</th>
              <th style="padding:8px 12px;text-align:right">Quantity</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <p style="color:#888;font-size:13px">Have questions? Reply to this email or contact us at info@greensvar.com</p>
        </div>
      </div>`,
  })
}

export async function sendNewRequestAlertEmail(opts: {
  ref: string
  buyerName: string
  company?: string
  email: string
  phone?: string
  region?: string
  notes?: string
  items: { name: string; quantity: number; unit: string }[]
}) {
  const itemRows = opts.items.map(i =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">${i.name}</td>
     <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${i.quantity} × ${i.unit}</td></tr>`
  ).join('')

  await sendMail({
    from:    FROM,
    to:      TO,
    subject: `[New Quote Request] ${opts.ref} — ${opts.buyerName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1C2B1E">
        <div style="background:#1C2B1E;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:#A8D635;margin:0;font-size:20px">New Quote Request</h1>
          <p style="color:white;opacity:0.6;margin:4px 0 0">${opts.ref}</p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px">
          <table style="width:100%;font-size:14px;margin-bottom:16px">
            <tr><td style="opacity:0.5;padding:4px 0;width:120px">Name</td><td>${opts.buyerName}</td></tr>
            <tr><td style="opacity:0.5;padding:4px 0">Company</td><td>${opts.company ?? '—'}</td></tr>
            <tr><td style="opacity:0.5;padding:4px 0">Email</td><td><a href="mailto:${opts.email}">${opts.email}</a></td></tr>
            <tr><td style="opacity:0.5;padding:4px 0">Phone</td><td>${opts.phone ?? '—'}</td></tr>
            <tr><td style="opacity:0.5;padding:4px 0">Region</td><td>${opts.region ?? '—'}</td></tr>
          </table>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
            <thead><tr style="background:#f9f9f9">
              <th style="padding:8px 12px;text-align:left">Product</th>
              <th style="padding:8px 12px;text-align:right">Quantity</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          ${opts.notes ? `<p style="font-size:13px;color:#555"><strong>Notes:</strong> ${opts.notes}</p>` : ''}
        </div>
      </div>`,
  })
}

export async function sendOutboundQuoteEmail(opts: {
  ref: string
  buyerName: string
  email: string
  validUntil: string
  paymentTerms: string
  deliveryTerms: string
  items: { name: string; quantity: number; unit: string; unitPrice: number; totalPrice: number }[]
  pdfBuffer: Buffer
}) {
  const itemRows = opts.items.map(i =>
    `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #eee">${i.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center">${i.quantity} ${i.unit}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right">$${i.unitPrice.toFixed(2)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right"><strong>$${i.totalPrice.toFixed(2)}</strong></td>
    </tr>`
  ).join('')

  const total = opts.items.reduce((s, i) => s + i.totalPrice, 0)

  await sendMail({
    from:    FROM,
    to:      opts.email,
    subject: `Your quote from Greens Variegated — ${opts.ref}`,
    html: `
      <div style="font-family:sans-serif;max-width:620px;margin:0 auto;color:#1C2B1E">
        <div style="background:#2D7D46;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:22px">Quotation</h1>
          <p style="color:rgba(255,255,255,0.7);margin:4px 0 0">${opts.ref}</p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px">
          <p>Dear ${opts.buyerName},</p>
          <p>Please find your quotation below. The PDF is also attached for your records.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin:24px 0">
            <thead><tr style="background:#f5f5f5">
              <th style="padding:10px 12px;text-align:left">Product</th>
              <th style="padding:10px 12px;text-align:center">Qty / Unit</th>
              <th style="padding:10px 12px;text-align:right">Unit Price</th>
              <th style="padding:10px 12px;text-align:right">Total</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
            <tfoot><tr style="background:#f9fdf9">
              <td colspan="3" style="padding:12px;text-align:right;font-weight:bold">Grand Total</td>
              <td style="padding:12px;text-align:right;font-weight:bold;color:#2D7D46">$${total.toFixed(2)}</td>
            </tr></tfoot>
          </table>
          <table style="font-size:13px;color:#555;margin-bottom:16px">
            <tr><td style="padding:4px 12px 4px 0;opacity:0.6">Valid Until</td><td>${opts.validUntil}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;opacity:0.6">Payment Terms</td><td>${opts.paymentTerms}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;opacity:0.6">Delivery Terms</td><td>${opts.deliveryTerms}</td></tr>
          </table>
          <p style="font-size:13px;color:#888">To accept this quote or ask questions, reply to this email.</p>
        </div>
      </div>`,
    attachments: [{
      filename: `${opts.ref}.pdf`,
      content:  opts.pdfBuffer,
    }],
  })
}
