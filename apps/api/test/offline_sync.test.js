import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncService } from '../src/modules/sync/sync.service.js';

describe('Bakka Farm Offline-First Synchronization Engine Tests', () => {
  let mockPrisma;
  let syncService;

  beforeEach(() => {
    mockPrisma = {
      userDevice: {
        findFirst: vi.fn(),
        update: vi.fn()
      },
      syncOperation: {
        findUnique: vi.fn(),
        create: vi.fn(),
        count: vi.fn(),
        findFirst: vi.fn()
      },
      syncConflict: {
        create: vi.fn(),
        count: vi.fn()
      },
      field: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findMany: vi.fn()
      },
      season: { findMany: vi.fn() },
      cropType: { findMany: vi.fn() },
      cropVariety: { findMany: vi.fn() },
      plantingBatch: { findMany: vi.fn() },
      task: { findMany: vi.fn() },
      inventoryItem: { findMany: vi.fn() },
      customer: { findMany: vi.fn() },
      supplier: { findMany: vi.fn() },
      expenseCategory: { findMany: vi.fn() }
    };

    syncService = new SyncService(mockPrisma);
  });

  it('rejects sync push from a revoked device', async () => {
    mockPrisma.userDevice.findFirst.mockResolvedValue({
      id: 'dev-1',
      device_id: 'revoked-dev-99',
      is_revoked: true
    });

    await expect(
      syncService.processPush({
        farmId: 'farm-1',
        userId: 'user-1',
        deviceId: 'revoked-dev-99',
        operations: []
      })
    ).rejects.toThrow(/device has been revoked/i);
  });

  it('enforces idempotency on duplicate sync operations', async () => {
    mockPrisma.userDevice.findFirst.mockResolvedValue({
      id: 'dev-1',
      device_id: 'dev-valid',
      is_revoked: false
    });

    // Operation already processed earlier
    mockPrisma.syncOperation.findUnique.mockResolvedValue({
      id: 'op-record-1',
      operation_id: 'op-uuid-101',
      status: 'SYNCED'
    });

    const results = await syncService.processPush({
      farmId: 'farm-1',
      userId: 'user-1',
      deviceId: 'dev-valid',
      operations: [
        {
          operationId: 'op-uuid-101',
          entityType: 'Field',
          entityId: 'field-1',
          operationType: 'CREATE',
          payload: { name: 'North Plot' }
        }
      ]
    });

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('SYNCED');
    expect(results[0].message).toContain('idempotent replay');
    expect(mockPrisma.field.create).not.toHaveBeenCalled();
  });

  it('strictly blocks offline attempts to alter permissions or user roles', async () => {
    mockPrisma.userDevice.findFirst.mockResolvedValue({
      id: 'dev-1',
      device_id: 'dev-valid',
      is_revoked: false
    });
    mockPrisma.syncOperation.findUnique.mockResolvedValue(null);

    const results = await syncService.processPush({
      farmId: 'farm-1',
      userId: 'user-worker',
      deviceId: 'dev-valid',
      operations: [
        {
          operationId: 'op-privilege-escalation',
          entityType: 'RolePermission',
          entityId: 'rp-1',
          operationType: 'CREATE',
          payload: { role_id: 'worker', permission_id: 'admin' }
        }
      ]
    });

    expect(results[0].status).toBe('FAILED');
    expect(results[0].error).toContain('Security administration is forbidden');
    expect(mockPrisma.syncOperation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'FAILED',
          error_message: expect.stringContaining('Security sensitive operations cannot be performed offline')
        })
      })
    );
  });

  it('detects version conflicts and preserves both copies without silent overwrite', async () => {
    mockPrisma.userDevice.findFirst.mockResolvedValue({
      id: 'dev-1',
      device_id: 'dev-valid',
      is_revoked: false
    });
    mockPrisma.syncOperation.findUnique.mockResolvedValue(null);

    // Existing server record is at version 3
    mockPrisma.field.findUnique.mockResolvedValue({
      id: 'field-10',
      name: 'South Paddock (Server Modified)',
      version: 3
    });

    // Client attempts update based on outdated version 1
    const results = await syncService.processPush({
      farmId: 'farm-1',
      userId: 'user-1',
      deviceId: 'dev-valid',
      operations: [
        {
          operationId: 'op-conflict-99',
          entityType: 'Field',
          entityId: 'field-10',
          operationType: 'UPDATE',
          baseVersion: 1,
          payload: { name: 'South Paddock (Client Offline Edit)' }
        }
      ]
    });

    expect(results[0].status).toBe('CONFLICT');
    expect(mockPrisma.field.update).not.toHaveBeenCalled(); // NEVER overwrite
    expect(mockPrisma.syncConflict.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entity_type: 'Field',
          entity_id: 'field-10',
          resolved: false
        })
      })
    );
  });

  it('pulls server changes by cursor for offline cache synchronization', async () => {
    mockPrisma.field.findMany.mockResolvedValue([{ id: 'f1', name: 'Alfalfa Field' }]);
    mockPrisma.season.findMany.mockResolvedValue([{ id: 's1', name: 'Deyr Season 2026' }]);
    mockPrisma.cropType.findMany.mockResolvedValue([{ id: 'c1', name: 'Maize' }]);
    mockPrisma.cropVariety.findMany.mockResolvedValue([]);
    mockPrisma.plantingBatch.findMany.mockResolvedValue([]);
    mockPrisma.task.findMany.mockResolvedValue([]);
    mockPrisma.inventoryItem.findMany.mockResolvedValue([]);
    mockPrisma.customer.findMany.mockResolvedValue([]);
    mockPrisma.supplier.findMany.mockResolvedValue([]);
    mockPrisma.expenseCategory.findMany.mockResolvedValue([]);

    const pullResult = await syncService.processPull({
      farmId: 'farm-1',
      since: '2026-11-20T00:00:00.000Z'
    });

    expect(pullResult.cursor).toBeDefined();
    expect(pullResult.entities.fields).toHaveLength(1);
    expect(pullResult.entities.seasons).toHaveLength(1);
    expect(pullResult.entities.cropTypes).toHaveLength(1);
  });
});
