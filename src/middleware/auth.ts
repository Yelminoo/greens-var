import type { MiddlewareHandler } from 'astro'

// Routes that never need authentication
const PUBLIC_ADMIN_PATHS = new Set([
  '/admin/login',
  '/api/admin/login',
  '/api/admin/logout',
])

export const authMiddleware: MiddlewareHandler = async ({ url, locals, cookies }, next) => {
  const isAdminRoute = url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')
  if (!isAdminRoute) return next()

  // Always allow login / logout through
  if (PUBLIC_ADMIN_PATHS.has(url.pathname)) return next()

  // In local dev or ngrok preview — bypass auth for convenience
  if (import.meta.env.DEV || locals.isNgrok) {
    locals.isAdmin = true
    return next()
  }

  // Production — check session cookie
  const session = cookies.get('admin_session')
  if (session?.value !== 'authenticated') {
    // API routes → 401 JSON so fetch() callers get a proper error
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    // Page routes → redirect to login
    return new Response(null, {
      status: 302,
      headers: { Location: '/admin/login' },
    })
  }

  locals.isAdmin = true
  return next()
}
