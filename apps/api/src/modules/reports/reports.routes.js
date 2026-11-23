import { Router } from 'express';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';
import { createAuthMiddleware } from '../../middleware/auth.js';

export function createReportsRouter(prisma) {
  const router = Router();
  const reportsService = new ReportsService(prisma);
  const reportsController = new ReportsController(reportsService);
  const authenticate = createAuthMiddleware(prisma);

  router.use(authenticate);

  router.get('/dashboard', reportsController.dashboard);
  router.get('/crop-production', reportsController.cropProduction);

  return router;
}
