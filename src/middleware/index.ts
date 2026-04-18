import { defineMiddleware } from 'astro:middleware'
import { sequence } from 'astro:middleware'
import { subdomainMiddleware } from './subdomain'
// import { authMiddleware } from './auth'  // DISABLED

// export const onRequest = sequence(subdomainMiddleware, authMiddleware)
export const onRequest = subdomainMiddleware  // Auth disabled
