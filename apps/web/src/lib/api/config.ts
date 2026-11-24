/**
 * Resolves the base URL for API requests across environments:
 * 1. Explicit environment variable: `NEXT_PUBLIC_API_URL` or `VITE_API_URL` (e.g. Railway or remote backend)
 * 2. Server-side runtime: uses `process.env.API_URL` or fallback to `http://localhost:4000/api`
 * 3. Browser runtime in local development (localhost / 127.0.0.1): uses `http://localhost:4000/api`
 * 4. Browser runtime in production: relative path `/api` (routed through Vercel rewrites)
 */
export function getApiBaseUrl(): string {
  // 1. Explicit public API URL takes highest priority
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env as any).VITE_API_URL;
  if (publicApiUrl) {
    const trimmed = publicApiUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  // 2. Server-side runtime (e.g. Vercel internal service binding or Railway internal networking)
  if (typeof window === 'undefined') {
    if (process.env.API_URL) {
      const internalUrl = process.env.API_URL.trim().replace(/\/+$/, '');
      return internalUrl.endsWith('/api') ? internalUrl : `${internalUrl}/api`;
    }
    return 'http://localhost:4000/api';
  }

  // 3. Browser runtime in local development: talk directly to Express on port 4000
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:4000/api';
  }

  // 4. Production browser runtime (e.g. Vercel domain with rewrites):
  return '/api';
}
