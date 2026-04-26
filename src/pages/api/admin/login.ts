import type { APIRoute } from 'astro'
import bcrypt from 'bcryptjs'

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

  // Use || not ?? — import.meta.env bakes in "" (empty string) at build time if unset,
  // and "" ?? fallback returns "" — || correctly falls through to the runtime process.env value.
  const hash = (import.meta.env.ADMIN_PASSWORD_HASH || process.env['ADMIN_PASSWORD_HASH'] || '').trim()
  const isProd = import.meta.env.PROD

  // In production, refuse if no hash is configured
  if (isProd && !hash) {
    console.error('[auth] ADMIN_PASSWORD_HASH is not set in production!')
    return json({ error: 'Server misconfiguration: ADMIN_PASSWORD_HASH not set.' }, 500)
  }

  const valid = hash
    ? await bcrypt.compare(password, hash)
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
