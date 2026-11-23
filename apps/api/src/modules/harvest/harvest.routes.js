import { Router } from 'express';
import { HarvestController } from './harvest.controller.js';
import { HarvestService } from './harvest.service.js';
import { createAuthMiddleware, requirePermission } from '../../middleware/auth.js';
import { PERMISSIONS } from '@bakka/shared';

export function createHarvestRouter(prisma) {
  const router = Router();
  const harvestService = new HarvestService(prisma);
  const harvestController = new HarvestController(harvestService);
  const authenticate = createAuthMiddleware(prisma);

  router.use(authenticate);

  router.get('/', requirePermission(PERMISSIONS.HARVEST_VIEW), harvestController.list);
  router.post('/', requirePermission(PERMISSIONS.HARVEST_MANAGE), harvestController.recordHarvest);
  router.post('/movements', requirePermission(PERMISSIONS.PRODUCE_MANAGE), harvestController.recordMovement);
  router.get('/summary', requirePermission(PERMISSIONS.HARVEST_VIEW), harvestController.summary);

  return router;
}
