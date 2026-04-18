import type { MiddlewareHandler } from 'astro'

export const authMiddleware: MiddlewareHandler = async ({ request, locals, cookies, url }, next) => {
  // AUTH DISABLED - Allow all admin access
  locals.isAdmin = true
  return next()

  // // Protect all /admin/* routes except /admin/login
  // if (url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login')) {
  //   // In development mode (including ngrok), bypass authentication for convenience
  //   const isDev = import.meta.env.DEV || locals.isNgrok
  //   if (isDev) {
  //     locals.isAdmin = true
  //     return next()
  //   }

  //   const session = cookies.get('admin_session')
  //   if (!session?.value || session.value !== 'authenticated') {
  //     return new Response(null, {
  //       status: 302,
  //       headers: { Location: '/admin/login' },
  //     })
  //   }
  // }

  // const isDev = import.meta.env.DEV || locals.isNgrok
  // locals.isAdmin = isDev || cookies.get('admin_session')?.value === 'authenticated'
  // return next()
}
