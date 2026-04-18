import { pgTable, serial, text, real, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'

// ─── Products ────────────────────────────────────────────────────────────────

export const products = pgTable('products', {
  id:          serial('id').primaryKey(),
  slug:        text('slug').notNull().unique(),
  brand:       text('brand').notNull(),          // 'fruithai' | 'variegata'
  name:        text('name').notNull(),
  variety:     text('variety'),
  origin:      text('origin'),
  description: text('description'),
  image:       text('image'),                    // URL or /images/... path
  unit:        text('unit'),                     // e.g. "carton (5 kg)"
  tags:         jsonb('tags').$type<string[]>().default([]),
  active:       boolean('active').default(true),
  sortOrder:    integer('sort_order').default(0),
  // Invoice defaults — auto-fill quote line items
  kgPerUnit:    real('kg_per_unit'),      // net weight per 1 ordered unit (KGS)
  boxesPerUnit: integer('boxes_per_unit'), // number of boxes per 1 ordered unit
  pricePerKg:   real('price_per_kg'),     // suggested price per KG in USD
  createdAt:    timestamp('created_at').defaultNow(),
  updatedAt:    timestamp('updated_at').defaultNow(),
})

// Stores which months (1–12) a product is in season
export const productSeasons = pgTable('product_seasons', {
  id:        serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  month:     integer('month').notNull(),  // 1 = Jan … 12 = Dec
})

// ─── Quotes ──────────────────────────────────────────────────────────────────

export const quoteRequests = pgTable('quote_requests', {
  id:           serial('id').primaryKey(),
  ref:          text('ref').notNull().unique(),
  brand:        text('brand').notNull(),
  status:       text('status').notNull().default('pending'), // pending | in-review | sent | accepted | rejected
  buyerName:    text('buyer_name').notNull(),
  company:      text('company'),
  email:        text('email').notNull(),
  phone:        text('phone'),
  region:       text('region'),
  deliveryDate: text('delivery_date'),
  notes:        text('notes'),
  createdAt:    timestamp('created_at').defaultNow(),
  updatedAt:    timestamp('updated_at').defaultNow(),
})

export const quoteItems = pgTable('quote_items', {
  id:          serial('id').primaryKey(),
  quoteId:     integer('quote_id').references(() => quoteRequests.id),
  productName: text('product_name').notNull(),
  productSlug: text('product_slug').notNull(),
  quantity:    real('quantity'),
  unit:        text('unit'),
  unitPrice:   real('unit_price'),
  totalPrice:  real('total_price'),
  // Commercial invoice fields
  marks:       text('marks'),           // Marks & No. column
  packages:    integer('packages'),     // Number of boxes
  weightKg:    real('weight_kg'),       // Net weight in KG
})

export const quoteDocuments = pgTable('quote_documents', {
  id:            serial('id').primaryKey(),
  requestId:     integer('request_id').references(() => quoteRequests.id),
  ref:           text('ref').notNull().unique(),
  validUntil:    text('valid_until'),
  paymentTerms:  text('payment_terms'),
  deliveryTerms: text('delivery_terms'),
  adminNotes:    text('admin_notes'),
  pdfPath:       text('pdf_path'),
  sentAt:        timestamp('sent_at'),
  createdAt:     timestamp('created_at').defaultNow(),
  // Commercial invoice fields
  invoiceNo:     text('invoice_no'),
  customerId:    text('customer_id'),
  consignee:     text('consignee'),       // Buyer address block
  shipperSender: text('shipper_sender'),  // Sender/shipper address block
  shippingCost:  real('shipping_cost').default(0),
  discount:      real('discount').default(0),
  totalPackages: integer('total_packages'),
  netWeight:     real('net_weight'),
  grossWeight:   real('gross_weight'),
})

// ─── Convenience types ───────────────────────────────────────────────────────

export type Product       = typeof products.$inferSelect
export type ProductInsert = typeof products.$inferInsert
export type Season        = typeof productSeasons.$inferSelect
