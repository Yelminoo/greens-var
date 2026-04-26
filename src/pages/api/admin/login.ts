import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request, cookies }) => {
  // Accept JSON (sent by fetch) — avoids Astro's CSRF block on form POST
  let password: string
  try {
    const body = await request.json()
    password   = body?.password ?? ''
  } catch {
    return json({ error: 'Invalid request body' }, 400)
  }

  if (!password) return json({ error: 'Password is required' }, 400)

  const isProd = import.meta.env.PROD

  // Plain text password comparison (temporary — replace with bcrypt once .env hash issue is resolved)
  const adminPassword = (process.env['ADMIN_PASSWORD'] || '').trim()

  if (isProd && !adminPassword) {
    return json({ error: 'Server misconfiguration: ADMIN_PASSWORD not set.' }, 500)
  }

  const valid = adminPassword
    ? password === adminPassword
    : password === 'admin'   // dev-only fallback

  if (!valid) return json({ error: 'Incorrect password. Please try again.' }, 401)

  cookies.set('admin_session', 'authenticated', {
    path:     '/',
    httpOnly: true,
    secure:   isProd,
    maxAge:   60 * 60 * 8,  // 8 hours
    sameSite: 'lax',
  })

  return json({ ok: true }, 200)
}

function json(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
