import { z } from 'zod';
import { successResponse } from '../../utils/response.js';

const pushSchema = z.object({
  deviceId: z.string().min(4),
  operations: z.array(z.object({
    operationId: z.string().min(4),
    entityType: z.string(),
    entityId: z.string(),
    operationType: z.enum(['CREATE', 'UPDATE', 'DELETE']),
    payload: z.record(z.any()),
    baseVersion: z.number().int().optional()
  }))
});

const pullSchema = z.object({
  since: z.string().optional(),
  limit: z.coerce.number().int().positive().optional()
});

export class SyncController {
  constructor(syncService) {
    this.syncService = syncService;
  }

  push = async (req, res, next) => {
    try {
      const { deviceId, operations } = pushSchema.parse(req.body);
      const results = await this.syncService.processPush({
        farmId: req.user.farmId,
        userId: req.user.id,
        deviceId,
        operations,
        req
      });
      return successResponse(res, { results }, 200, { processedCount: results.length });
    } catch (err) {
      next(err);
    }
  };

  pull = async (req, res, next) => {
    try {
      const query = pullSchema.parse(req.query);
      const result = await this.syncService.processPull({
        farmId: req.user.farmId,
        since: query.since,
        limit: query.limit
      });
      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  };

  status = async (req, res, next) => {
    try {
      const deviceId = req.query.deviceId || 'default-device';
      const status = await this.syncService.getStatus({
        farmId: req.user.farmId,
        deviceId
      });
      return successResponse(res, status);
    } catch (err) {
      next(err);
    }
  };
}
