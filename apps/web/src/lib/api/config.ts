/**
 * Resolves the base URL for API requests across environments:
 * 1. Server-side runtime on Vercel: uses injected service binding variable `process.env.API_URL`
 * 2. Explicit environment variable: `NEXT_PUBLIC_API_URL`
 * 3. Browser runtime: relative path `/api` (routed through top-level Vercel rewrites)
 * 4. Local development fallback: `http://localhost:4000/api`
 */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined' && process.env.API_URL) {
    return `${process.env.API_URL}/api`;
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return 'http://localhost:4000/api';
}
