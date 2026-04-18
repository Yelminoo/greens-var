import type { APIRoute } from 'astro'
import bcrypt from 'bcryptjs'

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData()
  const password = form.get('password') as string

  const hash = import.meta.env.ADMIN_PASSWORD_HASH
  const valid = hash ? await bcrypt.compare(password, hash) : password === 'admin'

  if (!valid) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/admin/login?error=1' },
    })
  }

  cookies.set('admin_session', 'authenticated', {
    path:     '/',
    httpOnly: true,
    secure:   import.meta.env.PROD,
    maxAge:   60 * 60 * 8, // 8 hours
    sameSite: 'lax',
  })

  return new Response(null, {
    status: 302,
    headers: { Location: '/admin' },
  })
}

export const DELETE: APIRoute = async ({ cookies }) => {
  cookies.delete('admin_session', { path: '/' })
  return new Response(null, { status: 302, headers: { Location: '/admin/login' } })
}
