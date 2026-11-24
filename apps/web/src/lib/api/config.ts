/**
 * Resolves the base URL for API requests across environments:
 * 1. Server-side runtime on Vercel / Railway: uses injected `process.env.API_URL`
 * 2. Explicit environment variable: `NEXT_PUBLIC_API_URL` or `VITE_API_URL` (e.g. pointing to Railway backend)
 * 3. Browser runtime: relative path `/api` (routed through Vercel rewrites or reverse proxy)
 * 4. Local development fallback: `http://localhost:4000/api`
 */
export function getApiBaseUrl(): string {
  // Check explicit public API URL (supports Next.js and Vite env standards)
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env as any).VITE_API_URL;
  if (publicApiUrl) {
    const trimmed = publicApiUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  // Server-side internal service binding (e.g. Vercel multi-service or Railway internal networking)
  if (typeof window === 'undefined' && process.env.API_URL) {
    const internalUrl = process.env.API_URL.trim().replace(/\/+$/, '');
    return internalUrl.endsWith('/api') ? internalUrl : `${internalUrl}/api`;
  }

  // In browser, use same-domain relative API path if deployed
  if (typeof window !== 'undefined') {
    return '/api';
  }

  // Local development default fallback
  return 'http://localhost:4000/api';
}
