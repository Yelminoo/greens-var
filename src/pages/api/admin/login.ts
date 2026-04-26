import type { APIRoute } from 'astro'
import bcrypt from 'bcryptjs'

export const POST: APIRoute = async ({ request, cookies }) => {
  const form     = await request.formData()
  const password = form.get('password') as string

  const hash  = import.meta.env.ADMIN_PASSWORD_HASH ?? process.env['ADMIN_PASSWORD_HASH']
  const isProd = import.meta.env.PROD

  // In production, refuse to work without a hashed password — never fall back to 'admin'
  if (isProd && !hash) {
    console.error('[auth] ADMIN_PASSWORD_HASH is not set in production!')
    return new Response(null, {
      status: 302,
      headers: { Location: '/admin/login?error=misconfigured' },
    })
  }

  const valid = hash
    ? await bcrypt.compare(password, hash)
    : password === 'admin'   // dev-only fallback

  if (!valid) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/admin/login?error=1' },
    })
  }

  cookies.set('admin_session', 'authenticated', {
    path:     '/',
    httpOnly: true,
    secure:   isProd,
    maxAge:   60 * 60 * 8,  // 8 hours
    sameSite: 'lax',
  })

  return new Response(null, {
    status: 302,
    headers: { Location: '/admin' },
  })
}
