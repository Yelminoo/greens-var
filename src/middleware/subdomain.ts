import type { MiddlewareHandler } from 'astro'

const SUBDOMAIN_MAP: Record<string, string> = {
  fruithai:  'fruithai',
  variegata: 'variegata',
}

// ─── Subdomain routing ────────────────────────────────────────────────────────
// Enabled in production when you have greensvar.com + subdomains.
// While hosting without a custom domain, brands are accessed via path:
//   /fruithai/    →  FruThai brand
//   /variegata/   →  Variegata brand
//   /admin        →  Admin panel
//
// To re-enable subdomain routing: set SUBDOMAIN_ROUTING=true in .env
// ─────────────────────────────────────────────────────────────────────────────
const SUBDOMAIN_ROUTING = process.env['SUBDOMAIN_ROUTING'] === 'true'

const SKIP_REWRITE = ['/api', '/admin', '/_astro', '/images', '/favicon', '/services', '/contact', '/about', '/products', '/quote']

function isNgrokHost(host: string): boolean {
  return host.includes('ngrok-free.app') || host.includes('ngrok.io')
}

function detectBrand(host: string, url: URL): { brand: string; isNgrok: boolean } {
  const isNgrok = isNgrokHost(host)

  // 1. Known subdomain — only when SUBDOMAIN_ROUTING is enabled
  if (SUBDOMAIN_ROUTING) {
    const subdomain = host.split('.')[0]
    if (SUBDOMAIN_MAP[subdomain]) {
      return { brand: SUBDOMAIN_MAP[subdomain], isNgrok: false }
    }
  }

  // 2. ?_brand= query param (ngrok switcher bar)
  const paramBrand = url.searchParams.get('_brand')
  if (paramBrand && SUBDOMAIN_MAP[paramBrand]) {
    return { brand: paramBrand, isNgrok }
  }

  // 3. Path-based — works for Railway, ngrok, and local dev
  //    /fruithai/* → fruithai   /variegata/* → variegata
  const pathBrand = url.pathname.split('/')[1]
  if (SUBDOMAIN_MAP[pathBrand]) {
    return { brand: pathBrand, isNgrok }
  }

  return { brand: 'main', isNgrok }
}

export const subdomainMiddleware: MiddlewareHandler = async (context, next) => {
  const { request, locals, url } = context
  const host = request.headers.get('x-forwarded-host')
           ?? request.headers.get('host')
           ?? ''

  const { brand, isNgrok } = detectBrand(host, url)

  locals.brand   = brand as 'main' | 'fruithai' | 'variegata'
  locals.host    = host
  locals.isNgrok = isNgrok
  locals.isAdmin = true  // AUTH DISABLED

  // Subdomain rewrite: only active when SUBDOMAIN_ROUTING=true
  // e.g. fruithai.greensvar.com/products → rewrites internally to /fruithai/products
  if (SUBDOMAIN_ROUTING && brand !== 'main' && !isNgrok) {
    const shouldSkip = SKIP_REWRITE.some(p => url.pathname.startsWith(p))
                    || url.pathname.startsWith(`/${brand}`)
    if (!shouldSkip) {
      const newPath = `/${brand}${url.pathname === '/' ? '/' : url.pathname}${url.search}`
      return context.rewrite(newPath)
    }
  }

  return next()
}
