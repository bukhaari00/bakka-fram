import { db, OutboxOperation } from '../db';
import { generateUUID } from '../utils/uuid';
import { getApiBaseUrl } from '../api/config';

const API_BASE = getApiBaseUrl();

export type SyncState = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'PENDING' | 'CONFLICT' | 'REVOKED';

export class SyncEngine {
  private isSyncing = false;
  private listeners: ((state: { status: SyncState; pendingCount: number; conflictCount: number }) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.triggerSync());
      window.addEventListener('offline', () => this.notifyState());
    }
  }

  subscribe(listener: (state: { status: SyncState; pendingCount: number; conflictCount: number }) => void) {
    this.listeners.push(listener);
    this.notifyState();
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  async getCounts() {
    const pendingCount = await db.outbox.where('status').equals('PENDING').count();
    const conflictCount = await db.conflicts.where('resolved').equals(0 as any).count();
    return { pendingCount, conflictCount };
  }

  async notifyState() {
    const { pendingCount, conflictCount } = await this.getCounts();
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    let status: SyncState = isOnline ? 'ONLINE' : 'OFFLINE';
    if (this.isSyncing) status = 'SYNCING';
    else if (conflictCount > 0) status = 'CONFLICT';
    else if (pendingCount > 0 && !isOnline) status = 'PENDING';

    for (const listener of this.listeners) {
      listener({ status, pendingCount, conflictCount });
    }
  }

  /**
   * Save a record and outbox operation in ONE atomic Dexie transaction
   */
  async saveOfflineMutation<T extends { id: string }>(
    entityType: string,
    operationType: 'CREATE' | 'UPDATE' | 'DELETE',
    record: T,
    baseVersion = 1
  ): Promise<void> {
    const table = (db as any)[this.getTableForEntity(entityType)];
    const operationId = generateUUID();

    await db.transaction('rw', [table, db.outbox], async () => {
      if (operationType === 'DELETE') {
        await table.delete(record.id);
      } else {
        await table.put(record);
      }

      await db.outbox.add({
        operationId,
        entityType,
        entityId: record.id,
        operationType,
        payload: record,
        baseVersion,
        status: 'PENDING',
        retryCount: 0,
        createdAt: new Date().toISOString()
      });
    });

    this.notifyState();

    // Trigger sync in background if online
    if (navigator.onLine) {
      this.triggerSync();
    }
  }

  async triggerSync(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) return;
    this.isSyncing = true;
    this.notifyState();

    try {
      const session = await db.auth.get('current_session');
      if (!session || !session.token) {
        this.isSyncing = false;
        this.notifyState();
        return;
      }

      // 1. Process Outbox
      const pendingOps = await db.outbox.where('status').equals('PENDING').limit(50).toArray();

      if (pendingOps.length > 0) {
        const payload = {
          deviceId: session.deviceId,
          operations: pendingOps.map(op => ({
            operationId: op.operationId,
            entityType: op.entityType,
            entityId: op.entityId,
            operationType: op.operationType,
            payload: op.payload,
            baseVersion: op.baseVersion
          }))
        };

        const res = await fetch(`${API_BASE}/sync/push`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.status === 403) {
          // Device revoked!
          await db.auth.update('current_session', { isRevoked: true });
          this.isSyncing = false;
          this.notifyState();
          return;
        }

        if (res.ok) {
          const { data } = await res.json();
          for (const result of data.results) {
            const op = pendingOps.find(p => p.operationId === result.operationId);
            if (!op) continue;

            if (result.status === 'SYNCED') {
              await db.outbox.delete(op.id!);
            } else if (result.status === 'CONFLICT') {
              await db.outbox.update(op.id!, { status: 'CONFLICT', errorMessage: result.error });
              await db.conflicts.put({
                id: crypto.randomUUID(),
                operationId: result.operationId,
                entityType: result.entityType,
                entityId: result.entityId,
                clientData: op.payload,
                serverData: result.serverData,
                resolved: false,
                createdAt: new Date().toISOString()
              });
            } else {
              await db.outbox.update(op.id!, {
                status: 'FAILED',
                errorMessage: result.error,
                retryCount: op.retryCount + 1
              });
            }
          }
        }
      }

      // 2. Pull server changes
      const lastCursor = await db.sync_metadata.get('last_pull_cursor');
      const pullUrl = new URL(`${API_BASE}/sync/pull`);
      if (lastCursor?.value) {
        pullUrl.searchParams.set('since', lastCursor.value);
      }

      const pullRes = await fetch(pullUrl.toString(), {
        headers: { 'Authorization': `Bearer ${session.token}` }
      });

      if (pullRes.ok) {
        const { data } = await pullRes.json();
        // Update local Dexie stores
        for (const [key, list] of Object.entries(data.entities || {})) {
          const tableName = this.getTableForEntity(key);
          const table = (db as any)[tableName];
          if (table && Array.isArray(list)) {
            for (const item of list) {
              await table.put(item);
            }
          }
        }

        if (data.cursor) {
          await db.sync_metadata.put({ key: 'last_pull_cursor', value: data.cursor });
        }
      }
    } catch (err) {
      console.warn('[SyncEngine] Sync iteration encountered error:', err);
    } finally {
      this.isSyncing = false;
      this.notifyState();
    }
  }

  private getTableForEntity(entity: string): string {
    const map: Record<string, string> = {
      Field: 'fields',
      fields: 'fields',
      Season: 'seasons',
      seasons: 'seasons',
      CropType: 'crop_types',
      cropTypes: 'crop_types',
      CropVariety: 'crop_varieties',
      cropVarieties: 'crop_varieties',
      PlantingBatch: 'planting_batches',
      plantingBatches: 'planting_batches',
      CropObservation: 'crop_observations',
      Task: 'tasks',
      tasks: 'tasks',
      IrrigationEvent: 'irrigation_events',
      InventoryItem: 'inventory_items',
      inventoryItems: 'inventory_items',
      StockReceipt: 'stock_receipts',
      StockIssue: 'stock_issues',
      StockAdjustment: 'stock_adjustments',
      HarvestRecord: 'harvest_records',
      ProduceLot: 'produce_lots',
      Customer: 'customers',
      customers: 'customers',
      Sale: 'sales',
      CustomerPayment: 'customer_payments',
      Supplier: 'suppliers',
      suppliers: 'suppliers',
      Purchase: 'purchases',
      SupplierPayment: 'supplier_payments',
      ExpenseCategory: 'expense_categories',
      expenseCategories: 'expense_categories',
      Expense: 'expenses'
    };
    return map[entity] || entity.toLowerCase();
  }
}

export const syncEngine = new SyncEngine();
