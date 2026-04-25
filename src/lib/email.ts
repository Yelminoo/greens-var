import { Resend } from 'resend'

function getResend() {
  return new Resend(getConfig().apiKey)
}

const IS_DEV = import.meta.env.DEV

// Read config fresh on every call — avoids module-level caching issues with Vite
function getConfig() {
  const fromName  = import.meta.env.QUOTE_FROM_NAME  ?? process.env['QUOTE_FROM_NAME']  ?? 'Greens Variegated'
  const fromEmail = import.meta.env.QUOTE_FROM_EMAIL ?? process.env['QUOTE_FROM_EMAIL'] ?? import.meta.env.GMAIL_USER ?? process.env['GMAIL_USER'] ?? 'info@greensvar.com'
  const to        = import.meta.env.QUOTE_TO_EMAIL   ?? process.env['QUOTE_TO_EMAIL']   ?? fromEmail
  const replyTo   = import.meta.env.REPLY_TO_EMAIL   ?? process.env['REPLY_TO_EMAIL']   ?? to
  const apiKey    = import.meta.env.RESEND_API_KEY   ?? process.env['RESEND_API_KEY']
  return { fromName, fromEmail, from: `${fromName} <${fromEmail}>`, to, replyTo, apiKey }
}

async function sendMail(opts: {
  to:          string
  replyTo?:    string
  subject:     string
  html:        string
  attachments?: { filename: string; content: Buffer }[]
}) {
  const cfg = getConfig()

  // Skip sending if no API key — just log
  if (!cfg.apiKey) {
    console.log(`\n📧 [NO API KEY] Would send email to: ${opts.to} — ${opts.subject}\n`)
    return
  }

  if (IS_DEV) {
    console.log(`\n📧 [DEV] Sending via Resend: ${opts.to} | from: ${cfg.from}`)
  }

  const { error } = await getResend().emails.send({
    from:        cfg.from,
    to:          opts.to,
    replyTo:     opts.replyTo ?? cfg.replyTo,
    subject:     opts.subject,
    html:        opts.html,
    attachments: opts.attachments?.map(a => ({
      filename: a.filename,
      content:  a.content.toString('base64'),
    })),
  })

  if (error) {
    console.error('[Resend] send error:', error)
    throw new Error(error.message)
  }
}

export async function sendRequestReceivedEmail(opts: {
  ref: string
  buyerName: string
  email: string
  items: { name: string; quantity: number; unit: string }[]
}) {
  const itemRows = opts.items.map(i =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${i.quantity} × ${i.unit || 'unit'}</td>
    </tr>`
  ).join('')

  await sendMail({
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
          <p style="color:#888;font-size:13px">Have questions? Simply reply to this email — we'll get back to you within 24 hours.</p>
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
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${i.quantity} × ${i.unit || 'unit'}</td>
    </tr>`
  ).join('')

  await sendMail({
    to:      getConfig().to,
    replyTo: opts.email,   // admin hits Reply → goes straight to the buyer
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
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center">${i.quantity} ${i.unit || 'unit'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right">$${i.unitPrice.toFixed(2)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right"><strong>$${i.totalPrice.toFixed(2)}</strong></td>
    </tr>`
  ).join('')

  const total = opts.items.reduce((s, i) => s + i.totalPrice, 0)

  await sendMail({
    to:      opts.email,
    subject: `Your quote from Greens Variegated — ${opts.ref}`,
    attachments: [{ filename: `${opts.ref}.pdf`, content: opts.pdfBuffer }],
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
  })
}
