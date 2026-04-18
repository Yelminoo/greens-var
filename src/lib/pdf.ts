import PDFDocument from 'pdfkit'

interface QuoteItem {
  name:       string
  quantity:   number   // KG
  unit:       string
  unitPrice:  number
  totalPrice: number
  marks?:     string   // Marks & No.
  packages?:  number   // Boxes
  weightKg?:  number
}

interface QuoteData {
  ref:           string
  invoiceNo?:    string
  customerId?:   string
  buyerName:     string
  company?:      string
  email:         string
  consignee?:    string   // Full address block for consignee
  shipperSender?: string  // Shipper/sender block
  validUntil:    string
  paymentTerms:  string
  deliveryTerms: string
  adminNotes?:   string
  shippingCost?: number
  discount?:     number
  totalPackages?: number
  netWeight?:    number
  grossWeight?:  number
  items:         QuoteItem[]
}

// Bank constants
const BANK = {
  accountName: 'Greens Variegated Co.,Ltd.',
  bankName:    'Bank of Ayudhya PCL.',
  swiftCode:   'AYUDTHBK',
  accountNo:   '',
  bankAddress: '',
  branchCode:  '',
}

export function generateQuotePDF(data: QuoteData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 })
    const chunks: Buffer[] = []

    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end',  () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const W      = doc.page.width   // 595
    const MARGIN = 40
    const GREEN  = '#2D7D46'
    const LGRAY  = '#f5f5f5'
    const GRAY   = '#555555'
    const DGRAY  = '#333333'
    const WHITE  = '#ffffff'

    // ── HEADER ──────────────────────────────────────────────────────────────
    doc.rect(0, 0, W, 52).fill(GREEN)
    doc.fillColor(WHITE).fontSize(18).font('Helvetica-Bold')
       .text('COMMERCIAL INVOICE', 0, 16, { width: W, align: 'center' })

    // ── INVOICE META BLOCK ───────────────────────────────────────────────────
    let y = 68
    const leftX  = MARGIN
    const rightX = W / 2 + 10
    const colW   = W / 2 - MARGIN - 10

    // Left column
    doc.fontSize(9).font('Helvetica-Bold').fillColor(DGRAY)
       .text('Invoice Date:', leftX, y)
    doc.font('Helvetica').fillColor(GRAY)
       .text(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), leftX + 75, y)

    y += 22
    doc.font('Helvetica-Bold').fillColor(DGRAY)
       .text('Consignee :', leftX, y)
    const consigneeText = data.consignee
      ?? [data.buyerName, data.company, data.email].filter(Boolean).join('\n')
    doc.font('Helvetica').fillColor(GRAY)
       .text(consigneeText, leftX + 75, y, { width: colW - 75 })
    const consigneeH = doc.heightOfString(consigneeText, { width: colW - 75 })

    // Right column
    let ry = 68
    doc.font('Helvetica-Bold').fillColor(DGRAY)
       .text('Invoice No.:', rightX, ry)
    doc.font('Helvetica').fillColor(GRAY)
       .text(data.invoiceNo ?? data.ref, rightX + 80, ry)

    ry += 18
    doc.font('Helvetica-Bold').fillColor(DGRAY)
       .text('Customer ID :', rightX, ry)
    doc.font('Helvetica').fillColor(GRAY)
       .text(data.customerId ?? '—', rightX + 90, ry)

    ry += 22
    doc.font('Helvetica-Bold').fillColor(DGRAY)
       .text('Shipper/Sender :', rightX, ry)
    const shipperText = data.shipperSender ?? 'Greens Variegated Co.,Ltd.\nBangkok, Thailand'
    doc.font('Helvetica').fillColor(GRAY)
       .text(shipperText, rightX + 105, ry, { width: colW - 105 })

    // Move below the taller of the two columns
    y = Math.max(y + consigneeH, ry + doc.heightOfString(shipperText, { width: colW - 105 })) + 24

    // ── TABLE ────────────────────────────────────────────────────────────────
    // Column layout (total = 515)
    const cols = {
      marks:  { x: MARGIN,       w: 58  },
      pkgs:   { x: MARGIN + 58,  w: 52  },
      desc:   { x: MARGIN + 110, w: 185 },
      qty:    { x: MARGIN + 295, w: 58  },
      price:  { x: MARGIN + 353, w: 72  },
      amount: { x: MARGIN + 425, w: 90  },
    }
    const tableW = W - MARGIN * 2  // 515

    // Header row 1 — dark green
    doc.rect(MARGIN, y, tableW, 20).fill(GREEN)
    doc.fillColor(WHITE).fontSize(8).font('Helvetica-Bold')
    doc.text('Marks&No.',            cols.marks.x  + 3, y + 6, { width: cols.marks.w })
    doc.text('Packages',             cols.pkgs.x   + 3, y + 6, { width: cols.pkgs.w })
    doc.text('Description of Goods', cols.desc.x   + 3, y + 6, { width: cols.desc.w })
    doc.text('Quantity',             cols.qty.x    + 3, y + 6, { width: cols.qty.w,    align: 'center' })
    doc.text('Unit Price',           cols.price.x  + 3, y + 6, { width: cols.price.w,  align: 'right' })
    doc.text('Amount',               cols.amount.x + 3, y + 6, { width: cols.amount.w, align: 'right' })

    y += 20

    // Header row 2 — light subheading
    doc.rect(MARGIN, y, tableW, 16).fill('#4a9960')
    doc.fillColor(WHITE).fontSize(7.5).font('Helvetica-Bold')
    doc.text('ADDRESS',                   cols.marks.x  + 3, y + 4, { width: cols.marks.w })
    doc.text('BOXES',                     cols.pkgs.x   + 3, y + 4, { width: cols.pkgs.w })
    doc.text('FRESH FRUITS & VEGETABLES', cols.desc.x   + 3, y + 4, { width: cols.desc.w })
    doc.text('KGS',                       cols.qty.x    + 3, y + 4, { width: cols.qty.w,    align: 'center' })
    doc.text('Unit/KG($)',                cols.price.x  + 3, y + 4, { width: cols.price.w,  align: 'right' })
    doc.text('Amount USD($)',             cols.amount.x + 3, y + 4, { width: cols.amount.w, align: 'right' })

    y += 16

    // Data rows
    let subtotal = 0
    data.items.forEach((item, idx) => {
      const rowH = 18
      const bg   = idx % 2 === 0 ? WHITE : LGRAY
      doc.rect(MARGIN, y, tableW, rowH).fill(bg)
      doc.fillColor(DGRAY).fontSize(8.5).font('Helvetica')
      doc.text(item.marks ?? '',                        cols.marks.x  + 3, y + 4, { width: cols.marks.w })
      doc.text(item.packages != null ? String(item.packages) : '', cols.pkgs.x + 3, y + 4, { width: cols.pkgs.w, align: 'center' })
      doc.text(item.name,                               cols.desc.x   + 3, y + 4, { width: cols.desc.w })
      doc.text(item.weightKg != null ? String(item.weightKg) : (item.quantity ? String(item.quantity) : ''), cols.qty.x + 3, y + 4, { width: cols.qty.w, align: 'center' })
      doc.text(item.unitPrice > 0 ? `$${item.unitPrice.toFixed(2)}` : '', cols.price.x + 3, y + 4, { width: cols.price.w, align: 'right' })
      doc.text(item.totalPrice > 0 ? `$${item.totalPrice.toFixed(2)}` : '', cols.amount.x + 3, y + 4, { width: cols.amount.w, align: 'right' })
      subtotal += item.totalPrice
      y += rowH
    })

    // Bottom border of table
    doc.rect(MARGIN, y, tableW, 1).fill('#cccccc')
    y += 1

    // ── SHIPPING INFO + TOTALS ───────────────────────────────────────────────
    const shippingCost = data.shippingCost ?? 0
    const discount     = data.discount ?? 0
    const grandTotal   = subtotal + shippingCost - discount

    y += 10
    const totalsX = cols.price.x

    // Left — Shipping info
    doc.fontSize(9).font('Helvetica-Bold').fillColor(GREEN)
       .text('Shipping Information', MARGIN, y)
    y += 14
    doc.fontSize(8.5).font('Helvetica').fillColor(GREEN)
    doc.font('Helvetica-Bold').text('Total Packages:', MARGIN, y)
    doc.font('Helvetica').fillColor(GRAY).text(data.totalPackages != null ? String(data.totalPackages) : '', MARGIN + 90, y)
    y += 13
    doc.font('Helvetica-Bold').fillColor(GREEN).text('Net Weight:', MARGIN, y)
    doc.font('Helvetica').fillColor(GRAY).text(data.netWeight != null ? `${data.netWeight} KGS` : '', MARGIN + 90, y)
    y += 13
    doc.font('Helvetica-Bold').fillColor(GREEN).text('Gross Weight:', MARGIN, y)
    doc.font('Helvetica').fillColor(GRAY).text(data.grossWeight != null ? `${data.grossWeight} KGS` : '', MARGIN + 90, y)

    // Right — Totals
    const totalsY0 = y - 26
    const labelW   = 80
    const valueW   = 80
    const valueX   = totalsX + labelW

    const drawTotal = (label: string, value: string, rowY: number, bold = false) => {
      doc.fontSize(8.5)
         .font(bold ? 'Helvetica-Bold' : 'Helvetica')
         .fillColor(bold ? DGRAY : GRAY)
         .text(label, totalsX, rowY, { width: labelW, align: 'left' })
         .text(value, valueX, rowY, { width: valueW, align: 'right' })
    }

    drawTotal('Subtotal:',     `$${subtotal.toFixed(2)}`,     totalsY0)
    drawTotal('Shipping Cost:',`$${shippingCost.toFixed(2)}`, totalsY0 + 13)
    drawTotal('Discount:',     `$${discount.toFixed(2)}`,     totalsY0 + 26)

    // Grand total row — green background
    const gtY = totalsY0 + 40
    doc.rect(totalsX - 4, gtY - 2, labelW + valueW + 8, 18).fill(GREEN)
    doc.fillColor(WHITE).fontSize(9).font('Helvetica-Bold')
       .text('GRAND TOTAL:', totalsX, gtY + 2, { width: labelW })
       .text(`$${grandTotal.toFixed(2)}`, valueX, gtY + 2, { width: valueW, align: 'right' })

    y += 30

    // ── TERMS & CONDITIONS ───────────────────────────────────────────────────
    y += 18
    doc.fontSize(9).font('Helvetica-Bold').fillColor(GREEN)
       .text('Terms & Conditions', MARGIN, y)
    y += 13
    const terms = [
      `Payment Terms: ${data.paymentTerms}`,
      'Delivery: Goods will be shipped within 3-5 business days after payment confirmation.',
      'Shipping: Air freight included. Insurance coverage available upon request.',
      'Origin: All products are certified fresh from Thailand.',
      'Quality Guarantee: Fresh produce guaranteed. Claims must be filed within 24 hours of receipt with photos and videos.',
      `Incoterms: ${data.deliveryTerms}`,
    ]
    doc.fontSize(7.5).font('Helvetica').fillColor(GRAY)
    terms.forEach((t, i) => {
      doc.text(`${i + 1}. ${t}`, MARGIN, y, { width: tableW })
      y += 11
    })

    if (data.adminNotes) {
      y += 4
      doc.font('Helvetica-Bold').fillColor(DGRAY).text('Additional Notes:', MARGIN, y)
      y += 11
      doc.font('Helvetica').fillColor(GRAY).text(data.adminNotes, MARGIN, y, { width: tableW })
      y += doc.heightOfString(data.adminNotes, { width: tableW }) + 4
    }

    // ── BANK DETAILS ─────────────────────────────────────────────────────────
    y += 14
    doc.fontSize(9).font('Helvetica-Bold').fillColor(GREEN)
       .text('Bank Details :', MARGIN, y)
    y += 13
    const bankLines = [
      ['Account Name', BANK.accountName],
      ['Bank Name',    BANK.bankName],
      ['Account Number', BANK.accountNo || ''],
      ['SWIFT Code',   BANK.swiftCode],
      ['Bank Address', BANK.bankAddress || ''],
      ['Branch Code',  BANK.branchCode || ''],
    ]
    doc.fontSize(8).fillColor(GRAY)
    bankLines.forEach(([label, value]) => {
      doc.font('Helvetica').text(`${label}:${value ? ' ' + value : ''}`, MARGIN + 8, y)
      y += 12
    })

    // ── SIGNATURE ────────────────────────────────────────────────────────────
    y += 20
    const sigX = W - MARGIN - 160
    doc.moveTo(sigX, y).lineTo(W - MARGIN, y).stroke('#aaaaaa')
    y += 6
    doc.fontSize(8).font('Helvetica').fillColor(GRAY)
       .text('Signature & Company Stamp', sigX, y, { width: 160, align: 'center' })

    doc.end()
  })
}
