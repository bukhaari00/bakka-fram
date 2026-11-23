import { Router } from 'express';
import { FarmController } from './farm.controller.js';
import { FarmService } from './farm.service.js';
import { createAuthMiddleware, requirePermission } from '../../middleware/auth.js';
import { PERMISSIONS } from '@bakka/shared';

export function createFarmRouter(prisma) {
  const router = Router();
  const farmService = new FarmService(prisma);
  const farmController = new FarmController(farmService);
  const authenticate = createAuthMiddleware(prisma);

  router.use(authenticate);

  // Profile & Setup
  router.get('/profile', requirePermission(PERMISSIONS.FARM_VIEW), farmController.getProfile);

  // Fields
  router.get('/fields', requirePermission(PERMISSIONS.FIELDS_VIEW), farmController.listFields);
  router.post('/fields', requirePermission(PERMISSIONS.FIELDS_MANAGE), farmController.createField);

  // Seasons
  router.get('/seasons', requirePermission(PERMISSIONS.SEASONS_VIEW), farmController.listSeasons);
  router.post('/seasons', requirePermission(PERMISSIONS.SEASONS_MANAGE), farmController.createSeason);

  // Crops
  router.get('/crops', requirePermission(PERMISSIONS.CROPS_VIEW), farmController.listCrops);
  router.post('/crops', requirePermission(PERMISSIONS.CROPS_MANAGE), farmController.createCropType);
  router.post('/crops/:cropTypeId/varieties', requirePermission(PERMISSIONS.CROPS_MANAGE), farmController.createVariety);

  // Planting Batches
  router.get('/planting-batches', requirePermission(PERMISSIONS.PLANTING_VIEW), farmController.listPlantingBatches);
  router.post('/planting-batches', requirePermission(PERMISSIONS.PLANTING_MANAGE), farmController.createPlantingBatch);

  // Observations
  router.post('/observations', requirePermission(PERMISSIONS.OBSERVATIONS_CREATE), farmController.createObservation);

  return router;
}
