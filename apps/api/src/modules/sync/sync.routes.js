import { Router } from 'express';
import { SyncController } from './sync.controller.js';
import { SyncService } from './sync.service.js';
import { createAuthMiddleware, requirePermission } from '../../middleware/auth.js';
import { PERMISSIONS } from '@bakka/shared';

export function createSyncRouter(prisma) {
  const router = Router();
  const syncService = new SyncService(prisma);
  const syncController = new SyncController(syncService);
  const authenticate = createAuthMiddleware(prisma);

  router.use(authenticate);

  router.post('/push', requirePermission(PERMISSIONS.SYNC_PUSH), syncController.push);
  router.get('/pull', requirePermission(PERMISSIONS.SYNC_PULL), syncController.pull);
  router.get('/status', syncController.status);

  return router;
}
