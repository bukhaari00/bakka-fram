import { db } from '../db';
import { syncEngine } from '../sync/syncEngine';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Offline-Aware API Client
 * Transparently falls back to Dexie when offline and routes mutations through the sync engine
 */
export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T; fromOfflineCache?: boolean }> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const session = typeof window !== 'undefined' ? await db.auth.get('current_session') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (session?.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }

  if (isOnline) {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.error?.message || `API error (${response.status})`);
      }

      const json = await response.json();
      return { data: json.data || json };
    } catch (networkError: any) {
      // If network fails (e.g. server down or airplane mode mid-flight)
      console.warn('[API] Request failed online, attempting offline fallback:', networkError.message);
    }
  }

  // Handle Offline Mutation or Query
  return handleOfflineRequest<T>(path, options);
}

async function handleOfflineRequest<T>(path: string, options: RequestInit): Promise<{ data: T; fromOfflineCache: boolean }> {
  const method = (options.method || 'GET').toUpperCase();

  // If reading data offline: query IndexedDB
  if (method === 'GET') {
    const entity = path.split('/')[1]; // e.g. /fields -> fields
    const table = (db as any)[entity];
    if (table) {
      const localData = await table.toArray();
      return { data: localData as unknown as T, fromOfflineCache: true };
    }
    return { data: [] as unknown as T, fromOfflineCache: true };
  }

  // If writing data offline: save to IndexedDB and queue outbox
  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    const entity = path.split('/')[1];
    const body = options.body ? JSON.parse(options.body as string) : {};
    const recordId = body.id || crypto.randomUUID();
    const record = { ...body, id: recordId };

    const opType = method === 'POST' ? 'CREATE' : method === 'PUT' ? 'UPDATE' : 'DELETE';
    await syncEngine.saveOfflineMutation(entity, opType, record);

    return { data: record as unknown as T, fromOfflineCache: true };
  }

  throw new Error('Offline operation not supported for this method');
}
