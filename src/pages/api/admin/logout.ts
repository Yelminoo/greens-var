import type { APIRoute } from 'astro'

// GET is intentional — logout via GET avoids CSRF entirely.
// A simple link <a href="/api/admin/logout"> works without any form or token.
export const GET: APIRoute = async ({ cookies }) => {
  cookies.delete('admin_session', { path: '/' })
  return new Response(null, {
    status: 302,
    headers: { Location: '/admin/login' },
  })
}
