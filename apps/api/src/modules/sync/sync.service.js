import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../middleware/errorHandler.js';
import { logAudit } from '../../utils/audit.js';

/**
 * Synchronization Service
 * Handles idempotent push, pull by cursor, conflict detection, and status.
 */
export class SyncService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Push an array of local outbox operations
   * Bounded batch, evaluated in order, idempotent by operationId
   */
  async processPush({ farmId, userId, deviceId, operations, req }) {
    // 1. Verify device status
    const device = await this.prisma.userDevice.findFirst({
      where: { device_id: deviceId, user_id: userId }
    });

    if (device && device.is_revoked) {
      throw new AppError('This device has been revoked. Sync rejected. Please contact administrator.', 403);
    }

    const results = [];

    for (const op of operations) {
      const { operationId, entityType, entityId, operationType, payload, baseVersion } = op;

      // Check Idempotency: Has this operation already been processed?
      const existingOp = await this.prisma.syncOperation.findUnique({
        where: { operation_id: operationId }
      });

      if (existingOp) {
        results.push({
          operationId,
          entityType,
          entityId,
          status: existingOp.status,
          message: 'Operation already processed (idempotent replay).'
        });
        continue;
      }

      // Check for security violations: Disallow offline permission or sensitive user admin changes
      if (['Role', 'Permission', 'RolePermission', 'User'].includes(entityType)) {
        await this.prisma.syncOperation.create({
          data: {
            id: uuidv4(),
            farm_id: farmId,
            device_id: deviceId,
            operation_id: operationId,
            entity_type: entityType,
            entity_id: entityId,
            operation_type: operationType,
            payload_json: JSON.stringify(payload),
            base_version: baseVersion || 1,
            status: 'FAILED',
            error_message: 'Forbidden: Security sensitive operations cannot be performed offline.'
          }
        });

        results.push({
          operationId,
          entityType,
          entityId,
          status: 'FAILED',
          error: 'Security administration is forbidden in offline sync.'
        });
        continue;
      }

      try {
        // Execute operation transactionally with version & conflict checks
        const opResult = await this.applyOperation({
          farmId,
          userId,
          deviceId,
          operationId,
          entityType,
          entityId,
          operationType,
          payload,
          baseVersion
        });

        results.push(opResult);
      } catch (err) {
        console.error(`[SyncPushError] Op ${operationId} failed:`, err);
        results.push({
          operationId,
          entityType,
          entityId,
          status: 'FAILED',
          error: err.message
        });
      }
    }

    // Update device last_sync_at
    if (device) {
      try {
        await this.prisma.userDevice.update({
          where: { id: device.id },
          data: { last_sync_at: new Date() }
        });
      } catch (e) {
        // Non-critical device timestamp update error
      }
    }

    return results;
  }

  /**
   * Apply a single mutation to the appropriate table
   */
  async applyOperation({ farmId, userId, deviceId, operationId, entityType, entityId, operationType, payload, baseVersion }) {
    const modelDelegate = this.getModelDelegate(entityType);
    if (!modelDelegate) {
      throw new AppError(`Unsupported entity type: ${entityType}`, 400);
    }

    if (operationType === 'CREATE') {
      // Check if entity already exists
      const existing = await modelDelegate.findUnique({
        where: { id: entityId }
      }).catch(() => null);

      if (existing) {
        return {
          operationId,
          entityType,
          entityId,
          status: 'SYNCED',
          message: 'Entity already exists.'
        };
      }

      const created = await modelDelegate.create({
        data: {
          ...payload,
          id: entityId,
          farm_id: farmId,
          version: 1
        }
      });

      await this.prisma.syncOperation.create({
        data: {
          id: uuidv4(),
          farm_id: farmId,
          device_id: deviceId,
          operation_id: operationId,
          entity_type: entityType,
          entity_id: entityId,
          operation_type: operationType,
          payload_json: JSON.stringify(payload),
          base_version: 1,
          status: 'SYNCED',
          synced_at: new Date()
        }
      });

      return {
        operationId,
        entityType,
        entityId,
        status: 'SYNCED',
        version: 1
      };
    }

    if (operationType === 'UPDATE') {
      const existing = await modelDelegate.findUnique({
        where: { id: entityId }
      });

      if (!existing) {
        throw new AppError(`Entity ${entityId} not found for update`, 404);
      }

      // Concurrency check: If server version != baseVersion, conflict detected!
      if (existing.version && baseVersion && existing.version !== baseVersion) {
        // Record conflict; DO NOT overwrite server data silently
        await this.prisma.syncConflict.create({
          data: {
            id: uuidv4(),
            farm_id: farmId,
            device_id: deviceId,
            operation_id: operationId,
            entity_type: entityType,
            entity_id: entityId,
            client_data_json: JSON.stringify(payload),
            server_data_json: JSON.stringify(existing),
            resolved: false
          }
        });

        await this.prisma.syncOperation.create({
          data: {
            id: uuidv4(),
            farm_id: farmId,
            device_id: deviceId,
            operation_id: operationId,
            entity_type: entityType,
            entity_id: entityId,
            operation_type: operationType,
            payload_json: JSON.stringify(payload),
            base_version: baseVersion,
            status: 'CONFLICT',
            error_message: `Version conflict: client base ${baseVersion} != server ${existing.version}`
          }
        });

        return {
          operationId,
          entityType,
          entityId,
          status: 'CONFLICT',
          serverData: existing,
          error: 'Version mismatch detected. Conflict flagged for review.'
        };
      }

      // Safe update
      const updated = await modelDelegate.update({
        where: { id: entityId },
        data: {
          ...payload,
          version: { increment: 1 }
        }
      });

      await this.prisma.syncOperation.create({
        data: {
          id: uuidv4(),
          farm_id: farmId,
          device_id: deviceId,
          operation_id: operationId,
          entity_type: entityType,
          entity_id: entityId,
          operation_type: operationType,
          payload_json: JSON.stringify(payload),
          base_version: baseVersion || 1,
          status: 'SYNCED',
          synced_at: new Date()
        }
      });

      return {
        operationId,
        entityType,
        entityId,
        status: 'SYNCED',
        version: updated.version
      };
    }

    if (operationType === 'DELETE') {
      await modelDelegate.delete({
        where: { id: entityId }
      }).catch(() => {});

      await this.prisma.syncOperation.create({
        data: {
          id: uuidv4(),
          farm_id: farmId,
          device_id: deviceId,
          operation_id: operationId,
          entity_type: entityType,
          entity_id: entityId,
          operation_type: operationType,
          payload_json: JSON.stringify(payload || {}),
          status: 'SYNCED',
          synced_at: new Date()
        }
      });

      return {
        operationId,
        entityType,
        entityId,
        status: 'SYNCED'
      };
    }

    throw new AppError(`Unknown operation type: ${operationType}`, 400);
  }

  /**
   * Pull server updates since cursor timestamp
   */
  async processPull({ farmId, since, limit = 100 }) {
    const sinceDate = since ? new Date(since) : new Date(0);

    const [
      fields,
      seasons,
      cropTypes,
      cropVarieties,
      plantingBatches,
      tasks,
      inventoryItems,
      customers,
      suppliers,
      expenseCategories
    ] = await Promise.all([
      this.prisma.field.findMany({
        where: { farm_id: farmId, updated_at: { gt: sinceDate } },
        take: limit
      }),
      this.prisma.season.findMany({
        where: { farm_id: farmId, updated_at: { gt: sinceDate } },
        take: limit
      }),
      this.prisma.cropType.findMany({
        where: { farm_id: farmId, updated_at: { gt: sinceDate } },
        include: { varieties: true },
        take: limit
      }),
      this.prisma.cropVariety.findMany({
        where: { crop_type: { farm_id: farmId }, updated_at: { gt: sinceDate } },
        take: limit
      }),
      this.prisma.plantingBatch.findMany({
        where: { farm_id: farmId, updated_at: { gt: sinceDate } },
        take: limit
      }),
      this.prisma.task.findMany({
        where: { farm_id: farmId, updated_at: { gt: sinceDate } },
        include: { assignments: true },
        take: limit
      }),
      this.prisma.inventoryItem.findMany({
        where: { farm_id: farmId, updated_at: { gt: sinceDate } },
        take: limit
      }),
      this.prisma.customer.findMany({
        where: { farm_id: farmId, updated_at: { gt: sinceDate } },
        take: limit
      }),
      this.prisma.supplier.findMany({
        where: { farm_id: farmId, updated_at: { gt: sinceDate } },
        take: limit
      }),
      this.prisma.expenseCategory.findMany({
        where: { farm_id: farmId, updated_at: { gt: sinceDate } },
        take: limit
      })
    ]);

    return {
      cursor: new Date().toISOString(),
      entities: {
        fields,
        seasons,
        cropTypes,
        cropVarieties,
        plantingBatches,
        tasks,
        inventoryItems,
        customers,
        suppliers,
        expenseCategories
      }
    };
  }

  /**
   * Get sync status & unresolved conflicts for farm & device
   */
  async getStatus({ farmId, deviceId }) {
    const [conflictsCount, pendingOpsCount, lastSync] = await Promise.all([
      this.prisma.syncConflict.count({
        where: { farm_id: farmId, resolved: false }
      }),
      this.prisma.syncOperation.count({
        where: { farm_id: farmId, device_id: deviceId, status: 'PENDING' }
      }),
      this.prisma.syncOperation.findFirst({
        where: { farm_id: farmId, device_id: deviceId, status: 'SYNCED' },
        orderBy: { synced_at: 'desc' }
      })
    ]);

    return {
      online: true,
      deviceId,
      conflictsCount,
      pendingOpsCount,
      lastSyncAt: lastSync?.synced_at || null,
      serverTime: new Date().toISOString()
    };
  }

  getModelDelegate(entityType) {
    const map = {
      Field: this.prisma.field,
      Season: this.prisma.season,
      CropType: this.prisma.cropType,
      CropVariety: this.prisma.cropVariety,
      PlantingBatch: this.prisma.plantingBatch,
      CropObservation: this.prisma.cropObservation,
      Task: this.prisma.task,
      TaskAssignment: this.prisma.taskAssignment,
      TaskActivityLog: this.prisma.taskActivityLog,
      IrrigationEvent: this.prisma.irrigationEvent,
      InventoryItem: this.prisma.inventoryItem,
      StockReceipt: this.prisma.stockReceipt,
      StockIssue: this.prisma.stockIssue,
      StockAdjustment: this.prisma.stockAdjustment,
      HarvestRecord: this.prisma.harvestRecord,
      ProduceLot: this.prisma.produceLot,
      Customer: this.prisma.customer,
      Sale: this.prisma.sale,
      CustomerPayment: this.prisma.customerPayment,
      Supplier: this.prisma.supplier,
      Purchase: this.prisma.purchase,
      SupplierPayment: this.prisma.supplierPayment,
      ExpenseCategory: this.prisma.expenseCategory,
      Expense: this.prisma.expense
    };
    return map[entityType] || null;
  }
}
