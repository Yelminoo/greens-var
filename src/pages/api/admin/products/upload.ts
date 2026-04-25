import type { APIRoute } from 'astro'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'

// Where uploaded product images are saved.
// Defaults to public/images/products/ so both Vite (dev) and Nginx (prod) serve them at /images/products/
const UPLOAD_DIR = process.env['IMAGE_UPLOAD_DIR']
  ?? join(process.cwd(), 'public', 'images', 'products')

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB   = 5

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 })
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Only JPEG, PNG, WebP and GIF images are allowed' }), { status: 400 })
    }

    // Validate size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return new Response(JSON.stringify({ error: `Image must be under ${MAX_SIZE_MB}MB` }), { status: 400 })
    }

    // Build filename: timestamp_sanitized-original-name.ext
    const ext      = extname(file.name).toLowerCase() || '.jpg'
    const baseName = file.name
      .replace(/\.[^.]+$/, '')              // strip extension
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')         // non-alphanumeric → dash
      .replace(/^-+|-+$/g, '')             // trim leading/trailing dashes
      .slice(0, 60)                         // cap length
    const filename = `${Date.now()}_${baseName}${ext}`

    // Save to disk
    await mkdir(UPLOAD_DIR, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(join(UPLOAD_DIR, filename), buffer)

    const url = `/images/products/${filename}`
    return new Response(JSON.stringify({ url, filename }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[upload product image]', err)
    return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 })
  }
}
