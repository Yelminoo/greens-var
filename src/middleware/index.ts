import { defineMiddleware } from 'astro:middleware'
import { sequence } from 'astro:middleware'
import { subdomainMiddleware } from './subdomain'
import { authMiddleware } from './auth'

export const onRequest = sequence(subdomainMiddleware, authMiddleware)
